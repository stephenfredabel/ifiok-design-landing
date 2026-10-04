'use client';

import { Menu as MenuIcon, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import { T } from '@/i18n/LangProvider';
import LangMenu from './LangMenu';
import { Mark } from './Mark';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const onHome = usePathname() === '/';
  const h = (hash: string) => (onHome ? hash : `${asset('/')}${hash}`);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a,button')?.focus();
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    [h('#print'), 'nav.print', 'Printing'],
    [h('#templates'), 'nav.templates', 'Templates'],
    [h('#features'), 'nav.features', 'Features'],
    [asset('/get-app/'), 'nav.apps', 'Apps'],
    [h('#tools'), 'nav.tools', 'Free tools'],
    [asset('/student/'), 'nav.students', 'Students'],
    [asset('/creators/'), 'nav.creators', 'Creators'],
    [asset('/design/'), 'nav.dash', 'Dashboard'],
  ] as const;

  return (
    <header className="hdr">
      <div className="wrap">
        <button type="button" className="iconbtn hdr-menu" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)}><MenuIcon aria-hidden="true" /></button>
        <a className="logo" href={h('#top')} aria-label="Ifiok"><Mark /></a>
        <nav className="mainnav" aria-label="Main">
          {links.map(([href, k, label]) => <a key={k} href={href} aria-current={!onHome && href.endsWith('/get-app/') ? 'page' : undefined}><T k={k}>{label}</T></a>)}
        </nav>
        <span className="grow" />
        <ThemeToggle />
        <LangMenu />
        <a className="login" href="https://designs.ifiok.ng"><T k="cta.login">Log in</T></a>
        <a className="btn btn-gold hdr-start" href="https://designs.ifiok.ng/editor"><T k="cta.start">Start designing</T></a>
      </div>
      {open && (
        <div className="mnav-scrim" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="mnav" role="dialog" aria-modal="true" aria-label="Menu" ref={panel}>
            <div className="mnav-h"><span>Menu</span><button type="button" className="iconbtn" aria-label="Close menu" onClick={() => setOpen(false)}><X aria-hidden="true" /></button></div>
            <nav aria-label="Main">
              {links.map(([href, k, label]) => <a key={k} href={href} onClick={() => setOpen(false)}><T k={k}>{label}</T></a>)}
            </nav>
            <div className="mnav-f">
              <a className="btn btn-line" href="https://designs.ifiok.ng"><T k="cta.login">Log in</T></a>
              <a className="btn btn-gold" href="https://designs.ifiok.ng/editor"><T k="cta.start">Start designing</T></a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
