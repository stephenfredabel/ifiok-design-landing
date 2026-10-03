'use client';

import { ArrowRight, Check, CornerDownLeft, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Thumb from './Thumb';
import { EDITOR, Stepper, StagePill } from './parts';
import { FORMATS, NAV, TEMPLATES, TOOL_LINKS, formatById, naira, priceFor, sizeLabel, type Design } from './data';

/** Keeps keyboard focus inside an open overlay and returns it on close. */
export function useFocusTrap(active: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, [tabindex]:not([tabindex="-1"])') ?? []);
    (node?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); prev?.focus?.(); };
  }, [active, onClose]);
  return ref;
}

export type NewDesignSeed = { formatId?: string; name?: string; accent?: string; headline?: string; sub?: string } | null;

const ACCENTS = ['#0B7A7F', '#DAA019', '#B6322B', '#1F3A8A', '#15241F', '#7A1D4A'];

export function NewDesignDialog({ seed, onClose, onCreate }: { seed: NewDesignSeed; onClose: () => void; onCreate: (v: { name: string; formatId: string; accent: string; headline?: string; sub?: string }) => void }) {
  const open = seed !== null;
  const [formatId, setFormatId] = useState('card');
  const [name, setName] = useState('');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [custom, setCustom] = useState({ w: '6', h: '4' });
  const ref = useFocusTrap(open, onClose);

  useEffect(() => {
    if (seed) {
      setFormatId(seed.formatId ?? 'card');
      setName(seed.name ?? '');
      setAccent(seed.accent ?? ACCENTS[0]);
    }
  }, [seed]);

  if (!open) return null;
  const f = formatById(formatId);
  const cw = Math.max(1, Number(custom.w) || f.w), ch = Math.max(1, Number(custom.h) || f.h);

  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="nd-title" ref={ref}>
        <header className="dialog-h">
          <h2 id="nd-title">New design</h2>
          <button type="button" className="icon-x" onClick={onClose} aria-label="Close"><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <div className="nd-grid">
            <div>
              <p className="lbl">Choose a size</p>
              <div className="fmt-list" role="radiogroup" aria-label="Design size">
                {FORMATS.map((x) => (
                  <button key={x.id} type="button" role="radio" aria-checked={formatId === x.id} className="fmt" onClick={() => setFormatId(x.id)}>
                    <b>{x.label}</b>
                    <span className="mono">{sizeLabel(x)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="nd-side">
              <Thumb formatId={formatId} accent={accent} headline={name || f.label} sub={f.note} className="nd-prev" />
              <dl className="specs">
                <div><dt>Size</dt><dd className="mono">{sizeLabel(f)}</dd></div>
                <div><dt>Bleed</dt><dd className="mono">{f.bleed}"</dd></div>
                <div><dt>Resolution</dt><dd className="mono">300 DPI · CMYK</dd></div>
                <div><dt>Example price</dt><dd className="mono gold">{naira(priceFor(f, f.qty))} / {f.qty}</dd></div>
              </dl>
              <label className="field">
                <span className="lbl">Name</span>
                <input id="nd-name" data-autofocus value={name} onChange={(e) => setName(e.target.value)} placeholder={`Untitled ${f.label.toLowerCase()}`} maxLength={60} />
              </label>
              <div>
                <p className="lbl">Colour</p>
                <div className="swatches">
                  {ACCENTS.map((c) => (
                    <button key={c} type="button" className="sw" style={{ background: c }} aria-label={`Colour ${c}`} aria-pressed={accent === c} onClick={() => setAccent(c)} />
                  ))}
                </div>
              </div>
              <details className="custom">
                <summary>Custom size (inches)</summary>
                <div className="custom-row">
                  <label><span className="lbl">Width</span><input inputMode="decimal" value={custom.w} onChange={(e) => setCustom({ ...custom, w: e.target.value })} /></label>
                  <label><span className="lbl">Height</span><input inputMode="decimal" value={custom.h} onChange={(e) => setCustom({ ...custom, h: e.target.value })} /></label>
                </div>
                <p className="muted">{cw}" × {ch}" is created as a custom print size in the editor.</p>
              </details>
            </div>
          </div>
        </div>
        <footer className="dialog-f">
          <button type="button" className="btn-s" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-p" onClick={() => onCreate({ name: name.trim() || `Untitled ${f.label.toLowerCase()}`, formatId, accent, headline: seed?.headline, sub: seed?.sub })}>
            <Plus aria-hidden="true" />Create design
          </button>
        </footer>
      </div>
    </div>
  );
}

export function DetailPanel({ d, onClose, onDuplicate, onDelete }: { d: Design | null; onClose: () => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void }) {
  const [qty, setQty] = useState(100);
  const ref = useFocusTrap(d !== null, onClose);
  const f = d ? formatById(d.formatId) : null;
  useEffect(() => { if (f) setQty(f.qty); }, [f?.id, d?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d || !f) return null;
  const checks = [
    { ok: true, text: 'Resolution 300 DPI' },
    { ok: true, text: 'Colour mode CMYK' },
    { ok: true, text: `Bleed ${f.bleed}" on all edges` },
    d.warn ? { ok: false, text: d.warn } : { ok: true, text: 'All images are high enough resolution' },
  ];
  return (
    <div className="scrim side" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="detail" role="dialog" aria-modal="true" aria-labelledby="dt-title" ref={ref}>
        <header className="dialog-h">
          <div><h2 id="dt-title">{d.name}</h2><p className="muted">{f.label} · {sizeLabel(f)} · edited {d.edited}</p></div>
          <button type="button" className="icon-x" onClick={onClose} aria-label="Close"><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <Thumb formatId={d.formatId} accent={d.accent} headline={d.headline} sub={d.sub} className="dt-prev" />
          <div className="dt-actions">
            <a className="btn-p" href={EDITOR} data-autofocus>Edit in editor <ArrowRight aria-hidden="true" /></a>
            <button type="button" className="btn-s" onClick={() => onDuplicate(d.id)}>Duplicate</button>
            <button type="button" className="btn-s danger" onClick={() => { onDelete(d.id); onClose(); }}>Delete</button>
          </div>

          <section className="dt-sec">
            <h3>Status</h3>
            <StagePill stage={d.stage} />
            {d.stage !== 'draft' && <Stepper stage={d.stage} />}
          </section>

          <section className="dt-sec">
            <h3>Print check</h3>
            <ul className="checks">
              {checks.map((c) => (
                <li key={c.text} className={c.ok ? 'ok' : 'bad'}>{c.ok ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}{c.text}</li>
              ))}
            </ul>
          </section>

          <section className="dt-sec">
            <h3>Order print</h3>
            <div className="order-row">
              <div className="qty" role="group" aria-label="Quantity">
                <button type="button" aria-label="Fewer" onClick={() => setQty((q) => Math.max(f.step, q - f.step))}>−</button>
                <span className="mono">{qty.toLocaleString('en-NG')}</span>
                <button type="button" aria-label="More" onClick={() => setQty((q) => q + f.step)}>+</button>
              </div>
              <p className="price mono">{naira(priceFor(f, qty))}</p>
            </div>
            <p className="muted">Example price. The final price is set in the live app at checkout.</p>
            <a className="btn-p wide" href={EDITOR}>Continue to order</a>
          </section>
        </div>
      </aside>
    </div>
  );
}

type Hit = { id: string; group: string; label: string; hint: string; run: () => void };

export function Palette({ open, onClose, designs, go, openDetail, newFrom }: {
  open: boolean; onClose: () => void; designs: Design[]; go: (view: string) => void; openDetail: (id: string) => void; newFrom: (seed: NewDesignSeed) => void;
}) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const ref = useFocusTrap(open, onClose);
  useEffect(() => { if (open) { setQ(''); setI(0); } }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const all: Hit[] = [
      { id: 'a-new', group: 'Actions', label: 'New design', hint: 'N', run: () => newFrom({}) },
      ...NAV.map<Hit>((n) => ({ id: 'n-' + n.id, group: 'Go to', label: n.label, hint: n.href ? 'Opens in a new tab' : 'View', run: () => (n.href ? window.open(n.href, '_blank', 'noopener') : go(n.id)) })),
      ...designs.map<Hit>((d) => ({ id: 'd-' + d.id, group: 'Your designs', label: d.name, hint: formatById(d.formatId).label, run: () => openDetail(d.id) })),
      ...TEMPLATES.map<Hit>((t) => ({ id: 't-' + t.id, group: 'Templates', label: t.name, hint: t.cat, run: () => newFrom({ formatId: t.formatId, name: t.name, accent: t.accent, headline: t.headline, sub: t.sub }) })),
      ...TOOL_LINKS.map<Hit>((t) => ({ id: 'l-' + t.label, group: 'Free tools', label: t.label, hint: 'Opens in a new tab', run: () => window.open(t.href, '_blank', 'noopener') })),
    ];
    const needle = q.trim().toLowerCase();
    const list = needle ? all.filter((h) => (h.label + ' ' + h.hint + ' ' + h.group).toLowerCase().includes(needle)) : all.filter((h) => h.group === 'Actions' || h.group === 'Go to' || h.group === 'Your designs').slice(0, 12);
    return list.slice(0, 20);
  }, [q, designs, go, openDetail, newFrom]);

  if (!open) return null;
  const choose = (h?: Hit) => { if (!h) return; onClose(); h.run(); };
  const groups = Array.from(new Set(hits.map((h) => h.group)));

  return (
    <div className="scrim top" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" ref={ref}>
        <div className="pal-input">
          <Search aria-hidden="true" />
          <input
            data-autofocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setI(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(hits.length - 1, x + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
              if (e.key === 'Enter') { e.preventDefault(); choose(hits[i]); }
            }}
            placeholder="Search designs, templates, tools and pages"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="pal-list"
            aria-activedescendant={hits[i] ? `pal-${hits[i].id}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="pal-list" id="pal-list" role="listbox">
          {hits.length === 0 && <p className="pal-empty">Nothing found for “{q}”.</p>}
          {groups.map((g) => (
            <div key={g}>
              <p className="pal-g">{g}</p>
              {hits.filter((h) => h.group === g).map((h) => {
                const idx = hits.indexOf(h);
                return (
                  <button key={h.id} id={`pal-${h.id}`} type="button" role="option" aria-selected={idx === i} className="pal-row" onMouseMove={() => setI(idx)} onClick={() => choose(h)}>
                    <span>{h.label}</span><small>{h.hint}</small>
                    {idx === i && <CornerDownLeft aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Toast({ t, onClose }: { t: { msg: string; href?: string; label?: string; action?: () => void } | null; onClose: () => void }) {
  useEffect(() => {
    if (!t) return;
    const id = window.setTimeout(onClose, 6000);
    return () => clearTimeout(id);
  }, [t, onClose]);
  if (!t) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{t.msg}</span>
      {t.href && <a href={t.href} onClick={onClose}>{t.label ?? 'Open'}</a>}
      {t.action && <button type="button" onClick={() => { t.action?.(); onClose(); }}>{t.label ?? 'Undo'}</button>}
      <button type="button" className="toast-x" onClick={onClose} aria-label="Dismiss"><X aria-hidden="true" /></button>
    </div>
  );
}
