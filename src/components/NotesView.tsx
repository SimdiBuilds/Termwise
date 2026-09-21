import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Concept, SourceDocument, Subject } from '../types.ts';
import { MathMarkdown } from './MathMarkdown.tsx';
import {
  BuildProgress, Button, Collapse, ConfirmDialog, Dialog, EmptyState, Field, FileDrop, Input, Notice,
  PageHeader, RowMenu, Segmented, Select, Textarea,
} from './ui/index.ts';
import { errMsg, fmtDate, plural, tidyTitle } from '../lib/format.ts';

interface NotesViewProps {
  subjects: Subject[];
  concepts: Concept[];
  documents: SourceDocument[];
  selectedSubjectId: string;
  onImportText: (subjectId: string, subjectName: string, text: string, title: string) => Promise<void>;
  onUploadPdf: (file: File, subjectId: string, subjectName: string) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onStartLearn: (conceptId: string) => void;
}

const STEPS = ['Reading your notes', 'Organizing your subjects', 'Building your curriculum'];
const NEW = '__new__';

export const NotesView: React.FC<NotesViewProps> = ({ subjects, concepts, documents, selectedSubjectId, onImportText, onUploadPdf, onDeleteDocument, onStartLearn }) => {
  const [filter, setFilter] = useState('ALL');
  const [openDoc, setOpenDoc] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<SourceDocument | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [mode, setMode] = useState<'pdf' | 'text'>('pdf');
  const [choice, setChoice] = useState(selectedSubjectId || NEW);
  const [newName, setNewName] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (addOpen) setChoice(selectedSubjectId || subjects[0]?.id || NEW); }, [addOpen]);
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 7000);
    return () => clearInterval(t);
  }, [busy]);

  const visible = useMemo(() => documents.filter((d) => filter === 'ALL' || d.subjectId === filter), [documents, filter]);
  const subjectName = (id: string) => tidyTitle(subjects.find((s) => s.id === id)?.name);
  const conceptsOf = (d: SourceDocument) => {
    const inSubject = concepts.filter((c) => c.subjectId === d.subjectId);
    const linked = inSubject.filter((c) => c.sourceDocument === d.title || c.sourceDocument === d.filename);
    const only = documents.filter((x) => x.subjectId === d.subjectId).length === 1;
    return (linked.length ? linked : only ? inSubject : []).filter((c) => !c.name.startsWith('%PDF')).sort((a, b) => (a.sourcePage || 9999) - (b.sourcePage || 9999));
  };

  const canSubmit = (mode === 'pdf' ? !!file : text.trim().length > 20) && (choice !== NEW || newName.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const chosen = choice === NEW ? { id: '', name: newName.trim() } : { id: choice, name: subjects.find((s) => s.id === choice)?.name || '' };
    setBusy(true); setStep(0); setError(null);
    try {
      if (mode === 'pdf' && file) await onUploadPdf(file, chosen.id, chosen.name);
      else await onImportText(chosen.id, chosen.name, text, title.trim() || 'Pasted notes');
      setAddOpen(false); setFile(null); setText(''); setTitle(''); setNewName('');
    } catch (err) {
      setError(errMsg(err, 'We could not process these notes.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notes"
        description="Where your material came from. Every concept traces back to a page in your notes."
        actions={<Button variant="primary" icon={<Plus className="size-4" />} onClick={() => { setError(null); setAddOpen(true); }}>Add notes</Button>}
      />

      {documents.length === 0 ? (
        <EmptyState title="No notes added yet" description="Upload a PDF or paste text from your school notes. Termwise turns them into a curriculum you can study." action={<Button variant="primary" onClick={() => setAddOpen(true)}>Add notes</Button>} />
      ) : (
        <>
          {subjects.length > 1 && (
            <div className="sm:w-64"><Select aria-label="Filter by subject" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{tidyTitle(s.name)}</option>)}
            </Select></div>
          )}
          <ul className="divide-y divide-line border-y border-line">
            {visible.map((d) => {
              const open = openDoc === d.id;
              const cs = conceptsOf(d);
              const all = showAll[d.id];
              const shown = all ? cs : cs.slice(0, 12);
              return (
                <li key={d.id} className="py-4">
                  <div className="flex items-start gap-3">
                    <button type="button" aria-expanded={open} onClick={() => setOpenDoc(open ? null : d.id)} className="min-w-0 flex-1 rounded-md text-left">
                      <p className="t-body font-semibold break-words">{tidyTitle(d.title)}</p>
                      <p className="t-small text-ink-3">
                        {subjectName(d.subjectId)}
                        <span className="mx-2 text-line-strong" aria-hidden>|</span>{fmtDate(d.uploadDate)}
                        {d.pageCount ? <><span className="mx-2 text-line-strong" aria-hidden>|</span>{plural(d.pageCount, 'page')}</> : null}
                        {cs.length > 0 && <><span className="mx-2 text-line-strong" aria-hidden>|</span>{plural(cs.length, 'concept')}</>}
                      </p>
                    </button>
                    <Button variant="secondary" size="sm" onClick={() => setOpenDoc(open ? null : d.id)}>{open ? 'Hide' : 'View source'}</Button>
                    <RowMenu label={`Actions for ${d.title}`} items={[{ label: 'Delete notes', tone: 'danger', onSelect: () => setDeleting(d) }]} />
                  </div>
                  <Collapse open={open}>
                    <div className="max-w-[68ch] space-y-6 pt-5">
                      {d.previewText ? (
                        <div>
                          <p className="t-small font-medium text-ink-3">From the document</p>
                          <p className="mt-1.5 max-h-56 overflow-auto whitespace-pre-wrap border-l-2 border-line-strong pl-4 t-body text-ink-2">{d.previewText}</p>
                        </div>
                      ) : null}
                      {cs.length > 0 ? (
                        <div>
                          <p className="t-small font-medium text-ink-3">Concepts from this document</p>
                          <ul className="mt-1 divide-y divide-line/70">
                            {shown.map((c) => (
                              <li key={c.id} className="flex items-center gap-3 py-2">
                                <span className="w-14 shrink-0 t-small text-ink-3 tnum">{c.sourcePage ? `Page ${c.sourcePage}` : ''}</span>
                                <span className="min-w-0 flex-1 t-body break-words"><MathMarkdown content={tidyTitle(c.name)} inline /></span>
                                <Button variant="tertiary" size="sm" onClick={() => onStartLearn(c.id)}>Study</Button>
                              </li>
                            ))}
                          </ul>
                          {cs.length > 12 && <Button variant="tertiary" size="sm" className="mt-2 -ml-3" onClick={() => setShowAll((s) => ({ ...s, [d.id]: !all }))}>{all ? 'Show fewer' : `Show all ${cs.length}`}</Button>}
                        </div>
                      ) : <p className="t-body text-ink-3">No concepts are linked to this document yet.</p>}
                    </div>
                  </Collapse>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Dialog
        open={addOpen} onClose={() => setAddOpen(false)} dismissible={!busy} title="Add notes" size="md"
        description="Termwise reads your notes and organises them into topics and concepts."
        footer={busy ? null : <><Button onClick={() => setAddOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="add-notes-form" disabled={!canSubmit}>Add notes</Button></>}
      >
        {busy ? (
          <div className="py-2"><BuildProgress steps={STEPS} active={step} note="Larger documents can take a minute or two." /></div>
        ) : (
          <form id="add-notes-form" onSubmit={submit} className="space-y-5">
            <Segmented label="Source type" value={mode} onChange={setMode} options={[{ value: 'pdf', label: 'PDF' }, { value: 'text', label: 'Paste text' }]} />
            <Field label="Subject" htmlFor="an-subject">
              <Select id="an-subject" value={choice} onChange={(e) => setChoice(e.target.value)}>
                {subjects.map((s) => <option key={s.id} value={s.id}>{tidyTitle(s.name)}</option>)}
                <option value={NEW}>New subject</option>
              </Select>
            </Field>
            {choice === NEW && <Field label="Subject name" htmlFor="an-new"><Input id="an-new" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Chemistry" /></Field>}
            {mode === 'pdf' ? (
              <Field label="PDF"><FileDrop file={file} onFile={setFile} accept="application/pdf,.pdf" hint="Text-based PDFs work best" /></Field>
            ) : (
              <>
                <Field label="Title (optional)" htmlFor="an-title"><Input id="an-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Week 3 notes" /></Field>
                <Field label="Notes" htmlFor="an-text"><Textarea id="an-text" value={text} onChange={(e) => setText(e.target.value)} className="min-h-[10rem]" placeholder="Paste your notes here" /></Field>
              </>
            )}
            {error && <Notice tone="error" title="We couldn't process these notes">{error}</Notice>}
          </form>
        )}
        {busy && error && <Notice tone="error">{error}</Notice>}
      </Dialog>

      <ConfirmDialog
        open={!!deleting} onClose={() => setDeleting(null)} tone="danger" confirmLabel="Delete notes" title="Delete these notes?"
        description="The source document will be removed. Concepts already built from it stay in your curriculum."
        onConfirm={async () => { if (deleting) await onDeleteDocument(deleting.id); }}
      />
    </div>
  );
};
