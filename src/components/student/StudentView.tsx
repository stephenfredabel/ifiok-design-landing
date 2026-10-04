'use client';

import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronRight, CircleAlert, Clock, FileUp, GraduationCap, Lock, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CAMPUSES } from '@/data/creators';
import { LEVELS, PERKS, STUDENT_STEPS, VALID_MONTHS, type Perk } from '@/data/student';
import { useStudent, type Application } from './store';

import { tr } from '@/i18n/tr';
type Form = { school: string; dept: string; level: string; matric: string; idName: string; idPreview: string; agree: boolean };
const EMPTY: Form = { school: '', dept: '', level: '', matric: '', idName: '', idPreview: '', agree: false };
const MAX = 5 * 1024 * 1024;

function School({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const list = useMemo(() => { const n = value.trim().toLowerCase(); return (n ? CAMPUSES.filter((c) => c.toLowerCase().includes(n)) : CAMPUSES).slice(0, 7); }, [value]);
  useEffect(() => { const out = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener('pointerdown', out); return () => document.removeEventListener('pointerdown', out); }, []);
  const pick = (v: string) => { onChange(v); setOpen(false); };
  return (
    <div className="st-combo" ref={ref}>
      <input id="st-school" value={value} autoComplete="off" placeholder={tr("Start typing your school's name")} role="combobox" aria-expanded={open} aria-controls="st-school-list" aria-autocomplete="list" aria-invalid={!!error}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setI(0); }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setI((x) => Math.min(list.length - 1, x + 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
          else if (e.key === 'Enter' && open && list[i]) { e.preventDefault(); pick(list[i]); }
          else if (e.key === 'Escape') setOpen(false);
        }} />
      {open && (
        <ul className="st-list" id="st-school-list" role="listbox">
          {list.map((c, n) => <li key={c} role="option" aria-selected={n === i} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)} onMouseMove={() => setI(n)}>{c}</li>)}
          {list.length === 0 && <li className="none">{tr("Not in the list? Keep typing the full name and we will use it.")}</li>}
        </ul>
      )}
    </div>
  );
}

/** Mirrors the real flow: sign in, school, ID photo, then Ifiok reviews it. */
function Onboarding({ reapply }: { reapply: boolean }) {
  const S = useStudent()!;
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Form>(EMPTY);
  const [err, setErr] = useState<Record<string, string>>({});
  const top = useRef<HTMLDivElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setErr((e) => ({ ...e, [k]: '' })); };

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (f.school.trim().length < 3) e.school = tr("Pick your school from the list, or type its full name.");
      if (f.dept.trim().length < 2) e.dept = tr("Enter your department.");
      if (!f.level) e.level = tr("Choose your level.");
    }
    if (s === 2) {
      if (f.matric.trim().length < 4) e.matric = tr("Enter your matric or student ID number.");
      if (!f.idName) e.id = tr("Upload a clear photo of your student ID card.");
    }
    if (s === 3 && !f.agree) e.agree = tr("We need your OK to check your ID.");
    return e;
  };
  const go = (n: number) => { setStep(n); setErr({}); requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
  const next = () => { const e = validate(step); setErr(e); if (Object.values(e).some(Boolean)) return; go(step + 1); };
  const onFile = (file?: File) => {
    if (!file) return;
    if (!/^image\/|application\/pdf/.test(file.type)) { setErr((e) => ({ ...e, id: tr('Use a photo (JPG or PNG) or a PDF.') })); return; }
    if (file.size > MAX) { setErr((e) => ({ ...e, id: tr('That file is over 5 MB. Choose a smaller photo.') })); return; }
    if (f.idPreview) URL.revokeObjectURL(f.idPreview);
    setF((p) => ({ ...p, idName: file.name, idPreview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '' }));
    setErr((e) => ({ ...e, id: '' }));
  };
  const submit = () => {
    const e = validate(3); setErr(e); if (Object.values(e).some(Boolean)) return;
    const a: Application = { school: f.school.trim(), dept: f.dept.trim(), level: f.level, matric: f.matric.trim(), idName: f.idName, submitted: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) };
    S.submit(a);
  };

  return (
    <section className="st-card" ref={top}>
      <header className="st-h">
        <p className="cd-kick">{reapply ? tr("Apply again") : tr("Verify you are a student")}</p>
        <h2>{tr("Free for students")}</h2>
        <p className="muted">{tr("Verify once with your school ID and unlock your student perks. Your ID is only used to confirm you are a student.")}</p>
      </header>
      <ol className="st-steps" aria-label={tr("Progress")}>
        {STUDENT_STEPS.map((s, n) => {
          const state = n === 0 || n < step ? 'done' : n === step ? 'now' : '';
          return <li key={s.id} className={state} aria-current={n === step ? 'step' : undefined}><span>{state === 'done' ? <Check aria-hidden="true" /> : n + 1}</span><b>{tr(s.label)}</b></li>;
        })}
      </ol>
      <p className="st-conn"><BadgeCheck aria-hidden="true" />{tr("Connected to your Ifiok account. We already have your name and email.")}</p>

      {step === 1 && (
        <div className="st-form">
          <label className="field"><span className="lbl">{tr("School")}</span><School value={f.school} onChange={(v) => set('school', v)} error={err.school} />{err.school && <span className="cd-err" role="alert">{err.school}</span>}</label>
          <div className="st-two">
            <label className="field"><span className="lbl">{tr("Department")}</span><input id="st-dept" value={f.dept} onChange={(e) => set('dept', e.target.value)} placeholder={tr("e.g. Mass Communication")} aria-invalid={!!err.dept} />{err.dept && <span className="cd-err" role="alert">{err.dept}</span>}</label>
            <label className="field"><span className="lbl">{tr("Level")}</span>
              <select id="st-level" value={f.level} onChange={(e) => set('level', e.target.value)} aria-invalid={!!err.level}><option value="">{tr("Choose level")}</option>{LEVELS.map((l) => <option key={l} value={l}>{tr(l)}</option>)}</select>
              {err.level && <span className="cd-err" role="alert">{err.level}</span>}
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="st-form">
          <label className="field"><span className="lbl">{tr("Matric or student ID number")}</span><input id="st-matric" value={f.matric} onChange={(e) => set('matric', e.target.value)} placeholder={tr("Your matric number")} aria-invalid={!!err.matric} />{err.matric && <span className="cd-err" role="alert">{err.matric}</span>}</label>
          <div className="field"><span className="lbl">{tr("Photo of your student ID")}</span>
            <label htmlFor="st-id" className={`st-drop${f.idName ? ' has' : ''}${err.id ? ' bad' : ''}`}>
              {f.idPreview ? <img src={f.idPreview} alt="" /> : <FileUp aria-hidden="true" />}
              <span><b>{f.idName || tr("Tap to upload your school ID")}</b><small>{f.idName ? tr("Tap to replace") : tr("JPG, PNG or PDF, up to 5 MB")}</small></span>
            </label>
            <input id="st-id" className="sr" type="file" accept="image/*,application/pdf" onChange={(e) => onFile(e.target.files?.[0])} />
            {err.id && <span className="cd-err" role="alert">{err.id}</span>}
            <p className="muted">{tr("Take the photo in good light and make sure your name and photo are readable.")}</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="st-form">
          <dl className="specs">
            <div><dt>{tr("School")}</dt><dd>{f.school}</dd></div>
            <div><dt>{tr("Department")}</dt><dd>{f.dept} · {tr(f.level)}</dd></div>
            <div><dt>{tr("Matric number")}</dt><dd className="mono">{f.matric}</dd></div>
            <div><dt>{tr("ID photo")}</dt><dd>{f.idName}</dd></div>
          </dl>
          <label className="cd-check"><input type="checkbox" checked={f.agree} onChange={(e) => set('agree', e.target.checked)} /><span>{tr("I confirm I am a current student and that Ifiok may check my ID. Verification lasts up to a year, then I apply again.")}</span></label>
          {err.agree && <p className="cd-err" role="alert">{err.agree}</p>}
        </div>
      )}

      <footer className="st-actions">
        {step > 1 ? <button type="button" className="btn-s" onClick={() => go(step - 1)}><ArrowLeft aria-hidden="true" />{tr("Back")}</button> : <span />}
        {step < 3 ? <button type="button" className="btn-p" onClick={next}>{tr("Continue")}<ArrowRight aria-hidden="true" /></button> : <button type="button" className="btn-p" onClick={submit}><GraduationCap aria-hidden="true" />{tr("Submit for review")}</button>}
      </footer>
    </section>
  );
}

function PerkCard({ p, active, go }: { p: Perk; active: boolean; go: (v: string) => void }) {
  const live = p.status === 'included';
  const on = active && live;
  const action = p.action;
  return (
    <article className={`st-perk${on ? '' : ' off'}`}>
      <span className="act-ic" aria-hidden="true"><p.Icon /></span>
      <div>
        <h3>{tr(p.title)}</h3>
        <p>{tr(p.blurb)}</p>
        {!live ? <span className="st-tag">{tr("Coming soon")}</span> : !active ? <span className="st-tag lock"><Lock aria-hidden="true" />{tr("Unlocks when you are verified")}</span> : action && (
          action.href ? <a className="st-link" href={action.href.startsWith('/') ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${action.href}` : action.href} target={action.href.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer">{tr(action.label)}<ChevronRight aria-hidden="true" /></a>
          : <button type="button" className="st-link" onClick={() => go(action.view!)}>{tr(action.label)}<ChevronRight aria-hidden="true" /></button>
        )}
      </div>
    </article>
  );
}

export function StudentView({ go, first }: { go: (v: string) => void; first: string }) {
  const S = useStudent()!;
  const verified = S.status === 'verified';
  return (
    <div className="view">
      <section className="st-hero">
        <div className="hero-glow" aria-hidden="true" />
        <span className="st-pill"><GraduationCap aria-hidden="true" />{tr("Student perks")}</span>
        <h1>{verified ? tr("You are verified, {first}", { first }) : tr("Free for students")}</h1>
        <p>{verified ? tr("Your student perks are on. Make something for class today.") : tr("Verify once with your school ID and unlock Ifiok’s student perks.")}</p>
      </section>

      {S.status === 'none' && <Onboarding reapply={false} />}
      {S.status === 'rejected' && (<><section className="st-card warn"><CircleAlert aria-hidden="true" /><div><h2>{tr("We could not verify you yet")}</h2><p>{tr(S.note)}</p></div></section><Onboarding reapply /></>)}
      {S.status === 'pending' && (
        <section className="st-card">
          <header className="st-h"><p className="cd-kick">{tr("Application under review")}</p><h2><Clock aria-hidden="true" className="st-clock" />{tr("We are checking your ID")}</h2><p className="muted">{tr("Submitted {submitted}. {school}. The Ifiok team usually replies within a few working days, and we will let you know here.", { submitted: tr(S.app?.submitted), school: S.app?.school })}</p></header>
          <ol className="cd-timeline"><li className="on"><span className="dot"><Check aria-hidden="true" /></span><b>{tr("Account connected")}</b><small /></li><li className="on"><span className="dot"><Check aria-hidden="true" /></span><b>{tr("School and ID sent")}</b><small>{tr(S.app?.submitted)}</small></li><li className="on"><span className="dot"><Check aria-hidden="true" /></span><b>{tr("Ifiok review")}</b><small>{tr("Now")}</small></li><li><span className="dot"><CircleDot /></span><b>{tr("Perks on")}</b><small /></li></ol>
          <div className="cd-sim"><p className="lbl">{tr("Prototype only: simulate the decision")}</p><div><button type="button" className="btn-s" onClick={() => S.decide('approve')}>{tr("Approve")}</button><button type="button" className="btn-s" onClick={() => S.decide('decline')}>{tr("Decline")}</button></div></div>
        </section>
      )}
      {verified && (
        <section className="st-card ok">
          <BadgeCheck aria-hidden="true" />
          <div><h2>{tr("You are a verified student")}</h2><p>{tr("{school}. Student perks are on until {expires}. Verification lasts up to {months} months, then you apply again.", { school: S.app?.school, expires: S.expires, months: VALID_MONTHS })}</p></div>
        </section>
      )}

      <section className="blk">
        <header className="blk-h"><h2>{verified ? tr("Your perks") : tr("What you get")}</h2></header>
        <div className="st-perks">{PERKS.map((p) => <PerkCard key={p.id} p={p} active={verified} go={go} />)}</div>
        <p className="muted">{tr("Ifiok decides what is included. The list may grow, and some perks are still on the way.")}</p>
      </section>
      {verified && <button type="button" className="btn-s st-restart" onClick={S.restart}>{tr("Start over (prototype)")}</button>}
    </div>
  );
}

function CircleDot() { return <i />; }

/** On Home: connects students to verification when they have not finished it. */
export function StudentStrip({ go, always = false }: { go: (v: string) => void; always?: boolean }) {
  const S = useStudent();
  if (!S) return null;
  if (S.status === 'verified') return always ? (
    <section className="st-strip ok" aria-label={tr("Student")}>
      <BadgeCheck aria-hidden="true" /><span><b>{tr("Verified student")}</b><small>{tr("Perks on until {expires}", { expires: S.expires })}</small></span>
      <button type="button" className="btn-s" onClick={() => go('student')}>{tr("Your perks")}</button>
    </section>
  ) : null;
  if (S.dismissed && !always) return null;
  const pending = S.status === 'pending';
  return (
    <section className="st-strip" aria-label={tr("Student")}>
      <GraduationCap aria-hidden="true" />
      <span>
        <b>{pending ? tr("Your student ID is being checked") : S.status === 'rejected' ? tr("We could not verify your ID yet") : tr("Are you a student? Get verified, it is free")}</b>
        <small>{pending ? tr("We will let you know here.") : tr("Add your school and ID once to unlock student perks.")}</small>
      </span>
      <button type="button" className="btn-p" onClick={() => go('student')}>{pending ? tr("See status") : S.status === 'rejected' ? tr("Apply again") : tr("Verify now")}</button>
      {!always && !pending && <button type="button" className="st-x" aria-label={tr("Hide this for now")} onClick={S.dismiss}><X aria-hidden="true" /></button>}
    </section>
  );
}
