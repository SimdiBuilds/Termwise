export type QuestionCategory =
  | 'RECALL'
  | 'RECOGNITION'
  | 'EXPLANATION'
  | 'APPLICATION'
  | 'CALCULATION'
  | 'MULTI_STEP'
  | 'TRANSFER'
  | 'EXAM_STYLE';

export type QuestionType = 'MULTIPLE_CHOICE' | 'NUMERICAL' | 'OPEN_EXPLANATION';

export type MistakeClassification =
  | 'KNOWLEDGE_GAP'
  | 'MISCONCEPTION'
  | 'RECALL_FAILURE'
  | 'CALCULATION_ERROR'
  | 'MISREAD'
  | 'CARELESS_ERROR'
  | 'APPLICATION_FAILURE';

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description: string;
  createdAt: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  subjectId: string;
  title: string;
  order: number;
  description?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  order: number;
  description?: string;
  subtopics?: Subtopic[];
}

export interface Concept {
  id: string;
  topicId: string;
  topicTitle?: string;
  subtopicId?: string;
  subtopicTitle?: string;
  subjectId: string;
  subjectName?: string;
  name: string;
  explanation: string;
  definitions: string[];
  formulas: string[];
  keyFacts: string[];
  examples: string[];
  sourceDocument: string;
  sourcePage?: number;
  order: number;
  prerequisiteConceptIds?: string[];
  prerequisiteNames?: string[];
  sampleQuestions?: any[];
}

export interface SourceDocument {
  id: string;
  subjectId: string;
  title: string;
  filename: string;
  pageCount?: number;
  uploadDate: string;
  previewText?: string;
  extractedText?: string;
}

export interface Question {
  id: string;
  conceptId: string;
  subjectId: string;
  topicId: string;
  subtopicTitle?: string;
  category: QuestionCategory;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  tolerance?: number;
  units?: string;
  explanation: string;
  sourcePage?: number;
  sourceDocument?: string;
  distractorDiagnoses?: Record<string, FailureDiagnosisType>;
}

export interface Attempt {
  id: string;
  questionId: string;
  conceptId: string;
  subjectId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number; // 0 to 1
  feedback: string;
  timestamp: string;
}

export interface MistakeRecord {
  id: string;
  questionId: string;
  conceptId: string;
  topicId: string;
  subtopicTitle?: string;
  subjectId: string;
  conceptName: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  mistakeType: MistakeClassification;
  diagnosis: string;
  targetedRemediation: string;
  timestamp: string;
  resolved: boolean;
  resolutionAttempts: number;
  nextReviewDate: string;
  sourcePage?: number;
}

export interface ConceptMastery {
  conceptId: string;
  subjectId: string;
  topicId: string;
  score: number; // 0 - 100
  status: 'UNLEARNED' | 'LEARNING' | 'DEVELOPING' | 'MASTERED';
  lastPracticed?: string;
  nextReviewDue?: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  consecutiveCorrect: number;
  totalAttempts: number;
  totalMistakes: number;
  successfulEvidencesCount?: number;
  questionTypesEncountered?: string[];
  delayedReviewPassed?: boolean;
  lastReviewDate?: string;
}

export type StudyPlanItemType = 'NEW_LEARN' | 'SPACED_REVIEW' | 'MISTAKE_REMEDIATION' | 'TOPIC_TEST' | 'MIXED_RETRIEVAL';

export interface StudyPlanItem {
  id: string;
  type: StudyPlanItemType;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  conceptId?: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface DailyStudyPlan {
  date: string;
  targetMinutes: number;
  items: StudyPlanItem[];
  summary: string;
  completedMinutes: number;
}

export interface TestRecord {
  id: string;
  title: string;
  subjectId: string;
  topicId?: string;
  type: 'TOPIC_TEST' | 'CUMULATIVE_TEST' | 'MOCK_EXAM';
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  completedAt: string;
  durationMinutes: number;
  strongConcepts: string[];
  weakConcepts: string[];
  mistakeBreakdown: Record<string, number>;
}

export interface LessonStep {
  stepNumber: number;
  type: 'EXPLANATION' | 'EXAMPLE' | 'CHECK_QUESTION' | 'APPLICATION_QUESTION';
  content: string;
  question?: Question;
}

export type LessonActivityType =
  | 'EXPLAIN'
  | 'WORKED_EXAMPLE'
  | 'GUIDED_PRACTICE'
  | 'RECALL'
  | 'RECOGNITION'
  | 'CALCULATION'
  | 'APPLICATION'
  | 'ERROR_ANALYSIS'
  | 'MISCONCEPTION_CHECK'
  | 'REMEDIATION'
  | 'PREREQUISITE_CHECK'
  | 'SUMMARY';

export type FailureDiagnosisType =
  | 'KNOWLEDGE_GAP'
  | 'MISCONCEPTION'
  | 'RECALL_FAILURE'
  | 'CALCULATION_ERROR'
  | 'MISREAD'
  | 'CARELESS_ERROR'
  | 'APPLICATION_FAILURE'
  | 'PREREQUISITE_GAP';

export interface LessonActivity {
  id: string;
  type: LessonActivityType;
  title: string;
  instruction?: string;
  content: string;
  question?: Question;
  targetMisconception?: string;
  distractorDiagnoses?: Record<string, FailureDiagnosisType>;
  hint?: string;
  guidedSteps?: string[];
  sourcePage?: number;
}

export interface LessonSessionHistoryItem {
  activityId: string;
  activityType: LessonActivityType;
  title: string;
  studentAnswer?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  diagnosisType?: FailureDiagnosisType;
  completedAt: string;
}

export interface LessonSessionEvidence {
  explanationDelivered: boolean;
  recallDemonstrated: boolean;
  applicationDemonstrated: boolean;
  consecutiveCorrect: number;
  totalAttempts: number;
  totalMistakes: number;
  detectedMisconceptions: string[];
  activeDiagnosis?: FailureDiagnosisType;
}

export interface LessonSessionState {
  sessionId: string;
  conceptId: string;
  conceptName: string;
  topicTitle: string;
  subtopicTitle?: string;
  subjectName: string;
  sourceDocName: string;
  sourcePage?: number;
  currentActivity: LessonActivity;
  activityIndex: number;
  history: LessonSessionHistoryItem[];
  evidence: LessonSessionEvidence;
  isComplete: boolean;
  summaryMessage?: string;
  masteryScore?: number;
}

export interface InteractiveLesson {
  conceptId: string;
  conceptName: string;
  topicTitle: string;
  subtopicTitle?: string;
  subjectName: string;
  sourceDocName: string;
  sourcePage?: number;
  steps: LessonStep[];
}

export interface AppSettings {
  termStartDate: string;
  termEndDate: string;
  targetStudyMinutesPerDay: number;
  masteryThreshold: number;
  onboardingCompleted: boolean;
  daysRemaining?: number;
  weeksRemaining?: number;
  countdownLabel?: string;
}

export interface ClassifiedSubjectGroup {
  subjectName: string;
  files: {
    id: string;
    filename: string;
    pageCount?: number;
    size?: number;
    fullText?: string;
    textExcerpt?: string;
  }[];
}
