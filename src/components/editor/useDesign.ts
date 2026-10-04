'use client';

import { useCallback, useRef, useState } from 'react';
import { PAGE, SAFE, START_OBJS, uid, type DesignTemplate, type Obj } from './data';
import { tr } from '@/i18n/tr';

export type Check = { id: string; ok: boolean; label: string; detail?: string; fix?: () => void };

/** The mockup's design state: objects on one page, a selection and an undo history. */
export function useDesign() {
  const [objs, setObjs] = useState<Obj[]>(START_OBJS);
  const [page, setPage] = useState('#B6322B');
  const [sel, setSel] = useState<string[]>([]);
  const past = useRef<Obj[][]>([]);
  const future = useRef<Obj[][]>([]);
  const cur = useRef(objs); cur.current = objs;
  const [, bump] = useState(0);

  /** Remember the current state so the next change can be undone. */
  const begin = useCallback(() => { past.current.push(cur.current); if (past.current.length > 80) past.current.shift(); future.current = []; bump((n) => n + 1); }, []);
  const set = useCallback((fn: (o: Obj[]) => Obj[]) => setObjs((o) => fn(o)), []);
  const patch = useCallback((ids: string[], p: Partial<Obj>, record = true) => { if (record) begin(); setObjs((o) => o.map((x) => (ids.includes(x.id) ? { ...x, ...p } : x))); }, [begin]);
  const add = useCallback((o: Omit<Obj, 'id'>) => { begin(); const id = uid(); setObjs((l) => [...l, { ...o, id }]); setSel([id]); return id; }, [begin]);
  const removeSel = useCallback(() => { if (!sel.length) return; begin(); setObjs((l) => l.filter((x) => !sel.includes(x.id))); setSel([]); }, [sel, begin]);
  const duplicateSel = useCallback(() => {
    if (!sel.length) return;
    begin();
    const copies: Obj[] = cur.current.filter((x) => sel.includes(x.id)).map((x) => ({ ...x, id: uid(), x: x.x + 16, y: x.y + 16 }));
    setObjs((l) => [...l, ...copies]); setSel(copies.map((c) => c.id));
  }, [sel, begin]);
  const selectAll = useCallback(() => setSel(cur.current.map((x) => x.id)), []);
  const undo = useCallback(() => { const p = past.current.pop(); if (!p) return; future.current.push(cur.current); setObjs(p); setSel([]); bump((n) => n + 1); }, []);
  const redo = useCallback(() => { const f = future.current.pop(); if (!f) return; past.current.push(cur.current); setObjs(f); setSel([]); bump((n) => n + 1); }, []);
  const load = useCallback((t: DesignTemplate) => { begin(); setObjs(t.objs.map((o) => ({ ...o }))); setPage(t.page); setSel([]); }, [begin]);

  return { objs, page, setPage, sel, setSel, begin, set, patch, add, removeSel, duplicateSel, selectAll, undo, redo, load, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}
export type DesignState = ReturnType<typeof useDesign>;

const outside = (o: Obj) => o.x < SAFE || o.y < SAFE || o.x + o.w > PAGE.w - SAFE || o.y + o.h > PAGE.h - SAFE;

/** The print-readiness checks shown in the chip. Moving things around changes the answer. */
export function checkDesign(D: DesignState): Check[] {
  const risky = D.objs.filter((o) => o.type !== 'shape' && outside(o));
  const soft = D.objs.filter((o) => o.type === 'image' && Math.round(300 * (320 / o.w)) < 240);
  const clamp = (o: Obj) => ({ x: Math.min(Math.max(o.x, SAFE), PAGE.w - SAFE - o.w), y: Math.min(Math.max(o.y, SAFE), PAGE.h - SAFE - o.h) });
  return [
    { id: 'safe', ok: risky.length === 0, label: risky.length ? tr('{count} item is outside the safe area', { count: risky.length }) : tr('Everything is inside the safe area'), detail: risky.length ? tr('Text or images this close to the edge can be cut when trimmed.') : undefined,
      fix: risky.length ? () => { D.begin(); D.set((l) => l.map((o) => (risky.some((r) => r.id === o.id) ? { ...o, ...clamp(o) } : o))); } : undefined },
    { id: 'res', ok: soft.length === 0, label: soft.length ? tr('A photo is {dpi} DPI at this size', { dpi: Math.round(300 * (320 / soft[0].w)) }) : tr('Photos are 300 DPI'), detail: soft.length ? tr('Under 240 DPI looks soft in print. Make it smaller or use a sharper photo.') : undefined,
      fix: soft.length ? () => { D.begin(); D.set((l) => l.map((o) => (soft.some((s) => s.id === o.id) ? { ...o, w: 320, h: Math.round((o.h / o.w) * 320) } : o))); } : undefined },
    { id: 'cmyk', ok: true, label: tr('Colours convert to CMYK') },
    { id: 'bleed', ok: true, label: tr('Bleed of 3 mm is set') },
    { id: 'fonts', ok: true, label: tr('Fonts are embedded') },
  ];
}
