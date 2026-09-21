import { DailyStudyPlan, StudyPlanItem } from '../../src/types.ts';
import { storage } from '../storage.ts';
import { masteryService } from './masteryService.ts';

export class PlannerService {
  /**
   * Algorithmically generates a balanced daily study plan based on:
   * 1. Overdue spaced repetition items (Retention)
   * 2. Active mistakes needing remediation (Mistake Bank)
   * 3. Unlearned concepts needing curriculum coverage (Coverage)
   * 4. Weak developing concepts needing practice (Mastery)
   */
  /** A cached plan is rebuilt when the daily target changed or its "learn" task was already studied. */
  private isStale(plan: DailyStudyPlan, targetMinutes: number): boolean {
    if (plan.targetMinutes !== targetMinutes) return true;
    const mastery = storage.getAllMastery();
    return plan.items.some(
      (i) => !i.completed && i.type === 'NEW_LEARN' && i.conceptId && (mastery[i.conceptId]?.totalAttempts || 0) > 0
    );
  }

  public generateDailyPlan(targetMinutes: number = 90, dateStr?: string): DailyStudyPlan {
    const today = dateStr || new Date().toISOString().split('T')[0];

    // Check if an existing plan for today was already generated
    const existing = storage.getDailyPlan(today);
    if (existing && existing.items.length > 0 && !this.isStale(existing, targetMinutes)) {
      return existing;
    }
    // Keep anything already completed today when the plan is rebuilt.
    const carried = (existing?.items || []).filter((i) => i.completed);

    const items: StudyPlanItem[] = [];
    let allocatedMinutes = 0;

    const allConcepts = storage.getConcepts();
    const allMastery = storage.getAllMastery();
    const subjects = storage.getSubjects();
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    const dueReviews = masteryService.getDueReviews();
    const unresolvedMistakes = storage.getMistakes(false);

    // 1. ALLOCATE SPACED RETRIEVAL / DUE REVIEWS (Retention Priority)
    if (dueReviews.length > 0 && allocatedMinutes < targetMinutes) {
      const reviewConcept = dueReviews[0].concept;
      const minutes = Math.min(25, Math.max(15, Math.round(targetMinutes * 0.25)));
      items.push({
        id: `plan-rev-${Date.now()}-1`,
        type: 'SPACED_REVIEW',
        subjectId: reviewConcept.subjectId,
        subjectName: subjectMap.get(reviewConcept.subjectId) || 'Subject',
        topicId: reviewConcept.topicId,
        conceptId: reviewConcept.id,
        title: `Spaced Retrieval: ${reviewConcept.name}`,
        description: `Scheduled review due according to your forgetting curve. Reinforce durable retention.`,
        estimatedMinutes: minutes,
        completed: false,
        priority: 'HIGH',
        reason: 'Interval due to prevent memory decay',
      });
      allocatedMinutes += minutes;
    }

    // 2. ALLOCATE MISTAKE REMEDIATION (Mistake Bank Priority)
    if (unresolvedMistakes.length > 0 && allocatedMinutes < targetMinutes) {
      const mistake = unresolvedMistakes[0];
      const minutes = Math.min(20, Math.max(15, Math.round(targetMinutes * 0.2)));
      items.push({
        id: `plan-mistake-${Date.now()}-2`,
        type: 'MISTAKE_REMEDIATION',
        subjectId: mistake.subjectId,
        subjectName: subjectMap.get(mistake.subjectId) || 'Subject',
        topicId: mistake.topicId,
        conceptId: mistake.conceptId,
        title: `Mistake Remediation: ${mistake.conceptName}`,
        description: `Targeted practice to resolve ${mistake.mistakeType}: "${mistake.diagnosis.slice(0, 80)}..."`,
        estimatedMinutes: minutes,
        completed: false,
        priority: 'HIGH',
        reason: 'Unresolved mistake from previous practice session',
      });
      allocatedMinutes += minutes;
    }

    // 3. ALLOCATE NEW CURRICULUM COVERAGE (Progress toward 100% curriculum coverage)
    const unlearnedConcepts = allConcepts.filter((c) => {
      const m = allMastery[c.id];
      return !m || m.status === 'UNLEARNED' || m.totalAttempts === 0;
    });

    if (unlearnedConcepts.length > 0 && allocatedMinutes < targetMinutes) {
      const nextConcept = unlearnedConcepts[0];
      const minutes = Math.min(30, targetMinutes - allocatedMinutes);
      items.push({
        id: `plan-new-${Date.now()}-3`,
        type: 'NEW_LEARN',
        subjectId: nextConcept.subjectId,
        subjectName: subjectMap.get(nextConcept.subjectId) || 'Subject',
        topicId: nextConcept.topicId,
        conceptId: nextConcept.id,
        title: `New Concept: ${nextConcept.name}`,
        description: `Interactive lesson grounded in ${nextConcept.sourceDocument}. Build initial comprehension.`,
        estimatedMinutes: minutes,
        completed: false,
        priority: 'MEDIUM',
        reason: 'Untouched curriculum material required for term examination',
      });
      allocatedMinutes += minutes;
    }

    // 4. ALLOCATE MIXED RETRIEVAL / TOPIC ASSESSMENT
    if (allocatedMinutes < targetMinutes) {
      const remainingMinutes = targetMinutes - allocatedMinutes;
      const practicedConcepts = allConcepts.filter((c) => (allMastery[c.id]?.totalAttempts || 0) > 0);
      const sampleSubject = practicedConcepts[0]?.subjectId || subjects[0]?.id || 'sub-physics';

      items.push({
        id: `plan-test-${Date.now()}-4`,
        type: 'MIXED_RETRIEVAL',
        subjectId: sampleSubject,
        subjectName: subjectMap.get(sampleSubject) || 'Mixed Subjects',
        title: 'Mixed Topic Check & Active Application',
        description: 'Cumulative test across covered concepts to verify independent problem-solving ability.',
        estimatedMinutes: remainingMinutes,
        completed: false,
        priority: 'MEDIUM',
        reason: 'Simulate examination conditions and interleaving',
      });
      allocatedMinutes += remainingMinutes;
    }

    const carriedKeys = new Set(carried.map((i) => `${i.type}:${i.conceptId || ''}`));
    const fresh = items.filter((i) => i.type === 'MIXED_RETRIEVAL' || !carriedKeys.has(`${i.type}:${i.conceptId || ''}`));

    const plan: DailyStudyPlan = {
      date: today,
      targetMinutes,
      items: [...carried, ...fresh],
      summary: `Targeting ${targetMinutes} min: balanced across spaced review, mistake correction, and new curriculum coverage.`,
      completedMinutes: carried.reduce((sum, i) => sum + i.estimatedMinutes, 0),
    };

    storage.saveDailyPlan(plan);
    return plan;
  }
}

export const plannerService = new PlannerService();
