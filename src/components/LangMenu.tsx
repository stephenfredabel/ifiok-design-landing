'use client';

import { Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ACTIVE_LANGS, SOON_LANGS, T, useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';

/** Globe button that opens the language list. Shared by the site header and the dashboard. */
export default function LangMenu({ className = 'iconbtn' }: { className?: string }) {
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
    <div className="lang" ref={wrap} data-open={open ? '' : undefined}>
      <button type="button" className={className} aria-haspopup="true" aria-expanded={open} aria-label={tr("Language")} onClick={() => setOpen((o) => !o)}>
        <Globe aria-hidden="true" />
        <span>{lang.toUpperCase()}</span>
      </button>
      <menu>
        <li className="grp">{tr("Available")}</li>
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
            <button type="button" disabled aria-disabled="true" title={tr("Coming soon")}>
              {l.label}
              <span className="soon-tag">{tr("soon")}</span>
            </button>
          </li>
        ))}
      </menu>
    </div>
  );
}
