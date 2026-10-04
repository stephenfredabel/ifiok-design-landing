'use client';

import { AlignCenter, AlignLeft, AlignRight, Bold, Copy, Lock, Minus, Plus, QrCode, Trash2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BRAND_COLORS, PAGE, SAFE, type Obj } from './data';
import { checkDesign, type DesignState } from './useDesign';
import { tr } from '@/i18n/tr';

const FONTS = ['Archivo', 'Georgia', 'Courier New'];
const STACK: Record<string, string> = { Archivo: "'Archivo', system-ui, sans-serif", Georgia: 'Georgia, serif', 'Courier New': "'Courier New', monospace" };

/** A small but real editing surface: click, shift-click, drag, resize, double-click to edit text, Ctrl+A, Delete, arrows, undo. */
export default function DesignCanvas({ D, zoom, guides }: { D: DesignState; zoom: number; guides: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [guideX, setGuideX] = useState(false);
  const drag = useRef<null | { sx: number; sy: number; orig: Record<string, { x: number; y: number }> }>(null);
  const [font, setFont] = useState(FONTS[0]);
  const tb = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  const [aw, setAw] = useState(0);
  const { objs, sel } = D;
  const selObjs = objs.filter((o) => sel.includes(o.id));
  const risky = new Set(checkDesign(D).find((c) => c.id === 'safe')?.ok ? [] : objs.filter((o) => o.type !== 'shape' && (o.x < SAFE || o.y < SAFE || o.x + o.w > PAGE.w - SAFE || o.y + o.h > PAGE.h - SAFE)).map((o) => o.id));

  // keyboard
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); D.selectAll(); }
      else if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? D.redo() : D.undo(); }
      else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); D.redo(); }
      else if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); D.duplicateSel(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (D.sel.length) { e.preventDefault(); D.removeSel(); } }
      else if (e.key === 'Escape') D.setSel([]);
      else if (e.key.startsWith('Arrow') && D.sel.length) {
        e.preventDefault();
        const s = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -s : e.key === 'ArrowRight' ? s : 0, dy = e.key === 'ArrowUp' ? -s : e.key === 'ArrowDown' ? s : 0;
        D.begin(); D.set((l) => l.map((o) => (D.sel.includes(o.id) ? { ...o, x: o.x + dx, y: o.y + dy } : o)));
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [D]);

  const startDrag = (o: Obj, e: React.PointerEvent) => {
    if (editing === o.id) return;
    e.stopPropagation();
    const add = e.shiftKey || e.metaKey || e.ctrlKey;
    let next = sel;
    if (!sel.includes(o.id)) next = add ? [...sel, o.id] : [o.id];
    else if (add) next = sel.filter((i) => i !== o.id);
    D.setSel(next);
    if (!next.includes(o.id)) return;
    D.begin();
    drag.current = { sx: e.clientX, sy: e.clientY, orig: Object.fromEntries(objs.filter((x) => next.includes(x.id)).map((x) => [x.id, { x: x.x, y: x.y }])) };
    const move = (ev: PointerEvent) => {
      const d = drag.current; if (!d) return;
      let dx = (ev.clientX - d.sx) / zoom, dy = (ev.clientY - d.sy) / zoom;
      const ids = Object.keys(d.orig);
      if (ids.length === 1) { // snap to the page centre
        const b = objs.find((x) => x.id === ids[0])!;
        const cx = d.orig[ids[0]].x + dx + b.w / 2;
        if (Math.abs(cx - PAGE.w / 2) < 6) { dx += PAGE.w / 2 - cx; setGuideX(true); } else setGuideX(false);
      }
      D.set((l) => l.map((x) => (d.orig[x.id] ? { ...x, x: Math.round(d.orig[x.id].x + dx), y: Math.round(d.orig[x.id].y + dy) } : x)));
    };
    const up = () => { drag.current = null; setGuideX(false); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  const startResize = (o: Obj, e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    D.begin();
    const sx = e.clientX, sy = e.clientY, ow = o.w, oh = o.h, os = o.size ?? 20;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - sx) / zoom, dy = (ev.clientY - sy) / zoom;
      const w = Math.max(30, Math.round(ow + dx));
      D.set((l) => l.map((x) => (x.id === o.id ? (o.type === 'text' ? { ...x, w, h: Math.max(20, Math.round(oh * (w / ow))), size: Math.max(8, Math.round(os * (w / ow))) } : { ...x, w, h: Math.max(10, Math.round(oh + dy)) }) : x)));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  const bounds = selObjs.length ? { x: Math.min(...selObjs.map((o) => o.x)), y: Math.min(...selObjs.map((o) => o.y)), r: Math.max(...selObjs.map((o) => o.x + o.w)), b: Math.max(...selObjs.map((o) => o.y + o.h)) } : null;
  const texts = selObjs.filter((o) => o.type === 'text');
  const first = selObjs[0];

  // keep the floating toolbar inside the work area, whatever the zoom
  useLayoutEffect(() => {
    const el = tb.current; const area = el?.closest('.ex-main') as HTMLElement | null;
    if (!el || !area) { if (shift) setShift(0); return; }
    const r = el.getBoundingClientRect(), a = area.getBoundingClientRect();
    const l0 = r.left - shift * zoom, r0 = r.right - shift * zoom;
    let next = 0;
    if (r0 > a.right - 8) next = (a.right - 8 - r0) / zoom;
    if (l0 + next * zoom < a.left + 8) next = (a.left + 8 - l0) / zoom;
    if (Math.abs(next - shift) > 0.5) setShift(next);
    if (Math.abs(a.width - aw) > 1) setAw(a.width);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ex-stage" onPointerDown={() => { D.setSel([]); setEditing(null); }}>
      <div className="ex-pagewrap" style={{ width: PAGE.w * zoom, height: PAGE.h * zoom }}>
        <div className="ex-page" style={{ width: PAGE.w, height: PAGE.h, transform: `scale(${zoom})`, background: D.page }}>
          {guides && <><i className="ex-bleed" aria-hidden="true" /><i className="ex-safe" aria-hidden="true" /></>}
          {guideX && <i className="ex-snap" aria-hidden="true" />}
          <div className="ex-clip">
          {objs.map((o) => (
            <div
              key={o.id}
              className={`ex-o ex-${o.type}${sel.includes(o.id) ? ' on' : ''}${guides && risky.has(o.id) ? ' warn' : ''}`}
              style={{ left: o.x, top: o.y, width: o.w, height: o.h, color: o.color, background: o.type === 'text' ? 'transparent' : o.bg, borderRadius: o.round ? '50%' : o.type === 'image' ? 10 : 4, fontSize: o.size, fontWeight: o.weight, textAlign: o.align, fontFamily: o.type === 'text' ? STACK[font] : undefined }}
              onPointerDown={(e) => startDrag(o, e)}
              onDoubleClick={() => { if (o.type === 'text') { D.setSel([o.id]); setEditing(o.id); } }}
            >
              {o.type === 'text' && (editing === o.id ? (
                <span className="ex-edit" contentEditable suppressContentEditableWarning autoFocus ref={(el) => { if (el && document.activeElement !== el) { el.focus(); document.getSelection()?.selectAllChildren(el); } }}
                  onBlur={(e) => { const t = e.currentTarget.innerText; D.begin(); D.set((l) => l.map((x) => (x.id === o.id ? { ...x, text: t } : x))); setEditing(null); }}
                  onKeyDown={(e) => { if (e.key === 'Escape') (e.currentTarget as HTMLElement).blur(); e.stopPropagation(); }}>{o.text}</span>
              ) : <span>{o.text}</span>)}
              {o.type === 'image' && <span className="ex-ph">{tr('Photo')}<small>{Math.round(300 * (320 / o.w))} DPI</small></span>}
              {o.type === 'qr' && <QrCode aria-hidden="true" />}
            </div>
          ))}
          </div>

          {sel.length > 0 && bounds && !editing && (
            <>
              <div className="ex-sel" style={{ left: bounds.x, top: bounds.y, width: bounds.r - bounds.x, height: bounds.b - bounds.y }}>
                {sel.length === 1 && <i className="ex-hd" onPointerDown={(e) => startResize(first, e)} aria-hidden="true" />}
              </div>
              <div ref={tb} className="ex-ctx" style={{ left: bounds.x + shift, top: bounds.y < 70 ? bounds.b + 12 : bounds.y - 56, transform: `scale(${1 / zoom})`, transformOrigin: bounds.y < 70 ? 'top left' : 'bottom left', ['--ex-ctx-max' as string]: aw ? `${Math.max(240, aw - 24)}px` : undefined } as React.CSSProperties} onPointerDown={(e) => e.stopPropagation()} role="toolbar" aria-label={tr('Selection tools')}>
                {texts.length > 0 && (
                  <>
                    <select aria-label={tr('Font')} value={font} onChange={(e) => setFont(e.target.value)}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
                    <button type="button" aria-label={tr('Smaller')} onClick={() => D.patch(texts.map((t) => t.id), { size: Math.max(8, (first.size ?? 20) - 2) })}><Minus aria-hidden="true" /></button>
                    <span className="ex-num">{first.size ?? 20}</span>
                    <button type="button" aria-label={tr('Bigger')} onClick={() => D.patch(texts.map((t) => t.id), { size: (first.size ?? 20) + 2 })}><Plus aria-hidden="true" /></button>
                    <button type="button" aria-label={tr('Bold')} aria-pressed={(first.weight ?? 400) >= 700} onClick={() => D.patch(texts.map((t) => t.id), { weight: (first.weight ?? 400) >= 700 ? 500 : 800 })}><Bold aria-hidden="true" /></button>
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button key={a} type="button" aria-label={tr(a === 'left' ? 'Align left' : a === 'center' ? 'Align centre' : 'Align right')} aria-pressed={first.align === a} onClick={() => D.patch(texts.map((t) => t.id), { align: a })}>
                        {a === 'left' ? <AlignLeft aria-hidden="true" /> : a === 'center' ? <AlignCenter aria-hidden="true" /> : <AlignRight aria-hidden="true" />}
                      </button>
                    ))}
                    <i className="ex-sep" aria-hidden="true" />
                  </>
                )}
                <div className="ex-sw" role="group" aria-label={tr('Colour')}>
                  {BRAND_COLORS.slice(0, 6).map((c) => (
                    <button key={c} type="button" style={{ background: c }} aria-label={tr('Colour {c}', { c })} onClick={() => D.patch(sel, first.type === 'text' ? { color: c } : { color: c, bg: c })} />
                  ))}
                </div>
                <i className="ex-sep" aria-hidden="true" />
                <button type="button" aria-label={tr('Duplicate')} onClick={D.duplicateSel}><Copy aria-hidden="true" /></button>
                <button type="button" aria-label={tr('Lock')} onClick={() => { /* mockup */ }}><Lock aria-hidden="true" /></button>
                <button type="button" aria-label={tr('Delete')} onClick={D.removeSel}><Trash2 aria-hidden="true" /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
