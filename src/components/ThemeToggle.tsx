'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';

type Mode = 'system' | 'light' | 'dark';
const ORDER: Mode[] = ['system', 'light', 'dark'];
const LABEL: Record<Mode, string> = { system: 'Theme: match device', light: 'Theme: light', dark: 'Theme: dark' };

/** One icon button that cycles System, Light, Dark. System removes the attribute so the OS setting decides. */
export default function ThemeToggle() {
  useLang(); // re-render when the language changes
  const [mode, setMode] = useState<Mode>('system');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ifiok.theme');
      if (saved === 'light' || saved === 'dark') setMode(saved);
    } catch {}
  }, []);

  function next() {
    const m = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(m);
    const root = document.documentElement;
    try {
      if (m === 'system') {
        root.removeAttribute('data-theme');
        localStorage.removeItem('ifiok.theme');
      } else {
        root.setAttribute('data-theme', m);
        localStorage.setItem('ifiok.theme', m);
      }
    } catch {}
  }

  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;
  return (
    <button type="button" className="iconbtn" onClick={next} aria-label={tr(LABEL[mode])} title={tr(LABEL[mode])}>
      <Icon aria-hidden="true" />
    </button>
  );
}
