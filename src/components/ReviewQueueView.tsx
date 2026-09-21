import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Concept, ConceptMastery, Question } from '../types.ts';
import { MathMarkdown } from './MathMarkdown.tsx';
import { QuestionBlock } from './learning/QuestionBlock.tsx';
import { FeedbackData, FeedbackPanel } from './learning/FeedbackPanel.tsx';
import { Button, EmptyState, MasteryRing, Notice, PageHeader, Skeleton } from './ui/index.ts';
import { api, dueLabel, errMsg, plural, postJson, tidyTitle } from '../lib/format.ts';

interface ReviewQueueItem { concept: Concept; mastery: ConceptMastery; }

interface ReviewQueueViewProps {
  onStartLesson: (conceptId: string) => void;
  onDataChanged?: () => void;
}

const EASE = [0.2, 0, 0, 1] as const;

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({ onStartLesson, onDataChanged }) => {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [active, setActive] = useState<ReviewQueueItem | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQs, setLoadingQs] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchQueue = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setLoadError(null);
    try {
      const data = await api('/api/review/queue');
      setQueue(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(errMsg(e, 'We could not load your reviews.'));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchQueue(); }, []);

  const startSession = async (item: ReviewQueueItem) => {
    setActive(item); setQuestions([]); setQIndex(0); setAnswer(''); setFeedback(null); setSessionError(null); setSubmitError(null);
    setLoadingQs(true);
    try {
      const data = await api(`/api/curriculum/concept/${item.concept.id}`);
      if (Array.isArray(data?.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions([{
          id: `q-rev-${item.concept.id}`, conceptId: item.concept.id, subjectId: item.concept.subjectId, topicId: item.concept.topicId,
          category: 'RECALL', type: 'OPEN_EXPLANATION',
          questionText: `State the primary definition and core formula for ${item.concept.name}.`,
          correctAnswer: item.concept.definitions?.[0] || item.concept.explanation,
          explanation: item.concept.explanation, sourcePage: item.concept.sourcePage,
        } as Question]);
      }
    } catch (e) {
      setSessionError(errMsg(e, 'We could not load questions for this concept.'));
    } finally {
      setLoadingQs(false);
    }
  };

  const submit = async () => {
    const q = questions[qIndex];
    if (!active || !q || !answer.trim() || submitting) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const data = await postJson('/api/learn/submit-attempt', { questionId: q.id, conceptId: active.concept.id, studentAnswer: answer });
      if (typeof data?.isCorrect !== 'boolean') throw new Error('Your answer could not be graded. Please try again.');
      setFeedback({ isCorrect: data.isCorrect, feedbackText: data.feedback, correctAnswer: data.correctAnswer, explanation: data.explanation });
      onDataChanged?.();
    } catch (e) {
      setSubmitError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    setFeedback(null); setAnswer('');
    if (qIndex < questions.length - 1) setQIndex(qIndex + 1);
    else { setActive(null); fetchQueue(true); }
  };

  /* ---------- active session ---------- */
  if (active) {
    const q = questions[qIndex];
    return (
      <div className="mx-auto max-w-[720px]">
        <Button variant="tertiary" size="sm" icon={<ArrowLeft className="size-4" />} className="-ml-3" onClick={() => { setActive(null); fetchQueue(true); }}>Back to reviews</Button>
        <header className="mt-8">
          <p className="t-small text-ink-3">{tidyTitle(active.concept.subjectName)}</p>
          <h1 className="t-title mt-2 break-words"><MathMarkdown content={tidyTitle(active.concept.name)} inline /></h1>
          {questions.length > 1 && <p className="mt-2 t-small text-ink-3 tnum">Question {qIndex + 1} of {questions.length}</p>}
        </header>
        <div className="mt-10">
          {loadingQs && <div className="space-y-3" role="status"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>}
          {sessionError && (
            <Notice tone="error" title="We couldn't load this review" action={<Button size="sm" onClick={() => startSession(active)}>Try again</Button>}>{sessionError}</Notice>
          )}
          {q && !loadingQs && (
            <motion.div key={q.id + qIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: EASE }} className="space-y-8">
              <QuestionBlock question={q} value={answer} onChange={setAnswer} onSubmit={submit} submitting={submitting} disabled={Boolean(feedback)} submitLabel={feedback ? null : 'Check answer'} heading="Recall" />
              {submitError && <Notice tone="error">{submitError}</Notice>}
              {feedback && <FeedbackPanel feedback={feedback} onContinue={next} continueLabel={qIndex < questions.length - 1 ? 'Next question' : 'Finish review'} />}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- queue ---------- */
  return (
    <div className="space-y-8">
      <PageHeader
        title="Review"
        description="Bring back what you've learned before it fades. Concepts appear here when they're due."
        actions={queue.length > 0 ? <Button variant="primary" onClick={() => startSession(queue[0])}>Start reviewing</Button> : undefined}
      />

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : loadError ? (
        <Notice tone="error" title="We couldn't load your reviews" action={<Button size="sm" onClick={() => fetchQueue()}>Try again</Button>}>{loadError}</Notice>
      ) : queue.length === 0 ? (
        <EmptyState title="No reviews due" description="You're caught up for today. New reviews appear as your concepts come due." />
      ) : (
        <section aria-label="Due reviews">
          <p className="mb-3 t-small text-ink-3 tnum">{plural(queue.length, 'concept')} ready for review</p>
          <ul className="divide-y divide-line border-y border-line">
            {queue.map((item) => (
              <li key={item.concept.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <MasteryRing status={item.mastery.status} score={item.mastery.score} />
                  <div className="min-w-0">
                    <p className="t-body font-medium break-words"><MathMarkdown content={tidyTitle(item.concept.name)} inline /></p>
                    <p className="t-small text-ink-3">{tidyTitle(item.concept.subjectName)}<span className="mx-2 text-line-strong" aria-hidden>|</span>{dueLabel(item.mastery.nextReviewDue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-8 sm:pl-0">
                  <Button variant="tertiary" size="sm" onClick={() => onStartLesson(item.concept.id)}>Relearn</Button>
                  <Button variant="secondary" size="sm" onClick={() => startSession(item)}>Review</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
