'use client';

import {
  ArrowLeft, BadgeCheck, Bold, Check, ChevronLeft, ChevronRight, FileText, FolderInput, Heading1, Heading2, Heading3, Highlighter, Italic, Link2, List, ListChecks, ListOrdered, Menu as MenuIcon, MessageSquare, MessageSquarePlus,
  Minus, MoreHorizontal, Printer, Send, Share2, Sparkles, Split, Star, Store, Table2, Underline, X, ZoomIn, ZoomOut, QrCode, Image as ImageIcon, Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LangMenu from '@/components/LangMenu';
import ThemeToggle from '@/components/ThemeToggle';
import SendToPrinter from '@/components/editor/SendToPrinter';
import { PRINTERS, naira, priceOf } from '@/components/editor/data';
import { useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';
import { asset } from '@/lib/asset';
import {
  AI_ACTIONS, DOC_SIZES, FOLDERS, PEOPLE, RECENT, SEED_COMMENTS, TEMPLATE_LIST, blankHtml, blockHtml, startHtml, templateHtml,
} from './content';
import {
  ConfirmDialog, DetailsDialog, FindBar, HeaderFooterDialog, ImageUrlDialog, LinkDialog, MenuSearchDialog, MoveDialog, OpenDialog, PageSetupDialog, ReviewDialog, ShareDialog, ShortcutsDialog,
  SymbolsDialog, VersionsDialog, WordCountDialog, type PageSettings,
} from './Dialogs';
import {
  NO_FMT, changeCase, clearFormatting, download, elOf, esc, makeChecklist, qrSvg, readFormat, selectedBlocks, setFontSize, setLineSpacing, setParaSpace, setStyle, tableHtml, tableOp, toMarkdown,
} from './engine';
import MenuBar from './MenuBar';
import { FONTS, SIZES } from './menus';
import Ruler from './Ruler';
import Toolbar from './Toolbar';
import { Dialog } from './ui';
import '@/components/editor/editor.css';
import './docs.css';

type Mode = 'edit' | 'suggest' | 'view';
type Pane = 'comments' | 'ai' | 'print';
type Cmt = { id: string; who: string; text: string; when: string; done: boolean; quote?: string };
const DEFAULT_SET: PageSettings = { paper: 'a4', landscape: false, top: 96, bottom: 96, left: 96, right: 96, color: '#ffffff', cols: 1 };
const sizeOf = (s: PageSettings) => { const d = DOC_SIZES.find((x) => x.id === s.paper) ?? DOC_SIZES[0]; return s.landscape ? { w: d.h, h: d.w } : { w: d.w, h: d.h }; };

export default function DocsEditor() {
  const { setLang, lang } = useLang(); // also re-renders everything when the language changes
  const ed = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const toolWrap = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const lastRange = useRef<Range | null>(null);
  const modeRef = useRef<Mode>('edit');
  const fileIn = useRef<HTMLInputElement>(null);
  const toastT = useRef<number | undefined>(undefined);
  const saveT = useRef<number | undefined>(undefined);
  const recog = useRef<{ stop: () => void } | null>(null);

  const [name, setName] = useState(() => tr('Project proposal'));
  const [starred, setStarred] = useState(false);
  const [saved, setSaved] = useState<'saved' | 'saving'>('saved');
  const [set, setSet] = useState<PageSettings>(DEFAULT_SET);
  const [hf, setHf] = useState({ header: '', footer: '', numbers: 'footer' as 'off' | 'footer' | 'header' });
  const [zoomSel, setZoomSel] = useState<number | 'auto'>('auto');
  const [stageW, setStageW] = useState(1000);
  const [toolW, setToolW] = useState(1200);
  const [rootW, setRootW] = useState(1400);
  const [flags, setFlags] = useState({ ruler: true, sidebar: true, dividers: true, hidden: false, compact: false, spell: true, offline: false });
  const [mode, setMode] = useState<Mode>('edit');
  const [dlg, setDlg] = useState<string | null>(null);
  const [dlgData, setDlgData] = useState<Record<string, string>>({});
  const [find, setFind] = useState<null | 'find' | 'replace'>(null);
  const [pane, setPane] = useState<Pane | null>(null);
  const [tabs, setTabs] = useState([{ id: 't1', name: tr('Tab 1'), html: '' }]);
  const [tab, setTab] = useState('t1');
  const [invited, setInvited] = useState<{ email: string; role: string }[]>([]);
  const [comments, setComments] = useState<Cmt[]>(() => SEED_COMMENTS.map((c) => ({ ...c })));
  const [draft, setDraft] = useState<{ quote: string; text: string } | null>(null);
  const [ai, setAi] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [tick, setTick] = useState(0);
  const [fmt, setFmt] = useState(NO_FMT);
  const [selText, setSelText] = useState('');
  const [paint, setPaint] = useState<null | typeof NO_FMT>(null);
  const [colors, setColors] = useState({ text: '#000000', hi: '#fde68a' });
  const [bar, setBar] = useState<{ x: number; y: number } | null>(null);
  const [slash, setSlash] = useState<{ x: number; y: number } | null>(null);
  const [pages, setPages] = useState(1);
  const [sendOpen, setSendOpen] = useState(false);
  const [readyOpen, setReadyOpen] = useState(false);
  const [phoneMenu, setPhoneMenu] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [side, setSide] = useState(false);
  const [trashed, setTrashed] = useState(false);
  const [listening, setListening] = useState(false);
  const [curPage, setCurPage] = useState(1);

  const say = useCallback((t: string) => { setToast(t); window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => setToast(''), 2600); }, []);
  const touched = useRef(false);
  const bump = useCallback(() => { touched.current = true; setTick((t) => t + 1); }, []);
  const phone = rootW < 900;
  const base = sizeOf(set);
  const mobileFit = phone && zoomSel === 'auto'; // on a phone the text reflows to the screen instead of shrinking the page
  const dim = mobileFit ? { w: Math.max(300, stageW - 16), h: base.h } : base;
  const autoZoom = Math.max(0.35, Math.min(1, (stageW - (phone ? 16 : 56)) / dim.w));
  const zoom = zoomSel === 'auto' ? (mobileFit ? 1 : autoZoom) : zoomSel / 100;
  modeRef.current = mode;

  /* ───── measure the window, the stage and the toolbar ───── */
  useEffect(() => {
    const obs: ResizeObserver[] = [];
    const watch = (el: HTMLElement | null, fn: (w: number) => void) => { if (!el) return; const o = new ResizeObserver(() => fn(el.clientWidth)); o.observe(el); fn(el.clientWidth); obs.push(o); };
    watch(root.current, setRootW); watch(stage.current, setStageW); watch(toolWrap.current, setToolW);
    return () => obs.forEach((o) => o.disconnect());
  }, [flags.compact, flags.sidebar, pane, phone]);

  /* ───── load the starting document once ───── */
  // The sample document follows the language until the person edits it.
  useEffect(() => {
    if (!ed.current || touched.current) return;
    ed.current.innerHTML = startHtml();
    setName(tr('Project proposal'));
    setTabs((t) => t.map((x, i) => (i === 0 && x.id === 't1' ? { ...x, name: tr('Tab 1') } : x)));
    setTick((t) => t + 1);
  }, [lang]);

  /* ───── selection: remember it, read the format, place the floating bar ───── */
  useEffect(() => {
    const onSel = () => {
      const s = document.getSelection(); const e = ed.current;
      if (!s || !e || !s.rangeCount || !e.contains(s.anchorNode)) { setBar(null); return; }
      lastRange.current = s.getRangeAt(0).cloneRange();
      setFmt(readFormat(e, FONTS));
      setSelText(s.isCollapsed ? '' : s.toString());
      if (s.isCollapsed || modeRef.current === 'view') { setBar(null); return; }
      const r = s.getRangeAt(0).getBoundingClientRect();
      if (!r.width && !r.height) { setBar(null); return; }
      setBar({ x: Math.max(150, Math.min(window.innerWidth - 150, r.left + r.width / 2)), y: Math.max(8, r.top - 52) });
    };
    document.addEventListener('selectionchange', onSel);
    const hide = () => setBar(null);
    stage.current?.addEventListener('scroll', hide, { passive: true });
    const st = stage.current;
    return () => { document.removeEventListener('selectionchange', onSel); st?.removeEventListener('scroll', hide); };
  }, []);

  const focusEd = useCallback(() => {
    const e = ed.current; if (!e) return;
    if (document.activeElement !== e) {
      e.focus({ preventScroll: true });
      const s = document.getSelection();
      if (lastRange.current && s) { s.removeAllRanges(); s.addRange(lastRange.current); }
    }
  }, []);
  const ex = useCallback((cmd: string, val?: string, css = false) => {
    focusEd();
    if (css) document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(cmd, false, val);
    if (css) document.execCommand('styleWithCSS', false, 'false');
    bump();
  }, [focusEd, bump]);
  const insertHtml = useCallback((html: string) => { focusEd(); document.execCommand('insertHTML', false, html); bump(); }, [focusEd, bump]);

  useEffect(() => { const el = ed.current; if (el && document.activeElement === el) setFmt(readFormat(el, FONTS)); }, [tick]);

  /* ───── page count, saved state, headings, words ───── */
  useEffect(() => {
    const e = ed.current; if (!e) return;
    const measure = () => setPages(Math.max(1, Math.ceil((e.offsetHeight - 2) / dim.h)));
    measure();
    const o = new ResizeObserver(measure); o.observe(e);
    return () => o.disconnect();
  }, [dim.h, tick]);
  useEffect(() => {
    if (tick === 0) return;
    setSaved('saving'); window.clearTimeout(saveT.current); saveT.current = window.setTimeout(() => setSaved('saved'), 900);
  }, [tick]);
  useEffect(() => {
    const st = stage.current; const e = ed.current; if (!st || !e) return;
    const f = () => setCurPage(Math.min(pages, Math.max(1, Math.floor((st.scrollTop / zoom + st.clientHeight / zoom / 2 - e.offsetTop) / dim.h) + 1)));
    f(); st.addEventListener('scroll', f, { passive: true });
    return () => st.removeEventListener('scroll', f);
  }, [pages, zoom, dim.h]);
  const text = ed.current?.innerText ?? '';
  const words = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const heads = useMemo(() => (ed.current ? Array.from(ed.current.querySelectorAll('h1,h2,h3,.dx-title')).map((h, i) => ({ i, t: h.textContent ?? '', l: h.classList.contains('dx-title') ? 'T' : h.tagName })) : []), [tick, tab]); // eslint-disable-line react-hooks/exhaustive-deps
  const problems = useMemo(() => {
    const out: { id: string; ok: boolean; label: string; detail?: string; fix?: () => void }[] = [];
    out.push({ id: 'size', ok: true, label: tr('Page size is {size}', { size: tr(DOC_SIZES.find((d) => d.id === set.paper)?.label ?? 'A4') }) });
    const small = Math.min(set.top, set.bottom, set.left, set.right) < 48;
    out.push({ id: 'margins', ok: !small, label: small ? tr('Margins are under 12 mm') : tr('Margins are safe to print'), detail: small ? tr('Printers may clip text this close to the edge.') : undefined, fix: small ? () => setSet((s) => ({ ...s, top: 96, bottom: 96, left: 96, right: 96 })) : undefined });
    out.push({ id: 'empty', ok: words > 0, label: words > 0 ? tr('The document has content') : tr('The document is empty') });
    out.push({ id: 'fonts', ok: true, label: tr('Fonts are embedded') });
    return out;
  }, [set, words]);
  const bad = problems.filter((p) => !p.ok).length;

  /* ───── tabs ───── */
  const switchTab = (id: string) => {
    const e = ed.current; if (!e || id === tab) return;
    const cur = e.innerHTML;
    setTabs((t) => t.map((x) => (x.id === tab ? { ...x, html: cur } : x)));
    const next = tabs.find((x) => x.id === id);
    e.innerHTML = next?.html || blankHtml();
    setTab(id); bump();
  };
  const addTab = () => {
    const e = ed.current; if (!e) return;
    const cur = e.innerHTML;
    const id = 't' + (tabs.length + 1) + Math.random().toString(36).slice(2, 4);
    setTabs((t) => [...t.map((x) => (x.id === tab ? { ...x, html: cur } : x)), { id, name: tr('Tab {n}', { n: tabs.length + 1 }), html: blankHtml() }]);
    e.innerHTML = blankHtml(); setTab(id); bump();
  };

  /* ───── actions ───── */
  const loadHtml = (h: string) => { if (ed.current) { ed.current.innerHTML = h; bump(); } };
  const setZoom = (z: number | 'auto') => setZoomSel(z);
  const flag = (k: keyof typeof flags) => setFlags((f) => ({ ...f, [k]: !f[k] }));
  const preview = () => say(tr('This works in the full editor. It is a preview here.'));

  const act = useCallback((id: string, arg?: string) => {
    const e = ed.current;
    if (!e) return;
    const k = id;
    if (k.startsWith('zoom-')) { const v = k.slice(5); setZoom(v === 'fit' ? 'auto' : Number(v)); return; }
    if (k.startsWith('mode-')) { setMode(k.slice(5) as Mode); return; }
    if (k.startsWith('lang-')) { setLang(k.slice(5) as never); return; }
    if (k.startsWith('tl-')) { say(tr('A translated copy is being prepared in your dashboard.')); return; }
    if (k.startsWith('st-')) { focusEd(); setStyle(e, k.slice(3)); bump(); return; }
    if (k.startsWith('ls-')) { focusEd(); setLineSpacing(e, ({ '1': '1', '115': '1.15', '15': '1.5', '2': '2' } as Record<string, string>)[k.slice(3)] ?? '1.15'); bump(); return; }
    if (k.startsWith('col-')) { setSet((s) => ({ ...s, cols: Number(k.slice(4)) })); return; }
    if (k.startsWith('tb-')) { focusEd(); if (!tableOp(k.slice(3), e)) say(tr('Click inside a table first.')); bump(); return; }
    if (k.startsWith('dl-')) {
      const fileName = (name || 'document').replace(/[^\w\- ]+/g, '').trim() || 'document';
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)}</title></head><body>${e.innerHTML}</body></html>`;
      if (k === 'dl-pdf') { window.print(); return; }
      if (k === 'dl-doc') download(`${fileName}.doc`, 'application/msword', html);
      if (k === 'dl-txt') download(`${fileName}.txt`, 'text/plain', e.innerText);
      if (k === 'dl-html') download(`${fileName}.html`, 'text/html', html);
      if (k === 'dl-md') download(`${fileName}.md`, 'text/markdown', toMarkdown(e));
      say(tr('Downloaded')); return;
    }
    if (k.startsWith('bb-')) { insertHtml(blockHtml(k.slice(3))); return; }
    if (k.startsWith('chart-')) { insertHtml(chartHtml(k.slice(6))); return; }
    if (k.startsWith('ext-')) { if (k === 'ext-market') setSendOpen(true); else preview(); return; }
    if (k.startsWith('chip-')) { setDlg(k); return; }

    switch (k) {
      case 'new': setDlg('new'); break;
      case 'open': setDlg('open'); break;
      case 'copy-doc': setName((n) => tr('Copy of {name}', { name: n })); say(tr('A copy was made in your dashboard.')); break;
      case 'share': setDlg('share'); break;
      case 'email': window.location.href = `mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(e.innerText.slice(0, 1500))}`; break;
      case 'send': setSendOpen(true); break;
      case 'rename': (document.getElementById('dx-name') as HTMLInputElement | null)?.focus(); (document.getElementById('dx-name') as HTMLInputElement | null)?.select(); break;
      case 'move': setDlg('move'); break;
      case 'trash': setDlg('trash'); break;
      case 'versions': setDlg('versions'); break;
      case 'offline': flag('offline'); say(flags.offline ? tr('Offline access is off.') : tr('This document is available offline.')); break;
      case 'details': setDlg('details'); break;
      case 'page-setup': setDlg('page'); break;
      case 'print': window.print(); break;
      case 'undo': ex('undo'); break;
      case 'redo': ex('redo'); break;
      case 'cut': ex('cut'); break;
      case 'copy': ex('copy'); say(tr('Copied')); break;
      case 'paste': navigator.clipboard?.readText().then((t) => { focusEd(); document.execCommand('insertText', false, t); bump(); }).catch(() => say(tr('Press Ctrl+V to paste. Your browser blocks the menu from reading the clipboard.'))); break;
      case 'paste-plain': navigator.clipboard?.readText().then((t) => { focusEd(); document.execCommand('insertText', false, t); bump(); }).catch(() => say(tr('Press Ctrl+Shift+V to paste without formatting.'))); break;
      case 'select-all': focusEd(); document.execCommand('selectAll'); break;
      case 'delete': ex('delete'); break;
      case 'find': setFind('find'); break;
      case 'replace': setFind('replace'); break;
      case 'toggle-ruler': flag('ruler'); break;
      case 'toggle-outline': flag('sidebar'); break;
      case 'toggle-pagebreaks': flag('dividers'); break;
      case 'toggle-hidden': flag('hidden'); break;
      case 'toggle-toolbar': flag('compact'); break;
      case 'fullscreen': if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); break;
      case 'img-upload': fileIn.current?.click(); break;
      case 'img-url': setDlg('imgurl'); break;
      case 'img-brand': insertHtml(`<img src="${placeholderImg('#0B7A7F', '#DAA019', 'Ifiok')}" alt="${esc(tr('Brand logo'))}" style="max-width:100%;width:180px">`); break;
      case 'img-design': insertHtml(`<img src="${placeholderImg('#1F3A8A', '#14A5AB', tr('Flyer'))}" alt="${esc(tr('Design from Ifiok Designs'))}" style="max-width:100%;width:320px">`); break;
      case 'esign': say(tr('Signing opens the PDF tools in the full editor.')); break;
      case 'link': { focusEd(); const s = document.getSelection(); const a = elOf(s?.anchorNode ?? null)?.closest('a'); setDlgData({ text: s?.toString() ?? '', url: a?.getAttribute('href') ?? '' }); setDlg('link'); break; }
      case 'drawing': preview(); break;
      case 'qr': insertHtml(`<span class="dx-qr" contenteditable="false">${qrSvg(name + Date.now())}</span>&nbsp;`); say(tr('QR code added. The real one links to a tracked page.')); break;
      case 'symbols': setDlgData({ group: 'ng' }); setDlg('symbols'); break;
      case 'emoji': setDlgData({ group: 'emo' }); setDlg('symbols'); break;
      case 'hr': ex('insertHorizontalRule'); break;
      case 'pagebreak': {
        focusEd(); const b = selectedBlocks(e)[0] ?? (e.lastElementChild as HTMLElement | null);
        const y = (b ? b.offsetTop + b.offsetHeight : e.offsetHeight);
        const h = dim.h - (y % dim.h) + set.top;
        insertHtml(`<div class="dx-pb" contenteditable="false" style="height:${Math.round(h)}px"><span>${esc(tr('Page break'))}</span></div><p><br></p>`); break;
      }
      case 'colbreak': preview(); break;
      case 'comment': {
        focusEd(); const q = document.getSelection()?.toString() ?? '';
        setDraft({ quote: q, text: '' }); setPane('comments'); break;
      }
      case 'footnote': {
        focusEd();
        const n = e.querySelectorAll('.dx-fn-ref').length + 1;
        insertHtml(`<sup class="dx-fn-ref">${n}</sup>`);
        if (!e.querySelector('.dx-fn-rule')) e.insertAdjacentHTML('beforeend', '<hr class="dx-fn-rule">');
        e.insertAdjacentHTML('beforeend', `<p class="dx-fn"><sup>${n}</sup> ${esc(tr('Footnote text'))}</p>`); bump(); break;
      }
      case 'equation': insertHtml('<span class="dx-eq">E = mc²</span>&nbsp;'); break;
      case 'bookmark': insertHtml(`<span class="dx-bm" contenteditable="false">${esc(tr('Bookmark {n}', { n: e.querySelectorAll('.dx-bm').length + 1 }))}</span>&nbsp;`); break;
      case 'toc': {
        const hs = Array.from(e.querySelectorAll('h1,h2,h3'));
        insertHtml(`<div class="dx-toc" contenteditable="false"><p class="t">${esc(tr('Table of contents'))}</p><ul>${hs.map((h) => `<li class="${h.tagName.toLowerCase()}">${esc(h.textContent ?? '')}</li>`).join('') || `<li>${esc(tr('Add headings and they appear here.'))}</li>`}</ul></div><p><br></p>`); break;
      }
      case 'hf': setDlg('hf'); break;
      case 'pn-footer': setHf((h) => ({ ...h, numbers: 'footer' })); break;
      case 'pn-header': setHf((h) => ({ ...h, numbers: 'header' })); break;
      case 'pn-off': setHf((h) => ({ ...h, numbers: 'off' })); break;
      case 'bold': ex('bold'); break;
      case 'italic': ex('italic'); break;
      case 'underline': ex('underline'); break;
      case 'strike': ex('strikeThrough'); break;
      case 'sup': ex('superscript'); break;
      case 'sub': ex('subscript'); break;
      case 'size': focusEd(); setFontSize(e, Number(arg)); bump(); break;
      case 'size-up': case 'size-down': { const i = SIZES.findIndex((n) => n >= fmt.size); const next = k === 'size-up' ? SIZES[Math.min(SIZES.length - 1, (SIZES[i] === fmt.size ? i : i - 1) + 1)] : SIZES[Math.max(0, i - 1)]; focusEd(); setFontSize(e, next); bump(); break; }
      case 'case-lower': focusEd(); changeCase('lower'); bump(); break;
      case 'case-upper': focusEd(); changeCase('upper'); bump(); break;
      case 'case-title': focusEd(); changeCase('title'); bump(); break;
      case 'font': ex('fontName', arg, true); break;
      case 'color': setColors((c) => ({ ...c, text: arg ?? '#000' })); ex('foreColor', arg, true); break;
      case 'highlight': setColors((c) => ({ ...c, hi: arg === 'transparent' ? '#ffffff' : arg ?? '#fde68a' })); ex('hiliteColor', arg, true); break;
      case 'al-left': ex('justifyLeft'); break;
      case 'al-center': ex('justifyCenter'); break;
      case 'al-right': ex('justifyRight'); break;
      case 'al-justify': ex('justifyFull'); break;
      case 'indent': ex('indent'); break;
      case 'outdent': ex('outdent'); break;
      case 'ps-before': focusEd(); setParaSpace(e, 'before'); bump(); break;
      case 'ps-after': focusEd(); setParaSpace(e, 'after'); bump(); break;
      case 'ul': ex('insertUnorderedList'); break;
      case 'ol': ex('insertOrderedList'); break;
      case 'check': focusEd(); makeChecklist(e); bump(); break;
      case 'orientation': setSet((s) => ({ ...s, landscape: !s.landscape })); break;
      case 'clear-format': focusEd(); clearFormatting(e); bump(); break;
      case 'spell': flag('spell'); break;
      case 'wordcount': setDlg('words'); break;
      case 'review': setDlg('review'); break;
      case 'compare': preview(); break;
      case 'ask': setPane('ai'); break;
      case 'dictionary': say(selText ? tr('Looking up "{word}" in the dictionary…', { word: selText.trim().slice(0, 30) }) : tr('Select a word to look it up.')); break;
      case 'voice': voice(); break;
      case 'notify': case 'access': case 'help-docs': case 'help-learn': case 'help-news': case 'report': preview(); break;
      case 'search-menus': setDlg('menus'); break;
      case 'shortcuts': setDlg('shortcuts'); break;
      case 'paint': if (paint) setPaint(null); else { setPaint({ ...fmt }); say(tr('Paint format: now select the text to copy the style to.')); } break;
      case 'more-fonts': window.open(asset('/design/'), '_blank'); break;
      default: break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, flags, fmt, paint, selText, set, dim.h, focusEd, ex, insertHtml, bump, say, setLang]);

  const voice = () => {
    type SR = { new (): { lang: string; continuous: boolean; interimResults: boolean; onresult: (e: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void; onend: () => void; start: () => void; stop: () => void } };
    const W = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const C = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!C) { say(tr('Voice typing is not available in this browser.')); return; }
    if (recog.current) { recog.current.stop(); recog.current = null; setListening(false); return; }
    const r = new C(); r.lang = document.documentElement.lang || 'en'; r.continuous = true; r.interimResults = false;
    r.onresult = (ev) => { for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) { focusEd(); document.execCommand('insertText', false, ev.results[i][0].transcript + ' '); bump(); } };
    r.onend = () => { recog.current = null; setListening(false); };
    recog.current = r; setListening(true); r.start(); say(tr('Listening… speak now.'));
  };

  const actRef = useRef(act); actRef.current = act;

  /* ───── keyboard shortcuts that work anywhere on the page ───── */
  useEffect(() => {
    const key = (ev: KeyboardEvent) => {
      const c = ev.ctrlKey || ev.metaKey, k = ev.key.toLowerCase();
      const go = (id: string, arg?: string) => { ev.preventDefault(); actRef.current(id, arg); };
      if (ev.altKey && !c && ev.key === '/') return go('search-menus');
      if (c && !ev.shiftKey && !ev.altKey && ev.key === '/') return go('shortcuts');
      if (c && !ev.shiftKey && !ev.altKey && k === 'f') return go('find');
      if (c && !ev.shiftKey && !ev.altKey && k === 'h') return go('replace');
      if (c && !ev.shiftKey && !ev.altKey && k === 'k') return go('link');
      if (c && !ev.shiftKey && !ev.altKey && k === 'p') return go('print');
      if (c && !ev.shiftKey && !ev.altKey && k === 'o') return go('open');
      if (c && ev.altKey && k === 'm') return go('comment');
      if (c && ev.altKey && k === 'f') return go('footnote');
      if (c && ev.altKey && k === 's') return go('share');
      if (c && ev.shiftKey && k === 'c') return go('wordcount');
      if (c && ev.shiftKey && k === 's') return go('voice');
      if (c && ev.key === '\\') return go('clear-format');
      if (c && ev.key === 'Enter') return go('pagebreak');
      if (c && ev.altKey && '0123'.includes(ev.key) && ev.key) return go(ev.key === '0' ? 'st-p' : `st-h${ev.key}`);
      if (c && ev.shiftKey && ev.key === '8') return go('ul');
      if (c && ev.shiftKey && ev.key === '7') return go('ol');
      if (c && ev.shiftKey && ev.key === '9') return go('check');
      if (c && ev.shiftKey && k === 'l') return go('al-left');
      if (c && ev.shiftKey && k === 'e') return go('al-center');
      if (c && ev.shiftKey && k === 'r') return go('al-right');
      if (c && ev.shiftKey && k === 'j') return go('al-justify');
      if (c && ev.key === ']') return go('indent');
      if (c && ev.key === '[') return go('outdent');
      if (ev.key === 'F2' && !(ev.target as HTMLElement).closest('input')) return go('rename');
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  /* ───── Suggesting mode: typing becomes an insertion mark, deleting becomes a strike-through ───── */
  useEffect(() => {
    const e = ed.current; if (!e) return;
    const onBefore = (ev: Event) => {
      if (modeRef.current !== 'suggest') return;
      const ie = ev as InputEvent; const s = document.getSelection(); if (!s || !s.rangeCount) return;
      const mine = elOf(s.anchorNode)?.closest('ins.dx-ins');
      if (ie.inputType === 'insertText' && ie.data && !mine) {
        ev.preventDefault();
        if (!s.isCollapsed) wrapDel(s);
        const r = s.getRangeAt(0); const ins = document.createElement('ins'); ins.className = 'dx-ins'; const t = document.createTextNode(ie.data); ins.appendChild(t);
        r.collapse(false); r.insertNode(ins); const nr = document.createRange(); nr.setStart(t, t.length); nr.collapse(true); s.removeAllRanges(); s.addRange(nr); bump();
      } else if (ie.inputType.startsWith('delete') && !mine) {
        ev.preventDefault();
        if (s.isCollapsed) (s as unknown as { modify: (a: string, d: string, g: string) => void }).modify('extend', ie.inputType.includes('Forward') ? 'forward' : 'backward', 'character');
        wrapDel(s); bump();
      }
    };
    const wrapDel = (s: Selection) => {
      const r = s.getRangeAt(0); if (r.collapsed) return;
      const d = document.createElement('del'); d.className = 'dx-del';
      try { r.surroundContents(d); } catch { d.appendChild(r.extractContents()); r.insertNode(d); }
      const nr = document.createRange(); nr.setStartAfter(d); nr.collapse(true); s.removeAllRanges(); s.addRange(nr);
    };
    e.addEventListener('beforeinput', onBefore);
    return () => e.removeEventListener('beforeinput', onBefore);
  }, [bump]);

  /* ───── "/" menu ───── */
  const onKeyUp = () => {
    const s = document.getSelection(); const n = s?.anchorNode;
    const block = n && (n.nodeType === 3 ? n.parentElement : (n as HTMLElement));
    if (s && s.isCollapsed && block && block.textContent === '/' && ed.current?.contains(block)) {
      const r = (block as HTMLElement).getBoundingClientRect(); const h = 330;
      setSlash({ x: Math.max(8, Math.min(r.left, window.innerWidth - 240)), y: r.bottom + 6 + h > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6 });
    } else setSlash(null);
  };
  const pickSlash = (fn: () => void) => { document.execCommand('delete'); fn(); setSlash(null); };

  /* paint format: apply the copied style on the next selection */
  const onMouseUp = () => {
    if (!paint || !ed.current) return;
    const s = document.getSelection(); if (!s || s.isCollapsed) return;
    const cur = readFormat(ed.current, FONTS);
    if (paint.bold !== cur.bold) document.execCommand('bold');
    if (paint.italic !== cur.italic) document.execCommand('italic');
    if (paint.underline !== cur.underline) document.execCommand('underline');
    document.execCommand('styleWithCSS', false, 'true'); document.execCommand('foreColor', false, paint.color); document.execCommand('styleWithCSS', false, 'false');
    const f = FONTS.find((x) => x.family === paint.font); if (f) ex('fontName', f.stack, true);
    setFontSize(ed.current, paint.size); setPaint(null); bump();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = () => insertHtml(`<img src="${rd.result as string}" alt="${esc(f.name)}" style="max-width:100%">`); rd.readAsDataURL(f); e.target.value = '';
  };

  /* ───── comments ───── */
  const addComment = () => {
    if (!draft || !draft.text.trim()) return;
    const id = 'n' + Date.now();
    const s = document.getSelection();
    if (lastRange.current && s && !lastRange.current.collapsed && ed.current) {
      s.removeAllRanges(); s.addRange(lastRange.current);
      try { const sp = document.createElement('span'); sp.className = 'dx-cm'; sp.dataset.cid = id; lastRange.current.surroundContents(sp); } catch { /* spans several blocks: keep the comment unanchored */ }
    }
    setComments((l) => [...l, { id, who: tr('You'), text: draft.text.trim(), when: tr('now'), done: false, quote: draft.quote.slice(0, 80) }]);
    setDraft(null); bump();
  };

  const stateChecks: Record<string, boolean> = {
    offline: flags.offline, ruler: flags.ruler, sidebar: flags.sidebar, dividers: flags.dividers, hidden: flags.hidden, compact: flags.compact, spell: flags.spell,
    'mode-edit': mode === 'edit', 'mode-suggest': mode === 'suggest', 'mode-view': mode === 'view',
  };
  const disabled = (id: string) => id.startsWith('tb-') && !fmt.inTable;
  const onGrid = (r: number, c: number) => insertHtml(tableHtml(r, c));

  const topPrinters = useMemo(() => [...PRINTERS].sort((a, b) => priceOf(a, 10 * pages, 1, 1) - priceOf(b, 10 * pages, 1, 1)).slice(0, 3), [pages]);
  const commentOpen = comments.filter((c) => !c.done).length;

  const paperStyle: React.CSSProperties = { width: dim.w, minHeight: pages * dim.h, background: set.color };
  const sheetStyle: React.CSSProperties = {
    width: dim.w, minHeight: dim.h, padding: mobileFit ? `32px 22px 40px` : `${set.top}px ${set.right}px ${set.bottom}px ${set.left}px`,
    columnCount: set.cols > 1 ? set.cols : undefined, columnGap: set.cols > 1 ? 36 : undefined,
  };
  const phoneHidden = phone ? ' dx-ph' : '';

  return (
    <div className={`ex dx${phoneHidden}${flags.compact ? ' compact' : ''}`} ref={root}>
      <a className="ex-skip" href="#dx-stage">{tr('Skip to the document')}</a>

      {/* ───────── header: file name, menus and the actions ───────── */}
      <header className="dx-head">
        <div className="dx-h1">
          <a className="ex-ib" href={asset('/design/')} aria-label={tr('Back to dashboard')} title={tr('Back to dashboard')}><ArrowLeft aria-hidden="true" /></a>
          <span className="dx-logo" aria-hidden="true"><FileText /></span>
          <div className="dx-titlebox">
            <div className="dx-titlerow">
              <input id="dx-name" value={name} onChange={(e) => setName(e.target.value)} aria-label={tr('File name')} maxLength={80} />
              <button type="button" className="ex-ib sm" aria-pressed={starred} aria-label={starred ? tr('Remove star') : tr('Star this document')} title={tr('Star this document')} onClick={() => setStarred((s) => !s)}><Star aria-hidden="true" className={starred ? 'on' : ''} /></button>
              <button type="button" className="ex-ib sm hide-p" aria-label={tr('Move to folder')} title={tr('Move to folder')} onClick={() => setDlg('move')}><FolderInput aria-hidden="true" /></button>
              <span className="dx-saved" role="status" title={tr('Saved to your Ifiok account')}>{saved === 'saving' ? tr('Saving…') : <><Check aria-hidden="true" />{tr('Saved')}</>}</span>
            </div>
            {!phone ? (
              <MenuBar run={act} checks={stateChecks} disabled={disabled} onGrid={onGrid} searchOpen={dlg === 'menus'} onSearch={() => setDlg('menus')} />
            ) : (
              <button type="button" className="dx-menubtn" aria-expanded={phoneMenu} onClick={() => setPhoneMenu((o) => !o)}><MenuIcon aria-hidden="true" />{tr('Menu')}</button>
            )}
          </div>
        </div>
        <div className="dx-h2">
          <div className="ex-appsw hide-p" role="group" aria-label={tr('Editor')}>
            <a href={asset('/preview/design/')}>{tr('Designs')}</a>
            <a href={asset('/preview/docs/')} aria-current="page">{tr('Docs')}</a>
          </div>
          <button type="button" className="ex-ib hide-p" aria-label={tr('Version history')} title={tr('Version history')} onClick={() => setDlg('versions')}><HistoryIcon /></button>
          <button type="button" className="ex-ib" aria-pressed={pane === 'comments'} aria-label={tr('Comments')} title={tr('Comments')} onClick={() => setPane((p) => (p ? null : 'comments'))}><MessageSquare aria-hidden="true" />{commentOpen > 0 && <b className="dx-badge">{commentOpen}</b>}</button>
          <div className="dx-people hide-p" aria-label={tr('People here now')}><span className="av a">Y</span><span className="av b">T</span>{invited.slice(0, 2).map((m) => <span key={m.email} className="av c">{m.email[0].toUpperCase()}</span>)}</div>
          <button type="button" className="ex-btn p dx-share" onClick={() => setDlg('share')}><Share2 aria-hidden="true" /><span>{tr('Share')}</span></button>
          <button type="button" className="ex-btn gold" onClick={() => setSendOpen(true)}><Send aria-hidden="true" /><span className="long">{tr('Send to printer')}</span><span className="short">{tr('Send')}</span></button>
          <span className="hide-p"><LangMenu className="ex-ib" /></span>
          <span className="hide-p"><ThemeToggle /></span>
          {phone && (
            <div className="ex-pop">
              <button type="button" className="ex-ib" onClick={() => setMoreOpen((o) => !o)} aria-label={tr('More')} aria-expanded={moreOpen}><MoreHorizontal aria-hidden="true" /></button>
              {moreOpen && (
                <div className="ex-card ex-more" role="menu">
                  <a href={asset('/preview/design/')} role="menuitem" style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '0 10px', fontWeight: 600 }}>{tr('Switch to Ifiok Designs')}</a>
                  <div className="ex-more-row"><span>{tr('Language')}</span><LangMenu className="ex-ib" /></div>
                  <div className="ex-more-row"><span>{tr('Theme')}</span><ThemeToggle /></div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {phone && phoneMenu && <PhoneMenu run={(id) => { setPhoneMenu(false); act(id); }} checks={stateChecks} disabled={disabled} onGrid={(r, c) => { setPhoneMenu(false); onGrid(r, c); }} onClose={() => setPhoneMenu(false)} />}

      {/* ───────── formatting toolbar ───────── */}
      {!flags.compact && (
        <div className="dx-toolwrap" ref={toolWrap}>
          <Toolbar fmt={fmt} act={act} zoom={Math.round(zoom * 100)} mode={mode} spell={flags.spell} canUndo size={fmt.size} painting={!!paint} textColor={colors.text} hiColor={colors.hi} width={toolW} />
        </div>
      )}
      {flags.compact && <button type="button" className="dx-expand" onClick={() => flag('compact')} aria-label={tr('Show the menus')} title={tr('Show the menus')}><ChevronRight aria-hidden="true" style={{ transform: 'rotate(90deg)' }} /></button>}

      <div className="dx-body">
        {/* ───────── left: tabs and outline ───────── */}
        {flags.sidebar && (!phone || side) && (
          <aside className="dx-side" aria-label={tr('Document tabs and outline')}>
            <div className="dx-side-h"><button type="button" className="ex-ib sm" onClick={() => (phone ? setSide(false) : flag('sidebar'))} aria-label={tr('Close sidebar')}><ChevronLeft aria-hidden="true" /></button></div>
            <p className="ex-h">{tr('Document tabs')}<button type="button" className="ex-ib sm" onClick={addTab} aria-label={tr('Add a tab')} title={tr('Add a tab')}><PlusIcon /></button></p>
            <ul className="dx-tabs">
              {tabs.map((t) => (
                <li key={t.id}>
                  <button type="button" aria-current={tab === t.id ? 'true' : undefined} onClick={() => { switchTab(t.id); setSide(false); }}><FileText aria-hidden="true" /><span>{t.name}</span></button>
                  {tabs.length > 1 && tab === t.id && <button type="button" className="ex-ib sm x" aria-label={tr('Delete tab')} onClick={() => { const rest = tabs.filter((x) => x.id !== t.id); setTabs(rest); const n = rest[0]; if (ed.current) ed.current.innerHTML = n.html || blankHtml(); setTab(n.id); bump(); }}><X aria-hidden="true" /></button>}
                </li>
              ))}
            </ul>
            <p className="ex-h">{tr('Outline')}</p>
            {heads.length ? (
              <ul className="dx-outline">
                {heads.map((h) => <li key={h.i} className={h.l === 'H2' ? 'l2' : h.l === 'H3' ? 'l3' : h.l === 'T' ? 'lt' : ''}><button type="button" onClick={() => { ed.current?.querySelectorAll('h1,h2,h3,.dx-title')[h.i]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setSide(false); }}>{h.t}</button></li>)}
              </ul>
            ) : <p className="muted">{tr('Headings you add to the document will appear here.')}</p>}
          </aside>
        )}
        {flags.sidebar && phone && side && <div className="dx-scrim-s" onClick={() => setSide(false)} />}

        {/* ───────── the page ───────── */}
        <main className="dx-main" id="dx-stage" ref={stage}>
          {trashed && <div className="dx-trash"><Trash2 aria-hidden="true" /><span>{tr('This document is in the trash.')}</span><button type="button" className="ex-btn" onClick={() => setTrashed(false)}>{tr('Restore')}</button></div>}
          <div className="dx-zoom" style={{ zoom } as React.CSSProperties}>
            {flags.ruler && !phone && <div className="dx-rulerwrap" style={{ width: dim.w }}><Ruler pageW={dim.w} left={set.left} right={set.right} onChange={(l, r) => setSet((s) => ({ ...s, left: l, right: r }))} /></div>}
            <div className={`dx-paper${flags.dividers ? ' div' : ''}${flags.hidden ? ' hid' : ''}`} style={paperStyle}>
              {Array.from({ length: pages }, (_, i) => (
                <div key={i} className="dx-pg" style={{ top: i * dim.h, height: dim.h }} aria-hidden="true">
                  {(hf.header || (hf.numbers === 'header')) && <div className="dx-hdr" style={{ top: Math.max(10, set.top / 2 - 10), left: set.left, right: set.right }}><span>{hf.header}</span><span>{hf.numbers === 'header' ? i + 1 : ''}</span></div>}
                  {(hf.footer || hf.numbers === 'footer') && <div className="dx-ftr" style={{ bottom: Math.max(10, set.bottom / 2 - 10), left: set.left, right: set.right }}><span>{hf.footer}</span><span>{hf.numbers === 'footer' ? i + 1 : ''}</span></div>}
                  {i > 0 && flags.dividers && <div className="dx-pgline"><span>{tr('Page {n}', { n: i + 1 })}</span></div>}
                </div>
              ))}
              <div
                ref={ed} id="dx-doc" className={`dx-sheet${mode === 'suggest' ? ' sug' : ''}`} style={sheetStyle}
                contentEditable={mode !== 'view' && !trashed} suppressContentEditableWarning spellCheck={flags.spell} role="textbox" aria-multiline="true" aria-label={tr('Document')}
                onInput={bump} onKeyUp={onKeyUp} onMouseUp={onMouseUp}
                onKeyDown={(e) => { if (e.key === 'Escape') setSlash(null); }}
                onClick={(e) => {
                  const t = e.target as HTMLElement;
                  const li = t.closest('ul.dx-check > li') as HTMLElement | null;
                  if (li && e.nativeEvent.offsetX < 0 + 4 && li.offsetParent) { /* box is drawn outside the li; handled below */ }
                  if (li && (e.nativeEvent as MouseEvent).clientX < li.getBoundingClientRect().left + 2) { li.classList.toggle('done'); bump(); }
                  const a = t.closest('a') as HTMLAnchorElement | null;
                  if (a && (e.ctrlKey || e.metaKey || mode === 'view')) window.open(a.href, '_blank', 'noopener');
                  const cm = t.closest('.dx-cm') as HTMLElement | null;
                  if (cm?.dataset.cid) { setPane('comments'); document.getElementById('cm-' + cm.dataset.cid)?.scrollIntoView({ block: 'center' }); }
                }}
              />
            </div>
          </div>
        </main>

        {/* ───────── right: comments, Ask Ifiok, print market ───────── */}
        {pane && (
          <aside className="dx-pane" aria-label={tr('Side panel')}>
            <div className="dx-pane-h">
              <div role="tablist" aria-label={tr('Panels')}>
                <button type="button" role="tab" aria-selected={pane === 'comments'} onClick={() => setPane('comments')}><MessageSquare aria-hidden="true" />{tr('Comments')}</button>
                <button type="button" role="tab" aria-selected={pane === 'ai'} onClick={() => setPane('ai')}><Sparkles aria-hidden="true" />{tr('Ask Ifiok')}</button>
                <button type="button" role="tab" aria-selected={pane === 'print'} onClick={() => setPane('print')}><Store aria-hidden="true" />{tr('Print')}</button>
              </div>
              <button type="button" className="ex-ib sm" onClick={() => setPane(null)} aria-label={tr('Close')}><X aria-hidden="true" /></button>
            </div>
            <div className="dx-pane-b">
              {pane === 'comments' && (
                <>
                  {draft && (
                    <div className="dx-cdraft">
                      {draft.quote && <blockquote>{draft.quote.slice(0, 120)}</blockquote>}
                      <textarea autoFocus rows={3} value={draft.text} placeholder={tr('Add a comment')} aria-label={tr('Add a comment')} onChange={(e) => setDraft({ ...draft, text: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addComment(); }} />
                      <div><button type="button" className="ex-btn" onClick={() => setDraft(null)}>{tr('Cancel')}</button><button type="button" className="ex-btn p" disabled={!draft.text.trim()} onClick={addComment}>{tr('Comment')}</button></div>
                    </div>
                  )}
                  <ul className="dx-comments">
                    {comments.map((c) => (
                      <li key={c.id} id={`cm-${c.id}`} className={c.done ? 'done' : ''}>
                        <span className="av">{c.who[0]}</span>
                        <div>
                          <b>{c.who}</b> <small>{tr(c.when)}</small>
                          {c.quote && <blockquote>{c.quote}</blockquote>}
                          <p>{tr(c.text)}</p>
                          <div className="act">
                            <button type="button" onClick={() => setComments((l) => l.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)))}>{c.done ? tr('Reopen') : tr('Resolve')}</button>
                            <button type="button" onClick={() => { setComments((l) => l.filter((x) => x.id !== c.id)); ed.current?.querySelectorAll(`[data-cid="${c.id}"]`).forEach((n) => n.replaceWith(...Array.from(n.childNodes))); bump(); }}>{tr('Delete')}</button>
                          </div>
                        </div>
                      </li>
                    ))}
                    {!comments.length && <li className="hint">{tr('No comments yet. Select some text and press the comment button.')}</li>}
                  </ul>
                </>
              )}
              {pane === 'ai' && (
                <div className="dx-ai">
                  <p className="muted">{selText ? tr('Selected: “{text}”', { text: selText.slice(0, 60) }) : tr('Ask Ifiok to write, shorten, fix or translate your text.')}</p>
                  <div className="dx-chips">{AI_ACTIONS.map((t) => <button key={t} type="button" onClick={() => setAi((l) => [...l, t])}>{tr(t)}</button>)}</div>
                  {ai.map((t, i) => <div key={i} className="dx-bub"><b>{tr(t)}</b><p>{tr('In the full editor Ifiok answers here and can apply the change to your selection. This is a preview.')}</p></div>)}
                  <form className="dx-askbox" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const v = String(f.get('q') ?? '').trim(); if (v) { setAi((l) => [...l, v]); e.currentTarget.reset(); } }}>
                    <input name="q" placeholder={tr('Ask Ifiok anything')} aria-label={tr('Ask Ifiok anything')} /><button className="ex-btn p" type="submit">{tr('Ask')}</button>
                  </form>
                </div>
              )}
              {pane === 'print' && (
                <div className="dx-print">
                  <p className="ex-h">{tr('Print this document')}</p>
                  <dl className="dx-det">
                    <div><dt>{tr('Pages')}</dt><dd>{pages}</dd></div>
                    <div><dt>{tr('Paper size')}</dt><dd>{tr(DOC_SIZES.find((d) => d.id === set.paper)?.label ?? 'A4')}</dd></div>
                    <div><dt>{tr('Status')}</dt><dd>{bad ? tr('{count} to fix', { count: bad }) : tr('Print ready')}</dd></div>
                  </dl>
                  <p className="ex-h">{tr('Verified printers near you')}</p>
                  <ul className="dx-printers">
                    {topPrinters.map((p) => (
                      <li key={p.id}><div><b>{p.shop}</b><small>{p.area} · {tr('{km} km', { km: p.km })} · ★ {p.rating}</small></div><span>{tr('From {price}', { price: naira(priceOf(p, 10 * pages, 1, 1)) })}</span></li>
                    ))}
                  </ul>
                  <p className="muted">{tr('Prices are for 10 copies, loose pages.')}</p>
                  <button type="button" className="ex-btn gold wide" onClick={() => setSendOpen(true)}><Send aria-hidden="true" />{tr('Compare printers and order')}</button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ───────── right rail ───────── */}
        {!phone && (
          <nav className="dx-rail" aria-label={tr('Side tools')}>
            <button type="button" aria-pressed={pane === 'comments'} onClick={() => setPane(pane === 'comments' ? null : 'comments')} aria-label={tr('Comments')} title={tr('Comments')}><MessageSquare aria-hidden="true" /></button>
            <button type="button" aria-pressed={pane === 'ai'} onClick={() => setPane(pane === 'ai' ? null : 'ai')} aria-label={tr('Ask Ifiok')} title={tr('Ask Ifiok')}><Sparkles aria-hidden="true" /></button>
            <button type="button" aria-pressed={pane === 'print'} onClick={() => setPane(pane === 'print' ? null : 'print')} aria-label={tr('Print')} title={tr('Print')}><Store aria-hidden="true" /></button>
            {!flags.sidebar && <button type="button" onClick={() => flag('sidebar')} aria-label={tr('Show document tabs and outline')} title={tr('Show document tabs and outline')}><List aria-hidden="true" /></button>}
          </nav>
        )}
      </div>

      {/* ───────── status bar ───────── */}
      <footer className="dx-status">
        {phone && <button type="button" className="ex-ib sm" onClick={() => { setSide((s) => !s); if (!flags.sidebar) flag('sidebar'); }} aria-label={tr('Document tabs and outline')}><List aria-hidden="true" /></button>}
        <button type="button" className="dx-st" onClick={() => setDlg('words')}>{tr('Page {n} of {total}', { n: curPage, total: pages })}</button>
        <button type="button" className="dx-st words" onClick={() => setDlg('words')}>{tr('{count} words', { count: words })}</button>
        {mode !== 'edit' && <span className="dx-st mode">{mode === 'view' ? tr('Viewing') : tr('Suggesting')}</span>}
        {listening && <span className="dx-st rec"><i />{tr('Listening…')}</span>}
        <span className="grow" />
        <div className="ex-pop up">
          <button type="button" className={`ex-ready${bad ? ' warn' : ''}`} onClick={() => setReadyOpen((o) => !o)} aria-expanded={readyOpen}>
            {bad ? <><span className="dot" aria-hidden="true" />{tr('{count} to fix', { count: bad })}</> : <><BadgeCheck aria-hidden="true" />{tr('Print ready')}</>}
          </button>
          {readyOpen && (
            <div className="ex-card ex-checks dx-checks" role="dialog" aria-label={tr('Print readiness')}>
              <p className="ex-h">{tr('Print readiness')}</p>
              <ul>{problems.map((c) => (
                <li key={c.id} className={c.ok ? 'ok' : 'bad'}><span className="ic" aria-hidden="true">{c.ok ? <Check /> : '!'}</span><div><b>{c.label}</b>{c.detail && <small>{c.detail}</small>}</div>{c.fix && <button type="button" className="ex-btn" onClick={() => { c.fix?.(); say(tr('Fixed')); }}>{tr('Fix')}</button>}</li>
              ))}</ul>
              <p className="muted">{tr('Checked against what verified printers need.')}</p>
            </div>
          )}
        </div>
        <span className="dx-zoomgrp">
        <i className="ex-sep" aria-hidden="true" />
        <button type="button" className="ex-ib sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.1) * 100)} aria-label={tr('Zoom out')}><ZoomOut aria-hidden="true" /></button>
        <button type="button" className="ex-zoom" onClick={() => setZoom('auto')} title={tr('Fit to width')}>{Math.round(zoom * 100)}%</button>
        <button type="button" className="ex-ib sm" onClick={() => setZoom(Math.min(3, zoom + 0.1) * 100)} aria-label={tr('Zoom in')}><ZoomIn aria-hidden="true" /></button>
        </span>
      </footer>

      {/* ───────── floating bits ───────── */}
      {bar && mode !== 'view' && (
        <div className="ex-ctx ex-float dx-float" style={{ left: bar.x, top: bar.y }} role="toolbar" aria-label={tr('Text tools')} onMouseDown={(e) => e.preventDefault()}>
          <button type="button" aria-label={tr('Bold')} aria-pressed={fmt.bold} onClick={() => act('bold')}><Bold aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Italic')} aria-pressed={fmt.italic} onClick={() => act('italic')}><Italic aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Underline')} aria-pressed={fmt.underline} onClick={() => act('underline')}><Underline aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Highlight')} onClick={() => act('highlight', '#fde68a')}><Highlighter aria-hidden="true" /></button>
          <button type="button" aria-label={tr('Link')} onClick={() => act('link')}><Link2 aria-hidden="true" /></button>
          <i className="ex-sep" aria-hidden="true" />
          <button type="button" aria-label={tr('Comment')} onClick={() => act('comment')}><MessageSquarePlus aria-hidden="true" /></button>
          <button type="button" className="ex-ask" onClick={() => setPane('ai')}><Sparkles aria-hidden="true" />{tr('Ask Ifiok')}</button>
        </div>
      )}
      {slash && mode !== 'view' && (
        <div className="ex-slash" style={{ left: slash.x, top: slash.y }} role="menu" aria-label={tr('Insert a block')} onMouseDown={(e) => e.preventDefault()}>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('st-h1'))}><Heading1 aria-hidden="true" />{tr('Heading 1')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('st-h2'))}><Heading2 aria-hidden="true" />{tr('Heading 2')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('st-h3'))}><Heading3 aria-hidden="true" />{tr('Heading 3')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('ul'))}><List aria-hidden="true" />{tr('Bulleted list')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('ol'))}><ListOrdered aria-hidden="true" />{tr('Numbered list')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('check'))}><ListChecks aria-hidden="true" />{tr('Checklist')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => insertHtml(tableHtml(3, 3)))}><Table2 aria-hidden="true" />{tr('Table')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('hr'))}><Minus aria-hidden="true" />{tr('Divider')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('pagebreak'))}><Split aria-hidden="true" />{tr('Page break')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('img-upload'))}><ImageIcon aria-hidden="true" />{tr('Image')}</button>
          <button type="button" role="menuitem" onClick={() => pickSlash(() => act('qr'))}><QrCode aria-hidden="true" />{tr('QR code')}</button>
        </div>
      )}
      {find && ed.current && <FindBar ed={ed.current} replace={find === 'replace'} onClose={() => setFind(null)} say={say} />}
      <input ref={fileIn} type="file" accept="image/*" hidden onChange={onFile} aria-hidden="true" tabIndex={-1} />

      {/* ───────── dialogs ───────── */}
      {dlg === 'words' && <WordCountDialog text={text} selected={selText} pages={pages} onClose={() => setDlg(null)} />}
      {dlg === 'page' && <PageSetupDialog value={set} onApply={setSet} onClose={() => setDlg(null)} />}
      {dlg === 'link' && (
        <LinkDialog text={dlgData.text ?? ''} url={dlgData.url ?? ''} onClose={() => setDlg(null)}
          onApply={(t, u) => { focusEd(); if (t && t === dlgData.text && dlgData.text) document.execCommand('createLink', false, u); else insertHtml(`<a href="${esc(u)}">${esc(t || u)}</a>`); bump(); }}
          onRemove={() => { focusEd(); document.execCommand('unlink'); bump(); }} />
      )}
      {dlg === 'imgurl' && <ImageUrlDialog onClose={() => setDlg(null)} onApply={(u) => insertHtml(`<img src="${esc(u)}" alt="" style="max-width:100%">`)} />}
      {dlg === 'symbols' && <SymbolsDialog group={dlgData.group} onClose={() => setDlg(null)} onPick={(c) => { focusEd(); document.execCommand('insertText', false, c); bump(); }} />}
      {dlg === 'shortcuts' && <ShortcutsDialog onClose={() => setDlg(null)} />}
      {dlg === 'share' && <ShareDialog name={name} invited={invited} setInvited={setInvited} say={say} onClose={() => setDlg(null)} />}
      {dlg === 'versions' && <VersionsDialog onClose={() => setDlg(null)} onRestore={() => { loadHtml(startHtml()); say(tr('Version restored.')); }} />}
      {dlg === 'open' && <OpenDialog onClose={() => setDlg(null)} onOpen={(tpl, title) => { loadHtml(templateHtml(tpl)); setName(title); }} />}
      {dlg === 'details' && <DetailsDialog name={name} words={words} pages={pages} onClose={() => setDlg(null)} />}
      {dlg === 'hf' && <HeaderFooterDialog header={hf.header} footer={hf.footer} numbers={hf.numbers} onApply={(h, f, n) => setHf({ header: h, footer: f, numbers: n })} onClose={() => setDlg(null)} />}
      {dlg === 'review' && ed.current && <ReviewDialog ed={ed.current} onChange={bump} onClose={() => setDlg(null)} />}
      {dlg === 'move' && <MoveDialog onClose={() => setDlg(null)} onMove={(f) => say(tr('Moved to {folder}', { folder: f }))} />}
      {dlg === 'trash' && <ConfirmDialog title={tr('Move to trash')} body={tr('This document goes to the trash. You can restore it for 30 days.')} yes={tr('Move to trash')} onClose={() => setDlg(null)} onYes={() => { setTrashed(true); say(tr('Moved to trash')); }} />}
      {dlg === 'menus' && <MenuSearchDialog run={act} onClose={() => setDlg(null)} />}
      {dlg === 'new' && (
        <Dialog title={tr('New document')} onClose={() => setDlg(null)}>
          <ul className="dx-vers">{TEMPLATE_LIST.map((t) => <li key={t.id}><button type="button" onClick={() => { loadHtml(templateHtml(t.id)); setName(tr(t.name)); setDlg(null); }}><span className="av doc">D</span><span><b>{tr(t.name)}</b></span></button></li>)}</ul>
        </Dialog>
      )}
      {dlg?.startsWith('chip-') && <ChipDialog kind={dlg} onClose={() => setDlg(null)} onPick={(h) => insertHtml(h)} />}

      <SendToPrinter open={sendOpen} onClose={() => setSendOpen(false)} kind="doc" name={name} problems={bad} />
      <div className="ex-toast" role="status" aria-live="polite">{toast}</div>
      {mode === 'view' && <PenHint />}
    </div>
  );
}

function PenHint() { return null; }
function PlusIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>; }
function HistoryIcon() { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>; }

function placeholderImg(a: string, b: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="360" height="200" rx="10" fill="url(#g)"/><text x="180" y="112" font-family="Arial" font-size="38" font-weight="800" fill="#fff" text-anchor="middle">${esc(label)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function chartHtml(kind: string) {
  const cap = esc(tr('Chart (sample data)'));
  const axis = '<line x1="30" y1="10" x2="30" y2="120" stroke="#9aa" /><line x1="30" y1="120" x2="290" y2="120" stroke="#9aa" />';
  let body = '';
  if (kind === 'bar') body = axis + [40, 75, 55, 100, 85].map((h, i) => `<rect x="${50 + i * 48}" y="${120 - h}" width="30" height="${h}" fill="${i % 2 ? '#DAA019' : '#0B7A7F'}" rx="3"/>`).join('');
  else if (kind === 'line') body = axis + '<polyline fill="none" stroke="#0B7A7F" stroke-width="3" points="40,100 90,70 140,85 190,40 240,55 285,20"/>' + [[40, 100], [90, 70], [140, 85], [190, 40], [240, 55], [285, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#DAA019"/>`).join('');
  else body = '<circle cx="160" cy="65" r="52" fill="#0B7A7F"/><path d="M160 65 L160 13 A52 52 0 0 1 208 85 Z" fill="#DAA019"/><path d="M160 65 L208 85 A52 52 0 0 1 130 111 Z" fill="#B6322B"/>';
  return `<figure class="dx-chart" contenteditable="false"><svg viewBox="0 0 300 130" width="300" height="130" role="img" aria-label="${cap}">${body}</svg><figcaption>${cap}</figcaption></figure><p><br></p>`;
}

function ChipDialog({ kind, onPick, onClose }: { kind: string; onPick: (html: string) => void; onClose: () => void }) {
  const items: { id: string; label: string; sub?: string; html: string }[] =
    kind === 'chip-date' ? [{ id: 'd', label: new Date().toLocaleDateString(), html: `<span class="dx-chip" contenteditable="false">${esc(new Date().toLocaleDateString())}</span>&nbsp;` }]
    : kind === 'chip-person' ? PEOPLE.map((p) => ({ id: p.id, label: p.full, html: `<span class="dx-chip person" contenteditable="false">@${esc(p.full)}</span>&nbsp;` }))
    : kind === 'chip-printer' ? PRINTERS.slice(0, 5).map((p) => ({ id: p.id, label: p.shop, sub: p.area, html: `<span class="dx-chip printer" contenteditable="false">${esc(p.shop)} · ${esc(p.area)}</span>&nbsp;` }))
    : kind === 'chip-file' ? RECENT.map((r) => ({ id: r.id, label: tr(r.title), sub: tr(r.when), html: `<span class="dx-chip file" contenteditable="false">${esc(tr(r.title))}</span>&nbsp;` }))
    : [{ id: 'pl', label: 'Ikeja, Lagos', html: `<span class="dx-chip place" contenteditable="false">Ikeja, Lagos</span>&nbsp;` }];
  const title = kind === 'chip-date' ? tr('Insert a date') : kind === 'chip-person' ? tr('Mention a person') : kind === 'chip-printer' ? tr('Insert a verified printer') : kind === 'chip-file' ? tr('Insert a file') : tr('Insert a place');
  return (
    <Dialog title={title} onClose={onClose}>
      <ul className="dx-vers">{items.map((i) => <li key={i.id}><button type="button" onClick={() => { onPick(i.html); onClose(); }}><span className="av doc">{i.label[0]}</span><span><b>{i.label}</b>{i.sub && <small>{i.sub}</small>}</span></button></li>)}</ul>
    </Dialog>
  );
}

function PhoneMenu({ run, checks, disabled, onGrid, onClose }: { run: (id: string) => void; checks: Record<string, boolean>; disabled: (id: string) => boolean; onGrid: (r: number, c: number) => void; onClose: () => void }) {
  return (
    <div className="ex-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dx-dlg phone-menu" role="dialog" aria-modal="true" aria-label={tr('Menu')}>
        <div className="dx-dlg-h"><b>{tr('Menu')}</b><button type="button" className="ex-ib" onClick={onClose} aria-label={tr('Close')}><X aria-hidden="true" /></button></div>
        <div className="dx-dlg-b"><MenuBar run={run} checks={checks} disabled={disabled} onGrid={onGrid} searchOpen={false} onSearch={() => {}} inline /></div>
      </div>
    </div>
  );
}
