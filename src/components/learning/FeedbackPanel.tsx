import React from 'react';
import { motion } from 'motion/react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { MathMarkdown } from '../MathMarkdown.tsx';
import { Button } from '../ui/index.ts';

export interface FeedbackData {
  isCorrect: boolean;
  feedbackText?: string;
  correctAnswer?: string;
  explanation?: string;
  remediationSummary?: string;
}

const clean = (t: string | undefined, correct: boolean) =>
  (t || '').replace(correct ? /^\s*correct[!.:,]?\s*/i : /^\s*(incorrect|not quite|wrong)[!.:,]?\s*/i, '').trim();

/** Calm, useful feedback. Correct = quiet confirmation; incorrect = what matters, not a red alarm. */
export function FeedbackPanel({ feedback, onContinue, continueLabel = 'Continue', showAnswer = true }: {
  feedback: FeedbackData; onContinue?: () => void; continueLabel?: string; showAnswer?: boolean;
}) {
  const ok = feedback.isCorrect;
  const body = clean(feedback.feedbackText, ok) || (ok ? 'You applied the concept correctly.' : '');
  return (
    <motion.section
      aria-live="polite"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
      className={`border-l-2 pl-5 ${ok ? 'border-ok' : 'border-warn'}`}
    >
      <h3 className="flex items-center gap-2 t-h2">
        {ok ? <CircleCheck aria-hidden className="size-5 text-ok" /> : <CircleAlert aria-hidden className="size-5 text-warn" />}
        {ok ? 'Correct' : 'Not quite'}
      </h3>
      {body && <div className="lesson-body mt-2 max-w-[62ch] text-ink-2 [&_p:last-child]:mb-0"><MathMarkdown content={body} /></div>}
      {!ok && showAnswer && feedback.correctAnswer && !body.toLowerCase().includes(feedback.correctAnswer.toLowerCase().slice(0, 40)) && (
        <p className="mt-3 t-body">
          <span className="text-ink-3">Answer </span>
          <span className="font-medium"><MathMarkdown content={feedback.correctAnswer} inline /></span>
        </p>
      )}
      {!ok && feedback.explanation && !body.includes(feedback.explanation.slice(0, 40)) && (
        <div className="lesson-body mt-3 max-w-[62ch] text-ink-2 [&_p:last-child]:mb-0"><MathMarkdown content={feedback.explanation} /></div>
      )}
      {onContinue && (
        <div className="mt-5">
          <Button variant="primary" size="lg" onClick={onContinue} data-autofocus>{continueLabel}</Button>
        </div>
      )}
    </motion.section>
  );
}
