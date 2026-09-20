import {
  Concept,
  Question,
  LessonActivity,
  LessonActivityType,
  LessonSessionState,
  FailureDiagnosisType,
  MistakeClassification,
} from '../../src/types.ts';
import { storage } from '../storage.ts';
import { MasteryService } from './masteryService.ts';
import { MistakeService } from './mistakeService.ts';
import { aiService } from '../ai/aiService.ts';
import {
  shuffleQuestionOptions,
  generateSubjectAwareFallbackQuestion,
  isCalculationSubject,
} from './questionUtils.ts';

const masteryService = new MasteryService();
const mistakeService = new MistakeService();

interface ConceptActivityPool {
  conceptId: string;
  explanation: LessonActivity;
  workedExample?: LessonActivity;
  recallQuestion?: LessonActivity;
  primaryApplication: LessonActivity;
  followUpApplication: LessonActivity;
  misconceptionCheck?: LessonActivity;
  remediationActivities: Record<string, LessonActivity>;
  guidedPractice?: LessonActivity;
}

export class FlexibleLessonEngine {
  private sessions: Map<string, LessonSessionState> = new Map();
  private activityPoolCache: Map<string, ConceptActivityPool> = new Map();

  /**
   * Starts an evidence-driven adaptive lesson session.
   * AI understands the source notes and teaches the concept.
   * Deterministic code coordinates session state and evidence accumulation.
   */
  public async startSession(
    conceptId: string,
    sessionId?: string,
    options?: { forceNewStudent?: boolean }
  ): Promise<LessonSessionState> {
    const concept = storage.getConcept(conceptId);
    if (!concept) {
      throw new Error(`Concept with ID ${conceptId} not found.`);
    }

    const topic = storage.getTopics().find((t) => t.id === concept.topicId);
    const subject = storage.getSubject(concept.subjectId);
    const mastery = storage.getMastery(conceptId);

    const sId = sessionId || `session-${conceptId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const pool = await this.getOrCreateActivityPool(concept);

    // Initial activity selection based on student evidence:
    // If student has established prior mastery (> 60) and prior attempts, allow jumping straight to retrieval/application
    let initialActivity: LessonActivity = pool.explanation;
    if (!options?.forceNewStudent && mastery && mastery.score >= 60 && mastery.totalAttempts > 0) {
      initialActivity = pool.recallQuestion || pool.primaryApplication;
    }

    const session: LessonSessionState = {
      sessionId: sId,
      conceptId: concept.id,
      conceptName: concept.name,
      subtopicTitle: concept.subtopicTitle,
      topicTitle: topic?.title || 'Course Topic',
      subjectName: subject?.name || 'Academic Subject',
      sourceDocName: concept.sourceDocument || 'School Syllabus',
      sourcePage: concept.sourcePage,
      currentActivity: initialActivity,
      activityIndex: 0,
      history: [],
      evidence: {
        explanationDelivered: false,
        recallDemonstrated: false,
        applicationDemonstrated: false,
        consecutiveCorrect: 0,
        totalAttempts: 0,
        totalMistakes: 0,
        detectedMisconceptions: [],
      },
      isComplete: false,
      masteryScore: mastery?.score || 0,
    };

    this.sessions.set(sId, session);
    return session;
  }

  public getSession(sessionId: string): LessonSessionState | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Processes student input for the current activity and adaptively
   * determines the next step based on real evidence.
   */
  public async processResponse(
    sessionId: string,
    studentAnswer?: string
  ): Promise<{
    session: LessonSessionState;
    feedback?: {
      isCorrect: boolean;
      feedbackText: string;
      correctAnswer?: string;
      explanation?: string;
      diagnosisType?: FailureDiagnosisType;
      remediationSummary?: string;
    };
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    const currentAct = session.currentActivity;
    const concept = storage.getConcept(session.conceptId)!;
    const pool = await this.getOrCreateActivityPool(concept);

    // 1. NON-QUESTION ACTIVITIES (EXPLAIN, REMEDIATION, WORKED_EXAMPLE, SUMMARY)
    if (!currentAct.question) {
      if (currentAct.type === 'EXPLAIN') {
        session.evidence.explanationDelivered = true;
      }

      session.history.push({
        activityId: currentAct.id,
        activityType: currentAct.type,
        title: currentAct.title,
        completedAt: new Date().toISOString(),
      });

      if (currentAct.type === 'SUMMARY') {
        session.isComplete = true;
        return { session };
      }

      if (currentAct.type === 'REMEDIATION') {
        // After reading remediation, test if student can now answer a targeted check or follow-up
        const nextAct = pool.misconceptionCheck || pool.followUpApplication || pool.primaryApplication;
        session.currentActivity = nextAct;
        session.activityIndex += 1;
        return { session };
      }

      // After explanation, route directly to practice / application challenge
      const nextAct = pool.primaryApplication;
      session.currentActivity = nextAct;
      session.activityIndex += 1;
      return { session };
    }

    // 2. QUESTION-BASED ACTIVITIES (APPLICATION, RECALL, MISCONCEPTION_CHECK, GUIDED_PRACTICE)
    const q = currentAct.question;
    const cleanStudent = (studentAnswer || '').trim();

    // Check answer correctness
    let isCorrect = this.evaluateAnswer(q, cleanStudent);
    let openFeedback: string | undefined;
    let failureType: FailureDiagnosisType = 'CARELESS_ERROR';

    // For open-ended questions, use AI evaluation
    if (q.type === 'OPEN_EXPLANATION') {
      try {
        const evalResult = await aiService.evaluateOpenAnswer(q, cleanStudent, concept);
        isCorrect = evalResult.isCorrect;
        openFeedback = evalResult.feedback;
        if (evalResult.mistakeType) {
          failureType = evalResult.mistakeType as FailureDiagnosisType;
        }
      } catch {
        isCorrect = this.evaluateAnswer(q, cleanStudent);
      }
    }

    session.evidence.totalAttempts += 1;
    let feedbackText = '';
    let remediationSummary = '';

    if (isCorrect) {
      session.evidence.consecutiveCorrect += 1;
      if (q.category === 'RECALL' || currentAct.type === 'RECALL') {
        session.evidence.recallDemonstrated = true;
      }
      if (q.category === 'APPLICATION' || q.category === 'CALCULATION' || currentAct.type === 'APPLICATION') {
        session.evidence.applicationDemonstrated = true;
      }

      feedbackText = openFeedback || `Correct! ${q.explanation}`;

      // Deterministic mastery update using configurable evidence delta
      const updatedMastery = masteryService.updateMasteryOnAttempt(
        concept.id,
        true,
        q.category,
        1.0,
        { questionType: q.category }
      );
      session.masteryScore = updatedMastery.score;

      // Record successful attempt in database
      storage.recordAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        questionId: q.id,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        studentAnswer: cleanStudent,
        isCorrect: true,
        score: 1.0,
        feedback: feedbackText,
        timestamp: new Date().toISOString(),
      });
    } else {
      // INCORRECT ATTEMPT
      session.evidence.consecutiveCorrect = 0;
      session.evidence.totalMistakes += 1;

      // Determine failure diagnosis
      failureType = this.diagnoseFailure(q, cleanStudent, currentAct);
      session.evidence.activeDiagnosis = failureType;

      if (failureType === 'MISCONCEPTION') {
        session.evidence.detectedMisconceptions.push(
          currentAct.targetMisconception || 'Misapplied rule or concept relation'
        );
      }

      feedbackText = openFeedback || this.generateDiagnosticFeedback(q, cleanStudent, failureType, concept);
      remediationSummary = q.explanation;

      // Deterministic mastery penalty based on failure type
      const updatedMastery = masteryService.updateMasteryOnAttempt(
        concept.id,
        false,
        q.category,
        0.0,
        { failureType, questionType: q.category }
      );
      session.masteryScore = updatedMastery.score;

      // Record in Mistake Bank
      await mistakeService.recordMistake(
        q,
        concept,
        cleanStudent,
        failureType as MistakeClassification,
        feedbackText,
        q.explanation
      );

      // Record attempt in database
      storage.recordAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        questionId: q.id,
        conceptId: concept.id,
        subjectId: concept.subjectId,
        studentAnswer: cleanStudent,
        isCorrect: false,
        score: 0.0,
        feedback: feedbackText,
        timestamp: new Date().toISOString(),
      });
    }

    session.history.push({
      activityId: currentAct.id,
      activityType: currentAct.type,
      title: currentAct.title,
      studentAnswer: cleanStudent,
      isCorrect,
      score: isCorrect ? 1.0 : 0.0,
      feedback: feedbackText,
      diagnosisType: isCorrect ? undefined : failureType,
      completedAt: new Date().toISOString(),
    });

    // 3. ADAPTIVE LOOP: SELECT NEXT ACTIVITY BASED ON ACCUMULATED EVIDENCE
    const nextActivity = this.determineNextActivity(session, pool, isCorrect, failureType);
    session.currentActivity = nextActivity;
    session.activityIndex += 1;

    if (nextActivity.type === 'SUMMARY') {
      session.isComplete = true;
      session.summaryMessage = this.generateSummaryMessage(session);
    }

    return {
      session,
      feedback: {
        isCorrect,
        feedbackText,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        diagnosisType: isCorrect ? undefined : failureType,
        remediationSummary,
      },
    };
  }

  /**
   * Deterministic decision logic: Selects next activity based on student evidence.
   * Satisfies the Three-Student Benchmark.
   */
  private determineNextActivity(
    session: LessonSessionState,
    pool: ConceptActivityPool,
    lastCorrect: boolean,
    lastDiagnosis?: FailureDiagnosisType
  ): LessonActivity {
    const { evidence } = session;

    // --- CASE 1: STUDENT GOT THE QUESTION RIGHT ---
    if (lastCorrect) {
      // If student was on a MISCONCEPTION_CHECK, advance to guided practice or follow-up
      if (session.currentActivity.type === 'MISCONCEPTION_CHECK') {
        if (pool.guidedPractice) return pool.guidedPractice;
        return pool.followUpApplication;
      }

      // If student completed GUIDED_PRACTICE, advance to application confirmation
      if (session.currentActivity.type === 'GUIDED_PRACTICE') {
        if (evidence.consecutiveCorrect >= 2) {
          return this.createSummaryActivity(session, 'Remediation and Guided Practice Successfully Completed');
        }
        return pool.followUpApplication;
      }

      // Evidence check:
      if (evidence.explanationDelivered && evidence.applicationDemonstrated) {
        // STUDENT A BENCHMARK: Fast learner with 0 mistakes
        // Provide follow-up verification or complete if 2 consecutive correct answers
        if (evidence.totalMistakes === 0) {
          if (evidence.consecutiveCorrect >= 2 || session.history.length >= 3) {
            return this.createSummaryActivity(session, 'Direct Mastery Demonstration (Fast Track)');
          }
          // Give one more slightly challenging application
          return pool.followUpApplication;
        }

        // STUDENT B BENCHMARK: 1 mistake, remediated, then answered correctly
        if (evidence.totalMistakes === 1 && evidence.consecutiveCorrect >= 1) {
          return this.createSummaryActivity(session, 'Competence Verified After Remediation');
        }

        // STUDENT C BENCHMARK: Multiple mistakes, but misconception resolved & application confirmed
        if (evidence.consecutiveCorrect >= 2 || (evidence.totalMistakes >= 2 && evidence.applicationDemonstrated)) {
          return this.createSummaryActivity(session, 'Remediation and Practice Successfully Completed');
        }
      }

      if (!evidence.applicationDemonstrated) {
        return pool.primaryApplication;
      }

      return this.createSummaryActivity(session, 'Readiness Criteria Met');
    }

    // --- CASE 2: STUDENT GOT THE QUESTION WRONG ---
    // Rule: Never repeat the identical question or simply move to next slide.
    // Branch based on failure diagnosis.

    // A. Misconception detected -> Targeted Remediation
    if (lastDiagnosis === 'MISCONCEPTION') {
      const hasTriedMisconceptionCheck = session.history.some(
        (h) => h.activityType === 'MISCONCEPTION_CHECK'
      );
      if (pool.misconceptionCheck && !hasTriedMisconceptionCheck) {
        return pool.misconceptionCheck;
      }

      const remAct = pool.remediationActivities['MISCONCEPTION'] || {
        id: `act-rem-misc-${Date.now()}`,
        type: 'REMEDIATION',
        title: 'Targeted Remediation: Clarifying Conceptual Misconception',
        instruction: 'Review this essential conceptual distinction before testing your understanding.',
        content: `**Key Mental Model Correction**\n\n${session.currentActivity.question?.explanation || 'Be careful not to conflate separate mathematical or operational rules.'}\n\n*Rule*: Verify operations apply strictly to compatible bases and constraints as outlined in your school notes.`,
      };
      return remAct;
    }

    // B. Severe struggle (2 or more mistakes) -> Scaffolding / Guided Practice
    if (evidence.totalMistakes >= 2) {
      const hasTriedGuided = session.history.some((h) => h.activityType === 'GUIDED_PRACTICE');
      if (pool.guidedPractice && !hasTriedGuided) {
        return pool.guidedPractice;
      }

      if (pool.workedExample) {
        return pool.workedExample;
      }
    }

    // C. Calculation or Application slip (Student B case) -> Targeted Remediation / Procedure Review
    const remAct = pool.remediationActivities['CALCULATION_ERROR'] || {
      id: `act-rem-calc-${Date.now()}`,
      type: 'REMEDIATION',
      title: 'Targeted Remediation: Step-by-Step Procedure Review',
      instruction: 'Review the step-by-step arithmetic procedure below.',
      content: `**Step-by-Step Procedure Checklist**\n\n${session.currentActivity.question?.explanation || 'Carefully observe the order of operations and boundary conditions.'}\n\n*Teacher Tip*: Check each intermediate step individually before finalizing your answer.`,
    };
    return remAct;
  }

  private createSummaryActivity(session: LessonSessionState, reason: string): LessonActivity {
    const totalActs = session.history.length;
    const mistakes = session.evidence.totalMistakes;
    const pathSummary = session.history.map((h, i) => `${i + 1}. ${h.activityType}`).join(' → ');

    return {
      id: `act-summary-${session.conceptId}`,
      type: 'SUMMARY',
      title: 'Concept Learning Completed',
      instruction: 'You have satisfied the academic evidence criteria for this concept.',
      content: `### Learning Evidence Summary\n\n` +
        `**Reason**: ${reason}\n\n` +
        `• **Activities Completed**: ${totalActs}\n` +
        `• **Mistakes Handled**: ${mistakes}\n` +
        `• **Learning Path Followed**: ${pathSummary}\n` +
        `• **Mastery Score Recorded**: ${session.masteryScore}/100\n\n` +
        `This concept will now automatically transition into your scheduled spaced retrieval and practice planner.`,
    };
  }

  private generateSummaryMessage(session: LessonSessionState): string {
    if (session.evidence.totalMistakes === 0) {
      return `Fast-Track Mastery: You understood the concept immediately and demonstrated flawless application.`;
    }
    if (session.evidence.totalMistakes === 1) {
      return `Targeted Mastery: You diagnosed and corrected an application slip through guided remediation.`;
    }
    return `Deep Mastery: You actively worked through conceptual misconceptions and demonstrated verified understanding.`;
  }

  private evaluateAnswer(question: Question, studentAnswer: string): boolean {
    if (!studentAnswer) return false;
    const cleanStudent = studentAnswer.trim().toLowerCase();
    const cleanCorrect = question.correctAnswer.trim().toLowerCase();

    if (cleanStudent === cleanCorrect) return true;

    // Check letter option matching
    if (cleanStudent.startsWith('a.') || cleanStudent.startsWith('b.') || cleanStudent.startsWith('c.') || cleanStudent.startsWith('d.')) {
      const optionText = cleanStudent.slice(2).trim();
      if (optionText === cleanCorrect) return true;
    }

    if (question.type === 'NUMERICAL') {
      const sVal = parseFloat(cleanStudent);
      const cVal = parseFloat(cleanCorrect);
      const tol = question.tolerance !== undefined ? question.tolerance : 0.05;
      if (!isNaN(sVal) && !isNaN(cVal)) {
        return Math.abs(sVal - cVal) <= tol;
      }
    }

    return false;
  }

  private diagnoseFailure(
    question: Question,
    studentAnswer: string,
    activity: LessonActivity
  ): FailureDiagnosisType {
    if (question.distractorDiagnoses && question.distractorDiagnoses[studentAnswer]) {
      return question.distractorDiagnoses[studentAnswer];
    }

    if (activity.type === 'MISCONCEPTION_CHECK') {
      return 'MISCONCEPTION';
    }

    if (question.type === 'NUMERICAL') {
      return 'CALCULATION_ERROR';
    }

    const clean = studentAnswer.toLowerCase();
    if (clean.includes('add') || clean.includes('plus') || clean.includes('+')) {
      return 'MISCONCEPTION';
    }

    return 'APPLICATION_FAILURE';
  }

  private generateDiagnosticFeedback(
    question: Question,
    studentAnswer: string,
    diagnosis: FailureDiagnosisType,
    concept: Concept
  ): string {
    if (diagnosis === 'MISCONCEPTION') {
      return `Misconception detected in your response "${studentAnswer}". In ${concept.name}, this rule does not apply when boundary conditions or bases differ. Expected: "${question.correctAnswer}". Let's clarify the underlying distinction.`;
    }
    if (diagnosis === 'CALCULATION_ERROR') {
      return `Your conceptual approach was on track, but a calculation error occurred. Expected: "${question.correctAnswer}". Let's review the step-by-step arithmetic.`;
    }
    if (diagnosis === 'RECALL_FAILURE') {
      return `That does not match the formal rule from the notes. Expected: "${question.correctAnswer}". Let's reinforce the rule.`;
    }
    return `That response does not satisfy the school notes specification. Expected: "${question.correctAnswer}". Let's review why.`;
  }

  /**
   * Generates or retrieves a rich, curriculum-grounded activity pool for ANY concept.
   * AI understands source notes and turns them into real pedagogic teaching.
   */
  public async getOrCreateActivityPool(concept: Concept): Promise<ConceptActivityPool> {
    if (this.activityPoolCache.has(concept.id)) {
      return this.activityPoolCache.get(concept.id)!;
    }

    const mastery = storage.getMastery(concept.id);
    const masteryScore = mastery?.score || 0;

    // 1. AI Generates Teaching Explanation
    let teaching;
    try {
      teaching = await aiService.generateTeaching(concept, undefined, masteryScore);
    } catch {
      teaching = {
        title: `Understanding ${concept.name}`,
        explanation: `${concept.explanation}\n\nThis academic principle establishes the foundational relationships and boundary conditions required for mastery in ${concept.subjectName || concept.subjectId}.`,
        importantRules: [
          ...(concept.formulas || []),
          ...(concept.definitions || []),
          'Always check boundary conditions and units before calculating.',
        ].slice(0, 3),
        simpleExamples: concept.examples?.length
          ? concept.examples.slice(0, 2)
          : [`Standard application of ${concept.name} demonstrates expected behavior under syllabus guidelines.`],
        commonMisconceptions: [
          {
            mistake: `Applying ${concept.name} without verifying initial conditions or base terms.`,
            clarification: `The principle only holds when underlying conditions and common bases match precisely.`,
          },
        ],
        sourceNoteReference: {
          documentName: concept.sourceDocument || 'School Syllabus Notes',
          page: concept.sourcePage || 1,
        },
      };
    }

    // Build markdown content for the explanation activity
    const rulesList = teaching.importantRules.map((r) => `• **${r}**`).join('\n');
    const examplesList = teaching.simpleExamples.map((ex, i) => `**Example ${i + 1}**:\n${ex}`).join('\n\n');
    const trapsList = teaching.commonMisconceptions.map((m) => `⚠️ **Common Mistake**: ${m.mistake}\n*Correction*: ${m.clarification}`).join('\n\n');

    const explanationContent = `### 1. The Core Principle\n${teaching.explanation}\n\n` +
      `---\n\n` +
      `### 2. Essential Rules & Conditions\n${rulesList}\n\n` +
      `---\n\n` +
      `### 3. Step-by-Step Illustrative Examples\n${examplesList}\n\n` +
      `---\n\n` +
      `### 4. Critical Exam Traps & Misconceptions to Avoid\n${trapsList}`;

    // 2. Resolve Questions (Existing stored questions, syllabus sample questions, or single targeted AI generation)
    const existingQuestions = storage.getQuestions(concept.id);
    let qApp1: any = null;
    let qApp2: any = null;
    let qRecall: any = null;

    // Build from existing or sample questions, or generate missing ones using AI
    if (existingQuestions.length >= 3) {
      qApp1 = existingQuestions.find((q) => q.category === 'APPLICATION');
      qRecall = existingQuestions.find((q) => q.category === 'RECALL');
      qApp2 = existingQuestions.find((q) => q.id !== qApp1?.id && q.id !== qRecall?.id);
    }

    if (!qApp1 || !qApp2 || !qRecall) {
      if (existingQuestions.length >= 2) {
        qApp1 = qApp1 || existingQuestions.find((q) => q.category === 'APPLICATION') || existingQuestions[0];
        qApp2 = qApp2 || existingQuestions.find((q) => q.id !== qApp1?.id) || existingQuestions[1] || existingQuestions[0];
        qRecall = qRecall || existingQuestions.find((q) => q.category === 'RECALL') || existingQuestions[0];
      } else if (concept.sampleQuestions && concept.sampleQuestions.length >= 2) {
        qApp1 = qApp1 || concept.sampleQuestions.find((q) => q.category === 'APPLICATION') || concept.sampleQuestions[0];
        qApp2 = qApp2 || concept.sampleQuestions.find((q) => q !== qApp1) || concept.sampleQuestions[1];
        qRecall = qRecall || concept.sampleQuestions.find((q) => q.category === 'RECALL') || concept.sampleQuestions[0];
      }
    }

    // Attempt AI generation for any missing questions in parallel
    if (!qApp1 || !qApp2 || !qRecall) {
      try {
        const [aiQ1, aiQ2, aiRecall] = await Promise.all([
          !qApp1 ? aiService.generateQuestion(concept, 'APPLICATION', 'MEDIUM') : Promise.resolve(null),
          !qApp2 ? aiService.generateQuestion(concept, 'APPLICATION', 'HARD') : Promise.resolve(null),
          !qRecall ? aiService.generateQuestion(concept, 'RECALL', 'EASY') : Promise.resolve(null)
        ]);
        if (aiQ1) qApp1 = aiQ1;
        if (aiQ2) qApp2 = aiQ2;
        if (aiRecall) qRecall = aiRecall;
      } catch (err) {
        console.error("AI question generation error, will fall back:", err);
      }
    }

    const mainFormula = concept.formulas?.[0] || concept.definitions?.[0] || concept.name;

    if (!qApp1) {
      qApp1 = generateSubjectAwareFallbackQuestion(concept, 'APPLICATION', 'MEDIUM');
    }

    if (!qApp2) {
      qApp2 = generateSubjectAwareFallbackQuestion(concept, 'APPLICATION', 'HARD');
    }

    if (!qRecall) {
      qRecall = generateSubjectAwareFallbackQuestion(concept, 'RECALL', 'EASY');
    }

    // Save generated questions to question bank with shuffled option order
    const question1: Question = shuffleQuestionOptions({
      id: `q-app1-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: qApp1.category || 'APPLICATION',
      type: qApp1.type || 'MULTIPLE_CHOICE',
      questionText: qApp1.questionText,
      options: qApp1.options,
      correctAnswer: qApp1.correctAnswer,
      explanation: qApp1.explanation,
      distractorDiagnoses: qApp1.distractorDiagnoses,
      sourceDocument: concept.sourceDocument,
      sourcePage: concept.sourcePage,
    });
    storage.addQuestion(question1);

    const question2: Question = shuffleQuestionOptions({
      id: `q-app2-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: qApp2.category || 'APPLICATION',
      type: qApp2.type || 'MULTIPLE_CHOICE',
      questionText: qApp2.questionText,
      options: qApp2.options,
      correctAnswer: qApp2.correctAnswer,
      explanation: qApp2.explanation,
      distractorDiagnoses: qApp2.distractorDiagnoses,
      sourceDocument: concept.sourceDocument,
      sourcePage: concept.sourcePage,
    });
    storage.addQuestion(question2);

    const questionRecall: Question = shuffleQuestionOptions({
      id: `q-recall-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: qRecall.category || 'RECALL',
      type: qRecall.type || 'MULTIPLE_CHOICE',
      questionText: qRecall.questionText,
      options: qRecall.options,
      correctAnswer: qRecall.correctAnswer,
      explanation: qRecall.explanation,
      distractorDiagnoses: qRecall.distractorDiagnoses,
      sourceDocument: concept.sourceDocument,
      sourcePage: concept.sourcePage,
    });
    storage.addQuestion(questionRecall);

    const isMathSubject = isCalculationSubject(concept.subjectName || concept.subjectId, concept.formulas);

    // Build subject-appropriate misconception distractors
    const primaryMistake = teaching.commonMisconceptions?.[0]?.mistake ||
      `Confusing ${concept.name} with an unrelated concept`;
    const secondaryMistake = teaching.commonMisconceptions?.[1]?.mistake ||
      `Applying ${concept.name} without fulfilling required syllabus conditions`;
    const tertiaryMistake = teaching.commonMisconceptions?.[2]?.mistake ||
      `Disregarding key contextual rules for ${concept.name}`;

    const misconceptionQuestion = shuffleQuestionOptions({
      id: `q-misc-${concept.id}`,
      conceptId: concept.id,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      category: 'APPLICATION' as const,
      type: 'MULTIPLE_CHOICE' as const,
      questionText: `Which of the following statements is valid according to ${concept.name}?`,
      options: [
        question1.correctAnswer,
        primaryMistake,
        secondaryMistake,
        tertiaryMistake,
      ],
      correctAnswer: question1.correctAnswer,
      explanation: question1.explanation,
      distractorDiagnoses: {
        [primaryMistake]: 'MISCONCEPTION' as FailureDiagnosisType,
        [secondaryMistake]: 'KNOWLEDGE_GAP' as FailureDiagnosisType,
        [tertiaryMistake]: 'CARELESS_ERROR' as FailureDiagnosisType,
      },
      sourcePage: concept.sourcePage,
    });

    const pool: ConceptActivityPool = {
      conceptId: concept.id,
      explanation: {
        id: `act-explain-${concept.id}`,
        type: 'EXPLAIN',
        title: teaching.title || `Understanding ${concept.name}`,
        instruction: 'Review the core principles, illustrative examples, and common traps below.',
        content: explanationContent,
        sourcePage: concept.sourcePage,
      },
      workedExample: {
        id: `act-example-${concept.id}`,
        type: 'WORKED_EXAMPLE',
        title: `Official Worked Example for ${concept.name}`,
        instruction: 'Follow how the rules combine systematically.',
        content: concept.examples?.length
          ? `### Step-by-Step School Notes Example\n\n${concept.examples.join('\n\n')}`
          : isMathSubject
          ? `### Practical Demonstration\nApply the rule directly: identify known terms, substitute into the formula, and verify units.`
          : `### Practical Demonstration\nApply the syllabus principle directly: identify key factors, analyze the scenario, and verify that your conclusion is logically supported by the notes.`,
        sourcePage: concept.sourcePage,
      },
      recallQuestion: {
        id: `act-recall-${concept.id}`,
        type: 'RECALL',
        title: 'Core Concept Retrieval',
        instruction: 'Select the precise definition or governing rule.',
        content: `Check your retrieval of ${concept.name}:`,
        question: questionRecall,
      },
      primaryApplication: {
        id: `act-app1-${concept.id}`,
        type: 'APPLICATION',
        title: 'Application Challenge',
        instruction: 'Apply the principle to solve the problem.',
        content: `Solve the problem using ${concept.name}:`,
        question: question1,
      },
      followUpApplication: {
        id: `act-app2-${concept.id}`,
        type: 'APPLICATION',
        title: 'Follow-Up Verification Challenge',
        instruction: 'Confirm your mastery on a new scenario.',
        content: `Solve this follow-up question:`,
        question: question2,
      },
      misconceptionCheck: {
        id: `act-misc-check-${concept.id}`,
        type: 'MISCONCEPTION_CHECK',
        title: 'Misconception Diagnostic Check',
        instruction: 'Differentiate between the valid rule and the common error.',
        content: `Identify the valid statement regarding ${concept.name}:`,
        question: misconceptionQuestion,
      },
      remediationActivities: {
        MISCONCEPTION: {
          id: `act-rem-misc-${concept.id}`,
          type: 'REMEDIATION',
          title: `Targeted Remediation: Correcting Common Misconception`,
          instruction: 'Pay close attention to why the common error fails.',
          content: `### 🚨 Why the Error Occurs\n\n` +
            `Students often confuse distinct principles when studying ${concept.name}.\n\n` +
            `• **Verified Rule**: ${question1.correctAnswer}\n\n` +
            `• **Common Pitfall**: ${primaryMistake}\n\n` +
            `*Rule of Thumb*: ${teaching.commonMisconceptions?.[0]?.clarification || 'Always verify that preconditions match syllabus guidelines before answering.'}`,
        },
        CALCULATION_ERROR: {
          id: `act-rem-calc-${concept.id}`,
          type: 'REMEDIATION',
          title: isMathSubject
            ? 'Targeted Remediation: Step-by-Step Computation Check'
            : 'Targeted Remediation: Step-by-Step Procedure Check',
          instruction: 'Review the step-by-step execution procedure.',
          content: isMathSubject
            ? `### 🛠️ Safe Calculation Blueprint\n\n` +
              `When solving numerical problems involving ${concept.name}:\n\n` +
              `1. **Isolate Terms First**: Separate constants, coefficients, and variables.\n` +
              `2. **Apply Verified Rules**: Apply ${concept.formulas?.[0] || 'the governing formula'} step by step.\n` +
              `3. **Sanity Check Result**: Check signs, units, and boundary conditions.`
            : `### 🛠️ Step-by-Step Analysis Blueprint\n\n` +
              `When addressing questions involving ${concept.name}:\n\n` +
              `1. **Identify Core Terms & Scope**: Distinguish key variables, conditions, and definitions involved in ${concept.name}.\n` +
              `2. **Apply Verified Syllabus Rules**: Apply ${concept.definitions?.[0] || 'the verified syllabus principle'} step by step.\n` +
              `3. **Verify Conclusion**: Confirm that your answer directly addresses the prompt without confusing related concepts.`,
        },
      },
      guidedPractice: {
        id: `act-guided-${concept.id}`,
        type: 'GUIDED_PRACTICE',
        title: 'Guided Practice: Step-by-Step Scaffolded Problem',
        instruction: 'Solve this scaffolded problem step by step.',
        content: `Review the worked pattern from the syllabus:\n\n` +
          `• Step 1: Identify the relevant rule or definition: ${concept.formulas?.[0] || concept.definitions?.[0] || concept.name}\n` +
          `• Step 2: Apply syllabus criteria carefully.\n` +
          `• Step 3: Deduce final verified answer.\n\n` +
          `Now test this procedure on the challenge question below:`,
        question: question1,
      },
    };

    this.activityPoolCache.set(concept.id, pool);
    return pool;
  }

  /**
   * Automated Three-Student Benchmark runner for verification.
   * Runs Student A (fast), Student B (average), or Student C (struggling)
   * and returns the exact execution trace and evidence outcome.
   */
  public async simulateBenchmark(
    conceptId: string,
    profile: 'STUDENT_A' | 'STUDENT_B' | 'STUDENT_C'
  ): Promise<{
    profile: string;
    description: string;
    path: string[];
    history: Array<{ activityType: string; isCorrect?: boolean; feedback?: string }>;
    finalMastery: number;
    completed: boolean;
    summary: string;
  }> {
    const session = await this.startSession(conceptId, `sim-${profile}-${Date.now()}`, { forceNewStudent: true });
    const pool = await this.getOrCreateActivityPool(storage.getConcept(conceptId)!);

    const path: string[] = [];
    let iterations = 0;
    const maxIterations = 8;

    while (!session.isComplete && iterations < maxIterations) {
      iterations++;
      const current = session.currentActivity;
      path.push(current.type);

      // Non-question activity: advance
      if (!current.question) {
        await this.processResponse(session.sessionId, 'CONTINUE');
        continue;
      }

      // Question activity: simulate answer based on student profile
      let answerToSubmit = '';
      if (profile === 'STUDENT_A') {
        // Fast student: answers correctly every time
        answerToSubmit = current.question.correctAnswer;
      } else if (profile === 'STUDENT_B') {
        // Average student: makes a calculation error on first question, then gets remediation and answers correctly
        if (session.evidence.totalAttempts === 0) {
          // Choose distractor with CALCULATION_ERROR or wrong number
          const calcDistractor = Object.keys(current.question.distractorDiagnoses || {}).find(
            (k) => current.question?.distractorDiagnoses?.[k] === 'CALCULATION_ERROR'
          );
          answerToSubmit = calcDistractor || (current.question.options ? current.question.options[1] : 'wrong_calculation');
        } else {
          answerToSubmit = current.question.correctAnswer;
        }
      } else if (profile === 'STUDENT_C') {
        // Struggling student: chooses misconception on first question, gets remediation, answers guided check, then succeeds
        if (session.evidence.totalAttempts === 0) {
          const miscDistractor = Object.keys(current.question.distractorDiagnoses || {}).find(
            (k) => current.question?.distractorDiagnoses?.[k] === 'MISCONCEPTION'
          );
          answerToSubmit = miscDistractor || (current.question.options ? current.question.options[0] === current.question.correctAnswer ? current.question.options[1] : current.question.options[0] : 'misconception');
        } else {
          answerToSubmit = current.question.correctAnswer;
        }
      }

      await this.processResponse(session.sessionId, answerToSubmit);
    }

    if (session.currentActivity && session.currentActivity.type === 'SUMMARY') {
      path.push('SUMMARY');
    }

    const descriptions = {
      STUDENT_A: 'Student A (Fast): Explanation → Correct Application → Follow-Up Verification → Fast-Track Mastery.',
      STUDENT_B: 'Student B (Average): Explanation → Calculation Slip → Targeted Remediation → Correct Retry → Mastery.',
      STUDENT_C: 'Student C (Struggling): Explanation → Misconception Slip → Mental Model Contrasting Remediation → Diagnostic Check → Application → Mastery.',
    };

    return {
      profile,
      description: descriptions[profile],
      path,
      history: session.history.map((h) => ({
        activityType: h.activityType,
        isCorrect: h.isCorrect,
        feedback: h.feedback,
      })),
      finalMastery: session.masteryScore ?? 0,
      completed: session.isComplete,
      summary: session.summaryMessage || 'Session completed.',
    };
  }
}

export const flexibleLessonEngine = new FlexibleLessonEngine();
