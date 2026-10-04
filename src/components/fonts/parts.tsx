'use client';

import { useEffect } from 'react';
import { GOOGLE_FONTS_HREF, fontStack, type FontEntry } from '@/data/fonts';

/** Loads the sample families once so they show in their real faces. */
export function useSampleFonts() {
  useEffect(() => {
    if (document.getElementById('ifiok-sample-fonts')) return;
    const l = document.createElement('link');
    l.id = 'ifiok-sample-fonts'; l.rel = 'stylesheet'; l.href = GOOGLE_FONTS_HREF;
    document.head.appendChild(l);
  }, []);
}

export const fontStyleOf = (f: Pick<FontEntry, 'css' | 'cat'>, weight?: number) => ({ fontFamily: fontStack(f), fontWeight: weight ?? 400 });

export function MarksTags({ f }: { f: FontEntry }) {
  const m = f.marks;
  const list = [m.yoruba && 'Yorùbá', m.igbo && 'Igbo', m.hausa && 'Hausa'].filter(Boolean) as string[];
  if (!list.length) return null;
  return <span className="fn-marks" title="Supports the extra letters used in these languages">{list.join(' · ')}</span>;
}

export const weightOf = (style: string) => (/black/i.test(style) ? 900 : /extra/i.test(style) ? 800 : /bold/i.test(style) ? 700 : /semi/i.test(style) ? 600 : /medium/i.test(style) ? 500 : /light/i.test(style) ? 300 : 400);
