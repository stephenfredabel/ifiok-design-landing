'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MY_FONTS, type FontEntry, type FontFile } from '@/data/fonts';
import {
  SAMPLE_LEDGER, SAMPLE_PAYOUTS, SAMPLE_TEMPLATES, SETTINGS, kindById, naira, type CTemplate, type Entry, type Payout,
} from '@/data/creator-app';

import { tr } from '@/i18n/tr';
export type Account = { bank: string; number: string; name: string; verified: boolean };
export type Profile = { name: string; handle: string; bio: string; campus: string; link: string };
export type Say = (t: { msg: string; href?: string; label?: string; action?: () => void } | string) => void;

const STORE = 'ifiok.creator.v3';
const FONT_BOUNTY = 3000;
export const mask = (a: Account) => `${a.bank.replace(/\s*\(.*\)/, '')} •••• ${a.number.slice(-4)}`;

export const balances = (ledger: Entry[]) => {
  const sum = (f: (e: Entry) => boolean) => ledger.filter(f).reduce((s, e) => s + e.amount, 0);
  return { available: sum((e) => e.status === 'available'), inPayout: sum((e) => e.status === 'requested'), paid: sum((e) => e.status === 'paid'), lifetime: sum(() => true) };
};

/** Registers an uploaded font so the page can draw with it. Returns the family name it was registered under. */
export async function registerFont(family: string, url: string, style: string): Promise<boolean> {
  try {
    const weight = /bold/i.test(style) ? '700' : /light/i.test(style) ? '300' : /medium/i.test(style) ? '500' : '400';
    const face = new FontFace(family, `url(${url})`, { weight, style: /italic/i.test(style) ? 'italic' : 'normal' });
    await face.load();
    document.fonts.add(face);
    return true;
  } catch { return false; }
}

type Ctx = {
  templates: CTemplate[]; fonts: FontEntry[]; ledger: Entry[]; payouts: Payout[]; account: Account | null; profile: Profile;
  setProfile: (p: Profile) => void;
  createTemplate: (v: { name: string; kindId: string; accent: string; fonts: string }) => CTemplate;
  duplicateTemplate: (id: string) => void; removeTemplate: (id: string) => void;
  submitTemplate: (id: string, d: { notes: string; theme: boolean; fonts: string }) => void;
  decideTemplate: (id: string, r: 'approve' | 'changes' | 'reject') => void;
  saveFont: (f: FontEntry) => void; removeFont: (id: string) => void; submitFont: (id: string, note: string) => void;
  decideFont: (id: string, r: 'approve' | 'changes' | 'reject') => void;
  saveAccount: (a: Account) => void; clearAccount: () => void;
  requestPayout: () => void; simulatePaid: (id: string) => void;
  approvedFonts: FontEntry[];
};

const C = createContext<Ctx | null>(null);
export const useCreator = () => useContext(C);
export const useCreatorStrict = () => { const c = useContext(C); if (!c) throw new Error('Creator store missing'); return c; };

export function CreatorProvider({ say, children }: { say: Say; children: React.ReactNode }) {
  const [templates, setTemplates] = useState<CTemplate[]>(SAMPLE_TEMPLATES);
  const [fonts, setFonts] = useState<FontEntry[]>(MY_FONTS);
  const [ledger, setLedger] = useState<Entry[]>(SAMPLE_LEDGER);
  const [payouts, setPayouts] = useState<Payout[]>(SAMPLE_PAYOUTS);
  const [account, setAccount] = useState<Account | null>(null);
  const [profile, setProfile] = useState<Profile>({ name: 'Stephen Fredabel', handle: 'stephen', bio: '', campus: 'University of Lagos (UNILAG)', link: '' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.templates)) setTemplates(d.templates);
        if (Array.isArray(d.fonts)) {
          setFonts(d.fonts);
          // Re-register any uploaded font files that were small enough to keep.
          d.fonts.forEach((f: FontEntry) => f.data?.forEach((x) => registerFont(f.css, x.url, x.name)));
        }
        if (Array.isArray(d.ledger)) setLedger(d.ledger);
        if (Array.isArray(d.payouts)) setPayouts(d.payouts);
        if ('account' in d) setAccount(d.account);
        if (d.profile) setProfile(d.profile);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORE, JSON.stringify({ templates, fonts, ledger, payouts, account, profile })); }
    catch { /* storage full: keep working in memory */ }
  }, [templates, fonts, ledger, payouts, account, profile, ready]);

  const tref = useRef(templates); tref.current = templates;
  const fref = useRef(fonts); fref.current = fonts;
  const lref = useRef(ledger); lref.current = ledger;
  const pref = useRef(payouts); pref.current = payouts;
  const aref = useRef(account); aref.current = account;

  const patchT = (id: string, p: Partial<CTemplate>) => setTemplates((l) => l.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const patchF = (id: string, p: Partial<FontEntry>) => setFonts((l) => l.map((f) => (f.id === id ? { ...f, ...p } : f)));

  const createTemplate: Ctx['createTemplate'] = useCallback((v) => {
    const k = kindById(v.kindId);
    const t: CTemplate = { id: 'n' + Date.now(), name: v.name, kindId: v.kindId, accent: v.accent, headline: v.name, sub: k.size, status: 'draft', updated: 'Just now', fonts: v.fonts, notes: [] };
    setTemplates((l) => [t, ...l]);
    return t;
  }, []);
  const duplicateTemplate = useCallback((id: string) => {
    setTemplates((l) => { const i = l.findIndex((t) => t.id === id); if (i < 0) return l; return [{ ...l[i], id: 'n' + Date.now(), name: l[i].name + ' (copy)', status: 'draft' as const, updated: 'Just now', submitted: undefined, decided: undefined, notes: [] }, ...l]; });
    say(tr("Duplicated as a draft."));
  }, [say]);
  const removeTemplate = useCallback((id: string) => {
    const list = tref.current; const at = list.findIndex((t) => t.id === id); const r = list[at];
    if (!r) return;
    setTemplates(list.filter((t) => t.id !== id));
    say({ msg: tr("Deleted “{name}”", { name: tr(r.name) }), label: tr("Undo"), action: () => setTemplates((l) => { const n = [...l]; n.splice(Math.min(at, n.length), 0, r); return n; }) });
  }, [say]);
  const submitTemplate: Ctx['submitTemplate'] = useCallback((id, d) => {
    const t = tref.current.find((x) => x.id === id); if (!t) return;
    patchT(id, { status: 'review', submitted: 'Today', updated: 'Today', fonts: d.fonts || t.fonts, theme: d.theme ? SETTINGS.theme.name : t.theme, notes: d.notes ? [...t.notes, { by: 'you', text: d.notes, when: 'Today' }] : t.notes });
    say(tr("Submitted. The Ifiok team will review it."));
  }, [say]);
  const decideTemplate: Ctx['decideTemplate'] = useCallback((id, r) => {
    const t = tref.current.find((x) => x.id === id); if (!t) return;
    if (r === 'approve') {
      const amount = kindById(t.kindId).bounty;
      patchT(id, { status: 'approved', decided: 'Today', updated: 'Today', notes: [...t.notes, { by: 'reviewer', text: 'Clear and easy to edit. Approved.', when: 'Today' }] });
      setLedger((l) => [...l, { id: 'e' + Date.now(), kind: 'template', templateId: id, name: t.name, amount, date: 'Today', status: 'available' }]);
      say(tr("Approved. {amount} added to your earnings.", { amount: naira(amount) }));
    } else if (r === 'changes') {
      patchT(id, { status: 'changes', updated: 'Today', notes: [...t.notes, { by: 'reviewer', text: 'Please improve the contrast of the headline and keep all text editable, then resubmit.', when: 'Today' }] });
      say(tr("Changes requested."));
    } else {
      patchT(id, { status: 'rejected', decided: 'Today', updated: 'Today', notes: [...t.notes, { by: 'reviewer', text: 'This is too close to an existing template. Please make it your own.', when: 'Today' }] });
      say(tr("Not approved."));
    }
  }, [say]);

  const saveFont = useCallback((f: FontEntry) => {
    setFonts((l) => (l.some((x) => x.id === f.id) ? l.map((x) => (x.id === f.id ? f : x)) : [f, ...l]));
  }, []);
  const removeFont = useCallback((id: string) => {
    const list = fref.current; const at = list.findIndex((f) => f.id === id); const r = list[at];
    if (!r) return;
    setFonts(list.filter((f) => f.id !== id));
    say({ msg: tr("Deleted “{family}”", { family: r.family }), label: tr("Undo"), action: () => setFonts((l) => { const n = [...l]; n.splice(Math.min(at, n.length), 0, r); return n; }) });
  }, [say]);
  const submitFont = useCallback((id: string, note: string) => {
    const f = fref.current.find((x) => x.id === id); if (!f) return;
    patchF(id, { status: 'review', submitted: 'Today', updated: 'Today', notes: note ? [...(f.notes ?? []), { by: 'you', text: note, when: 'Today' }] : f.notes });
    say(tr("Submitted. The Ifiok team will review your font."));
  }, [say]);
  const decideFont: Ctx['decideFont'] = useCallback((id, r) => {
    const f = fref.current.find((x) => x.id === id); if (!f) return;
    const notes = f.notes ?? [];
    if (r === 'approve') {
      patchF(id, { status: 'approved', decided: 'Today', updated: 'Today', notes: [...notes, { by: 'reviewer', text: 'Clean spacing and a complete character set. Approved.', when: 'Today' }] });
      setLedger((l) => [...l, { id: 'e' + Date.now(), kind: 'font', templateId: id, name: `${f.family} (font)`, amount: FONT_BOUNTY, date: 'Today', status: 'available' }]);
      say(tr("Approved. {amount} added to your earnings, and designers can now use it.", { amount: naira(FONT_BOUNTY) }));
    } else if (r === 'changes') {
      patchF(id, { status: 'changes', updated: 'Today', notes: [...notes, { by: 'reviewer', text: 'Please check the spacing between letters and the accents on ẹ and ọ, then resubmit.', when: 'Today' }] });
      say(tr("Changes requested."));
    } else {
      patchF(id, { status: 'rejected', decided: 'Today', updated: 'Today', notes: [...notes, { by: 'reviewer', text: 'We could not confirm you have the right to share this font.', when: 'Today' }] });
      say(tr("Not approved."));
    }
  }, [say]);

  const saveAccount = useCallback((a: Account) => { setAccount(a); say(tr("Payout account verified.")); }, [say]);
  const clearAccount = useCallback(() => { setAccount(null); say(tr("Payout account removed. Add and verify a new one to request payouts.")); }, [say]);
  const requestPayout = useCallback(() => {
    const a = aref.current; if (!a) return;
    const b = balances(lref.current);
    const id = 'p' + Date.now();
    const ref = `PO-${String(pref.current.length + 8).padStart(4, '0')}`;
    setPayouts((l) => [{ id, ref, amount: b.available, date: 'Today', status: 'processing', account: mask(a) }, ...l]);
    setLedger((l) => l.map((e) => (e.status === 'available' ? { ...e, status: 'requested', payoutId: id } : e)));
    say(tr("Payout of {available} requested.", { available: naira(b.available) }));
  }, [say]);
  const simulatePaid = useCallback((id: string) => {
    setPayouts((l) => l.map((p) => (p.id === id ? { ...p, status: 'paid' } : p)));
    setLedger((l) => l.map((e) => (e.payoutId === id ? { ...e, status: 'paid' } : e)));
    say(tr("Marked as paid (prototype)."));
  }, [say]);

  const approvedFonts = useMemo(() => fonts.filter((f) => f.status === 'approved'), [fonts]);
  const value: Ctx = {
    templates, fonts, ledger, payouts, account, profile, setProfile, createTemplate, duplicateTemplate, removeTemplate, submitTemplate, decideTemplate,
    saveFont, removeFont, submitFont, decideFont, saveAccount, clearAccount, requestPayout, simulatePaid, approvedFonts,
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export type { FontFile };
