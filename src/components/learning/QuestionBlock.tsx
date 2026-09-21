import React from 'react';
import { Question } from '../../types.ts';
import { MathMarkdown } from '../MathMarkdown.tsx';
import { Button, Input, Textarea } from '../ui/index.ts';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Shared answer surface for lessons, reviews and mistake retests. */
export function QuestionBlock({ question, value, onChange, onSubmit, submitting = false, disabled = false, submitLabel = 'Check answer', heading = 'Try this' }: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  disabled?: boolean;
  submitLabel?: string | null;
  heading?: string | null;
}) {
  const locked = disabled || submitting;
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (value.trim() && !locked) onSubmit(); }}
      className="space-y-5"
    >
      <div>
        {heading && <p className="t-small font-medium text-brand-700">{heading}</p>}
        <div className="mt-1 text-[1.125rem] font-medium leading-7 text-ink [&_p]:m-0 max-w-[62ch]">
          <MathMarkdown content={question.questionText} />
        </div>
      </div>

      {question.type === 'MULTIPLE_CHOICE' && question.options ? (
        <fieldset disabled={locked} className="space-y-2.5">
          <legend className="sr-only">Choose one answer</legend>
          {question.options.map((opt, i) => (
            <label
              key={opt + i}
              className="group flex cursor-pointer items-start gap-3 rounded-md border border-line-strong bg-surface px-4 py-3 transition-colors hover:border-ink-4 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:disabled]:cursor-default"
            >
              <input type="radio" name={`q-${question.id}`} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="peer sr-only" />
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-sm border border-line-strong t-micro font-semibold text-ink-3 transition-colors group-has-[:checked]:border-brand-600 group-has-[:checked]:bg-brand-600 group-has-[:checked]:text-white">
                {LETTERS[i]}
              </span>
              <span className="min-w-0 flex-1 t-body text-ink [&_p]:m-0"><MathMarkdown content={opt} inline /></span>
            </label>
          ))}
        </fieldset>
      ) : question.type === 'NUMERICAL' ? (
        <div className="flex max-w-xs items-center gap-3">
          <Input value={value} onChange={(e) => onChange(e.target.value)} disabled={locked} placeholder="Your answer" aria-label="Your answer" autoComplete="off" inputMode="text" />
          {question.units && <span className="t-body text-ink-3">{question.units}</span>}
        </div>
      ) : (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} disabled={locked} placeholder="Write your answer in your own words" aria-label="Your answer" className="max-w-[62ch]" />
      )}

      {submitLabel !== null && (
        <Button type="submit" variant="primary" size="lg" loading={submitting} disabled={!value.trim() || disabled}>
          {submitLabel}
        </Button>
      )}
    </form>
  );
}
