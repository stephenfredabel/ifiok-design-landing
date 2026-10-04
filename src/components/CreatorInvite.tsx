'use client';

import { GraduationCap, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';
import { asset } from '@/lib/asset';
import './creator-invite.css';

/*
 * Invites people who are not creators yet to apply. A small card in the corner: no backdrop, no scroll lock,
 * the page stays usable behind it. It waits a few seconds, stays away from the creator, sign-in and sign-up pages,
 * from people who already applied or use the creator dashboard, and from anyone who dismissed it.
 */
const KEY = 'ifiok.creatorInvite.v1';
const DAYS = 7;
const DELAY_MS = 6000;
const HIDE_ON = /^\/(creators|login|signup)(\/|$)/;

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') as { until: number } | null; } catch { return null; } };
const write = (forever: boolean) => { try { localStorage.setItem(KEY, JSON.stringify({ until: forever ? 0 : Date.now() + DAYS * 864e5 })); } catch {} };
const hidden = () => {
  try {
    if (localStorage.getItem('ifiok.creator.applied') || localStorage.getItem('ifiok.creator.v3')) return true;
  } catch {}
  const d = read();
  return !!d && (d.until === 0 || Date.now() < d.until);
};

export default function CreatorInvite() {
  useLang(); // re-render when the language changes
  const path = (usePathname() || '/').replace(/\/+$/, '') || '/';
  const [show, setShow] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    if (HIDE_ON.test(path) || hidden()) { setShow(false); return; }
    const t = window.setTimeout(() => {
      if (hidden()) return;
      setLifted(!!document.querySelector('.d-tabs')); // keep clear of the phone tab bar in the dashboards
      setShow(true);
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, [path]);

  const close = useCallback((forever = false) => { write(forever); setShow(false); }, []);

  useEffect(() => {
    if (!show) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [show, close]);

  if (!show) return null;
  return (
    <section className={`ci${lifted ? ' ci-lift' : ''}`} role="dialog" aria-modal="false" aria-labelledby="ci-title">
      <button type="button" className="ci-x" onClick={() => close()} aria-label={tr('Close')}><X aria-hidden="true" /></button>
      <div className="ci-row">
        <span className="ci-ic" aria-hidden="true"><GraduationCap /></span>
        <div className="ci-tx">
          <p className="ci-eye">{tr('Campus Creator Program')}</p>
          <h2 id="ci-title">{tr('Become an Ifiok Campus Creator')}</h2>
          <p>{tr('Design templates, build your portfolio, and earn. Open to verified students.')}</p>
        </div>
      </div>
      <div className="ci-act">
        <a className="ci-go" href={asset('/creators/#apply')} onClick={() => close()}>{tr('Become a creator')}</a>
        <button type="button" className="ci-no" onClick={() => close()}>{tr('Not now')}</button>
      </div>
      <button type="button" className="ci-never" onClick={() => close(true)}>{tr("Don't show this again")}</button>
    </section>
  );
}
