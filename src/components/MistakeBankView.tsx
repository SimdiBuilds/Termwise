import React, { useEffect, useMemo, useState } from 'react';
import { MistakeRecord, Question, Subject } from '../types.ts';
import { MathMarkdown } from './MathMarkdown.tsx';
import { QuestionBlock } from './learning/QuestionBlock.tsx';
import { FeedbackData, FeedbackPanel } from './learning/FeedbackPanel.tsx';
import { Button, Collapse, ConfirmDialog, EmptyState, Notice, PageHeader, RowMenu, Select, Skeleton, Toggle } from './ui/index.ts';
import { api, errMsg, fmtDate, MISTAKE_LABEL, MISTAKE_RANK, postJson, tidyTitle } from '../lib/format.ts';

interface MistakeBankViewProps {
  subjects: Subject[];
  onStartLearn: (conceptId: string) => void;
  onDataChanged?: () => void;
}

const RULE = ['border-line-strong', 'border-line-strong', 'border-brand-400', 'border-navy-800'];

export const MistakeBankView: React.FC<MistakeBankViewProps> = ({ subjects, onStartLearn, onDataChanged }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('ALL');
  const [showResolved, setShowResolved] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [practiceQ, setPracticeQ] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackData | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<MistakeRecord | null>(null);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setLoadError(null);
    try {
      const data = await api(`/api/mistakes${showResolved ? '' : '?resolved=false'}`);
      setMistakes(Array.isArray(data?.mistakes) ? data.mistakes : []);
    } catch (e) {
      setLoadError(errMsg(e, 'We could not load your mistakes.'));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [showResolved]);

  const types = useMemo(() => Array.from(new Set(mistakes.map((m) => m.mistakeType))), [mistakes]);
  const list = useMemo(
    () => mistakes
      .filter((m) => filterType === 'ALL' || m.mistakeType === filterType)
      .sort((a, b) => Number(a.resolved) - Number(b.resolved) || (MISTAKE_RANK[b.mistakeType] || 0) - (MISTAKE_RANK[a.mistakeType] || 0) || b.timestamp.localeCompare(a.timestamp)),
    [mistakes, filterType],
  );

  const openPractice = async (m: MistakeRecord) => {
    if (openId === m.id) { setOpenId(null); return; }
    setOpenId(m.id); setAnswer(''); setResult(null); setPracticeError(null); setPracticeQ(null);
    try {
      const data = await api(`/api/curriculum/concept/${m.conceptId}`);
      const q = (data?.questions || []).find((x: Question) => x.id === m.questionId);
      setPracticeQ(q || ({ id: m.questionId, conceptId: m.conceptId, subjectId: m.subjectId, topicId: m.topicId, category: 'RECALL', type: 'OPEN_EXPLANATION', questionText: m.questionText, correctAnswer: m.correctAnswer, explanation: '' } as Question));
    } catch (e) {
      setPracticeError(errMsg(e));
    }
  };

  const submit = async (m: MistakeRecord) => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true); setPracticeError(null);
    try {
      const data = await postJson('/api/learn/submit-attempt', { questionId: m.questionId, conceptId: m.conceptId, studentAnswer: answer });
      if (typeof data?.isCorrect !== 'boolean') throw new Error('Your answer could not be graded. Please try again.');
      setResult({ isCorrect: data.isCorrect, feedbackText: data.feedback, correctAnswer: data.correctAnswer, explanation: data.explanation });
      onDataChanged?.();
      if (data.isCorrect) load(true);
    } catch (e) {
      setPracticeError(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    await api(`/api/mistakes/${deleting.id}`, { method: 'DELETE' });
    setMistakes((ms) => ms.filter((m) => m.id !== deleting.id));
    onDataChanged?.();
  };

  const subjectName = (id: string) => tidyTitle(subjects.find((s) => s.id === id)?.name);

  return (
    <div className="space-y-8">
      <PageHeader title="Mistakes" description="What you're getting wrong, and how to fix it. The most important ones come first." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-56">
          <Select aria-label="Filter by type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="ALL">All types</option>
            {types.map((t) => <option key={t} value={t}>{MISTAKE_LABEL[t] || t}</option>)}
          </Select>
        </div>
        <Toggle label="Show corrected" checked={showResolved} onChange={setShowResolved} />
      </div>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      ) : loadError ? (
        <Notice tone="error" title="We couldn't load your mistakes" action={<Button size="sm" onClick={() => load()}>Try again</Button>}>{loadError}</Notice>
      ) : list.length === 0 ? (
        <EmptyState title="No mistakes to fix" description="Mistakes from lessons, reviews and tests appear here so you can practise them until they stick." />
      ) : (
        <ul className="space-y-1">
          {list.map((m) => {
            const open = openId === m.id;
            const rank = MISTAKE_RANK[m.mistakeType] || 1;
            return (
              <li key={m.id} className={`border-l-2 py-3 pl-5 ${m.resolved ? 'border-line' : RULE[rank]}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <p className="t-small text-ink-3">
                      {MISTAKE_LABEL[m.mistakeType] || m.mistakeType}
                      <span className="mx-2 text-line-strong" aria-hidden>|</span>{subjectName(m.subjectId)}
                      {m.resolved && <span className="ml-2 text-ok">Corrected</span>}
                    </p>
                    <h2 className="t-body font-semibold break-words"><MathMarkdown content={tidyTitle(m.conceptName)} inline /></h2>
                    <p className="mt-0.5 t-body text-ink-2 break-words">{m.diagnosis}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 sm:ml-3">
                    {!m.resolved && <Button variant="secondary" size="sm" onClick={() => openPractice(m)} aria-expanded={open}>{open ? 'Close' : 'Practise'}</Button>}
                    <RowMenu label={`Actions for ${m.conceptName}`} items={[
                      { label: 'Study concept', onSelect: () => onStartLearn(m.conceptId) },
                      { label: 'Delete', tone: 'danger', onSelect: () => setDeleting(m) },
                    ]} />
                  </div>
                </div>

                <Collapse open={open}>
                  <div className="max-w-[62ch] space-y-6 pb-2 pt-5">
                    <div className="space-y-3">
                      <h3 className="t-small font-medium text-ink-3">Why this matters</h3>
                      <p className="t-body text-ink-2">{m.targetedRemediation}</p>
                      <dl className="grid gap-3 t-body sm:grid-cols-2">
                        <div><dt className="t-small text-ink-3">You answered</dt><dd className="break-words"><MathMarkdown content={m.studentAnswer || 'No answer'} inline /></dd></div>
                        <div><dt className="t-small text-ink-3">Correct answer</dt><dd className="break-words"><MathMarkdown content={m.correctAnswer} inline /></dd></div>
                      </dl>
                      <p className="t-micro text-ink-4">Recorded {fmtDate(m.timestamp)}</p>
                    </div>
                    {practiceError && <Notice tone="error">{practiceError}</Notice>}
                    {practiceQ && open && (
                      <div className="space-y-6">
                        <QuestionBlock question={practiceQ} value={answer} onChange={setAnswer} onSubmit={() => submit(m)} submitting={submitting} disabled={Boolean(result)} submitLabel={result ? null : 'Check answer'} heading="Practise this mistake" />
                        {result && <FeedbackPanel feedback={result} onContinue={result.isCorrect ? () => setOpenId(null) : () => { setResult(null); setAnswer(''); }} continueLabel={result.isCorrect ? 'Done' : 'Try again'} />}
                      </div>
                    )}
                  </div>
                </Collapse>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting} onClose={() => setDeleting(null)} tone="danger" confirmLabel="Delete" onConfirm={remove}
        title="Delete this mistake?" description="It will no longer appear here or in your plan. This can't be undone."
      />
    </div>
  );
};
