import { Question, Concept, QuestionCategory } from '../../src/types.ts';

/**
 * Shuffles the options array of a multiple-choice question using Fisher-Yates,
 * ensuring that the correct answer is randomly positioned among A, B, C, D.
 */
export function shuffleQuestionOptions<T extends { options?: string[]; correctAnswer: string }>(q: T): T {
  if (!q || !Array.isArray(q.options) || q.options.length <= 1) {
    return q;
  }

  const cleanCorrect = (q.correctAnswer || '').trim();
  let cleanOptions = q.options.map((opt) => (opt || '').trim()).filter((opt) => opt.length > 0);

  // Guarantee cleanCorrect is in options
  const exists = cleanOptions.some((opt) => opt.toLowerCase() === cleanCorrect.toLowerCase());
  if (!exists && cleanCorrect.length > 0) {
    cleanOptions[0] = cleanCorrect;
  }

  // Fisher-Yates shuffle
  const shuffled = [...cleanOptions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    ...q,
    options: shuffled,
  };
}

/**
 * Detects if a subject is predominantly mathematical/calculation-heavy.
 */
export function isCalculationSubject(subjectName?: string, formulas?: string[]): boolean {
  if (formulas && formulas.length > 0 && formulas.some((f) => f && f.trim().length > 0)) {
    return true;
  }
  if (!subjectName) return false;
  const lower = subjectName.toLowerCase();
  return (
    lower.includes('math') ||
    lower.includes('calculus') ||
    lower.includes('algebra') ||
    lower.includes('physics') ||
    lower.includes('arithmetic') ||
    lower.includes('statistics') ||
    lower.includes('geometry') ||
    lower.includes('accounting')
  );
}

/**
 * Generates subject-grounded fallback questions when AI calls are rate-limited or unavailable.
 */
export function generateSubjectAwareFallbackQuestion(
  concept: {
    id: string;
    name: string;
    subjectName?: string;
    subjectId?: string;
    topicId?: string;
    definitions?: string[];
    formulas?: string[];
    explanation?: string;
    keyFacts?: string[];
    sourcePage?: number;
  },
  category: QuestionCategory,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM'
) {
  const subjectName = concept.subjectName || concept.subjectId || 'Academic Subject';
  const isMath = isCalculationSubject(subjectName, concept.formulas);
  
  const correctText =
    (category === 'RECALL' ? (concept.definitions?.[0] || concept.formulas?.[0]) : null) ||
    concept.keyFacts?.[0] ||
    (category === 'RECALL' ? concept.formulas?.[0] : null) ||
    `Systematically analyze variables, apply standard properties, and enforce all boundary constraints.`;

  let questionText = '';
  let distractors: string[] = [];

  if (category === 'RECALL') {
    questionText = `According to the official ${subjectName} notes, what is the core principle or definition for ${concept.name}?`;

    if (isMath) {
      distractors = [
        `Inverting the terms to form a reciprocal relationship without altering sign`,
        `Summing arbitrary terms regardless of base compatibility`,
        `Equating the variable to 1 under all boundary conditions`,
      ];
    } else {
      distractors = [
        `Conflating ${concept.name} with an alternative ${subjectName} process or unrelated classification`,
        `Applying general definitions without accounting for specific ${subjectName} environmental or structural conditions`,
        `Disregarding standard nomenclature and regulatory guidelines established in the notes`,
      ];
    }
  } else {
    questionText = `In a standard ${subjectName} examination scenario testing ${concept.name}, which statement or procedure is correct?`;

    if (isMath) {
      distractors = [
        `Multiply powers when terms with equal bases are being added`,
        `Omit the sign alteration during reciprocal transformations`,
        `Disregard fractional powers during polynomial division`,
      ];
    } else {
      distractors = [
        `Confusing primary cause and effect mechanisms or structural stages in ${concept.name}`,
        `Applying general principles without verifying initial syllabus preconditions for ${subjectName}`,
        `Overlooking key environmental, physiological, or contextual factors specific to ${concept.name}`,
      ];
    }
  }

  const rawOptions = [correctText, ...distractors];
  const distractorDiagnoses: Record<string, any> = {
    [distractors[0]]: 'MISCONCEPTION',
    [distractors[1]]: 'KNOWLEDGE_GAP',
    [distractors[2]]: 'CARELESS_ERROR',
  };

  return shuffleQuestionOptions({
    category,
    type: 'MULTIPLE_CHOICE' as const,
    questionText,
    options: rawOptions,
    correctAnswer: correctText,
    explanation: `Verified from official ${subjectName} syllabus notes for ${concept.name}: ${concept.explanation ? concept.explanation.slice(0, 160) : 'Standard course principle.'}`,
    distractorDiagnoses,
    sourcePage: concept.sourcePage || 1,
  });
}
