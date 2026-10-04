'use client';

import { Bell, LayoutGrid, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Plus, Search, Wallet, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import LangMenu from '@/components/LangMenu';
import { asset } from '@/lib/asset';
import { NewTemplateDialog, PayoutDialog, TemplatePanel, type NewSeed } from '@/components/creator/dialogs';
import { CreatorProvider, balances, mask, useCreator, type Say } from '@/components/creator/store';
import { CTemplatesView, CreatorHomeStrip, GuidelinesView, PayoutsView, ProfileView, StudioView } from '@/components/creator/views';
import FontsView from '@/components/fonts/FontsView';
import { FontStudioView, MyFontPanel, NewFontDialog } from '@/components/fonts/FontStudio';
import { useSampleFonts } from '@/components/fonts/parts';
import type { FontEntry } from '@/data/fonts';
import { DetailPanel, NewChooser, NewDesignDialog, Palette, Toast, type DesignFont, type NewDesignSeed, type NewKind } from './overlays';
import { EDITOR } from './parts';
import { AccountView, HomeView, OrdersView, PlaceholderView, ProjectsView, TemplatesView } from './views';
import { CREATOR_NAV, NAV, SAMPLE_DESIGNS, SAMPLE_ORDERS, USER, formatById, type Design, type NavItem, type Template } from './data';
import './design.css';
import '@/components/creator/creator.css';
import '@/components/fonts/fonts.css';

const STORE = 'ifiok.dsg.v1';
type ToastState = { msg: string; href?: string; label?: string; action?: () => void } | null;
type PayTab = 'summary' | 'earnings' | 'history' | 'details';

/** The design dashboard. Pass creator to add the creator tools: templates, fonts and earnings. */
export default function DesignApp({ creator = false }: { creator?: boolean }) {
  const [toast, setToast] = useState<ToastState>(null);
  const say = useCallback<Say>((t) => setToast(typeof t === 'string' ? { msg: t } : t), []);
  const shell = <Shell creator={creator} say={say} />;
  return (
    <>
      {creator ? <CreatorProvider say={say}>{shell}</CreatorProvider> : shell}
      <Toast t={toast} onClose={() => setToast(null)} />
    </>
  );
}

function Shell({ creator, say }: { creator: boolean; say: Say }) {
  const nav = useMemo(() => (creator ? [...NAV, ...CREATOR_NAV] : NAV), [creator]);
  const views = useMemo(() => new Set([...nav.map((n) => n.id), 'account', 'guidelines', 'profile']), [nav]);
  const C = useCreator();
  useSampleFonts();

  const [view, setView] = useState('home');
  const [designs, setDesigns] = useState<Design[]>(SAMPLE_DESIGNS);
  const [hydrated, setHydrated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [seed, setSeed] = useState<NewDesignSeed>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const [chooser, setChooser] = useState(false);
  const [tSeed, setTSeed] = useState<NewSeed>(null);
  const [openT, setOpenT] = useState<string | null>(null);
  const [fontDlg, setFontDlg] = useState<{ open: boolean; initial: FontEntry | null }>({ open: false, initial: null });
  const [openF, setOpenF] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payTab, setPayTab] = useState<PayTab>('summary');
  const mainRef = useRef<HTMLElement>(null);

  // Load saved designs and the page from the address after mount, so server and client agree on first paint.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setDesigns(parsed); }
      if (localStorage.getItem('ifiok.dsg.collapsed') === '1') setCollapsed(true);
    } catch {}
    const fromHash = () => { const h = location.hash.slice(1); setView(views.has(h) ? h : 'home'); };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    setHydrated(true);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [views]);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE, JSON.stringify(designs)); } catch {}
  }, [designs, hydrated]);

  const go = useCallback((v: string) => {
    setView(v); setDrawer(false);
    history.replaceState(null, '', v === 'home' ? location.pathname : `#${v}`);
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  const create = useCallback((v: { name: string; formatId: string; accent: string; headline?: string; sub?: string; font?: DesignFont }) => {
    const f = formatById(v.formatId);
    const d: Design = { id: 'n' + Date.now(), name: v.name, formatId: v.formatId, accent: v.accent, headline: v.headline ?? v.name, sub: v.sub ?? f.note, stage: 'draft', edited: 'Just now', font: v.font };
    setDesigns((l) => [d, ...l]);
    setSeed(null);
    say({ msg: `Created “${v.name}”`, href: EDITOR, label: 'Open in editor' });
  }, [say]);
  const duplicate = useCallback((id: string) => {
    setDesigns((l) => { const i = l.findIndex((d) => d.id === id); if (i < 0) return l; return [{ ...l[i], id: 'n' + Date.now(), name: l[i].name + ' (copy)', edited: 'Just now', stage: 'draft' as const }, ...l]; });
    say('Duplicated');
  }, [say]);
  const designsRef = useRef(designs); designsRef.current = designs;
  const remove = useCallback((id: string) => {
    const list = designsRef.current; const at = list.findIndex((d) => d.id === id); const r = list[at];
    if (!r) return;
    setDesigns(list.filter((d) => d.id !== id));
    say({ msg: `Deleted “${r.name}”`, label: 'Undo', action: () => setDesigns((l) => { const n = [...l]; n.splice(Math.min(at, n.length), 0, r); return n; }) });
  }, [say]);

  const useTemplate = useCallback((t: Template) => setSeed({ formatId: t.formatId, name: t.name, accent: t.accent, headline: t.headline, sub: t.sub }), []);
  const useFont = useCallback((f: FontEntry) => { setOpenF(null); setSeed({ name: `Design in ${f.family}`, font: { css: f.css, family: f.family, cat: f.cat } }); }, []);
  const openDetail = useCallback((id: string) => setDetail(id), []);
  const newFrom = useCallback((s: NewDesignSeed) => setSeed(s ?? {}), []);
  const ops = useMemo(() => ({ openDetail, duplicate, remove }), [openDetail, duplicate, remove]);

  // "New" asks creators what they are making; everyone else goes straight to a design.
  const startNew = useCallback(() => (creator ? setChooser(true) : setSeed({})), [creator]);
  const pick = (k: NewKind) => { setChooser(false); if (k === 'design') setSeed({}); else if (k === 'template') setTSeed({}); else setFontDlg({ open: true, initial: null }); };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable;
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setPalette(true); }
      else if (!typing && e.key === '/') { e.preventDefault(); setPalette(true); }
      else if (!typing && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); startNew(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [startNew]);

  const detailDesign = designs.find((d) => d.id === detail) ?? null;
  const item = nav.find((n) => n.id === view) as NavItem | undefined;
  const groups: { id: NavItem['group']; label?: string }[] = [{ id: 'create' }, ...(creator ? [{ id: 'studio' as const, label: 'Creator' }] : []), { id: 'grow', label: 'Grow' }, { id: 'print', label: 'Print' }, { id: 'foot' }];
  const titles: Record<string, string> = { projects: 'Files', orders: 'Orders', account: 'Account', studio: 'Studio', ctemplates: 'Templates', cfonts: 'Fonts', wallet: 'Earnings', guidelines: 'Guidelines', profile: 'Profile', fonts: 'Fonts' };
  const title = titles[view] ?? item?.label ?? 'Home';

  const bal = C ? balances(C.ledger) : null;
  const first = (C?.profile.name ?? USER.first).split(' ')[0] || 'there';
  const myTemplate = C?.templates.find((t) => t.id === openT) ?? null;
  const myFont = C?.fonts.find((f) => f.id === openF) ?? null;

  const navButton = (n: NavItem) => {
    const inner = (<><n.Icon aria-hidden="true" /><span className="nv-l">{n.label}</span>{n.badge && <em className="nv-b">{n.badge}</em>}</>);
    return n.href ? (
      <a key={n.id} className="nv" href={n.href} target="_blank" rel="noopener noreferrer" title={n.label}>{inner}</a>
    ) : (
      <button key={n.id} type="button" className="nv" aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)} title={n.label}>{inner}</button>
    );
  };
  const tab = (id: string, label: string, Icon: NavItem['Icon']) => (
    <button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}><span className="pill"><Icon aria-hidden="true" /></span><span>{label}</span></button>
  );
  const byId = (id: string) => nav.find((n) => n.id === id)!;

  return (
    <div className={`d-app${creator ? ' cd-app' : ''}`} data-collapsed={collapsed ? '' : undefined}>
      <header className="d-top">
        <button type="button" className="ib menu-m" aria-label="Open menu" onClick={() => setDrawer(true)}><MenuIcon aria-hidden="true" /></button>
        <button type="button" className="ib menu-d" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((c) => { try { localStorage.setItem('ifiok.dsg.collapsed', c ? '0' : '1'); } catch {} return !c; })}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
        <h1 className="d-title m-only">{title}</h1>
        {creator && <span className="role-pill d-only">Creator</span>}
        <button type="button" className="d-search d-only" onClick={() => setPalette(true)} aria-label="Search">
          <Search aria-hidden="true" /><span>Search your designs, templates…</span><kbd>/</kbd>
        </button>
        <span className="grow" />
        {bal && <button type="button" className="cd-bal-chip d-only" onClick={() => go('wallet')} aria-label={`Available balance ${bal.available.toLocaleString('en-NG')} naira. Open earnings`}><Wallet aria-hidden="true" /><span>Available</span><b>₦{bal.available.toLocaleString('en-NG')}</b></button>}
        <button type="button" className="btn-p top-new d-only" onClick={startNew}><Plus aria-hidden="true" /><span>{creator ? 'New' : 'New design'}</span></button>
        <LangMenu className="ib lang-ib" />
        <a className="ib hide-s" href={asset('/get-app/')} aria-label="All Ifiok apps" title="All Ifiok apps"><LayoutGrid aria-hidden="true" /></a>
        <button type="button" className="ib hide-s" aria-label="Notifications" onClick={() => say('You are all caught up.')}><Bell aria-hidden="true" /></button>
        <span className="d-only"><ThemeToggle /></span>
        <button type="button" className="avatar" title="Account" aria-label="Account" onClick={() => go('account')}>{(C?.profile.name ?? USER.name).charAt(0).toUpperCase()}</button>
      </header>

      <div className="d-scrim" data-open={drawer ? '' : undefined} onClick={() => setDrawer(false)} />
      <aside className="d-rail" data-open={drawer ? '' : undefined} aria-label="Sidebar">
        <div className="rail-head"><span className="rail-title">{creator ? 'Creator menu' : 'Menu'}</span><button type="button" className="ib" aria-label="Close menu" onClick={() => setDrawer(false)}><X aria-hidden="true" /></button></div>
        <button type="button" className="rail-new" onClick={() => { setDrawer(false); startNew(); }}><Plus aria-hidden="true" /><span className="nv-l">Create</span></button>
        <div className="rail-theme"><span>Theme</span><ThemeToggle /></div>
        <nav>
          {groups.map((g) => (
            <div className="nv-g" key={g.id}>
              {g.label && <p className="nv-h">{g.label}</p>}
              {nav.filter((n) => n.group === g.id).map(navButton)}
            </div>
          ))}
        </nav>
      </aside>

      <main className="d-main" ref={mainRef} id="main">
        {view === 'home' && (
          <HomeView designs={designs} orders={SAMPLE_ORDERS} ops={ops} go={go} newFrom={newFrom} openPalette={() => setPalette(true)} useTemplate={useTemplate}
            slot={C ? <CreatorHomeStrip mine={{ templates: C.templates, fonts: C.fonts, ledger: C.ledger, account: C.account }} go={go} newTemplate={() => setTSeed({})} newFont={() => setFontDlg({ open: true, initial: null })} /> : undefined} />
        )}
        {view === 'projects' && <ProjectsView designs={designs} ops={ops} newFrom={newFrom} />}
        {view === 'templates' && <TemplatesView useTemplate={useTemplate} />}
        {view === 'fonts' && <FontsView extra={C?.approvedFonts ?? []} onUse={useFont} />}
        {view === 'orders' && <OrdersView orders={SAMPLE_ORDERS} designs={designs} ops={ops} />}
        {view === 'account' && <AccountView />}
        {C && view === 'studio' && <StudioView mine={{ templates: C.templates, fonts: C.fonts, ledger: C.ledger, account: C.account }} first={first} ops={{ open: (id) => setOpenT(id), duplicate: C.duplicateTemplate, remove: C.removeTemplate }} fontOps={{ open: (id) => setOpenF(id) }} go={go} newTemplate={() => setTSeed({})} newFont={() => setFontDlg({ open: true, initial: null })} />}
        {C && view === 'ctemplates' && <CTemplatesView templates={C.templates} ops={{ open: (id) => setOpenT(id), duplicate: C.duplicateTemplate, remove: C.removeTemplate }} newTemplate={(k) => setTSeed(k ? { kindId: k } : {})} />}
        {C && view === 'cfonts' && <FontStudioView fonts={C.fonts} onNew={() => setFontDlg({ open: true, initial: null })} onOpen={(id) => setOpenF(id)} />}
        {C && view === 'wallet' && <PayoutsView ledger={C.ledger} payouts={C.payouts} account={C.account} name={C.profile.name} tab={payTab} setTab={setPayTab} onSaveAccount={(a) => { C.saveAccount(a); setPayTab('summary'); }} onClearAccount={C.clearAccount} onRequest={() => setPaying(true)} onSimulatePaid={C.simulatePaid} />}
        {C && view === 'guidelines' && <GuidelinesView />}
        {C && view === 'profile' && <ProfileView profile={C.profile} setProfile={C.setProfile} approved={C.templates.filter((t) => t.status === 'approved').length + C.fonts.filter((f) => f.status === 'approved').length} say={say} />}
        {!['home', 'projects', 'templates', 'fonts', 'orders', 'account', 'studio', 'ctemplates', 'cfonts', 'wallet', 'guidelines', 'profile'].includes(view) && item && <PlaceholderView item={item} />}
        <p className="sample-note">Sample data{creator ? ' and example amounts' : ''}. Your real {creator ? 'templates, fonts, earnings' : 'designs, orders'} and templates load from the live app.</p>
      </main>

      <nav className="d-tabs" aria-label="Main">
        {creator ? (
          <>
            {tab('home', 'Home', byId('home').Icon)}{tab('projects', 'Files', byId('projects').Icon)}
            <button type="button" className="fab" aria-label="New" onClick={startNew}><Plus aria-hidden="true" /></button>
            {tab('studio', 'Studio', byId('studio').Icon)}{tab('wallet', 'Earnings', byId('wallet').Icon)}
          </>
        ) : (
          <>
            {tab('home', 'Home', byId('home').Icon)}{tab('templates', 'Templates', byId('templates').Icon)}
            <button type="button" className="fab" aria-label="New design" onClick={startNew}><Plus aria-hidden="true" /></button>
            {tab('projects', 'Files', byId('projects').Icon)}{tab('orders', 'Orders', byId('orders').Icon)}
          </>
        )}
      </nav>

      <NewChooser open={chooser} onClose={() => setChooser(false)} onPick={pick} />
      <NewDesignDialog seed={seed} onClose={() => setSeed(null)} onCreate={create} />
      <DetailPanel d={detailDesign} onClose={() => setDetail(null)} onDuplicate={duplicate} onDelete={remove} />
      <Palette nav={nav} open={palette} onClose={() => setPalette(false)} designs={designs} go={go} openDetail={(id) => setDetail(id)} newFrom={newFrom} />
      {C && (
        <>
          <NewTemplateDialog seed={tSeed} onClose={() => setTSeed(null)} onCreate={(v) => { const t = C.createTemplate(v); setTSeed(null); say({ msg: `Created “${v.name}”`, href: EDITOR, label: 'Open in editor' }); setOpenT(t.id); }} />
          <TemplatePanel t={myTemplate} onClose={() => setOpenT(null)} onDuplicate={C.duplicateTemplate} onDelete={C.removeTemplate} onSubmit={C.submitTemplate} onSimulate={C.decideTemplate} onPayouts={() => go('wallet')} />
          <NewFontDialog open={fontDlg.open} initial={fontDlg.initial} onClose={() => setFontDlg({ open: false, initial: null })}
            onSave={(f, submit) => { C.saveFont(f); setFontDlg({ open: false, initial: null }); setOpenF(null); say(submit ? 'Submitted. The Ifiok team will review your font.' : 'Saved as a draft.'); go('cfonts'); }} />
          <MyFontPanel f={myFont} onClose={() => setOpenF(null)} onEdit={(f) => { setOpenF(null); setFontDlg({ open: true, initial: f }); }} onDelete={C.removeFont} onSubmit={C.submitFont} onDecide={C.decideFont} onUse={useFont} onWallet={() => go('wallet')} />
          <PayoutDialog open={paying} amount={bal?.available ?? 0} account={C.account ? mask(C.account) : ''} onClose={() => setPaying(false)} onConfirm={() => { C.requestPayout(); setPaying(false); setPayTab('history'); }} />
        </>
      )}
    </div>
  );
}
