'use client';

import { Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ACTIVE_LANGS, SOON_LANGS, T, useLang } from '@/i18n/LangProvider';
import { Mark } from './Mark';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <header className="hdr">
      <div className="wrap">
        <a className="logo" href="#top">
          <Mark />
          Ifiok Design
        </a>
        <nav className="mainnav" aria-label="Main">
          <a href="#print"><T k="nav.print">Printing</T></a>
          <a href="#templates"><T k="nav.templates">Templates</T></a>
          <a href="#features"><T k="nav.features">Features</T></a>
          <a href="#app"><T k="nav.app">Mobile app</T></a>
          <a href="#tools"><T k="nav.tools">Free tools</T></a>
          <a href="#creators"><T k="nav.creators">Creators</T></a>
        </nav>
        <span className="grow" />
        <ThemeToggle />
        <div className="lang" ref={wrap} data-open={open ? '' : undefined}>
          <button type="button" className="iconbtn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Globe aria-hidden="true" />
            <span>{lang.toUpperCase()}</span>
          </button>
          <menu>
            <li className="grp">Available</li>
            {ACTIVE_LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  aria-current={l.code === lang}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                >
                  {l.label}
                  <span className="code">{l.code.toUpperCase()}</span>
                </button>
              </li>
            ))}
            <li className="grp"><T k="lang.more">More African languages — coming soon</T></li>
            {SOON_LANGS.map((l) => (
              <li key={l.code}>
                <button type="button" disabled aria-disabled="true" title="Coming soon">
                  {l.label}
                  <span className="soon-tag">soon</span>
                </button>
              </li>
            ))}
          </menu>
        </div>
        <a className="login" href="https://designs.ifiok.ng"><T k="cta.login">Log in</T></a>
        <a className="btn btn-gold hdr-start" href="https://designs.ifiok.ng/editor"><T k="cta.start">Start designing</T></a>
      </div>
    </header>
  );
}
