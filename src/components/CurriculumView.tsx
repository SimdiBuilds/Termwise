import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Plus } from 'lucide-react';
import { Concept, ConceptMastery, Subject, Topic } from '../types.ts';
import { MathMarkdown } from './MathMarkdown.tsx';
import {
  Button, Collapse, ConfirmDialog, Dialog, EmptyState, Field, Input, MasteryRing, Notice, PageHeader,
  RowMenu, SearchInput, Segmented, Skeleton, Textarea,
} from './ui/index.ts';
import { errMsg, STATUS_LABEL, tidyTitle } from '../lib/format.ts';

type CWM = Concept & { mastery?: ConceptMastery };

interface CurriculumViewProps {
  subjects: Subject[];
  topics: Topic[];
  concepts: CWM[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  onStartLearn: (conceptId: string) => void;
  onAddSubject: (name: string, description?: string) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onDeleteTopic: (id: string) => Promise<void>;
  onDeleteConcept: (id: string) => Promise<void>;
  onOpenNotes: () => void;
  isLoading?: boolean;
}

type Filter = 'all' | 'new' | 'progress' | 'mastered';
const statusOf = (c: CWM) => c.mastery?.status || 'UNLEARNED';
const isUnreadable = (c: CWM) => c.name.startsWith('%PDF');

function ConceptRow({ concept, open, onToggle, onStart, onDelete }: {
  concept: CWM; open: boolean; onToggle: () => void; onStart: () => void; onDelete: () => void;
}) {
  const status = statusOf(concept);
  const unreadable = isUnreadable(concept);
  const name = unreadable ? 'Unreadable content' : tidyTitle(concept.name);
  return (
    <li>
      <div className="flex items-center gap-2 py-2">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-left">
          <MasteryRing status={status} score={concept.mastery?.score} />
          <span className="min-w-0 flex-1 t-body font-medium line-clamp-2 break-words">
            {unreadable ? name : <MathMarkdown content={name} inline />}
          </span>
          <span className="hidden shrink-0 t-small text-ink-3 sm:inline">{STATUS_LABEL[status]}</span>
        </button>
        {!unreadable && <Button variant="secondary" size="sm" onClick={onStart}>{status === 'UNLEARNED' ? 'Study' : 'Study again'}</Button>}
        <RowMenu label={`Actions for ${name}`} items={[{ label: open ? 'Hide notes' : 'View notes', onSelect: onToggle }, { label: 'Delete concept', tone: 'danger', onSelect: onDelete }]} />
      </div>
      <Collapse open={open}>
        <div className="ml-[30px] max-w-[68ch] space-y-5 pb-5 pr-2 pt-1 t-body text-ink-2">
          {concept.explanation && <div className="[&_p]:mb-3 [&_p:last-child]:mb-0"><MathMarkdown content={concept.explanation} /></div>}
          {concept.formulas?.length > 0 && (
            <div>
              <p className="t-small font-medium text-ink-3">Formulas</p>
              <div className="prose-math mt-1 space-y-1 text-ink">{concept.formulas.map((f, i) => <MathMarkdown key={i} content={f} />)}</div>
            </div>
          )}
          {concept.definitions?.length > 0 && (
            <div>
              <p className="t-small font-medium text-ink-3">Definitions</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-ink-4">{concept.definitions.map((d, i) => <li key={i}><MathMarkdown content={d} inline /></li>)}</ul>
            </div>
          )}
          {concept.keyFacts?.length > 0 && (
            <div>
              <p className="t-small font-medium text-ink-3">Key facts</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-ink-4">{concept.keyFacts.map((d, i) => <li key={i}><MathMarkdown content={d} inline /></li>)}</ul>
            </div>
          )}
          {concept.examples?.length > 0 && (
            <div>
              <p className="t-small font-medium text-ink-3">Examples</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-ink-4">{concept.examples.map((d, i) => <li key={i}><MathMarkdown content={d} inline /></li>)}</ul>
            </div>
          )}
          {concept.prerequisiteNames && concept.prerequisiteNames.length > 0 && (
            <p className="t-small text-ink-3">Builds on {concept.prerequisiteNames.map(tidyTitle).join(', ')}</p>
          )}
          {concept.sourceDocument && (
            <p className="t-small text-ink-3">From {concept.sourceDocument}{concept.sourcePage ? `, page ${concept.sourcePage}` : ''}</p>
          )}
        </div>
      </Collapse>
    </li>
  );
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  subjects, topics, concepts, selectedSubjectId, onSelectSubject, onStartLearn, onAddSubject,
  onDeleteSubject, onDeleteTopic, onDeleteConcept, onOpenNotes, isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [openConcept, setOpenConcept] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: 'subject' | 'topic' | 'concept'; id: string; name: string } | null>(null);

  const subject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectConcepts = useMemo(() => concepts.filter((c) => subject && c.subjectId === subject.id), [concepts, subject]);
  const subjectTopics = useMemo(() => topics.filter((t) => subject && t.subjectId === subject.id).sort((a, b) => a.order - b.order), [topics, subject]);
  const mastered = subjectConcepts.filter((c) => statusOf(c) === 'MASTERED').length;
  const unreadableCount = subjectConcepts.filter(isUnreadable).length;

  const nextUp = useMemo(() => {
    const byTopic = subjectTopics.flatMap((t) => subjectConcepts.filter((c) => c.topicId === t.id).sort((a, b) => a.order - b.order));
    const ordered = byTopic.filter((c) => !isUnreadable(c));
    return ordered.find((c) => statusOf(c) === 'UNLEARNED') || ordered.find((c) => statusOf(c) !== 'MASTERED') || null;
  }, [subjectTopics, subjectConcepts]);

  useEffect(() => {
    if (nextUp) setOpenTopics((o) => (Object.keys(o).length ? o : { [nextUp.topicId]: true }));
  }, [nextUp?.topicId]);

  const matches = (c: CWM) => {
    const s = statusOf(c);
    if (filter === 'new' && s !== 'UNLEARNED') return false;
    if (filter === 'progress' && !(s === 'LEARNING' || s === 'DEVELOPING')) return false;
    if (filter === 'mastered' && s !== 'MASTERED') return false;
    const q = query.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || (c.topicTitle || '').toLowerCase().includes(q) || (c.subtopicTitle || '').toLowerCase().includes(q);
  };
  const searching = query.trim() !== '' || filter !== 'all';

  const groups = subjectTopics
    .map((t) => {
      const cs = subjectConcepts.filter((c) => c.topicId === t.id && matches(c)).sort((a, b) => a.order - b.order);
      const bySub = new Map<string, CWM[]>();
      cs.forEach((c) => { const k = c.subtopicTitle && tidyTitle(c.subtopicTitle) !== tidyTitle(t.title) ? c.subtopicTitle : ''; bySub.set(k, [...(bySub.get(k) || []), c]); });
      const all = subjectConcepts.filter((c) => c.topicId === t.id);
      return { topic: t, bySub, count: cs.length, total: all.length, done: all.filter((c) => statusOf(c) === 'MASTERED').length };
    })
    .filter((g) => g.count > 0);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true); setAddError(null);
    try { await onAddSubject(newName.trim(), newDesc.trim() || undefined); setAddOpen(false); setNewName(''); setNewDesc(''); }
    catch (err) { setAddError(errMsg(err)); } finally { setAdding(false); }
  };

  const runDelete = async () => {
    if (!confirm) return;
    if (confirm.kind === 'subject') await onDeleteSubject(confirm.id);
    else if (confirm.kind === 'topic') await onDeleteTopic(confirm.id);
    else await onDeleteConcept(confirm.id);
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-5 w-72" /><Skeleton className="mt-8 h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learn"
        description="Choose a concept to study. Your notes are organised by subject and topic."
        actions={<Button variant="secondary" icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)}>New subject</Button>}
      />

      {subjects.length === 0 ? (
        <EmptyState title="No subjects yet" description="Add your school notes to build a curriculum, or create a subject to start." action={<Button variant="primary" onClick={onOpenNotes}>Add notes</Button>} />
      ) : (
        <>
          <div role="tablist" aria-label="Subjects" className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-line px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            {subjects.map((s) => {
              const on = s.id === subject?.id;
              return (
                <button key={s.id} role="tab" aria-selected={on} type="button" onClick={() => { onSelectSubject(s.id); setOpenTopics({}); setQuery(''); setFilter('all'); }}
                  className={`relative shrink-0 px-3 pb-3 pt-2 t-body font-medium transition-colors ${on ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}>
                  {tidyTitle(s.name)}
                  {on && <motion.span layoutId="subject-tab" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600" transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }} />}
                </button>
              );
            })}
          </div>

          {subject && (
            <div className="flex items-center justify-between gap-4">
              <p className="t-small text-ink-3 tnum">{mastered} of {subjectConcepts.length} concepts mastered</p>
              <RowMenu label={`Actions for ${subject.name}`} items={[{ label: 'Delete subject', tone: 'danger', onSelect: () => setConfirm({ kind: 'subject', id: subject.id, name: subject.name }) }]} />
            </div>
          )}

          {unreadableCount > 0 && (
            <Notice tone="warn" title="Some notes couldn't be read as text">
              Part of an uploaded PDF was unreadable. Delete the affected entries below, then upload a text-based PDF.
            </Notice>
          )}

          {nextUp && !searching && (
            <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="t-small text-ink-3">Next concept</p>
                <p className="t-body font-medium break-words"><MathMarkdown content={tidyTitle(nextUp.name)} inline /></p>
              </div>
              <Button variant="primary" onClick={() => onStartLearn(nextUp.id)}>Start</Button>
            </div>
          )}

          {subjectConcepts.length === 0 ? (
            <EmptyState title={`No concepts in ${tidyTitle(subject?.name)} yet`} description="Add notes for this subject and Termwise will organise them into topics and concepts." action={<Button variant="primary" onClick={onOpenNotes}>Add notes</Button>} />
          ) : (
            <section aria-label="Curriculum" className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchInput className="sm:w-72" placeholder="Search concepts" aria-label="Search concepts" value={query} onChange={(e) => setQuery(e.target.value)} />
                <Segmented label="Filter by progress" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'new', label: 'Not started' }, { value: 'progress', label: 'In progress' }, { value: 'mastered', label: 'Mastered' }]} />
              </div>

              {groups.length === 0 ? (
                <EmptyState title="No matches" description="Try a different search or filter." />
              ) : (
                <div className="divide-y divide-line border-y border-line">
                  {groups.map(({ topic, bySub, total, done }) => {
                    const open = searching || !!openTopics[topic.id];
                    return (
                      <div key={topic.id} className="py-1">
                        <div className="flex items-center gap-2">
                          <button type="button" aria-expanded={open} onClick={() => setOpenTopics((o) => ({ ...o, [topic.id]: !o[topic.id] }))} className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-3 text-left">
                            <ChevronRight aria-hidden className={`size-4 shrink-0 text-ink-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
                            <span className="min-w-0 flex-1 t-body font-semibold break-words"><MathMarkdown content={tidyTitle(topic.title)} inline /></span>
                            <span className="shrink-0 t-small text-ink-3 tnum">{done}/{total}</span>
                          </button>
                          <RowMenu label={`Actions for ${topic.title}`} items={[{ label: 'Delete topic', tone: 'danger', onSelect: () => setConfirm({ kind: 'topic', id: topic.id, name: topic.title }) }]} />
                        </div>
                        <Collapse open={open}>
                          <div className="pb-2 pl-6">
                            {Array.from(bySub.entries()).map(([sub, cs]) => (
                              <div key={sub || 'root'} className="mb-1">
                                {sub && <p className="mt-2 pb-1 t-small font-medium text-ink-3 break-words">{tidyTitle(sub)}</p>}
                                <ul className="divide-y divide-line/70">
                                  {cs.map((c) => (
                                    <ConceptRow key={c.id} concept={c} open={openConcept === c.id}
                                      onToggle={() => setOpenConcept((v) => (v === c.id ? null : c.id))}
                                      onStart={() => onStartLearn(c.id)}
                                      onDelete={() => setConfirm({ kind: 'concept', id: c.id, name: c.name })} />
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </Collapse>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New subject" description="Create an empty subject, then add notes to it."
        footer={<><Button onClick={() => setAddOpen(false)}>Cancel</Button><Button variant="primary" type="submit" form="new-subject-form" loading={adding} disabled={!newName.trim()}>Create subject</Button></>}>
        <form id="new-subject-form" onSubmit={submitAdd} className="space-y-4">
          <Field label="Name" htmlFor="ns-name"><Input id="ns-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Chemistry" required data-autofocus /></Field>
          <Field label="Description (optional)" htmlFor="ns-desc"><Textarea id="ns-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="min-h-[5rem]" /></Field>
          {addError && <p role="alert" className="t-small text-bad">{addError}</p>}
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!confirm} onClose={() => setConfirm(null)} tone="danger" confirmLabel="Delete" onConfirm={runDelete}
        title={confirm ? `Delete ${confirm.kind}?` : ''}
        description={confirm ? (confirm.kind === 'subject'
          ? `"${tidyTitle(confirm.name)}" and all of its topics, concepts and progress will be removed.`
          : confirm.kind === 'topic'
            ? `"${tidyTitle(confirm.name)}" and the concepts inside it will be removed.`
            : `"${tidyTitle(confirm.name)}" and its progress will be removed.`) : ''}
      />
    </div>
  );
};
