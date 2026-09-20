import React from 'react';
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  RotateCcw,
  AlertTriangle,
  FileCheck2,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';

export type ActiveTab =
  | 'today'
  | 'curriculum'
  | 'learn'
  | 'review'
  | 'mistakes'
  | 'tests'
  | 'progress'
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  overdueCount: number;
  unresolvedMistakesCount: number;
  coveragePct: number;
  masteryPct: number;
  onRestartSetup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  overdueCount,
  unresolvedMistakesCount,
  coveragePct,
  masteryPct,
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    {
      id: 'review',
      label: 'Review',
      icon: RotateCcw,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'mistakes',
      label: 'Mistake Bank',
      icon: AlertTriangle,
      badge: unresolvedMistakesCount > 0 ? unresolvedMistakesCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    { id: 'tests', label: 'Tests & Mocks', icon: FileCheck2 },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Zone: Identity & Progress Meters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              AM
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight leading-none flex items-center gap-2">
                <span>Academic Mastery</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                School curriculum transformed into durable retention
              </div>
            </div>
          </div>

          {/* Visual Inline Progress Gauges */}
          <div className="flex items-center gap-6">
            {/* Curriculum Gauge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Curriculum
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {coveragePct}% <span className="font-normal text-slate-400">covered</span>
                </div>
              </div>
              <div className="w-20 sm:w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-slate-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${coveragePct}%` }}
                />
              </div>
            </div>

            {/* Demonstrated Mastery Gauge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Mastery
                </div>
                <div className="text-xs font-bold text-indigo-700">
                  {masteryPct}%
                </div>
              </div>
              <div className="w-20 sm:w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, masteryPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Zone: Nav Tab Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 sm:gap-2 py-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-semibold rounded-full border ${
                      item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
