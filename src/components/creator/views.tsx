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

import { tr } from '@/i18n/tr';
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
    <section className="cd-strip" aria-label={tr("Creator studio")}>
      <header className="blk-h"><h2>{tr("Creator studio")}</h2><button type="button" className="see" onClick={() => go('studio')}>{tr("Open studio")} <ChevronRight aria-hidden="true" /></button></header>
      <div className="cd-stats">
        <button type="button" className="cd-stat gold" onClick={() => go('wallet')}><span>{tr("Available")}</span><b>{naira(b.available)}</b><small>{tr("to request")}</small></button>
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>{tr("Approved")}</span><b>{approved}</b><small>{tr("templates and fonts")}</small></button>
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>{tr("In review")}</span><b>{review}</b><small>{changes ? tr("{changes} need changes", { changes }) : tr("waiting on Ifiok")}</small></button>
      </div>
      <div className="cd-make">
        <button type="button" className="act-tile" onClick={newTemplate}><span className="act-ic" aria-hidden="true"><Shapes /></span><span><b>{tr("Create a template")}</b><small>{tr("Any design type")}</small></span></button>
        <button type="button" className="act-tile" onClick={newFont}><span className="act-ic" aria-hidden="true"><TypeIcon /></span><span><b>{tr("Create a font")}</b><small>{tr("Designers click and use it")}</small></span></button>
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
      <header className="view-h"><div><h1>{tr("Creator studio")}</h1><p className="muted">{tr("Hi {first}. Make templates and fonts, submit them, and follow your earnings.", { first })}</p></div></header>
      <section className="cd-make big">
        <button type="button" className="cd-make-card" onClick={newTemplate}><span className="act-ic" aria-hidden="true"><Shapes /></span><span><b>{tr("Create a template")}</b><small>{tr("Cards, flyers, posters, CVs, social posts, presentations and more. Any design type.")}</small></span><ArrowRight aria-hidden="true" /></button>
        <button type="button" className="cd-make-card" onClick={newFont}><span className="act-ic" aria-hidden="true"><TypeIcon /></span><span><b>{tr("Create a font")}</b><small>{tr("Upload your font files. Once approved, designers can click it and start using it.")}</small></span><ArrowRight aria-hidden="true" /></button>
      </section>
      <section className="cd-stats" aria-label={tr("Your numbers")}>
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>{tr("Approved")}</span><b>{approved}</b><small>{tr("templates and fonts")}</small></button>
        <button type="button" className="cd-stat" onClick={() => go('ctemplates')}><span>{tr("In review")}</span><b>{review}</b><small>{changes ? tr("{changes} need changes", { changes }) : tr("waiting on Ifiok")}</small></button>
        <button type="button" className="cd-stat gold" onClick={() => go('wallet')}><span>{tr("Available")}</span><b>{naira(b.available)}</b><small>{tr("to request")}</small></button>
        <button type="button" className="cd-stat" onClick={() => go('wallet')}><span>{tr("Paid out")}</span><b>{naira(b.paid)}</b><small>{tr("so far")}</small></button>
      </section>
      {attention.length > 0 && (
        <section className="blk">
          <header className="blk-h"><h2>{tr("Needs your attention")}</h2></header>
          <div className="cd-attn">
            {attention.map((a) => (
              <button key={a.id} type="button" className="cd-attn-i" onClick={a.open}>
                <CircleAlert aria-hidden="true" />
                <span><b>{tr(a.kind)}: {tr(a.name)}</b><small>{tr(a.text)}</small></span>
                <ChevronRight aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="cd-two">
        <div className="cd-card">
          <p className="cd-kick">{tr("Earnings")}</p>
          <h3>{tr("{available} available", { available: naira(b.available) })}</h3>
          {!mine.account ? <p className="muted">{tr("Add your payout details to request a payout. It takes about two minutes.")}</p> : toGo > 0 ? <p className="muted">{tr("{toGo} more until you can request a payout. The minimum is {minPayout}.", { toGo: naira(toGo), minPayout: naira(SETTINGS.minPayout) })}</p> : <p className="muted">{tr("You can request a payout now.")}</p>}
          <div className="cd-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (b.available / SETTINGS.minPayout) * 100)}%` }} /></div>
          <button type="button" className="btn-p" onClick={() => go('wallet')}><Wallet aria-hidden="true" />{mine.account ? tr("Open earnings") : tr("Set up payouts")}</button>
        </div>
        <div className="cd-card theme">
          <p className="cd-kick">{tr("This month's theme")}</p>
          <h3>{tr(SETTINGS.theme.name)}</h3>
          <p className="muted">{tr("{blurb}. Enter a template when you submit it. Closes {closes}.", { blurb: tr(SETTINGS.theme.blurb), closes: tr(SETTINGS.theme.closes) })}</p>
          <button type="button" className="btn-s" onClick={newTemplate}><Sparkles aria-hidden="true" />{tr("Start a template")}</button>
        </div>
      </section>
      <section className="blk">
        <header className="blk-h"><h2>{tr("Recent submissions")}</h2><button type="button" className="see" onClick={() => go('ctemplates')}>{tr("See all")} <ChevronRight aria-hidden="true" /></button></header>
        <ul className="cd-list">
          {recent.map((r) => (
            <li key={r.kind + r.id}><button type="button" className="cd-li-btn" onClick={r.open}><span><b>{tr(r.name)}</b><small>{tr(r.kind)} · {tr(r.sort)}</small></span>{r.kind === 'Font' ? <FontStatusPill s={r.status} /> : <StatusPill status={r.status} />}</button></li>
          ))}
        </ul>
      </section>
      <section className="blk">
        <header className="blk-h"><h2>{tr("Guidelines")}</h2></header>
        <div className="cd-std">
          {STANDARDS.map((s) => (<div key={s.t} className={s.good ? 'good' : 'bad'}><span aria-hidden="true">{s.good ? <Check /> : <CircleAlert />}</span><div><b>{tr(s.t)}</b><p>{tr(s.p)}</p></div></div>))}
        </div>
        <p className="muted">{tr("Font and lettering templates: use only fonts you may share, and list every font you used. Reviews take {reviewTime}.", { reviewTime: tr(SETTINGS.reviewTime) })}</p>
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
  const filters: { id: 'all' | Status; label: string }[] = [{ id: 'all', label: tr("All") }, ...STATUSES.map((s) => ({ id: s.id, label: s.label }))];
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>{tr("My templates")}</h1><p className="muted">{tr("{shownCount} of {templatesCount} templates", { shownCount: shown.length, templatesCount: templates.length })}</p></div>
        <button type="button" className="btn-p" onClick={() => newTemplate()}><Plus aria-hidden="true" />{tr("New template")}</button>
      </header>
      <div className="bar">
        <label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search your templates")} aria-label={tr("Search your templates")} /></label>
        <label className="sel"><span className="sr">{tr("Type")}</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">{tr("All types")}</option>
            {GROUPS.map((g) => (<optgroup key={g} label={g}>{KINDS.filter((k) => k.group === g).map((k) => <option key={k.id} value={k.id}>{tr(k.label)}</option>)}</optgroup>))}
          </select>
        </label>
        <div className="seg" role="group" aria-label={tr("Layout")}>
          <button type="button" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} aria-label={tr("Grid")}><LayoutGrid aria-hidden="true" /></button>
          <button type="button" aria-pressed={layout === 'list'} onClick={() => setLayout('list')} aria-label={tr("List")}><List aria-hidden="true" /></button>
        </div>
      </div>
      <div className="chips" role="group" aria-label={tr("Filter by status")}>
        {filters.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={status === f.id} onClick={() => setStatus(f.id)}>
            {tr(f.label)}<small>{f.id === 'all' ? templates.length : templates.filter((t) => t.status === f.id).length}</small>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty"><p><b>{tr("No templates match.")}</b> {tr("Try another word or status.")}</p><button type="button" className="btn-s" onClick={() => { setQ(''); setStatus('all'); setKind('all'); }}>{tr("Clear filters")}</button></div>
      ) : layout === 'grid' ? (
        <div className="dgrid">{shown.map((t) => <TCard key={t.id} t={t} ops={ops} />)}</div>
      ) : (
        <ul className="dlist">
          {shown.map((t) => (
            <li key={t.id}>
              <button type="button" className="dl-row" onClick={() => ops.open(t.id)}>
                <span className="dl-th"><CThumb kindId={t.kindId} accent={t.accent} headline={t.headline} sub={tr(t.sub)} /></span>
                <span className="dl-name"><b>{tr(t.name)}</b><small>{tr(kindById(t.kindId).label)} · {tr(t.updated)}</small></span>
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
        <p className="cd-kick">{tr("Payout account")}</p>
        <div className="cd-acct">
          <span className="cd-bank" aria-hidden="true"><Wallet /></span>
          <div><b>{tr(account.name)}</b><p className="muted">{mask(account)}</p></div>
          <span className="cd-ok"><BadgeCheck aria-hidden="true" />{tr("Verified")}</span>
        </div>
        <p className="muted">{tr("Payouts go to this account by bank transfer. If you change it, it has to be verified again before your next payout.")}</p>
        <button type="button" className="btn-s" onClick={onChange}>{tr("Change account")}</button>
      </div>
    );
  }

  const verify = () => {
    const e: Record<string, string> = {};
    if (!bank) e.bank = tr("Choose your bank.");
    if (!/^\d{10}$/.test(number)) e.number = tr("Enter the 10-digit account number.");
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    window.setTimeout(() => { setResolved(name.toUpperCase()); setBusy(false); }, 800);
  };
  const save = () => {
    const e: Record<string, string> = {};
    if (!/^\d{11}$/.test(nin)) e.nin = tr("Your NIN is 11 digits.");
    if (!/^\d{11}$/.test(bvn)) e.bvn = tr("Your BVN is 11 digits.");
    if (!consent) e.consent = tr("We need your consent to verify your identity.");
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    window.setTimeout(() => { setBusy(false); onSave({ bank, number, name: resolved, verified: true }); }, 900);
  };

  return (
    <div className="cd-card">
      <p className="cd-kick">{tr("Set up payouts")}</p>
      <h3>{tr("Where should we pay you?")}</h3>
      <p className="muted">{tr("This is the only time we ask for bank details. They stay private and are used only to pay you.")}</p>
      <ol className="cd-setup">
        <li className={resolved ? 'done' : 'now'}>
          <b>{tr("1. Bank account")}</b>
          <div className="cd-grid2">
            <label className="field"><span className="lbl">{tr("Bank")}</span>
              <select value={bank} onChange={(e) => { setBank(e.target.value); setResolved(''); }} aria-invalid={!!err.bank}>
                <option value="">{tr("Choose your bank")}</option>
                {BANKS.map((b) => <option key={b}>{b}</option>)}
              </select>
              {err.bank && <span className="cd-err">{err.bank}</span>}
            </label>
            <label className="field"><span className="lbl">{tr("Account number")}</span>
              <input inputMode="numeric" maxLength={10} value={number} onChange={(e) => { setNumber(e.target.value.replace(/\D/g, '')); setResolved(''); }} placeholder={tr("10-digit NUBAN")} aria-invalid={!!err.number} />
              {err.number && <span className="cd-err">{err.number}</span>}
            </label>
          </div>
          {!resolved && <button type="button" className="btn-p" onClick={verify} disabled={busy}>{busy ? tr("Checking…") : tr("Check account")}</button>}
          {resolved && <p className="cd-resolved"><BadgeCheck aria-hidden="true" />{tr("Account name:")} <b>{resolved}</b> <small>{tr("(prototype: shown from your profile name)")}</small></p>}
        </li>
        <li className={resolved ? 'now' : 'locked'}>
          <b>{tr("2. Verify it is you")}</b>
          {!resolved ? <p className="muted"><Lock aria-hidden="true" /> {tr("Check your account first.")}</p> : (
            <>
              <div className="cd-grid2">
                <label className="field"><span className="lbl">{tr("NIN")}</span><input inputMode="numeric" maxLength={11} value={nin} onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))} placeholder={tr("11-digit National ID")} aria-invalid={!!err.nin} />{err.nin && <span className="cd-err">{err.nin}</span>}</label>
                <label className="field"><span className="lbl">{tr("BVN")}</span><input inputMode="numeric" maxLength={11} value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))} placeholder={tr("11-digit BVN")} aria-invalid={!!err.bvn} />{err.bvn && <span className="cd-err">{err.bvn}</span>}</label>
              </div>
              <label className="cd-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>{tr("I agree that Ifiok may verify my NIN, BVN and bank account with its verification partner to confirm my identity for creator payouts.")}</span></label>
              {err.consent && <p className="cd-err" role="alert">{err.consent}</p>}
              <button type="button" className="btn-p" onClick={save} disabled={busy}><ShieldCheck aria-hidden="true" />{busy ? tr("Verifying…") : tr("Save and verify")}</button>
              <p className="muted">{tr("Prototype: nothing is sent. Use any 11 digits.")}</p>
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
  const reason = !account ? tr('Add your payout details first.') : b.available < SETTINGS.minPayout ? tr('You need {amount} available to request a payout.', { amount: naira(SETTINGS.minPayout) }) : '';
  const tabs: [PayTab, string][] = [['summary', tr('Summary')], ['earnings', tr('Earnings')], ['history', tr('History')], ['details', tr('Payout details')]];
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>{tr("Earnings")}</h1><p className="muted">{tr("Your earnings and payments. Only you can see this page.")}</p></div>
        <button type="button" className="btn-p" onClick={onRequest} disabled={!canRequest} title={reason}><Wallet aria-hidden="true" />{tr("Request payout")}</button>
      </header>
      {reason && <p className="cd-note" role="status"><CircleAlert aria-hidden="true" />{reason} {!account && <button type="button" className="cd-link" onClick={() => setTab('details')}>{tr("Set up payouts")}</button>}</p>}
      <div className="seg wide" role="tablist" aria-label={tr("Payout sections")}>
        {tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}
      </div>

      {tab === 'summary' && (
        <>
          <section className="cd-bal">
            <div className="main"><span>{tr("Available now")}</span><b>{naira(b.available)}</b><small>{tr("Ready to request")}</small></div>
            <div><span>{tr("In payout")}</span><b>{naira(b.inPayout)}</b><small>{tr("Being processed")}</small></div>
            <div><span>{tr("Paid out")}</span><b>{naira(b.paid)}</b><small>{tr("Sent to your account")}</small></div>
            <div><span>{tr("Earned in total")}</span><b>{naira(b.lifetime)}</b><small>{tr("{ledgerCount} approved templates", { ledgerCount: ledger.length })}</small></div>
          </section>
          <section className="cd-card">
            <p className="cd-kick">{tr("How payouts work")}</p>
            <ol className="cd-how">
              <li><b>{tr("Get approved")}</b><span>{tr("When the Ifiok team approves a template, a one-off payment for it is added to your available balance.")}</span></li>
              <li><b>{tr("Request a payout")}</b><span>{tr("Once you have {minPayout} available and your payout account is verified, request a payout.", { minPayout: naira(SETTINGS.minPayout) })}</span></li>
              <li><b>{tr("Get paid")}</b><span>{tr("We review the request and pay by bank transfer to your verified account.")}</span></li>
            </ol>
            <p className="muted">{tr("Amounts shown here are examples. Ifiok sets the real amounts.")}</p>
          </section>
          <section className="blk">
            <header className="blk-h"><h2>{tr("Recent earnings")}</h2><button type="button" className="see" onClick={() => setTab('earnings')}>{tr("See all")} <ChevronRight aria-hidden="true" /></button></header>
            <ul className="cd-list">
              {[...ledger].reverse().slice(0, 3).map((e) => (<li key={e.id}><span><b>{tr(e.name)}</b><small>{tr("Approved {date}", { date: tr(e.date) })}</small></span><span className="mono">{naira(e.amount)}</span><span className={`cd-chip ${e.status}`}>{e.status === 'available' ? tr("Available") : e.status === 'requested' ? tr("In payout") : tr("Paid")}</span></li>))}
            </ul>
          </section>
        </>
      )}

      {tab === 'earnings' && (
        <div className="cd-table-wrap">
          <table className="cd-table">
            <thead><tr><th>{tr("Template")}</th><th>{tr("Approved")}</th><th className="r">{tr("Amount")}</th><th>{tr("Status")}</th></tr></thead>
            <tbody>
              {ledger.map((e) => (<tr key={e.id}><td>{tr(e.name)}</td><td data-l="Approved">{tr(e.date)}</td><td className="r mono">{naira(e.amount)}</td><td><span className={`cd-chip ${e.status}`}>{e.status === 'available' ? tr("Available") : e.status === 'requested' ? tr("In payout") : tr("Paid")}</span></td></tr>))}
              {ledger.length === 0 && <tr><td colSpan={4} className="muted">{tr("Nothing yet. Earnings appear here when a template is approved.")}</td></tr>}
            </tbody>
            <tfoot><tr><td colSpan={2}>{tr("Total")}</td><td className="r mono">{naira(b.lifetime)}</td><td /></tr></tfoot>
          </table>
        </div>
      )}

      {tab === 'history' && (
        <>
          <div className="cd-hist-h">
            <p className="muted">{tr(payouts.length === 1 ? "{payoutsCount} payout" : "{payoutsCount} payouts", { payoutsCount: payouts.length })}</p>
            <button type="button" className="btn-s" onClick={() => csv([[tr('Reference'), tr('Date'), tr('Amount'), tr('Account'), tr('Status')], ...payouts.map((p) => [p.ref, p.date, p.amount, p.account, p.status])])} disabled={payouts.length === 0}><Download aria-hidden="true" />{tr("Download CSV")}</button>
          </div>
          <div className="cd-table-wrap">
            <table className="cd-table">
              <thead><tr><th>{tr("Reference")}</th><th>{tr("Date")}</th><th className="r">{tr("Amount")}</th><th>{tr("Account")}</th><th>{tr("Status")}</th></tr></thead>
              <tbody>
                {payouts.map((p) => (<tr key={p.id}><td className="mono">{p.ref}</td><td data-l="Date">{tr(p.date)}</td><td className="r mono">{naira(p.amount)}</td><td data-l="To">{p.account}</td><td><span className={`cd-chip ${p.status}`}>{p.status === 'processing' ? tr("Processing") : p.status === 'paid' ? tr("Paid") : tr("Failed")}</span>{p.status === 'processing' && <button type="button" className="cd-link" onClick={() => onSimulatePaid(p.id)}>{tr("Simulate paid")}</button>}</td></tr>))}
                {payouts.length === 0 && <tr><td colSpan={5} className="muted">{tr("No payouts yet.")}</td></tr>}
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
      <header className="view-h"><div><h1>{tr("Guidelines")}</h1><p className="muted">{tr("What reviewers look for. Reviews take {reviewTime}.", { reviewTime: tr(SETTINGS.reviewTime) })}</p></div></header>
      <div className="cd-std">
        {STANDARDS.map((s) => (<div key={s.t} className={s.good ? 'good' : 'bad'}><span aria-hidden="true">{s.good ? <Check /> : <CircleAlert />}</span><div><b>{tr(s.t)}</b><p>{tr(s.p)}</p></div></div>))}
      </div>
      <section className="cd-card">
        <p className="cd-kick">{tr("Font and lettering templates")}</p>
        <p className="muted">{tr("Use only fonts you are allowed to share, such as open-source fonts or fonts licensed for templates. List every font you used when you submit. Keep the text editable so others can change the words.")}</p>
      </section>
      <section className="blk">
        <header className="blk-h"><h2>{tr("Common questions")}</h2></header>
        <div className="cd-faq">
          {FAQ.slice(1, 5).map((f) => (<details key={f.q}><summary>{tr(f.q)}</summary><p>{tr(f.a)}</p></details>))}
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
      <header className="view-h"><div><h1>{tr("Profile")}</h1><p className="muted">{tr("This is your public creator page.")}</p></div></header>
      <section className="cd-card cd-profile">
        <span className="avatar big" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span>
        <div>
          <h3>{profile.name || tr("Your name")}</h3>
          <p className="muted">{profile.campus}</p>
          <p>{profile.bio || tr("Add a short bio so people know your style.")}</p>
          <p className="cd-badges"><span><BadgeCheck aria-hidden="true" />{tr(approved === 1 ? "{approved} approved template" : "{approved} approved templates", { approved })}</span></p>
        </div>
      </section>
      <div className="cd-card">
        <label className="field"><span className="lbl">{tr("Display name")}</span><input value={profile.name} onChange={(e) => set('name', e.target.value)} maxLength={50} /></label>
        <label className="field"><span className="lbl">{tr("Handle")}</span><input value={profile.handle} onChange={(e) => set('handle', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} maxLength={24} /><span className="muted">{link}</span></label>
        <label className="field"><span className="lbl">{tr("School")}</span>
          <select value={profile.campus} onChange={(e) => set('campus', e.target.value)}>{CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
        <label className="field"><span className="lbl">{tr("Bio")}</span><textarea rows={3} value={profile.bio} onChange={(e) => set('bio', e.target.value)} maxLength={200} /></label>
        <label className="field"><span className="lbl">{tr("Portfolio link (optional)")}</span><input inputMode="url" value={profile.link} onChange={(e) => set('link', e.target.value)} placeholder={tr("behance.net/yourname")} /></label>
        <div className="dt-actions">
          <button type="button" className="btn-p" onClick={() => say(tr("Profile saved on this device."))}>{tr("Save profile")}</button>
          <button type="button" className="btn-s" onClick={async () => { try { await navigator.clipboard.writeText(`https://${link}`); say(tr("Profile link copied.")); } catch { say(link); } }}>{tr("Copy link")}</button>
        </div>
      </div>
      <a className="act-tile" href={EDITOR} target="_blank" rel="noopener noreferrer"><span className="act-ic" aria-hidden="true"><ArrowRight /></span><span><b>{tr("Open the editor")}</b><small>{tr("Design your next template")}</small></span></a>
    </div>
  );
}
