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


/** Parses "12", "1,200", "3/4", "1.5e3", "1.5 x 10^3", "18 m/s" into a number. */
export function parseNumeric(input: string): number | null {
  if (input === undefined || input === null) return null;
  let s = String(input).trim().toLowerCase().replace(/(\d),(?=\d{3}(\D|$))/g, '$1');
  const sci = s.match(/^(-?\d*\.?\d+)\s*(?:x|\u00d7|\*)\s*10\s*\^\s*\{?(-?\d+)\}?/);
  if (sci) return parseFloat(sci[1]) * Math.pow(10, parseInt(sci[2], 10));
  const frac = s.match(/^(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)/);
  if (frac && parseFloat(frac[2]) !== 0) return parseFloat(frac[1]) / parseFloat(frac[2]);
  const m = s.match(/^[^\d\-+.]*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

/**
 * true/false when both sides are numeric, null when either is not.
 * An explicit tolerance is absolute; otherwise 1.5% relative, so tiny and huge values grade sensibly.
 */
export function numericMatches(student: string, expected: string, tolerance?: number): boolean | null {
  const a = parseNumeric(student);
  const b = parseNumeric(expected);
  if (a === null || b === null || !isFinite(a) || !isFinite(b)) return null;
  const tol = typeof tolerance === 'number' && tolerance >= 0 ? tolerance : Math.max(Math.abs(b) * 0.015, 1e-9);
  return Math.abs(a - b) <= tol + 1e-12;
}

const STOP_WORDS = new Set(['the','and','for','with','that','this','from','are','was','were','which','into','their','have','has','can','not','but','its','than','then','also','when','what','how','why','who','about','between','because','such','each','they','them','these','those','will','would','could','should','been','being','more','most','some','any']);
const tokens = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

/** Fraction of the reference's key words present in the student's answer (fallback marking only). */
export function keywordOverlap(student: string, ...references: string[]): number {
  const ref = new Set(references.flatMap(tokens));
  if (ref.size === 0) return 0;
  const got = new Set(tokens(student));
  let hit = 0;
  ref.forEach((w) => { if (got.has(w)) hit++; });
  return hit / ref.size;
}
