'use client';

import { ArrowRight, BadgeCheck, Check, ChevronRight, CircleAlert, Download, LayoutGrid, List, Lock, Plus, Search, Shapes, ShieldCheck, Sparkles, Type as TypeIcon, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CAMPUSES, FAQ, STANDARDS } from '@/data/creators';
import {
  BANKS, GROUPS, KINDS, SETTINGS, STATUSES, kindById, naira, type CTemplate, type Entry, type Payout, type Status,
} from '@/data/creator-app';
import { CThumb, EDITOR, StatusPill, TCard, type TOps } from './parts';
import { balances, mask, type Account, type Profile } from './store';
import type { FontEntry } from '@/data/fonts';
import { FontStatusPill } from '@/components/fonts/FontStudio';

/* ───────────────────────── Studio + home strip ───────────────────────── */
type Mine = { templates: CTemplate[]; fonts: FontEntry[]; ledger: Entry[]; account: Account | null };

const stats = ({ templates, fonts, ledger }: Mine) => {
  const b = balances(ledger);
  return {
    b,
    approved: templates.filter((t) => t.status === 'approved').length + fonts.filter((f) => f.status === 'approved').length,
    review: templates.filter((t) => t.status === 'review').length + fonts.filter((f) => f.status === 'review').length,
    changes: templates.filter((t) => t.status === 'changes').length + fonts.filter((f) => f.status === 'changes').length,
  };
};

/** A compact strip on the normal Home screen so creators see their numbers without leaving it. */
export function CreatorHomeStrip({ mine, go, newTemplate, newFont }: { mine: Mine; go: (v: string) => void; newTemplate: () => void; newFont: () => void }) {
  const { b, approved, review, changes } = stats(mine);
  return (
    <section className="cd-strip" aria-label="Creator studio">
      <header className="blk-h"><h2>Creator studio</h2><button type="button" className="see" onClick={() => go('studio')}>Open studio <ChevronRight aria-hidden="true" /></button></header>
      <div className="cd-stats">
        <button type="button" className="cd-stat gold" onClick={() => go('wallet')}><span>Available</span><b>{naira(b.available)}</b><small>to request</small></button>
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>Approved</span><b>{approved}</b><small>templates and fonts</small></button>
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>In review</span><b>{review}</b><small>{changes ? `${changes} need changes` : 'waiting on Ifiok'}</small></button>
      </div>
      <div className="cd-make">
        <button type="button" className="act-tile" onClick={newTemplate}><span className="act-ic" aria-hidden="true"><Shapes /></span><span><b>Create a template</b><small>Any design type</small></span></button>
        <button type="button" className="act-tile" onClick={newFont}><span className="act-ic" aria-hidden="true"><TypeIcon /></span><span><b>Create a font</b><small>Designers click and use it</small></span></button>
      </div>
    </section>
  );
}

export function StudioView({ mine, first, ops, fontOps, go, newTemplate, newFont }: {
  mine: Mine; first: string; ops: TOps; fontOps: { open: (id: string) => void }; go: (v: string) => void; newTemplate: () => void; newFont: () => void;
}) {
  const { b, approved, review, changes } = stats(mine);
  const toGo = Math.max(0, SETTINGS.minPayout - b.available);
  const attention = [
    ...mine.templates.filter((t) => t.status === 'changes').map((t) => ({ id: t.id, name: t.name, kind: 'Template', text: t.notes[t.notes.length - 1]?.text ?? '', open: () => ops.open(t.id) })),
    ...mine.fonts.filter((f) => f.status === 'changes').map((f) => ({ id: f.id, name: f.family, kind: 'Font', text: f.notes?.[f.notes.length - 1]?.text ?? '', open: () => fontOps.open(f.id) })),
  ];
  const recent = [
    ...mine.templates.map((t) => ({ id: t.id, kind: 'Template' as const, name: t.name, status: t.status, sort: t.updated, open: () => ops.open(t.id) })),
    ...mine.fonts.map((f) => ({ id: f.id, kind: 'Font' as const, name: f.family, status: (f.status ?? 'draft') as Status, sort: f.updated ?? '', open: () => fontOps.open(f.id) })),
  ].slice(0, 6);
  return (
    <div className="view">
      <header className="view-h"><div><h1>Creator studio</h1><p className="muted">Hi {first}. Make templates and fonts, submit them, and follow your earnings.</p></div></header>
      <section className="cd-make big">
        <button type="button" className="cd-make-card" onClick={newTemplate}><span className="act-ic" aria-hidden="true"><Shapes /></span><span><b>Create a template</b><small>Cards, flyers, posters, CVs, social posts, presentations and more. Any design type.</small></span><ArrowRight aria-hidden="true" /></button>
        <button type="button" className="cd-make-card" onClick={newFont}><span className="act-ic" aria-hidden="true"><TypeIcon /></span><span><b>Create a font</b><small>Upload your font files. Once approved, designers can click it and start using it.</small></span><ArrowRight aria-hidden="true" /></button>
      </section>
      <section className="cd-stats" aria-label="Your numbers">
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>Approved</span><b>{approved}</b><small>templates and fonts</small></button>
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>In review</span><b>{review}</b><small>{changes ? `${changes} need changes` : 'waiting on Ifiok'}</small></button>
        <button type="button" className="cd-stat gold" onClick={() => go('wallet')}><span>Available</span><b>{naira(b.available)}</b><small>to request</small></button>
        <button type="button" className="cd-stat" onClick={() => go('wallet')}><span>Paid out</span><b>{naira(b.paid)}</b><small>so far</small></button>
      </section>
      {attention.length > 0 && (
        <section className="blk">
          <header className="blk-h"><h2>Needs your attention</h2></header>
          <div className="cd-attn">
            {attention.map((a) => (
              <button key={a.id} type="button" className="cd-attn-i" onClick={a.open}>
                <CircleAlert aria-hidden="true" />
                <span><b>{a.kind}: {a.name}</b><small>{a.text}</small></span>
                <ChevronRight aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="cd-two">
        <div className="cd-card">
          <p className="cd-kick">Earnings</p>
          <h3>{naira(b.available)} available</h3>
          {!mine.account ? <p className="muted">Add your payout details to request a payout. It takes about two minutes.</p> : toGo > 0 ? <p className="muted">{naira(toGo)} more until you can request a payout. The minimum is {naira(SETTINGS.minPayout)}.</p> : <p className="muted">You can request a payout now.</p>}
          <div className="cd-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (b.available / SETTINGS.minPayout) * 100)}%` }} /></div>
          <button type="button" className="btn-p" onClick={() => go('wallet')}><Wallet aria-hidden="true" />{mine.account ? 'Open earnings' : 'Set up payouts'}</button>
        </div>
        <div className="cd-card theme">
          <p className="cd-kick">This month&apos;s theme</p>
          <h3>{SETTINGS.theme.name}</h3>
          <p className="muted">{SETTINGS.theme.blurb}. Enter a template when you submit it. Closes {SETTINGS.theme.closes}.</p>
          <button type="button" className="btn-s" onClick={newTemplate}><Sparkles aria-hidden="true" />Start a template</button>
        </div>
      </section>
      <section className="blk">
        <header className="blk-h"><h2>Recent submissions</h2><button type="button" className="see" onClick={() => go('ctemplates')}>See all <ChevronRight aria-hidden="true" /></button></header>
        <ul className="cd-list">
          {recent.map((r) => (
            <li key={r.kind + r.id}><button type="button" className="cd-li-btn" onClick={r.open}><span><b>{r.name}</b><small>{r.kind} · {r.sort}</small></span>{r.kind === 'Font' ? <FontStatusPill s={r.status} /> : <StatusPill status={r.status} />}</button></li>
          ))}
        </ul>
      </section>
      <section className="blk">
        <header className="blk-h"><h2>Guidelines</h2></header>
        <div className="cd-std">
          {STANDARDS.map((s) => (<div key={s.t} className={s.good ? 'good' : 'bad'}><span aria-hidden="true">{s.good ? <Check /> : <CircleAlert />}</span><div><b>{s.t}</b><p>{s.p}</p></div></div>))}
        </div>
        <p className="muted">Font and lettering templates: use only fonts you may share, and list every font you used. Reviews take {SETTINGS.reviewTime}.</p>
      </section>
    </div>
  );
}

/* ───────────────────────── Templates ───────────────────────── */
export function CTemplatesView({ templates, ops, newTemplate }: { templates: CTemplate[]; ops: TOps; newTemplate: (kindId?: string) => void }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [kind, setKind] = useState('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return templates.filter((t) => (status === 'all' || t.status === status) && (kind === 'all' || t.kindId === kind) && (!n || (t.name + kindById(t.kindId).label).toLowerCase().includes(n)));
  }, [templates, q, status, kind]);
  const filters: { id: 'all' | Status; label: string }[] = [{ id: 'all', label: 'All' }, ...STATUSES.map((s) => ({ id: s.id, label: s.label }))];
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>My templates</h1><p className="muted">{shown.length} of {templates.length} templates</p></div>
        <button type="button" className="btn-p" onClick={() => newTemplate()}><Plus aria-hidden="true" />New template</button>
      </header>
      <div className="bar">
        <label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your templates" aria-label="Search your templates" /></label>
        <label className="sel"><span className="sr">Type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All types</option>
            {GROUPS.map((g) => (<optgroup key={g} label={g}>{KINDS.filter((k) => k.group === g).map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</optgroup>))}
          </select>
        </label>
        <div className="seg" role="group" aria-label="Layout">
          <button type="button" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} aria-label="Grid"><LayoutGrid aria-hidden="true" /></button>
          <button type="button" aria-pressed={layout === 'list'} onClick={() => setLayout('list')} aria-label="List"><List aria-hidden="true" /></button>
        </div>
      </div>
      <div className="chips" role="group" aria-label="Filter by status">
        {filters.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={status === f.id} onClick={() => setStatus(f.id)}>
            {f.label}<small>{f.id === 'all' ? templates.length : templates.filter((t) => t.status === f.id).length}</small>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty"><p><b>No templates match.</b> Try another word or status.</p><button type="button" className="btn-s" onClick={() => { setQ(''); setStatus('all'); setKind('all'); }}>Clear filters</button></div>
      ) : layout === 'grid' ? (
        <div className="dgrid">{shown.map((t) => <TCard key={t.id} t={t} ops={ops} />)}</div>
      ) : (
        <ul className="dlist">
          {shown.map((t) => (
            <li key={t.id}>
              <button type="button" className="dl-row" onClick={() => ops.open(t.id)}>
                <span className="dl-th"><CThumb kindId={t.kindId} accent={t.accent} headline={t.headline} sub={t.sub} /></span>
                <span className="dl-name"><b>{t.name}</b><small>{kindById(t.kindId).label} · {t.updated}</small></span>
                <StatusPill status={t.status} />
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────────────────────── Payouts ───────────────────────── */
type PayTab = 'summary' | 'earnings' | 'history' | 'details';

function PayoutDetails({ account, name, onSave, onChange }: { account: Account | null; name: string; onSave: (a: Account) => void; onChange: () => void }) {
  const [bank, setBank] = useState('');
  const [number, setNumber] = useState('');
  const [resolved, setResolved] = useState('');
  const [busy, setBusy] = useState(false);
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  if (account) {
    return (
      <div className="cd-card">
        <p className="cd-kick">Payout account</p>
        <div className="cd-acct">
          <span className="cd-bank" aria-hidden="true"><Wallet /></span>
          <div><b>{account.name}</b><p className="muted">{mask(account)}</p></div>
          <span className="cd-ok"><BadgeCheck aria-hidden="true" />Verified</span>
        </div>
        <p className="muted">Payouts go to this account by bank transfer. If you change it, it has to be verified again before your next payout.</p>
        <button type="button" className="btn-s" onClick={onChange}>Change account</button>
      </div>
    );
  }

  const verify = () => {
    const e: Record<string, string> = {};
    if (!bank) e.bank = 'Choose your bank.';
    if (!/^\d{10}$/.test(number)) e.number = 'Enter the 10-digit account number.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    window.setTimeout(() => { setResolved(name.toUpperCase()); setBusy(false); }, 800);
  };
  const save = () => {
    const e: Record<string, string> = {};
    if (!/^\d{11}$/.test(nin)) e.nin = 'Your NIN is 11 digits.';
    if (!/^\d{11}$/.test(bvn)) e.bvn = 'Your BVN is 11 digits.';
    if (!consent) e.consent = 'We need your consent to verify your identity.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    window.setTimeout(() => { setBusy(false); onSave({ bank, number, name: resolved, verified: true }); }, 900);
  };

  return (
    <div className="cd-card">
      <p className="cd-kick">Set up payouts</p>
      <h3>Where should we pay you?</h3>
      <p className="muted">This is the only time we ask for bank details. They stay private and are used only to pay you.</p>
      <ol className="cd-setup">
        <li className={resolved ? 'done' : 'now'}>
          <b>1. Bank account</b>
          <div className="cd-grid2">
            <label className="field"><span className="lbl">Bank</span>
              <select value={bank} onChange={(e) => { setBank(e.target.value); setResolved(''); }} aria-invalid={!!err.bank}>
                <option value="">Choose your bank</option>
                {BANKS.map((b) => <option key={b}>{b}</option>)}
              </select>
              {err.bank && <span className="cd-err">{err.bank}</span>}
            </label>
            <label className="field"><span className="lbl">Account number</span>
              <input inputMode="numeric" maxLength={10} value={number} onChange={(e) => { setNumber(e.target.value.replace(/\D/g, '')); setResolved(''); }} placeholder="10-digit NUBAN" aria-invalid={!!err.number} />
              {err.number && <span className="cd-err">{err.number}</span>}
            </label>
          </div>
          {!resolved && <button type="button" className="btn-p" onClick={verify} disabled={busy}>{busy ? 'Checking…' : 'Check account'}</button>}
          {resolved && <p className="cd-resolved"><BadgeCheck aria-hidden="true" />Account name: <b>{resolved}</b> <small>(prototype: shown from your profile name)</small></p>}
        </li>
        <li className={resolved ? 'now' : 'locked'}>
          <b>2. Verify it is you</b>
          {!resolved ? <p className="muted"><Lock aria-hidden="true" /> Check your account first.</p> : (
            <>
              <div className="cd-grid2">
                <label className="field"><span className="lbl">NIN</span><input inputMode="numeric" maxLength={11} value={nin} onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))} placeholder="11-digit National ID" aria-invalid={!!err.nin} />{err.nin && <span className="cd-err">{err.nin}</span>}</label>
                <label className="field"><span className="lbl">BVN</span><input inputMode="numeric" maxLength={11} value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))} placeholder="11-digit BVN" aria-invalid={!!err.bvn} />{err.bvn && <span className="cd-err">{err.bvn}</span>}</label>
              </div>
              <label className="cd-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>I agree that Ifiok may verify my NIN, BVN and bank account with its verification partner to confirm my identity for creator payouts.</span></label>
              {err.consent && <p className="cd-err" role="alert">{err.consent}</p>}
              <button type="button" className="btn-p" onClick={save} disabled={busy}><ShieldCheck aria-hidden="true" />{busy ? 'Verifying…' : 'Save and verify'}</button>
              <p className="muted">Prototype: nothing is sent. Use any 11 digits.</p>
            </>
          )}
        </li>
      </ol>
    </div>
  );
}

function csv(rows: (string | number)[][]) {
  const text = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'ifiok-creator-payouts.csv'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PayoutsView({ ledger, payouts, account, name, onSaveAccount, onClearAccount, onRequest, onSimulatePaid, tab, setTab }: {
  ledger: Entry[]; payouts: Payout[]; account: Account | null; name: string; onSaveAccount: (a: Account) => void; onClearAccount: () => void; onRequest: () => void; onSimulatePaid: (id: string) => void; tab: PayTab; setTab: (t: PayTab) => void;
}) {
  const b = balances(ledger);
  const canRequest = !!account && b.available >= SETTINGS.minPayout;
  const reason = !account ? 'Add your payout details first.' : b.available < SETTINGS.minPayout ? `You need ${naira(SETTINGS.minPayout)} available to request a payout.` : '';
  const tabs: [PayTab, string][] = [['summary', 'Summary'], ['earnings', 'Earnings'], ['history', 'History'], ['details', 'Payout details']];
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>Earnings</h1><p className="muted">Your earnings and payments. Only you can see this page.</p></div>
        <button type="button" className="btn-p" onClick={onRequest} disabled={!canRequest} title={reason}><Wallet aria-hidden="true" />Request payout</button>
      </header>
      {reason && <p className="cd-note" role="status"><CircleAlert aria-hidden="true" />{reason} {!account && <button type="button" className="cd-link" onClick={() => setTab('details')}>Set up payouts</button>}</p>}
      <div className="seg wide" role="tablist" aria-label="Payout sections">
        {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {tab === 'summary' && (
        <>
          <section className="cd-bal">
            <div className="main"><span>Available now</span><b>{naira(b.available)}</b><small>Ready to request</small></div>
            <div><span>In payout</span><b>{naira(b.inPayout)}</b><small>Being processed</small></div>
            <div><span>Paid out</span><b>{naira(b.paid)}</b><small>Sent to your account</small></div>
            <div><span>Earned in total</span><b>{naira(b.lifetime)}</b><small>{ledger.length} approved templates</small></div>
          </section>
          <section className="cd-card">
            <p className="cd-kick">How payouts work</p>
            <ol className="cd-how">
              <li><b>Get approved</b><span>When the Ifiok team approves a template, a one-off payment for it is added to your available balance.</span></li>
              <li><b>Request a payout</b><span>Once you have {naira(SETTINGS.minPayout)} available and your payout account is verified, request a payout.</span></li>
              <li><b>Get paid</b><span>We review the request and pay by bank transfer to your verified account.</span></li>
            </ol>
            <p className="muted">Amounts shown here are examples. Ifiok sets the real amounts.</p>
          </section>
          <section className="blk">
            <header className="blk-h"><h2>Recent earnings</h2><button type="button" className="see" onClick={() => setTab('earnings')}>See all <ChevronRight aria-hidden="true" /></button></header>
            <ul className="cd-list">
              {[...ledger].reverse().slice(0, 3).map((e) => (<li key={e.id}><span><b>{e.name}</b><small>Approved {e.date}</small></span><span className="mono">{naira(e.amount)}</span><span className={`cd-chip ${e.status}`}>{e.status === 'available' ? 'Available' : e.status === 'requested' ? 'In payout' : 'Paid'}</span></li>))}
            </ul>
          </section>
        </>
      )}

      {tab === 'earnings' && (
        <div className="cd-table-wrap">
          <table className="cd-table">
            <thead><tr><th>Template</th><th>Approved</th><th className="r">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {ledger.map((e) => (<tr key={e.id}><td>{e.name}</td><td data-l="Approved">{e.date}</td><td className="r mono">{naira(e.amount)}</td><td><span className={`cd-chip ${e.status}`}>{e.status === 'available' ? 'Available' : e.status === 'requested' ? 'In payout' : 'Paid'}</span></td></tr>))}
              {ledger.length === 0 && <tr><td colSpan={4} className="muted">Nothing yet. Earnings appear here when a template is approved.</td></tr>}
            </tbody>
            <tfoot><tr><td colSpan={2}>Total</td><td className="r mono">{naira(b.lifetime)}</td><td /></tr></tfoot>
          </table>
        </div>
      )}

      {tab === 'history' && (
        <>
          <div className="cd-hist-h">
            <p className="muted">{payouts.length} payout{payouts.length === 1 ? '' : 's'}</p>
            <button type="button" className="btn-s" onClick={() => csv([['Reference', 'Date', 'Amount', 'Account', 'Status'], ...payouts.map((p) => [p.ref, p.date, p.amount, p.account, p.status])])} disabled={payouts.length === 0}><Download aria-hidden="true" />Download CSV</button>
          </div>
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead><tr><th>Reference</th><th>Date</th><th className="r">Amount</th><th>Account</th><th>Status</th></tr></thead>
              <tbody>
                {payouts.map((p) => (<tr key={p.id}><td className="mono">{p.ref}</td><td data-l="Date">{p.date}</td><td className="r mono">{naira(p.amount)}</td><td data-l="To">{p.account}</td><td><span className={`cd-chip ${p.status}`}>{p.status === 'processing' ? 'Processing' : p.status === 'paid' ? 'Paid' : 'Failed'}</span>{p.status === 'processing' && <button type="button" className="cd-link" onClick={() => onSimulatePaid(p.id)}>Simulate paid</button>}</td></tr>))}
                {payouts.length === 0 && <tr><td colSpan={5} className="muted">No payouts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'details' && <PayoutDetails account={account} name={name} onSave={onSaveAccount} onChange={onClearAccount} />}
    </div>
  );
}

/* ───────────────────────── Guidelines ───────────────────────── */
export function GuidelinesView() {
  return (
    <div className="view narrow">
      <header className="view-h"><div><h1>Guidelines</h1><p className="muted">What reviewers look for. Reviews take {SETTINGS.reviewTime}.</p></div></header>
      <div className="cd-std">
        {STANDARDS.map((s) => (<div key={s.t} className={s.good ? 'good' : 'bad'}><span aria-hidden="true">{s.good ? <Check /> : <CircleAlert />}</span><div><b>{s.t}</b><p>{s.p}</p></div></div>))}
      </div>
      <section className="cd-card">
        <p className="cd-kick">Font and lettering templates</p>
        <p className="muted">Use only fonts you are allowed to share, such as open-source fonts or fonts licensed for templates. List every font you used when you submit. Keep the text editable so others can change the words.</p>
      </section>
      <section className="blk">
        <header className="blk-h"><h2>Common questions</h2></header>
        <div className="cd-faq">
          {FAQ.slice(1, 5).map((f) => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Profile ───────────────────────── */
export function ProfileView({ profile, setProfile, approved, say }: { profile: Profile; setProfile: (p: Profile) => void; approved: number; say: (m: string) => void }) {
  const link = `ifiok.ng/creators/${profile.handle || 'your-name'}`;
  const set = (k: keyof Profile, v: string) => setProfile({ ...profile, [k]: v });
  return (
    <div className="view narrow">
      <header className="view-h"><div><h1>Profile</h1><p className="muted">This is your public creator page.</p></div></header>
      <section className="cd-card cd-profile">
        <span className="avatar big" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span>
        <div>
          <h3>{profile.name || 'Your name'}</h3>
          <p className="muted">{profile.campus}</p>
          <p>{profile.bio || 'Add a short bio so people know your style.'}</p>
          <p className="cd-badges"><span><BadgeCheck aria-hidden="true" />{approved} approved template{approved === 1 ? '' : 's'}</span></p>
        </div>
      </section>
      <div className="cd-card">
        <label className="field"><span className="lbl">Display name</span><input value={profile.name} onChange={(e) => set('name', e.target.value)} maxLength={50} /></label>
        <label className="field"><span className="lbl">Handle</span><input value={profile.handle} onChange={(e) => set('handle', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} maxLength={24} /><span className="muted">{link}</span></label>
        <label className="field"><span className="lbl">School</span>
          <select value={profile.campus} onChange={(e) => set('campus', e.target.value)}>{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="field"><span className="lbl">Bio</span><textarea rows={3} value={profile.bio} onChange={(e) => set('bio', e.target.value)} maxLength={200} /></label>
        <label className="field"><span className="lbl">Portfolio link (optional)</span><input inputMode="url" value={profile.link} onChange={(e) => set('link', e.target.value)} placeholder="behance.net/yourname" /></label>
        <div className="dt-actions">
          <button type="button" className="btn-p" onClick={() => say('Profile saved on this device.')}>Save profile</button>
          <button type="button" className="btn-s" onClick={async () => { try { await navigator.clipboard.writeText(`https://${link}`); say('Profile link copied.'); } catch { say(link); } }}>Copy link</button>
        </div>
      </div>
      <a className="act-tile" href={EDITOR} target="_blank" rel="noopener noreferrer"><span className="act-ic" aria-hidden="true"><ArrowRight /></span><span><b>Open the editor</b><small>Design your next template</small></span></a>
    </div>
  );
}
