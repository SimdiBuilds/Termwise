import React, { useState, useEffect } from 'react';
import { Subject, Topic, Concept, ConceptMastery, TestRecord, Question } from '../types.ts';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  RotateCcw,
  BarChart2,
  BookOpen,
} from 'lucide-react';
import { MathMarkdown } from './MathMarkdown.tsx';

interface TestEngineViewProps {
  subjects: Subject[];
  topics: Topic[];
  concepts: Concept[];
  masteryMap: Record<string, ConceptMastery>;
  onStartLearn: (conceptId: string) => void;
}

export const TestEngineView: React.FC<TestEngineViewProps> = ({
  subjects,
  topics,
  concepts,
  masteryMap,
  onStartLearn,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [testType, setTestType] = useState<'TOPIC_TEST' | 'CUMULATIVE_TEST' | 'MOCK_EXAM'>('CUMULATIVE_TEST');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [assemblyError, setAssemblyError] = useState<string | null>(null);
  const [isAssembling, setIsAssembling] = useState(false);
  const [activeTest, setActiveTest] = useState<{
    testId: string;
    type: string;
    questions: Question[];
  } | null>(null);

  useEffect(() => {
    if (subjects.length > 0 && (!selectedSubjectId || !subjects.find((s) => s.id === selectedSubjectId))) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Set default topic if topic test is chosen
  useEffect(() => {
    const subjectTopics = topics.filter((t) => t.subjectId === selectedSubjectId);
    if (subjectTopics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(subjectTopics[0].id);
    }
  }, [selectedSubjectId, testType, topics, selectedTopicId]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedReport, setCompletedReport] = useState<TestRecord | null>(null);
  const [history, setHistory] = useState<TestRecord[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/tests/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartTest = async () => {
    setIsAssembling(true);
    setCompletedReport(null);
    setAssemblyError(null);
    try {
      const res = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          type: testType,
          topicId: testType === 'TOPIC_TEST' ? selectedTopicId : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate test.');
      }

      const data = await res.json();
      setActiveTest(data);
      setCurrentQIndex(0);
      setAnswers({});
    } catch (err: any) {
      console.error(err);
      setAssemblyError(err.message || 'An unexpected error occurred during test assembly.');
    } finally {
      setIsAssembling(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setIsSubmitting(true);
    try {
      const payloadAnswers = activeTest.questions.map((q) => ({
        questionId: q.id,
        studentAnswer: answers[q.id] || '',
      }));

      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: activeTest.testId,
          subjectId: selectedSubjectId,
          type: activeTest.type,
          answers: payloadAnswers,
        }),
      });

      const report: TestRecord = await res.json();
      setCompletedReport(report);
      setActiveTest(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectTopics = topics.filter((t) => t.subjectId === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Evaluation & Examination Readiness
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-purple-600" />
            <span>Curriculum Tests & Mock Exams</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Topic tests, cumulative multi-chapter assessments, and full-term mock examinations.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-800">
          Completed: <strong>{history.length}</strong> tests
        </div>
      </div>

      {/* Test Assembly Configuration */}
      {subjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <FileCheck2 className="w-10 h-10 text-purple-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">
            No Subjects Configured for Testing
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Upload your syllabus or lecture notes in the Curriculum tab to generate topic assessments, cumulative tests, and examination simulations.
          </p>
        </div>
      ) : !activeTest && !completedReport && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Configure Assessment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-hidden"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assessment Level
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-hidden"
              >
                <option value="CUMULATIVE_TEST">Cumulative Test (All Topics Covered)</option>
                <option value="TOPIC_TEST">Single Topic Check</option>
                <option value="MOCK_EXAM">Full-Term Mock Exam</option>
              </select>
            </div>

            {testType === 'TOPIC_TEST' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-hidden"
                >
                  <option value="">Select Topic...</option>
                  {subjectTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Automatic Assessment Scoping Details */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            {(() => {
              const targetConcepts = concepts.filter((c) => {
                if (testType === 'TOPIC_TEST') {
                  return c.topicId === selectedTopicId && c.subjectId === selectedSubjectId;
                }
                return c.subjectId === selectedSubjectId;
              });

              const totalCount = targetConcepts.length;
              const coveredCount = targetConcepts.filter((c) => {
                const m = masteryMap[c.id];
                return m && m.status !== 'UNLEARNED' && m.totalAttempts > 0;
              }).length;

              if (testType === 'CUMULATIVE_TEST') {
                if (coveredCount === 0) {
                  return (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>No Active Course Coverage Detected yet!</strong>
                        <p className="text-amber-700 mt-1 leading-relaxed">
                          The Cumulative Test is locked to topics you have covered. You currently have <strong>0 studied concepts</strong> in this subject. To unlock cumulative test review, go to the <strong>'Learn'</strong> tab and start a lesson!
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    <span>📚 Spaced Practice: Cumulative test will exclusively focus on the {coveredCount} concept(s) you have studied in your topics (No unlearned topics will be shown).</span>
                  </div>
                );
              }

              if (testType === 'TOPIC_TEST') {
                return (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold">
                    <BookOpen className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                    <span>🎯 Single Topic Check: This test covers all {totalCount} concept(s) within the selected topic (both learned and unlearned).</span>
                  </div>
                );
              }

              // MOCK_EXAM
              return (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-purple-50 border border-purple-100 text-purple-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4.5 h-4.5 text-purple-600 shrink-0" />
                  <span>🎓 Complete Mock: Test draws questions from across the entire subject curriculum (all {totalCount} syllabus concepts).</span>
                </div>
              );
            })()}

            {assemblyError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Assembly Error:</strong>
                  <p className="text-rose-700 mt-0.5">{assemblyError}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            {(() => {
              const targetConcepts = concepts.filter((c) => {
                if (testType === 'TOPIC_TEST') {
                  return c.topicId === selectedTopicId && c.subjectId === selectedSubjectId;
                }
                return c.subjectId === selectedSubjectId;
              });
              const coveredCount = targetConcepts.filter((c) => {
                const m = masteryMap[c.id];
                return m && m.status !== 'UNLEARNED' && m.totalAttempts > 0;
              }).length;
              const isCumulativeDisabled = testType === 'CUMULATIVE_TEST' && coveredCount === 0;

              return (
                <button
                  onClick={handleStartTest}
                  disabled={isAssembling || isCumulativeDisabled}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isAssembling ? 'Assembling Test...' : 'Assemble & Start Test'}</span>
                </button>
              );
            })()}
          </div>
        </div>
      )}

      {/* Active Test Taking View */}
      {activeTest && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                {activeTest.type.replace('_', ' ')}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Question {currentQIndex + 1} of {activeTest.questions.length}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-mono">
                {Object.keys(answers).length} of {activeTest.questions.length} answered
              </span>
              <button
                onClick={() => setActiveTest(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-1 border border-slate-200 rounded-lg"
              >
                Quit Test
              </button>
            </div>
          </div>

          {/* Question Display */}
          {activeTest.questions[currentQIndex] && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Category: {activeTest.questions[currentQIndex].category} • Page {activeTest.questions[currentQIndex].sourcePage || 1}
                </div>
                <div className="text-base font-semibold text-slate-900">
                  <MathMarkdown content={activeTest.questions[currentQIndex].questionText} />
                </div>
              </div>

              {/* Answers */}
              {activeTest.questions[currentQIndex].type === 'MULTIPLE_CHOICE' &&
              activeTest.questions[currentQIndex].options ? (
                <div className="space-y-2">
                  {activeTest.questions[currentQIndex].options?.map((opt, idx) => {
                    const qId = activeTest.questions[currentQIndex].id;
                    const isSelected = answers[qId] === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswerSelect(qId, opt)}
                        className={`w-full text-left flex items-center space-x-3 p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-purple-50 text-purple-900 font-semibold border-purple-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className="font-mono text-xs w-5 text-slate-400">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className="text-sm flex-1"><MathMarkdown content={opt} inline /></span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your calculated answer:
                  </label>
                  <input
                    type="text"
                    value={answers[activeTest.questions[currentQIndex].id] || ''}
                    onChange={(e) =>
                      handleAnswerSelect(
                        activeTest.questions[currentQIndex].id,
                        e.target.value
                      )
                    }
                    placeholder="Enter answer..."
                    className="w-full text-sm border border-slate-300 rounded-lg p-3 font-mono focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-hidden"
                  />
                </div>
              )}

              {/* Navigation within test */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQIndex < activeTest.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(currentQIndex + 1)}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-xs"
                  >
                    {isSubmitting ? 'Grading Assessment...' : 'Finalize & Submit Test'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Test Diagnostic Report */}
      {completedReport && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Assessment Diagnostic Analysis
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{completedReport.title}</h2>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-3xl font-extrabold font-mono text-purple-700">
                {completedReport.scorePercentage}%
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {completedReport.correctCount} / {completedReport.totalQuestions} correct
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strong Concepts */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Demonstrated Strengths
              </h3>
              {completedReport.strongConcepts.length > 0 ? (
                <ul className="text-sm text-slate-800 space-y-1 list-disc list-inside">
                  {completedReport.strongConcepts.map((c, i) => (
                    <li key={i} className="font-medium">{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 italic">No concepts met full accuracy criteria.</p>
              )}
            </div>

            {/* Weak Concepts */}
            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
                Diagnosed Weaknesses (Logged to Mistake Bank)
              </h3>
              {completedReport.weakConcepts.length > 0 ? (
                <ul className="text-sm text-slate-800 space-y-1 list-disc list-inside">
                  {completedReport.weakConcepts.map((c, i) => (
                    <li key={i} className="font-medium">{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 italic">Zero errors detected on this test.</p>
              )}
            </div>
          </div>

          {/* Mistake Taxonomy Breakdown */}
          {Object.keys(completedReport.mistakeBreakdown).length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-slate-700 uppercase tracking-wider">
                Error Class Distribution:
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(completedReport.mistakeBreakdown).map(([k, v]) => (
                  <span
                    key={k}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-mono text-slate-800"
                  >
                    {k}: <strong>{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setCompletedReport(null)}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Back to Assessments
            </button>
          </div>
        </div>
      )}

      {/* Historical Test Results */}
      {history.length > 0 && !activeTest && !completedReport && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Past Test Records
          </h3>
          <div className="divide-y divide-slate-100 text-sm">
            {history.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{t.title}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="text-slate-500 font-mono text-xs">
                    {new Date(t.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-mono font-bold text-purple-700">
                  {t.scorePercentage}% ({t.correctCount}/{t.totalQuestions})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
