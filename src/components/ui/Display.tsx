import React, { useEffect, useId, useState } from 'react';
import { motion } from 'motion/react';
import { Check, CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { Spinner } from './Button.tsx';

/* ---------- Notice ---------- */
const TONES = {
  info: { bg: 'bg-brand-50', fg: 'text-brand-700', Icon: Info },
  success: { bg: 'bg-ok-soft', fg: 'text-ok', Icon: CircleCheck },
  warn: { bg: 'bg-warn-soft', fg: 'text-warn', Icon: TriangleAlert },
  error: { bg: 'bg-bad-soft', fg: 'text-bad', Icon: CircleAlert },
} as const;

export function Notice({ tone = 'info', title, children, action, className = '' }: {
  tone?: keyof typeof TONES; title?: string; children?: React.ReactNode; action?: React.ReactNode; className?: string;
}) {
  const t = TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-md px-4 py-3 ${t.bg} ${className}`}>
      <t.Icon aria-hidden className={`mt-0.5 size-[18px] shrink-0 ${t.fg}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="t-body font-medium text-ink">{title}</p>}
        {children && <div className={`t-small text-ink-2 ${title ? 'mt-0.5' : ''}`}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ title, description, action, className = '' }: {
  title: string; description?: string; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`mx-auto flex max-w-sm flex-col items-center py-16 text-center ${className}`}>
      <h2 className="t-h2">{title}</h2>
      {description && <p className="mt-2 t-body text-ink-3 text-pretty">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

/* ---------- Page header ---------- */
export function PageHeader({ title, description, actions, className = '' }: {
  title: string; description?: string; actions?: React.ReactNode; className?: string;
}) {
  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        <h1 className="t-display">{title}</h1>
        {description && <p className="mt-2 t-body text-ink-3 max-w-[60ch] text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ---------- Meter ---------- */
export function Meter({ value, max = 100, tone = 'brand', height = 6, label, className = '' }: {
  value: number; max?: number; tone?: 'brand' | 'navy' | 'soft' | 'ok'; height?: number; label?: string; className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const fill = tone === 'navy' ? 'bg-navy-800' : tone === 'soft' ? 'bg-brand-200' : tone === 'ok' ? 'bg-ok' : 'bg-brand-600';
  return (
    <div
      role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)}
      className={`w-full overflow-hidden rounded-full bg-sunken ${className}`} style={{ height }}
    >
      <motion.div className={`h-full rounded-full ${fill}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }} />
    </div>
  );
}

/* ---------- Mastery ring ---------- */
export function MasteryRing({ status, score = 0, size = 18 }: { status: string; score?: number; size?: number }) {
  const label = status === 'MASTERED' ? 'Mastered' : status === 'UNLEARNED' ? 'Not started' : status === 'DEVELOPING' ? 'Developing' : 'Learning';
  if (status === 'MASTERED') {
    return (
      <svg width={size} height={size} viewBox="0 0 18 18" role="img" aria-label={label} className="shrink-0">
        <circle cx="9" cy="9" r="8.5" fill="#1b2a4a" />
        <path d="M5.4 9.2l2.4 2.4 4.8-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  const frac = status === 'UNLEARNED' ? 0 : status === 'DEVELOPING' ? 0.6 : 0.28;
  const a = frac * Math.PI * 2;
  const x = 9 + 4.6 * Math.sin(a), y = 9 - 4.6 * Math.cos(a);
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" role="img" aria-label={label} className="shrink-0">
      <circle cx="9" cy="9" r="7.6" fill="none" stroke="#c9d1e0" strokeWidth="1.6" />
      {frac > 0 && <path d={`M9 9 L9 4.4 A4.6 4.6 0 ${frac > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`} fill="#2b57cc" />}
    </svg>
  );
}

/* ---------- Collapse (animated height, lazy mount) ---------- */
export function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  const [seen, setSeen] = useState(open);
  useEffect(() => { if (open) setSeen(true); }, [open]);
  return (
    <div className={`grid transition-[grid-template-rows] duration-200 ease-out-soft ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="min-h-0 overflow-hidden" aria-hidden={!open} inert={!open ? true : undefined}>
        {seen ? children : null}
      </div>
    </div>
  );
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string | number>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md bg-sunken p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)} type="button" role="radio" aria-checked={active} onClick={() => onChange(o.value)}
            className={`relative h-8 rounded-[8px] px-3 text-[13px] font-medium transition-colors ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}
          >
            {active && (
              <motion.span layoutId={id} className="absolute inset-0 rounded-[8px] bg-surface shadow-[0_0_0_1px_var(--color-line)]" transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }} />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Build progress (meaningful long-running steps) ---------- */
export function BuildProgress({ steps, active, note }: { steps: string[]; active: number; note?: string }) {
  return (
    <div role="status" aria-live="polite">
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const done = i < active, current = i === active;
          return (
            <li key={s} className={`flex items-center gap-3 t-body transition-colors ${done || current ? 'text-ink' : 'text-ink-4'}`}>
              <span className="grid size-5 place-items-center">
                {done ? <Check className="size-4 text-brand-600" /> : current ? <Spinner className="text-brand-600" /> : <span className="size-2 rounded-full bg-line-strong" />}
              </span>
              {s}
            </li>
          );
        })}
      </ol>
      {note && <p className="mt-4 t-small text-ink-3">{note}</p>}
    </div>
  );
}
