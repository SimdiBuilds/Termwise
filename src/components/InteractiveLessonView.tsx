import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { LessonActivity, LessonSessionState } from '../types.ts';
import { LessonContentRenderer } from './LessonContentRenderer.tsx';
import { MathMarkdown } from './MathMarkdown.tsx';
import { QuestionBlock } from './learning/QuestionBlock.tsx';
import { FeedbackData, FeedbackPanel } from './learning/FeedbackPanel.tsx';
import { Button, Notice, Skeleton } from './ui/index.ts';
import { errMsg, postJson, tidyTitle } from '../lib/format.ts';

interface InteractiveLessonViewProps {
  conceptId: string;
  onBackToCurriculum: () => void;
  onLessonComplete: () => void;
}

const EASE = [0.2, 0, 0, 1] as const;

export const InteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({ conceptId, onBackToCurriculum, onLessonComplete }) => {
  const [session, setSession] = useState<LessonSessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The server advances to the next activity as soon as an answer is graded. We hold that
  // next state back until the student has read the feedback for the question they answered.
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [answered, setAnswered] = useState<LessonActivity | null>(null);
  const [pending, setPending] = useState<LessonSessionState | null>(null);

  const [alt, setAlt] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setLoadError(null);
      try {
        const data = await postJson('/api/learn/lesson/start', { conceptId });
        if (cancelled) return;
        if (!data?.currentActivity) throw new Error('This lesson could not be prepared.');
        setSession(data); setFeedback(null); setAnswered(null); setPending(null); setAnswer(''); setAlt(null);
      } catch (e) {
        if (!cancelled) setLoadError(errMsg(e, 'This lesson could not be prepared.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [conceptId, attempt]);

  const shown: LessonActivity | null = answered ?? session?.currentActivity ?? null;
  useEffect(() => { window.scrollTo({ top: 0 }); setHintOpen(false); }, [shown?.id, session?.isComplete]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[720px] space-y-6" role="status" aria-live="polite">
        <p className="t-body text-ink-3">Preparing this lesson from your notes</p>
        <Skeleton className="h-9 w-3/4" />
        <div className="space-y-3 pt-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-2/3" /></div>
      </div>
    );
  }

  if (loadError || !session || !shown) {
    return (
      <div className="mx-auto max-w-[720px] space-y-6">
        <Notice tone="error" title="We couldn't start this lesson" action={<Button size="sm" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>}>
          {loadError || 'The lesson could not be prepared.'}
        </Notice>
        <Button variant="tertiary" icon={<ArrowLeft className="size-4" />} onClick={onBackToCurriculum}>Back to Learn</Button>
      </div>
    );
  }

  const isQuestion = Boolean(shown.question);

  const submit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true); setError(null);
    try {
      const data = await postJson('/api/learn/lesson/respond', { sessionId: session.sessionId, studentAnswer: answer });
      if (!data?.session) throw new Error('Your answer could not be recorded. Please try again.');
      if (data.feedback) {
        setAnswered(session.currentActivity);
        setFeedback(data.feedback);
        setPending(data.session);
      } else {
        setSession(data.session); setAnswer('');
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const advance = async () => {
    if (submitting) return;
    setSubmitting(true); setError(null);
    try {
      const data = await postJson('/api/learn/lesson/respond', { sessionId: session.sessionId, studentAnswer: 'CONTINUE' });
      if (!data?.session) throw new Error('The lesson could not continue. Please try again.');
      setSession(data.session); setAnswer(''); setAlt(null);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const afterFeedback = () => {
    if (pending) setSession(pending);
    setPending(null); setAnswered(null); setFeedback(null); setAnswer(''); setAlt(null);
  };

  const explainDifferently = async () => {
    if (explaining) return;
    setExplaining(true); setError(null);
    try {
      const data = await postJson('/api/learn/lesson/explain-differently', { conceptId: session.conceptId });
      if (data?.alternativeExplanation) setAlt(data.alternativeExplanation);
      else throw new Error('No alternative explanation is available right now.');
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setExplaining(false);
    }
  };

  /* ---------- completion ---------- */
  const finish = async () => {
    if (!session.isComplete) {
      try { await postJson('/api/learn/lesson/respond', { sessionId: session.sessionId, studentAnswer: 'CONTINUE' }); } catch { /* progress is already saved */ }
    }
    onLessonComplete();
  };

  if ((session.isComplete || shown.type === 'SUMMARY') && !feedback) {
    const graded = session.history.filter((h) => typeof h.isCorrect === 'boolean');
    const right = graded.filter((h) => h.isCorrect).length;
    return (
      <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }} className="mx-auto max-w-[720px] space-y-8">
        <header>
          <p className="t-small text-ink-3">{tidyTitle(session.subjectName)}</p>
          <h1 className="t-title mt-2 break-words"><MathMarkdown content={tidyTitle(session.conceptName)} inline /></h1>
        </header>
        <section className="space-y-4">
          <h2 className="t-h2">You've worked through this concept.</h2>
          {session.summaryMessage && <div className="lesson-body max-w-[62ch] text-ink-2"><MathMarkdown content={session.summaryMessage} /></div>}
          <dl className="flex flex-wrap gap-x-10 gap-y-3 pt-2">
            {graded.length > 0 && (<div><dt className="t-small text-ink-3">Answered correctly</dt><dd className="t-title tnum">{right} of {graded.length}</dd></div>)}
            {typeof session.masteryScore === 'number' && (<div><dt className="t-small text-ink-3">Mastery so far</dt><dd className="t-title tnum">{Math.round(session.masteryScore)}%</dd></div>)}
          </dl>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="lg" onClick={finish} data-autofocus>Finish</Button>
          <Button size="lg" onClick={onBackToCurriculum}>Back to Learn</Button>
        </div>
      </motion.article>
    );
  }

  return (
    <article className="mx-auto max-w-[720px]">
      <div className="flex items-center justify-between gap-4">
        <Button variant="tertiary" size="sm" icon={<ArrowLeft className="size-4" />} onClick={onBackToCurriculum} className="-ml-3">Exit lesson</Button>
        {session.sourceDocName && (
          <p className="hidden truncate t-small text-ink-3 sm:block">{session.sourceDocName}{session.sourcePage ? `, page ${session.sourcePage}` : ''}</p>
        )}
      </div>

      <header className="mt-8">
        <p className="t-small text-ink-3">{tidyTitle(session.subjectName)}</p>
        {(session.topicTitle || session.subtopicTitle) && (
          <p className="t-small text-ink-3 break-words">{tidyTitle(session.subtopicTitle || session.topicTitle)}</p>
        )}
        <h1 className="t-title mt-3 break-words"><MathMarkdown content={tidyTitle(session.conceptName)} inline /></h1>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${shown.id}-${feedback ? 'fb' : 'q'}`}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="mt-10 space-y-8"
        >
          {shown.content && (
            <section>
              {shown.title && shown.title.trim().toLowerCase() !== session.conceptName.trim().toLowerCase() && (
                <h2 className="t-h2 mb-2">{shown.title}</h2>
              )}
              {shown.instruction && !isQuestion && <p className="mb-4 t-body text-ink-3">{shown.instruction}</p>}
              <LessonContentRenderer content={shown.content} />
            </section>
          )}

          {alt && !isQuestion && (
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }} className="border-l-2 border-line-strong pl-5">
              <h3 className="t-h2 mb-2">Another way to see it</h3>
              <LessonContentRenderer content={alt} />
            </motion.section>
          )}

          {isQuestion && shown.question && (
            <section>
              {shown.instruction && !feedback && <p className="mb-4 t-body text-ink-3">{shown.instruction}</p>}
              <QuestionBlock
                question={shown.question}
                value={answer}
                onChange={setAnswer}
                onSubmit={submit}
                submitting={submitting}
                disabled={Boolean(feedback)}
                submitLabel={feedback ? null : 'Check answer'}
              />
              {!feedback && shown.hint && (
                <div className="mt-4">
                  <button type="button" onClick={() => setHintOpen((v) => !v)} aria-expanded={hintOpen} className="t-small font-medium text-brand-700 hover:underline">
                    {hintOpen ? 'Hide hint' : 'Show a hint'}
                  </button>
                  {hintOpen && <p className="mt-2 t-body text-ink-2 max-w-[62ch]"><MathMarkdown content={shown.hint} inline /></p>}
                </div>
              )}
            </section>
          )}

          {feedback && <FeedbackPanel feedback={feedback} onContinue={afterFeedback} />}

          {error && <Notice tone="error">{error}</Notice>}

          {!isQuestion && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" size="lg" onClick={advance} loading={submitting} data-autofocus>Continue</Button>
              {(shown.type === 'EXPLAIN' || shown.type === 'WORKED_EXAMPLE') && !alt && (
                <Button variant="tertiary" size="lg" onClick={explainDifferently} loading={explaining}>Explain it differently</Button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </article>
  );
};
