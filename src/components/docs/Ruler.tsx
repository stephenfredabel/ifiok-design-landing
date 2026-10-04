'use client';

import { useRef } from 'react';
import { tr } from '@/i18n/tr';

/** Horizontal ruler in inches. Drag the two blue markers to change the left and right margins. */
export default function Ruler({ pageW, left, right, onChange }: { pageW: number; left: number; right: number; onChange: (l: number, r: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inch = 96, ticks: React.ReactNode[] = [];
  for (let i = 0; i <= pageW / (inch / 8); i++) {
    const x = i * (inch / 8);
    if (x > pageW) break;
    const major = i % 8 === 0, half = i % 4 === 0;
    ticks.push(<i key={i} className={major ? 'mj' : half ? 'hf' : 'qt'} style={{ left: x }} />);
    if (major && i > 0) ticks.push(<b key={`n${i}`} style={{ left: x }}>{i / 8}</b>);
  }
  const drag = (side: 'l' | 'r') => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const box = ref.current!.getBoundingClientRect();
    const scale = box.width / pageW;
    const move = (ev: PointerEvent) => {
      const x = Math.round(((ev.clientX - box.left) / scale) / 8) * 8; // snap to 1/12 inch
      if (side === 'l') onChange(Math.max(0, Math.min(x, pageW - right - 144)), right);
      else onChange(left, Math.max(0, Math.min(pageW - x, pageW - left - 144)));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };
  const nudge = (side: 'l' | 'r') => (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowLeft' ? -8 : e.key === 'ArrowRight' ? 8 : 0;
    if (!d) return; e.preventDefault();
    if (side === 'l') onChange(Math.max(0, left + d), right); else onChange(left, Math.max(0, right - d));
  };
  return (
    <div className="dx-ruler" ref={ref} style={{ width: pageW }}>
      <span className="dx-r-pad" style={{ width: left }} /><span className="dx-r-pad" style={{ width: right, left: pageW - right }} />
      {ticks}
      <button type="button" className="dx-r-h" style={{ left }} onPointerDown={drag('l')} onKeyDown={nudge('l')} aria-label={tr('Left margin')} title={tr('Left margin')} />
      <button type="button" className="dx-r-h" style={{ left: pageW - right }} onPointerDown={drag('r')} onKeyDown={nudge('r')} aria-label={tr('Right margin')} title={tr('Right margin')} />
    </div>
  );
}
