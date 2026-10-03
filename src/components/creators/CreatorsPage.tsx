'use client';

import { ArrowRight, Check, ChevronDown, ChevronUp, Eye, EyeOff, GraduationCap, MapPin, Printer, Settings2, ShieldCheck, Smartphone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ApplyForm from './ApplyForm';
import CrArt from './CrArt';
import {
  CAMPUSES, CHECKLIST, CREATE_TABS, DEFAULT_BLOCKS, FAQ, LEARN, PROGRAM, STANDARDS, STEPS, TEMPLATE_TYPES, THEMES, WAITLIST_COUNTRIES, type BlockId,
} from '@/data/creators';
import './creators.css';

const SAVED = 'ifiok.creators.blocks.v1';
type Block = { id: BlockId; label: string; visible: boolean };

function Waitlist() {
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!country) return setErr('Choose your country.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErr('Enter an email address like name@example.com.');
    setErr('');
    setOk(true);
  };
  if (ok) return <p className="cr-ok" role="status"><Check aria-hidden="true" />You are on the list for {country}. We will email you when it opens. (Prototype: nothing was sent.)</p>;
  return (
    <form className="cr-wait" onSubmit={submit} noValidate>
      <div className="cr-field">
        <label htmlFor="wl-country">Country</label>
        <select id="wl-country" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">Choose your country</option>
          {WAITLIST_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="cr-field">
        <label htmlFor="wl-email">Email</label>
        <input id="wl-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <button type="submit" className="cr-btn solid">Join the waitlist</button>
      {err && <p className="cr-err" role="alert">{err}</p>}
    </form>
  );
}

export default function CreatorsPage() {
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [admin, setAdmin] = useState(false);
  const [panel, setPanel] = useState(false);
  const [tab, setTab] = useState(CREATE_TABS[0].id);
  const applyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setAdmin(new URLSearchParams(location.search).has('admin'));
      const raw = localStorage.getItem(SAVED);
      if (raw) {
        const saved = JSON.parse(raw) as { id: BlockId; visible: boolean }[];
        const byId = new Map(DEFAULT_BLOCKS.map((b) => [b.id, b]));
        const merged = saved.filter((s) => byId.has(s.id)).map((s) => ({ ...byId.get(s.id)!, visible: s.visible }));
        DEFAULT_BLOCKS.forEach((b) => { if (!merged.find((m) => m.id === b.id)) merged.push(b); });
        setBlocks(merged);
      }
    } catch {}
  }, []);
  const save = (next: Block[]) => { setBlocks(next); try { localStorage.setItem(SAVED, JSON.stringify(next.map(({ id, visible }) => ({ id, visible })))); } catch {} };
  const move = (i: number, d: -1 | 1) => { const n = [...blocks]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; save(n); };
  const toggle = (i: number) => save(blocks.map((b, k) => (k === i ? { ...b, visible: !b.visible } : b)));
  const reset = () => save(DEFAULT_BLOCKS);
  const toApply = () => { (document.querySelector('.cr-form') ?? document.getElementById('apply'))?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const toWaitlist = () => { document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const current = CREATE_TABS.find((t) => t.id === tab)!;

  const render: Record<BlockId, () => React.ReactNode> = {
    hero: () => (
      <section className="cr-hero" id="top">
        <div className="cr-wrap cr-hero-grid">
          <div>
            <p className="cr-pill"><GraduationCap aria-hidden="true" />{PROGRAM.sub}</p>
            <h1>Get paid for what you design.</h1>
            <p className="cr-lead">Make templates for Ifiok. When we approve them, you get paid, and your payouts show on your creator dashboard.</p>
            <div className="cr-cta">
              <button type="button" className="cr-btn gold" onClick={toApply}>Apply as a creator<ArrowRight aria-hidden="true" /></button>
              <a className="cr-btn line" href="#steps">See how it works</a>
            </div>
            <ul className="cr-trio" aria-label="The short version">
              <li>Submit</li><li>Approved</li><li>Paid</li>
            </ul>
          </div>
          <div className="cr-collage" aria-hidden="true">
            <CrArt kind="flyer" title="GRAND OPENING" sub="Saturday · 10am" accent="#B6322B" h={210} className="c1" />
            <CrArt kind="card" title="Adaeze Okafor" sub="Founder · Okafor Bakes" accent="#0B7A7F" h={120} className="c2" />
            <CrArt kind="poster" title="CLASS OF 2026" sub="Faculty of Arts" accent="#0F3D3E" h={230} className="c3" />
            <div className="cr-dash">
              <p className="cr-dash-h">Your creator dashboard <em>Example</em></p>
              <ul>
                <li><span>Grand Opening flyer</span><b className="s paid">Paid</b></li>
                <li><span>Class of 2026 poster</span><b className="s ok">Approved</b></li>
                <li><span>Okafor Bakes card</span><b className="s rev">In review</b></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    ),
    steps: () => (
      <section id="steps" className="cr-sec">
        <div className="cr-wrap">
          <p className="cr-kick">How it works</p>
          <h2>A simple path from idea to income.</h2>
          <ol className="cr-steps">
            {STEPS.map((s, n) => (
              <li key={s.t}><span className="n mono">0{n + 1}</span><h3>{s.t}</h3><p>{s.p}</p></li>
            ))}
          </ol>
          <p className="cr-aside"><ShieldCheck aria-hidden="true" />Every submission is reviewed by the Ifiok team. We review quality, not quantity.</p>
        </div>
      </section>
    ),
    create: () => (
      <section id="create" className="cr-sec alt">
        <div className="cr-wrap">
          <p className="cr-kick">What you can create</p>
          <h2>Start with templates people already search for.</h2>
          <ul className="cr-tags" aria-label="Popular template types">{TEMPLATE_TYPES.map((t) => <li key={t}>{t}</li>)}</ul>
          <div className="cr-tabs" role="tablist" aria-label="Template categories">
            {CREATE_TABS.map((t) => (
              <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="tabpanel" onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div className="cr-panel" role="tabpanel" id="tabpanel" aria-labelledby={`tab-${current.id}`}>
            <div className="cr-art-row">
              {current.art.map((a) => <CrArt key={a.title} {...a} h={a.kind === 'banner' ? 120 : a.kind === 'card' ? 130 : 200} />)}
            </div>
            <div>
              <h3>{current.label}</h3>
              <p>{current.blurb}</p>
              <p className="cr-sub">What reviewers look for</p>
              <ul className="cr-ticks">{current.looks.map((l) => <li key={l}><Check aria-hidden="true" />{l}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>
    ),
    apply: () => (
      <section id="apply" className="cr-sec">
        <div className="cr-wrap cr-apply" ref={applyRef}>
          <aside className="cr-before">
            <p className="cr-kick">Before you apply</p>
            <h2>Have these ready.</h2>
            <ol className="cr-check-list">
              {CHECKLIST.map((c, n) => (<li key={c.t}><span>{n + 1}</span><div><b>{c.t}</b><p>{c.p}</p></div></li>))}
            </ol>
            <p className="cr-aside"><Smartphone aria-hidden="true" />No bank details at this stage. After approval you add payout details on your dashboard.</p>
            <p className="cr-small">Open to verified students in Nigeria. It is free to join.</p>
          </aside>
          <ApplyForm onWaitlist={toWaitlist} />
        </div>
      </section>
    ),
    standards: () => (
      <section id="standards" className="cr-sec alt">
        <div className="cr-wrap">
          <p className="cr-kick">Quality standards</p>
          <h2>What gets approved, and what does not.</h2>
          <div className="cr-std">
            {STANDARDS.map((s) => (
              <div key={s.t} className={s.good ? 'good' : 'bad'}><span aria-hidden="true">{s.good ? <Check /> : <X />}</span><div><b>{s.t}</b><p>{s.p}</p></div></div>
            ))}
          </div>
        </div>
      </section>
    ),
    campuses: () => (
      <section id="campuses" className="cr-sec">
        <div className="cr-wrap">
          <p className="cr-kick">Every campus</p>
          <h2>Universities, polytechnics and colleges of education, across Nigeria.</h2>
          <p className="cr-lead dim">Wherever you study, you can apply. Here is a sample of the schools our creators come from.</p>
          <div className="cr-marquee" tabIndex={0} aria-label="Sample of participating schools, scrolls sideways">
            {CAMPUSES.slice(0, 40).map((c) => <span key={c}><MapPin aria-hidden="true" />{c.replace(/\s*\(.*\)/, '')}</span>)}
          </div>
          <p className="cr-small">Do not see your school? Type its full name in the form and we will add it.</p>
        </div>
      </section>
    ),
    themes: () => (
      <section id="themes" className="cr-sec alt">
        <div className="cr-wrap">
          <p className="cr-kick">Monthly themes</p>
          <h2>Design for the moments Nigeria celebrates.</h2>
          <p className="cr-lead dim">Each month we highlight a theme and feature standout work. Example themes shown.</p>
          <ul className="cr-themes">
            {THEMES.map((t, n) => (<li key={t.m}><span className="mono">{String(n + 1).padStart(2, '0')}</span><b>{t.m}</b><p>{t.t}</p></li>))}
          </ul>
        </div>
      </section>
    ),
    learn: () => (
      <section id="learn" className="cr-sec">
        <div className="cr-wrap cr-learn">
          <div>
            <p className="cr-kick">Learn as you go</p>
            <h2>Your design can end up on a real wall.</h2>
            <p className="cr-lead dim">Ifiok is a print service as well as an editor. Approved templates are used by real businesses who print them, so we teach you how work is made print-ready.</p>
            <p className="cr-aside"><Printer aria-hidden="true" />Design, order and delivery all happen in one place.</p>
          </div>
          <ul className="cr-learn-list">
            {LEARN.map((l) => (<li key={l.t}><b>{l.t}</b><p>{l.p}</p></li>))}
          </ul>
        </div>
      </section>
    ),
    faq: () => (
      <section id="faq" className="cr-sec alt">
        <div className="cr-wrap cr-faq">
          <h2>Frequently asked questions</h2>
          <div>
            {FAQ.map((f, n) => (
              <details key={f.q} open={n === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    ),
    waitlist: () => (
      <section id="waitlist" className="cr-sec">
        <div className="cr-wrap cr-waitbox">
          <div>
            <p className="cr-kick">Not in Nigeria yet?</p>
            <h2>Tell us where you are.</h2>
            <p className="cr-lead dim">We are opening country by country. Join the waitlist and we will email you the moment yours opens.</p>
          </div>
          <Waitlist />
        </div>
      </section>
    ),
    cta: () => (
      <section className="cr-sec">
        <div className="cr-wrap">
          <div className="cr-band">
            <h2>Put your creativity to work.</h2>
            <p>Free to join. Reviewed for quality. Built for students.</p>
            <button type="button" className="cr-btn gold" onClick={toApply}>Apply as a creator<ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </section>
    ),
  };

  return (
    <div className="cr">
      <div className="cr-notice"><span className="dot" aria-hidden="true" />{PROGRAM.status}. Ghana, Kenya and more are coming: <button type="button" className="cr-link" onClick={toWaitlist}>join the waitlist</button></div>
      {blocks.filter((b) => b.visible).map((b) => <div key={b.id}>{render[b.id]()}</div>)}

      {admin && (
        <>
          <button type="button" className="cr-admin-btn" onClick={() => setPanel((p) => !p)} aria-expanded={panel}><Settings2 aria-hidden="true" />Admin preview</button>
          {panel && (
            <aside className="cr-admin" aria-label="Admin preview">
              <header><b>Page sections</b><button type="button" className="cr-x" aria-label="Close" onClick={() => setPanel(false)}><X aria-hidden="true" /></button></header>
              <p className="cr-small">Prototype of the admin controls: show, hide and reorder every section. In the live app this sits in the admin area and also edits the copy, FAQ, themes and campus list.</p>
              <ol>
                {blocks.map((b, i) => (
                  <li key={b.id} className={b.visible ? '' : 'off'}>
                    <span>{b.label}</span>
                    <span className="ctl">
                      <button type="button" onClick={() => move(i, -1)} aria-label={`Move ${b.label} up`} disabled={i === 0}><ChevronUp aria-hidden="true" /></button>
                      <button type="button" onClick={() => move(i, 1)} aria-label={`Move ${b.label} down`} disabled={i === blocks.length - 1}><ChevronDown aria-hidden="true" /></button>
                      <button type="button" onClick={() => toggle(i)} aria-pressed={b.visible} aria-label={`${b.visible ? 'Hide' : 'Show'} ${b.label}`}>{b.visible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}</button>
                    </span>
                  </li>
                ))}
              </ol>
              <button type="button" className="cr-btn line" onClick={reset}>Reset to default</button>
            </aside>
          )}
        </>
      )}
    </div>
  );
}
