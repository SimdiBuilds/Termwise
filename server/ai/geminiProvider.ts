import { GoogleGenAI } from '@google/genai';
import {
  Concept,
  Question,
  QuestionCategory,
  QuestionType,
  FailureDiagnosisType,
  MistakeClassification,
  LessonStep,
} from '../../src/types.ts';
import {
  LLMProvider,
  ExtractedCurriculumPayload,
  TeachingContentPayload,
  GeneratedQuestionPayload,
  LessonGenerationResult,
  AnswerEvaluationResult,
  RemediationPayload,
} from './provider.ts';
import { aiCurriculumUnderstandingService } from '../services/aiCurriculumUnderstanding.ts';
import { extractTextFromPdfBuffer } from '../services/pdfExtractor.ts';
import { safeParseJson } from './jsonHelper.ts';
import {
  shuffleQuestionOptions,
  generateSubjectAwareFallbackQuestion,
} from '../services/questionUtils.ts';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiProvider implements LLMProvider {
  public name = 'Google Gemini Adaptive Multi-Model';
  private aiClient: GoogleGenAI | null = null;
  private rateLimitedUntil = 0;
  private teachingCache = new Map<string, TeachingContentPayload>();
  private questionCache = new Map<string, GeneratedQuestionPayload>();

  private getClient(): GoogleGenAI | null {
    if (!this.aiClient && process.env.GEMINI_API_KEY) {
      this.aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  public isRateLimited(): boolean {
    return Date.now() < this.rateLimitedUntil;
  }

  private handleRateLimitOrUnavailable(err: any): void {
    let delayMs = 15000;
    try {
      const errStr = typeof err === 'string' ? err : JSON.stringify(err);
      const match = errStr.match(/retry in\s+(\d+(?:\.\d+)?)s/i) || errStr.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
      if (match && match[1]) {
        delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
      }
    } catch {
      // default 15s
    }
    this.rateLimitedUntil = Math.max(this.rateLimitedUntil, Date.now() + delayMs);
  }

  private async generateWithModelFallback(params: {
    contents: any;
    config?: any;
    candidateModels?: string[];
  }): Promise<{ text: string }> {
    const client = this.getClient();
    if (!client) throw new Error('Gemini API client not initialized');

    if (this.isRateLimited()) {
      const remainingSec = Math.ceil((this.rateLimitedUntil - Date.now()) / 1000);
      throw new Error(`Gemini rate limit cooldown active (${remainingSec}s remaining)`);
    }

    const models = params.candidateModels || [
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
    ];

    let lastError: any = null;
    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await client.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          if (res && res.text) {
            return { text: res.text };
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = (err?.message || String(err)).toLowerCase();
          const isQuota = errMsg.includes('429') || errMsg.includes('resource_exhausted') || errMsg.includes('quota exceeded') || errMsg.includes('rate limit');
          const isUnavailable = errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('high demand') || errMsg.includes('overloaded');

          if ((isQuota || isUnavailable) && attempt === 1) {
            await sleep(600);
            continue;
          }

          if (attempt === 2) {
            // Move to the next candidate model
            break;
          }
        }
      }
    }

    if (lastError) {
      this.handleRateLimitOrUnavailable(lastError);
    }
    throw lastError || new Error('All candidate Gemini models failed');
  }

  /**
   * AI-Driven Curriculum Understanding:
   * 1. Extracts complete text while preserving page markers (=== PAGE n ===)
   * 2. Passes full instructional material directly to Gemini AI
   * 3. AI understands the educational content and creates the Topic -> Subtopic -> Concept hierarchy
   * 4. AI generates clean normalized names, student-friendly summaries, and measurable concepts
   */
  async extractCurriculum(
    subjectName: string,
    notesText?: string,
    pdfBuffer?: Buffer
  ): Promise<ExtractedCurriculumPayload> {
    let fullText = notesText || '';

    // If PDF buffer is supplied and text is empty, extract text with page boundaries
    if (!fullText && pdfBuffer) {
      try {
        const parsedPdf = await extractTextFromPdfBuffer(pdfBuffer);
        fullText = parsedPdf.text || '';
      } catch (err) {
        console.warn('PDF text extraction fallback failed:', err);
      }
    }

    const client = this.getClient();
    return aiCurriculumUnderstandingService.buildCurriculum(
      {
        text: fullText,
        subjectHint: subjectName,
      },
      client || undefined,
      this.isRateLimited()
    );
  }

  /**
   * Real AI teaching grounded in school notes.
   * Generates intuitive explanation, rules, examples, and misconceptions to avoid.
   */
  async generateTeaching(
    concept: Concept,
    sourceNotesText?: string,
    studentMastery?: number
  ): Promise<TeachingContentPayload> {
    const cacheKey = `teaching-${concept.id}`;
    if (this.teachingCache.has(cacheKey)) {
      return this.teachingCache.get(cacheKey)!;
    }

    const client = this.getClient();
    if (!client || this.isRateLimited()) {
      const fallback = this.fallbackGenerateTeaching(concept);
      this.teachingCache.set(cacheKey, fallback);
      return fallback;
    }

    try {
      const prompt = `You are an expert, calm academic tutor.
The student needs to master this concept from their official school notes.
DO NOT just regurgitate the raw notes. Synthesize a clean, intuitive, rigorous teaching module.

CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS:
- Use inline math '$ ... $' for inline variables, symbols, and formulas (e.g. '$x^2 + y^2 = r^2$', '\\frac{a}{b}', '\\theta', '\\text{H}_2\\text{O}').
- Use block math '$$ ... $$' for standalone equations.
- NEVER output plain ASCII math like 'x^2' or 'a/b' without LaTeX delimiters.

Concept: ${concept.name}
Subject: ${concept.subjectName || concept.subjectId}
Definitions: ${concept.definitions?.join('; ') || 'None provided'}
Formulas: ${concept.formulas?.join('; ') || 'None'}
Key Facts: ${concept.keyFacts?.join('; ') || 'None'}
Student Current Mastery: ${studentMastery !== undefined ? `${studentMastery}%` : 'Beginning'}
Source Notes Excerpt:
"""
${(sourceNotesText || concept.explanation || '').slice(0, 3500)}
"""

Structure your response in valid JSON with:
1. title: Engaging, clear academic heading
2. explanation: Core intuitive explanation explaining the "why" and "how". Use concise paragraphs and bold emphasis where helpful.
3. importantRules: Array of 2-4 critical rules, conditions, or formulas.
4. simpleExamples: Array of 2 clear worked examples with step-by-step working.
5. commonMisconceptions: Array of 1-3 items, each having "mistake" (what students erroneously do) and "clarification" (why it's wrong and how to think correctly).
6. sourceNoteReference: { "documentName": "${concept.sourceDocument || 'School Syllabus Notes'}", "page": ${concept.sourcePage || 1} }

Return ONLY valid JSON:
{
  "title": "string",
  "explanation": "string",
  "importantRules": ["string"],
  "simpleExamples": ["string"],
  "commonMisconceptions": [
    { "mistake": "string", "clarification": "string" }
  ],
  "sourceNoteReference": {
    "documentName": "string",
    "page": number
  }
}`;

      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = safeParseJson<any>(response.text, {});
      if (parsed.explanation && Array.isArray(parsed.importantRules)) {
        this.teachingCache.set(cacheKey, parsed as TeachingContentPayload);
        return parsed as TeachingContentPayload;
      }
      const fallback = this.fallbackGenerateTeaching(concept);
      this.teachingCache.set(cacheKey, fallback);
      return fallback;
    } catch {
      const fallback = this.fallbackGenerateTeaching(concept);
      this.teachingCache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * Generates a dynamic, concept-appropriate question based on cognitive category & difficulty.
   */
  async generateQuestion(
    concept: Concept,
    category: QuestionCategory,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    previousMistakes?: string[],
    sourceNotesText?: string
  ): Promise<GeneratedQuestionPayload> {
    const cacheKey = `q-${concept.id}-${category}-${difficulty}`;
    if (this.questionCache.has(cacheKey)) {
      return this.questionCache.get(cacheKey)!;
    }

    const client = this.getClient();
    if (!client || this.isRateLimited()) {
      const fallback = this.fallbackGenerateQuestion(concept, category, difficulty);
      this.questionCache.set(cacheKey, fallback);
      return fallback;
    }

    try {
      const prompt = `You are an academic examination specialist.
CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS:
- Use inline math '$ ... $' for inline variables, symbols, options, and formulas (e.g. '$x^2 + y^2 = r^2$', '\\frac{a}{b}', '\\theta').
- Use block math '$$ ... $$' for standalone equations.
- NEVER output plain ASCII math like 'x^2' or 'a/b' without LaTeX delimiters.

Generate an original, rigorous question for:
Concept: ${concept.name}
Subject: ${concept.subjectName || concept.subjectId}
Category: ${category}
Difficulty: ${difficulty}
Rules/Formulas: ${concept.formulas?.join('; ') || 'None'}
Definitions: ${concept.definitions?.join('; ') || 'None'}
Previous mistakes student made to probe: ${previousMistakes?.join('; ') || 'None'}
School Notes Excerpt:
"""
${(sourceNotesText || concept.explanation || '').slice(0, 2500)}
"""

Requirements:
- Ensure all question stems, correct answers, and distractors are strictly tailored to the subject "${concept.subjectName || concept.subjectId}". DO NOT use math/algebra terminology or mathematical examples unless the subject is actually Mathematics or Physics.
- NEVER spoon-feed or explicitly reveal formulas in the question stem or options. For instance, do NOT write "Using the formula A = ...". For APPLICATION questions, you are strictly forbidden from writing the formula or mathematical relation needed to solve it. The student must independently recall or deduce the necessary formula or principle from memory to solve the problem. Only in RECALL questions can a formula be named or asked to be identified.
- Provide 4 plausible options. The 3 distractors MUST represent genuine subject-specific misconceptions or mistakes.
- Place the correct answer randomly among the options (or populate options and correctAnswer clearly).
- For each distractor, map its diagnosis to: "MISCONCEPTION", "CALCULATION_ERROR", "KNOWLEDGE_GAP", or "CARELESS_ERROR".
- Provide a rigorous explanation grounded in the school notes.

Return ONLY valid JSON:
{
  "category": "${category}",
  "type": "MULTIPLE_CHOICE",
  "questionText": "Clear question stem",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "Exact string matching one of the options",
  "explanation": "Detailed explanation...",
  "distractorDiagnoses": {
    "Distractor 1": "MISCONCEPTION",
    "Distractor 2": "CALCULATION_ERROR",
    "Distractor 3": "KNOWLEDGE_GAP"
  },
  "sourcePage": ${concept.sourcePage || 1}
}`;

      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = safeParseJson<any>(response.text, {});
      if (parsed.questionText && parsed.correctAnswer) {
        const shuffled = shuffleQuestionOptions(parsed as GeneratedQuestionPayload);
        this.questionCache.set(cacheKey, shuffled);
        return shuffled;
      }
      const fallback = this.fallbackGenerateQuestion(concept, category, difficulty);
      this.questionCache.set(cacheKey, fallback);
      return fallback;
    } catch {
      const fallback = this.fallbackGenerateQuestion(concept, category, difficulty);
      this.questionCache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * Generates targeted remediation when a student makes a mistake.
   */
  async generateRemediation(
    concept: Concept,
    question: Question,
    studentAnswer: string,
    diagnosisType: FailureDiagnosisType
  ): Promise<RemediationPayload> {
    const client = this.getClient();
    if (!client) {
      return this.fallbackGenerateRemediation(concept, question, studentAnswer, diagnosisType);
    }

    try {
      const prompt = `You are an academic remediation specialist.
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS ($ ... $ or $$ ... $$).

A student just answered a question incorrectly.
Concept: ${concept.name}
Question: ${question.questionText}
Student Answer: "${studentAnswer}"
Correct Model Answer: "${question.correctAnswer}"
Diagnosed Failure Type: "${diagnosisType}"

Provide a targeted remediation that fixes their mental model:
1. title: Specific targeted title (e.g. "Rule Distinction: Powers vs Multipliers")
2. mentalModelCorrection: Directly explain why their thought process failed without being condescending.
3. contrastingExample: Show a side-by-side contrast (What went wrong vs What is correct).
4. actionableStep: 1 clear actionable memory rule or checklist to apply right now.

Return ONLY valid JSON:
{
  "title": "string",
  "mentalModelCorrection": "string",
  "contrastingExample": "string",
  "actionableStep": "string"
}`;

      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = safeParseJson<any>(response.text, {});
      if (parsed.mentalModelCorrection && parsed.actionableStep) {
        return parsed as RemediationPayload;
      }
      return this.fallbackGenerateRemediation(concept, question, studentAnswer, diagnosisType);
    } catch (err) {
      console.warn('Gemini generateRemediation fallback used:', err);
      return this.fallbackGenerateRemediation(concept, question, studentAnswer, diagnosisType);
    }
  }

  async generateLesson(concept: Concept, sourceNotesText?: string): Promise<LessonGenerationResult> {
    const client = this.getClient();
    if (!client) {
      return this.fallbackGenerateLesson(concept);
    }

    try {
      const prompt = `You are a rigorous, calm, note-grounded academic tutor.
CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS:
- Use inline math '$ ... $' for inline variables, symbols, options, and formulas (e.g. '$x^2 + y^2 = r^2$', '\\frac{a}{b}', '\\theta').
- Use block math '$$ ... $$' for standalone equations.
- NEVER output plain ASCII math like 'x^2' or 'a/b' without LaTeX delimiters.

Teach the following concept from the student's school curriculum:
Subject: ${concept.subjectId}
Concept: ${concept.name}
Definitions: ${concept.definitions.join('; ')}
Formulas: ${concept.formulas.join('; ')}
Key Facts: ${concept.keyFacts.join('; ')}
Official Notes Context: ${sourceNotesText ? sourceNotesText.slice(0, 3000) : concept.explanation}

Rules:
1. Do NOT write an enormous lecture. Keep each step focused and readable.
2. Follow this 4-step sequence:
   Step 1: EXPLANATION (Core principles, physical intuition, or logical definitions)
   Step 2: EXAMPLE (Clear worked example demonstrating how the concept works)
   Step 3: CHECK_QUESTION (An active recall/recognition check to see if the student grasps the fundamental idea)
   Step 4: APPLICATION_QUESTION (A problem or scenario requiring the student to apply the concept)

Return ONLY valid JSON matching this structure:
{
  "steps": [
    {
      "stepNumber": 1,
      "type": "EXPLANATION",
      "content": "Grounded explanation text..."
    },
    {
      "stepNumber": 2,
      "type": "EXAMPLE",
      "content": "Worked example step by step..."
    },
    {
      "stepNumber": 3,
      "type": "CHECK_QUESTION",
      "content": "Quick comprehension check question prompt",
      "question": {
        "category": "RECALL",
        "type": "MULTIPLE_CHOICE",
        "questionText": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "...",
        "explanation": "..."
      }
    },
    {
      "stepNumber": 4,
      "type": "APPLICATION_QUESTION",
      "content": "Real application check question prompt",
      "question": {
        "category": "APPLICATION",
        "type": "MULTIPLE_CHOICE",
        "questionText": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "...",
        "explanation": "..."
      }
    }
  ]
}`;

      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = safeParseJson<any>(response.text, {});
      if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        return parsed as LessonGenerationResult;
      }
      return this.fallbackGenerateLesson(concept);
    } catch (err) {
      console.warn('Gemini lesson generation fallback used:', err);
      return this.fallbackGenerateLesson(concept);
    }
  }

  async evaluateOpenAnswer(
    question: Question,
    studentAnswer: string,
    concept: Concept,
    sourceNotesText?: string
  ): Promise<AnswerEvaluationResult> {
    const client = this.getClient();
    if (!client) {
      return this.fallbackEvaluateAnswer(question, studentAnswer);
    }

    try {
      const prompt = `You are an objective academic examiner.
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, roots, or chemical expressions in your feedback and targeted remediation MUST BE WRITTEN IN VALID LaTeX DELIMITERS ($ ... $ or $$ ... $$).

Evaluate the student's answer to this open-ended question:
Question: "${question.questionText}"
Concept: "${concept.name}"
Model/Correct Answer: "${question.correctAnswer}"
Student Answer: "${studentAnswer}"
Official Context: "${sourceNotesText || concept.explanation}"

Determine:
1. Is it substantially correct? (Score between 0.0 and 1.0)
2. Accurate, constructive feedback explaining what was correct and what was missing.
3. If score < 0.75, classify the mistake:
   - KNOWLEDGE_GAP (didn't know an essential fact or terminology)
   - MISCONCEPTION (confused principles or stated an incorrect theory)
   - RECALL_FAILURE (could not recall a required term or formula)
   - CALCULATION_ERROR (math computation slipped)
   - MISREAD (answered something different from what was asked)
   - CARELESS_ERROR (minor omission or typo)
   - APPLICATION_FAILURE (knows definition but applied it backwards)
4. Pinpoint the exact diagnosis and 1-sentence targeted remediation.

Return ONLY valid JSON:
{
  "isCorrect": boolean,
  "score": number, // 0.0 to 1.0
  "feedback": "string",
  "mistakeType": "KNOWLEDGE_GAP" | "MISCONCEPTION" | "RECALL_FAILURE" | "CALCULATION_ERROR" | "MISREAD" | "CARELESS_ERROR" | "APPLICATION_FAILURE",
  "diagnosis": "string explaining root error",
  "targetedRemediation": "string with specific actionable rule"
}`;

      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = safeParseJson<any>(response.text, {});
      return {
        isCorrect: Boolean(parsed.isCorrect && parsed.score >= 0.75),
        score: typeof parsed.score === 'number' ? parsed.score : 0.5,
        feedback: parsed.feedback || 'Answer reviewed against school curriculum standards.',
        mistakeType: parsed.mistakeType,
        diagnosis: parsed.diagnosis,
        targetedRemediation: parsed.targetedRemediation,
      };
    } catch (err) {
      return this.fallbackEvaluateAnswer(question, studentAnswer);
    }
  }

  async diagnoseMistake(
    question: Question,
    studentAnswer: string,
    concept: Concept
  ): Promise<{ mistakeType: MistakeClassification; diagnosis: string; remediation: string }> {
    const client = this.getClient();
    if (!client) {
      return {
        mistakeType: 'MISCONCEPTION',
        diagnosis: `The provided response "${studentAnswer}" does not align with the standard answer "${question.correctAnswer}".`,
        remediation: `Review the foundational principle of ${concept.name}.`,
      };
    }

    try {
      const prompt = `Analyze this student mistake:
Concept: ${concept.name}
Question: ${question.questionText}
Student Answer: ${studentAnswer}
Expected Answer: ${question.correctAnswer}
Explanation: ${question.explanation}

Classify into one of: KNOWLEDGE_GAP, MISCONCEPTION, RECALL_FAILURE, CALCULATION_ERROR, MISREAD, CARELESS_ERROR, APPLICATION_FAILURE.
Provide a clear 1-sentence diagnosis and a 1-sentence targeted remediation rule.

Return ONLY valid JSON:
{
  "mistakeType": "...",
  "diagnosis": "...",
  "remediation": "..."
}`;

      const response = await this.generateWithModelFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = safeParseJson<any>(response.text, {});
      return {
        mistakeType: parsed.mistakeType || 'MISCONCEPTION',
        diagnosis: parsed.diagnosis || 'The response diverged from the verified school solution.',
        remediation: parsed.remediation || question.explanation,
      };
    } catch {
      return {
        mistakeType: 'MISCONCEPTION',
        diagnosis: `The answer "${studentAnswer}" diverges from "${question.correctAnswer}".`,
        remediation: question.explanation,
      };
    }
  }

  // --- DETERMINISTIC FALLBACKS (Guarantees zero downtime even with no API key) ---

  private fallbackGenerateLesson(concept: Concept): LessonGenerationResult {
    return {
      steps: [
        {
          stepNumber: 1,
          type: 'EXPLANATION',
          content: `${concept.explanation}\n\nKey definitions:\n${concept.definitions.map((d) => `• ${d}`).join('\n')}`,
        },
        {
          stepNumber: 2,
          type: 'EXAMPLE',
          content: `Standard Worked Example:\n${concept.examples.length > 0 ? concept.examples.join('\n\n') : 'Applying the core definition to a standard examination case.'}`,
        },
        {
          stepNumber: 3,
          type: 'CHECK_QUESTION',
          content: 'Check your foundational understanding of this concept:',
          question: {
            id: `chk-${concept.id}`,
            conceptId: concept.id,
            subjectId: concept.subjectId,
            topicId: concept.topicId,
            category: 'RECALL',
            type: 'MULTIPLE_CHOICE',
            questionText: `What is the primary definition or rule for "${concept.name}"?`,
            options: [
              concept.definitions[0] || concept.explanation.slice(0, 60),
              'A contradictory statement reversing the primary definition.',
              'An unrelated property belonging to a different topic.',
              'A non-standard variation not examinable in this course.',
            ],
            correctAnswer: concept.definitions[0] || concept.explanation.slice(0, 60),
            explanation: `As stated in ${concept.sourceDocument}: ${concept.definitions[0] || concept.explanation}`,
            sourcePage: concept.sourcePage,
          },
        },
        {
          stepNumber: 4,
          type: 'APPLICATION_QUESTION',
          content: 'Now apply this principle to solve an active question:',
          question: {
            id: `app-${concept.id}`,
            conceptId: concept.id,
            subjectId: concept.subjectId,
            topicId: concept.topicId,
            category: 'APPLICATION',
            type: 'MULTIPLE_CHOICE',
            questionText: `In a practical scenario testing ${concept.name}, how is this rule demonstrated?`,
            options: [
              concept.examples[0] || 'By observing the direct proportional relationship established in the notes.',
              'By inverting the relationship during calculations.',
              'By setting the resultant values to zero.',
              'By ignoring the boundary constraints.',
            ],
            correctAnswer: concept.examples[0] || 'By observing the direct proportional relationship established in the notes.',
            explanation: `Correctly applies the principle verified in the school notes: ${concept.examples[0] || concept.name}`,
            sourcePage: concept.sourcePage,
          },
        },
      ],
    };
  }

  private fallbackEvaluateAnswer(question: Question, studentAnswer: string): AnswerEvaluationResult {
    const cleanStudent = studentAnswer.trim().toLowerCase();
    const cleanExpected = question.correctAnswer.trim().toLowerCase();

    // Check exact or close containment
    const isClose = cleanStudent === cleanExpected || cleanStudent.includes(cleanExpected) || cleanExpected.includes(cleanStudent);
    if (isClose) {
      return {
        isCorrect: true,
        score: 1.0,
        feedback: 'Correct. Your response accurately addresses the key requirements of the question.',
      };
    }

    return {
      isCorrect: false,
      score: 0.3,
      feedback: `The provided response does not match the school model answer. Expected: "${question.correctAnswer}".`,
      mistakeType: 'KNOWLEDGE_GAP',
      diagnosis: 'Omission of key terms or conceptual relationship expected by the marking guide.',
      targetedRemediation: question.explanation,
    };
  }

  private fallbackGenerateTeaching(concept: Concept): TeachingContentPayload {
    const formulasText = concept.formulas?.length ? concept.formulas.map((f) => `- ${f}`).join('\n') : '';
    const defsText = concept.definitions?.length ? concept.definitions.map((d) => `- ${d}`).join('\n') : '';

    return {
      title: `Understanding ${concept.name}`,
      explanation: `${concept.explanation}\n\nThis academic principle establishes the foundational relationships and boundary conditions required for mastery in ${concept.subjectName || concept.subjectId}.`,
      importantRules: [
        ...(concept.formulas || []),
        ...(concept.definitions || []),
        'Always check boundary conditions and units before calculating.',
      ].slice(0, 3),
      simpleExamples: concept.examples?.length
        ? concept.examples.slice(0, 2)
        : [
            `Standard Application: Applying the core equation for ${concept.name} directly yields the expected baseline value.`,
            `Special Case: When boundary conditions approach zero, verify that reciprocal terms do not diverge.`,
          ],
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

  private fallbackGenerateQuestion(
    concept: Concept,
    category: QuestionCategory,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  ): GeneratedQuestionPayload {
    return generateSubjectAwareFallbackQuestion(concept, category, difficulty);
  }

  private fallbackGenerateRemediation(
    concept: Concept,
    question: Question,
    studentAnswer: string,
    diagnosisType: FailureDiagnosisType
  ): RemediationPayload {
    return {
      title: `Remediation for ${concept.name}: Overcoming ${diagnosisType.replace('_', ' ')}`,
      mentalModelCorrection: `Your choice "${studentAnswer}" reflects a common slip where rules are conflated. When working with ${concept.name}, remember that operations apply strictly to specific parts of the expression.`,
      contrastingExample: `❌ Common Pitfall: Conflating different operations.\n✅ Verified Rule: ${question.correctAnswer}`,
      actionableStep: `Checklist Step: Before writing your final answer, verify that every term matches the canonical rule: "${question.correctAnswer}".`,
    };
  }

  /**
   * AI Document Classification & Subject Grouping Engine
   */
  async classifyDocuments(
    docs: { id: string; filename: string; excerpt: string }[]
  ): Promise<{ docId: string; filename: string; subjectName: string; reasoning: string }[]> {
    if (this.isRateLimited() || !this.getClient()) {
      return this.fallbackClassifyDocuments(docs);
    }

    const prompt = `You are an expert academic taxonomy classifier.
Analyze the following document excerpts uploaded by a student.
Determine which canonical academic subject each document belongs to.

Rules:
1. Standardize clean, professional subject names (e.g. "Mathematics", "Chemistry", "Biology", "Physics", "Further Mathematics", "Economics", "English Language", "Computer Science", "Geography", "History", "Agricultural Science").
2. DO NOT use raw file names like "notes_final.pdf" or "doc1.pdf" as subject names.
3. If multiple files belong to the same academic subject (e.g. "Physics Part 1.pdf" and "Physics Part 2.pdf"), classify BOTH into the EXACT SAME subject name "Physics".
4. Infer subject from actual instructional content, formulas, terminology, and definitions, not just the file name.

Input Documents:
${JSON.stringify(docs.map((d) => ({ id: d.id, filename: d.filename, textExcerpt: d.excerpt.slice(0, 2000) })), null, 2)}

Return strictly JSON matching this structure:
{
  "classifications": [
    {
      "docId": "string",
      "subjectName": "string",
      "reasoning": "string"
    }
  ]
}
`;

    try {
      const res = await this.generateWithModelFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json', temperature: 0.1 },
      });

      const parsed = safeParseJson<any>(res.text);
      if (parsed && Array.isArray(parsed.classifications) && parsed.classifications.length > 0) {
        return parsed.classifications.map((c: any) => ({
          docId: c.docId,
          filename: docs.find((d) => d.id === c.docId)?.filename || 'Document',
          subjectName: this.cleanSubjectName(c.subjectName),
          reasoning: c.reasoning || 'Classified based on instructional material',
        }));
      }
    } catch (err) {
      console.warn('AI document classification failed, using pattern matching fallback:', err);
    }

    return this.fallbackClassifyDocuments(docs);
  }

  private fallbackClassifyDocuments(
    docs: { id: string; filename: string; excerpt: string }[]
  ): { docId: string; filename: string; subjectName: string; reasoning: string }[] {
    return docs.map((doc) => {
      const fn = doc.filename.toLowerCase();
      const text = doc.excerpt.toLowerCase();
      let subject = 'General Studies';

      if (fn.includes('math') || fn.includes('calc') || fn.includes('algebra') || text.includes('theorem') || text.includes('equation')) {
        if (fn.includes('further') || text.includes('complex number') || text.includes('matrix')) {
          subject = 'Further Mathematics';
        } else {
          subject = 'Mathematics';
        }
      } else if (fn.includes('physic') || text.includes('velocity') || text.includes('newton') || text.includes('kinematics')) {
        subject = 'Physics';
      } else if (fn.includes('chem') || text.includes('stoichiometry') || text.includes('element') || text.includes('reaction') || text.includes('mole')) {
        subject = 'Chemistry';
      } else if (fn.includes('bio') || text.includes('cell') || text.includes('genetics') || text.includes('organism') || text.includes('membrane')) {
        subject = 'Biology';
      } else if (fn.includes('econ') || text.includes('market') || text.includes('demand') || text.includes('supply')) {
        subject = 'Economics';
      } else if (fn.includes('eng') || text.includes('grammar') || text.includes('prose')) {
        subject = 'English Language';
      }

      return {
        docId: doc.id,
        filename: doc.filename,
        subjectName: subject,
        reasoning: 'Classified using structural pattern heuristics',
      };
    });
  }

  private cleanSubjectName(name: string): string {
    if (!name || typeof name !== 'string') return 'General Studies';
    let cleaned = name.trim();
    cleaned = cleaned.replace(/^Subject:\s*/i, '');
    cleaned = cleaned.replace(/\s+Notes$/i, '');
    cleaned = cleaned.replace(/\s+Syllabus$/i, '');
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Generates an alternative explanation for a concept using a different angle/analogy.
   */
  async generateAlternativeExplanation(concept: Concept, sourceNotesText?: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      return `### Alternative Explanation: ${concept.name}\n\nLet's break this down step-by-step from a simpler perspective:\n\n1. **Core Idea**: ${concept.explanation}\n2. **Key Rule**: ${concept.formulas?.[0] || concept.definitions?.[0] || 'Observe the primary relationship.'}\n3. **Think of it like this**: Rather than memorizing raw symbols, imagine combining identical building blocks step-by-step.`;
    }

    try {
      const prompt = `You are an expert, empathetic academic tutor.
The student asked for an ALTERNATIVE EXPLANATION because the previous one wasn't completely clear.

Concept: ${concept.name}
Subject: ${concept.subjectName || concept.subjectId}
Definitions: ${concept.definitions?.join('; ') || 'None'}
Formulas: ${concept.formulas?.join('; ') || 'None'}
Source Notes Excerpt:
"""
${(sourceNotesText || concept.explanation || '').slice(0, 3000)}
"""

CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation MUST BE WRITTEN IN VALID LaTeX DELIMITERS ('$ ... $' or '$$ ... $$').

Instructions:
1. Explain the concept from a FRESH, DIFFERENT PERSPECTIVE or simpler intuitive analogy.
2. Use clear bullet points, step-by-step reasoning, or a visual mental model.
3. Keep it concise, encouraging, and directly grounded in their official notes.
4. Ground reference: Note document page ${concept.sourcePage || 1}.

Return Markdown text directly.`;

      const models = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash'];
      for (const model of models) {
        try {
          const res = await client.models.generateContent({
            model,
            contents: [{ text: prompt }],
            config: { temperature: 0.3 },
          });
          if (res.text && res.text.trim().length > 20) {
            return res.text;
          }
        } catch {
          continue;
        }
      }
      return `### Alternative Perspective: ${concept.name}\n\n${concept.explanation}`;
    } catch (err) {
      console.warn('generateAlternativeExplanation error:', err);
      return `### Alternative Perspective: ${concept.name}\n\n${concept.explanation}`;
    }
  }
}

export const aiProvider = new GeminiProvider();
