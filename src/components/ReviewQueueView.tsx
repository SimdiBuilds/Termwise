import React, { useState, useEffect } from 'react';
import { Concept, ConceptMastery, Question } from '../types.ts';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { MathMarkdown } from './MathMarkdown.tsx';

interface ReviewQueueItem {
  concept: Concept;
  mastery: ConceptMastery;
}

interface ReviewQueueViewProps {
  onStartLesson: (conceptId: string) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({ onStartLesson }) => {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePracticeItem, setActivePracticeItem] = useState<ReviewQueueItem | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState<{
    isCorrect: boolean;
    feedback: string;
    correctAnswer: string;
    explanation: string;
    mastery?: ConceptMastery;
  } | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/review/queue');
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStartReviewSession = async (item: ReviewQueueItem) => {
    setActivePracticeItem(item);
    setAttemptFeedback(null);
    setStudentAnswer('');
    setSelectedQuestionIndex(0);

    try {
      const res = await fetch(`/api/curriculum/concept/${item.concept.id}`);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions([
          {
            id: `q-rev-${item.concept.id}`,
            conceptId: item.concept.id,
            subjectId: item.concept.subjectId,
            topicId: item.concept.topicId,
            category: 'RECALL',
            type: 'OPEN_EXPLANATION',
            questionText: `State the primary definition and core formula for ${item.concept.name}.`,
            correctAnswer: item.concept.definitions[0] || item.concept.explanation,
            explanation: item.concept.explanation,
            sourcePage: item.concept.sourcePage,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || isSubmitting || !activePracticeItem) return;

    const currentQ = questions[selectedQuestionIndex];
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/learn/submit-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ?.id,
          conceptId: activePracticeItem.concept.id,
          studentAnswer,
        }),
      });

      const data = await res.json();
      setAttemptFeedback({
        isCorrect: data.isCorrect,
        feedback: data.feedback,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        mastery: data.mastery,
      });
      fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextReviewQuestion = () => {
    setAttemptFeedback(null);
    setStudentAnswer('');
    if (selectedQuestionIndex < questions.length - 1) {
      setSelectedQuestionIndex(selectedQuestionIndex + 1);
    } else {
      setActivePracticeItem(null);
      fetchQueue();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Spaced Retrieval & Long-Term Retention
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <span>Spaced Review Queue</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Concepts scheduled for active recall based on your personal forgetting curve intervals.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 shrink-0">
          <strong>{queue.length}</strong> concepts due today
        </div>
      </div>

      {/* Active Review Modal / Form */}
      {activePracticeItem && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-blue-600 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-blue-700">
                ACTIVE RECALL SESSION • Question {selectedQuestionIndex + 1} of{' '}
                {questions.length}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {activePracticeItem.concept.name}
              </h2>
            </div>
            <button
              onClick={() => setActivePracticeItem(null)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Exit Review
            </button>
          </div>

          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Category: {questions[selectedQuestionIndex]?.category}
                </div>
                <div className="text-base font-semibold text-slate-900">
                  <MathMarkdown content={questions[selectedQuestionIndex]?.questionText} />
                </div>
              </div>

              {!attemptFeedback ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {questions[selectedQuestionIndex]?.type === 'MULTIPLE_CHOICE' &&
                  questions[selectedQuestionIndex]?.options ? (
                    <div className="space-y-2">
                      {questions[selectedQuestionIndex].options?.map((opt, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            studentAnswer === opt
                              ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reviewOpt"
                            value={opt}
                            checked={studentAnswer === opt}
                            onChange={(e) => setStudentAnswer(e.target.value)}
                            className="sr-only"
                          />
                          <span className="font-mono text-xs text-slate-400">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span className="text-sm flex-1"><MathMarkdown content={opt} inline /></span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Your answer:
                      </label>
                      <input
                        type="text"
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        placeholder="Type answer here..."
                        className="w-full text-sm border border-slate-300 rounded-lg p-3 font-mono focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                        required
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !studentAnswer.trim()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 shadow-xs"
                    >
                      {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center space-x-2">
                    {attemptFeedback.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-bold text-sm text-slate-900">
                      {attemptFeedback.isCorrect
                        ? 'Retention Demonstrated'
                        : 'Memory Decay / Gap Detected'}
                    </span>
                  </div>

                  <div className="text-sm text-slate-700 leading-relaxed">
                    <MathMarkdown content={attemptFeedback.feedback} />
                  </div>

                  {attemptFeedback.mastery && (
                    <div className="text-xs font-mono text-slate-600 pt-2 border-t border-slate-200 flex justify-between">
                      <span>
                        Updated Score: <strong>{attemptFeedback.mastery.score}%</strong>
                      </span>
                      <span>
                        Next Spaced Interval: {attemptFeedback.mastery.intervalDays} day(s)
                      </span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextReviewQuestion}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs"
                    >
                      {selectedQuestionIndex < questions.length - 1
                        ? 'Next Question'
                        : 'Complete Session'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Queue Items List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Calculating due review items...
          </div>
        ) : queue.length > 0 ? (
          queue.map((item) => (
            <div
              key={item.concept.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-base text-slate-900">
                    {item.concept.name}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Mastery: {item.mastery.score}%
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Repetitions: {item.mastery.repetitions}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-1">
                  {item.concept.explanation}
                </p>
                <div className="text-xs text-slate-500 flex items-center space-x-2 font-mono">
                  <span>📄 {item.concept.sourceDocument}</span>
                  <span>•</span>
                  <span>Interval: {item.mastery.intervalDays} day(s)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onStartLesson(item.concept.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Full Lesson
                </button>
                <button
                  onClick={() => handleStartReviewSession(item)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Retrieval</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">
              No Overdue Reviews
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              All learned concepts are currently within their calculated retention intervals. You can continue learning new material or practice cumulative tests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
