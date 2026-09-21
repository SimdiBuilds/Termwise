import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, FileText, Upload, X } from 'lucide-react';
import { ClassifiedSubjectGroup } from '../types.ts';
import { Logo } from './brand/Logo.tsx';
import { BuildProgress, Button, Field, Input, Notice, Segmented } from './ui/index.ts';
import { errMsg, localDate, plural } from '../lib/format.ts';
import { safeParseJson } from '../utils.ts';

interface TermOnboardingProps {
  onComplete: () => void | Promise<void>;
  /** Present when setup is restarted from Settings; first-run setup cannot be cancelled. */
  onCancel?: () => void;
}

type Stage = 'materials' | 'term' | 'target' | 'processing' | 'verification' | 'ready';
const LABELS = ['Your materials', 'Your term', 'Your study target', 'Building your system'];
const STAGE_INDEX: Record<Stage, number> = { materials: 0, term: 1, target: 2, processing: 3, verification: 3, ready: 3 };
const ACCEPT = ['.pdf', '.txt', '.md', '.docx'];
const EASE = [0.2, 0, 0, 1] as const;
const PRESETS = [30, 45, 60, 90, 120];

const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);
const plus = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return localDate(d); };

export const TermOnboarding: React.FC<TermOnboardingProps> = ({ onComplete, onCancel }) => {
  const [stage, setStage] = useState<Stage>('materials');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [termEndDate, setTermEndDate] = useState(plus(90));
  const [preset, setPreset] = useState<number | 'custom'>(60);
  const [custom, setCustom] = useState('75');
  const [groups, setGroups] = useState<ClassifiedSubjectGroup[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const minutes = preset === 'custom' ? Math.round(Number(custom)) : preset;
  const minutesOk = Number.isFinite(minutes) && minutes >= 15 && minutes <= 600;
  const today = useMemo(() => localDate(), []);

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    const ok = incoming.filter((f) => ACCEPT.some((ext) => f.name.toLowerCase().endsWith(ext)));
    const rejected = incoming.length - ok.length;
    setFileError(rejected ? `${plural(rejected, 'file')} skipped. Termwise reads PDF, Word (.docx), text and Markdown files.` : null);
    setFiles((prev) => [...prev, ...ok.filter((f) => !prev.some((p) => p.name === f.name && p.size === f.size))]);
  };

  const classify = async () => {
    setStage('processing'); setStep(0); setError(null);
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    try {
      const t = setTimeout(() => setStep(1), 4000);
      const res = await fetch('/api/onboarding/classify-batch', { method: 'POST', body: form });
      clearTimeout(t);
      const data = await safeParseJson(res);
      setGroups(data.groups || []); setFailed(data.failedFiles || []);
      setStep(2);
      setTimeout(() => setStage('verification'), 500);
    } catch (e) {
      setError(errMsg(e, 'We could not read these files.'));
      setStage('materials');
    }
  };

  const build = async () => {
    setStage('processing'); setStep(2); setError(null);
    const t = setTimeout(() => setStep(3), 12000);
    try {
      const res = await fetch('/api/onboarding/confirm-and-build', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups, termEndDate, targetStudyMinutesPerDay: minutes }),
      });
      const data = await safeParseJson(res);
      setSummary(data.summary || null); setStep(4);
      setTimeout(() => setStage('ready'), 500);
    } catch (e) {
      setError(errMsg(e, 'We could not finish building your term.'));
      setStage('verification');
    } finally {
      clearTimeout(t);
    }
  };

  const rename = (i: number, name: string) => setGroups((g) => g.map((x, j) => (j === i ? { ...x, subjectName: name } : x)));
  const removeFile = (gi: number, id: string) => setGroups((g) => g.map((x, j) => (j === gi ? { ...x, files: x.files.filter((f) => f.id !== id) } : x)).filter((x) => x.files.length > 0));

  const idx = STAGE_INDEX[stage];
  const canCancel = !!onCancel && stage !== 'processing' && stage !== 'ready';

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8 sm:py-12">
        <header className="flex items-center justify-between">
          <Logo variant="horizontal" size={40} />
          {canCancel && <Button variant="tertiary" size="sm" onClick={onCancel}>Cancel</Button>}
        </header>

        <ol aria-label="Setup progress" className="mt-10 flex items-center gap-2 sm:gap-3">
          {LABELS.map((l, i) => (
            <li key={l} aria-current={i === idx ? 'step' : undefined} className="flex flex-1 flex-col gap-2">
              <span className={`h-0.5 rounded-full transition-colors duration-300 ${i <= idx ? 'bg-brand-600' : 'bg-line-strong'}`} />
              <span className={`t-micro sm:t-small font-medium transition-colors ${i === idx ? 'text-ink' : i < idx ? 'text-ink-3' : 'text-ink-4'}`}>{l}</span>
            </li>
          ))}
        </ol>

        <main className="flex-1 pt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE }} className="space-y-8">
              {stage === 'materials' && (
                <>
                  <div><h1 className="t-display">Add your school notes.</h1><p className="mt-2 t-body text-ink-3 max-w-[48ch]">Upload the notes or scheme of work for each subject. Termwise turns them into a curriculum.</p></div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
                    onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
                    className={`rounded-lg border border-dashed px-6 py-12 text-center transition-colors ${over ? 'border-brand-500 bg-brand-50' : 'border-line-strong bg-surface'}`}
                  >
                    <Upload aria-hidden className="mx-auto size-6 text-ink-3" />
                    <input ref={inputRef} id="ob-files" type="file" multiple accept={ACCEPT.join(',')} className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
                    <label htmlFor="ob-files" className="mt-3 block cursor-pointer t-body font-medium text-brand-700 hover:underline">Choose files</label>
                    <p className="mt-1 t-small text-ink-3">or drop them here. PDF, Word, text or Markdown.</p>
                  </div>
                  {fileError && <Notice tone="warn">{fileError}</Notice>}
                  {error && <Notice tone="error" title="We couldn't read these files">{error}</Notice>}
                  {files.length > 0 && (
                    <ul className="divide-y divide-line border-y border-line">
                      {files.map((f, i) => (
                        <li key={f.name + i} className="flex items-center gap-3 py-3">
                          <FileText aria-hidden className="size-5 shrink-0 text-ink-3" />
                          <div className="min-w-0 flex-1"><p className="t-body font-medium truncate">{f.name}</p><p className="t-small text-ink-3">{fmtSize(f.size)}</p></div>
                          <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="grid size-8 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink"><X className="size-4" /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button variant="primary" size="lg" disabled={files.length === 0} onClick={() => setStage('term')}>Continue</Button>
                </>
              )}

              {stage === 'term' && (
                <>
                  <div><h1 className="t-display">When does your term end?</h1><p className="mt-2 t-body text-ink-3 max-w-[48ch]">Termwise paces your plan backwards from this date.</p></div>
                  <Field label="Term end date" htmlFor="ob-end"><Input id="ob-end" type="date" min={today} value={termEndDate} onChange={(e) => setTermEndDate(e.target.value)} className="max-w-[14rem]" /></Field>
                  <div className="flex gap-3"><Button size="lg" onClick={() => setStage('materials')}>Back</Button><Button variant="primary" size="lg" disabled={!termEndDate || termEndDate < today} onClick={() => setStage('target')}>Continue</Button></div>
                </>
              )}

              {stage === 'target' && (
                <>
                  <div><h1 className="t-display">How much will you study each day?</h1><p className="mt-2 t-body text-ink-3 max-w-[48ch]">You can change this any time in Settings.</p></div>
                  <div className="space-y-4">
                    <Segmented label="Daily study time" value={preset} onChange={setPreset} options={[...PRESETS.map((m) => ({ value: m as number | 'custom', label: `${m} min` })), { value: 'custom' as const, label: 'Custom' }]} />
                    {preset === 'custom' && (
                      <Field label="Minutes per day" htmlFor="ob-custom" error={!minutesOk ? 'Enter a number between 15 and 600.' : null}>
                        <Input id="ob-custom" type="number" min={15} max={600} value={custom} onChange={(e) => setCustom(e.target.value)} className="max-w-[10rem]" />
                      </Field>
                    )}
                  </div>
                  <div className="flex gap-3"><Button size="lg" onClick={() => setStage('term')}>Back</Button><Button variant="primary" size="lg" disabled={!minutesOk} onClick={classify}>Build my term</Button></div>
                </>
              )}

              {stage === 'processing' && (
                <>
                  <div><h1 className="t-display">Building your system.</h1><p className="mt-2 t-body text-ink-3">This takes a moment. You can leave this page open.</p></div>
                  <BuildProgress steps={['Reading your notes', 'Identifying your subjects', 'Building your curriculum', 'Planning your first days']} active={Math.min(step, 3)} />
                </>
              )}

              {stage === 'verification' && (
                <>
                  <div><h1 className="t-display">Check your subjects.</h1><p className="mt-2 t-body text-ink-3 max-w-[48ch]">Termwise grouped your notes like this. Rename a subject or remove a file if something looks wrong.</p></div>
                  {failed.length > 0 && <Notice tone="warn" title="Some files couldn't be read">{failed.join(', ')}. Text-based PDFs and Word documents work best.</Notice>}
                  {error && <Notice tone="error" title="We couldn't finish building your term">{error}</Notice>}
                  {groups.length === 0 ? (
                    <Notice tone="error" title="No readable notes were found" action={<Button size="sm" onClick={() => setStage('materials')}>Choose files</Button>}>The files didn't contain readable text. Try a text-based PDF or another file.</Notice>
                  ) : (
                    <div className="space-y-6">
                      {groups.map((g, gi) => (
                        <section key={gi} className="space-y-2">
                          <Field label="Subject" htmlFor={`ob-s-${gi}`}><Input id={`ob-s-${gi}`} value={g.subjectName} onChange={(e) => rename(gi, e.target.value)} /></Field>
                          <ul className="divide-y divide-line border-y border-line">
                            {g.files.map((f) => (
                              <li key={f.id} className="flex items-center gap-3 py-2.5">
                                <FileText aria-hidden className="size-4 shrink-0 text-ink-3" />
                                <span className="min-w-0 flex-1 t-body truncate">{f.filename}</span>
                                {f.pageCount ? <span className="t-small text-ink-3 tnum">{plural(f.pageCount, 'page')}</span> : null}
                                <button type="button" aria-label={`Remove ${f.filename}`} onClick={() => removeFile(gi, f.id)} className="grid size-7 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink"><X className="size-4" /></button>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3"><Button size="lg" onClick={() => setStage('materials')}>Back</Button><Button variant="primary" size="lg" disabled={groups.length === 0 || groups.some((g) => !g.subjectName.trim())} onClick={build}>Build curriculum</Button></div>
                </>
              )}

              {stage === 'ready' && (
                <>
                  <div><h1 className="t-display">Your term is ready.</h1><p className="mt-2 t-body text-ink-3">Your curriculum and first study plan are in place.</p></div>
                  {summary && (
                    <dl className="flex flex-wrap gap-x-10 gap-y-4">
                      {([['subjectsCount', 'Subjects'], ['topicsCount', 'Topics'], ['conceptsCount', 'Concepts']] as const).filter(([k]) => typeof summary[k] === 'number').map(([k, label]) => (
                        <div key={k}><dt className="t-small text-ink-3">{label}</dt><dd className="t-title tnum">{summary[k]}</dd></div>
                      ))}
                    </dl>
                  )}
                  <Button variant="primary" size="lg" icon={<Check className="size-4" />} onClick={() => onComplete()}>Start studying</Button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
