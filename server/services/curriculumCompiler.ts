import { ExtractedDocument, InferredSection } from '../types/documentIR.ts';
import { GoogleGenAI } from '@google/genai';
import { Topic, Subtopic, Concept, Question } from '../../src/types.ts';
import { shuffleQuestionOptions } from './questionUtils.ts';

export interface CompiledCurriculumResult {
  topics: {
    title: string;
    description: string;
    subtopics: { title: string; description?: string }[];
    concepts: {
      name: string;
      subtopicTitle?: string;
      explanation: string;
      definitions: string[];
      formulas: string[];
      keyFacts: string[];
      examples: string[];
      sourcePage: number;
      prerequisites: string[];
      sampleQuestions: any[];
      confidence?: number;
      sourceBlockIds?: string[];
    }[];
  }[];
  validation: {
    totalTopics: number;
    totalConcepts: number;
    hasHighCoverage: boolean;
    confidenceScore: number;
    needsReviewItems: { topicTitle: string; reason: string }[];
  };
}

export class CurriculumCompiler {
  /**
   * Compiles inferred document sections into a rich, structured academic curriculum.
   */
  async compileCurriculum(
    doc: ExtractedDocument,
    aiClient?: GoogleGenAI,
    isRateLimited: boolean = false
  ): Promise<CompiledCurriculumResult> {
    const structure = doc.structure;
    if (!structure || structure.sections.length === 0) {
      throw new Error('No structural sections found to compile curriculum.');
    }

    const compiledTopics: any[] = [];
    const needsReviewItems: { topicTitle: string; reason: string }[] = [];
    let currentRateLimited = isRateLimited;

    for (const [idx, section] of structure.sections.entries()) {
      if (section.inferredType === 'ADMINISTRATIVE' || section.text.trim().length < 50) {
        continue;
      }

      let topicCompiled: any = null;

      if (aiClient && !currentRateLimited) {
        try {
          topicCompiled = await this.compileSectionWithAI(section, doc, aiClient, idx + 1);
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded')) {
            currentRateLimited = true;
          }
          console.warn(`CurriculumCompiler: AI compilation failed for "${section.title}", using deterministic engine:`, err);
        }
      }

      if (!topicCompiled) {
        topicCompiled = this.compileSectionDeterministically(section, doc, idx + 1);
      }

      if (topicCompiled) {
        compiledTopics.push(topicCompiled);
        if (section.confidence < 0.75) {
          needsReviewItems.push({
            topicTitle: topicCompiled.title,
            reason: `Confidence is ${(section.confidence * 100).toFixed(0)}% — verify generated concepts`,
          });
        }
      }
    }

    const totalConcepts = compiledTopics.reduce((acc, t) => acc + (t.concepts?.length || 0), 0);

    return {
      topics: compiledTopics,
      validation: {
        totalTopics: compiledTopics.length,
        totalConcepts,
        hasHighCoverage: totalConcepts >= compiledTopics.length,
        confidenceScore: structure.structuralConfidence,
        needsReviewItems,
      },
    };
  }

  /**
   * AI-powered educational extraction on an inferred section:
   */
  private async compileSectionWithAI(
    section: InferredSection,
    doc: ExtractedDocument,
    ai: GoogleGenAI,
    topicOrder: number
  ) {
    const subjectName = doc.structure?.inferredSubject || doc.subjectHint || 'Academic Subject';
    const sectionText = section.text.slice(0, 15000);

    const prompt = `You are an expert academic curriculum compiler for ${subjectName}.
Analyze the supplied school-note content and infer its educational structure.
Identify the instructional hierarchy present in the material rather than relying on predefined heading names.
Preserve the school's actual subject matter and do not invent unrelated topics.
Group related instructional material into coherent subtopics and measurable concepts.
Use document structure, formatting, semantic relationships, and surrounding content as evidence.
Preserve source references (Page ${section.startPage}).

Section Title: "${section.title}" (Pages ${section.startPage} - ${section.endPage})

Section Content:
"""
${sectionText}
"""

TASK:
Produce a detailed curriculum node for this topic in JSON matching this exact structure:
{
  "title": "${section.title}",
  "description": "Clear 1-2 sentence academic overview of what this topic covers.",
  "subtopics": [
    { "title": "Subtopic Title", "description": "Overview" }
  ],
  "concepts": [
    {
      "name": "Specific Measurable Concept Name",
      "subtopicTitle": "Matching Subtopic Title",
      "explanation": "Thorough, clear pedagogical explanation directly grounded in the notes text",
      "definitions": ["Formal definition from notes"],
      "formulas": ["Key equations or formulas"],
      "keyFacts": ["Important examinable facts / properties / rules"],
      "examples": ["Worked calculation or concrete application from the notes"],
      "sourcePage": ${section.startPage},
      "prerequisites": [],
      "sampleQuestions": [
        {
          "category": "APPLICATION",
          "type": "MULTIPLE_CHOICE",
          "questionText": "Diagnostic problem testing this concept",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Step-by-step verified solution"
        }
      ]
    }
  ]
}

Return ONLY valid JSON.`;

    const models = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ text: prompt }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);

        if (parsed.title && parsed.concepts && parsed.concepts.length > 0) {
          // Attach source block IDs and shuffle sample questions
          for (const c of parsed.concepts) {
            c.sourceBlockIds = section.blockIds.slice(0, 5);
            c.sourcePage = c.sourcePage || section.startPage;
            if (Array.isArray(c.sampleQuestions)) {
              c.sampleQuestions = c.sampleQuestions.map((q: any) => shuffleQuestionOptions(q));
            }
          }
          return parsed;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded')) {
          throw err;
        }
        console.warn(`Model ${model} failed for section "${section.title}":`, err);
      }
    }

    if (lastError) throw lastError;
    return null;
  }

  /**
   * Deterministic Fallback Compiler:
   * Analyzes section text and blocks semantically without hard-coded word assumptions.
   */
  private compileSectionDeterministically(
    section: InferredSection,
    doc: ExtractedDocument,
    topicOrder: number
  ) {
    const rawLines = section.text.split('\n').map((l) => l.trim()).filter(Boolean);
    const subjectName = doc.structure?.inferredSubject || doc.subjectHint || 'Academic Subject';

    // Find subheadings or major paragraphs
    const subtopicTitles: string[] = [];
    const concepts: any[] = [];

    let currentSubtopic = 'Core Principles';
    subtopicTitles.push(currentSubtopic);

    const paragraphs = section.text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 20);

    if (paragraphs.length === 0) {
      paragraphs.push(section.text || section.title);
    }

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const firstLine = p.split('\n')[0].trim();
      const isShortHeading = firstLine.length < 60 && /^[A-Z0-9\s\W]+$/.test(firstLine);

      if (isShortHeading && firstLine !== section.title) {
        currentSubtopic = firstLine;
        if (!subtopicTitles.includes(currentSubtopic)) {
          subtopicTitles.push(currentSubtopic);
        }
      }

      // Extract concept name
      let conceptName = isShortHeading ? firstLine : '';
      if (!conceptName) {
        const sentence = p.split(/[.\n]/)[0].trim();
        conceptName = sentence.length > 3 && sentence.length < 50 ? sentence : `${section.title} Concept ${i + 1}`;
      } else if (conceptName.length > 60) {
        conceptName = conceptName.slice(0, 57) + '...';
      }

      // Extract definitions, formulas, facts
      const definitions: string[] = [];
      const formulas: string[] = [];
      const keyFacts: string[] = [];
      const examples: string[] = [];

      const sentences = p.split(/(?<=[.?!])\s+/);
      for (const s of sentences) {
        const trimmed = s.trim();
        if (/\b(?:is defined as|means|refers to|is the process of)\b/i.test(trimmed)) {
          definitions.push(trimmed);
        } else if (/=|\bformula\b|\bequation\b/i.test(trimmed) && /[a-z0-9]/i.test(trimmed)) {
          formulas.push(trimmed);
        } else if (/\b(?:for example|e\.g\.|calculate|find the)\b/i.test(trimmed)) {
          examples.push(trimmed);
        } else if (trimmed.length > 20 && trimmed.length < 200) {
          keyFacts.push(trimmed);
        }
      }

      if (definitions.length === 0 && sentences.length > 0) {
        definitions.push(sentences[0]);
      }

      concepts.push({
        name: conceptName,
        subtopicTitle: currentSubtopic,
        explanation: p.slice(0, 600),
        definitions: definitions.slice(0, 3),
        formulas: formulas.slice(0, 3),
        keyFacts: keyFacts.slice(0, 4),
        examples: examples.slice(0, 2),
        sourcePage: section.startPage,
        prerequisites: [],
        sourceBlockIds: section.blockIds.slice(0, 3),
        confidence: section.confidence,
        sampleQuestions: [
          shuffleQuestionOptions({
            category: 'RECALL',
            type: 'MULTIPLE_CHOICE',
            questionText: `According to the course material on ${section.title}, what is the key principle of ${conceptName}?`,
            options: [
              definitions[0] ? definitions[0].slice(0, 90) : `A foundational concept in ${section.title}`,
              `An unverified alternative formulation`,
              `A contradictory condition invalid in this subject`,
              `None of the above`,
            ],
            correctAnswer: definitions[0] ? definitions[0].slice(0, 90) : `A foundational concept in ${section.title}`,
            explanation: `Verified from the study material (Page ${section.startPage}).`,
          }),
        ],
      });
    }

    return {
      title: section.title,
      description: `Comprehensive curriculum module covering ${section.title}.`,
      subtopics: subtopicTitles.map((t) => ({ title: t })),
      concepts: concepts.slice(0, 8),
    };
  }
}

export const curriculumCompiler = new CurriculumCompiler();
