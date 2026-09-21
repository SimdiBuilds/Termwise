import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Subject,
  Topic,
  Concept,
  SourceDocument,
  Question,
  Attempt,
  MistakeRecord,
  ConceptMastery,
  DailyStudyPlan,
  TestRecord,
} from '../src/types.ts';
import {
  FURTHER_MATH_SUBJECT,
  FURTHER_MATH_DOCUMENT,
  FURTHER_MATH_TOPICS,
  FURTHER_MATH_CONCEPTS,
  FURTHER_MATH_QUESTIONS,
} from './data/furtherMathCurriculum.ts';

// Serverless hosts (Vercel) only allow writes under /tmp; durable state lives in Supabase there.
const DATA_DIR = process.env.VERCEL ? '/tmp/termwise-data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Supabase Client Initialization (Lazy)
function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return null;
}

interface DatabaseSchema {
  subjects: Subject[];
  topics: Topic[];
  concepts: Concept[];
  documents: SourceDocument[];
  questions: Question[];
  attempts: Attempt[];
  mistakes: MistakeRecord[];
  mastery: Record<string, ConceptMastery>; // keyed by conceptId
  dailyPlans: Record<string, DailyStudyPlan>;
  sessions?: Record<string, any>; // keyed by YYYY-MM-DD
  testRecords: TestRecord[];
  settings: {
    termStartDate: string;
    termEndDate: string;
    targetStudyMinutesPerDay: number;
    masteryThreshold: number;
    onboardingCompleted: boolean;
  };
}

// Initial seed curriculum grounded in authentic secondary/collegiate school notes
const SEED_DATA: DatabaseSchema = {
  subjects: [
    FURTHER_MATH_SUBJECT,
    {
      id: 'sub-physics',
      name: 'Physics: Mechanics & Energy',
      code: 'PHY-101',
      description: 'Kinematics, Newton’s Laws of Motion, Work, Energy, Momentum and Gravitation based on school term syllabus.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sub-chemistry',
      name: 'Chemistry: Structure & Stoichiometry',
      code: 'CHM-101',
      description: 'Atomic structure, periodic trends, chemical bonding, stoichiometry, and mole calculations.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sub-biology',
      name: 'Biology: Cell Biology & Genetics',
      code: 'BIO-101',
      description: 'Cellular ultrastructure, membrane transport, cell division (mitosis/meiosis), and Mendelian inheritance.',
      createdAt: new Date().toISOString(),
    },
  ],
  topics: [
    ...FURTHER_MATH_TOPICS,
    // Physics
    {
      id: 'top-kinematics',
      subjectId: 'sub-physics',
      title: 'Kinematics in One Dimension',
      order: 1,
      description: 'Displacement, velocity, acceleration, and equations of uniformly accelerated motion.',
    },
    {
      id: 'top-dynamics',
      subjectId: 'sub-physics',
      title: 'Dynamics & Newton’s Laws',
      order: 2,
      description: 'Force, inertia, mass, Newton’s three laws of motion, and free-body diagrams.',
    },
    // Chemistry
    {
      id: 'top-atomic',
      subjectId: 'sub-chemistry',
      title: 'Atomic Structure & Isotopes',
      order: 1,
      description: 'Subatomic particles, atomic number, mass number, isotopes, and relative atomic mass.',
    },
    {
      id: 'top-stoichiometry',
      subjectId: 'sub-chemistry',
      title: 'The Mole Concept & Stoichiometry',
      order: 2,
      description: 'Avogadro’s constant, molar mass, empirical formulas, and stoichiometric calculations.',
    },
    // Biology
    {
      id: 'top-cells',
      subjectId: 'sub-biology',
      title: 'Cell Structure & Organelles',
      order: 1,
      description: 'Eukaryotic vs prokaryotic cells, organelle functions, and membrane boundaries.',
    },
  ],
  concepts: [
    ...FURTHER_MATH_CONCEPTS,
    // Physics - Kinematics
    {
      id: 'c-displacement-velocity',
      topicId: 'top-kinematics',
      subjectId: 'sub-physics',
      name: 'Displacement, Velocity & Acceleration',
      explanation: 'Displacement is the vector change in position (Δx). Velocity is the rate of change of displacement with respect to time (v = Δx/Δt). Acceleration is the rate of change of velocity (a = Δv/Δt). Uniform acceleration implies a constant rate of change in velocity over time.',
      definitions: [
        'Displacement: A vector quantity representing the shortest straight-line distance from an initial position to a final position with direction.',
        'Velocity: Vector rate of change of position, v = dx/dt.',
        'Acceleration: Vector rate of change of velocity, a = dv/dt.',
      ],
      formulas: ['v = Δx / Δt', 'a = Δv / Δt'],
      keyFacts: [
        'Speed is a scalar; velocity is a vector.',
        'Zero velocity does not necessarily imply zero acceleration (e.g., top of a vertical projectile trajectory).',
      ],
      examples: [
        'A runner completing one full 400m circular track lap has a distance of 400m but a displacement of 0m.',
      ],
      sourceDocument: 'Physics_Term1_OfficialNotes.pdf',
      sourcePage: 4,
      order: 1,
      prerequisiteConceptIds: [],
    },
    {
      id: 'c-suvat-equations',
      topicId: 'top-kinematics',
      subjectId: 'sub-physics',
      name: 'Equations of Uniform Acceleration (SUVAT)',
      explanation: 'When acceleration is strictly constant, motion can be resolved using the five kinematic variables: s (displacement), u (initial velocity), v (final velocity), a (acceleration), and t (time).',
      definitions: [
        'Uniform Acceleration: Motion where velocity changes at a constant rate over equal time increments.',
      ],
      formulas: [
        'v = u + a*t',
        's = u*t + 0.5*a*t^2',
        'v^2 = u^2 + 2*a*s',
        's = 0.5*(u + v)*t',
      ],
      keyFacts: [
        'These equations are INVALID if acceleration varies with time or position.',
        'Direction conventions (+ and - signs) must remain consistent throughout every calculation.',
      ],
      examples: [
        'A car braking from 20 m/s to rest at -4 m/s^2 takes t = (0 - 20)/(-4) = 5.0 seconds and travels s = 20(5) + 0.5(-4)(25) = 50 meters.',
      ],
      sourceDocument: 'Physics_Term1_OfficialNotes.pdf',
      sourcePage: 8,
      order: 2,
      prerequisiteConceptIds: ['c-displacement-velocity'],
    },
    // Physics - Dynamics
    {
      id: 'c-newtons-second-law',
      topicId: 'top-dynamics',
      subjectId: 'sub-physics',
      name: 'Newton’s Second Law & Net Force',
      explanation: 'The acceleration of an object of constant mass is directly proportional to the resultant net external force acting on it and inversely proportional to its mass. The acceleration is in the direction of the net force.',
      definitions: [
        'Resultant Force: The vector sum of all individual forces acting simultaneously on a body (ΣF).',
        'Newton: The SI unit of force; 1 N gives a 1 kg mass an acceleration of 1 m/s^2.',
      ],
      formulas: ['ΣF = m * a'],
      keyFacts: [
        'If ΣF = 0, the body remains at rest or moves with constant velocity (Newton’s 1st Law).',
        'Mass measures inertia (resistance to acceleration).',
      ],
      examples: [
        'A 5 kg crate pushed horizontally on frictionless ground with 15 N experiences a = 15/5 = 3 m/s^2.',
      ],
      sourceDocument: 'Physics_Term1_OfficialNotes.pdf',
      sourcePage: 15,
      order: 1,
      prerequisiteConceptIds: ['c-displacement-velocity'],
    },
    // Chemistry - Atomic Structure
    {
      id: 'c-subatomic-particles',
      topicId: 'top-atomic',
      subjectId: 'sub-chemistry',
      name: 'Subatomic Particles & Atomic Notation',
      explanation: 'Atoms consist of a dense, positively charged nucleus containing protons and neutrons, surrounded by electrons in quantized energy levels. The atomic number (Z) defines the element by its proton count. The mass number (A) is the sum of protons and neutrons.',
      definitions: [
        'Proton: Positively charged nucleon (+1 charge, relative mass ~ 1 amu).',
        'Neutron: Neutral nucleon (0 charge, relative mass ~ 1 amu).',
        'Electron: Negatively charged subatomic particle (-1 charge, relative mass ~ 1/1836 amu).',
        'Atomic Number (Z): The number of protons in an atom’s nucleus.',
        'Mass Number (A): Total number of nucleons (protons + neutrons).',
      ],
      formulas: ['A = Z + N (Neutrons = A - Z)'],
      keyFacts: [
        'In a neutral atom, number of electrons equals number of protons (Z).',
        'Chemical identity is determined strictly by the number of protons.',
      ],
      examples: [
        'Carbon-14 has Z = 6 and A = 14, meaning 6 protons, 6 electrons, and 14 - 6 = 8 neutrons.',
      ],
      sourceDocument: 'Chemistry_Unit1_Notes.pdf',
      sourcePage: 2,
      order: 1,
      prerequisiteConceptIds: [],
    },
    {
      id: 'c-isotopes-relative-mass',
      topicId: 'top-atomic',
      subjectId: 'sub-chemistry',
      name: 'Isotopes & Relative Atomic Mass (Ar)',
      explanation: 'Isotopes are atoms of the same chemical element having the same number of protons (atomic number Z) but different numbers of neutrons (and therefore different mass numbers A). Relative atomic mass (Ar) is the weighted average mass of naturally occurring isotopes relative to 1/12th the mass of a Carbon-12 atom.',
      definitions: [
        'Isotopes: Forms of an element with identical atomic numbers but different mass numbers due to differing neutron counts.',
        'Relative Atomic Mass (Ar): The weighted average mass of atoms of an element compared with 1/12th of the mass of an atom of carbon-12.',
      ],
      formulas: ['Ar = Σ (isotope mass * percentage abundance) / 100'],
      keyFacts: [
        'Isotopes exhibit identical chemical properties because they have identical electron configurations.',
        'Physical properties (such as density and boiling point) can vary slightly due to differing mass.',
      ],
      examples: [
        'Chlorine is 75% Cl-35 and 25% Cl-37. Ar = (35*75 + 37*25)/100 = 35.5.',
      ],
      sourceDocument: 'Chemistry_Unit1_Notes.pdf',
      sourcePage: 6,
      order: 2,
      prerequisiteConceptIds: ['c-subatomic-particles'],
    },
    // Chemistry - Stoichiometry
    {
      id: 'c-mole-concept',
      topicId: 'top-stoichiometry',
      subjectId: 'sub-chemistry',
      name: 'The Mole & Molar Mass',
      explanation: 'The mole is the SI unit for amount of substance. One mole contains exactly 6.02214076 × 10^23 elementary entities (Avogadro’s constant, N_A). Molar mass (M) is the mass of one mole of a substance in g/mol.',
      definitions: [
        'Mole (mol): The amount of substance containing Avogadro’s number of specified elementary entities.',
        'Avogadro Constant (N_A): 6.022 × 10^23 particles per mole.',
        'Molar Mass (M): Mass in grams of 1 mole of a substance (g/mol).',
      ],
      formulas: ['n = m / M', 'N = n * N_A'],
      keyFacts: [
        'Molar mass in g/mol is numerically equal to relative formula mass (Mr).',
        'Always check units when converting between mass (g) and moles (mol).',
      ],
      examples: [
        'Water (H2O) has M = 2(1.01) + 16.00 = 18.02 g/mol. In 36.04 g of water, n = 36.04 / 18.02 = 2.0 mol.',
      ],
      sourceDocument: 'Chemistry_Unit1_Notes.pdf',
      sourcePage: 12,
      order: 1,
      prerequisiteConceptIds: ['c-isotopes-relative-mass'],
    },
    // Biology - Cells
    {
      id: 'c-eukaryote-prokaryote',
      topicId: 'top-cells',
      subjectId: 'sub-biology',
      name: 'Prokaryotic vs Eukaryotic Cell Structure',
      explanation: 'Prokaryotic cells (e.g. bacteria) lack a membrane-bound nucleus and membrane-bound organelles; their DNA is circular and floats freely in the nucleoid. Eukaryotic cells (plants, animals, fungi) feature a membrane-bound nucleus housing linear DNA organized with histones, and compartmentalized organelles.',
      definitions: [
        'Prokaryote: Unicellular organism lacking a membrane-enclosed nucleus or membrane-bound organelles.',
        'Eukaryote: Organism whose cells possess a membrane-bound nucleus and membrane-bound organelles (mitochondria, ER, Golgi).',
      ],
      formulas: [],
      keyFacts: [
        'Prokaryotes have 70S ribosomes; eukaryotes have 80S cytosolic ribosomes.',
        'Both cell types possess a plasma membrane, ribosomes, cytoplasm, and DNA.',
      ],
      examples: [
        'Escherichia coli is prokaryotic (no nucleus, plasmid present); a human lymphocyte is eukaryotic (nucleus with chromatin, mitochondria present).',
      ],
      sourceDocument: 'Biology_Cell_Structure_Notes.pdf',
      sourcePage: 3,
      order: 1,
      prerequisiteConceptIds: [],
    },
  ],
  documents: [
    FURTHER_MATH_DOCUMENT,
    {
      id: 'doc-physics',
      subjectId: 'sub-physics',
      title: 'Physics Term 1 Official Notes',
      filename: 'Physics_Term1_OfficialNotes.pdf',
      pageCount: 32,
      uploadDate: new Date().toISOString(),
      previewText: 'Official school notes covering Classical Mechanics, Kinematics equations, and Newton’s Laws of Motion.',
    },
    {
      id: 'doc-chemistry',
      subjectId: 'sub-chemistry',
      title: 'Chemistry Unit 1 Syllabus Notes',
      filename: 'Chemistry_Unit1_Notes.pdf',
      pageCount: 28,
      uploadDate: new Date().toISOString(),
      previewText: 'Atomic structure, isotope mass spectroscopy, periodic trends, and mole stoichiometry equations.',
    },
    {
      id: 'doc-biology',
      subjectId: 'sub-biology',
      title: 'Biology Cell Structure Notes',
      filename: 'Biology_Cell_Structure_Notes.pdf',
      pageCount: 22,
      uploadDate: new Date().toISOString(),
      previewText: 'Prokaryotic and eukaryotic ultrastructure, organelle compartmentalization, and membrane transport.',
    },
  ],
  questions: [
    ...FURTHER_MATH_QUESTIONS,
    // Physics SUVAT Questions
    {
      id: 'q-suvat-1',
      conceptId: 'c-suvat-equations',
      subjectId: 'sub-physics',
      topicId: 'top-kinematics',
      category: 'CALCULATION',
      type: 'NUMERICAL',
      questionText: 'A vehicle accelerates from rest at a constant rate of 3.0 m/s^2 along a straight highway for 6.0 seconds. Calculate its final velocity in m/s.',
      correctAnswer: '18',
      tolerance: 0.1,
      units: 'm/s',
      explanation: 'Using the kinematic equation v = u + at, with u = 0 m/s, a = 3.0 m/s^2, and t = 6.0 s: v = 0 + (3.0 * 6.0) = 18.0 m/s.',
      sourcePage: 8,
    },
    {
      id: 'q-suvat-2',
      conceptId: 'c-suvat-equations',
      subjectId: 'sub-physics',
      topicId: 'top-kinematics',
      category: 'APPLICATION',
      type: 'MULTIPLE_CHOICE',
      questionText: 'A ball is thrown vertically upwards into the air. At the highest point of its trajectory, what are its instantaneous velocity and acceleration (taking upward as positive, g = 9.8 m/s^2)?',
      options: [
        'Velocity = 0 m/s, Acceleration = 0 m/s^2',
        'Velocity = 0 m/s, Acceleration = -9.8 m/s^2',
        'Velocity = 9.8 m/s, Acceleration = 0 m/s^2',
        'Velocity = -9.8 m/s, Acceleration = -9.8 m/s^2',
      ],
      correctAnswer: 'Velocity = 0 m/s, Acceleration = -9.8 m/s^2',
      explanation: 'At the apex, the ball instantaneously stops changing position, so v = 0 m/s. However, gravity acts continuously downwards, so acceleration remains constant at -9.8 m/s^2.',
      sourcePage: 9,
    },
    // Newton's Second Law
    {
      id: 'q-newton-1',
      conceptId: 'c-newtons-second-law',
      subjectId: 'sub-physics',
      topicId: 'top-dynamics',
      category: 'CALCULATION',
      type: 'NUMERICAL',
      questionText: 'A net horizontal force of 45 N is applied to a box of mass 15 kg on a frictionless surface. What is the resulting acceleration in m/s^2?',
      correctAnswer: '3',
      tolerance: 0.05,
      units: 'm/s^2',
      explanation: 'From Newton’s second law: a = ΣF / m = 45 N / 15 kg = 3.0 m/s^2.',
      sourcePage: 15,
    },
    // Chemistry Isotopes
    {
      id: 'q-isotopes-1',
      conceptId: 'c-isotopes-relative-mass',
      subjectId: 'sub-chemistry',
      topicId: 'top-atomic',
      category: 'RECALL',
      type: 'MULTIPLE_CHOICE',
      questionText: 'Why do two isotopes of the same element exhibit identical chemical behavior?',
      options: [
        'They contain the same number of neutrons in their nucleus',
        'They have the identical electron configuration and valence electrons',
        'They have identical atomic mass numbers (A)',
        'They have identical nuclear binding energy',
      ],
      correctAnswer: 'They have the identical electron configuration and valence electrons',
      explanation: 'Chemical bonding and reactions involve valence electrons. Because isotopes have the same atomic number (Z), neutral atoms have identical electron configurations and therefore identical chemical properties.',
      sourcePage: 6,
    },
    {
      id: 'q-isotopes-2',
      conceptId: 'c-isotopes-relative-mass',
      subjectId: 'sub-chemistry',
      topicId: 'top-atomic',
      category: 'CALCULATION',
      type: 'NUMERICAL',
      questionText: 'A sample of copper consists of 70% Cu-63 and 30% Cu-65. Calculate the relative atomic mass (Ar) of copper to one decimal place.',
      correctAnswer: '63.6',
      tolerance: 0.1,
      units: 'amu',
      explanation: 'Ar = (63 * 70 + 65 * 30) / 100 = (4410 + 1950) / 100 = 6360 / 100 = 63.6.',
      sourcePage: 7,
    },
    // Chemistry Mole Concept
    {
      id: 'q-mole-1',
      conceptId: 'c-mole-concept',
      subjectId: 'sub-chemistry',
      topicId: 'top-stoichiometry',
      category: 'CALCULATION',
      type: 'NUMERICAL',
      questionText: 'How many moles are present in 44.0 g of carbon dioxide (CO2)? (Molar mass of CO2 = 44.01 g/mol). Enter the number of moles to one decimal place.',
      correctAnswer: '1.0',
      tolerance: 0.05,
      units: 'mol',
      explanation: 'n = m / M = 44.0 g / 44.01 g/mol = 1.0 mol.',
      sourcePage: 12,
    },
    // Biology Cell Structure
    {
      id: 'q-cells-1',
      conceptId: 'c-eukaryote-prokaryote',
      subjectId: 'sub-biology',
      topicId: 'top-cells',
      category: 'RECOGNITION',
      type: 'MULTIPLE_CHOICE',
      questionText: 'Which structure is found in BOTH prokaryotic and eukaryotic cells?',
      options: [
        'Nuclear envelope',
        'Mitochondria',
        'Ribosomes',
        'Endoplasmic reticulum',
      ],
      correctAnswer: 'Ribosomes',
      explanation: 'Both prokaryotes (70S) and eukaryotes (80S) have ribosomes for protein synthesis. Prokaryotes lack membrane-bound organelles like mitochondria, nucleus, and endoplasmic reticulum.',
      sourcePage: 3,
    },
  ],
  attempts: [],
  mistakes: [],
  mastery: {
    // Initial mastery records for all concepts
    'c-displacement-velocity': {
      conceptId: 'c-displacement-velocity',
      subjectId: 'sub-physics',
      topicId: 'top-kinematics',
      score: 55,
      status: 'LEARNING',
      lastPracticed: new Date(Date.now() - 86400000 * 3).toISOString(),
      nextReviewDue: new Date(Date.now() - 86400000).toISOString(), // Overdue
      intervalDays: 2,
      easeFactor: 2.5,
      repetitions: 2,
      consecutiveCorrect: 2,
      totalAttempts: 3,
      totalMistakes: 1,
    },
    'c-suvat-equations': {
      conceptId: 'c-suvat-equations',
      subjectId: 'sub-physics',
      topicId: 'top-kinematics',
      score: 30,
      status: 'LEARNING',
      lastPracticed: new Date(Date.now() - 86400000 * 2).toISOString(),
      nextReviewDue: new Date().toISOString(), // Due today
      intervalDays: 1,
      easeFactor: 2.4,
      repetitions: 1,
      consecutiveCorrect: 1,
      totalAttempts: 3,
      totalMistakes: 2,
    },
    'c-newtons-second-law': {
      conceptId: 'c-newtons-second-law',
      subjectId: 'sub-physics',
      topicId: 'top-dynamics',
      score: 0,
      status: 'UNLEARNED',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0,
    },
    'c-subatomic-particles': {
      conceptId: 'c-subatomic-particles',
      subjectId: 'sub-chemistry',
      topicId: 'top-atomic',
      score: 88,
      status: 'MASTERED',
      lastPracticed: new Date(Date.now() - 86400000 * 5).toISOString(),
      nextReviewDue: new Date(Date.now() + 86400000 * 4).toISOString(),
      intervalDays: 9,
      easeFactor: 2.6,
      repetitions: 4,
      consecutiveCorrect: 4,
      totalAttempts: 5,
      totalMistakes: 0,
    },
    'c-isotopes-relative-mass': {
      conceptId: 'c-isotopes-relative-mass',
      subjectId: 'sub-chemistry',
      topicId: 'top-atomic',
      score: 42,
      status: 'LEARNING',
      lastPracticed: new Date(Date.now() - 86400000 * 1).toISOString(),
      nextReviewDue: new Date().toISOString(), // Due today
      intervalDays: 1,
      easeFactor: 2.3,
      repetitions: 1,
      consecutiveCorrect: 1,
      totalAttempts: 2,
      totalMistakes: 1,
    },
    'c-mole-concept': {
      conceptId: 'c-mole-concept',
      subjectId: 'sub-chemistry',
      topicId: 'top-stoichiometry',
      score: 0,
      status: 'UNLEARNED',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0,
    },
    'c-eukaryote-prokaryote': {
      conceptId: 'c-eukaryote-prokaryote',
      subjectId: 'sub-biology',
      topicId: 'top-cells',
      score: 0,
      status: 'UNLEARNED',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      consecutiveCorrect: 0,
      totalAttempts: 0,
      totalMistakes: 0,
    },
  },
  dailyPlans: {},
  testRecords: [],
  settings: {
    termStartDate: '2026-09-01',
    termEndDate: '2026-12-18',
    targetStudyMinutesPerDay: 90,
    masteryThreshold: 85,
    onboardingCompleted: true,
  },
};

// Seed an initial mistake to demonstrate the active Mistake Bank immediately
SEED_DATA.mistakes.push({
  id: 'm-initial-1',
  questionId: 'q-suvat-2',
  conceptId: 'c-suvat-equations',
  topicId: 'top-kinematics',
  subjectId: 'sub-physics',
  conceptName: 'Equations of Uniform Acceleration (SUVAT)',
  questionText: 'A ball is thrown vertically upwards into the air. At the highest point of its trajectory, what are its instantaneous velocity and acceleration (taking upward as positive, g = 9.8 m/s^2)?',
  studentAnswer: 'Velocity = 0 m/s, Acceleration = 0 m/s^2',
  correctAnswer: 'Velocity = 0 m/s, Acceleration = -9.8 m/s^2',
  mistakeType: 'MISCONCEPTION',
  diagnosis: 'Confused instantaneous zero velocity with zero acceleration. Gravity never stops exerting a downward force (F = mg) on an airborne projectile, regardless of whether its velocity momentarily passes through zero at the turning point.',
  targetedRemediation: 'Remember Newton’s 2nd Law: a = ΣF/m. As long as gravity acts on the ball, acceleration remains non-zero (-g) throughout the flight.',
  timestamp: new Date(Date.now() - 86400000).toISOString(),
  resolved: false,
  resolutionAttempts: 0,
  nextReviewDate: new Date().toISOString(),
});

class StorageManager {
  private db: DatabaseSchema;
  private isBatching = false;
  private syncReady: Promise<void> = Promise.resolve();
  private pendingSync: Promise<void> = Promise.resolve();
  private lastSyncedAt = '';

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
    this.syncReady = this.initSupabaseSync();
  }

  /** Resolves once the initial Supabase state has loaded. */
  public ready(): Promise<void> {
    return this.syncReady;
  }

  /** Resolves once any in-flight Supabase write has finished (serverless hosts must await this before responding). */
  public flush(): Promise<void> {
    return this.pendingSync;
  }

  /** Serverless: pull newer state written by another instance. */
  public async refresh(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const head = await supabase.from('app_state').select('updated_at').eq('key', 'main_db').single();
      const remote = head.data?.updated_at;
      if (!remote || (this.lastSyncedAt && new Date(remote).getTime() === new Date(this.lastSyncedAt).getTime())) return;
      const full = await supabase.from('app_state').select('data, updated_at').eq('key', 'main_db').single();
      if (!full.error && full.data?.data && Array.isArray(full.data.data.subjects)) {
        this.db = full.data.data;
        this.lastSyncedAt = full.data.updated_at;
      }
    } catch (err: any) {
      console.warn('Supabase refresh failed:', this.cleanErrorMessage(err?.message || err));
    }
  }

  /** Full copy of the current state, used to roll back a failed rebuild. */
  public snapshot(): string {
    return JSON.stringify(this.db);
  }

  public restore(snapshot: string) {
    this.db = JSON.parse(snapshot);
  }

  // Lesson sessions are stored so they survive restarts and serverless invocations.
  public getSession(id: string): any | undefined {
    return this.db.sessions?.[id];
  }

  public saveSession(session: any) {
    if (!this.db.sessions) this.db.sessions = {};
    this.db.sessions[session.sessionId] = session;
    const ids = Object.keys(this.db.sessions);
    if (ids.length > 25) ids.slice(0, ids.length - 25).forEach((k) => delete this.db.sessions![k]);
    this.persist();
  }

  public startBatch() {
    this.isBatching = true;
  }

  public endBatch() {
    this.isBatching = false;
    this.persist();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    let data: DatabaseSchema = SEED_DATA;
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Valid JSON object with subjects array (even if empty when user deleted subjects)
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.subjects)) {
          data = parsed;
        } else {
          data = SEED_DATA;
          this.saveDatabase(SEED_DATA);
        }
      } else {
        this.saveDatabase(SEED_DATA);
      }
    } catch (e) {
      console.warn('Could not read existing database.json, keeping current state:', e);
      data = SEED_DATA;
      this.saveDatabase(SEED_DATA);
    }

    // Ensure all concepts have mastery initialized
    if (!data.mastery) data.mastery = {};
    for (const c of data.concepts || []) {
      if (!data.mastery[c.id]) {
        data.mastery[c.id] = {
          conceptId: c.id,
          subjectId: c.subjectId,
          topicId: c.topicId,
          score: 0,
          status: 'UNLEARNED',
          intervalDays: 1,
          easeFactor: 2.5,
          repetitions: 0,
          consecutiveCorrect: 0,
          totalAttempts: 0,
          totalMistakes: 0,
        };
      }
    }

    return data;
  }

  private cleanErrorMessage(msg: any): string {
    if (!msg) return 'Unknown error';
    const str = typeof msg === 'string' ? msg : JSON.stringify(msg);
    if (str.includes('<!DOCTYPE') || str.includes('<html') || str.includes('<body')) {
      const titleMatch = str.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        return `Cloudflare/HTTP Error: ${titleMatch[1].trim()} (HTML Response)`;
      }
      return 'Cloudflare/HTTP Network Error (HTML Response / Gateway Timeout / 520)';
    }
    return str;
  }

  private async initSupabaseSync(): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Attempt to load remote state from Supabase
      const { data, error } = await supabase
        .from('app_state')
        .select('data')
        .eq('key', 'main_db')
        .single();

      if (!error && data?.data && Array.isArray(data.data.subjects)) {
        console.log('✅ Synchronized state from Supabase Cloud Database.');
        this.db = data.data;
        this.saveDatabase(this.db);
      } else if (error) {
        console.warn('Supabase sync warning on startup:', this.cleanErrorMessage(error.message || error));
      } else {
        console.log('Pushing initial local database state to Supabase Cloud Database...');
        await supabase
          .from('app_state')
          .upsert({ key: 'main_db', data: this.db, updated_at: new Date().toISOString() });
      }
    } catch (err: any) {
      console.warn('Supabase sync error on startup:', this.cleanErrorMessage(err?.message || err));
    }
  }

  private saveDatabase(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database.json:', e);
    }

    // Sync to Supabase in background if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      this.pendingSync = (async () => {
        try {
          const stamp = new Date().toISOString();
          this.lastSyncedAt = stamp;
          const { error } = await supabase
            .from('app_state')
            .upsert({ key: 'main_db', data, updated_at: stamp });
          if (error) {
            console.warn('Supabase background sync error:', this.cleanErrorMessage(error.message));
          }
        } catch (err: any) {
          console.warn('Supabase background sync failed:', this.cleanErrorMessage(err?.message || err));
        }
      })();
    }
  }

  public getSupabaseStatus(): { configured: boolean; url: string | null } {
    const url = process.env.SUPABASE_URL || null;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || null;
    return {
      configured: Boolean(url && key),
      url,
    };
  }

  public getDatabase(): DatabaseSchema {
    return this.db;
  }

  public persist() {
    if (this.isBatching) return;
    this.saveDatabase(this.db);
  }


  // Subjects
  public getSubjects(): Subject[] {
    return this.db.subjects;
  }

  public getSubject(id: string): Subject | undefined {
    return this.db.subjects.find((s) => s.id === id);
  }

  public addSubject(subject: Subject) {
    this.db.subjects.push(subject);
    this.persist();
  }

  public deleteSubject(subjectId: string) {
    this.db.subjects = this.db.subjects.filter((s) => s.id !== subjectId);
    const topicIdsToRemove = new Set(
      this.db.topics.filter((t) => t.subjectId === subjectId).map((t) => t.id)
    );
    this.db.topics = this.db.topics.filter((t) => t.subjectId !== subjectId);
    
    const conceptIdsToRemove = new Set(
      this.db.concepts.filter((c) => c.subjectId === subjectId).map((c) => c.id)
    );
    this.db.concepts = this.db.concepts.filter((c) => c.subjectId !== subjectId);
    this.db.questions = this.db.questions.filter((q) => q.subjectId !== subjectId);
    this.db.documents = this.db.documents.filter((d) => d.subjectId !== subjectId);
    this.db.mistakes = this.db.mistakes.filter((m) => m.subjectId !== subjectId);
    this.db.testRecords = this.db.testRecords.filter((tr) => tr.subjectId !== subjectId);
    
    for (const cid of conceptIdsToRemove) {
      delete this.db.mastery[cid];
    }
    this.persist();
  }

  public deleteTopic(topicId: string) {
    this.db.topics = this.db.topics.filter((t) => t.id !== topicId);
    const conceptIdsToRemove = new Set(
      this.db.concepts.filter((c) => c.topicId === topicId).map((c) => c.id)
    );
    this.db.concepts = this.db.concepts.filter((c) => c.topicId !== topicId);
    this.db.questions = this.db.questions.filter((q) => q.topicId !== topicId);
    this.db.mistakes = this.db.mistakes.filter((m) => m.topicId !== topicId);
    for (const cid of conceptIdsToRemove) {
      delete this.db.mastery[cid];
    }
    this.persist();
  }

  public deleteConcept(conceptId: string) {
    this.db.concepts = this.db.concepts.filter((c) => c.id !== conceptId);
    this.db.questions = this.db.questions.filter((q) => q.conceptId !== conceptId);
    this.db.mistakes = this.db.mistakes.filter((m) => m.conceptId !== conceptId);
    delete this.db.mastery[conceptId];
    this.persist();
  }

  public deleteDocument(documentId: string) {
    this.db.documents = this.db.documents.filter((d) => d.id !== documentId);
    this.persist();
  }

  public deleteMistake(mistakeId: string) {
    this.db.mistakes = this.db.mistakes.filter((m) => m.id !== mistakeId);
    this.persist();
  }

  public clearAll() {
    this.db = {
      subjects: [],
      topics: [],
      concepts: [],
      documents: [],
      questions: [],
      attempts: [],
      mistakes: [],
      mastery: {},
      dailyPlans: {},
      testRecords: [],
      settings: {
        termStartDate: '2026-09-01',
        termEndDate: '2026-12-18',
        targetStudyMinutesPerDay: 60,
        masteryThreshold: 85,
        onboardingCompleted: true,
      },
    };
    this.persist();
  }

  // Topics
  public getTopics(subjectId?: string): Topic[] {
    if (subjectId) {
      return this.db.topics.filter((t) => t.subjectId === subjectId);
    }
    return this.db.topics;
  }

  public addTopic(topic: Topic) {
    this.db.topics.push(topic);
    this.persist();
  }

  // Concepts
  public getConcepts(topicId?: string, subjectId?: string): Concept[] {
    let list = this.db.concepts;
    if (subjectId) {
      list = list.filter((c) => c.subjectId === subjectId);
    }
    if (topicId) {
      list = list.filter((c) => c.topicId === topicId);
    }
    return list;
  }

  public getConcept(id: string): Concept | undefined {
    return this.db.concepts.find((c) => c.id === id);
  }

  public addConcept(concept: Concept) {
    this.db.concepts.push(concept);
    if (!this.db.mastery[concept.id]) {
      this.db.mastery[concept.id] = {
        conceptId: concept.id,
        subjectId: concept.subjectId,
        topicId: concept.topicId,
        score: 0,
        status: 'UNLEARNED',
        intervalDays: 1,
        easeFactor: 2.5,
        repetitions: 0,
        consecutiveCorrect: 0,
        totalAttempts: 0,
        totalMistakes: 0,
      };
    }
    this.persist();
  }

  // Documents
  public getDocuments(subjectId?: string): SourceDocument[] {
    if (subjectId) {
      return this.db.documents.filter((d) => d.subjectId === subjectId);
    }
    return this.db.documents;
  }

  public addDocument(doc: SourceDocument) {
    this.db.documents.push(doc);
    this.persist();
  }

  // Questions
  public getQuestions(conceptId?: string): Question[] {
    if (conceptId) {
      return this.db.questions.filter((q) => q.conceptId === conceptId);
    }
    return this.db.questions;
  }

  public getQuestion(id: string): Question | undefined {
    return this.db.questions.find((q) => q.id === id);
  }

  public addQuestion(question: Question) {
    this.db.questions.push(question);
    this.persist();
  }

  // Attempts
  public recordAttempt(attempt: Attempt) {
    this.db.attempts.push(attempt);
    this.persist();
  }

  public getAttempts(conceptId?: string): Attempt[] {
    if (conceptId) {
      return this.db.attempts.filter((a) => a.conceptId === conceptId);
    }
    return this.db.attempts;
  }

  // Mistakes
  public getMistakes(resolved?: boolean): MistakeRecord[] {
    if (resolved !== undefined) {
      return this.db.mistakes.filter((m) => m.resolved === resolved);
    }
    return this.db.mistakes;
  }

  public addMistake(mistake: MistakeRecord) {
    this.db.mistakes.push(mistake);
    this.persist();
  }

  public resolveMistake(id: string) {
    const item = this.db.mistakes.find((m) => m.id === id);
    if (item) {
      item.resolved = true;
      this.persist();
    }
  }

  public incrementMistakeAttempt(id: string, wasSuccess: boolean) {
    const item = this.db.mistakes.find((m) => m.id === id);
    if (item) {
      item.resolutionAttempts += 1;
      if (wasSuccess && item.resolutionAttempts >= 2) {
        item.resolved = true;
      }
      this.persist();
    }
  }

  // Mastery
  public getMastery(conceptId: string): ConceptMastery | undefined {
    return this.db.mastery[conceptId];
  }

  public getAllMastery(): Record<string, ConceptMastery> {
    return this.db.mastery;
  }

  public updateMastery(mastery: ConceptMastery) {
    this.db.mastery[mastery.conceptId] = mastery;
    this.persist();
  }

  // Tests
  public getTestRecords(): TestRecord[] {
    return this.db.testRecords;
  }

  public recordTest(test: TestRecord) {
    this.db.testRecords.push(test);
    this.persist();
  }

  // Plans
  public getDailyPlan(dateStr: string): DailyStudyPlan | undefined {
    return this.db.dailyPlans[dateStr];
  }

  public saveDailyPlan(plan: DailyStudyPlan) {
    this.db.dailyPlans[plan.date] = plan;
    this.persist();
  }

  public togglePlanItem(dateStr: string, itemId: string) {
    const plan = this.db.dailyPlans[dateStr];
    if (plan) {
      const item = plan.items.find((i) => i.id === itemId);
      if (item) {
        item.completed = !item.completed;
        plan.completedMinutes = plan.items
          .filter((i) => i.completed)
          .reduce((sum, cur) => sum + cur.estimatedMinutes, 0);
        this.persist();
      }
    }
  }

  // Settings
  public getSettings() {
    if (!this.db.settings) {
      this.db.settings = {
        termStartDate: new Date().toISOString().split('T')[0],
        termEndDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
        targetStudyMinutesPerDay: 120,
        masteryThreshold: 80,
        onboardingCompleted: false,
      };
    }
    return this.db.settings;
  }

  public updateSettings(partialSettings: Partial<DatabaseSchema['settings']>) {
    const current = this.getSettings();
    this.db.settings = { ...current, ...partialSettings };
    this.persist();
    return this.db.settings;
  }

  // Reset curriculum for fresh onboarding
  public resetCurriculum() {
    this.db.subjects = [];
    this.db.topics = [];
    this.db.concepts = [];
    this.db.documents = [];
    this.db.questions = [];
    this.db.attempts = [];
    this.db.mistakes = [];
    this.db.mastery = {};
    this.db.dailyPlans = {};
    this.db.testRecords = [];
    if (this.db.settings) {
      this.db.settings.onboardingCompleted = false;
    }
    this.persist();
  }

  // Reset to seed if requested
  public resetToSeed() {
    this.db = JSON.parse(JSON.stringify(SEED_DATA));
    this.persist();
  }
}

export const storage = new StorageManager();
