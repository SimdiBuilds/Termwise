import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { TodayPlanner } from './components/TodayPlanner.tsx';
import { CurriculumView } from './components/CurriculumView.tsx';
import { InteractiveLessonView } from './components/InteractiveLessonView.tsx';
import { ReviewQueueView } from './components/ReviewQueueView.tsx';
import { MistakeBankView } from './components/MistakeBankView.tsx';
import { TestEngineView } from './components/TestEngineView.tsx';
import { ProgressDashboard } from './components/ProgressDashboard.tsx';
import { TermOnboarding } from './components/TermOnboarding.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { safeParseJson } from './utils.ts';
import {
  Subject,
  Topic,
  Concept,
  ConceptMastery,
  SourceDocument,
  DailyStudyPlan,
  StudyPlanItem,
  AppSettings,
} from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [masteryMap, setMasteryMap] = useState<Record<string, ConceptMastery>>({});
  const [dailyPlan, setDailyPlan] = useState<DailyStudyPlan | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [metrics, setMetrics] = useState({
    totalConcepts: 0,
    coveredConcepts: 0,
    masteredConcepts: 0,
    developingConcepts: 0,
    learningConcepts: 0,
    unlearnedConcepts: 0,
    coveragePercentage: 0,
    masteryPercentage: 0,
    averageMasteryScore: 0,
    overdueReviewsCount: 0,
  });

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [activeLessonConceptId, setActiveLessonConceptId] = useState<string | null>(null);
  const [unresolvedMistakesCount, setUnresolvedMistakesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all core curriculum data & settings
  const loadData = async () => {
    try {
      const [subsRes, topRes, concRes, metRes, planRes, misRes, setRes] = await Promise.all([
        fetch('/api/curriculum/subjects'),
        fetch('/api/curriculum/topics'),
        fetch('/api/curriculum/concepts'),
        fetch('/api/curriculum/metrics'),
        fetch('/api/planner/today'),
        fetch('/api/mistakes?resolved=false'),
        fetch('/api/settings'),
      ]);

      const subsData = await safeParseJson(subsRes);
      const topData = await safeParseJson(topRes);
      const concData = await safeParseJson(concRes);
      const metData = await safeParseJson(metRes);
      const planData = await safeParseJson(planRes);
      const misData = await safeParseJson(misRes);
      const setData = await safeParseJson(setRes);

      setSubjects(subsData);
      if (subsData.length > 0) {
        if (!selectedSubjectId || !subsData.find((s: Subject) => s.id === selectedSubjectId)) {
          setSelectedSubjectId(subsData[0].id);
        }
      } else {
        setSelectedSubjectId('');
      }
      setTopics(topData);
      setConcepts(concData);

      // Construct mastery lookup map
      const mMap: Record<string, ConceptMastery> = {};
      for (const c of concData) {
        if (c.mastery) {
          mMap[c.id] = c.mastery;
        }
      }
      setMasteryMap(mMap);
      setMetrics(metData);
      setDailyPlan(planData);
      setUnresolvedMistakesCount(misData?.mistakes?.length || 0);
      setSettings(setData);

      // Check if user needs onboarding
      if (setData && !setData.onboardingCompleted) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } catch (err) {
      console.error('Error loading academic data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartLearn = (conceptId: string) => {
    setActiveLessonConceptId(conceptId);
    setActiveTab('learn');
  };

  const handleStartPlanTask = (item: StudyPlanItem) => {
    if (item.type === 'NEW_LEARN' && item.conceptId) {
      handleStartLearn(item.conceptId);
    } else if (item.type === 'SPACED_REVIEW') {
      setActiveTab('review');
    } else if (item.type === 'MISTAKE_REMEDIATION') {
      setActiveTab('mistakes');
    } else if (item.type === 'MIXED_RETRIEVAL' || item.type === 'TOPIC_TEST') {
      setActiveTab('tests');
    }
  };

  const handleTogglePlanItem = async (itemId: string) => {
    try {
      const res = await fetch('/api/planner/toggle-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const updatedPlan = await safeParseJson(res);
      setDailyPlan(updatedPlan);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefreshPlan = async (targetMinutes: number) => {
    try {
      const res = await fetch(`/api/planner/today?targetMinutes=${targetMinutes}`);
      const data = await safeParseJson(res);
      setDailyPlan(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadPdf = async (file: File, subjectId: string, subjectName: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subjectId', subjectId);
    formData.append('subjectName', subjectName);

    const res = await fetch('/api/curriculum/upload-pdf', {
      method: 'POST',
      body: formData,
    });
    const data = await safeParseJson(res);
    await loadData();
  };

  const handleImportText = async (
    subjectId: string,
    subjectName: string,
    text: string,
    title: string
  ) => {
    const res = await fetch('/api/curriculum/import-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId, subjectName, notesText: text, sourceTitle: title }),
    });
    const data = await safeParseJson(res);
    await loadData();
  };

  const handleResetSeed = async () => {
    await fetch('/api/curriculum/reset', { method: 'POST' });
    await loadData();
  };

  const handleDeleteSubject = async (subjectId: string) => {
    await fetch(`/api/curriculum/subjects/${subjectId}`, { method: 'DELETE' });
    await loadData();
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId('');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    await fetch(`/api/curriculum/topics/${topicId}`, { method: 'DELETE' });
    await loadData();
  };

  const handleDeleteConcept = async (conceptId: string) => {
    await fetch(`/api/curriculum/concepts/${conceptId}`, { method: 'DELETE' });
    await loadData();
  };

  const handleDeleteDocument = async (documentId: string) => {
    await fetch(`/api/curriculum/documents/${documentId}`, { method: 'DELETE' });
    await loadData();
  };

  const handleClearAll = async () => {
    await fetch('/api/curriculum/clear-all', { method: 'POST' });
    await loadData();
    setSelectedSubjectId('');
  };

  const handleAddSubject = async (name: string, description?: string) => {
    const res = await fetch('/api/curriculum/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    const newSub = await safeParseJson(res);
    await loadData();
    setSelectedSubjectId(newSub.id);
  };

  if (showOnboarding) {
    return (
      <TermOnboarding
        onComplete={async () => {
          setShowOnboarding(false);
          await loadData();
          setActiveTab('today');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Academic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'learn' && !activeLessonConceptId && concepts.length > 0) {
            // Default to first unlearned concept if none selected
            const unlearned = concepts.find((c) => !masteryMap[c.id] || masteryMap[c.id].status === 'UNLEARNED');
            setActiveLessonConceptId(unlearned ? unlearned.id : concepts[0].id);
          }
        }}
        overdueCount={metrics.overdueReviewsCount}
        unresolvedMistakesCount={unresolvedMistakesCount}
        coveragePct={metrics.coveragePercentage}
        masteryPct={metrics.masteryPercentage}
        onRestartSetup={() => setShowOnboarding(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">
              Loading syllabus and curriculum...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'today' && (
              <TodayPlanner
                plan={dailyPlan}
                subjects={subjects}
                metrics={metrics}
                countdownLabel={settings?.countdownLabel}
                termEndDate={settings?.termEndDate}
                onToggleItem={handleTogglePlanItem}
                onRefreshPlan={handleRefreshPlan}
                onStartTask={handleStartPlanTask}
              />
            )}

            {activeTab === 'curriculum' && (
              <CurriculumView
                subjects={subjects}
                topics={topics}
                concepts={concepts.map((c) => ({ ...c, mastery: masteryMap[c.id] }))}
                documents={documents}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={(id) => setSelectedSubjectId(id)}
                onStartLearn={handleStartLearn}
                onImportText={handleImportText}
                onUploadPdf={handleUploadPdf}
                onResetSeed={handleResetSeed}
                onDeleteSubject={handleDeleteSubject}
                onDeleteTopic={handleDeleteTopic}
                onDeleteConcept={handleDeleteConcept}
                onDeleteDocument={handleDeleteDocument}
                onClearAll={handleClearAll}
                onAddSubject={handleAddSubject}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'learn' && (
              activeLessonConceptId ? (
                <InteractiveLessonView
                  conceptId={activeLessonConceptId}
                  onBackToCurriculum={() => setActiveTab('curriculum')}
                  onLessonComplete={() => {
                    loadData();
                    setActiveTab('today');
                  }}
                />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
                  <p className="text-sm text-slate-700">Please choose a concept from the Curriculum.</p>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Open Curriculum
                  </button>
                </div>
              )
            )}

            {activeTab === 'review' && (
              <ReviewQueueView onStartLesson={handleStartLearn} />
            )}

            {activeTab === 'mistakes' && (
              <MistakeBankView subjects={subjects} onStartLearn={handleStartLearn} />
            )}

            {activeTab === 'tests' && (
              <TestEngineView
                subjects={subjects}
                topics={topics}
                concepts={concepts}
                masteryMap={masteryMap}
                onStartLearn={handleStartLearn}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressDashboard
                subjects={subjects}
                concepts={concepts}
                masteryMap={masteryMap}
                metrics={metrics}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onRestartSetup={() => setShowOnboarding(true)}
                onSettingsUpdated={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-3.5 text-center text-xs text-slate-400">
        Academic Mastery
      </footer>
    </div>
  );
}
