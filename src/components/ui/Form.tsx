import React, { useId, useRef, useState } from 'react';
import { ChevronDown, FileText, Search, Upload, X } from 'lucide-react';

export const inputBase =
  'w-full h-10 rounded-md border border-line-strong bg-surface px-3 text-[15px] text-ink placeholder:text-ink-4 transition-colors hover:border-ink-4 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:bg-sunken disabled:text-ink-3';

export function Field({ label, hint, error, htmlFor, children, className = '' }: {
  label?: string; hint?: string; error?: string | null; htmlFor?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label htmlFor={htmlFor} className="block t-small font-medium text-ink">{label}</label>}
      {children}
      {error ? <p role="alert" className="t-small text-bad">{error}</p> : hint ? <p className="t-small text-ink-3">{hint}</p> : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...p }, ref) {
  return <input ref={ref} className={`${inputBase} ${className}`} {...p} />;
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className = '', ...p }, ref) {
  return <textarea ref={ref} className={`${inputBase} h-auto min-h-[7rem] py-2.5 leading-6 resize-y ${className}`} {...p} />;
});

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className = '', children, ...p }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={`${inputBase} appearance-none pr-9 truncate ${className}`} {...p}>{children}</select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
    </div>
  );
});

export function SearchInput({ className = '', ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
      <input type="search" className={`${inputBase} pl-9`} {...p} />
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-2.5 t-small text-ink-2 cursor-pointer select-none">
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors duration-150 ${checked ? 'bg-brand-600' : 'bg-line-strong'}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform duration-150 ease-out-soft ${checked ? 'translate-x-4' : ''}`} />
      </button>
      {label}
    </label>
  );
}

export function FileDrop({ file, onFile, accept, hint }: { file: File | null; onFile: (f: File | null) => void; accept: string; hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const id = useId();
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-line-strong bg-surface px-3 py-2.5">
        <FileText aria-hidden className="size-5 shrink-0 text-brand-600" />
        <div className="min-w-0 flex-1">
          <p className="t-body font-medium truncate">{file.name}</p>
          <p className="t-micro text-ink-3">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button type="button" aria-label="Remove file" onClick={() => onFile(null)} className="grid size-8 place-items-center rounded-md text-ink-3 hover:bg-sunken hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
    );
  }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      className={`rounded-md border border-dashed px-4 py-8 text-center transition-colors ${over ? 'border-brand-500 bg-brand-50' : 'border-line-strong bg-canvas hover:bg-sunken'}`}
    >
      <input ref={inputRef} id={id} type="file" accept={accept} className="sr-only" onChange={(e) => onFile(e.target.files?.[0] || null)} />
      <Upload aria-hidden className="mx-auto size-5 text-ink-3" />
      <label htmlFor={id} className="mt-2 block t-body font-medium text-brand-700 cursor-pointer hover:underline focus-within:underline">Choose a file</label>
      <p className="t-small text-ink-3 mt-0.5">or drop it here{hint ? `. ${hint}` : ''}</p>
    </div>
  );
}
