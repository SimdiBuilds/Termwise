import { safeParseJson } from '../utils.ts';

const SMALL_WORDS = new Set(['THE', 'AND', 'OF', 'IN', 'TO', 'FOR', 'A', 'AN', 'ON', 'BY', 'OR', 'AS', 'AT', 'IS', 'IT', 'WITH', 'FROM']);

/** Display-only: school notes are often SHOUTED. Sentence-case them, keeping short acronyms (DNA, ATP). */
export function tidyTitle(raw?: string): string {
  const s = (raw || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const tokens = s.match(/[A-Za-z]+/g) || [];
  const caps = tokens.filter((t) => t.length >= 2 && t === t.toUpperCase());
  const shouting = caps.length >= 2 && caps.length >= tokens.length * 0.5;
  const out = shouting
    ? s.replace(/[A-Za-z]+/g, (t) => (t === t.toUpperCase() && (t.length >= 4 || SMALL_WORDS.has(t)) ? t.toLowerCase() : t))
    : s;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

export const plural = (n: number, one: string, many?: string) => `${n} ${n === 1 ? one : many || one + 's'}`;

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning.';
  if (h < 18) return 'Good afternoon.';
  return 'Good evening.';
}

/** YYYY-MM-DD in the user's local timezone (the server otherwise uses UTC). */
export function localDate(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseLocal(date?: string): Date | null {
  if (!date) return null;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 23, 59, 59);
}

export interface TermStatus { label: string; days: number; fraction: number; endLabel: string; ended: boolean; }

export function termStatus(end?: string, start?: string, now = new Date()): TermStatus | null {
  const e = parseLocal(end);
  if (!e) return null;
  const days = Math.ceil((e.getTime() - now.getTime()) / 86400000);
  let label: string;
  if (days < 0) label = 'Term ended';
  else if (days === 0) label = 'Last day';
  else if (days === 1) label = '1 day left';
  else if (days < 14) label = `${days} days left`;
  else label = `${Math.floor(days / 7)} weeks left`;
  const s = parseLocal(start);
  let fraction = 0;
  if (s) {
    const startMs = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
    fraction = Math.min(1, Math.max(0, (now.getTime() - startMs) / Math.max(1, e.getTime() - startMs)));
  }
  const endLabel = e.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return { label, days, fraction, endLabel, ended: days < 0 };
}

export function fmtDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dueLabel(iso?: string, now = new Date()): string {
  if (!iso) return 'Due now';
  const diff = Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
  if (diff <= 0) return 'Due today';
  if (diff === 1) return 'Due yesterday';
  return `${diff} days overdue`;
}

export const MISTAKE_LABEL: Record<string, string> = {
  KNOWLEDGE_GAP: 'Knowledge gap',
  MISCONCEPTION: 'Misconception',
  RECALL_FAILURE: 'Recall',
  CALCULATION_ERROR: 'Calculation',
  MISREAD: 'Misread question',
  CARELESS_ERROR: 'Careless slip',
  APPLICATION_FAILURE: 'Application',
  PREREQUISITE_GAP: 'Prerequisite gap',
};

/** 3 = conceptual (needs real attention), 1 = slip. */
export const MISTAKE_RANK: Record<string, number> = {
  MISCONCEPTION: 3, KNOWLEDGE_GAP: 3, APPLICATION_FAILURE: 3, PREREQUISITE_GAP: 3,
  RECALL_FAILURE: 2, CALCULATION_ERROR: 2, MISREAD: 1, CARELESS_ERROR: 1,
};

export const STATUS_LABEL: Record<string, string> = {
  UNLEARNED: 'Not started', LEARNING: 'Learning', DEVELOPING: 'Developing', MASTERED: 'Mastered',
};

export function stripPlanPrefix(title: string): string {
  return tidyTitle(title.replace(/^(Spaced Retrieval|Mistake Remediation|New Concept|Topic Test|Mixed Topic Check)\s*:\s*/i, ''));
}

/** Fetch JSON with real error messages. */
export async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  return safeParseJson<T>(res);
}

export function postJson<T = any>(url: string, body?: unknown): Promise<T> {
  return api<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
}

export const errMsg = (e: unknown, fallback = 'Something went wrong. Please try again.') =>
  e instanceof Error && e.message ? e.message : fallback;
