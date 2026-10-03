'use client';

import { useRef, useState } from 'react';
import { T } from '@/i18n/LangProvider';

/** Before/after slider for the background remover. Drag, tap or use the arrow keys. */
export default function CutSlider() {
  const [pct, setPct] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const clamp = (n: number) => Math.max(2, Math.min(98, n));

  function fromEvent(e: React.PointerEvent) {
    const r = box.current!.getBoundingClientRect();
    setPct(clamp(((e.clientX - r.left) / r.width) * 100));
  }

  return (
    <div
      ref={box}
      className="cut"
      role="slider"
      tabIndex={0}
      aria-label="Before and after background removal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      style={{ ['--p' as string]: `${pct}%` }}
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromEvent(e); }}
      onPointerMove={(e) => dragging.current && fromEvent(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { setPct((p) => clamp(p - 5)); e.preventDefault(); }
        if (e.key === 'ArrowRight') { setPct((p) => clamp(p + 5)); e.preventDefault(); }
      }}
    >
      <div className="side before"><div className="jar"><em>OKAFOR<br />BAKES</em></div></div>
      <div className="side after"><div className="jar"><em>OKAFOR<br />BAKES</em></div></div>
      <span className="tag l mono"><T k="cut.before">photo</T></span>
      <span className="tag r mono"><T k="cut.after">background removed</T></span>
      <span className="handle" />
    </div>
  );
}
