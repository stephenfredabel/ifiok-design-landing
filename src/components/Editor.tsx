'use client';

import {
  FilePlus,
  Home,
  IdCard,
  LayoutGrid,
  Redo2,
  Shapes,
  ShoppingCart,
  Sparkles,
  QrCode,
  Type,
  Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { T, useLang } from '@/i18n/LangProvider';

type Fmt = 'card' | 'flyer' | 'id' | 'poster';

/* Example prices only. Replace with live pricing when the order API is wired in. */
const FMT: Record<Fmt, { dim: string; bleed: string; qty: number; step: number; base: number; per: number; doc: string }> = {
  card: { dim: '3.5" × 2"', bleed: 'Bleed 0.125"', qty: 100, step: 50, base: 3000, per: 50, doc: 'Okafor Bakes — business card' },
  flyer: { dim: 'A5 · 5.8" × 8.3"', bleed: 'Bleed 0.125"', qty: 100, step: 50, base: 4000, per: 110, doc: 'Grand Opening — flyer' },
  id: { dim: 'CR80 · 3.375" × 2.125"', bleed: 'Bleed 0.04"', qty: 25, step: 25, base: 1500, per: 900, doc: 'Staff ID — Okafor Bakes' },
  poster: { dim: 'A3 · 11.7" × 16.5"', bleed: 'Bleed 0.125"', qty: 10, step: 5, base: 1500, per: 1800, doc: 'Mega Sale — poster' },
};

const SWATCHES = [
  { hex: '#0B7A7F', name: 'Teal' },
  { hex: '#DAA019', name: 'Gold' },
  { hex: '#B6322B', name: 'Red' },
  { hex: '#1F3A8A', name: 'Blue' },
  { hex: '#15241F', name: 'Near black' },
];

const naira = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG');
const priceFor = (fmt: Fmt, qty: number) => {
  const f = FMT[fmt];
  const unit = f.per * Math.pow(qty / f.qty, -0.12); // gentle volume discount
  return f.base + unit * Math.max(0, qty - 1);
};

export default function Editor() {
  const { t } = useLang();
  const [fmt, setFmt] = useState<Fmt>('card');
  const [qty, setQty] = useState(FMT.card.qty);
  const [acc, setAcc] = useState('#0B7A7F');
  const [isLive, setIsLive] = useState(false);

  const liveRef = useRef(false);
  const timers = useRef<number[]>([]);
  const typer = useRef<number | null>(null);
  const edRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLSpanElement>(null);
  const chipFlyer = useRef<HTMLButtonElement>(null);
  const chipCard = useRef<HTMLButtonElement>(null);
  const swGold = useRef<HTMLButtonElement>(null);

  const chooseFmt = useCallback((next: Fmt) => {
    setFmt(next);
    setQty(FMT[next].qty);
  }, []);

  const goLive = useCallback(() => {
    if (liveRef.current) return;
    liveRef.current = true;
    setIsLive(true);
    timers.current.forEach(clearTimeout);
    if (typer.current) clearInterval(typer.current);
    curRef.current?.classList.add('hide');
  }, []);

  /* The idle demo: a pointer designs the card by itself until the visitor takes over. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ed = edRef.current;
    if (!ed) return;

    const at = (el: HTMLElement, dx?: number, dy?: number) => {
      const s = stageRef.current!.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - s.left + (dx ?? r.width / 2), y: r.top - s.top + (dy ?? r.height / 2) };
    };
    const move = (el: HTMLElement | null, dx?: number, dy?: number) => {
      if (!el || !curRef.current) return;
      const p = at(el, dx, dy);
      curRef.current.style.transform = `translate(${p.x}px,${p.y}px)`;
    };
    const tap = () => {
      const c = curRef.current;
      if (!c) return;
      c.classList.remove('tap');
      void c.offsetWidth;
      c.classList.add('tap');
    };
    const typeInto = (el: HTMLElement | null, text: string) => {
      if (!el) return;
      let i = 0;
      el.textContent = '';
      if (typer.current) clearInterval(typer.current);
      typer.current = window.setInterval(() => {
        if (liveRef.current) {
          clearInterval(typer.current!);
          return;
        }
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(typer.current!);
      }, 55);
    };

    const demo = () => {
      if (liveRef.current) return;
      const steps: [number, () => void][] = [
        [600, () => move(nameRef.current)],
        [900, () => { tap(); typeInto(nameRef.current, 'Adaeze Okafor'); }],
        [1600, () => move(swGold.current, 16, 16)],
        [700, () => { tap(); setAcc('#DAA019'); }],
        [1100, () => move(chipFlyer.current, 30, 18)],
        [700, () => { tap(); chooseFmt('flyer'); }],
        [1700, () => move(orderRef.current, 20, 15)],
        [800, () => tap()],
        [1400, () => move(chipCard.current, 30, 18)],
        [700, () => { tap(); chooseFmt('card'); setAcc('#0B7A7F'); }],
        [1500, () => demo()],
      ];
      let i = 0;
      const next = () => {
        if (liveRef.current || i >= steps.length) return;
        const [wait, run] = steps[i++];
        timers.current.push(
          window.setTimeout(() => {
            if (liveRef.current) return;
            run();
            next();
          }, wait),
        );
      };
      next();
    };

    // Start only once the editor is on screen.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          move(nameRef.current);
          timers.current.push(window.setTimeout(demo, 500));
        }
      },
      { threshold: 0.35 },
    );
    io.observe(ed);
    return () => {
      io.disconnect();
      timers.current.forEach(clearTimeout);
      if (typer.current) clearInterval(typer.current);
    };
  }, [chooseFmt]);

  const f = FMT[fmt];
  const editable = isLive;

  return (
    <div>
      <div className="edwrap">
        <div
          className="ed"
          ref={edRef}
          data-live={isLive ? '' : undefined}
          onPointerEnter={goLive}
          onPointerDown={goLive}
          onTouchStart={goLive}
          onFocusCapture={goLive}
        >
          <div className="ed-bar">
            <span className="ic home"><Home aria-hidden="true" /></span>
            <span className="ic"><Undo2 aria-hidden="true" /></span>
            <span className="ic"><Redo2 aria-hidden="true" /></span>
            <span className="doc">{f.doc}</span>
            <span className="order" ref={orderRef}>
              <ShoppingCart aria-hidden="true" /> <T k="ed.order">Order Print</T>
            </span>
          </div>

          <div className="ed-main">
            <div className="ed-rail">
              <b><FilePlus aria-hidden="true" /><span><T k="rail.new">New</T></span></b>
              <b className="on"><LayoutGrid aria-hidden="true" /><span><T k="rail.tpl">Templates</T></span></b>
              <b><Type aria-hidden="true" /><span><T k="rail.text">Text</T></span></b>
              <b><Sparkles aria-hidden="true" /><span><T k="rail.ai">AI</T></span></b>
              <b><Shapes aria-hidden="true" /><span><T k="rail.el">Elements</T></span></b>
              <b><QrCode aria-hidden="true" /><span><T k="rail.qr">QR Code</T></span></b>
              <b><IdCard aria-hidden="true" /><span><T k="rail.bulk">Bulk Cards</T></span></b>
            </div>

            <div className="ed-stage" ref={stageRef}>
              <div className={`board f-${fmt}`} style={{ ['--acc' as string]: acc }}>
                <div className="lay lay-card">
                  <div>
                    <div className="nm tx" ref={nameRef} contentEditable={editable} suppressContentEditableWarning>Adaeze Okafor</div>
                    <div className="rl tx" contentEditable={editable} suppressContentEditableWarning>Founder · Okafor Bakes</div>
                  </div>
                  <div className="ct tx" contentEditable={editable} suppressContentEditableWarning>
                    adaeze@okaforbakes.ng<br />0803 000 0000 · Yaba, Lagos
                  </div>
                  <span className="bar" />
                </div>
                <div className="lay lay-flyer">
                  <div className="kick tx" contentEditable={editable} suppressContentEditableWarning>Okafor Bakes · Yaba</div>
                  <div className="nm tx" contentEditable={editable} suppressContentEditableWarning>GRAND<br />OPENING</div>
                  <div className="ct tx" contentEditable={editable} suppressContentEditableWarning>
                    Saturday 12 July · 10am<br />Free tasting all day
                  </div>
                  <span className="btnish tx" contentEditable={editable} suppressContentEditableWarning>20% off everything</span>
                </div>
                <div className="lay lay-id">
                  <span className="top" />
                  <div className="ph" />
                  <div className="nm tx" contentEditable={editable} suppressContentEditableWarning>Adaeze Okafor</div>
                  <div className="rl tx" contentEditable={editable} suppressContentEditableWarning>Production Lead</div>
                  <div className="code tx" contentEditable={editable} suppressContentEditableWarning>OKB-0041</div>
                </div>
                <div className="lay lay-poster">
                  <div className="kick tx" contentEditable={editable} suppressContentEditableWarning>This weekend only</div>
                  <div className="nm tx" contentEditable={editable} suppressContentEditableWarning>MEGA<br />SALE</div>
                  <span className="big tx" contentEditable={editable} suppressContentEditableWarning>UP TO 40% OFF</span>
                  <div className="ct tx" contentEditable={editable} suppressContentEditableWarning>27 Adeola Odeku St · Victoria Island</div>
                </div>
              </div>
              <div className="takeover">
                <i />
                <span>{isLive ? t('ed.live', 'Your turn — edit the design') : t('ed.idle', 'Move your pointer in to take over')}</span>
              </div>
              <div className="cur" ref={curRef} aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 2l14 9.5-6.4 1.2L9.6 20z" fill="#fff" stroke="#0A1414" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                <span className="ring" />
              </div>
            </div>
          </div>

          <div className="ed-tabs">
            <b><Home aria-hidden="true" /><span><T k="rail.home">Home</T></span></b>
            <b className="on"><LayoutGrid aria-hidden="true" /><span><T k="rail.tpl">Templates</T></span></b>
            <b><Type aria-hidden="true" /><span><T k="rail.text">Text</T></span></b>
            <b><Sparkles aria-hidden="true" /><span><T k="rail.ai">AI</T></span></b>
            <b><Shapes aria-hidden="true" /><span><T k="rail.el">Elements</T></span></b>
            <b><QrCode aria-hidden="true" /><span><T k="rail.qr">QR</T></span></b>
          </div>

          <div className="ed-status">
            <span className="dims">{f.dim}</span>
            <span className="pill">300 DPI</span>
            <span className="pill">CMYK</span>
            <span className="pill">{f.bleed}</span>
            <span className="price">{t('ed.est', 'Est.')} {naira(priceFor(fmt, qty))} / {qty.toLocaleString('en-NG')}</span>
          </div>
        </div>

        <div className="deck">
          <div className="deck-row" role="group" aria-label="Design format">
            <em><T k="deck.size">Size</T></em>
            {(
              [
                ['card', 'fmt.card', 'Business card', '3.5×2"', chipCard],
                ['flyer', 'fmt.flyer', 'Flyer', 'A5', chipFlyer],
                ['id', 'fmt.id', 'ID card', 'CR80', undefined],
                ['poster', 'fmt.poster', 'Poster', 'A3', undefined],
              ] as const
            ).map(([key, tk, label, dim, ref]) => (
              <button
                key={key}
                ref={ref}
                type="button"
                className="chip"
                aria-pressed={fmt === key}
                onClick={() => { goLive(); chooseFmt(key); }}
              >
                <span><T k={tk}>{label}</T></span> <span className="dim">{dim}</span>
              </button>
            ))}
          </div>
          <div className="deck-row" role="group" aria-label="Colour and quantity">
            <em><T k="deck.colour">Colour</T></em>
            {SWATCHES.map((s) => (
              <button
                key={s.hex}
                ref={s.hex === '#DAA019' ? swGold : undefined}
                type="button"
                className="sw"
                style={{ background: s.hex }}
                aria-pressed={acc.toLowerCase() === s.hex.toLowerCase()}
                aria-label={s.name}
                onClick={() => { goLive(); setAcc(s.hex); }}
              />
            ))}
            <span className="qty" aria-label="Quantity">
              <button type="button" aria-label="Fewer" onClick={() => { goLive(); setQty((q) => Math.max(f.step, q - f.step)); }}>−</button>
              <span>{qty.toLocaleString('en-NG')}</span>
              <button type="button" aria-label="More" onClick={() => { goLive(); setQty((q) => q + f.step); }}>+</button>
            </span>
          </div>
        </div>
      </div>
      <p className="shotcap"><T k="ed.note">This is the real editor's layout, running right here. Prices shown are examples.</T></p>
    </div>
  );
}
