'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STR } from './strings';
import { setTrLang } from './tr';

export type LangCode = 'en' | 'fr' | 'pcm' | 'yo' | 'ha' | 'ig';

/** Languages with a full translation. Everything else in the picker is shown greyed out as coming soon. */
export const ACTIVE_LANGS: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pcm', label: 'Pidgin' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ig', label: 'Igbo' },
];

export const SOON_LANGS: { code: string; label: string }[] = [
  { code: 'SW', label: 'Kiswahili' },
  { code: 'ZU', label: 'isiZulu' },
  { code: 'XH', label: 'isiXhosa' },
  { code: 'AF', label: 'Afrikaans' },
  { code: 'AM', label: 'አማርኛ' },
  { code: 'AR', label: 'العربية' },
  { code: 'SO', label: 'Soomaaliga' },
  { code: 'TW', label: 'Twi' },
  { code: 'WO', label: 'Wolof' },
  { code: 'LN', label: 'Lingála' },
  { code: 'RW', label: 'Kinyarwanda' },
  { code: 'SN', label: 'chiShona' },
  { code: 'ST', label: 'Sesotho' },
  { code: 'TN', label: 'Setswana' },
  { code: 'MG', label: 'Malagasy' },
  { code: 'OM', label: 'Afaan Oromoo' },
  { code: 'TI', label: 'ትግርኛ' },
  { code: 'FF', label: 'Pulaar' },
  { code: 'PT', label: 'Português' },
];

type Ctx = { lang: LangCode; setLang: (l: LangCode) => void; t: (key: string, fallback: string) => string };
const LangCtx = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (_k, f) => f });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');
  // Keep the dashboards' tr() in step with the picker. Done during render so children read the right language.
  setTrLang(lang);

  // Read the saved language after mount so the server and first client render match.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ifiok.lang') as LangCode | null;
      if (saved && STR[saved]) setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'pcm' ? 'en' : lang);
  }, [lang]);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try {
      localStorage.setItem('ifiok.lang', l);
    } catch {}
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (key, fallback) => STR[lang]?.[key] ?? fallback }),
    [lang, setLang],
  );
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

/** Translated plain text. Children are the English fallback. */
export function T({ k, children }: { k: string; children: string }) {
  const { t } = useLang();
  return <>{t(k, children)}</>;
}

/** Translated text that contains trusted markup from our own dictionary (for example <u>). */
export function TH({ k, children, as: Tag = 'span', className }: { k: string; children: string; as?: 'span' | 'h1' | 'h2' | 'p'; className?: string }) {
  const { t } = useLang();
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: t(k, children) }} />;
}
