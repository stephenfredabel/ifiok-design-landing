'use client';

import { ChevronDown, ChevronUp, Link2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearHits, findAll, paintHits, type Hit } from './engine';
import { DOC_SIZES, FOLDERS, MARGIN_PRESETS, PAGE_COLOURS, RECENT, VERSIONS } from './content';
import { MENUS, SHORTCUTS, SYMBOL_GROUPS, type MI } from './menus';
import { Dialog, Field } from './ui';
import { tr } from '@/i18n/tr';

export type PageSettings = { paper: string; landscape: boolean; top: number; bottom: number; left: number; right: number; color: string; cols: number };

/* ───── Find (Ctrl+F) and Find and replace (Ctrl+H) ───── */
export function FindBar({ ed, replace, onClose, say }: { ed: HTMLElement; replace: boolean; onClose: () => void; say: (t: string) => void }) {
  const [term, setTerm] = useState('');
  const [rep, setRep] = useState('');
  const [mc, setMc] = useState(false);
  const [cur, setCur] = useState(0);
  const [showRep, setShowRep] = useState(replace);
  const [rev, setRev] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); input.current?.select(); }, []);
  useEffect(() => setShowRep(replace), [replace]);
  const hits: Hit[] = useMemo(() => findAll(ed, term, mc), [ed, term, mc, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setCur(0); }, [term, mc]);
  useEffect(() => {
    paintHits(hits, Math.min(cur, Math.max(hits.length - 1, 0)));
    const h = hits[cur];
    if (h) h.node.parentElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [hits, cur]);
  useEffect(() => () => clearHits(), []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  const go = (d: number) => hits.length && setCur((c) => (c + d + hits.length) % hits.length);
  const doReplace = (all: boolean) => {
    if (!hits.length) return;
    const list = all ? [...hits].reverse() : [hits[cur]];
    list.forEach((h) => { h.node.replaceData(h.start, h.end - h.start, rep); });
    ed.dispatchEvent(new Event('input', { bubbles: true }));
    setRev((r) => r + 1);
    say(all ? tr('{count} replaced', { count: list.length }) : tr('Replaced'));
  };
  return (
    <div className="dx-find" role="search" aria-label={replace ? tr('Find and replace') : tr('Find')} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <style>{'::highlight(dx-find){background-color:#fff3a3;color:#202124}::highlight(dx-find-cur){background-color:#f4a62a;color:#202124}'}</style>
      <div className="dx-find-row">
        <Search aria-hidden="true" />
        <input ref={input} value={term} placeholder={tr('Find in document')} aria-label={tr('Find in document')} onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); go(e.shiftKey ? -1 : 1); } if (e.key === 'Escape') onClose(); }} />
        <span className="cnt" aria-live="polite">{term ? (hits.length ? `${cur + 1} / ${hits.length}` : tr('No results')) : ''}</span>
        <button type="button" className="ex-ib sm" onClick={() => go(-1)} aria-label={tr('Previous match')}><ChevronUp aria-hidden="true" /></button>
        <button type="button" className="ex-ib sm" onClick={() => go(1)} aria-label={tr('Next match')}><ChevronDown aria-hidden="true" /></button>
        <button type="button" className="ex-ib sm" onClick={() => setShowRep((v) => !v)} aria-label={tr('Find and replace')} aria-pressed={showRep}><ChevronDown aria-hidden="true" style={{ transform: showRep ? 'rotate(180deg)' : undefined }} /></button>
        <button type="button" className="ex-ib sm" onClick={onClose} aria-label={tr('Close')}><X aria-hidden="true" /></button>
      </div>
      {showRep && (
        <div className="dx-find-row">
          <input value={rep} placeholder={tr('Replace with')} aria-label={tr('Replace with')} onChange={(e) => setRep(e.target.value)} />
          <button type="button" className="ex-btn" disabled={!hits.length} onClick={() => doReplace(false)}>{tr('Replace')}</button>
          <button type="button" className="ex-btn" disabled={!hits.length} onClick={() => doReplace(true)}>{tr('Replace all')}</button>
        </div>
      )}
      <label className="dx-find-mc"><input type="checkbox" checked={mc} onChange={(e) => setMc(e.target.checked)} />{tr('Match case')}</label>
    </div>
  );
}

/* ───── Word count ───── */
export function WordCountDialog({ text, selected, pages, onClose }: { text: string; selected: string; pages: number; onClose: () => void }) {
  const stat = (t: string) => ({ words: t.trim() ? t.trim().split(/\s+/).length : 0, chars: t.replace(/\n/g, '').length, noSpace: t.replace(/\s/g, '').length });
  const a = stat(text), b = stat(selected);
  const rows: [string, number, number][] = [[tr('Pages'), pages, 0], [tr('Words'), a.words, b.words], [tr('Characters'), a.chars, b.chars], [tr('Characters excluding spaces'), a.noSpace, b.noSpace]];
  return (
    <Dialog title={tr('Word count')} onClose={onClose} foot={<button type="button" className="ex-btn p" onClick={onClose}>{tr('Done')}</button>}>
      <table className="dx-stat"><thead><tr><th /><th>{tr('Document')}</th>{selected && <th>{tr('Selection')}</th>}</tr></thead>
        <tbody>{rows.map(([l, v, s], i) => <tr key={i}><td>{l}</td><td>{v.toLocaleString()}</td>{selected && <td>{i === 0 ? '' : s.toLocaleString()}</td>}</tr>)}</tbody></table>
    </Dialog>
  );
}

/* ───── Page setup ───── */
export function PageSetupDialog({ value, onApply, onClose }: { value: PageSettings; onApply: (v: PageSettings) => void; onClose: () => void }) {
  const [v, setV] = useState(value);
  const num = (k: 'top' | 'bottom' | 'left' | 'right') => (
    <input type="number" step="0.1" min="0" max="3" value={(v[k] / 96).toFixed(2).replace(/\.?0+$/, '')} onChange={(e) => setV({ ...v, [k]: Math.max(0, Math.min(3, Number(e.target.value) || 0)) * 96 })} />
  );
  return (
    <Dialog title={tr('Page setup')} onClose={onClose} foot={<><button type="button" className="ex-btn" onClick={onClose}>{tr('Cancel')}</button><button type="button" className="ex-btn p" onClick={() => { onApply(v); onClose(); }}>{tr('Apply')}</button></>}>
      <p className="ex-h">{tr('Orientation')}</p>
      <div className="dx-seg2" role="radiogroup" aria-label={tr('Orientation')}>
        <button type="button" role="radio" aria-checked={!v.landscape} onClick={() => setV({ ...v, landscape: false })}>{tr('Portrait')}</button>
        <button type="button" role="radio" aria-checked={v.landscape} onClick={() => setV({ ...v, landscape: true })}>{tr('Landscape')}</button>
      </div>
      <div className="dx-two">
        <Field label={tr('Paper size')}><select value={v.paper} onChange={(e) => setV({ ...v, paper: e.target.value })}>{DOC_SIZES.map((s) => <option key={s.id} value={s.id}>{tr(s.label)}</option>)}</select></Field>
        <Field label={tr('Columns')}><select value={v.cols} onChange={(e) => setV({ ...v, cols: Number(e.target.value) })}><option value={1}>{tr('One column')}</option><option value={2}>{tr('Two columns')}</option><option value={3}>{tr('Three columns')}</option></select></Field>
      </div>
      <p className="ex-h">{tr('Margins (inches)')}</p>
      <div className="dx-chips">
        {MARGIN_PRESETS.map((m) => <button key={m.id} type="button" onClick={() => setV({ ...v, top: m.px, bottom: m.px, left: m.px, right: m.px })}>{tr(m.label)}</button>)}
      </div>
      <div className="dx-four">
        <Field label={tr('Top')}>{num('top')}</Field><Field label={tr('Bottom')}>{num('bottom')}</Field><Field label={tr('Left')}>{num('left')}</Field><Field label={tr('Right')}>{num('right')}</Field>
      </div>
      <p className="ex-h">{tr('Page colour')}</p>
      <div className="dx-sw-grid pc">{PAGE_COLOURS.map((c) => <button key={c} type="button" style={{ background: c }} aria-label={c} aria-pressed={v.color === c} onClick={() => setV({ ...v, color: c })} />)}</div>
    </Dialog>
  );
}

/* ───── Link ───── */
export function LinkDialog({ text, url, onApply, onRemove, onClose }: { text: string; url: string; onApply: (text: string, url: string) => void; onRemove: () => void; onClose: () => void }) {
  const [t, setT] = useState(text);
  const [u, setU] = useState(url || 'https://');
  const ok = /^(https?:\/\/|mailto:|\/|#)\S+/i.test(u.trim()) && u.trim().length > 8;
  return (
    <Dialog title={url ? tr('Edit link') : tr('Insert link')} onClose={onClose}
      foot={<>{url && <button type="button" className="ex-btn" onClick={() => { onRemove(); onClose(); }}>{tr('Remove link')}</button>}<span className="grow" /><button type="button" className="ex-btn" onClick={onClose}>{tr('Cancel')}</button><button type="button" className="ex-btn p" disabled={!ok} onClick={() => { onApply(t, u.trim()); onClose(); }}>{tr('Apply')}</button></>}>
      <Field label={tr('Text')}><input value={t} onChange={(e) => setT(e.target.value)} /></Field>
      <Field label={tr('Link address')}><input value={u} onChange={(e) => setU(e.target.value)} inputMode="url" onKeyDown={(e) => { if (e.key === 'Enter' && ok) { onApply(t, u.trim()); onClose(); } }} /></Field>
      {!ok && u.length > 8 && <p className="muted">{tr('Enter a full address that starts with https://')}</p>}
    </Dialog>
  );
}

export function ImageUrlDialog({ onApply, onClose }: { onApply: (url: string) => void; onClose: () => void }) {
  const [u, setU] = useState('https://');
  const ok = /^https?:\/\/\S+\.\S+/.test(u.trim());
  return (
    <Dialog title={tr('Insert image from web address')} onClose={onClose} foot={<><button type="button" className="ex-btn" onClick={onClose}>{tr('Cancel')}</button><button type="button" className="ex-btn p" disabled={!ok} onClick={() => { onApply(u.trim()); onClose(); }}>{tr('Insert')}</button></>}>
      <Field label={tr('Image address')}><input value={u} onChange={(e) => setU(e.target.value)} inputMode="url" /></Field>
      {ok && <img className="dx-imgprev" src={u} alt="" />}
    </Dialog>
  );
}

/* ───── Special characters ───── */
export function SymbolsDialog({ group, onPick, onClose }: { group?: string; onPick: (c: string) => void; onClose: () => void }) {
  const [g, setG] = useState(group ?? 'ng');
  const cur = SYMBOL_GROUPS.find((x) => x.id === g)!;
  const chars = cur.chars.split(' ').filter(Boolean);
  return (
    <Dialog title={tr('Special characters')} onClose={onClose} wide foot={<button type="button" className="ex-btn p" onClick={onClose}>{tr('Done')}</button>}>
      <div className="dx-chips" role="tablist" aria-label={tr('Categories')}>
        {SYMBOL_GROUPS.map((x) => <button key={x.id} type="button" role="tab" aria-selected={g === x.id} onClick={() => setG(x.id)}>{tr(x.label)}</button>)}
      </div>
      <div className="dx-chars">{chars.map((c) => <button key={c} type="button" onClick={() => onPick(c)} aria-label={c}>{c}</button>)}</div>
      <p className="muted">{tr('Click a character to put it in your document. The dialog stays open so you can add more.')}</p>
    </Dialog>
  );
}

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title={tr('Keyboard shortcuts')} onClose={onClose} wide foot={<button type="button" className="ex-btn p" onClick={onClose}>{tr('Done')}</button>}>
      <div className="dx-short">
        {SHORTCUTS.map((g) => (
          <section key={g.group}><p className="ex-h">{tr(g.group)}</p>
            <dl>{g.rows.map((r) => <div key={r.label}><dt>{tr(r.label)}</dt><dd><kbd>{r.key}</kbd></dd></div>)}</dl></section>
        ))}
      </div>
    </Dialog>
  );
}

/* ───── Share ───── */
export function ShareDialog({ name, invited, setInvited, say, onClose }: { name: string; invited: { email: string; role: string }[]; setInvited: (v: { email: string; role: string }[]) => void; say: (t: string) => void; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [access, setAccess] = useState('restricted');
  const link = 'https://ifiok.ng/d/k3x9a';
  return (
    <Dialog title={tr('Share "{name}"', { name })} onClose={onClose} foot={<><button type="button" className="ex-btn" onClick={() => { navigator.clipboard?.writeText(link).catch(() => {}); say(tr('Link copied')); }}><Link2 aria-hidden="true" />{tr('Copy link')}</button><span className="grow" /><button type="button" className="ex-btn p" onClick={onClose}>{tr('Done')}</button></>}>
      <form className="dx-inv" onSubmit={(e) => { e.preventDefault(); const v = email.trim(); if (/^\S+@\S+\.\S+$/.test(v)) { setInvited([...invited, { email: v, role }]); setEmail(''); say(tr('Invite sent to {email}', { email: v })); } }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr('Add people by email')} aria-label={tr('Add people by email')} />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label={tr('Role')}><option value="editor">{tr('Editor')}</option><option value="commenter">{tr('Commenter')}</option><option value="viewer">{tr('Viewer')}</option></select>
        <button className="ex-btn p" type="submit">{tr('Invite')}</button>
      </form>
      <p className="ex-h">{tr('People with access')}</p>
      <ul className="dx-plist">
        <li><span className="av a">Y</span><div><b>{tr('You')}</b><small>you@example.com</small></div><em>{tr('Owner')}</em></li>
        <li><span className="av b">T</span><div><b>Tunde Adebayo</b><small>tunde@example.com</small></div><em>{tr('Editor')}</em></li>
        {invited.map((p) => <li key={p.email}><span className="av c">{p.email[0].toUpperCase()}</span><div><b>{p.email}</b><small>{tr('Invite sent')}</small></div><em>{tr(p.role === 'editor' ? 'Editor' : p.role === 'viewer' ? 'Viewer' : 'Commenter')}</em></li>)}
      </ul>
      <p className="ex-h">{tr('General access')}</p>
      <div className="dx-two">
        <Field label={tr('Who can open')}><select value={access} onChange={(e) => setAccess(e.target.value)}><option value="restricted">{tr('Restricted: only people added')}</option><option value="link">{tr('Anyone with the link')}</option></select></Field>
        <a className="ex-btn wa" href={`https://wa.me/?text=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer">{tr('Share on WhatsApp')}</a>
      </div>
    </Dialog>
  );
}

export function VersionsDialog({ onRestore, onClose }: { onRestore: (id: string) => void; onClose: () => void }) {
  const [sel, setSel] = useState('v1');
  return (
    <Dialog title={tr('Version history')} onClose={onClose} foot={<><button type="button" className="ex-btn" onClick={onClose}>{tr('Cancel')}</button><button type="button" className="ex-btn p" disabled={sel === 'v0'} onClick={() => { onRestore(sel); onClose(); }}>{tr('Restore this version')}</button></>}>
      <ul className="dx-vers">
        {VERSIONS.map((v) => (
          <li key={v.id}><button type="button" aria-pressed={sel === v.id} onClick={() => setSel(v.id)}><span className="av">{v.who[0]}</span><span><b>{tr(v.name)}</b><small>{tr(v.when)}</small></span></button></li>
        ))}
      </ul>
    </Dialog>
  );
}

export function OpenDialog({ onOpen, onClose }: { onOpen: (tpl: string, title: string) => void; onClose: () => void }) {
  return (
    <Dialog title={tr('Open a document')} onClose={onClose}>
      <p className="ex-h">{tr('Recent')}</p>
      <ul className="dx-vers">
        {RECENT.map((r) => <li key={r.id}><button type="button" onClick={() => { onOpen(r.tpl, tr(r.title)); onClose(); }}><span className="av doc">D</span><span><b>{tr(r.title)}</b><small>{tr(r.when)}</small></span></button></li>)}
      </ul>
      <p className="muted">{tr('All your Ifiok Docs and Ifiok Designs files are in your dashboard.')}</p>
    </Dialog>
  );
}

export function DetailsDialog({ name, words, pages, onClose }: { name: string; words: number; pages: number; onClose: () => void }) {
  const rows: [string, string][] = [[tr('Name'), name], [tr('Type'), tr('Ifiok Docs document')], [tr('Owner'), tr('You')], [tr('Last edited'), tr('Just now')], [tr('Created'), '12 Jul 2026'], [tr('Pages'), String(pages)], [tr('Words'), String(words)]];
  return (
    <Dialog title={tr('Details')} onClose={onClose} foot={<button type="button" className="ex-btn p" onClick={onClose}>{tr('Done')}</button>}>
      <dl className="dx-det">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    </Dialog>
  );
}

export function HeaderFooterDialog({ header, footer, numbers, onApply, onClose }: { header: string; footer: string; numbers: 'off' | 'footer' | 'header'; onApply: (h: string, f: string, n: 'off' | 'footer' | 'header') => void; onClose: () => void }) {
  const [h, setH] = useState(header); const [f, setF] = useState(footer); const [n, setN] = useState(numbers);
  return (
    <Dialog title={tr('Headers and footers')} onClose={onClose} foot={<><button type="button" className="ex-btn" onClick={onClose}>{tr('Cancel')}</button><button type="button" className="ex-btn p" onClick={() => { onApply(h, f, n); onClose(); }}>{tr('Apply')}</button></>}>
      <Field label={tr('Header text')}><input value={h} onChange={(e) => setH(e.target.value)} maxLength={80} /></Field>
      <Field label={tr('Footer text')}><input value={f} onChange={(e) => setF(e.target.value)} maxLength={80} /></Field>
      <Field label={tr('Page numbers')}><select value={n} onChange={(e) => setN(e.target.value as 'off' | 'footer' | 'header')}><option value="off">{tr('No page numbers')}</option><option value="footer">{tr('Footer, centred')}</option><option value="header">{tr('Header, right')}</option></select></Field>
    </Dialog>
  );
}

export function ReviewDialog({ ed, onChange, onClose }: { ed: HTMLElement; onChange: () => void; onClose: () => void }) {
  const [n, setN] = useState(() => ed.querySelectorAll('ins.dx-ins, del.dx-del').length);
  const accept = () => { ed.querySelectorAll('del.dx-del').forEach((d) => d.remove()); ed.querySelectorAll('ins.dx-ins').forEach((i) => i.replaceWith(...Array.from(i.childNodes))); setN(0); onChange(); };
  const reject = () => { ed.querySelectorAll('ins.dx-ins').forEach((d) => d.remove()); ed.querySelectorAll('del.dx-del').forEach((i) => i.replaceWith(...Array.from(i.childNodes))); setN(0); onChange(); };
  return (
    <Dialog title={tr('Review suggested edits')} onClose={onClose} foot={<><button type="button" className="ex-btn" disabled={!n} onClick={reject}>{tr('Reject all')}</button><button type="button" className="ex-btn p" disabled={!n} onClick={accept}>{tr('Accept all')}</button></>}>
      <p>{n ? tr('{count} suggested edits in this document.', { count: n }) : tr('There are no suggested edits. Switch to Suggesting mode to make some.')}</p>
    </Dialog>
  );
}

export function MoveDialog({ onMove, onClose }: { onMove: (name: string) => void; onClose: () => void }) {
  return (
    <Dialog title={tr('Move to folder')} onClose={onClose}>
      <ul className="dx-vers">{FOLDERS.map((f) => <li key={f.id}><button type="button" onClick={() => { onMove(tr(f.name)); onClose(); }}><span className="av doc">F</span><span><b>{tr(f.name)}</b></span></button></li>)}</ul>
    </Dialog>
  );
}

export function ConfirmDialog({ title, body, yes, onYes, onClose }: { title: string; body: string; yes: string; onYes: () => void; onClose: () => void }) {
  return (
    <Dialog title={title} onClose={onClose} foot={<><button type="button" className="ex-btn" onClick={onClose}>{tr('Cancel')}</button><button type="button" className="ex-btn p" onClick={() => { onYes(); onClose(); }}>{yes}</button></>}>
      <p>{body}</p>
    </Dialog>
  );
}

/* ───── Search the menus (Alt+/) ───── */
type Flat = { id: string; label: string; path: string; key?: string };
function flatten(items: MI[], path: string, out: Flat[]) {
  items.forEach((it) => {
    if (it.sub) flatten(it.sub, `${path} › ${tr(it.label)}`, out);
    else if (it.id && it.label) out.push({ id: it.id, label: tr(it.label), path, key: it.key });
  });
}
export function MenuSearchDialog({ run, onClose }: { run: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const all = useMemo(() => { const out: Flat[] = []; MENUS.forEach((m) => flatten(m.items, tr(m.label), out)); return out; }, []);
  const list = all.filter((f) => f.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 40);
  return (
    <div className="ex-scrim top" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ex-palette" role="dialog" aria-modal="true" aria-label={tr('Search the menus')}>
        <label className="ex-search big"><Search aria-hidden="true" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Search the menus')} aria-label={tr('Search the menus')}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && list[0]) { onClose(); run(list[0].id); } }} /></label>
        <ul>{list.map((f) => <li key={f.id}><button type="button" onClick={() => { onClose(); run(f.id); }}><span className="lb">{f.label}<small>{f.path}</small></span>{f.key && <kbd>{f.key}</kbd>}</button></li>)}
          {!list.length && <li className="none">{tr('No matching menu items')}</li>}</ul>
      </div>
    </div>
  );
}
