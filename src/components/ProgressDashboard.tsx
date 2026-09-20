import React from 'react';
import { Subject, Concept, ConceptMastery } from '../types.ts';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Layers,
  BookOpen,
  Award,
} from 'lucide-react';

interface ProgressDashboardProps {
  subjects: Subject[];
  concepts: Concept[];
  masteryMap: Record<string, ConceptMastery>;
  metrics: {
    totalConcepts: number;
    coveredConcepts: number;
    masteredConcepts: number;
    developingConcepts: number;
    learningConcepts: number;
    unlearnedConcepts: number;
    coveragePercentage: number;
    masteryPercentage: number;
    averageMasteryScore: number;
    overdueReviewsCount: number;
  };
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  subjects,
  concepts,
  masteryMap,
  metrics,
}) => {
  const coverageGap = metrics.coveragePercentage - metrics.masteryPercentage;

  return (
    <div className="space-y-6">
      {/* Top Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Learning Progress
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track concepts studied, retention levels, and practice consistency across all subjects.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center sm:text-right shrink-0">
            <div className="text-xs font-semibold text-slate-500 uppercase">Demonstrated Mastery</div>
            <div
              className={`text-3xl sm:text-4xl font-extrabold font-mono mt-0.5 ${
                metrics.masteryPercentage >= 75
                  ? 'text-emerald-600'
                  : metrics.masteryPercentage >= 50
                  ? 'text-indigo-600'
                  : 'text-slate-800'
              }`}
            >
              {metrics.masteryPercentage}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {metrics.masteredConcepts} of {metrics.totalConcepts} concepts mastered
            </div>
          </div>
        </div>

        {/* Coverage vs Mastery Split Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
          <div className="flex justify-between text-xs sm:text-sm font-semibold">
            <span className="text-slate-700">
              Curriculum Coverage: <strong className="text-slate-900">{metrics.coveragePercentage}%</strong>
            </span>
            <span className="text-indigo-700">
              Demonstrated Mastery: <strong>{metrics.masteryPercentage}%</strong>
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative border border-slate-200">
            {/* Coverage background bar */}
            <div
              className="bg-slate-300 h-full absolute top-0 left-0 transition-all rounded-full"
              style={{ width: `${metrics.coveragePercentage}%` }}
            />
            {/* Mastery foreground bar */}
            <div
              className="bg-indigo-600 h-full absolute top-0 left-0 transition-all rounded-full"
              style={{ width: `${metrics.masteryPercentage}%` }}
            />
          </div>

          <div className="text-xs text-slate-500 pt-0.5">
            {coverageGap > 0
              ? `${coverageGap}% of curriculum has been seen and is ready for spaced review to strengthen retention.`
              : 'Coverage and mastery are currently in sync.'}
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Health Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Concepts
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1">
            {metrics.totalConcepts}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.unlearnedConcepts} untouched
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Mastered (85%+)
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 mt-1">
            {metrics.masteredConcepts}
          </div>
          <div className="text-xs text-slate-500 mt-1">Sustained retention</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
            Developing (60-84%)
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-sky-600 mt-1">
            {metrics.developingConcepts}
          </div>
          <div className="text-xs text-slate-500 mt-1">Under active review</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            Overdue Reviews
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${
              metrics.overdueReviewsCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {metrics.overdueReviewsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">At risk of memory decay</div>
        </div>
      </div>

      {/* Subject-by-Subject Mastery Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Subject-Level Mastery Status
        </h2>

        <div className="divide-y divide-slate-100">
          {subjects.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No subjects tracked yet. Upload your syllabus or notes in the Curriculum tab to monitor your learning progress.
            </div>
          ) : (
            subjects.map((sub) => {
            const subConcepts = concepts.filter((c) => c.subjectId === sub.id);
            const total = subConcepts.length;
            if (total === 0) return null;

            const mastered = subConcepts.filter(
              (c) => masteryMap[c.id]?.status === 'MASTERED'
            ).length;
            const covered = subConcepts.filter(
              (c) => (masteryMap[c.id]?.totalAttempts || 0) > 0
            ).length;
            const masteryPct = Math.round((mastered / total) * 100);
            const coveragePct = Math.round((covered / total) * 100);

            return (
              <div key={sub.id} className="py-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900">{sub.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {total} concepts in school syllabus
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-indigo-700 text-sm">
                      {masteryPct}% Mastered
                    </span>
                    <span className="text-slate-300 mx-2">•</span>
                    <span className="text-slate-600">{coveragePct}% Covered</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden relative border border-slate-200">
                  <div
                    className="bg-slate-300 h-full absolute top-0 left-0 rounded-full"
                    style={{ width: `${coveragePct}%` }}
                  />
                  <div
                    className="bg-indigo-600 h-full absolute top-0 left-0 rounded-full"
                    style={{ width: `${masteryPct}%` }}
                  />
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
};
