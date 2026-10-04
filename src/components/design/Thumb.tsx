import type { CSSProperties } from 'react';
import { formatById } from './data';

/** A small drawn preview of a design. Real thumbnails come from the editor. */
export default function Thumb({ formatId, accent, headline, sub, className = '', font }: { formatId: string; accent: string; headline: string; sub: string; className?: string; font?: { css: string; cat: string } }) {
  const f = formatById(formatId);
  const ratio = Math.max(0.3, Math.min(3.2, f.w / f.h));
  const style = { ['--acc' as string]: accent, ['--ratio' as string]: ratio } as CSSProperties;
  return (
    <div className={`th-frame ${className}`} aria-hidden="true">
      <div className={`th-art k-${f.kind}`} style={style} data-wide={ratio > 1 ? '' : undefined}>
        <span className="th-h" style={font ? { fontFamily: `"${font.css}", ${font.cat === 'Serif' ? 'Georgia, serif' : font.cat === 'Mono' ? 'ui-monospace, monospace' : font.cat === 'Script' || font.cat === 'Handwriting' ? 'cursive' : 'system-ui, sans-serif'}`, fontWeight: 400 } : undefined}>{headline}</span>
        <span className="th-s">{sub}</span>
        <i className="th-bar" />
      </div>
    </div>
  );
}
