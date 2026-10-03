import type { CSSProperties } from 'react';
import { formatById } from './data';

/** A small drawn preview of a design. Real thumbnails come from the editor. */
export default function Thumb({ formatId, accent, headline, sub, className = '' }: { formatId: string; accent: string; headline: string; sub: string; className?: string }) {
  const f = formatById(formatId);
  const ratio = Math.max(0.3, Math.min(3.2, f.w / f.h));
  const style = { ['--acc' as string]: accent, ['--ratio' as string]: ratio } as CSSProperties;
  return (
    <div className={`th-frame ${className}`} aria-hidden="true">
      <div className={`th-art k-${f.kind}`} style={style} data-wide={ratio > 1 ? '' : undefined}>
        <span className="th-h">{headline}</span>
        <span className="th-s">{sub}</span>
        <i className="th-bar" />
      </div>
    </div>
  );
}
