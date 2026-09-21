import React, { useEffect, useState } from 'react';
import { Concept } from '../types.ts';
import { Button, ConfirmDialog, Field, Input, Notice, PageHeader, Select } from './ui/index.ts';
import { api, errMsg, postJson, termStatus, tidyTitle } from '../lib/format.ts';

interface SettingsViewProps {
  onRestartSetup: () => void;
  onSettingsUpdated: () => void | Promise<void>;
  onResetSeed: () => Promise<void>;
  onClearAll: () => Promise<void>;
}

type Action = 'restart' | 'seed' | 'clear' | null;

export const SettingsView: React.FC<SettingsViewProps> = ({ onRestartSetup, onSettingsUpdated, onResetSeed, onClearAll }) => {
  const [termEndDate, setTermEndDate] = useState('');
  const [termStartDate, setTermStartDate] = useState('');
  const [targetMinutes, setTargetMinutes] = useState('60');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [action, setAction] = useState<Action>(null);

  // Hidden diagnostics (three clicks on the page title), kept from the original app.
  const [clicks, setClicks] = useState(0);
  const [diag, setDiag] = useState(false);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [conceptId, setConceptId] = useState('');
  const [profile, setProfile] = useState<'STUDENT_A' | 'STUDENT_B' | 'STUDENT_C'>('STUDENT_A');
  const [simulating, setSimulating] = useState(false);
  const [sim, setSim] = useState<any>(null);
  const [simError, setSimError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await api('/api/settings');
        setTermEndDate(s.termEndDate || ''); setTermStartDate(s.termStartDate || '');
        setTargetMinutes(String(s.targetStudyMinutesPerDay || 60));
      } catch (e) { setLoadError(errMsg(e, 'We could not load your settings.')); }
    })();
  }, []);

  useEffect(() => {
    if (!diag) return;
    api('/api/curriculum/concepts').then((d) => { if (Array.isArray(d)) { setConcepts(d); setConceptId(d[0]?.id || ''); } }).catch(() => {});
  }, [diag]);

  const minutes = Number(targetMinutes);
  const minutesValid = Number.isFinite(minutes) && minutes >= 15 && minutes <= 600;
  const status = termStatus(termEndDate, termStartDate);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minutesValid || !termEndDate) return;
    setSaving(true); setSaved(false); setSaveError(null);
    try {
      await postJson('/api/settings', { termEndDate, targetStudyMinutesPerDay: Math.round(minutes) });
      setSaved(true);
      await onSettingsUpdated();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(errMsg(err, 'Your settings could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const runSim = async () => {
    if (!conceptId) return;
    setSimulating(true); setSim(null); setSimError(null);
    try { setSim(await postJson('/api/learn/simulate-benchmark', { conceptId, profile })); }
    catch (err) { setSimError(errMsg(err)); } finally { setSimulating(false); }
  };

  const ACTIONS: Record<Exclude<Action, null>, { title: string; description: string; label: string; run: () => Promise<void> | void }> = {
    restart: {
      title: 'Restart term setup?',
      description: 'You will upload your notes again and Termwise will rebuild your curriculum. Your current curriculum, progress, mistakes and test history will be replaced.',
      label: 'Restart setup', run: onRestartSetup,
    },
    seed: {
      title: 'Restore the sample curriculum?',
      description: 'This replaces your curriculum and progress with the built-in sample. Your own notes and progress will be removed.',
      label: 'Restore sample', run: onResetSeed,
    },
    clear: {
      title: 'Clear all study data?',
      description: 'Every subject, concept, mistake, test and plan will be permanently deleted. This cannot be undone.',
      label: 'Clear everything', run: onClearAll,
    },
  };
  const current = action ? ACTIONS[action] : null;

  return (
    <div className="max-w-2xl space-y-12">
      <div onClick={() => setClicks((c) => { if (c + 1 >= 3) { setDiag((d) => !d); return 0; } return c + 1; })}>
        <PageHeader title="Settings" description="How Termwise is configured for your term." />
      </div>

      {loadError && <Notice tone="error">{loadError}</Notice>}

      <form onSubmit={save} className="space-y-6" aria-labelledby="term-h">
        <div>
          <h2 id="term-h" className="t-h2">Term</h2>
          {status && <p className="mt-1 t-body text-ink-3">{status.label}. Your plan adapts as the term end approaches.</p>}
        </div>
        <Field label="Term end date" htmlFor="s-end"><Input id="s-end" type="date" value={termEndDate} onChange={(e) => setTermEndDate(e.target.value)} required className="max-w-[14rem]" /></Field>
        <Field label="Daily study target" htmlFor="s-min" hint="Between 15 and 600 minutes." error={!minutesValid ? 'Enter a number between 15 and 600.' : null}>
          <div className="flex max-w-[14rem] items-center gap-3">
            <Input id="s-min" type="number" min={15} max={600} step={5} value={targetMinutes} onChange={(e) => setTargetMinutes(e.target.value)} />
            <span className="t-body text-ink-3">minutes</span>
          </div>
        </Field>
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" loading={saving} disabled={!minutesValid || !termEndDate}>Save changes</Button>
          {saved && <span role="status" className="t-small text-ok">Saved</span>}
        </div>
        {saveError && <Notice tone="error" title="Couldn't save">{saveError}</Notice>}
      </form>

      <section aria-labelledby="data-h" className="space-y-1">
        <h2 id="data-h" className="t-h2">Your data</h2>
        <ul className="divide-y divide-line border-y border-line mt-3">
          {([['restart', 'Restart term setup', 'Upload your notes again and rebuild your curriculum.'], ['seed', 'Restore sample curriculum', 'Replace your data with the built-in sample.'], ['clear', 'Clear all study data', 'Permanently delete everything you have added.']] as const).map(([id, name, desc]) => (
            <li key={id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="t-body font-medium">{name}</p><p className="t-small text-ink-3">{desc}</p></div>
              <Button variant="danger" size="sm" onClick={() => setAction(id)}>{name.split(' ')[0]}</Button>
            </li>
          ))}
        </ul>
      </section>

      {diag && (
        <section aria-labelledby="diag-h" className="space-y-4 border-t border-line pt-8">
          <h2 id="diag-h" className="t-h2">Diagnostics</h2>
          <p className="t-small text-ink-3">Runs a simulated student through a lesson to check the adaptive engine. Does not change your progress.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Concept" htmlFor="d-c"><Select id="d-c" value={conceptId} onChange={(e) => setConceptId(e.target.value)}>{concepts.map((c) => <option key={c.id} value={c.id}>{tidyTitle(c.name).slice(0, 80)}</option>)}</Select></Field>
            <Field label="Student profile" htmlFor="d-p"><Select id="d-p" value={profile} onChange={(e) => setProfile(e.target.value as any)}><option value="STUDENT_A">Student A</option><option value="STUDENT_B">Student B</option><option value="STUDENT_C">Student C</option></Select></Field>
          </div>
          <Button onClick={runSim} loading={simulating} disabled={!conceptId}>Run simulation</Button>
          {simError && <Notice tone="error">{simError}</Notice>}
          {sim && (
            <div className="space-y-2 t-body">
              <p><span className="text-ink-3">Result </span>{sim.completed ? 'Completed' : 'Stopped early'}<span className="text-ink-3"> Final mastery </span>{sim.finalMastery}%<span className="text-ink-3"> Steps </span>{sim.path?.length ?? 0}</p>
              {sim.summary && <p className="text-ink-2">{sim.summary}</p>}
              <pre className="max-h-72 overflow-auto rounded-md bg-sunken p-4 t-small">{JSON.stringify(sim.history ?? sim, null, 2)}</pre>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={!!current} onClose={() => setAction(null)} tone="danger" confirmLabel={current?.label || 'Confirm'}
        title={current?.title || ''} description={current?.description} onConfirm={() => current?.run()}
      />
    </div>
  );
};
