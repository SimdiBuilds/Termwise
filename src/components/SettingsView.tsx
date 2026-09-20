import React, { useState, useEffect } from 'react';
import { AppSettings, Concept } from '../types.ts';
import { 
  Calendar, 
  Clock, 
  RotateCcw, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Activity,
  Play,
  XCircle,
  BadgeCheck,
  ChevronRight,
  BookOpen,
  Terminal,
  Award
} from 'lucide-react';

interface SettingsViewProps {
  onRestartSetup: () => void;
  onSettingsUpdated: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onRestartSetup,
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [countdownLabel, setCountdownLabel] = useState<string>('');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [termEndDate, setTermEndDate] = useState<string>('');
  const [targetMinutes, setTargetMinutes] = useState<number>(120);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Secret Sandbox State
  const [clickCount, setClickCount] = useState<number>(0);
  const [showSandbox, setShowSandbox] = useState<boolean>(false);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<'STUDENT_A' | 'STUDENT_B' | 'STUDENT_C'>('STUDENT_A');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
      setCountdownLabel(data.countdownLabel || '');
      setDaysRemaining(data.daysRemaining || 0);
      setTermEndDate(data.termEndDate || '');
      setTargetMinutes(data.targetStudyMinutesPerDay || 120);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Fetch concepts when sandbox is opened
  useEffect(() => {
    if (showSandbox) {
      const fetchConcepts = async () => {
        try {
          const res = await fetch('/api/curriculum/concepts');
          const data = await res.json();
          setConcepts(data);
          if (data.length > 0) {
            setSelectedConceptId(data[0].id);
          }
        } catch (err) {
          console.error('Error fetching concepts for sandbox:', err);
        }
      };
      fetchConcepts();
    }
  }, [showSandbox]);

  const handleHeaderClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setShowSandbox((s) => !s);
        return 0;
      }
      return next;
    });
  };

  const handleRunSimulation = async () => {
    if (!selectedConceptId) return;
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/learn/simulate-benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: selectedConceptId,
          profile: selectedProfile,
        }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termEndDate,
          targetStudyMinutesPerDay: Number(targetMinutes) || 120,
        }),
      });

      setSaveSuccess(true);
      onSettingsUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h1 
          onClick={handleHeaderClick}
          className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 cursor-pointer select-none"
        >
          <span>Term & System Settings</span>
          {showSandbox && (
            <span className="text-[10px] uppercase bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
              <Terminal className="w-2.5 h-2.5" /> Sandbox Active
            </span>
          )}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your term schedule, study target, or restart setup for a new academic term.
        </p>

        {countdownLabel && (
          <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Active Term Status
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {countdownLabel}
                </div>
              </div>
            </div>
            <div className="text-xs text-indigo-700 font-semibold bg-indigo-100 px-3 py-1 rounded-full">
              {daysRemaining} days remaining
            </div>
          </div>
        )}
      </div>

      {/* Secret Sandbox Panel */}
      {showSandbox && (
        <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Adaptive Learning Engine Sandbox
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verify and trace student pathways through dynamic, custom-remediated learning sessions.
              </p>
            </div>
            <button 
              onClick={() => setShowSandbox(false)}
              className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            >
              Hide Sandbox
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simulation Parameters */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                1. Configure Benchmark Parameters
              </h3>

              {/* Concept Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Target Concept to Simulate
                </label>
                {concepts.length === 0 ? (
                  <p className="text-xs text-amber-400">
                    No curriculum concepts generated yet. Complete onboarding first!
                  </p>
                ) : (
                  <select
                    value={selectedConceptId}
                    onChange={(e) => setSelectedConceptId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {concepts.map((concept) => (
                      <option key={concept.id} value={concept.id}>
                        {concept.subjectName} • {concept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Profile Selectors */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Student Profile Model
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'STUDENT_A',
                      title: 'Student A (High Proficiency / Recall)',
                      desc: 'Answers all queries perfectly. Quickly triggers mastery progression and fast-tracks to summary.',
                      color: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20',
                      activeColor: 'ring-1 ring-emerald-500 bg-emerald-950/40 border-emerald-500',
                    },
                    {
                      id: 'STUDENT_B',
                      title: 'Student B (Average / Procedural Slip)',
                      desc: 'Makes a minor calculation slip on the first response. Receives diagnostic remediation, then advances.',
                      color: 'border-blue-500/30 hover:border-blue-500/60 bg-blue-950/20',
                      activeColor: 'ring-1 ring-blue-500 bg-blue-950/40 border-blue-500',
                    },
                    {
                      id: 'STUDENT_C',
                      title: 'Student C (Struggling / Misconception Gap)',
                      desc: 'Selects answers tied directly to conceptual misconceptions. Triggers deep procedural retraining steps.',
                      color: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-950/20',
                      activeColor: 'ring-1 ring-amber-500 bg-amber-950/40 border-amber-500',
                    },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProfile(p.id as any)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedProfile === p.id ? p.activeColor : p.color
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.title}</span>
                        {selectedProfile === p.id && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulate Action Button */}
              <button
                type="button"
                disabled={isSimulating || !selectedConceptId}
                onClick={handleRunSimulation}
                className="w-full px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 font-bold text-xs text-white transition-all flex items-center justify-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Executing Simulation Trace...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Simulation Benchmark</span>
                  </>
                )}
              </button>
            </div>

            {/* Simulation Trace Output */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Simulation Trace Log
                </span>
                {simResult && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    simResult.completed ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                  }`}>
                    {simResult.completed ? 'Completed' : 'Aborted'}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {!simResult && !isSimulating && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Activity className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                    <p className="text-xs text-slate-500">
                      Configure your settings and click "Run Simulation Benchmark" to trace the adaptive pathway.
                    </p>
                  </div>
                )}

                {isSimulating && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-slate-400">
                      Tracing adaptive branch sequences, evaluating mock answers, and parsing dynamic progression loops...
                    </p>
                  </div>
                )}

                {simResult && (
                  <div className="space-y-4">
                    {/* Trace Metadata Summary */}
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-400">
                        Profile: <span className="text-white">{simResult.profile}</span>
                      </div>
                      <p className="text-[11px] text-indigo-300 leading-normal italic">
                        "{simResult.summary}"
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                        <span>Final Mastery: <strong className="text-white">{simResult.finalMastery}%</strong></span>
                        <span>Steps: <strong className="text-white">{simResult.path.length}</strong></span>
                      </div>
                    </div>

                    {/* Timeline Trace */}
                    <div className="space-y-3 relative pl-3 border-l border-slate-800">
                      {simResult.history.map((step: any, sIdx: number) => {
                        let stepColor = 'bg-slate-800 border-slate-700 text-slate-300';
                        let iconNode = <BookOpen className="w-3 h-3 text-slate-400" />;

                        if (step.activityType === 'EXPLAIN') {
                          stepColor = 'bg-blue-950/40 border-blue-500/30 text-blue-200';
                          iconNode = <BookOpen className="w-3 h-3 text-blue-400" />;
                        } else if (step.activityType === 'REMEDIATION' || step.activityType === 'MISCONCEPTION_CHECK') {
                          stepColor = 'bg-amber-950/40 border-amber-500/30 text-amber-200';
                          iconNode = <AlertCircle className="w-3 h-3 text-amber-400" />;
                        } else if (step.activityType === 'SUMMARY') {
                          stepColor = 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200';
                          iconNode = <Award className="w-3 h-3 text-indigo-400" />;
                        } else if (step.isCorrect === true) {
                          stepColor = 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200';
                          iconNode = <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />;
                        } else if (step.isCorrect === false) {
                          stepColor = 'bg-rose-950/40 border-rose-500/30 text-rose-200';
                          iconNode = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
                        }

                        return (
                          <div key={sIdx} className="relative group">
                            {/* Connector dot */}
                            <div className="absolute -left-[17px] top-2 w-2 h-2 rounded-full bg-slate-800 border border-slate-700 group-hover:bg-indigo-500 transition-colors" />

                            <div className={`p-2.5 rounded-lg border text-[11px] ${stepColor}`}>
                              <div className="flex items-center gap-2 font-bold mb-0.5">
                                {iconNode}
                                <span>Step {sIdx + 1}: {step.activityType}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                {step.feedback || 'Step complete. Navigated to next custom activity module.'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
          Academic Schedule Settings
        </h2>

        {/* Term End Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Term End Date
          </label>
          <p className="text-xs text-slate-500 mb-2">
            The planner automatically calculates your daily study pace and spaced review schedule based on time remaining before your term ends.
          </p>
          <div className="relative max-w-xs">
            <input
              type="date"
              value={termEndDate}
              onChange={(e) => setTermEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Daily Study Target */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Daily Study Target (Flexible)
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Target study time per day in minutes. The plan will adapt when your available time changes.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {[45, 60, 90, 120, 180].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setTargetMinutes(mins)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  targetMinutes === mins
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                {mins < 60 ? `${mins} min` : `${mins / 60} hour${mins > 60 ? 's' : ''}`}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings updated successfully</span>
            </div>
          )}
        </div>
      </form>

      {/* Restart Term Setup Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Restart Term Onboarding
            </h2>
            <p className="text-xs text-slate-500">
              Clear current curriculum data and re-upload your school notes for a fresh term or semester.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onRestartSetup}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Term Setup & Upload New Notes</span>
          </button>
        </div>
      </div>

      {/* Secret Sandbox Toggle Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-3 pt-2">
        <span>Engine Core Version: v2.4.5</span>
        <button
          type="button"
          onClick={() => setShowSandbox((s) => !s)}
          className="hover:text-slate-600 active:text-indigo-600 transition-colors cursor-pointer font-mono bg-slate-50 border border-slate-100 rounded px-2 py-0.5"
        >
          Build ID: 8847-X
        </button>
      </div>
    </div>
  );
};
