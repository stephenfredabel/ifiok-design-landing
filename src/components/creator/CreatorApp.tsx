'use client';

import { Bell, BookOpen, FolderOpen, Home, LayoutGrid, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Plus, UserRound, Wallet, X, Palette } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LangMenu from '@/components/LangMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { Toast } from '@/components/design/overlays';
import { asset } from '@/lib/asset';
import { SAMPLE_LEDGER, SAMPLE_PAYOUTS, SAMPLE_TEMPLATES, kindById, naira, type CTemplate, type Entry, type Payout } from '@/data/creator-app';
import { NewTemplateDialog, PayoutDialog, TemplatePanel, type NewSeed, type SubmitData } from './dialogs';
import { GuidelinesView, OverviewView, PayoutsView, ProfileView, TemplatesView, balances, mask, type Account, type Profile } from './views';
import '@/components/design/design.css';
import './creator.css';

const STORE = 'ifiok.creator.v1';
const VIEWS = ['home', 'templates', 'payouts', 'guidelines', 'profile'] as const;
type View = (typeof VIEWS)[number];
type PayTab = 'summary' | 'earnings' | 'history' | 'details';
type ToastState = { msg: string; href?: string; label?: string; action?: () => void } | null;

const NAV: { id: View; label: string; Icon: typeof Home; group: 'main' | 'more' }[] = [
  { id: 'home', label: 'Home', Icon: Home, group: 'main' },
  { id: 'templates', label: 'Templates', Icon: FolderOpen, group: 'main' },
  { id: 'payouts', label: 'Payouts', Icon: Wallet, group: 'main' },
  { id: 'guidelines', label: 'Guidelines', Icon: BookOpen, group: 'more' },
  { id: 'profile', label: 'Profile', Icon: UserRound, group: 'more' },
];
const TITLES: Record<View, string> = { home: 'Home', templates: 'Templates', payouts: 'Payouts', guidelines: 'Guidelines', profile: 'Profile' };

export default function CreatorApp() {
  const [view, setView] = useState<View>('home');
  const [templates, setTemplates] = useState<CTemplate[]>(SAMPLE_TEMPLATES);
  const [ledger, setLedger] = useState<Entry[]>(SAMPLE_LEDGER);
  const [payouts, setPayouts] = useState<Payout[]>(SAMPLE_PAYOUTS);
  const [account, setAccount] = useState<Account | null>(null);
  const [profile, setProfile] = useState<Profile>({ name: 'Stephen Fredabel', handle: 'stephen', bio: '', campus: 'University of Lagos (UNILAG)', link: '' });
  const [hydrated, setHydrated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [seed, setSeed] = useState<NewSeed>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payTab, setPayTab] = useState<PayTab>('summary');
  const [toast, setToast] = useState<ToastState>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.templates)) setTemplates(d.templates);
        if (Array.isArray(d.ledger)) setLedger(d.ledger);
        if (Array.isArray(d.payouts)) setPayouts(d.payouts);
        if ('account' in d) setAccount(d.account);
        if (d.profile) setProfile(d.profile);
      }
      if (localStorage.getItem('ifiok.creator.collapsed') === '1') setCollapsed(true);
    } catch {}
    const fromHash = () => { const h = location.hash.slice(1) as View; setView((VIEWS as readonly string[]).includes(h) ? h : 'home'); };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    setHydrated(true);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE, JSON.stringify({ templates, ledger, payouts, account, profile })); } catch {}
  }, [templates, ledger, payouts, account, profile, hydrated]);

  const say = useCallback((t: ToastState | string) => setToast(typeof t === 'string' ? { msg: t } : t), []);
  const go = useCallback((v: string) => {
    const next = (VIEWS as readonly string[]).includes(v) ? (v as View) : 'home';
    setView(next); setDrawer(false);
    history.replaceState(null, '', next === 'home' ? location.pathname : `#${next}`);
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  const tref = useRef(templates); tref.current = templates;
  const create = useCallback((v: { name: string; kindId: string; accent: string; fonts: string }) => {
    const k = kindById(v.kindId);
    const t: CTemplate = { id: 'n' + Date.now(), name: v.name, kindId: v.kindId, accent: v.accent, headline: v.name, sub: k.size, status: 'draft', updated: 'Just now', fonts: v.fonts, notes: [] };
    setTemplates((l) => [t, ...l]);
    setSeed(null);
    say({ msg: `Created “${v.name}”`, href: 'https://designs.ifiok.ng/editor', label: 'Open in editor' });
    setOpen(t.id);
  }, [say]);
  const duplicate = useCallback((id: string) => {
    setTemplates((l) => { const i = l.findIndex((t) => t.id === id); if (i < 0) return l; return [{ ...l[i], id: 'n' + Date.now(), name: l[i].name + ' (copy)', status: 'draft' as const, updated: 'Just now', submitted: undefined, decided: undefined, notes: [] }, ...l]; });
    say('Duplicated as a draft.');
  }, [say]);
  const remove = useCallback((id: string) => {
    const list = tref.current; const at = list.findIndex((t) => t.id === id); const r = list[at];
    if (!r) return;
    setTemplates(list.filter((t) => t.id !== id));
    say({ msg: `Deleted “${r.name}”`, label: 'Undo', action: () => setTemplates((l) => { const n = [...l]; n.splice(Math.min(at, n.length), 0, r); return n; }) });
  }, [say]);
  const patch = (id: string, p: Partial<CTemplate>) => setTemplates((l) => l.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const submit = (id: string, d: SubmitData) => {
    const t = tref.current.find((x) => x.id === id); if (!t) return;
    patch(id, { status: 'review', submitted: 'Today', updated: 'Today', fonts: d.fonts || t.fonts, theme: d.theme ? 'Detty December' : t.theme, notes: d.notes ? [...t.notes, { by: 'you', text: d.notes, when: 'Today' }] : t.notes });
    say('Submitted. The Ifiok team will review it.');
  };
  const simulate = (id: string, r: 'approve' | 'changes' | 'reject') => {
    const t = tref.current.find((x) => x.id === id); if (!t) return;
    if (r === 'approve') {
      patch(id, { status: 'approved', decided: 'Today', updated: 'Today', notes: [...t.notes, { by: 'reviewer', text: 'Clear and easy to edit. Approved.', when: 'Today' }] });
      setLedger((l) => [...l, { id: 'e' + Date.now(), templateId: id, name: t.name, amount: kindById(t.kindId).bounty, date: 'Today', status: 'available' }]);
      say({ msg: `Approved. ${naira(kindById(t.kindId).bounty)} added to your earnings.`, label: 'Payouts', action: () => go('payouts') });
    } else if (r === 'changes') {
      patch(id, { status: 'changes', updated: 'Today', notes: [...t.notes, { by: 'reviewer', text: 'Please improve the contrast of the headline and keep all text editable, then resubmit.', when: 'Today' }] });
      say('Changes requested.');
    } else {
      patch(id, { status: 'rejected', decided: 'Today', updated: 'Today', notes: [...t.notes, { by: 'reviewer', text: 'This is too close to an existing template. Please make it your own.', when: 'Today' }] });
      say('Not approved.');
    }
  };
  const b = balances(ledger);
  const requestPayout = () => {
    if (!account) return;
    const id = 'p' + Date.now();
    const ref = `PO-${String(payouts.length + 8).padStart(4, '0')}`;
    setPayouts((l) => [{ id, ref, amount: b.available, date: 'Today', status: 'processing', account: mask(account) }, ...l]);
    setLedger((l) => l.map((e) => (e.status === 'available' ? { ...e, status: 'requested', payoutId: id } : e)));
    setPaying(false); setPayTab('history');
    say(`Payout of ${naira(b.available)} requested.`);
  };
  const simulatePaid = (id: string) => {
    setPayouts((l) => l.map((p) => (p.id === id ? { ...p, status: 'paid' } : p)));
    setLedger((l) => l.map((e) => (e.payoutId === id ? { ...e, status: 'paid' } : e)));
    say('Marked as paid (prototype).');
  };

  const ops = useMemo(() => ({ open: (id: string) => setOpen(id), duplicate, remove }), [duplicate, remove]);
  const openTemplate = templates.find((t) => t.id === open) ?? null;
  const first = profile.name.split(' ')[0] || 'there';
  const approvedCount = templates.filter((t) => t.status === 'approved').length;

  return (
    <div className="d-app cd-app" data-collapsed={collapsed ? '' : undefined}>
      <header className="d-top">
        <button type="button" className="ib menu-m" aria-label="Open menu" onClick={() => setDrawer(true)}><MenuIcon aria-hidden="true" /></button>
        <button type="button" className="ib menu-d" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((c) => { try { localStorage.setItem('ifiok.creator.collapsed', c ? '0' : '1'); } catch {} return !c; })}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
        <h1 className="d-title m-only">{TITLES[view]}</h1>
        <span className="grow" />
        <button type="button" className="cd-bal-chip d-only" onClick={() => go('payouts')} aria-label={`Available balance ${naira(b.available)}. Open payouts`}><Wallet aria-hidden="true" /><span>Available</span><b>{naira(b.available)}</b></button>
        <button type="button" className="btn-p top-new d-only" onClick={() => setSeed({})}><Plus aria-hidden="true" /><span>New template</span></button>
        <LangMenu className="ib lang-ib" />
        <a className="ib hide-s" href={asset('/design/')} aria-label="Ifiok Designs dashboard" title="Ifiok Designs dashboard"><Palette aria-hidden="true" /></a>
        <button type="button" className="ib hide-s" aria-label="Notifications" onClick={() => say('You are all caught up.')}><Bell aria-hidden="true" /></button>
        <span className="d-only"><ThemeToggle /></span>
        <button type="button" className="avatar" title="Profile" aria-label="Profile" onClick={() => go('profile')}>{profile.name.charAt(0).toUpperCase()}</button>
      </header>

      <div className="d-scrim" data-open={drawer ? '' : undefined} onClick={() => setDrawer(false)} />
      <aside className="d-rail" data-open={drawer ? '' : undefined} aria-label="Sidebar">
        <div className="rail-head"><span className="rail-title">Creator menu</span><button type="button" className="ib" aria-label="Close menu" onClick={() => setDrawer(false)}><X aria-hidden="true" /></button></div>
        <button type="button" className="rail-new" onClick={() => { setDrawer(false); setSeed({}); }}><Plus aria-hidden="true" /><span className="nv-l">New template</span></button>
        <div className="rail-theme"><span>Theme</span><ThemeToggle /></div>
        <nav>
          {(['main', 'more'] as const).map((g) => (
            <div className="nv-g" key={g}>
              {NAV.filter((n) => n.group === g).map((n) => (
                <button key={n.id} type="button" className="nv" aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)} title={n.label}>
                  <n.Icon aria-hidden="true" /><span className="nv-l">{n.label}</span>
                  {n.id === 'templates' && templates.some((t) => t.status === 'changes') && <em className="nv-b">{templates.filter((t) => t.status === 'changes').length}</em>}
                </button>
              ))}
            </div>
          ))}
          <div className="nv-g">
            <a className="nv" href={asset('/design/')} title="Ifiok Designs"><Palette aria-hidden="true" /><span className="nv-l">Ifiok Designs</span></a>
            <a className="nv" href={asset('/creators/')} title="Creators page"><LayoutGrid aria-hidden="true" /><span className="nv-l">Creators page</span></a>
          </div>
        </nav>
      </aside>

      <main className="d-main" ref={mainRef} id="main">
        {view === 'home' && <OverviewView first={first} templates={templates} ledger={ledger} account={account} ops={ops} go={go} newTemplate={(k) => setSeed(k ? { kindId: k } : {})} />}
        {view === 'templates' && <TemplatesView templates={templates} ops={ops} newTemplate={(k) => setSeed(k ? { kindId: k } : {})} />}
        {view === 'payouts' && <PayoutsView ledger={ledger} payouts={payouts} account={account} name={profile.name} tab={payTab} setTab={setPayTab} onSaveAccount={(a) => { setAccount(a); setPayTab('summary'); say('Payout account verified.'); }} onClearAccount={() => { setAccount(null); say('Payout account removed. Add and verify a new one to request payouts.'); }} onRequest={() => setPaying(true)} onSimulatePaid={simulatePaid} />}
        {view === 'guidelines' && <GuidelinesView />}
        {view === 'profile' && <ProfileView profile={profile} setProfile={setProfile} approved={approvedCount} say={say} />}
        <p className="sample-note">Sample data and example amounts. Your real templates, earnings and payouts load from the live app.</p>
      </main>

      <nav className="d-tabs" aria-label="Main">
        {([['home', 'Home', Home], ['templates', 'Templates', FolderOpen]] as const).map(([id, label, Icon]) => (<button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}><span className="pill"><Icon aria-hidden="true" /></span><span>{label}</span></button>))}
        <button type="button" className="fab" aria-label="New template" onClick={() => setSeed({})}><Plus aria-hidden="true" /></button>
        {([['payouts', 'Payouts', Wallet], ['profile', 'Profile', UserRound]] as const).map(([id, label, Icon]) => (<button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}><span className="pill"><Icon aria-hidden="true" /></span><span>{label}</span></button>))}
      </nav>

      <NewTemplateDialog seed={seed} onClose={() => setSeed(null)} onCreate={create} />
      <TemplatePanel t={openTemplate} onClose={() => setOpen(null)} onDuplicate={duplicate} onDelete={remove} onSubmit={submit} onSimulate={simulate} onPayouts={() => go('payouts')} />
      <PayoutDialog open={paying} amount={b.available} account={account ? mask(account) : ''} onClose={() => setPaying(false)} onConfirm={requestPayout} />
      <Toast t={toast} onClose={() => setToast(null)} />
    </div>
  );
}
