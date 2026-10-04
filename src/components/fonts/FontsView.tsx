'use client';

import { ArrowRight, Heart, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFocusTrap } from '@/components/design/overlays';
import { FONT_CATS, LIBRARY, SPECIMEN, type FontCat, type FontEntry } from '@/data/fonts';
import { MarksTags, fontStyleOf, useSampleFonts, weightOf } from './parts';

const SAVED = 'ifiok.fonts.saved.v1';
const SIZES = [{ id: 's', label: 'S', px: 26 }, { id: 'm', label: 'M', px: 40 }, { id: 'l', label: 'L', px: 60 }] as const;

export default function FontsView({ extra = [], onUse }: { extra?: FontEntry[]; onUse: (f: FontEntry) => void }) {
  useSampleFonts();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'All' | FontCat>('All');
  const [marks, setMarks] = useState(false);
  const [text, setText] = useState('');
  const [size, setSize] = useState<(typeof SIZES)[number]['id']>('m');
  const [open, setOpen] = useState<FontEntry | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem(SAVED) ?? '[]')); } catch {} }, []);
  const toggleSave = (id: string) => setSaved((s) => { const n = s.includes(id) ? s.filter((x) => x !== id) : [...s, id]; try { localStorage.setItem(SAVED, JSON.stringify(n)); } catch {} return n; });

  const all = useMemo(() => [...extra, ...LIBRARY], [extra]);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return all.filter((f) => (cat === 'All' || f.cat === cat) && (!marks || f.marks.yoruba || f.marks.igbo || f.marks.hausa) && (!onlySaved || saved.includes(f.id)) && (!n || (f.family + f.cat + f.tags.join(' ')).toLowerCase().includes(n)));
  }, [all, q, cat, marks, onlySaved, saved]);
  const px = SIZES.find((s) => s.id === size)!.px;
  const sample = text.trim() || 'Welcome to Ifiok';

  return (
    <div className="view">
      <header className="view-h">
        <div><h1>Fonts</h1><p className="muted">Pick a font and start designing with it. Every font here is free to use in your designs.</p></div>
      </header>
      <div className="bar">
        <label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fonts" aria-label="Search fonts" /></label>
        <label className="search fn-type"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your own words to preview" aria-label="Preview text" maxLength={60} /></label>
        <div className="seg" role="group" aria-label="Preview size">
          {SIZES.map((s) => <button key={s.id} type="button" aria-pressed={size === s.id} onClick={() => setSize(s.id)} aria-label={`Size ${s.label}`}>{s.label}</button>)}
        </div>
      </div>
      <div className="chips" role="group" aria-label="Filter fonts">
        {(['All', ...FONT_CATS] as const).map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        <button type="button" className="chip" aria-pressed={marks} onClick={() => setMarks((m) => !m)}>Yorùbá, Igbo &amp; Hausa marks</button>
        <button type="button" className="chip" aria-pressed={onlySaved} onClick={() => setOnlySaved((m) => !m)}><Heart aria-hidden="true" />Saved<small>{saved.length}</small></button>
      </div>
      <p className="count" aria-live="polite">{shown.length} fonts</p>
      {shown.length === 0 ? (
        <div className="empty"><p><b>No fonts match.</b> Try another word or clear a filter.</p><button type="button" className="btn-s" onClick={() => { setQ(''); setCat('All'); setMarks(false); setOnlySaved(false); }}>Clear filters</button></div>
      ) : (
        <div className="fn-grid">
          {shown.map((f) => (
            <article className="fn-card" key={f.id}>
              <button type="button" className="fn-sample" style={{ ...fontStyleOf(f), fontSize: px }} onClick={() => setOpen(f)} aria-label={`Open ${f.family}`}>
                <span>{sample}</span>
              </button>
              <div className="fn-meta">
                <div><b>{f.family}</b><small>{f.cat} · {f.styles.length} style{f.styles.length === 1 ? '' : 's'}</small><MarksTags f={f} /></div>
                <button type="button" className={`fn-heart${saved.includes(f.id) ? ' on' : ''}`} aria-pressed={saved.includes(f.id)} aria-label={saved.includes(f.id) ? `Remove ${f.family} from saved` : `Save ${f.family}`} onClick={() => toggleSave(f.id)}><Heart aria-hidden="true" /></button>
              </div>
              <button type="button" className="btn-p fn-use" onClick={() => onUse(f)}>Design with this font<ArrowRight aria-hidden="true" /></button>
            </article>
          ))}
        </div>
      )}
      <FontSpecimenPanel f={open} onClose={() => setOpen(null)} onUse={(f) => { setOpen(null); onUse(f); }} saved={open ? saved.includes(open.id) : false} onSave={() => open && toggleSave(open.id)} />
    </div>
  );
}

export function FontSpecimenPanel({ f, onClose, onUse, saved, onSave }: { f: FontEntry | null; onClose: () => void; onUse: (f: FontEntry) => void; saved: boolean; onSave: () => void }) {
  const ref = useFocusTrap(f !== null, onClose);
  const [text, setText] = useState('');
  useEffect(() => setText(''), [f?.id]);
  if (!f) return null;
  const rows = f.styles.length ? f.styles : ['Regular'];
  return (
    <div className="scrim side" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="detail fn-panel" role="dialog" aria-modal="true" aria-labelledby="fp-title" ref={ref}>
        <header className="dialog-h">
          <div><h2 id="fp-title">{f.family}</h2><p className="muted">{f.cat} · by {f.by}</p></div>
          <button type="button" className="icon-x" onClick={onClose} aria-label="Close"><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <div className="dt-actions">
            <button type="button" className="btn-p" data-autofocus onClick={() => onUse(f)}>Design with this font<ArrowRight aria-hidden="true" /></button>
            <button type="button" className={`btn-s${saved ? ' on' : ''}`} onClick={onSave} aria-pressed={saved}><Heart aria-hidden="true" />{saved ? 'Saved' : 'Save'}</button>
          </div>
          <label className="field"><span className="lbl">Try your own words</span><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here" maxLength={80} /></label>
          <div className="fn-spec" style={fontStyleOf(f)}>
            <p className="big">{text.trim() || 'Aa'}</p>
            <p>{SPECIMEN.upper}</p><p>{SPECIMEN.lower}</p><p>{SPECIMEN.nums}</p>
          </div>
          <section className="dt-sec">
            <h3>Extra letters</h3>
            <div className="fn-spec" style={fontStyleOf(f)}>
              <p><small className="fn-lb">Yorùbá</small>{SPECIMEN.yoruba}</p>
              <p><small className="fn-lb">Igbo</small>{SPECIMEN.igbo}</p>
              <p><small className="fn-lb">Hausa</small>{SPECIMEN.hausa}</p>
            </div>
            <p className="muted">If a letter looks different from the rest, or shows as a box, this font does not include it.</p>
          </section>
          <section className="dt-sec">
            <h3>Styles</h3>
            <ul className="fn-styles">
              {rows.map((s) => (<li key={s} style={{ ...fontStyleOf(f, weightOf(s)), fontStyle: /italic/i.test(s) ? 'italic' : 'normal' }}><span>{SPECIMEN.line}</span><small>{s}</small></li>))}
            </ul>
          </section>
          {f.tags.length > 0 && <section className="dt-sec"><h3>Good for</h3><div className="fn-tags">{f.tags.map((t) => <span key={t}>{t}</span>)}</div></section>}
          <p className="muted">{f.sample ? 'Sample open-source font shown for the prototype.' : 'Free to use in your Ifiok designs.'}</p>
        </div>
      </aside>
    </div>
  );
}
