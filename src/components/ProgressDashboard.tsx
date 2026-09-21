import React from 'react';
import { Concept, ConceptMastery, Subject } from '../types.ts';
import { EmptyState, Meter, PageHeader } from './ui/index.ts';
import { plural, tidyTitle } from '../lib/format.ts';

interface ProgressDashboardProps {
  subjects: Subject[];
  concepts: Concept[];
  masteryMap: Record<string, ConceptMastery>;
  metrics: {
    totalConcepts: number; coveredConcepts: number; masteredConcepts: number; developingConcepts: number;
    learningConcepts: number; unlearnedConcepts: number; overdueReviewsCount: number;
  };
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ subjects, concepts, masteryMap, metrics }) => {
  if (metrics.totalConcepts === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title="Progress" description="How much of your curriculum you've genuinely mastered." />
        <EmptyState title="No curriculum yet" description="Add your notes and your progress will be tracked here." />
      </div>
    );
  }

  const rows = subjects.map((s) => {
    const cs = concepts.filter((c) => c.subjectId === s.id);
    const encountered = cs.filter((c) => masteryMap[c.id] && masteryMap[c.id].totalAttempts > 0).length;
    const mastered = cs.filter((c) => masteryMap[c.id]?.status === 'MASTERED').length;
    return { s, total: cs.length, encountered, mastered };
  }).filter((r) => r.total > 0);

  return (
    <div className="space-y-12">
      <PageHeader title="Progress" description="How much of your curriculum you've genuinely mastered." />

      <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
        <section aria-labelledby="cur-h">
          <h2 id="cur-h" className="t-small font-medium text-ink-3">Curriculum</h2>
          <p className="mt-2 flex items-baseline gap-2"><span className="t-display tnum">{metrics.coveredConcepts}</span><span className="t-body text-ink-3 tnum">/ {metrics.totalConcepts} concepts encountered</span></p>
          <Meter className="mt-4" value={metrics.coveredConcepts} max={metrics.totalConcepts} tone="soft" label="Concepts encountered" />
          <p className="mt-3 t-small text-ink-3 max-w-[44ch]">Concepts you have started studying. This shows coverage, not understanding.</p>
        </section>
        <section aria-labelledby="mas-h">
          <h2 id="mas-h" className="t-small font-medium text-ink-3">Mastery</h2>
          <p className="mt-2 flex items-baseline gap-2"><span className="t-display tnum">{metrics.masteredConcepts}</span><span className="t-body text-ink-3 tnum">/ {metrics.totalConcepts} concepts meeting the mastery standard</span></p>
          <Meter className="mt-4" value={metrics.masteredConcepts} max={metrics.totalConcepts} tone="navy" label="Concepts mastered" />
          <p className="mt-3 t-small text-ink-3 max-w-[44ch]">A concept counts once you answer correctly across question types and again on a later review.</p>
        </section>
      </div>

      <dl className="flex flex-wrap gap-x-10 gap-y-3 border-y border-line py-4">
        <div><dt className="t-small text-ink-3">Developing</dt><dd className="t-h2 tnum">{metrics.developingConcepts}</dd></div>
        <div><dt className="t-small text-ink-3">Learning</dt><dd className="t-h2 tnum">{metrics.learningConcepts}</dd></div>
        <div><dt className="t-small text-ink-3">Not started</dt><dd className="t-h2 tnum">{metrics.unlearnedConcepts}</dd></div>
        {metrics.overdueReviewsCount > 0 && <div><dt className="t-small text-ink-3">Reviews due</dt><dd className="t-h2 tnum">{metrics.overdueReviewsCount}</dd></div>}
      </dl>

      {rows.length > 0 && (
        <section aria-labelledby="sub-h">
          <h2 id="sub-h" className="t-h2">By subject</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {rows.map(({ s, total, encountered, mastered }) => (
              <li key={s.id} className="grid gap-x-10 gap-y-3 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center">
                <div className="min-w-0"><p className="t-body font-semibold break-words">{tidyTitle(s.name)}</p><p className="t-small text-ink-3">{plural(total, 'concept')}</p></div>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3"><span className="w-24 shrink-0 t-small text-ink-3">Encountered</span><Meter value={encountered} max={total} tone="soft" height={4} label={`${s.name} encountered`} /><span className="w-16 shrink-0 text-right t-small tnum text-ink-2">{encountered}/{total}</span></div>
                  <div className="flex items-center gap-3"><span className="w-24 shrink-0 t-small text-ink-3">Mastered</span><Meter value={mastered} max={total} tone="navy" height={4} label={`${s.name} mastered`} /><span className="w-16 shrink-0 text-right t-small tnum text-ink-2">{mastered}/{total}</span></div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
