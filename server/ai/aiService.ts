import {
  Concept,
  Question,
  QuestionCategory,
  FailureDiagnosisType,
  MistakeClassification,
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
import { GeminiProvider } from './geminiProvider.ts';
import { GroqProvider } from './groqProvider.ts';

export class AIService implements LLMProvider {
  public name = 'Orchestrated AIService (Gemini -> Groq -> Deterministic)';
  private gemini: GeminiProvider;
  private groq: GroqProvider;

  constructor() {
    this.gemini = new GeminiProvider();
    this.groq = new GroqProvider();
  }

  private hasGroq(): boolean {
    return Boolean(process.env.GROQ_API_KEY);
  }

  async classifyDocuments(
    docs: { id: string; filename: string; excerpt: string }[]
  ): Promise<{ docId: string; filename: string; subjectName: string; reasoning: string }[]> {
    return this.gemini.classifyDocuments(docs);
  }

  async extractCurriculum(
    subjectName: string,
    notesText?: string,
    pdfBuffer?: Buffer
  ): Promise<ExtractedCurriculumPayload> {
    try {
      return await this.gemini.extractCurriculum(subjectName, notesText, pdfBuffer);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.extractCurriculum(subjectName, notesText);
        } catch (groqErr) {
          console.warn('Groq extractCurriculum failed, using fallback:', groqErr);
        }
      }
      return await this.gemini.extractCurriculum(subjectName, notesText);
    }
  }

  async generateTeaching(
    concept: Concept,
    sourceNotesText?: string,
    studentMastery?: number
  ): Promise<TeachingContentPayload> {
    try {
      return await this.gemini.generateTeaching(concept, sourceNotesText, studentMastery);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateTeaching(concept, sourceNotesText);
        } catch {
          // ignore
        }
      }
      throw geminiErr;
    }
  }

  async generateQuestion(
    concept: Concept,
    category: QuestionCategory,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    previousMistakes?: string[],
    sourceNotesText?: string
  ): Promise<GeneratedQuestionPayload> {
    try {
      return await this.gemini.generateQuestion(concept, category, difficulty, previousMistakes, sourceNotesText);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateQuestion(concept, category, difficulty, previousMistakes, sourceNotesText);
        } catch {
          // ignore
        }
      }
      throw geminiErr;
    }
  }

  async generateLesson(concept: Concept, sourceNotesText?: string): Promise<LessonGenerationResult> {
    try {
      return await this.gemini.generateLesson(concept, sourceNotesText);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateLesson(concept, sourceNotesText);
        } catch {
          // ignore
        }
      }
      throw geminiErr;
    }
  }

  async evaluateOpenAnswer(
    question: Question,
    studentAnswer: string,
    concept: Concept,
    sourceNotesText?: string
  ): Promise<AnswerEvaluationResult> {
    try {
      return await this.gemini.evaluateOpenAnswer(question, studentAnswer, concept, sourceNotesText);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.evaluateOpenAnswer(question, studentAnswer, concept, sourceNotesText);
        } catch {
          // ignore
        }
      }
      throw geminiErr;
    }
  }

  async diagnoseMistake(
    question: Question,
    studentAnswer: string,
    concept: Concept
  ): Promise<{ mistakeType: MistakeClassification; diagnosis: string; remediation: string }> {
    try {
      return await this.gemini.diagnoseMistake(question, studentAnswer, concept);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.diagnoseMistake(question, studentAnswer, concept);
        } catch {
          // ignore
        }
      }
      throw geminiErr;
    }
  }

  async generateRemediation(
    concept: Concept,
    question: Question,
    studentAnswer: string,
    diagnosisType: FailureDiagnosisType
  ): Promise<RemediationPayload> {
    try {
      return await this.gemini.generateRemediation(concept, question, studentAnswer, diagnosisType);
    } catch (geminiErr) {
      if (this.hasGroq()) {
        try {
          return await this.groq.generateRemediation(concept, question, studentAnswer, diagnosisType);
        } catch {
          // ignore
        }
      }
      throw geminiErr;
    }
  }
}

export const aiService = new AIService();
