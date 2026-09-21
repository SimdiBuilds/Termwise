import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DailyStudyPlan, StudyPlanItem, StudyPlanItemType, Subject } from '../types.ts';
import { Button, EmptyState, Meter, Segmented } from './ui/index.ts';
import { greeting, plural, stripPlanPrefix, termStatus } from '../lib/format.ts';

interface HomeViewProps {
  plan: DailyStudyPlan | null;
  subjects: Subject[];
  metrics: { overdueReviewsCount: number };
  termStartDate?: string;
  termEndDate?: string;
  onToggleItem: (itemId: string) => void;
  onRefreshPlan: (minutes: number) => void;
  onStartTask: (item: StudyPlanItem) => void;
  onOpenNotes: () => void;
  onOpenLearn: () => void;
}

const CATEGORY: Record<StudyPlanItemType, string> = {
  NEW_LEARN: 'Continue learning',
  SPACED_REVIEW: 'Review',
  MISTAKE_REMEDIATION: 'Needs attention',
  TOPIC_TEST: 'Test',
  MIXED_RETRIEVAL: 'Practice',
};
const CTA: Record<StudyPlanItemType, string> = {
  NEW_LEARN: 'Start', SPACED_REVIEW: 'Review', MISTAKE_REMEDIATION: 'Practice', TOPIC_TEST: 'Start test', MIXED_RETRIEVAL: 'Practice',
};

function TermLine({ fraction, label }: { fraction: number; label: string }) {
  return (
    <div className="relative h-3 w-32" role="img" aria-label={label}>
      <div className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
      <motion.div className="absolute left-0 top-1/2 h-px bg-navy-800" initial={{ width: 0 }} animate={{ width: `${fraction * 100}%` }} transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }} />
      <motion.div className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-800" initial={{ left: 0 }} animate={{ left: `${fraction * 100}%` }} transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }} />
      <div className="absolute right-0 top-1/2 h-2 w-px -translate-y-1/2 bg-line-strong" />
    </div>
  );
}

function CheckButton({ done, onToggle, label }: { done: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button" role="checkbox" aria-checked={done} aria-label={label} onClick={onToggle}
      className={`grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-150 ${done ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-surface hover:border-brand-500'}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <motion.path d="M5.5 12.5l4.5 4.5L18.5 7.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
          initial={false} animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }} />
      </svg>
    </button>
  );
}

export const HomeView: React.FC<HomeViewProps> = ({
  plan, metrics, termStartDate, termEndDate, onToggleItem, onRefreshPlan, onStartTask, onOpenNotes, onOpenLearn,
}) => {
  const term = termStatus(termEndDate, termStartDate);
  const items = plan?.items ?? [];
  const pending = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);
  const [primary, ...rest] = pending;

  const support = (it: StudyPlanItem): string => {
    switch (it.type) {
      case 'NEW_LEARN': return 'Learn the next concept.';
      case 'SPACED_REVIEW':
        return metrics.overdueReviewsCount > 0 ? `${plural(metrics.overdueReviewsCount, 'concept')} ready for review.` : 'A concept is ready for review.';
      case 'MISTAKE_REMEDIATION': return 'You have an unresolved mistake here.';
      case 'TOPIC_TEST': return 'Check how well you can apply this topic.';
      default: return 'Mixed practice across what you have studied.';
    }
  };

  const minutes = useMemo(() => [45, 60, 90, 120], []);
  const target = plan?.targetMinutes ?? 90;
  const options = minutes.includes(target) ? minutes : [...minutes, target].sort((a, b) => a - b);

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="t-display">{greeting()}</h1>
          <p className="mt-2 t-body text-ink-3">Here's what matters today.</p>
        </div>
        {term && (
          <div className="flex items-center gap-4">
            <div className="md:text-right">
              <p className="t-body font-medium tnum">{term.label}</p>
              <p className="t-small text-ink-3">{term.ended ? `Ended ${term.endLabel}` : `Term ends ${term.endLabel}`}</p>
            </div>
            <TermLine fraction={term.fraction} label={`${Math.round(term.fraction * 100)} percent of the term has passed`} />
          </div>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing planned yet"
          description="Add your school notes and Termwise will build your curriculum and a plan for each day."
          action={<Button variant="primary" onClick={onOpenNotes}>Add notes</Button>}
        />
      ) : (
        <section aria-labelledby="plan-heading" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 id="plan-heading" className="t-h2">Today's plan</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="t-small text-ink-3 tnum">{plan?.completedMinutes ?? 0} of {target} min</span>
                <Meter value={plan?.completedMinutes ?? 0} max={target} tone="navy" height={4} className="!w-20" label="Study minutes completed today" />
              </div>
              <Segmented label="Daily study minutes" value={target} options={options.map((m) => ({ value: m, label: String(m) }))} onChange={onRefreshPlan} />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {primary ? (
              <motion.section
                key={primary.id}
                aria-labelledby="up-next"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                className="rounded-lg bg-navy-900 p-6 text-white sm:p-8"
              >
                <div className="flex items-center gap-3 t-small text-white/65">
                  <span>{CATEGORY[primary.type]}</span>
                  <span aria-hidden className="h-3 w-px bg-white/25" />
                  <span className="truncate">{primary.subjectName}</span>
                </div>
                <h3 id="up-next" className="t-title mt-2 break-words">{stripPlanPrefix(primary.title)}</h3>
                <p className="mt-2 t-body max-w-[52ch] text-white/75">{support(primary)}</p>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Button variant="inverse" size="lg" onClick={() => onStartTask(primary)}>{CTA[primary.type]}</Button>
                  <span className="t-small text-white/65 tnum">{primary.estimatedMinutes} min</span>
                  <Button variant="onDark" size="sm" className="sm:ml-auto" onClick={() => onToggleItem(primary.id)}>Mark as done</Button>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="all-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                className="rounded-lg border border-line bg-surface p-6 sm:p-8"
              >
                <h3 className="t-title">You're done for today.</h3>
                <p className="mt-2 t-body text-ink-3 max-w-[52ch]">Everything in today's plan is complete. Tomorrow's plan will build on what you covered.</p>
                <div className="mt-6"><Button variant="secondary" onClick={onOpenLearn}>Keep learning</Button></div>
              </motion.section>
            )}
          </AnimatePresence>

          {rest.length > 0 && (
            <ul className="divide-y divide-line border-y border-line">
              {rest.map((it) => (
                <motion.li key={it.id} layout="position" transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                  className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 py-4 sm:grid-cols-[auto_1fr_auto]">
                  <CheckButton done={false} onToggle={() => onToggleItem(it.id)} label={`Mark ${stripPlanPrefix(it.title)} as done`} />
                  <div className="min-w-0">
                    <p className="t-small text-ink-3">{CATEGORY[it.type]}<span className="mx-2 text-line-strong" aria-hidden>|</span>{it.subjectName}</p>
                    <p className="t-body font-medium break-words">{stripPlanPrefix(it.title)}</p>
                    <p className="t-small text-ink-3">{support(it)}</p>
                  </div>
                  <div className="col-start-2 flex items-center gap-4 sm:col-start-auto">
                    <span className="t-small text-ink-3 tnum">{it.estimatedMinutes} min</span>
                    <Button variant="secondary" size="sm" onClick={() => onStartTask(it)}>{CTA[it.type]}</Button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <div className="pt-2">
              <h2 className="t-small font-medium text-ink-3">Done today</h2>
              <ul className="mt-2 divide-y divide-line">
                {done.map((it) => (
                  <li key={it.id} className="flex items-center gap-4 py-3">
                    <CheckButton done onToggle={() => onToggleItem(it.id)} label={`Mark ${stripPlanPrefix(it.title)} as not done`} />
                    <span className="strike t-body min-w-0 flex-1" data-done="true"><span className="break-words">{stripPlanPrefix(it.title)}</span></span>
                    <span className="t-small text-ink-4 tnum">{it.estimatedMinutes} min</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
