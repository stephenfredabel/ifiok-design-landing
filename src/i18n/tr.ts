import { DESIGN_DICT } from './design-dict';

/**
 * English-keyed translation for the design dashboards.
 * `tr("English source")` returns the text in the active language, or the English source if there is none.
 * `{name}` placeholders are filled from the second argument.
 * The same call shape as the main Ifiok app, so the strings can move into its translation engine unchanged.
 */
let current = 'en';
export const setTrLang = (l: string) => { current = l; };
export const getTrLang = () => current;

export function tr(en: string | undefined, vars?: Record<string, string | number | null | undefined>): string {
  if (en == null) return '';
  const hit = current === 'en' ? undefined : DESIGN_DICT[current]?.[en];
  let text = hit ?? en;
  if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (k in vars && vars[k] != null ? String(vars[k]) : m));
  // QA hook: with window.__IFIOK_TR_MARK__ set, every string that went through tr() is wrapped in « » so an
  // automated crawl can list any visible text that was never routed through the translation engine.
  if (typeof window !== 'undefined' && (window as unknown as { __IFIOK_TR_MARK__?: boolean }).__IFIOK_TR_MARK__) return `«${text}»`;
  return text;
}
