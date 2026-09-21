import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Ellipsis } from 'lucide-react';
import { Button } from './Button.tsx';
import { errMsg } from '../../lib/format.ts';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }: {
  open: boolean; onClose: () => void; title: string; description?: string; children?: React.ReactNode;
  footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; dismissible?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const el = panel.current?.querySelector<HTMLElement>('[data-autofocus]') || panel.current?.querySelector<HTMLElement>('input,textarea,select') || panel.current;
      el?.focus();
    }, 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, dismissible]);

  const width = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-navy-950/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={dismissible ? onClose : undefined}
          />
          <motion.div
            ref={panel}
            role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined} tabIndex={-1}
            className={`relative flex max-h-[92dvh] w-full ${width} flex-col rounded-t-xl bg-surface shadow-pop outline-none sm:rounded-xl`}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <div className="px-6 pt-6 pb-4">
              <h2 id={titleId} className="t-h2">{title}</h2>
              {description && <p id={descId} className="mt-1.5 t-body text-ink-3">{description}</p>}
            </div>
            {children && <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">{children}</div>}
            {footer && <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', tone = 'default', onConfirm, onClose, children }: {
  open: boolean; title: string; description?: string; confirmLabel?: string; tone?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>; onClose: () => void; children?: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setError(null); setBusy(false); } }, [open]);
  const run = async () => {
    setBusy(true); setError(null);
    try { await onConfirm(); onClose(); } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Dialog
      open={open} onClose={busy ? () => {} : onClose} title={title} description={description} size="sm" dismissible={!busy}
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={run} loading={busy} data-autofocus>{confirmLabel}</Button>
      </>}
    >
      {children}
      {error && <p role="alert" className="t-small text-bad mt-1">{error}</p>}
    </Dialog>
  );
}

export interface MenuItem { label: string; onSelect: () => void; tone?: 'danger'; disabled?: boolean; }

export function RowMenu({ items, label = 'More actions', className = '' }: { items: MenuItem[]; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); wrap.current?.querySelector<HTMLElement>('button')?.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const els = Array.from(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') || []);
        const i = els.indexOf(document.activeElement as HTMLElement);
        const next = e.key === 'ArrowDown' ? (i + 1) % els.length : (i - 1 + els.length) % els.length;
        els[next]?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => wrap.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(), 30);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [open]);

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <button
        type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="grid size-8 place-items-center rounded-md text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
      >
        <Ellipsis className="size-[18px]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId} role="menu"
            className="absolute right-0 top-full z-40 mt-1 min-w-[10.5rem] rounded-md bg-surface p-1 shadow-pop"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
          >
            {items.map((it) => (
              <button
                key={it.label} role="menuitem" type="button" disabled={it.disabled}
                onClick={() => { setOpen(false); it.onSelect(); }}
                className={`flex w-full items-center rounded-sm px-3 py-2 text-left t-body transition-colors hover:bg-sunken focus:bg-sunken focus:outline-none disabled:opacity-50 ${it.tone === 'danger' ? 'text-bad' : 'text-ink'}`}
              >
                {it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
