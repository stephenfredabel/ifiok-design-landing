'use client';

import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { tr } from '@/i18n/tr';

/** Close something when the user clicks outside it or presses Escape. */
export function useDismiss(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const down = (e: Event) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key, true);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key, true); };
  }, [open, onClose, ref]);
}

/** Keep a dropdown inside the window: flip it left and/or up if it would run off the edge. */
export function useFit(open: boolean, deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shift, setShift] = useState({ x: 0, flipY: false });
  useLayoutEffect(() => {
    const el = ref.current; if (!el || !open) { setShift({ x: 0, flipY: false }); return; }
    const r = el.getBoundingClientRect();
    const over = r.right - (window.innerWidth - 8);
    setShift({ x: over > 0 ? -over : r.left < 8 ? 8 - r.left : 0, flipY: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ...deps]);
  return { ref, style: shift.x ? { transform: `translateX(${shift.x}px)` } : undefined };
}

/** A modal dialog (bottom sheet on phones). */
export function Dialog({ title, onClose, children, foot, wide }: { title: string; onClose: () => void; children: React.ReactNode; foot?: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', key, true);
    ref.current?.querySelector<HTMLElement>('input,select,textarea,button.ex-btn.p')?.focus();
    return () => document.removeEventListener('keydown', key, true);
  }, [onClose]);
  return (
    <div className="ex-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`dx-dlg${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="dx-dlg-h"><b>{title}</b><button type="button" className="ex-ib" onClick={onClose} aria-label={tr('Close')}><X aria-hidden="true" /></button></div>
        <div className="dx-dlg-b">{children}</div>
        {foot && <div className="dx-dlg-f">{foot}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="dx-field"><span>{label}</span>{children}</label>;
}
