import React, { useState, useEffect } from 'react';
import { MistakeRecord, MistakeClassification, Subject } from '../types.ts';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Filter,
  ArrowRight,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { MathMarkdown } from './MathMarkdown.tsx';

interface MistakeBankViewProps {
  subjects: Subject[];
  onStartLearn: (conceptId: string) => void;
}

export const MistakeBankView: React.FC<MistakeBankViewProps> = ({ subjects, onStartLearn }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [stats, setStats] = useState<{
    totalRecorded: number;
    unresolvedCount: number;
    resolvedCount: number;
    byType: Record<string, number>;
  }>({ totalRecorded: 0, unresolvedCount: 0, resolvedCount: 0, byType: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null);
  const [retestAnswer, setRetestAnswer] = useState<string>('');
  const [isRetesting, setIsRetesting] = useState(false);
  const [retestResult, setRetestResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  // Confirm Dialog State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const handleDeleteMistake = async (mistakeId: string) => {
    try {
      const res = await fetch(`/api/mistakes/${mistakeId}`, { method: 'DELETE' });
      if (res.ok) {
        setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
        if (selectedMistake?.id === mistakeId) {
          setSelectedMistake(null);
        }
        await fetchMistakes();
      }
    } catch (err) {
      console.error('Failed to delete mistake:', err);
    }
  };

  const fetchMistakes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/mistakes${showResolved ? '' : '?resolved=false'}`);
      const data = await res.json();
      setMistakes(data.mistakes || []);
      setStats(data.stats || { totalRecorded: 0, unresolvedCount: 0, resolvedCount: 0, byType: {} });
    } catch (err) {
      console.error('Failed to load mistakes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakes();
  }, [showResolved]);

  const handleRetestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retestAnswer.trim() || !selectedMistake || isRetesting) return;

    setIsRetesting(true);
    try {
      const res = await fetch('/api/learn/submit-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedMistake.questionId,
          conceptId: selectedMistake.conceptId,
          studentAnswer: retestAnswer,
        }),
      });

      const data = await res.json();
      setRetestResult({
        isCorrect: data.isCorrect,
        feedback: data.feedback,
      });

      if (data.isCorrect) {
        fetchMistakes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRetesting(false);
    }
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (filterType !== 'ALL' && m.mistakeType !== filterType) return false;
    return true;
  });

  const getTaxonomyBadgeStyle = (type: MistakeClassification) => {
    switch (type) {
      case 'MISCONCEPTION':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'KNOWLEDGE_GAP':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'CALCULATION_ERROR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RECALL_FAILURE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'APPLICATION_FAILURE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
            Diagnostic Error Repository
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Mistake Bank</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Every academic error is classified by root cause and turned into targeted remediation.
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex items-center space-x-3 text-xs font-semibold shrink-0">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <strong>{stats.unresolvedCount}</strong> Unresolved
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
            <strong>{stats.resolvedCount}</strong> Corrected
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="font-semibold text-slate-500 uppercase flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Type:
          </span>
          {[
            'ALL',
            'MISCONCEPTION',
            'KNOWLEDGE_GAP',
            'CALCULATION_ERROR',
            'RECALL_FAILURE',
            'APPLICATION_FAILURE',
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-medium ${
                filterType === type
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Include Resolved</span>
          </label>
        </div>
      </div>

      {/* Re-test Modal */}
      {selectedMistake && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-amber-500 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Targeted Remediation Check • {selectedMistake.mistakeType}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {selectedMistake.conceptName}
              </h2>
            </div>
            <button
              onClick={() => {
                setSelectedMistake(null);
                setRetestResult(null);
                setRetestAnswer('');
              }}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs sm:text-sm space-y-1.5">
            <div className="text-slate-600 font-semibold uppercase text-xs">Original Diagnosis:</div>
            <div className="text-slate-800"><MathMarkdown content={selectedMistake.diagnosis} /></div>
            <div className="text-amber-900 font-semibold uppercase text-xs pt-1">Remediation Rule:</div>
            <div className="text-amber-900 font-medium"><MathMarkdown content={selectedMistake.targetedRemediation} /></div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 uppercase">Question to resolve:</div>
            <div className="text-sm sm:text-base font-semibold text-slate-900"><MathMarkdown content={selectedMistake.questionText} /></div>
          </div>

          {!retestResult ? (
            <form onSubmit={handleRetestSubmit} className="space-y-3.5">
              <label className="block text-xs font-medium text-slate-700">
                Your corrected solution / response:
              </label>
              <input
                type="text"
                value={retestAnswer}
                onChange={(e) => setRetestAnswer(e.target.value)}
                placeholder="Apply the remediation rule and provide the accurate answer..."
                className="w-full text-sm border border-slate-300 rounded-lg p-3 font-mono focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => onStartLearn(selectedMistake.conceptId)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Open Full Lesson
                </button>
                <button
                  type="submit"
                  disabled={isRetesting || !retestAnswer.trim()}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 shadow-xs"
                >
                  {isRetesting ? 'Evaluating Fix...' : 'Verify Correction'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center space-x-2">
                {retestResult.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-bold text-sm text-slate-900">
                  {retestResult.isCorrect
                    ? 'Mistake Successfully Corrected!'
                    : 'Issue Persists — Additional Review Needed'}
                </span>
              </div>
              <p className="text-sm text-slate-700">{retestResult.feedback}</p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setSelectedMistake(null);
                    setRetestResult(null);
                    setRetestAnswer('');
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mistakes List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Loading Mistake Bank records...
          </div>
        ) : filteredMistakes.length > 0 ? (
          filteredMistakes.map((m) => (
            <div
              key={m.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-colors ${
                m.resolved
                  ? 'border-slate-200 bg-slate-50/60 opacity-70'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase ${getTaxonomyBadgeStyle(
                        m.mistakeType
                      )}`}
                    >
                      {m.mistakeType.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-base text-slate-900">
                      {m.conceptName}
                    </span>
                    {m.resolved && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Corrected
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(m.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-sm text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="font-semibold text-slate-600 text-xs mb-1 uppercase">
                      Tested Question:
                    </div>
                    <MathMarkdown content={m.questionText} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                      <span className="text-red-900 font-semibold block mb-0.5 uppercase">
                        Your Answer:
                      </span>
                      <div className="text-slate-800 text-xs font-mono">
                        <MathMarkdown content={m.studentAnswer} inline />
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <span className="text-emerald-900 font-semibold block mb-0.5 uppercase">
                        Model Answer:
                      </span>
                      <div className="text-slate-800 text-xs font-mono">
                        <MathMarkdown content={m.correctAnswer} inline />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-xs sm:text-sm space-y-1">
                    <div>
                      <strong className="text-slate-700">Diagnosis: </strong>
                      <span className="text-slate-700">{m.diagnosis}</span>
                    </div>
                    <div>
                      <strong className="text-amber-900">Remediation Rule: </strong>
                      <span className="text-slate-900 font-semibold"><MathMarkdown content={m.targetedRemediation} inline /></span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => {
                      setSelectedMistake(m);
                      setRetestResult(null);
                      setRetestAnswer('');
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  >
                    Re-test Fix
                  </button>

                  <button
                    onClick={() => onStartLearn(m.conceptId)}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors"
                  >
                    Study Concept
                  </button>

                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: 'Delete Mistake Entry?',
                        message: `Remove this mistake record for "${m.conceptName}" from your Mistake Bank?`,
                        confirmLabel: 'Delete',
                        onConfirm: async () => {
                          await handleDeleteMistake(m.id);
                        },
                      });
                    }}
                    title="Delete mistake"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">
              No Unresolved Mistakes
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your mistake bank is clean. As you complete lessons and tests, any errors will be cataloged here with explicit diagnoses.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isLoading={isConfirmLoading}
        onConfirm={async () => {
          setIsConfirmLoading(true);
          try {
            await confirmModal.onConfirm();
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          } catch (err: any) {
            console.error(err);
          } finally {
            setIsConfirmLoading(false);
          }
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
