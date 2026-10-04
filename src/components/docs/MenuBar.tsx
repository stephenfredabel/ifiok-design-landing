'use client';

import {
  Accessibility, AlignCenter, AlignJustify, AlignLeft, AlignRight, AtSign, Bell, BarChart3, Bold, BookOpen, Bookmark, BoxSelect, ChevronRight, ChevronUp, Check, Clipboard, ClipboardType, CloudOff, Columns2, Copy, Diff,
  Download, Eraser, File, FileCog, FilePlus, FileText, Flag, Folder, FolderInput, GraduationCap, Hash, Heading, History, Image as ImageIcon, Indent, Info, Italic, Keyboard, Languages, LifeBuoy, LineChart, Link2,
  List, ListChecks, ListOrdered, ListTree, Mail, MapPin, Maximize, MessageSquarePlus, Mic, Minus, Outdent, Palette, PanelLeft, PanelTop, Pen, PenLine, PenTool, PieChart, Pilcrow, Printer, Puzzle, QrCode, Redo2,
  RemoveFormatting, Replace, Rotate3d, Ruler, Scissors, Search, Shapes, Sigma, Signature, Smile, Sparkles, SpellCheck, Split, Store, Strikethrough, Subscript, Superscript, Table2, Trash2, Type, Underline, Undo2,
  Upload, User, UserPlus, WrapText, ZoomIn, Calendar, Globe, Blocks, Footprints, Omega,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MENUS, type MI } from './menus';
import { useDismiss } from './ui';
import { tr } from '@/i18n/tr';

export const ICONS: Record<string, React.ComponentType<{ 'aria-hidden'?: boolean }>> = {
  accessibility: Accessibility, alignCenter: AlignCenter, alignJustify: AlignJustify, alignLeft: AlignLeft, alignRight: AlignRight, atSign: AtSign, barChart: BarChart3, bell: Bell, blocks: Blocks, bold: Bold, bookOpen: BookOpen,
  bookmark: Bookmark, boxSelect: BoxSelect, calendar: Calendar, chevronUp: ChevronUp, clipboard: Clipboard, clipboardType: ClipboardType, cloudOff: CloudOff, columns: Columns2, copy: Copy, diff: Diff, download: Download,
  eraser: Eraser, file: File, fileCog: FileCog, filePlus: FilePlus, fileText: FileText, flag: Flag, folder: Folder, folderInput: FolderInput, footnote: Footprints, globe: Globe, graduationCap: GraduationCap, hash: Hash,
  heading: Heading, history: History, image: ImageIcon, indent: Indent, info: Info, italic: Italic, keyboard: Keyboard, languages: Languages, lifeBuoy: LifeBuoy, lineChart: LineChart, lineHeight: WrapText, link2: Link2,
  list: List, listChecks: ListChecks, listOrdered: ListOrdered, listTree: ListTree, mail: Mail, mapPin: MapPin, maximize: Maximize, messagePlus: MessageSquarePlus, mic: Mic, minus: Minus, omega: Omega, outdent: Outdent,
  palette: Palette, panelLeft: PanelLeft, panelTop: PanelTop, pen: Pen, pencilLine: PenLine, penTool: PenTool, pieChart: PieChart, pilcrow: Pilcrow, printer: Printer, puzzle: Puzzle, qr: QrCode, redo: Redo2,
  removeFormatting: RemoveFormatting, replace: Replace, rotate: Rotate3d, ruler: Ruler, scissors: Scissors, search: Search, shapes: Shapes, sigma: Sigma, signature: Signature, smile: Smile, sparkles: Sparkles,
  spellCheck: SpellCheck, split: Split, store: Store, strikethrough: Strikethrough, subscript: Subscript, superscript: Superscript, table: Table2, trash: Trash2, type: Type, underline: Underline, undo: Undo2,
  upload: Upload, user: User, userPlus: UserPlus, zoomIn: ZoomIn,
};

type Props = {
  run: (id: string, arg?: string) => void;
  checks: Record<string, boolean>;
  /** names of items that cannot be used right now */
  disabled: (id: string) => boolean;
  onGrid: (rows: number, cols: number) => void;
};

function Row({ it, run, checks, disabled, onGrid, depth, inline }: { it: MI } & Props & { depth: number; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<[number, number]>([0, 0]);
  const timer = useRef<number | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  // Flyouts are fixed-position so the scrolling parent menu cannot clip them; flip left or up when there is no room.
  useLayoutEffect(() => {
    const w = wrapRef.current, el = subRef.current;
    if (!open || inline || !w || !el) return;
    const r = w.getBoundingClientRect(), sw = el.offsetWidth, sh = el.offsetHeight;
    let left = r.right - 4;
    if (left + sw > window.innerWidth - 8) left = Math.max(8, r.left - sw + 4);
    el.style.left = `${left}px`;
    el.style.top = `${Math.max(8, Math.min(r.top - 7, window.innerHeight - sh - 8))}px`;
  }, [open, inline]);
  if (it.sep) return <hr className="dx-msep" />;
  if (it.grid) {
    return (
      <div className="dx-grid" role="group" aria-label={tr('Table size')}>
        <div className="dx-grid-cells" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }} onMouseLeave={() => setHover([0, 0])}>
          {Array.from({ length: 64 }, (_, i) => { const r = Math.floor(i / 8) + 1, c = (i % 8) + 1; return (
            <button key={i} type="button" className={r <= hover[0] && c <= hover[1] ? 'on' : ''} aria-label={tr('{rows} by {cols} table', { rows: r, cols: c })}
              onMouseEnter={() => setHover([r, c])} onFocus={() => setHover([r, c])} onClick={() => onGrid(r, c)} />
          ); })}
        </div>
        <small>{hover[0] ? tr('{rows} × {cols}', { rows: hover[0], cols: hover[1] }) : tr('Choose a size')}</small>
      </div>
    );
  }
  const Ic = it.icon ? ICONS[it.icon] : undefined;
  const off = !!it.id && disabled(it.id);
  const on = it.check ? !!checks[it.check] : false;
  if (it.sub) {
    return (
      <div className="dx-m-wrap" ref={wrapRef} onMouseEnter={() => { if (inline) return; window.clearTimeout(timer.current); setOpen(true); }} onMouseLeave={() => { if (inline) return; timer.current = window.setTimeout(() => setOpen(false), 140); }}>
        <button type="button" role="menuitem" aria-haspopup="true" aria-expanded={open} className="dx-mi" onClick={() => setOpen((o) => !o)}>
          <span className="ic">{Ic ? <Ic aria-hidden /> : null}</span><span className="lb">{tr(it.label)}</span><ChevronRight className="chev" aria-hidden="true" />
        </button>
        {open && (
          <div className={`dx-menu sub${inline ? ' inl' : ''}`} role="menu" ref={subRef}>
            {it.sub.map((s, i) => <Row key={i} it={s} run={run} checks={checks} disabled={disabled} onGrid={onGrid} depth={depth + 1} inline={inline} />)}
          </div>
        )}
      </div>
    );
  }
  return (
    <button type="button" role="menuitem" className={`dx-mi${off ? ' off' : ''}`} aria-disabled={off || undefined} aria-checked={it.check ? on : undefined}
      onClick={() => { if (!off && it.id) run(it.id); }}>
      <span className="ic">{it.check ? (on ? <Check aria-hidden /> : null) : Ic ? <Ic aria-hidden /> : null}</span>
      <span className="lb">{tr(it.label)}{it.hint && <small>{tr(it.hint)}</small>}</span>
      {it.badge && <span className="bd">{tr(it.badge)}</span>}
      {it.key && <kbd>{it.key}</kbd>}
    </button>
  );
}

/** File Edit View Insert Format Tools Extensions Help. Hover moves between menus once one is open. */
export default function MenuBar(props: Props & { searchOpen: boolean; onSearch: () => void; inline?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);
  useDismiss(open !== null, close, wrap);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (open === null) return;
      const i = MENUS.findIndex((m) => m.id === open);
      if (e.key === 'ArrowRight' && !(e.target as HTMLElement).closest('.dx-menu.sub')) { e.preventDefault(); setOpen(MENUS[(i + 1) % MENUS.length].id); }
      if (e.key === 'ArrowLeft' && !(e.target as HTMLElement).closest('.dx-menu.sub')) { e.preventDefault(); setOpen(MENUS[(i + MENUS.length - 1) % MENUS.length].id); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = Array.from(wrap.current?.querySelectorAll<HTMLElement>('.dx-menu:not(.sub) > .dx-mi, .dx-menu:not(.sub) > .dx-m-wrap > .dx-mi') ?? []);
        const at = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);

  const runAndClose = (id: string, arg?: string) => { setOpen(null); props.run(id, arg); };
  const gridPick = (r: number, c: number) => { setOpen(null); props.onGrid(r, c); };

  if (props.inline) {
    return (
      <div className="dx-acc" ref={wrap}>
        {MENUS.map((m) => (
          <div key={m.id} className="dx-acc-i">
            <button type="button" className="dx-acc-t" aria-expanded={open === m.id} onClick={() => setOpen(open === m.id ? null : m.id)}>{tr(m.label)}<ChevronRight aria-hidden="true" /></button>
            {open === m.id && <div className="dx-menu inl" role="menu">{m.items.map((it, i) => <Row key={i} it={it} run={props.run} checks={props.checks} disabled={props.disabled} onGrid={props.onGrid} depth={0} inline />)}</div>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dx-menubar" role="menubar" aria-label={tr('Menu')} ref={wrap} onMouseDown={(e) => { if (!(e.target as HTMLElement).closest('input')) e.preventDefault(); }}>
      {MENUS.map((m) => (
        <div key={m.id} className="dx-mtop">
          <button type="button" role="menuitem" className="dx-mt" aria-haspopup="true" aria-expanded={open === m.id} data-open={open === m.id ? '' : undefined}
            onClick={() => setOpen(open === m.id ? null : m.id)} onMouseEnter={() => open !== null && setOpen(m.id)}>{tr(m.label)}</button>
          {open === m.id && (
            <div className="dx-menu" role="menu" aria-label={tr(m.label)}>
              {m.items.map((it, i) => <Row key={i} it={it} run={runAndClose} checks={props.checks} disabled={props.disabled} onGrid={gridPick} depth={0} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
