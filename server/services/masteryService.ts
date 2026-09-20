import { ConceptMastery, QuestionCategory, Attempt } from '../../src/types.ts';
import { storage } from '../storage.ts';

export interface MasteryEvidenceOptions {
  isDelayedReview?: boolean;
  failureType?: string;
  questionType?: string;
}

export class MasteryService {
  // Configurable evidence deltas (deterministic code control)
  public static readonly EVIDENCE_DELTAS = {
    CORRECT_RECALL: 8,
    CORRECT_APPLICATION: 12,
    CORRECT_CALCULATION: 12,
    CORRECT_DELAYED_REVIEW: 15,
    PENALTY_KNOWLEDGE_GAP: -12,
    PENALTY_MISCONCEPTION: -15,
    PENALTY_CARELESS: -5,
    PENALTY_CALCULATION: -8,
    DEFAULT_PENALTY: -10,
  };

  public static readonly SPACED_INTERVALS = [1, 2, 4, 8, 16, 30];

  /**
   * Deterministically updates concept mastery following an attempt.
   * AI never decides mastery scores; application code decides.
   */
  public updateMasteryOnAttempt(
    conceptId: string,
    isCorrect: boolean,
    category: QuestionCategory,
    attemptScore: number = 1.0,
    options?: MasteryEvidenceOptions
  ): ConceptMastery {
    const existing: ConceptMastery = storage.getMastery(conceptId) || {
      conceptId,
      subjectId: '',
      topicId: '',
      score: 0,
      status: 'UNLEARNED',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0,
      successfulEvidencesCount: 0,
      questionTypesEncountered: [],
      delayedReviewPassed: false,
    };

    const concept = storage.getConcept(conceptId);
    if (concept) {
      existing.subjectId = concept.subjectId;
      existing.topicId = concept.topicId;
    }

    existing.totalAttempts += 1;
    existing.lastPracticed = new Date().toISOString();
    existing.successfulEvidencesCount = existing.successfulEvidencesCount || 0;
    existing.questionTypesEncountered = existing.questionTypesEncountered || [];

    if (options?.questionType && !existing.questionTypesEncountered.includes(options.questionType)) {
      existing.questionTypesEncountered.push(options.questionType);
    }
    if (!existing.questionTypesEncountered.includes(category)) {
      existing.questionTypesEncountered.push(category);
    }

    if (isCorrect) {
      existing.consecutiveCorrect += 1;
      existing.repetitions += 1;
      existing.successfulEvidencesCount += 1;

      // Evidence delta lookup
      let delta = MasteryService.EVIDENCE_DELTAS.CORRECT_APPLICATION;
      if (options?.isDelayedReview) {
        delta = MasteryService.EVIDENCE_DELTAS.CORRECT_DELAYED_REVIEW;
        existing.delayedReviewPassed = true;
        existing.lastReviewDate = new Date().toISOString();
      } else if (category === 'RECALL' || category === 'RECOGNITION') {
        delta = MasteryService.EVIDENCE_DELTAS.CORRECT_RECALL;
      } else if (category === 'CALCULATION') {
        delta = MasteryService.EVIDENCE_DELTAS.CORRECT_CALCULATION;
      }

      const scoreGain = Math.round(delta * attemptScore);
      existing.score = Math.min(100, Math.max(0, existing.score + scoreGain));

      // Spaced review interval progression: 1 -> 2 -> 4 -> 8 -> 16 -> 30 days
      const currentIdx = MasteryService.SPACED_INTERVALS.indexOf(existing.intervalDays);
      if (currentIdx !== -1 && currentIdx < MasteryService.SPACED_INTERVALS.length - 1) {
        existing.intervalDays = MasteryService.SPACED_INTERVALS[currentIdx + 1];
      } else if (currentIdx === -1) {
        existing.intervalDays = MasteryService.SPACED_INTERVALS[0];
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + existing.intervalDays);
      existing.nextReviewDue = nextDate.toISOString();
    } else {
      existing.totalMistakes += 1;
      existing.consecutiveCorrect = 0;

      // Penalty delta based on diagnosed failure type
      let penalty = MasteryService.EVIDENCE_DELTAS.DEFAULT_PENALTY;
      if (options?.failureType === 'KNOWLEDGE_GAP') {
        penalty = MasteryService.EVIDENCE_DELTAS.PENALTY_KNOWLEDGE_GAP;
      } else if (options?.failureType === 'MISCONCEPTION') {
        penalty = MasteryService.EVIDENCE_DELTAS.PENALTY_MISCONCEPTION;
      } else if (options?.failureType === 'CARELESS_ERROR' || options?.failureType === 'MISREAD') {
        penalty = MasteryService.EVIDENCE_DELTAS.PENALTY_CARELESS;
      } else if (options?.failureType === 'CALCULATION_ERROR') {
        penalty = MasteryService.EVIDENCE_DELTAS.PENALTY_CALCULATION;
      }

      // Decrement score without completely zeroing valid prior understanding
      existing.score = Math.max(5, existing.score + penalty);

      // Spaced review reset on incorrect attempt: reset interval to 1 day
      existing.intervalDays = 1;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      existing.nextReviewDue = nextDate.toISOString();
    }

    // Deterministic status evaluation:
    // Mastered requires:
    // score >= 80
    // + at least 3 successful evidences
    // + at least 2 distinct question types
    // + at least 1 successful delayed review (or high sustained consecutive performance if initial learn)
    const distinctTypesCount = existing.questionTypesEncountered.length;
    const hasEnoughEvidence = (existing.successfulEvidencesCount || 0) >= 3;
    const hasMultiTypes = distinctTypesCount >= 2;
    const hasDelayedOrSustained = existing.delayedReviewPassed || (existing.consecutiveCorrect >= 4 && existing.score >= 85);

    if (existing.score >= 80 && hasEnoughEvidence && hasMultiTypes && hasDelayedOrSustained) {
      existing.status = 'MASTERED';
    } else if (existing.score >= 60) {
      existing.status = 'DEVELOPING';
    } else if (existing.score >= 20 || existing.totalAttempts > 0) {
      existing.status = 'LEARNING';
    } else {
      existing.status = 'UNLEARNED';
    }

    storage.updateMastery(existing);
    return existing;
  }

  /**
   * Aggregate curriculum progress metrics
   */
  public getCurriculumMetrics(subjectId?: string) {
    const concepts = storage.getConcepts(undefined, subjectId);
    const allMastery = storage.getAllMastery();

    const totalConcepts = concepts.length;
    if (totalConcepts === 0) {
      return {
        totalConcepts: 0,
        coveredConcepts: 0,
        masteredConcepts: 0,
        developingConcepts: 0,
        learningConcepts: 0,
        unlearnedConcepts: 0,
        coveragePercentage: 0,
        masteryPercentage: 0,
        averageMasteryScore: 0,
        overdueReviewsCount: 0,
      };
    }

    let covered = 0;
    let mastered = 0;
    let developing = 0;
    let learning = 0;
    let unlearned = 0;
    let totalScore = 0;
    let overdueCount = 0;
    const now = new Date().toISOString();

    for (const c of concepts) {
      const m = allMastery[c.id];
      if (!m || m.status === 'UNLEARNED' || m.totalAttempts === 0) {
        unlearned++;
      } else {
        covered++;
        totalScore += m.score;
        if (m.status === 'MASTERED') mastered++;
        else if (m.status === 'DEVELOPING') developing++;
        else if (m.status === 'LEARNING') learning++;

        if (m.nextReviewDue && m.nextReviewDue <= now) {
          overdueCount++;
        }
      }
    }

    return {
      totalConcepts,
      coveredConcepts: covered,
      masteredConcepts: mastered,
      developingConcepts: developing,
      learningConcepts: learning,
      unlearnedConcepts: unlearned,
      coveragePercentage: Math.round((covered / totalConcepts) * 100),
      masteryPercentage: Math.round((mastered / totalConcepts) * 100),
      averageMasteryScore: covered > 0 ? Math.round(totalScore / totalConcepts) : 0,
      overdueReviewsCount: overdueCount,
    };
  }

  /**
   * Retrieves all concepts whose spaced review interval is due.
   */
  public getDueReviews(subjectId?: string) {
    const concepts = storage.getConcepts(undefined, subjectId);
    const allMastery = storage.getAllMastery();
    const now = new Date().toISOString();

    return concepts
      .filter((c) => {
        const m = allMastery[c.id];
        return m && m.totalAttempts > 0 && m.nextReviewDue && m.nextReviewDue <= now;
      })
      .map((c) => ({
        concept: c,
        mastery: allMastery[c.id],
      }))
      .sort((a, b) => (a.mastery.score || 0) - (b.mastery.score || 0)); // Weakest first
  }
}

export const masteryService = new MasteryService();
