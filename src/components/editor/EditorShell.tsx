'use client';

import {
  AlignCenter, AlignLeft, AlignRight, ArrowLeft, BadgeCheck, Bold, Check, ChevronDown, Copy, FileText, ImageUp, Italic, LayoutTemplate, Link2, List, ListOrdered, MessageSquare, MoreHorizontal, Palette,
  Plus, QrCode, Redo2, Search, Send, Shapes, Share2, Sparkles, Type, Underline, Undo2, Users, X, ZoomIn, ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DesignCanvas from './DesignCanvas';
import DocCanvas from './DocCanvas';
import SendToPrinter from './SendToPrinter';
import LangMenu from '@/components/LangMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { BRAND_COLORS, DOC_COMMENTS, DOC_START_HTML, DOC_TEMPLATES, ELEMENT_SHAPES, PAGE, TEMPLATES } from './data';
import { checkDesign, useDesign } from './useDesign';
import { useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';
import { asset } from '@/lib/asset';
import './editor.css';

type Mode = 'design' | 'doc';
type Rail = { id: string; label: string; Icon: typeof Type };
const RAIL: Record<Mode, Rail[]> = {
  design: [
    { id: 'templates', label: 'Templates', Icon: LayoutTemplate }, { id: 'elements', label: 'Elements', Icon: Shapes }, { id: 'text', label: 'Text', Icon: Type },
    { id: 'uploads', label: 'Uploads', Icon: ImageUp }, { id: 'brand', label: 'Brand', Icon: Palette }, { id: 'more', label: 'More', Icon: MoreHorizontal },
  ],
  doc: [
    { id: 'outline', label: 'Outline', Icon: List }, { id: 'templates', label: 'Templates', Icon: LayoutTemplate }, { id: 'comments', label: 'Comments', Icon: MessageSquare },
    { id: 'pdf', label: 'PDF tools', Icon: FileText }, { id: 'ai', label: 'Ask Ifiok', Icon: Sparkles },
  ],
};

const PDF_TOOLS = ['Sign a PDF', 'Fill a form', 'Annotate', 'Merge PDFs', 'Compress a PDF', 'Convert to Word'];
const AI_CHIPS = ['Make it shorter', 'Fix spelling', 'Translate to Yorùbá', 'Summarise'];

export default function EditorShell({ mode }: { mode: Mode }) {
  useLang(); // re-render when the language changes
  const D = useDesign();
  const isDesign = mode === 'design';
  const [name, setName] = useState(isDesign ? tr('Grand Opening flyer') : tr('Project proposal'));
  const [panel, setPanel] = useState<string | null>(isDesign ? 'templates' : 'outline');
  const [sendOpen, setSendOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState<number | null>(null);
  const [guides, setGuides] = useState(true);
  const [readyOpen, setReadyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [q, setQ] = useState('');
  const [pages, setPages] = useState(1);
  const [editable, setEditable] = useState(true);
  const [html, setHtml] = useState(DOC_START_HTML);
  const [tick, setTick] = useState(0);
  const [comments, setComments] = useState(DOC_COMMENTS);
  const [ai, setAi] = useState<string[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const edRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const say = useCallback((t: string) => { setToast(t); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(''), 2600); }, []);

  // fit the page to the space available
  useEffect(() => {
    const el = stageRef.current; if (!el) return;
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight;
      setFit(isDesign ? Math.max(0.3, Math.min((w - 40) / PAGE.w, (h - 110) / PAGE.h, 1.4)) : Math.max(0.4, Math.min((w - 24) / 760, 1.2)));
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [isDesign, panel]);
  const z = zoom ?? fit;

  // Ctrl/Cmd+K opens the command bar
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd(true); setQ(''); }
      if (e.key === 'Escape') { setCmd(false); setReadyOpen(false); setShareOpen(false); setMoreOpen(false); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const checks = useMemo(() => (isDesign ? checkDesign(D) : [
    { id: 'size', ok: true, label: tr('Page size is A4') },
    { id: 'margins', ok: true, label: tr('Margins are 20 mm') },
    { id: 'fonts', ok: true, label: tr('Fonts are embedded') },
    { id: 'images', ok: true, label: tr('No low-resolution images') },
  ]), [isDesign, D]);  // eslint-disable-line react-hooks/exhaustive-deps
  const problems = checks.filter((c) => !c.ok).length;

  const text = typeof document !== 'undefined' && edRef.current ? edRef.current.innerText : '';
  const words = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const heads = useMemo(() => (edRef.current ? Array.from(edRef.current.querySelectorAll('h1,h2')).map((h, i) => ({ i, t: h.textContent ?? '', l: h.tagName })) : []), [tick, html]); // eslint-disable-line react-hooks/exhaustive-deps

  const undo = () => (isDesign ? D.undo() : document.execCommand('undo'));
  const redo = () => (isDesign ? D.redo() : document.execCommand('redo'));
  const keep = (e: React.MouseEvent) => e.preventDefault();
  const cmdDoc = (c: string, v?: string) => { edRef.current?.focus(); document.execCommand(c, false, v); setTick((t) => t + 1); };

  const rail = RAIL[mode];
  const toggle = (id: string) => setPanel((p) => (p === id ? null : id));
  const askAi = (what: string) => { setPanel('ai'); setAi((l) => [...l, what]); };

  /* ───────────── panels ───────────── */
  const panelBody = () => {
    switch (panel) {
      case 'templates':
        return isDesign ? (
          <>
            <label className="ex-search"><Search aria-hidden="true" /><input placeholder={tr('Search templates')} aria-label={tr('Search templates')} /></label>
            <div className="ex-tgrid">
              {TEMPLATES.map((t) => (
                <button key={t.id} type="button" className="ex-tt" onClick={() => { D.load(t); say(tr('Template applied')); }}>
                  <span className="ex-tt-art" style={{ background: t.page }}>{t.objs.filter((o) => o.type === 'text').slice(0, 2).map((o) => <b key={o.id} style={{ color: o.color }}>{o.text}</b>)}</span>
                  <span>{tr(t.name)}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="ex-list">
            {DOC_TEMPLATES.map((t) => <button key={t.id} type="button" onClick={() => { setHtml(t.html); say(tr('Template applied')); }}><FileText aria-hidden="true" />{tr(t.name)}</button>)}
          </div>
        );
      case 'elements':
        return (
          <div className="ex-egrid">
            {ELEMENT_SHAPES.map((s) => (
              <button key={s.id} type="button" onClick={() => D.add({ type: 'shape', x: 180, y: 320, w: s.w, h: s.h, color: s.bg, bg: s.bg, round: s.round })}>
                <i style={{ background: s.bg, borderRadius: s.round ? '50%' : 4, height: s.id === 'line' ? 4 : 44 }} />
                <span>{tr(s.label)}</span>
              </button>
            ))}
          </div>
        );
      case 'text':
        return (
          <div className="ex-list">
            <button type="button" onClick={() => D.add({ type: 'text', x: 60, y: 300, w: 440, h: 70, text: tr('Add a heading'), color: '#FFFFFF', size: 48, weight: 800, align: 'center' })}><Type aria-hidden="true" /><b style={{ fontSize: 20 }}>{tr('Add a heading')}</b></button>
            <button type="button" onClick={() => D.add({ type: 'text', x: 60, y: 300, w: 440, h: 44, text: tr('Add a subheading'), color: '#FFFFFF', size: 28, weight: 600, align: 'center' })}><Type aria-hidden="true" /><b style={{ fontSize: 16 }}>{tr('Add a subheading')}</b></button>
            <button type="button" onClick={() => D.add({ type: 'text', x: 60, y: 300, w: 440, h: 36, text: tr('Add a little bit of body text'), color: '#FFFFFF', size: 18, weight: 400, align: 'center' })}><Type aria-hidden="true" />{tr('Add a little bit of body text')}</button>
          </div>
        );
      case 'uploads':
        return (
          <>
            <label className="ex-drop">
              <ImageUp aria-hidden="true" /><b>{tr('Upload a photo or logo')}</b><small>{tr('JPG, PNG or SVG')}</small>
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const u = URL.createObjectURL(f); D.add({ type: 'image', x: 120, y: 330, w: 320, h: 200, color: '#0B7A7F', bg: `url(${u}) center/cover` }); say(tr('Added to your design')); } }} />
            </label>
            <p className="ex-h">{tr('Sample photos')}</p>
            <div className="ex-egrid">
              {['linear-gradient(135deg,#DAA019,#B6322B)', 'linear-gradient(135deg,#1F3A8A,#14A5AB)', 'linear-gradient(135deg,#7A1D4A,#DAA019)'].map((g, i) => (
                <button key={g} type="button" onClick={() => D.add({ type: 'image', x: 120, y: 330, w: 320, h: 200, color: '#0B7A7F', bg: g })}><i style={{ background: g, height: 56 }} /><span>{tr('Photo {n}', { n: i + 1 })}</span></button>
              ))}
            </div>
          </>
        );
      case 'brand':
        return (
          <>
            <p className="ex-h">{tr('Brand colours')}</p>
            <div className="ex-sws">
              {BRAND_COLORS.map((c) => <button key={c} type="button" style={{ background: c }} aria-label={tr('Colour {c}', { c })} onClick={() => (D.sel.length ? D.patch(D.sel, { color: c, bg: c }) : D.setPage(c))} />)}
            </div>
            <p className="muted">{tr('Pick a colour to change the selection, or the page when nothing is selected.')}</p>
            <p className="ex-h">{tr('Brand fonts')}</p>
            <div className="ex-list"><button type="button" onClick={() => say(tr('Fonts are set in your Brand kit.'))}><Type aria-hidden="true" />Archivo</button><button type="button" onClick={() => say(tr('Fonts are set in your Brand kit.'))}><Type aria-hidden="true" />Georgia</button></div>
          </>
        );
      case 'more':
        return (
          <div className="ex-list">
            <button type="button" onClick={() => D.add({ type: 'qr', x: 400, y: 640, w: 90, h: 90, color: '#15241F', bg: '#FFFFFF' })}><QrCode aria-hidden="true" /><span><b>{tr('QR code')}</b><small>{tr('Track scans from the dashboard')}</small></span></button>
            <button type="button" onClick={() => askAi(tr('Write a headline for this flyer'))}><Sparkles aria-hidden="true" /><span><b>{tr('Ask Ifiok')}</b><small>{tr('Write, rewrite or translate')}</small></span></button>
            <button type="button" onClick={() => say(tr('Bulk cards opens here in the full editor.'))}><Users aria-hidden="true" /><span><b>{tr('Bulk cards')}</b><small>{tr('Make 50 ID cards from a sheet')}</small></span></button>
            <button type="button" onClick={() => say(tr('Data Studio opens here in the full editor.'))}><Copy aria-hidden="true" /><span><b>{tr('Data Studio')}</b><small>{tr('Charts and tables from your data')}</small></span></button>
          </div>
        );
      case 'outline':
        return heads.length ? (
          <ul className="ex-outline">
            {heads.map((h) => <li key={h.i} className={h.l === 'H2' ? 'sub' : ''}><button type="button" onClick={() => edRef.current?.querySelectorAll('h1,h2')[h.i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>{h.t}</button></li>)}
          </ul>
        ) : <p className="muted">{tr('Headings you add show up here.')}</p>;
      case 'comments':
        return (
          <ul className="ex-comments">
            {comments.map((c) => <li key={c.id}><span className="av">{c.who[0]}</span><div><b>{c.who}</b> <small>{c.when}</small><p>{c.text}</p></div></li>)}
            <li className="hint">{tr('Select some text and press the comment button to add one.')}</li>
          </ul>
        );
      case 'pdf':
        return (
          <div className="ex-list">
            {PDF_TOOLS.map((t) => <button key={t} type="button" onClick={() => say(tr('This opens the PDF tools in the full editor.'))}><FileText aria-hidden="true" />{tr(t)}</button>)}
          </div>
        );
      case 'ai':
        return (
          <div className="ex-ai">
            <div className="ex-chips">{AI_CHIPS.map((t) => <button key={t} type="button" onClick={() => setAi((l) => [...l, t])}>{tr(t)}</button>)}</div>
            {ai.map((t, i) => <div key={i} className="ex-bub"><b>{tr(t)}</b><p>{tr('In the full editor Ifiok answers here and can apply the change to your selection. This is a preview.')}</p></div>)}
            {!ai.length && <p className="muted">{tr('Ask Ifiok to write, shorten, fix or translate your text.')}</p>}
          </div>
        );
      default: return null;
    }
  };

  /* ───────────── command bar ───────────── */
  const cmds = [
    { id: 'send', label: tr('Send to a verified printer'), run: () => setSendOpen(true) },
    { id: 'all', label: tr('Select all'), run: () => (isDesign ? D.selectAll() : cmdDoc('selectAll')) },
    { id: 'undo', label: tr('Undo'), run: undo }, { id: 'redo', label: tr('Redo'), run: redo },
    { id: 'ask', label: tr('Ask Ifiok'), run: () => askAi(tr('Ask Ifiok')) },
    { id: 'sw', label: isDesign ? tr('Switch to Ifiok Docs') : tr('Switch to Ifiok Designs'), run: () => { window.location.href = asset(isDesign ? '/preview/docs/' : '/preview/design/'); } },
    { id: 'dash', label: tr('Back to dashboard'), run: () => { window.location.href = asset('/design/'); } },
  ].filter((c) => c.label.toLowerCase().includes(q.trim().toLowerCase()));

  useEffect(() => { const t = window.setTimeout(() => say(canvasHint), 1200); return () => window.clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const dpad = isDesign ? `${Math.round(z * 100)}%` : `${Math.round(z * 100)}%`;
  const canvasHint = isDesign ? tr('Click to select. Drag to move. Double-click text to edit. Ctrl+A selects all.') : tr('Click to type. Ctrl+A selects all. Type / on an empty line.');

  return (
    <div className={`ex ex-${mode}`}>
      <a className="ex-skip" href="#ex-main">{tr('Skip to the editor')}</a>
      {/* ───── top bar ───── */}
      <header className="ex-top">
        <a className="ex-ib" href={asset('/design/')} aria-label={tr('Back to dashboard')}><ArrowLeft aria-hidden="true" /></a>
        <div className="ex-appsw" role="group" aria-label={tr('Editor')}>
          <a href={asset('/preview/design/')} aria-current={isDesign ? 'page' : undefined}>{tr('Designs')}</a>
          <a href={asset('/preview/docs/')} aria-current={!isDesign ? 'page' : undefined}>{tr('Docs')}</a>
        </div>
        <div className="ex-title">
          <input value={name} onChange={(e) => setName(e.target.value)} aria-label={tr('File name')} maxLength={60} />
          <span className="ex-saved"><Check aria-hidden="true" />{tr('Saved to your Ifiok account')}</span>
        </div>
        <span className="grow" />
        <button type="button" className="ex-ib hide-m" onClick={undo} aria-label={tr('Undo')} disabled={isDesign && !D.canUndo}><Undo2 aria-hidden="true" /></button>
        <button type="button" className="ex-ib hide-m" onClick={redo} aria-label={tr('Redo')} disabled={isDesign && !D.canRedo}><Redo2 aria-hidden="true" /></button>
        <button type="button" className="ex-cmd hide-m" onClick={() => { setCmd(true); setQ(''); }}><Search aria-hidden="true" /><span>{tr('Search or ask')}</span><kbd>Ctrl K</kbd></button>
        <div className="ex-people hide-m" aria-label={tr('People here now')}><span className="av a">A</span><span className="av b">T</span>{invited.map((m) => <span key={m} className="av c">{m[0].toUpperCase()}</span>)}</div>
        <div className="ex-pop">
          <button type="button" className="ex-btn hide-m" onClick={() => { setShareOpen((o) => !o); setReadyOpen(false); }} aria-expanded={shareOpen}><Share2 aria-hidden="true" />{tr('Share')}</button>
          {shareOpen && (
            <div className="ex-card ex-share" role="dialog" aria-label={tr('Share')}>
              <p className="ex-h">{tr('Share this file')}</p>
              <div className="ex-copy"><input readOnly value="ifiok.ng/f/k3x9a" aria-label={tr('Link')} /><button type="button" className="ex-btn" onClick={() => { navigator.clipboard?.writeText('https://ifiok.ng/f/k3x9a').catch(() => {}); say(tr('Link copied')); }}><Link2 aria-hidden="true" />{tr('Copy')}</button></div>
              <a className="ex-btn wa" href="https://wa.me/?text=https%3A%2F%2Fifiok.ng%2Ff%2Fk3x9a" target="_blank" rel="noopener noreferrer">{tr('Share on WhatsApp')}</a>
              <form className="ex-inv" onSubmit={(e) => { e.preventDefault(); const v = (new FormData(e.currentTarget).get('em') as string).trim(); if (v) { setInvited((l) => [...l, v]); say(tr('Invite sent to {email}', { email: v })); e.currentTarget.reset(); } }}>
                <input name="em" type="email" placeholder={tr('Invite by email')} aria-label={tr('Invite by email')} /><button className="ex-btn p" type="submit">{tr('Invite')}</button>
              </form>
            </div>
          )}
        </div>
        <button type="button" className="ex-btn gold" onClick={() => setSendOpen(true)}><Send aria-hidden="true" /><span className="long">{tr('Send to printer')}</span><span className="short">{tr('Send')}</span></button>
        <span className="hide-m"><LangMenu className="ex-ib" /></span>
        <span className="hide-m"><ThemeToggle /></span>
        <div className="ex-pop show-m">
          <button type="button" className="ex-ib" onClick={() => setMoreOpen((o) => !o)} aria-label={tr('More')} aria-expanded={moreOpen}><MoreHorizontal aria-hidden="true" /></button>
          {moreOpen && (
            <div className="ex-card ex-more" role="menu">
              <button type="button" role="menuitem" onClick={() => { undo(); setMoreOpen(false); }}><Undo2 aria-hidden="true" />{tr('Undo')}</button>
              <button type="button" role="menuitem" onClick={() => { redo(); setMoreOpen(false); }}><Redo2 aria-hidden="true" />{tr('Redo')}</button>
              <button type="button" role="menuitem" onClick={() => { setShareOpen(true); setMoreOpen(false); }}><Share2 aria-hidden="true" />{tr('Share')}</button>
              <div className="ex-more-row"><span>{tr('Language')}</span><LangMenu className="ex-ib" /></div>
              <div className="ex-more-row"><span>{tr('Theme')}</span><ThemeToggle /></div>
            </div>
          )}
        </div>
      </header>
      {shareOpen && <div className="show-m ex-share-m" />}

      <div className="ex-body">
        {/* ───── left rail ───── */}
        <nav className="ex-rail" aria-label={tr('Tools')}>
          {rail.map(({ id, label, Icon }) => (
            <button key={id} type="button" aria-pressed={panel === id} onClick={() => toggle(id)}><Icon aria-hidden="true" /><span>{tr(label)}</span></button>
          ))}
        </nav>

        <aside className="ex-panel" data-open={panel ? '' : undefined} aria-label={panel ? tr(rail.find((r) => r.id === panel)?.label ?? '') : undefined}>
          <div className="ex-panel-h"><b>{panel ? tr(rail.find((r) => r.id === panel)?.label ?? '') : ''}</b><button type="button" className="ex-ib" onClick={() => setPanel(null)} aria-label={tr('Close')}><X aria-hidden="true" /></button></div>
          <div className="ex-panel-b">{panelBody()}</div>
        </aside>

        {/* ───── canvas ───── */}
        <main className="ex-main" id="ex-main" ref={stageRef}>
          {!isDesign && (
            <div className="ex-tools" role="toolbar" aria-label={tr('Formatting')} onMouseDown={keep}>
              <label className="ex-sel"><span className="sr">{tr('Style')}</span>
                <select defaultValue="p" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => cmdDoc('formatBlock', e.target.value)}>
                  <option value="p">{tr('Normal text')}</option><option value="h1">{tr('Heading 1')}</option><option value="h2">{tr('Heading 2')}</option>
                </select><ChevronDown aria-hidden="true" />
              </label>
              <button type="button" aria-label={tr('Bold')} onClick={() => cmdDoc('bold')}><Bold aria-hidden="true" /></button>
              <button type="button" aria-label={tr('Italic')} onClick={() => cmdDoc('italic')}><Italic aria-hidden="true" /></button>
              <button type="button" aria-label={tr('Underline')} onClick={() => cmdDoc('underline')}><Underline aria-hidden="true" /></button>
              <i className="ex-sep" aria-hidden="true" />
              <button type="button" aria-label={tr('Bulleted list')} onClick={() => cmdDoc('insertUnorderedList')}><List aria-hidden="true" /></button>
              <button type="button" aria-label={tr('Numbered list')} onClick={() => cmdDoc('insertOrderedList')}><ListOrdered aria-hidden="true" /></button>
              <i className="ex-sep" aria-hidden="true" />
              <button type="button" aria-label={tr('Align left')} onClick={() => cmdDoc('justifyLeft')}><AlignLeft aria-hidden="true" /></button>
              <button type="button" aria-label={tr('Align centre')} onClick={() => cmdDoc('justifyCenter')}><AlignCenter aria-hidden="true" /></button>
              <button type="button" aria-label={tr('Align right')} onClick={() => cmdDoc('justifyRight')}><AlignRight aria-hidden="true" /></button>
              <span className="grow" />
              <div className="ex-seg" role="group" aria-label={tr('Mode')}>
                <button type="button" aria-pressed={editable} onClick={() => setEditable(true)}>{tr('Editing')}</button>
                <button type="button" aria-pressed={!editable} onClick={() => setEditable(false)}>{tr('Viewing')}</button>
              </div>
            </div>
          )}

          {isDesign ? <DesignCanvas D={D} zoom={z} guides={guides} /> : (
            <DocCanvas edRef={edRef} html={html} editable={editable} zoom={z} onChange={() => setTick((t) => t + 1)}
              onComment={(t) => { setComments((l) => [...l, { id: 'n' + l.length, who: 'You', text: t ? `“${t.slice(0, 80)}”` : tr('New comment'), when: tr('now') }]); setPanel('comments'); }}
              onAsk={(t) => askAi(t ? `“${t.slice(0, 60)}”` : tr('Ask Ifiok'))} />
          )}

          {/* floating status pill */}
          <div className="ex-pill" role="group" aria-label={tr('Page controls')}>
            <div className="ex-pop up">
              <button type="button" className={`ex-ready${problems ? ' warn' : ''}`} onClick={() => { setReadyOpen((o) => !o); setShareOpen(false); }} aria-expanded={readyOpen}>
                {problems ? <><span className="dot" aria-hidden="true" />{tr('{count} to fix', { count: problems })}</> : <><BadgeCheck aria-hidden="true" />{tr('Print ready')}</>}
              </button>
              {readyOpen && (
                <div className="ex-card ex-checks" role="dialog" aria-label={tr('Print readiness')}>
                  <p className="ex-h">{tr('Print readiness')}</p>
                  <ul>
                    {checks.map((c) => (
                      <li key={c.id} className={c.ok ? 'ok' : 'bad'}>
                        <span className="ic" aria-hidden="true">{c.ok ? <Check /> : '!'}</span>
                        <div><b>{c.label}</b>{c.detail && <small>{c.detail}</small>}</div>
                        {c.fix && <button type="button" className="ex-btn" onClick={() => { c.fix?.(); say(tr('Fixed')); }}>{tr('Fix')}</button>}
                      </li>
                    ))}
                  </ul>
                  <p className="muted">{tr('Checked against what verified printers need.')}</p>
                </div>
              )}
            </div>
            <i className="ex-sep" aria-hidden="true" />
            <button type="button" className="ex-ib sm" onClick={() => setZoom(Math.max(0.3, z - 0.1))} aria-label={tr('Zoom out')}><ZoomOut aria-hidden="true" /></button>
            <button type="button" className="ex-zoom" onClick={() => setZoom(null)} title={tr('Fit')}>{dpad}</button>
            <button type="button" className="ex-ib sm" onClick={() => setZoom(Math.min(2, z + 0.1))} aria-label={tr('Zoom in')}><ZoomIn aria-hidden="true" /></button>
            {isDesign ? (
              <button type="button" className="ex-gtoggle" aria-pressed={guides} onClick={() => setGuides((g) => !g)}>{tr('Guides')}</button>
            ) : (
              <span className="ex-wc">{tr('{count} words', { count: words })}</span>
            )}
          </div>
        </main>

        {/* ───── pages (designs) ───── */}
        {isDesign && (
          <aside className="ex-pages" aria-label={tr('Pages')}>
            <p className="ex-h">{tr('Pages')}</p>
            {Array.from({ length: pages }, (_, i) => <button key={i} type="button" className="ex-thumb" aria-current={i === 0 ? 'page' : undefined}><span style={{ background: D.page }} /><small>{i + 1}</small></button>)}
            <button type="button" className="ex-addp" onClick={() => { setPages((p) => p + 1); say(tr('Page added')); }}><Plus aria-hidden="true" />{tr('New page')}</button>
          </aside>
        )}
      </div>

      {/* ───── phone tool bar ───── */}
      <nav className="ex-tabs" aria-label={tr('Tools')}>
        {rail.slice(0, 5).map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-pressed={panel === id} onClick={() => toggle(id)}><Icon aria-hidden="true" /><span>{tr(label)}</span></button>
        ))}
      </nav>

      {cmd && (
        <div className="ex-scrim top" onPointerDown={(e) => e.target === e.currentTarget && setCmd(false)}>
          <div className="ex-palette" role="dialog" aria-modal="true" aria-label={tr('Search or ask')}>
            <label className="ex-search big"><Search aria-hidden="true" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Search tools, or ask Ifiok anything')} aria-label={tr('Search or ask')} /></label>
            <ul>
              {cmds.map((c) => <li key={c.id}><button type="button" onClick={() => { setCmd(false); c.run(); }}>{c.label}</button></li>)}
              {q.trim() && <li><button type="button" onClick={() => { setCmd(false); askAi(q.trim()); }}><Sparkles aria-hidden="true" />{tr('Ask Ifiok: {q}', { q: q.trim() })}</button></li>}
            </ul>
          </div>
        </div>
      )}

      <SendToPrinter open={sendOpen} onClose={() => setSendOpen(false)} kind={isDesign ? 'design' : 'doc'} name={name} problems={problems} />
      <div className="ex-toast" role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
