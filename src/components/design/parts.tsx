'use client';

import { Check, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Thumb from './Thumb';
import { formatById, naira, STAGES, type Design, type Order, type Stage, type Template } from './data';

import { tr } from '@/i18n/tr';
export const EDITOR = 'https://designs.ifiok.ng/editor';

export function StagePill({ stage }: { stage: Stage }) {
  const label = STAGES.find((s) => s.id === stage)!.label;
  return <span className={`stage st-${stage}`}><i aria-hidden="true" />{tr(label)}</span>;
}

export function Stepper({ stage }: { stage: Stage }) {
  const at = STAGES.findIndex((s) => s.id === stage);
  return (
    <ol className="stepper" aria-label={tr("Progress")}>
      {STAGES.slice(1).map((s, i) => {
        const idx = i + 1;
        const state = idx < at ? 'done' : idx === at ? 'now' : 'next';
        return (
          <li key={s.id} className={state} aria-current={state === 'now' ? 'step' : undefined}>
            <span className="dot">{state === 'done' ? <Check aria-hidden="true" /> : null}</span>
            <span className="sl">{tr(s.label)}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Small popover menu. Closes on outside press and Escape. */
export function Menu({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div className="menu" ref={ref}>
      <button type="button" className="dots" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}>
        <MoreHorizontal aria-hidden="true" />
      </button>
      {open && <div className="menu-pop" role="menu">{children(() => setOpen(false))}</div>}
    </div>
  );
}

export function DesignCard({ d, onOpen, onDuplicate, onDelete }: { d: Design; onOpen: (id: string) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void }) {
  const f = formatById(d.formatId);
  return (
    <article className="dcard">
      <button type="button" className="dcard-hit" onClick={() => onOpen(d.id)} aria-label={tr("Open details for {name}", { name: tr(d.name) })}>
        <Thumb formatId={d.formatId} accent={d.accent} headline={d.headline} sub={tr(d.sub)} font={d.font} />
      </button>
      <div className="dcard-meta">
        <div className="dcard-top">
          <h3 title={tr(d.name)}>{tr(d.name)}</h3>
          <Menu label={tr("Actions for {name}", { name: tr(d.name) })}>
            {(close) => (
              <>
                <button type="button" role="menuitem" onClick={() => { close(); onOpen(d.id); }}><Pencil aria-hidden="true" />{tr("Details")}</button>
                <a role="menuitem" href={EDITOR} onClick={close}><ExternalLink aria-hidden="true" />{tr("Edit in editor")}</a>
                <button type="button" role="menuitem" onClick={() => { close(); onDuplicate(d.id); }}><Copy aria-hidden="true" />{tr("Duplicate")}</button>
                <button type="button" role="menuitem" className="danger" onClick={() => { close(); onDelete(d.id); }}><Trash2 aria-hidden="true" />{tr("Delete")}</button>
              </>
            )}
          </Menu>
        </div>
        <p className="dcard-sub">{tr(f.label)} · {tr(d.edited)}</p>
        <div className="dcard-foot">
          <StagePill stage={d.stage} />
          {d.warn && <span className="warn" title={tr(d.warn)}><TriangleAlert aria-hidden="true" />{tr("Check")}</span>}
        </div>
      </div>
    </article>
  );
}

export function TemplateCard({ t, onUse }: { t: Template; onUse: (t: Template) => void }) {
  const f = formatById(t.formatId);
  return (
    <button type="button" className="tcard" onClick={() => onUse(t)} aria-label={tr("Use template {name}", { name: tr(t.name) })}>
      <Thumb formatId={t.formatId} accent={t.accent} headline={t.headline} sub={tr(t.sub)} />
      <span className="tcard-name">{tr(t.name)}</span>
      <span className="tcard-sub">{tr(f.label)}</span>
    </button>
  );
}

export function OrderCard({ o, design, onOpen }: { o: Order; design?: Design; onOpen: (id: string) => void }) {
  const f = formatById(o.formatId);
  return (
    <article className="ocard">
      <div className="ocard-top">
        {design && <div className="ocard-thumb"><Thumb formatId={design.formatId} accent={design.accent} headline={design.headline} sub={tr(design.sub)} /></div>}
        <div className="ocard-info">
          <p className="mono ref">{o.ref}</p>
          <h3>{tr(o.item)}</h3>
          <p className="muted">{o.qty.toLocaleString('en-NG')} {tr("× {label} · {total}", { label: tr(f.label), total: naira(o.total) })}</p>
          <p className="muted">{tr(o.printer)} · {tr(o.eta)}</p>
        </div>
      </div>
      <Stepper stage={o.stage} />
      <div className="ocard-actions">
        {design && <button type="button" className="btn-s" onClick={() => onOpen(design.id)}>{tr("View design")}</button>}
        <a className="btn-s" href="https://designs.ifiok.ng">{tr("Track in the live app")}</a>
      </div>
    </article>
  );
}
