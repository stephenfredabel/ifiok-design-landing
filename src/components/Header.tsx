'use client';

import { usePathname } from 'next/navigation';
import { asset } from '@/lib/asset';
import { T } from '@/i18n/LangProvider';
import LangMenu from './LangMenu';
import { Mark } from './Mark';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const onHome = usePathname() === '/';
  const h = (hash: string) => (onHome ? hash : `${asset('/')}${hash}`);

  return (
    <header className="hdr">
      <div className="wrap">
        <a className="logo" href={h('#top')}>
          <Mark />
          Ifiok Design
        </a>
        <nav className="mainnav" aria-label="Main">
          <a href={h('#print')}><T k="nav.print">Printing</T></a>
          <a href={h('#templates')}><T k="nav.templates">Templates</T></a>
          <a href={h('#features')}><T k="nav.features">Features</T></a>
          <a href={asset('/get-app/')} aria-current={!onHome ? 'page' : undefined}><T k="nav.apps">Apps</T></a>
          <a href={h('#tools')}><T k="nav.tools">Free tools</T></a>
          <a href={asset('/creators/')}><T k="nav.creators">Creators</T></a>
          <a href={asset('/design/')}><T k="nav.dash">Dashboard</T></a>
        </nav>
        <span className="grow" />
        <ThemeToggle />
        <LangMenu />
        <a className="login" href="https://designs.ifiok.ng"><T k="cta.login">Log in</T></a>
        <a className="btn btn-gold hdr-start" href="https://designs.ifiok.ng/editor"><T k="cta.start">Start designing</T></a>
      </div>
    </header>
  );
}
