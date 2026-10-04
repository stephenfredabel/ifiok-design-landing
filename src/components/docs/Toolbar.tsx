'use client';

import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Check, ChevronDown, ChevronUp, Highlighter, Image as ImageIcon, Italic, Link2, List, ListChecks, ListOrdered, MessageSquarePlus, Minus, MoreVertical,
  Paintbrush, Plus, Printer, Redo2, Search, SpellCheck, Underline, Undo2, WrapText, Pencil, Eye, MessageSquareDiff,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FONTS, SIZES, SPACINGS, STYLES } from './menus';
import type { Fmt } from './engine';
import { useDismiss } from './ui';
import { tr } from '@/i18n/tr';

export const PALETTE = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#efefef', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#9900ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#d9d2e9',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#8e7cc3',
  '#0b7a7f', '#14a5ab', '#daa019', '#f0b829', '#15241f', '#7a1d4a', '#1f3a8a', '#b6322b',
];
export const ZOOMS = [50, 75, 90, 100, 125, 150, 200];

type Act = (id: string, arg?: string) => void;


/** Dropdowns are fixed-position so a scrolling toolbar never clips them; they stay inside the window. */
function useDrop(open: boolean, align: 'left' | 'right' = 'left') {
  const btn = useRef<HTMLDivElement>(null);
  const drop = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const b = btn.current, d = drop.current;
    if (!open || !b || !d) return;
    const r = b.getBoundingClientRect(), w = d.offsetWidth, h = d.offsetHeight;
    let left = align === 'right' ? r.right - w : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    d.style.left = `${left}px`; d.style.top = `${top}px`;
  }, [open, align]);
  return { btn, drop };
}

function Pop({ label, button, children, wide, cls = '', align = 'left' }: { label: string; button: React.ReactNode; children: (close: () => void) => React.ReactNode; wide?: boolean; cls?: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);
  const { btn, drop } = useDrop(open, align);
  return (
    <div className={`dx-tpop ${cls}`} ref={(el) => { ref.current = el; btn.current = el; }}>
      <button type="button" className="dx-tb dd" aria-haspopup="true" aria-expanded={open} aria-label={label} title={label} onClick={() => setOpen((o) => !o)}>{button}<ChevronDown className="car" aria-hidden="true" /></button>
      {open && <div className={`dx-tdrop${wide ? ' wide' : ''} ${align}`} role="menu" ref={drop}>{children(close)}</div>}
    </div>
  );
}

function Swatches({ onPick, label, none }: { onPick: (c: string | null) => void; label: string; none?: string }) {
  return (
    <div className="dx-sw" role="group" aria-label={label}>
      {none && <button type="button" className="dx-sw-none" onClick={() => onPick(null)}>{none}</button>}
      <div className="dx-sw-grid">{PALETTE.map((c) => <button key={c} type="button" style={{ background: c }} aria-label={c} onClick={() => onPick(c)} />)}</div>
    </div>
  );
}

function SizePick({ size, text, setText, act }: { size: number; text: string; setText: (t: string) => void; act: Act }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);
  const { btn, drop } = useDrop(open);
  return (
    <div className="dx-tpop sz" ref={(el) => { ref.current = el; btn.current = el; }}>
      <input className="dx-sizein" inputMode="numeric" value={text} aria-label={tr('Font size')} onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setText(e.target.value.replace(/\D/g, '').slice(0, 3))}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); act('size', String(Math.min(400, Math.max(1, Number(text) || size)))); } e.stopPropagation(); }} />
      <button type="button" className="dx-tb sm car-b" aria-haspopup="true" aria-expanded={open} aria-label={tr('Font size')} onClick={() => setOpen((o) => !o)}><ChevronDown aria-hidden="true" /></button>
      {open && <div className="dx-tdrop" role="menu" ref={drop}>{SIZES.map((n) => <button key={n} type="button" role="menuitemradio" aria-checked={size === n} className="dx-di" onClick={() => { act('size', String(n)); close(); }}>{n}</button>)}</div>}
    </div>
  );
}

export default function Toolbar({ fmt, act, zoom, mode, spell, canUndo, size, painting, textColor, hiColor, width }: {
  fmt: Fmt; act: Act; zoom: number; mode: 'edit' | 'suggest' | 'view'; spell: boolean; canUndo: boolean; size: number; painting: boolean; textColor: string; hiColor: string; width: number;
}) {
  const T = ({ id, label, icon, on, off, arg, cls = '' }: { id: string; label: string; icon: React.ReactNode; on?: boolean; off?: boolean; arg?: string; cls?: string }) => (
    <button type="button" className={`dx-tb ${cls}`} aria-label={label} title={label} aria-pressed={on === undefined ? undefined : on} disabled={off} onClick={() => act(id, arg)}>{icon}</button>
  );
  const [sizeText, setSizeText] = useState(String(size));
  useEffect(() => setSizeText(String(size)), [size]);
  const sep = <i className="dx-tsep" aria-hidden="true" />;

  const hist = (
    <>
      <T id="search-menus" label={tr('Search the menus')} icon={<Search aria-hidden="true" />} />
      <T id="undo" label={tr('Undo')} icon={<Undo2 aria-hidden="true" />} off={!canUndo && false} />
      <T id="redo" label={tr('Redo')} icon={<Redo2 aria-hidden="true" />} />
      <T id="print" label={tr('Print')} icon={<Printer aria-hidden="true" />} />
      <T id="spell" label={tr('Spelling and grammar check')} icon={<SpellCheck aria-hidden="true" />} on={spell} />
      <T id="paint" label={tr('Paint format')} icon={<Paintbrush aria-hidden="true" />} on={painting} />
    </>
  );
  const style = (
    <Pop label={tr('Paragraph style')} cls="style" button={<span className="dx-tval">{tr(STYLES.find((s) => s.id === fmt.style)?.label ?? 'Normal text')}</span>}>
      {(close) => STYLES.map((s) => (
        <button key={s.id} type="button" role="menuitemradio" aria-checked={fmt.style === s.id} className={`dx-di st-${s.id}`} onClick={() => { act(`st-${s.id}`); close(); }}>
          <span className="tk">{fmt.style === s.id ? <Check aria-hidden="true" /> : null}</span><span>{tr(s.label)}</span>
        </button>
      ))}
    </Pop>
  );
  const font = (
    <Pop label={tr('Font')} cls="font" button={<span className="dx-tval">{fmt.font}</span>}>
      {(close) => (<>
        {FONTS.map((f) => (
          <button key={f.family} type="button" role="menuitemradio" aria-checked={fmt.font === f.family} className="dx-di" style={{ fontFamily: f.stack }} onClick={() => { act('font', f.stack); close(); }}>
            <span className="tk">{fmt.font === f.family ? <Check aria-hidden="true" /> : null}</span><span>{f.family}</span>
          </button>
        ))}
        <hr className="dx-msep" />
        <button type="button" role="menuitem" className="dx-di" onClick={() => { act('more-fonts'); close(); }}><span className="tk" /><span>{tr('More fonts (Ifiok Fonts)')}</span></button>
      </>)}
    </Pop>
  );
  const sizeBox = (
    <div className="dx-size" role="group" aria-label={tr('Font size')}>
      <button type="button" className="dx-tb sm" aria-label={tr('Decrease font size')} title={tr('Decrease font size')} onClick={() => act('size-down')}><Minus aria-hidden="true" /></button>
      <SizePick size={size} text={sizeText} setText={setSizeText} act={act} />
      <button type="button" className="dx-tb sm" aria-label={tr('Increase font size')} title={tr('Increase font size')} onClick={() => act('size-up')}><Plus aria-hidden="true" /></button>
    </div>
  );
  const fmtG = (
    <>
      <T id="bold" label={tr('Bold')} icon={<Bold aria-hidden="true" />} on={fmt.bold} />
      <T id="italic" label={tr('Italic')} icon={<Italic aria-hidden="true" />} on={fmt.italic} />
      <T id="underline" label={tr('Underline')} icon={<Underline aria-hidden="true" />} on={fmt.underline} />
      <Pop label={tr('Text colour')} cls="clr" button={<span className="dx-clr"><b>A</b><i style={{ background: textColor }} /></span>}>
        {(close) => <Swatches label={tr('Text colour')} onPick={(c) => { if (c) act('color', c); close(); }} />}
      </Pop>
      <Pop label={tr('Highlight colour')} cls="clr" button={<span className="dx-clr"><Highlighter aria-hidden="true" /><i style={{ background: hiColor }} /></span>}>
        {(close) => <Swatches label={tr('Highlight colour')} none={tr('None')} onPick={(c) => { act('highlight', c ?? 'transparent'); close(); }} />}
      </Pop>
    </>
  );
  const insG = (
    <>
      <T id="link" label={tr('Insert link')} icon={<Link2 aria-hidden="true" />} on={fmt.link} />
      <T id="comment" label={tr('Add a comment')} icon={<MessageSquarePlus aria-hidden="true" />} />
      <T id="img-upload" label={tr('Insert image')} icon={<ImageIcon aria-hidden="true" />} />
    </>
  );
  const alignIc = fmt.align === 'center' ? <AlignCenter aria-hidden="true" /> : fmt.align === 'right' ? <AlignRight aria-hidden="true" /> : fmt.align === 'justify' ? <AlignJustify aria-hidden="true" /> : <AlignLeft aria-hidden="true" />;
  const alignG = (
    <>
      <Pop label={tr('Alignment')} cls="al" button={alignIc}>
        {(close) => (
          <div className="dx-row">
            {([['al-left', 'Left', AlignLeft, 'left'], ['al-center', 'Centre', AlignCenter, 'center'], ['al-right', 'Right', AlignRight, 'right'], ['al-justify', 'Justified', AlignJustify, 'justify']] as const).map(([id, lb, Ic, v]) => (
              <button key={id} type="button" className="dx-tb" aria-label={tr(lb)} title={tr(lb)} aria-pressed={fmt.align === v} onClick={() => { act(id); close(); }}><Ic aria-hidden="true" /></button>
            ))}
          </div>
        )}
      </Pop>
      <Pop label={tr('Line and paragraph spacing')} cls="ls" button={<WrapText aria-hidden="true" />}>
        {(close) => (<>
          {SPACINGS.map((s) => <button key={s.v} type="button" role="menuitem" className="dx-di" onClick={() => { act(`ls-${s.v.replace('.', '')}`); close(); }}><span className="tk" />{tr(s.label)}</button>)}
          <hr className="dx-msep" />
          <button type="button" role="menuitem" className="dx-di" onClick={() => { act('ps-before'); close(); }}><span className="tk" />{tr('Add space before paragraph')}</button>
          <button type="button" role="menuitem" className="dx-di" onClick={() => { act('ps-after'); close(); }}><span className="tk" />{tr('Add space after paragraph')}</button>
        </>)}
      </Pop>
      <T id="check" label={tr('Checklist')} icon={<ListChecks aria-hidden="true" />} on={fmt.check} />
      <T id="ul" label={tr('Bulleted list')} icon={<List aria-hidden="true" />} on={fmt.ul} />
      <T id="ol" label={tr('Numbered list')} icon={<ListOrdered aria-hidden="true" />} on={fmt.ol} />
    </>
  );

  // Groups in the order they are dropped when the window is narrow. `w` is roughly the pixels each takes.
  const chunks: { id: string; w: number; node: React.ReactNode }[] = [
    { id: 'hist', w: 205, node: hist }, { id: 'style', w: 136, node: style }, { id: 'font', w: 128, node: font }, { id: 'size', w: 108, node: sizeBox },
    { id: 'fmt', w: 205, node: fmtG }, { id: 'align', w: 215, node: alignG }, { id: 'ins', w: 108, node: insG },
  ];
  const scroll = width < 900; // phones and small tablets: one scrolling strip instead of a "More" menu
  const budget = Math.max(0, width - 260);
  let used = 0;
  const shown: typeof chunks = [], hidden: typeof chunks = [];
  chunks.forEach((c) => { if (scroll || (used + c.w + 10 <= budget && hidden.length === 0)) { used += c.w + 10; shown.push(c); } else hidden.push(c); });

  const modes = [{ id: 'edit', label: 'Editing', Icon: Pencil, hint: 'Edit the document directly' }, { id: 'suggest', label: 'Suggesting', Icon: MessageSquareDiff, hint: 'Your edits become suggestions' }, { id: 'view', label: 'Viewing', Icon: Eye, hint: 'Read the final document' }] as const;
  const cur = modes.find((m) => m.id === mode)!;

  return (
    <div className="dx-tools" role="toolbar" aria-label={tr('Formatting')} onMouseDown={(e) => { if (!(e.target as HTMLElement).closest('input')) e.preventDefault(); }}>
      <div className={`dx-tools-in${scroll ? ' scroll' : ''}`}>
        {shown.map((c, i) => <div key={c.id} className="dx-tg">{i > 0 && sep}{c.node}</div>)}
        <div className="dx-tg">
          {shown.length > 0 && sep}
          <Pop label={tr('More')} cls="more" wide button={<MoreVertical aria-hidden="true" />}>
            {() => (
              <div className="dx-more-tools">
                {hidden.map((c) => <div key={c.id} className="dx-tg wrap">{c.node}</div>)}
                <div className="dx-tg wrap">
                  <T id="strike" label={tr('Strikethrough')} icon={<span className="dx-gl s">S</span>} on={fmt.strike} />
                  <T id="sup" label={tr('Superscript')} icon={<span className="dx-gl">x²</span>} on={fmt.sup} />
                  <T id="sub" label={tr('Subscript')} icon={<span className="dx-gl">x₂</span>} on={fmt.sub} />
                  <T id="outdent" label={tr('Decrease indent')} icon={<span className="dx-gl">⇤</span>} />
                  <T id="indent" label={tr('Increase indent')} icon={<span className="dx-gl">⇥</span>} />
                  <T id="clear-format" label={tr('Clear formatting')} icon={<span className="dx-gl">Tx</span>} />
                </div>
              </div>
            )}
          </Pop>
        </div>
      </div>
      <span className="grow" />
      <Pop label={tr('Editing mode')} cls="mode" align="right" button={<span className="dx-mode"><cur.Icon aria-hidden="true" /><span>{tr(cur.label)}</span></span>}>
        {(close) => modes.map((m) => (
          <button key={m.id} type="button" role="menuitemradio" aria-checked={mode === m.id} className="dx-di two" onClick={() => { act(`mode-${m.id}`); close(); }}>
            <m.Icon aria-hidden="true" /><span><b>{tr(m.label)}</b><small>{tr(m.hint)}</small></span>{mode === m.id && <Check className="ok" aria-hidden="true" />}
          </button>
        ))}
      </Pop>
      <button type="button" className="dx-tb" aria-label={tr('Hide the menus')} title={tr('Hide the menus')} onClick={() => act('toggle-toolbar')}><ChevronUp aria-hidden="true" /></button>
          </div>
  );
}
