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
import { shuffleQuestionOptions } from '../services/questionUtils.ts';

export class GroqProvider implements LLMProvider {
  public name = 'Groq';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
  }

  async classifyDocuments(
    docs: { id: string; filename: string; excerpt: string }[]
  ): Promise<{ docId: string; filename: string; subjectName: string; reasoning: string }[]> {
    return docs.map((doc) => ({
      docId: doc.id,
      filename: doc.filename,
      subjectName: 'General Studies',
      reasoning: 'Fallback classification',
    }));
  }

  private async callGroqChat(messages: Array<{ role: string; content: string }>, jsonMode = false): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.2,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async extractCurriculum(
    subjectName: string,
    notesText?: string
  ): Promise<ExtractedCurriculumPayload> {
    const prompt = `You are a school curriculum extraction specialist.
CRITICAL MATHEMATICAL NOTATION MANDATE:
ALL mathematical notation, formulas, equations, variables, symbols, fractions, powers, or chemical expressions MUST BE WRITTEN IN VALID LaTeX DELIMITERS ($ ... $ or $$ ... $$).

Extract a hierarchical academic curriculum from the student's uploaded notes for: "${subjectName}".
Notes snippet:
"""
${(notesText || '').slice(0, 20000)}
"""
Return JSON matching:
{
  "topics": [
    {
      "title": "Topic Title",
      "description": "...",
      "subtopics": [{ "title": "Subtopic Title" }],
      "concepts": [
        {
          "name": "Concept Name",
          "subtopicTitle": "Subtopic Title",
          "explanation": "Clear explanation",
          "definitions": ["..."],
          "formulas": ["..."],
          "keyFacts": ["..."],
          "examples": ["..."],
          "sourcePage": 1
        }
      ]
    }
  ]
}`;

    const text = await this.callGroqChat([{ role: 'user', content: prompt }], true);
    return JSON.parse(text);
  }

  async generateTeaching(
    concept: Concept,
    sourceNotesText?: string
  ): Promise<TeachingContentPayload> {
    const prompt = `You are an expert academic tutor.
Teach this concept grounded directly in the student's school notes:
Subject: ${concept.subjectName || concept.subjectId}
Concept: ${concept.name}
Definitions: ${concept.definitions?.join('; ')}
Formulas: ${concept.formulas?.join('; ')}
Key Facts: ${concept.keyFacts?.join('; ')}
Notes excerpt: ${sourceNotesText?.slice(0, 3000) || concept.explanation}

Provide a clear, engaging explanation (NOT just copying text), 2 simple illustrative examples, essential conditions/rules, and common misconceptions.
Return JSON:
{
  "title": "How and Why ${concept.name} Works",
  "explanation": "Detailed clear markdown explanation...",
  "importantRules": ["Rule 1", "Rule 2"],
  "simpleExamples": ["Example 1 with step by step", "Example 2"],
  "commonMisconceptions": [
    { "mistake": "Common error students make", "clarification": "Why that is wrong and how to think correctly" }
  ],
  "sourceNoteReference": {
    "documentName": "${concept.sourceDocument || 'School Notes'}",
    "page": ${concept.sourcePage || 1}
  }
}`;

    const text = await this.callGroqChat([{ role: 'user', content: prompt }], true);
    return JSON.parse(text);
  }

  async generateQuestion(
    concept: Concept,
    category: QuestionCategory,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    previousMistakes?: string[],
    sourceNotesText?: string
  ): Promise<GeneratedQuestionPayload> {
    const prompt = `Generate a ${difficulty} ${category} question grounded in the school curriculum for:
Concept: ${concept.name}
Formulas/Rules: ${concept.formulas?.join('; ')}
Definitions: ${concept.definitions?.join('; ')}
Notes Context: ${sourceNotesText?.slice(0, 1500) || concept.explanation}
Previous Mistakes to target: ${previousMistakes?.join('; ') || 'None'}

Return JSON:
{
  "category": "${category}",
  "type": "MULTIPLE_CHOICE",
  "questionText": "...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Detailed rationale referencing the notes",
  "distractorDiagnoses": {
    "Option B": "MISCONCEPTION",
    "Option C": "CALCULATION_ERROR",
    "Option D": "KNOWLEDGE_GAP"
  },
  "sourcePage": ${concept.sourcePage || 1}
}`;

    const text = await this.callGroqChat([{ role: 'user', content: prompt }], true);
    const parsed = JSON.parse(text);
    return shuffleQuestionOptions(parsed);
  }

  async generateLesson(concept: Concept, sourceNotesText?: string): Promise<LessonGenerationResult> {
    const teaching = await this.generateTeaching(concept, sourceNotesText);
    const q1 = await this.generateQuestion(concept, 'APPLICATION', 'MEDIUM', undefined, sourceNotesText);
    return {
      steps: [
        {
          stepNumber: 1,
          type: 'EXPLANATION',
          content: teaching.explanation,
        },
        {
          stepNumber: 2,
          type: 'APPLICATION_QUESTION',
          content: 'Application Challenge',
          question: {
            id: `q-groq-${Date.now()}`,
            conceptId: concept.id,
            subjectId: concept.subjectId,
            topicId: concept.topicId,
            category: q1.category,
            type: q1.type,
            questionText: q1.questionText,
            options: q1.options,
            correctAnswer: q1.correctAnswer,
            explanation: q1.explanation,
            distractorDiagnoses: q1.distractorDiagnoses,
            sourcePage: q1.sourcePage,
          },
        },
      ],
    };
  }

  async evaluateOpenAnswer(
    question: Question,
    studentAnswer: string,
    concept: Concept,
    sourceNotesText?: string
  ): Promise<AnswerEvaluationResult> {
    const prompt = `Evaluate student's answer against the school notes:
Question: ${question.questionText}
Model Answer: ${question.correctAnswer}
Student Answer: ${studentAnswer}
Concept: ${concept.name}
Notes context: ${sourceNotesText || concept.explanation}

Return JSON:
{
  "isCorrect": boolean,
  "verdict": "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT" | "AMBIGUOUS",
  "score": number, // 0.0 to 1.0
  "feedback": "Constructive explanation",
  "mistakeType": "KNOWLEDGE_GAP" | "MISCONCEPTION" | "RECALL_FAILURE" | "CALCULATION_ERROR" | "MISREAD" | "CARELESS_ERROR" | "APPLICATION_FAILURE",
  "diagnosis": "Root cause",
  "targetedRemediation": "Rule to follow"
}`;

    const text = await this.callGroqChat([{ role: 'user', content: prompt }], true);
    return JSON.parse(text);
  }

  async diagnoseMistake(
    question: Question,
    studentAnswer: string,
    concept: Concept
  ): Promise<{ mistakeType: MistakeClassification; diagnosis: string; remediation: string }> {
    const prompt = `Diagnose student error:
Question: ${question.questionText}
Expected: ${question.correctAnswer}
Student Answer: ${studentAnswer}
Concept: ${concept.name}

Return JSON:
{
  "mistakeType": "MISCONCEPTION" | "CALCULATION_ERROR" | "KNOWLEDGE_GAP" | "RECALL_FAILURE" | "CARELESS_ERROR",
  "diagnosis": "1-sentence reason",
  "remediation": "1-sentence remediation rule"
}`;

    const text = await this.callGroqChat([{ role: 'user', content: prompt }], true);
    return JSON.parse(text);
  }

  async generateRemediation(
    concept: Concept,
    question: Question,
    studentAnswer: string,
    diagnosisType: FailureDiagnosisType
  ): Promise<RemediationPayload> {
    const prompt = `Generate targeted remediation for a student with diagnosis: ${diagnosisType}
Concept: ${concept.name}
Question: ${question.questionText}
Student Answer: ${studentAnswer}
Correct: ${question.correctAnswer}

Return JSON:
{
  "title": "Targeted Remediation: Clarifying ${concept.name}",
  "mentalModelCorrection": "...",
  "contrastingExample": "...",
  "actionableStep": "..."
}`;

    const text = await this.callGroqChat([{ role: 'user', content: prompt }], true);
    return JSON.parse(text);
  }
}
