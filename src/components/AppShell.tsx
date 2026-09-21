import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChartColumn, ClipboardCheck, Ellipsis, FileText, Flag, House, RotateCw, Settings } from 'lucide-react';
import { Logo } from './brand/Logo.tsx';
import { Dialog } from './ui/index.ts';

export type ActiveTab = 'today' | 'learn' | 'review' | 'tests' | 'mistakes' | 'progress' | 'notes' | 'settings';

interface NavDef { id: ActiveTab; label: string; Icon: React.ComponentType<{ className?: string }>; }

const PRIMARY: NavDef[] = [
  { id: 'today', label: 'Home', Icon: House },
  { id: 'learn', label: 'Learn', Icon: BookOpen },
  { id: 'review', label: 'Review', Icon: RotateCw },
  { id: 'tests', label: 'Tests', Icon: ClipboardCheck },
  { id: 'mistakes', label: 'Mistakes', Icon: Flag },
  { id: 'progress', label: 'Progress', Icon: ChartColumn },
  { id: 'notes', label: 'Notes', Icon: FileText },
];
const SETTINGS: NavDef = { id: 'settings', label: 'Settings', Icon: Settings };
const BOTTOM: NavDef[] = PRIMARY.slice(0, 4);
const MORE: NavDef[] = [PRIMARY[4], PRIMARY[5], PRIMARY[6], SETTINGS];

interface ShellProps {
  active: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  counts: { review: number; mistakes: number };
  children: React.ReactNode;
}

function Count({ n }: { n: number }) {
  if (!n) return null;
  return <span className="ml-auto t-small font-medium tnum text-brand-700 hidden lg:inline">{n}</span>;
}

export function AppShell({ active, onNavigate, counts, children }: ShellProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const countFor = (id: ActiveTab) => (id === 'review' ? counts.review : id === 'mistakes' ? counts.mistakes : 0);
  const moreActive = MORE.some((m) => m.id === active);

  const SideItem = ({ item }: { item: NavDef }) => {
    const on = active === item.id;
    const n = countFor(item.id);
    return (
      <button
        type="button" title={item.label} aria-current={on ? 'page' : undefined} onClick={() => onNavigate(item.id)}
        className={`relative flex h-10 w-full items-center gap-3 rounded-md px-3 t-body font-medium transition-colors md:justify-center lg:justify-start ${on ? 'text-navy-900' : 'text-ink-3 hover:bg-sunken hover:text-ink'}`}
      >
        {on && <motion.span layoutId="nav-side" className="absolute inset-0 rounded-md bg-brand-50" transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }} />}
        <item.Icon className={`relative size-[18px] shrink-0 ${on ? 'text-brand-600' : ''}`} />
        <span className="relative hidden lg:inline">{item.label}</span>
        <span className="relative ml-auto flex items-center"><Count n={n} /></span>
        {n > 0 && <span aria-hidden className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-brand-600 lg:hidden" />}
        {n > 0 && <span className="sr-only">{n} pending</span>}
      </button>
    );
  };

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Desktop sidebar / tablet rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-line bg-surface md:flex lg:w-[248px]">
        <div className="flex h-[72px] items-center justify-center px-3 lg:justify-start lg:px-6">
          <button type="button" onClick={() => onNavigate('today')} aria-label="Termwise home" className="rounded-md">
            <span className="lg:hidden"><Logo variant="mark" size={34} /></span>
            <span className="hidden lg:block"><Logo variant="horizontal" size={36} /></span>
          </button>
        </div>
        <nav aria-label="Primary" className="flex flex-1 flex-col px-3 pb-4 pt-2">
          <div className="space-y-0.5">{PRIMARY.map((it) => <SideItem key={it.id} item={it} />)}</div>
          <div className="mt-auto"><SideItem item={SETTINGS} /></div>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-line bg-surface/95 px-5 backdrop-blur md:hidden">
        <button type="button" onClick={() => onNavigate('today')} aria-label="Termwise home">
          <Logo variant="horizontal" size={30} />
        </button>
      </header>

      <main id="main" className="pb-28 md:pb-0 md:pl-[76px] lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-8 sm:px-8 md:py-12 lg:px-12">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-5">
          {BOTTOM.map((it) => {
            const on = active === it.id;
            const n = countFor(it.id);
            return (
              <button key={it.id} type="button" aria-current={on ? 'page' : undefined} onClick={() => onNavigate(it.id)}
                className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 t-micro font-medium transition-colors ${on ? 'text-brand-700' : 'text-ink-3'}`}>
                {on && <motion.span layoutId="nav-bottom" className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-brand-600" transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }} />}
                <span className="relative"><it.Icon className="size-5" />{n > 0 && <span aria-hidden className="absolute -right-1 -top-0.5 size-2 rounded-full bg-brand-600" />}</span>
                {it.label}
              </button>
            );
          })}
          <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog"
            className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 t-micro font-medium ${moreActive ? 'text-brand-700' : 'text-ink-3'}`}>
            {moreActive && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-brand-600" />}
            <Ellipsis className="size-5" />
            More
          </button>
        </div>
      </nav>

      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title="More" size="sm">
        <ul className="-mx-2 pb-2">
          {MORE.map((it) => {
            const n = countFor(it.id);
            return (
              <li key={it.id}>
                <button type="button" onClick={() => { setMoreOpen(false); onNavigate(it.id); }}
                  className={`flex h-12 w-full items-center gap-3 rounded-md px-3 t-body font-medium hover:bg-sunken ${active === it.id ? 'text-brand-700' : 'text-ink'}`}>
                  <it.Icon className="size-5 text-ink-3" />
                  {it.label}
                  {n > 0 && <span className="ml-auto t-small font-medium tnum text-brand-700">{n}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </Dialog>
    </div>
  );
}
