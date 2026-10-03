import type { CSSProperties } from 'react';

const RATIO = { card: 1.75, flyer: 0.707, poster: 0.707, banner: 2.2, id: 0.63, doc: 0.707, invite: 0.714 } as const;

/** A small drawn template, used instead of photos of people. The outer box is the size container; the inner box holds the design. */
export default function CrArt({ kind, title, sub, accent, h = 190, className = '' }: { kind: keyof typeof RATIO; title: string; sub: string; accent: string; h?: number; className?: string }) {
  const style = { ['--acc' as string]: accent, ['--r' as string]: RATIO[kind], ['--h' as string]: `${h}px` } as CSSProperties;
  return (
    <div className={`cr-art k-${kind} ${className}`} style={style} aria-hidden="true">
      <div className="cr-in">
        <b>{title}</b>
        <span>{sub}</span>
        <i />
      </div>
    </div>
  );
}
