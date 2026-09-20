import { MistakeRecord, Question, MistakeClassification, Concept } from '../../src/types.ts';
import { storage } from '../storage.ts';
import { aiProvider } from '../ai/geminiProvider.ts';

export class MistakeService {
  public async recordMistake(
    question: Question,
    concept: Concept,
    studentAnswer: string,
    providedMistakeType?: MistakeClassification,
    providedDiagnosis?: string,
    providedRemediation?: string
  ): Promise<MistakeRecord> {
    let mistakeType: MistakeClassification = providedMistakeType || 'MISCONCEPTION';
    let diagnosis = providedDiagnosis;
    let remediation = providedRemediation;

    if (!diagnosis || !remediation) {
      // Deterministic classification first for basic types
      if (question.type === 'NUMERICAL') {
        const studentNum = parseFloat(studentAnswer);
        const expectedNum = parseFloat(question.correctAnswer);
        if (!isNaN(studentNum) && !isNaN(expectedNum)) {
          mistakeType = 'CALCULATION_ERROR';
          diagnosis = `Calculation yielded ${studentAnswer} instead of the expected ${question.correctAnswer} ${question.units || ''}.`;
          remediation = `Double-check intermediate arithmetic steps and unit conversion for ${concept.name}.`;
        }
      }

      if (!diagnosis) {
        const aiDiag = await aiProvider.diagnoseMistake(question, studentAnswer, concept);
        mistakeType = providedMistakeType || aiDiag.mistakeType;
        diagnosis = aiDiag.diagnosis;
        remediation = aiDiag.remediation;
      }
    }

    const record: MistakeRecord = {
      id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      questionId: question.id,
      conceptId: concept.id,
      topicId: concept.topicId,
      subjectId: concept.subjectId,
      conceptName: concept.name,
      questionText: question.questionText,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      mistakeType,
      diagnosis: diagnosis || 'Response failed to satisfy the curriculum standard.',
      targetedRemediation: remediation || question.explanation,
      timestamp: new Date().toISOString(),
      resolved: false,
      resolutionAttempts: 0,
      nextReviewDate: new Date().toISOString(),
    };

    storage.addMistake(record);
    return record;
  }

  public getUnresolvedMistakes(subjectId?: string): MistakeRecord[] {
    const list = storage.getMistakes(false);
    if (subjectId) {
      return list.filter((m) => m.subjectId === subjectId);
    }
    return list;
  }

  public getMistakeStats(subjectId?: string) {
    const all = storage.getMistakes();
    const filtered = subjectId ? all.filter((m) => m.subjectId === subjectId) : all;
    const unresolved = filtered.filter((m) => !m.resolved);

    const byType: Record<string, number> = {};
    for (const m of unresolved) {
      byType[m.mistakeType] = (byType[m.mistakeType] || 0) + 1;
    }

    return {
      totalRecorded: filtered.length,
      unresolvedCount: unresolved.length,
      resolvedCount: filtered.length - unresolved.length,
      byType,
    };
  }
}

export const mistakeService = new MistakeService();
