import React, { useState, useEffect } from 'react';
import {
  LessonSessionState,
  LessonActivity,
  LessonActivityType,
  FailureDiagnosisType,
} from '../types.ts';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Award,
  BookOpen,
  Target,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { LessonContentRenderer } from './LessonContentRenderer.tsx';
import { MathMarkdown } from './MathMarkdown.tsx';

interface InteractiveLessonViewProps {
  conceptId: string;
  onBackToCurriculum: () => void;
  onLessonComplete: () => void;
}

export const InteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({
  conceptId,
  onBackToCurriculum,
  onLessonComplete,
}) => {
  const [session, setSession] = useState<LessonSessionState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    feedbackText: string;
    correctAnswer?: string;
    explanation?: string;
    diagnosisType?: FailureDiagnosisType;
    remediationSummary?: string;
  } | null>(null);
  const [altExplanation, setAltExplanation] = useState<string | null>(null);
  const [isExplainingDifferently, setIsExplainingDifferently] = useState<boolean>(false);

  const handleExplainDifferently = async () => {
    if (!session || isExplainingDifferently) return;
    setIsExplainingDifferently(true);
    try {
      const res = await fetch('/api/learn/lesson/explain-differently', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId: session.conceptId }),
      });
      const data = await res.json();
      if (data.alternativeExplanation) {
        setAltExplanation(data.alternativeExplanation);
      }
    } catch (err) {
      console.error('Error fetching alternative explanation:', err);
    } finally {
      setIsExplainingDifferently(false);
    }
  };

  useEffect(() => {
    async function startLessonSession() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/learn/lesson/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conceptId }),
        });
        const data = await res.json();
        setSession(data);
        setFeedback(null);
        setStudentAnswer('');
      } catch (err) {
        console.error('Failed to start flexible lesson session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (conceptId) {
      startLessonSession();
    }
  }, [conceptId]);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs max-w-3xl mx-auto">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-700">
          Preparing lesson...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto shadow-xs">
        <p className="text-sm text-slate-600">Could not initialize adaptive lesson.</p>
        <button
          onClick={onBackToCurriculum}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
        >
          Return to Curriculum
        </button>
      </div>
    );
  }

  const currentAct: LessonActivity = session.currentActivity;
  const isQuestionActivity = Boolean(currentAct.question);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/learn/lesson/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          studentAnswer,
        }),
      });

      const data = await res.json();
      if (data.feedback) {
        setFeedback(data.feedback);
      }
      setSession(data.session);
    } catch (err) {
      console.error('Error submitting response:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceNonQuestion = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/learn/lesson/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          studentAnswer: 'CONTINUE',
        }),
      });
      const data = await res.json();
      setSession(data.session);
      setFeedback(null);
      setStudentAnswer('');

      if (data.session.isComplete) {
        onLessonComplete();
      }
    } catch (err) {
      console.error('Error advancing activity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextAfterFeedback = () => {
    setFeedback(null);
    setStudentAnswer('');
    if (session.isComplete) {
      onLessonComplete();
    }
  };

  // Activity type styling badge helper
  const getActivityBadge = (type: LessonActivityType) => {
    switch (type) {
      case 'EXPLAIN':
        return {
          label: 'Concept Teaching & Principles',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: BookOpen,
        };
      case 'WORKED_EXAMPLE':
        return {
          label: 'Official Worked Example',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: Lightbulb,
        };
      case 'APPLICATION':
        return {
          label: 'Application Challenge',
          color: 'bg-violet-50 text-violet-800 border-violet-200',
          icon: Target,
        };
      case 'RECALL':
        return {
          label: 'Rule & Definition Retrieval',
          color: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: RotateCcw,
        };
      case 'MISCONCEPTION_CHECK':
        return {
          label: 'Misconception Diagnostic',
          color: 'bg-amber-50 text-amber-900 border-amber-200',
          icon: AlertCircle,
        };
      case 'REMEDIATION':
        return {
          label: 'Targeted Remediation',
          color: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: Sparkles,
        };
      case 'GUIDED_PRACTICE':
        return {
          label: 'Guided Scaffolded Practice',
          color: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: GraduationCap,
        };
      case 'SUMMARY':
        return {
          label: 'Completed',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: Award,
        };
      default:
        return {
          label: 'Learning Activity',
          color: 'bg-slate-50 text-slate-800 border-slate-200',
          icon: HelpCircle,
        };
    }
  };

  const badgeInfo = getActivityBadge(currentAct.type);
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
            <span className="text-slate-700 font-semibold">{session.subjectName}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>{session.topicTitle}</span>
            {session.subtopicTitle && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-indigo-600 font-semibold">{session.subtopicTitle}</span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 shrink-0" />
            <span>{session.conceptName}</span>
          </h1>
        </div>

        <button
          onClick={onBackToCurriculum}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3.5 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0 self-start sm:self-center"
        >
          Exit Lesson
        </button>
      </div>

      {/* Activity Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Activity Header */}
        <div className="border-b border-slate-100 pb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeInfo.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{badgeInfo.label}</span>
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2.5">
            {currentAct.title}
          </h2>
          {currentAct.instruction && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentAct.instruction}
            </p>
          )}
        </div>

        {/* Formatted Content Body */}
        <div className="text-slate-800 space-y-4">
          <LessonContentRenderer content={currentAct.content} />

          {/* Grounded Source Reference Pill */}
          {session.sourceDocName && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 border border-slate-200 rounded-md text-[11px] font-medium text-slate-500">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span>Source: {session.sourceDocName}, p. {session.sourcePage || 1}</span>
            </div>
          )}

          {/* Alternative Explanation Box */}
          {altExplanation && (
            <div className="mt-4 p-5 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Alternative Explanation & Visual Perspective</span>
              </div>
              <div className="text-slate-800 text-xs sm:text-sm leading-relaxed">
                <LessonContentRenderer content={altExplanation} />
              </div>
            </div>
          )}
        </div>

        {/* Question Interaction Section */}
        {isQuestionActivity && currentAct.question && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <span>{currentAct.question.category} Question</span>
                {currentAct.question.type === 'NUMERICAL' && currentAct.question.units && (
                  <span className="font-mono">Units: {currentAct.question.units}</span>
                )}
              </div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                <MathMarkdown content={currentAct.question.questionText} />
              </div>
            </div>

            {/* Answer Submission Form */}
            {!feedback ? (
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                {currentAct.question.type === 'MULTIPLE_CHOICE' &&
                currentAct.question.options ? (
                  <div className="space-y-2">
                    {currentAct.question.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          studentAnswer === opt
                            ? 'bg-indigo-50/70 text-indigo-900 border-indigo-300 font-medium shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quizOption"
                          value={opt}
                          checked={studentAnswer === opt}
                          onChange={(e) => setStudentAnswer(e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-mono text-xs w-5 text-slate-400">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span className="text-xs sm:text-sm flex-1"><MathMarkdown content={opt} inline /></span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      {currentAct.question.type === 'NUMERICAL'
                        ? 'Enter calculated number:'
                        : 'Explain your reasoning based on the notes:'}
                    </label>
                    <input
                      type="text"
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      placeholder={
                        currentAct.question.type === 'NUMERICAL'
                          ? 'e.g. 18.0'
                          : 'State principles and equations applied...'
                      }
                      className="w-full text-sm border border-slate-300 rounded-lg p-3 font-mono focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-hidden"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !studentAnswer.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-xs flex items-center space-x-2"
                  >
                    <span>{isSubmitting ? 'Evaluating Response...' : 'Submit Answer'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Diagnostic Feedback Card */
              <div
                className={`p-5 rounded-xl border space-y-3.5 ${
                  feedback.isCorrect
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <span
                    className={`font-bold text-sm ${
                      feedback.isCorrect ? 'text-emerald-900' : 'text-amber-900'
                    }`}
                  >
                    {feedback.isCorrect
                      ? 'Correct!'
                      : feedback.diagnosisType === 'MISCONCEPTION'
                      ? 'Review Key Distinction'
                      : 'Incorrect'}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <MathMarkdown content={feedback.feedbackText} />
                </div>

                {/* Adaptive Next Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextAfterFeedback}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center space-x-1.5 shadow-xs"
                  >
                    <span>
                      {session.isComplete
                        ? 'Finish Lesson'
                        : feedback.isCorrect
                        ? 'Proceed to Next Activity'
                        : 'Review Remediation'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation for non-question activities (EXPLAIN, WORKED_EXAMPLE, REMEDIATION, SUMMARY) */}
        {!isQuestionActivity && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {currentAct.type === 'EXPLAIN' && (
              <button
                type="button"
                onClick={handleExplainDifferently}
                disabled={isExplainingDifferently}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isExplainingDifferently ? 'Synthesizing Alternative...' : 'Explain Differently'}</span>
              </button>
            )}

            <div className="ml-auto flex items-center space-x-3">
              {currentAct.type === 'SUMMARY' ? (
                <button
                  onClick={onLessonComplete}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish & Return to Curriculum</span>
                </button>
              ) : (
                <button
                  onClick={handleAdvanceNonQuestion}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
                >
                  <span>
                    {currentAct.type === 'EXPLAIN'
                      ? 'I Understand — Practice Problem'
                      : currentAct.type === 'REMEDIATION'
                      ? 'I See the Distinction — Try Follow-up Challenge'
                      : 'Continue'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
