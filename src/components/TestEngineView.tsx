import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Concept, ConceptMastery, Question, Subject, TestRecord, Topic } from '../types.ts';
import { MathMarkdown } from './MathMarkdown.tsx';
import { QuestionBlock } from './learning/QuestionBlock.tsx';
import { BuildProgress, Button, ConfirmDialog, EmptyState, Field, Meter, Notice, PageHeader, Segmented, Select } from './ui/index.ts';
import { api, errMsg, fmtDate, MISTAKE_LABEL, plural, postJson, tidyTitle } from '../lib/format.ts';

interface TestEngineViewProps {
  subjects: Subject[];
  topics: Topic[];
  concepts: Concept[];
  masteryMap: Record<string, ConceptMastery>;
  onStartLearn: (conceptId: string) => void;
  onDataChanged?: () => void;
}

type TestType = 'TOPIC_TEST' | 'CUMULATIVE_TEST' | 'MOCK_EXAM';
const EASE = [0.2, 0, 0, 1] as const;
const TYPE_INFO: Record<TestType, string> = {
  CUMULATIVE_TEST: 'Questions from across the concepts you have studied in this subject.',
  TOPIC_TEST: 'Questions focused on a single topic.',
  MOCK_EXAM: 'A longer mixed paper covering the subject, like a full exam.',
};

export const TestEngineView: React.FC<TestEngineViewProps> = ({ subjects, topics, concepts, masteryMap, onStartLearn, onDataChanged }) => {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<TestType>('CUMULATIVE_TEST');
  const [topicId, setTopicId] = useState('');
  const [assembling, setAssembling] = useState(false);
  const [assemblyStep, setAssemblyStep] = useState(0);
  const [assemblyError, setAssemblyError] = useState<string | null>(null);

  const [active, setActive] = useState<{ testId: string; type: string; questions: Question[] } | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const startedAt = useRef<number>(Date.now());

  const [report, setReport] = useState<TestRecord | null>(null);
  const [history, setHistory] = useState<TestRecord[]>([]);

  useEffect(() => {
    if (subjects.length > 0 && !subjects.find((s) => s.id === subjectId)) setSubjectId(subjects[0].id);
  }, [subjects, subjectId]);

  const subjectTopics = useMemo(() => topics.filter((t) => t.subjectId === subjectId), [topics, subjectId]);
  // Reset the topic whenever the subject changes so a test never targets another subject's topic.
  useEffect(() => {
    if (!subjectTopics.find((t) => t.id === topicId)) setTopicId(subjectTopics[0]?.id || '');
  }, [subjectTopics, topicId]);

  const studied = useMemo(
    () => concepts.filter((c) => c.subjectId === subjectId && masteryMap[c.id] && masteryMap[c.id].status !== 'UNLEARNED' && masteryMap[c.id].totalAttempts > 0).length,
    [concepts, masteryMap, subjectId],
  );
  const blocked = (type !== 'TOPIC_TEST' && studied === 0) || (type === 'TOPIC_TEST' && !topicId);

  const fetchHistory = async () => {
    try { const d = await api('/api/tests/history'); setHistory(Array.isArray(d) ? d : []); } catch { /* history is optional */ }
  };
  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    if (!assembling) return;
    const t = setInterval(() => setAssemblyStep((s) => Math.min(2, s + 1)), 7000);
    return () => clearInterval(t);
  }, [assembling]);

  const start = async () => {
    setAssembling(true); setAssemblyStep(0); setReport(null); setAssemblyError(null);
    try {
      const data = await postJson('/api/tests/generate', { subjectId, type, topicId: type === 'TOPIC_TEST' ? topicId : undefined });
      if (!Array.isArray(data?.questions) || data.questions.length === 0) throw new Error('No questions could be prepared for this test.');
      setActive(data); setIndex(0); setAnswers({}); startedAt.current = Date.now();
    } catch (e) {
      setAssemblyError(errMsg(e, 'We could not assemble this test.'));
    } finally {
      setAssembling(false);
    }
  };

  const submit = async () => {
    if (!active) return;
    setSubmitting(true); setSubmitError(null); setConfirmSubmit(false);
    try {
      const rep = await postJson('/api/tests/submit', {
        testId: active.testId, subjectId, type: active.type,
        durationMinutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
        answers: active.questions.map((q) => ({ questionId: q.id, studentAnswer: answers[q.id] || '' })),
      });
      if (!rep || typeof rep.scorePercentage !== 'number') throw new Error('Your test could not be scored. Your answers are still here, so you can try again.');
      setReport(rep); setActive(null); fetchHistory(); onDataChanged?.();
    } catch (e) {
      setSubmitError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- taking a test ---------- */
  if (active) {
    const q = active.questions[index];
    const answered = active.questions.filter((x) => (answers[x.id] || '').trim()).length;
    const unanswered = active.questions.length - answered;
    const last = index === active.questions.length - 1;
    return (
      <div className="mx-auto max-w-[720px] space-y-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <p className="t-body font-medium tnum">Question {index + 1} of {active.questions.length}</p>
            <Button variant="tertiary" size="sm" onClick={() => setConfirmQuit(true)}>Quit test</Button>
          </div>
          <Meter value={index + 1} max={active.questions.length} tone="navy" height={4} label="Test progress" />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
            <QuestionBlock question={q} value={answers[q.id] || ''} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              onSubmit={() => !last && setIndex(index + 1)} submitLabel={null} heading={null} />
          </motion.div>
        </AnimatePresence>

        <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
          {active.questions.map((x, i) => {
            const has = (answers[x.id] || '').trim();
            return (
              <button key={x.id} type="button" onClick={() => setIndex(i)} aria-label={`Question ${i + 1}${has ? ', answered' : ''}`} aria-current={i === index ? 'step' : undefined}
                className={`grid size-8 place-items-center rounded-md border t-small tnum transition-colors ${i === index ? 'border-navy-800 bg-navy-900 text-white' : has ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-line-strong bg-surface text-ink-3 hover:bg-sunken'}`}>
                {i + 1}
              </button>
            );
          })}
        </nav>

        {submitError && <Notice tone="error">{submitError}</Notice>}

        <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
          <Button onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>Previous</Button>
          {last ? (
            <Button variant="primary" size="lg" loading={submitting} onClick={() => (unanswered > 0 ? setConfirmSubmit(true) : submit())}>Submit test</Button>
          ) : (
            <Button variant="primary" size="lg" onClick={() => setIndex(index + 1)}>Next</Button>
          )}
        </div>

        <ConfirmDialog open={confirmQuit} onClose={() => setConfirmQuit(false)} tone="danger" confirmLabel="Quit test" title="Quit this test?"
          description="Your answers will be discarded. Nothing is recorded." onConfirm={() => { setActive(null); }} />
        <ConfirmDialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)} confirmLabel="Submit anyway" title="Submit with unanswered questions?"
          description={`You have ${plural(unanswered, 'question')} without an answer. They will be marked incorrect.`} onConfirm={submit} />
      </div>
    );
  }

  /* ---------- report ---------- */
  if (report) {
    const strong = report.strongConcepts || [], weak = report.weakConcepts || [], breakdown = Object.entries(report.mistakeBreakdown || {});
    const findConcept = (name: string) => concepts.find((c) => c.name === name);
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }} className="space-y-10">
        <PageHeader title="Your results" description={report.title} />
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <div><p className="t-small text-ink-3">Score</p><p className="t-display tnum">{Math.round(report.scorePercentage)}%</p></div>
          <div><p className="t-small text-ink-3">Correct</p><p className="t-title tnum">{report.correctCount} of {report.totalQuestions}</p></div>
          {report.durationMinutes > 0 && <div><p className="t-small text-ink-3">Time</p><p className="t-title tnum">{Math.round(report.durationMinutes)} min</p></div>}
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          <section><h2 className="t-h2">Strong</h2>
            {strong.length ? <ul className="mt-3 divide-y divide-line border-y border-line">{strong.map((n) => <li key={n} className="py-2.5 t-body break-words"><MathMarkdown content={tidyTitle(n)} inline /></li>)}</ul> : <p className="mt-3 t-body text-ink-3">No concepts stood out yet.</p>}
          </section>
          <section><h2 className="t-h2">Needs work</h2>
            {weak.length ? (
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {weak.map((n) => { const c = findConcept(n); return (
                  <li key={n} className="flex items-center gap-3 py-2.5"><span className="min-w-0 flex-1 t-body break-words"><MathMarkdown content={tidyTitle(n)} inline /></span>{c && <Button size="sm" onClick={() => onStartLearn(c.id)}>Study</Button>}</li>
                ); })}
              </ul>
            ) : <p className="mt-3 t-body text-ink-3">Nothing needs attention from this test.</p>}
          </section>
        </div>
        {breakdown.length > 0 && (
          <section><h2 className="t-h2">Where marks were lost</h2>
            <dl className="mt-3 divide-y divide-line border-y border-line">{breakdown.map(([k, v]) => <div key={k} className="flex justify-between py-2.5 t-body"><dt>{MISTAKE_LABEL[k] || k}</dt><dd className="tnum text-ink-2">{v}</dd></div>)}</dl>
          </section>
        )}
        <Button variant="primary" onClick={() => setReport(null)}>Back to tests</Button>
      </motion.div>
    );
  }

  /* ---------- configure ---------- */
  return (
    <div className="space-y-10">
      <PageHeader title="Tests" description="See how well you can apply what you've learned." />

      {subjects.length === 0 ? (
        <EmptyState title="No subjects yet" description="Add notes first. Tests are built from your curriculum." />
      ) : (
        <section aria-label="New test" className="max-w-xl space-y-6">
          <Field label="Subject" htmlFor="t-subject">
            <Select id="t-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>{subjects.map((s) => <option key={s.id} value={s.id}>{tidyTitle(s.name)}</option>)}</Select>
          </Field>
          <div className="space-y-1.5">
            <p className="t-small font-medium">Type</p>
            <Segmented label="Test type" value={type} onChange={setType} options={[{ value: 'CUMULATIVE_TEST', label: 'Cumulative' }, { value: 'TOPIC_TEST', label: 'Topic' }, { value: 'MOCK_EXAM', label: 'Mock exam' }]} />
            <p className="t-small text-ink-3">{TYPE_INFO[type]}</p>
          </div>
          {type === 'TOPIC_TEST' && (
            <Field label="Topic" htmlFor="t-topic">
              <Select id="t-topic" value={topicId} onChange={(e) => setTopicId(e.target.value)}>{subjectTopics.map((t) => <option key={t.id} value={t.id}>{tidyTitle(t.title)}</option>)}</Select>
            </Field>
          )}
          {blocked && type !== 'TOPIC_TEST' && <Notice tone="info">Study at least one concept in this subject before taking this kind of test.</Notice>}
          {assemblyError && <Notice tone="error" title="We couldn't assemble this test">{assemblyError}</Notice>}
          {assembling ? (
            <BuildProgress steps={['Choosing concepts to test', 'Writing questions from your notes', 'Assembling your test']} active={assemblyStep} note="This can take up to a minute." />
          ) : (
            <Button variant="primary" size="lg" onClick={start} disabled={blocked}>Start test</Button>
          )}
        </section>
      )}

      {history.length > 0 && (
        <section aria-label="Past tests">
          <h2 className="t-h2">Past tests</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {history.slice().reverse().slice(0, 8).map((h) => (
              <li key={h.id} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1"><p className="t-body font-medium truncate">{h.title}</p><p className="t-small text-ink-3">{fmtDate(h.completedAt)}</p></div>
                <p className="t-small text-ink-3 tnum">{h.correctCount}/{h.totalQuestions}</p>
                <p className="w-12 text-right t-body font-semibold tnum">{Math.round(h.scorePercentage)}%</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
