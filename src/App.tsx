import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { AppShell, ActiveTab } from './components/AppShell.tsx';
import { HomeView } from './components/HomeView.tsx';
import { CurriculumView } from './components/CurriculumView.tsx';
import { InteractiveLessonView } from './components/InteractiveLessonView.tsx';
import { ReviewQueueView } from './components/ReviewQueueView.tsx';
import { MistakeBankView } from './components/MistakeBankView.tsx';
import { TestEngineView } from './components/TestEngineView.tsx';
import { ProgressDashboard } from './components/ProgressDashboard.tsx';
import { NotesView } from './components/NotesView.tsx';
import { TermOnboarding } from './components/TermOnboarding.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Button, EmptyState, Skeleton } from './components/ui/index.ts';
import { api, errMsg, localDate, postJson } from './lib/format.ts';
import { safeParseJson } from './utils.ts';
import {
  Subject, Topic, Concept, ConceptMastery, SourceDocument, DailyStudyPlan, StudyPlanItem, AppSettings,
} from './types.ts';

const EMPTY_METRICS = {
  totalConcepts: 0, coveredConcepts: 0, masteredConcepts: 0, developingConcepts: 0, learningConcepts: 0,
  unlearnedConcepts: 0, coveragePercentage: 0, masteryPercentage: 0, averageMasteryScore: 0, overdueReviewsCount: 0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [masteryMap, setMasteryMap] = useState<Record<string, ConceptMastery>>({});
  const [dailyPlan, setDailyPlan] = useState<DailyStudyPlan | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [activeLessonConceptId, setActiveLessonConceptId] = useState<string | null>(null);
  const [unresolvedMistakesCount, setUnresolvedMistakesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Settings first: the plan must honour the saved daily target.
      const setData: AppSettings = await api('/api/settings');
      const target = setData?.targetStudyMinutesPerDay || 90;
      const [subsData, topData, concData, metData, planData, misData, docData] = await Promise.all([
        api('/api/curriculum/subjects'),
        api('/api/curriculum/topics'),
        api('/api/curriculum/concepts'),
        api('/api/curriculum/metrics'),
        api(`/api/planner/today?targetMinutes=${target}&date=${localDate()}`),
        api('/api/mistakes?resolved=false'),
        api('/api/curriculum/documents').catch(() => []),
      ]);

      setSubjects(subsData);
      setSelectedSubjectId((cur) => (subsData.find((s: Subject) => s.id === cur) ? cur : subsData[0]?.id || ''));
      setTopics(topData);
      setConcepts(concData);
      const mMap: Record<string, ConceptMastery> = {};
      for (const c of concData) if (c.mastery) mMap[c.id] = c.mastery;
      setMasteryMap(mMap);
      setMetrics(metData);
      setDailyPlan(planData);
      setUnresolvedMistakesCount(misData?.mistakes?.length || 0);
      setDocuments(Array.isArray(docData) ? docData : []);
      setSettings(setData);
      setShowOnboarding(Boolean(setData && !setData.onboardingCompleted));
      setLoadError(null);
    } catch (err) {
      console.error('Error loading study data:', err);
      setLoadError(errMsg(err, 'We could not reach the server.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Keeps navigation counts honest after a review, retest or test without reloading everything.
  const refreshBadges = useCallback(async () => {
    try {
      const [met, mis] = await Promise.all([api('/api/curriculum/metrics'), api('/api/mistakes?resolved=false')]);
      setMetrics(met);
      setUnresolvedMistakesCount(mis?.mistakes?.length || 0);
    } catch { /* badges are non-critical */ }
  }, []);

  const handleStartLearn = (conceptId: string) => { setActiveLessonConceptId(conceptId); setActiveTab('learn'); };

  const handleStartPlanTask = (item: StudyPlanItem) => {
    if (item.type === 'NEW_LEARN' && item.conceptId) handleStartLearn(item.conceptId);
    else if (item.type === 'SPACED_REVIEW') setActiveTab('review');
    else if (item.type === 'MISTAKE_REMEDIATION') setActiveTab('mistakes');
    else if (item.type === 'MIXED_RETRIEVAL' || item.type === 'TOPIC_TEST') setActiveTab('tests');
  };

  const handleTogglePlanItem = async (itemId: string) => {
    try { setDailyPlan(await postJson('/api/planner/toggle-item', { itemId, date: localDate() })); }
    catch (err) { console.error(err); }
  };

  const handleRefreshPlan = async (targetMinutes: number) => {
    try {
      // Persist the choice so the plan, Settings and the next reload all agree.
      await postJson('/api/settings', { targetStudyMinutesPerDay: targetMinutes });
      setSettings((cur) => (cur ? { ...cur, targetStudyMinutesPerDay: targetMinutes } : cur));
      setDailyPlan(await api(`/api/planner/today?targetMinutes=${targetMinutes}&date=${localDate()}`));
    } catch (err) { console.error(err); }
  };

  const handleUploadPdf = async (file: File, subjectId: string, subjectName: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subjectId', subjectId);
    formData.append('subjectName', subjectName);
    await safeParseJson(await fetch('/api/curriculum/upload-pdf', { method: 'POST', body: formData }));
    await loadData();
  };

  const handleImportText = async (subjectId: string, subjectName: string, text: string, title: string) => {
    await postJson('/api/curriculum/import-text', { subjectId, subjectName, notesText: text, sourceTitle: title });
    await loadData();
  };

  const mutate = async (url: string, method: 'POST' | 'DELETE') => {
    await api(url, { method });
    await loadData();
  };

  const handleResetSeed = () => mutate('/api/curriculum/reset', 'POST');
  const handleDeleteSubject = (id: string) => mutate(`/api/curriculum/subjects/${id}`, 'DELETE');
  const handleDeleteTopic = (id: string) => mutate(`/api/curriculum/topics/${id}`, 'DELETE');
  const handleDeleteConcept = (id: string) => mutate(`/api/curriculum/concepts/${id}`, 'DELETE');
  const handleDeleteDocument = (id: string) => mutate(`/api/curriculum/documents/${id}`, 'DELETE');
  const handleClearAll = async () => { await mutate('/api/curriculum/clear-all', 'POST'); setSelectedSubjectId(''); };

  const handleAddSubject = async (name: string, description?: string) => {
    const newSub = await postJson('/api/curriculum/subjects', { name, description });
    await loadData();
    if (newSub?.id) setSelectedSubjectId(newSub.id);
  };

  const navigate = (tab: ActiveTab) => setActiveTab(tab);

  if (showOnboarding) {
    return (
      <MotionConfig reducedMotion="user">
        <TermOnboarding
          onComplete={async () => { setShowOnboarding(false); await loadData(); setActiveTab('today'); }}
          onCancel={settings?.onboardingCompleted ? () => setShowOnboarding(false) : undefined}
        />
      </MotionConfig>
    );
  }

  const pageKey = activeTab === 'learn' ? `learn-${activeLessonConceptId ?? 'browse'}` : activeTab;

  return (
    <MotionConfig reducedMotion="user">
      <AppShell active={activeTab} onNavigate={navigate} counts={{ review: metrics.overdueReviewsCount, mistakes: unresolvedMistakesCount }}>
        {isLoading ? (
          <div className="space-y-8" role="status" aria-label="Loading">
            <div className="space-y-3"><Skeleton className="h-10 w-72" /><Skeleton className="h-5 w-48" /></div>
            <Skeleton className="h-52 w-full" />
            <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
          </div>
        ) : loadError ? (
          <EmptyState
            title="We couldn't load your study data"
            description={`${loadError} Check that the server is running and try again.`}
            action={<Button variant="primary" onClick={() => { setIsLoading(true); loadData(); }}>Try again</Button>}
          />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={pageKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}>
              {activeTab === 'today' && (
                <HomeView
                  plan={dailyPlan}
                  subjects={subjects}
                  metrics={metrics}
                  termStartDate={settings?.termStartDate}
                  termEndDate={settings?.termEndDate}
                  onToggleItem={handleTogglePlanItem}
                  onRefreshPlan={handleRefreshPlan}
                  onStartTask={handleStartPlanTask}
                  onOpenNotes={() => setActiveTab('notes')}
                  onOpenLearn={() => setActiveTab('learn')}
                />
              )}

              {activeTab === 'learn' && (activeLessonConceptId ? (
                <InteractiveLessonView
                  conceptId={activeLessonConceptId}
                  onBackToCurriculum={() => setActiveLessonConceptId(null)}
                  onLessonComplete={() => { setActiveLessonConceptId(null); loadData(); setActiveTab('today'); }}
                />
              ) : (
                <CurriculumView
                  subjects={subjects}
                  topics={topics}
                  concepts={concepts.map((c) => ({ ...c, mastery: masteryMap[c.id] }))}
                  selectedSubjectId={selectedSubjectId}
                  onSelectSubject={setSelectedSubjectId}
                  onStartLearn={handleStartLearn}
                  onAddSubject={handleAddSubject}
                  onDeleteSubject={handleDeleteSubject}
                  onDeleteTopic={handleDeleteTopic}
                  onDeleteConcept={handleDeleteConcept}
                  onOpenNotes={() => setActiveTab('notes')}
                />
              ))}

              {activeTab === 'review' && <ReviewQueueView onStartLesson={handleStartLearn} onDataChanged={refreshBadges} />}

              {activeTab === 'mistakes' && <MistakeBankView subjects={subjects} onStartLearn={handleStartLearn} onDataChanged={refreshBadges} />}

              {activeTab === 'tests' && (
                <TestEngineView subjects={subjects} topics={topics} concepts={concepts} masteryMap={masteryMap} onStartLearn={handleStartLearn} onDataChanged={refreshBadges} />
              )}

              {activeTab === 'progress' && <ProgressDashboard subjects={subjects} concepts={concepts} masteryMap={masteryMap} metrics={metrics} />}

              {activeTab === 'notes' && (
                <NotesView
                  subjects={subjects}
                  concepts={concepts}
                  documents={documents}
                  selectedSubjectId={selectedSubjectId}
                  onImportText={handleImportText}
                  onUploadPdf={handleUploadPdf}
                  onDeleteDocument={handleDeleteDocument}
                  onStartLearn={handleStartLearn}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  onRestartSetup={() => setShowOnboarding(true)}
                  onSettingsUpdated={loadData}
                  onResetSeed={handleResetSeed}
                  onClearAll={handleClearAll}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </AppShell>
    </MotionConfig>
  );
}
