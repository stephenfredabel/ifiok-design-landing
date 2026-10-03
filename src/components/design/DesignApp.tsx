'use client';

import { Bell, LayoutGrid, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { Mark } from '@/components/Mark';
import { asset } from '@/lib/asset';
import { DetailPanel, NewDesignDialog, Palette, Toast, type NewDesignSeed } from './overlays';
import { EDITOR } from './parts';
import { AccountView, HomeView, OrdersView, PlaceholderView, ProjectsView, TemplatesView } from './views';
import { NAV, SAMPLE_DESIGNS, SAMPLE_ORDERS, USER, formatById, type Design, type NavItem, type Template } from './data';
import './design.css';

const VIEWS = new Set([...NAV.map((n) => n.id), 'account']);
const STORE = 'ifiok.dsg.v1';
type ToastState = { msg: string; href?: string; label?: string; action?: () => void } | null;

export default function DesignApp() {
  const [view, setView] = useState('home');
  const [designs, setDesigns] = useState<Design[]>(SAMPLE_DESIGNS);
  const [hydrated, setHydrated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [seed, setSeed] = useState<NewDesignSeed>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Load saved designs and the page from the address after mount, so server and client agree on first paint.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setDesigns(parsed); }
      if (localStorage.getItem('ifiok.dsg.collapsed') === '1') setCollapsed(true);
    } catch {}
    const fromHash = () => { const h = location.hash.slice(1); setView(VIEWS.has(h) ? h : 'home'); };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    setHydrated(true);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE, JSON.stringify(designs)); } catch {}
  }, [designs, hydrated]);

  const go = useCallback((v: string) => {
    setView(v);
    setDrawer(false);
    history.replaceState(null, '', v === 'home' ? location.pathname : `#${v}`);
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  const say = useCallback((t: ToastState) => setToast(t), []);

  const create = useCallback((v: { name: string; formatId: string; accent: string; headline?: string; sub?: string }) => {
    const f = formatById(v.formatId);
    const d: Design = { id: 'n' + Date.now(), name: v.name, formatId: v.formatId, accent: v.accent, headline: v.headline ?? v.name, sub: v.sub ?? f.note, stage: 'draft', edited: 'Just now' };
    setDesigns((l) => [d, ...l]);
    setSeed(null);
    say({ msg: `Created “${v.name}”`, href: EDITOR, label: 'Open in editor' });
  }, [say]);

  const duplicate = useCallback((id: string) => {
    setDesigns((l) => { const i = l.findIndex((d) => d.id === id); if (i < 0) return l; const c = { ...l[i], id: 'n' + Date.now(), name: l[i].name + ' (copy)', edited: 'Just now', stage: 'draft' as const }; return [c, ...l]; });
    say({ msg: 'Duplicated' });
  }, [say]);

  const designsRef = useRef(designs);
  designsRef.current = designs;
  const remove = useCallback((id: string) => {
    const list = designsRef.current;
    const at = list.findIndex((d) => d.id === id);
    const r = list[at];
    if (!r) return;
    setDesigns(list.filter((d) => d.id !== id));
    say({ msg: `Deleted “${r.name}”`, label: 'Undo', action: () => setDesigns((l) => { const n = [...l]; n.splice(Math.min(at, n.length), 0, r); return n; }) });
  }, [say]);

  const useTemplate = useCallback((t: Template) => setSeed({ formatId: t.formatId, name: t.name, accent: t.accent, headline: t.headline, sub: t.sub }), []);
  const openDetail = useCallback((id: string) => setDetail(id), []);
  const newFrom = useCallback((s: NewDesignSeed) => setSeed(s ?? {}), []);
  const ops = useMemo(() => ({ openDetail, duplicate, remove }), [openDetail, duplicate, remove]);

  // Keyboard: / or Ctrl/Cmd+K to search, N for a new design.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); setPalette(true); }
      else if (!typing && e.key === '/') { e.preventDefault(); setPalette(true); }
      else if (!typing && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); setSeed({}); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);

  const detailDesign = designs.find((d) => d.id === detail) ?? null;
  const item = NAV.find((n) => n.id === view) as NavItem;
  const groups: { id: NavItem['group']; label?: string }[] = [{ id: 'create' }, { id: 'grow', label: 'Grow' }, { id: 'print', label: 'Print' }, { id: 'foot' }];

  const navButton = (n: NavItem) => {
    const inner = (<><n.Icon aria-hidden="true" /><span className="nv-l">{n.label}</span>{n.badge && <em className="nv-b">{n.badge}</em>}</>);
    return n.href ? (
      <a key={n.id} className="nv" href={n.href} target="_blank" rel="noopener noreferrer" title={n.label}>{inner}</a>
    ) : (
      <button key={n.id} type="button" className="nv" aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)} title={n.label}>{inner}</button>
    );
  };

  return (
    <div className="d-app" data-collapsed={collapsed ? '' : undefined}>
      <header className="d-top">
        <button type="button" className="ib menu-m" aria-label="Open menu" onClick={() => setDrawer(true)}><MenuIcon aria-hidden="true" /></button>
        <button type="button" className="ib menu-d" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((c) => { try { localStorage.setItem('ifiok.dsg.collapsed', c ? '0' : '1'); } catch {} return !c; })}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
        <a className="d-logo" href={asset('/')} aria-label="Ifiok Designs"><Mark /><b>ifiok</b><span>DESIGNS</span></a>
        <button type="button" className="d-search" onClick={() => setPalette(true)} aria-label="Search">
          <Search aria-hidden="true" /><span>Search your designs, templates…</span><kbd>/</kbd>
        </button>
        <span className="grow" />
        <button type="button" className="btn-p top-new d-only" onClick={() => setSeed({})}><Plus aria-hidden="true" /><span>New design</span></button>
        <a className="ib hide-s" href={asset('/get-app/')} aria-label="All Ifiok apps" title="All Ifiok apps"><LayoutGrid aria-hidden="true" /></a>
        <button type="button" className="ib hide-s" aria-label="Notifications" onClick={() => say({ msg: 'You are all caught up.' })}><Bell aria-hidden="true" /></button>
        <span className="d-only"><ThemeToggle /></span>
        <button type="button" className="avatar" title="Account" aria-label="Account" onClick={() => go('account')}>{USER.initial}</button>
      </header>

      <div className="d-scrim" data-open={drawer ? '' : undefined} onClick={() => setDrawer(false)} />
      <aside className="d-rail" data-open={drawer ? '' : undefined} aria-label="Sidebar">
        <div className="rail-head">
          <a className="d-logo" href={asset('/')} aria-label="Ifiok Designs"><Mark /><b>ifiok</b><span>DESIGNS</span></a>
          <button type="button" className="ib" aria-label="Close menu" onClick={() => setDrawer(false)}><X aria-hidden="true" /></button>
        </div>
        <button type="button" className="rail-new" onClick={() => { setDrawer(false); setSeed({}); }}><Plus aria-hidden="true" /><span className="nv-l">Create</span></button>
        <div className="rail-theme"><span>Theme</span><ThemeToggle /></div>
        <nav>
          {groups.map((g) => (
            <div className="nv-g" key={g.id}>
              {g.label && <p className="nv-h">{g.label}</p>}
              {NAV.filter((n) => n.group === g.id).map(navButton)}
            </div>
          ))}
        </nav>
      </aside>

      <main className="d-main" ref={mainRef} id="main">
        {view === 'home' && <HomeView designs={designs} orders={SAMPLE_ORDERS} ops={ops} go={go} newFrom={newFrom} openPalette={() => setPalette(true)} useTemplate={useTemplate} />}
        {view === 'projects' && <ProjectsView designs={designs} ops={ops} newFrom={newFrom} />}
        {view === 'templates' && <TemplatesView useTemplate={useTemplate} />}
        {view === 'orders' && <OrdersView orders={SAMPLE_ORDERS} designs={designs} ops={ops} />}
        {view === 'account' && <AccountView />}
        {!['home', 'projects', 'templates', 'orders', 'account'].includes(view) && item && <PlaceholderView item={item} />}
        <p className="sample-note">Sample data. Your real designs, orders and templates load from the live app.</p>
      </main>

      <nav className="d-tabs" aria-label="Main">
        {([['home', 'Home'], ['templates', 'Templates']] as const).map(([id, label]) => { const n = NAV.find((x) => x.id === id)!; return <button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}><span className="pill"><n.Icon aria-hidden="true" /></span><span>{label}</span></button>; })}
        <button type="button" className="fab" aria-label="New design" onClick={() => setSeed({})}><Plus aria-hidden="true" /></button>
        {([['projects', 'Files'], ['orders', 'Orders']] as const).map(([id, label]) => { const n = NAV.find((x) => x.id === id)!; return <button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}><span className="pill"><n.Icon aria-hidden="true" /></span><span>{label}</span></button>; })}
      </nav>

      <NewDesignDialog seed={seed} onClose={() => setSeed(null)} onCreate={create} />
      <DetailPanel d={detailDesign} onClose={() => setDetail(null)} onDuplicate={duplicate} onDelete={remove} />
      <Palette open={palette} onClose={() => setPalette(false)} designs={designs} go={go} openDetail={(id) => setDetail(id)} newFrom={newFrom} />
      <Toast t={toast} onClose={() => setToast(null)} />
    </div>
  );
}
