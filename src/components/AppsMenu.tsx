'use client';

import { ArrowRight, LayoutGrid } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { APPS, type AppEntry } from '@/data/apps';
import { asset } from '@/lib/asset';

import { tr } from '@/i18n/tr';
const isLive = (a: AppEntry) => a.web?.status === 'live' || a.android?.status === 'live';
// Apps without a public address yet open their card on the All apps page.
const href = (a: AppEntry) => a.web?.url ?? `${asset('/get-app/')}#${a.slug}`;
const external = (a: AppEntry) => !!a.web?.url;

function Icon({ a }: { a: AppEntry }) {
  // Real icons come from the Ifiok repo. Apps without one get a drawn tile until an icon is supplied.
  return a.icon
    ? <img className="am-ic" src={asset(`/apps/${a.icon}`)} alt="" width={48} height={48} loading="lazy" />
    : <span className="am-ic tile" style={{ background: a.tile }} aria-hidden="true"><a.Icon /></span>;
}

/** The nine-dots button. Hovering it with a mouse, focusing it or tapping it shows the other Ifiok apps. */
export default function AppsMenu({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const show = useCallback(() => { clear(); setOpen(true); }, []);
  const hideSoon = useCallback(() => { clear(); timer.current = window.setTimeout(() => setOpen(false), 180); }, []);

  useEffect(() => {
    if (!open) return;
    const out = (e: Event) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); wrap.current?.querySelector<HTMLElement>('.am-btn')?.focus(); } };
    document.addEventListener('pointerdown', out);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', key); };
  }, [open]);
  useEffect(() => clear, []);

  return (
    <div
      className="apps-menu" ref={wrap} data-open={open ? '' : undefined}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') show(); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') hideSoon(); }}
    >
      <button type="button" className="ib am-btn" aria-haspopup="true" aria-expanded={open} aria-label={tr("Ifiok apps")} onClick={() => setOpen((o) => !o)} onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) show(); }}>
        <LayoutGrid aria-hidden="true" />
      </button>
      {open && <div className="am-scrim" onClick={() => setOpen(false)} />}
      {open && (
        <div className="am-pop" role="menu" aria-label={tr("Ifiok apps")} onPointerEnter={(e) => { if (e.pointerType === 'mouse') show(); }}>
          <p className="am-h">{tr("Ifiok apps")}</p>
          <div className="am-grid">
            {APPS.map((a) => {
              const live = isLive(a);
              const inner = (<><Icon a={a} /><b>{tr(a.short)}</b>{current === a.slug ? <small className="here">{tr("You are here")}</small> : !live ? <small>{tr("Soon")}</small> : null}</>);
              return live ? (
                <a key={a.slug} role="menuitem" className={`am-app${current === a.slug ? ' is-here' : ''}`} href={href(a)} target={external(a) ? '_blank' : undefined} rel="noopener noreferrer" title={tr(a.name)}>{inner}</a>
              ) : (
                <span key={a.slug} role="menuitem" className="am-app off" aria-disabled="true" title={tr("{name}: coming soon", { name: tr(a.name) })}>{inner}</span>
              );
            })}
          </div>
          <a className="am-all" role="menuitem" href={asset('/get-app/')}>{tr("All apps")}<ArrowRight aria-hidden="true" /></a>
        </div>
      )}
    </div>
  );
}
