import {
  Concept,
  Question,
  QuestionCategory,
  QuestionType,
  MistakeClassification,
  FailureDiagnosisType,
  LessonStep,
} from '../../src/types.ts';

export interface ExtractedCurriculumPayload {
  inferredSubject?: string;
  documentStructure?: any;
  validation?: any;
  topics: Array<{
    title: string;
    description: string;
    subtopics?: Array<{
      title: string;
      description?: string;
    }>;
    concepts: Array<{
      name: string;
      subtopicTitle?: string;
      explanation: string;
      definitions: string[];
      formulas: string[];
      keyFacts: string[];
      examples: string[];
      sourcePage?: number;
      prerequisites?: string[];
      sampleQuestions?: Array<{
        category: string;
        type: 'MULTIPLE_CHOICE' | 'NUMERICAL' | 'OPEN_EXPLANATION';
        questionText: string;
        options?: string[];
        correctAnswer: string;
        tolerance?: number;
        explanation: string;
      }>;
    }>;
  }>;
}

export interface TeachingContentPayload {
  title: string;
  explanation: string;
  importantRules: string[];
  simpleExamples: string[];
  commonMisconceptions: Array<{ mistake: string; clarification: string }>;
  sourceNoteReference: {
    documentName: string;
    page?: number;
    section?: string;
  };
}

export interface GeneratedQuestionPayload {
  category: QuestionCategory;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  tolerance?: number;
  units?: string;
  explanation: string;
  distractorDiagnoses?: Record<string, FailureDiagnosisType>;
  sourcePage?: number;
}

export interface LessonGenerationResult {
  steps: LessonStep[];
}

export interface AnswerEvaluationResult {
  isCorrect: boolean;
  verdict?: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT' | 'AMBIGUOUS';
  score: number; // 0 to 1
  feedback: string;
  mistakeType?: MistakeClassification;
  diagnosis?: string;
  targetedRemediation?: string;
}

export interface RemediationPayload {
  title: string;
  mentalModelCorrection: string;
  contrastingExample: string;
  actionableStep: string;
}

export interface DocumentInputForClassification {
  id: string;
  filename: string;
  excerpt: string;
}

export interface DocumentClassificationResult {
  docId: string;
  filename: string;
  subjectName: string;
  reasoning: string;
}

export interface LLMProvider {
  name: string;
  classifyDocuments(
    docs: DocumentInputForClassification[]
  ): Promise<DocumentClassificationResult[]>;
  extractCurriculum(
    subjectName: string,
    notesText?: string,
    pdfBuffer?: Buffer
  ): Promise<ExtractedCurriculumPayload>;
  generateTeaching(
    concept: Concept,
    sourceNotesText?: string,
    studentMastery?: number
  ): Promise<TeachingContentPayload>;
  generateQuestion(
    concept: Concept,
    category: QuestionCategory,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    previousMistakes?: string[],
    sourceNotesText?: string
  ): Promise<GeneratedQuestionPayload>;
  generateLesson(concept: Concept, sourceNotesText?: string): Promise<LessonGenerationResult>;
  evaluateOpenAnswer(
    question: Question,
    studentAnswer: string,
    concept: Concept,
    sourceNotesText?: string
  ): Promise<AnswerEvaluationResult>;
  diagnoseMistake(
    question: Question,
    studentAnswer: string,
    concept: Concept
  ): Promise<{ mistakeType: MistakeClassification; diagnosis: string; remediation: string }>;
  generateRemediation(
    concept: Concept,
    question: Question,
    studentAnswer: string,
    diagnosisType: FailureDiagnosisType
  ): Promise<RemediationPayload>;
}

