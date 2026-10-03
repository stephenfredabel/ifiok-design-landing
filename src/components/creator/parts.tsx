'use client';

import { Copy, ExternalLink, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Menu } from '@/components/design/parts';
import { STATUSES, kindById, type CTemplate, type Status } from '@/data/creator-app';

export const EDITOR = 'https://designs.ifiok.ng/editor';

export function CThumb({ kindId, accent, headline, sub, className = '' }: { kindId: string; accent: string; headline: string; sub: string; className?: string }) {
  const k = kindById(kindId);
  const ratio = Math.max(0.3, Math.min(3.2, k.ratio));
  const style = { ['--acc' as string]: accent, ['--ratio' as string]: ratio } as CSSProperties;
  return (
    <div className={`th-frame ${className}`} aria-hidden="true">
      <div className={`th-art k-${k.kind}`} style={style}>
        <span className="th-h">{headline}</span>
        <span className="th-s">{sub}</span>
        <i className="th-bar" />
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: Status }) {
  const label = STATUSES.find((s) => s.id === status)!.label;
  return <span className={`stage st-${status}`}><i aria-hidden="true" />{label}</span>;
}

export type TOps = { open: (id: string) => void; duplicate: (id: string) => void; remove: (id: string) => void };

export function TCard({ t, ops }: { t: CTemplate; ops: TOps }) {
  const k = kindById(t.kindId);
  return (
    <article className="dcard">
      <button type="button" className="dcard-hit" onClick={() => ops.open(t.id)} aria-label={`Open ${t.name}`}>
        <CThumb kindId={t.kindId} accent={t.accent} headline={t.headline} sub={t.sub} />
      </button>
      <div className="dcard-meta">
        <div className="dcard-top">
          <h3 title={t.name}>{t.name}</h3>
          <Menu label={`Actions for ${t.name}`}>
            {(close) => (
              <>
                <button type="button" role="menuitem" onClick={() => { close(); ops.open(t.id); }}><Pencil aria-hidden="true" />Details</button>
                <a role="menuitem" href={EDITOR} onClick={close}><ExternalLink aria-hidden="true" />Edit in editor</a>
                <button type="button" role="menuitem" onClick={() => { close(); ops.duplicate(t.id); }}><Copy aria-hidden="true" />Duplicate</button>
                <button type="button" role="menuitem" className="danger" onClick={() => { close(); ops.remove(t.id); }}><Trash2 aria-hidden="true" />Delete</button>
              </>
            )}
          </Menu>
        </div>
        <p className="dcard-sub">{k.label} · {t.updated}</p>
        <div className="dcard-foot">
          <StatusPill status={t.status} />
          {t.status === 'changes' && <span className="warn"><TriangleAlert aria-hidden="true" />Feedback</span>}
        </div>
      </div>
    </article>
  );
}

