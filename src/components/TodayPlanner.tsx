import React, { useState } from 'react';
import {
  DailyStudyPlan,
  StudyPlanItem,
  StudyPlanItemType,
  Subject,
} from '../types.ts';
import {
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  FileCheck2,
  Compass,
  Award,
  Calendar,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { MathMarkdown } from './MathMarkdown.tsx';

interface TodayPlannerProps {
  plan: DailyStudyPlan | null;
  subjects: Subject[];
  metrics?: {
    coveredConcepts: number;
    totalConcepts: number;
    masteredConcepts: number;
    overdueReviewsCount: number;
  };
  countdownLabel?: string;
  termEndDate?: string;
  onToggleItem: (itemId: string) => void;
  onRefreshPlan: (targetMinutes: number) => void;
  onStartTask: (item: StudyPlanItem) => void;
}

export const TodayPlanner: React.FC<TodayPlannerProps> = ({
  plan,
  subjects,
  metrics,
  countdownLabel,
  termEndDate,
  onToggleItem,
  onRefreshPlan,
  onStartTask,
}) => {
  const [targetMinutes, setTargetMinutes] = useState<number>(plan?.targetMinutes || 90);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!plan) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Synthesizing optimized study plan...</p>
      </div>
    );
  }

  const completedItems = plan.items.filter((i) => i.completed);
  const totalTasks = plan.items.length;
  const completedTasksCount = completedItems.length;
  const isAllDone = totalTasks > 0 && completedTasksCount === totalTasks;
  const progressPercent =
    plan.targetMinutes > 0
      ? Math.min(100, Math.round((plan.completedMinutes / plan.targetMinutes) * 100))
      : 0;

  const handleTimeChange = (mins: number) => {
    setTargetMinutes(mins);
    onRefreshPlan(mins);
  };

  const getCategoryConfig = (type: StudyPlanItemType, index: number) => {
    switch (type) {
      case 'NEW_LEARN':
        return {
          stepNum: '1',
          categoryLabel: 'Learn',
          btnText: 'Start Learning',
          pillClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          badgeText: 'New concept',
          icon: BookOpen,
        };
      case 'SPACED_REVIEW':
        return {
          stepNum: '2',
          categoryLabel: 'Review',
          btnText: 'Start Review',
          pillClass: 'bg-blue-100 text-blue-900 border-blue-200',
          badgeText: 'Due today',
          icon: RotateCcw,
        };
      case 'MISTAKE_REMEDIATION':
        return {
          stepNum: '3',
          categoryLabel: 'Fix a weakness',
          btnText: 'Fix Weakness',
          pillClass: 'bg-rose-100 text-rose-900 border-rose-200',
          badgeText: "You've struggled with this recently",
          icon: AlertTriangle,
        };
      case 'MIXED_RETRIEVAL':
      case 'TOPIC_TEST':
        return {
          stepNum: '4',
          categoryLabel: 'Practice',
          btnText: 'Start Practice',
          pillClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          badgeText: 'Application practice',
          icon: FileCheck2,
        };
      default:
        return {
          stepNum: `${index + 1}`,
          categoryLabel: 'Study Block',
          btnText: 'Start Session',
          pillClass: 'bg-slate-100 text-slate-800 border-slate-200',
          badgeText: 'Prescribed review',
          icon: Compass,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Home Header Card: Directly answers "What should I do now?" */}
      <section
        id="hero-planner"
        className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Personalized Student Planner</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}. Here's what matters today.
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Your notes are organized into concepts. Below is your optimized daily study plan based on your current learning state and forgetting curve.
            </p>

            {/* Curriculum Progress Summary Pill */}
            {metrics && (
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
                <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    <strong>Curriculum:</strong> {metrics.coveredConcepts} / {metrics.totalConcepts} concepts learned
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-emerald-900">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    <strong>Mastery Standard:</strong> {metrics.masteredConcepts} / {metrics.totalConcepts} meeting standard
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Time Target selector */}
          <div className="shrink-0 flex flex-col sm:items-end gap-1.5">
            <div className="text-xs font-medium text-slate-500">Target Study Duration</div>
            <div
              id="target-time-selector"
              className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shadow-inner"
            >
              {[45, 60, 90, 120].map((mins) => {
                const isSelected = targetMinutes === mins;
                return (
                  <button
                    key={mins}
                    onClick={() => handleTimeChange(mins)}
                    className={`px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mins}m
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Progress Gauge */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium gap-2">
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-semibold">
                Daily Completion: {plan.completedMinutes} of {plan.targetMinutes} min
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                {completedTasksCount} of {totalTasks} tasks completed
              </span>
            </div>
            <div className="font-bold text-indigo-700 font-mono">
              {progressPercent}% Complete
            </div>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Contextual Term Countdown Header Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-slate-500/5 to-transparent border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Term Countdown
            </div>
            <div className="text-sm font-bold text-slate-900">
              {countdownLabel || 'Term schedule active'}
            </div>
          </div>
        </div>
        {termEndDate && (
          <div className="hidden sm:block text-xs text-slate-500 font-medium text-right">
            <span>Term ends </span>
            <span className="font-bold text-slate-700">{termEndDate}</span>
          </div>
        )}
      </div>

      {/* Completion Banner if all tasks completed */}
      {isAllDone && (
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-emerald-950">
            You're done for today!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
            {completedTasksCount} tasks completed • Retention score protected. Great consistency!
          </p>
          <div className="pt-2 text-xs text-slate-500">
            <strong>Tomorrow's Schedule Preview:</strong> Mathematics Spaced Review, Chemistry Ionic Bonding Practice.
          </div>
        </div>
      )}

      {/* Today's Study Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Today's Study</span>
            <span className="text-xs font-normal text-slate-500">
              ({totalTasks} prioritized items)
            </span>
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">
            Determined by student evidence & learning state
          </span>
        </div>

        <div className="space-y-3.5">
          {plan.items.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                No Tasks in Today's Queue
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Upload your school notes or syllabus in the Curriculum tab to automatically build concepts and generate personalized daily study tasks.
              </p>
            </div>
          ) : (
            plan.items.map((item, index) => {
              const isTopPriority = index === 0 && !item.completed;
              const catConfig = getCategoryConfig(item.type, index);
              const CatIcon = catConfig.icon;

              return (
                <div
                  key={item.id}
                  id={`task-card-${index + 1}`}
                  className={`group rounded-xl p-5 transition-all duration-200 ${
                    item.completed
                      ? 'bg-slate-50/80 border border-slate-200/60 opacity-60'
                      : isTopPriority
                      ? 'bg-white border-l-4 border-l-indigo-600 border-y border-r border-slate-200/90 shadow-md ring-1 ring-indigo-50/50'
                      : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Column: Category, Item Details, and Algorithmic Reason */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Checkbox Target */}
                      <button
                        type="button"
                        onClick={() => onToggleItem(item.id)}
                        className="mt-0.5 shrink-0 focus:outline-hidden"
                        title={item.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50 transition-transform active:scale-95" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-indigo-600 transition-colors flex items-center justify-center group-hover:border-slate-400" />
                        )}
                      </button>

                      {/* Information Grid */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Meta row: Category Step # + Subject + Badge */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            {catConfig.stepNum}. {catConfig.categoryLabel}
                          </span>

                          <span className="text-xs font-semibold text-slate-800">
                            {item.subjectName}
                          </span>

                          <span className="text-slate-300">•</span>

                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${catConfig.pillClass}`}>
                            <CatIcon className="w-3 h-3" />
                            <span>{catConfig.badgeText}</span>
                          </span>
                        </div>

                        {/* Card Title */}
                        <h3
                          className={`text-base font-semibold tracking-tight leading-snug ${
                            item.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 group-hover:text-indigo-950 transition-colors'
                          }`}
                        >
                          <MathMarkdown content={item.title} inline />
                        </h3>

                        {/* Description */}
                        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                          <MathMarkdown content={item.description} inline />
                        </div>

                        {/* Algorithmic Reason */}
                        <div className="pt-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>
                              <strong>Why this now:</strong> <MathMarkdown content={item.reason} inline />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Time Estimate & Explicit Action Button */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 font-mono bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.estimatedMinutes} min</span>
                      </div>

                      {!item.completed && (
                        <button
                          type="button"
                          onClick={() => onStartTask(item)}
                          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                            isTopPriority
                              ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-100 hover:shadow-md hover:scale-[1.02]'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{catConfig.btnText}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
