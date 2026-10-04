'use client';

import { Banknote, Ruler, Truck } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LangMenu from '@/components/LangMenu';
import { Mark } from '@/components/Mark';
import { useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';
import { asset } from '@/lib/asset';
import './auth.css';

/** Two columns on a desktop (brand panel + form), one column on a phone (form only, short brand line on top). */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  useLang(); // re-render when the language changes
  return (
    <div className="au">
      <aside className="au-side" aria-hidden="false">
        <a className="au-brand" href={asset('/')} aria-label={tr('Ifiok home')}><Mark /></a>
        <div className="au-pitch">
          <h2>{tr('Design it. We print it.')}</h2>
          <p>{tr('Make cards, flyers, ID cards and posters at real print size, then order delivery across Nigeria.')}</p>
          <ul>
            <li><span><Ruler aria-hidden="true" /></span>{tr('Real print sizes, with bleed checked for you')}</li>
            <li><span><Banknote aria-hidden="true" /></span>{tr('See the price in naira while you work')}</li>
            <li><span><Truck aria-hidden="true" /></span>{tr('Printed near you and delivered to your door')}</li>
          </ul>
          <div className="au-mock" aria-hidden="true">
            <div className="au-flyer"><b>{tr('GRAND OPENING')}</b><i /><small>{tr('Saturday 12 July · 10am')}</small></div>
            <div className="au-card"><b>Adaeze Okafor</b><small>{tr('Founder · Okafor Bakes')}</small></div>
          </div>
        </div>
        <p className="au-foot">{tr('Free to start. Pay only when you print.')}</p>
      </aside>

      <main className="au-main">
        <header className="au-top">
          <a className="au-logo" href={asset('/')} aria-label={tr('Ifiok home')}><Mark /></a>
          <div className="au-tools"><LangMenu className="iconbtn" /><ThemeToggle /></div>
        </header>
        <div className="au-card-wrap">{children}</div>
        <p className="au-legal">{tr('Prototype: no real account is created or checked here.')}</p>
      </main>
    </div>
  );
}
