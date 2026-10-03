'use client';

import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileUp, GraduationCap, IdCard, Briefcase, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CAMPUSES, LEVELS, PROGRAM, TEMPLATE_TYPES, TOOLS } from '@/data/creators';

type Category = 'student' | 'nysc' | 'individual';
type Upload = { name: string; size: number; preview?: string } | null;
type Form = {
  category: Category | '';
  name: string; email: string; phone: string;
  school: string; dept: string; level: string; matric: string; idFile: Upload;
  stateCode: string; callUp: string; nyscFile: Upload;
  link: string; country: string;
  create: string[]; tools: string[]; experience: '' | 'beginner' | 'some' | 'pro'; about: string; captain: boolean;
  agreeOriginal: boolean; agreeReview: boolean; agreeVerify: boolean;
};
type Errors = Partial<Record<string, string>>;

const EMPTY: Form = {
  category: '', name: '', email: '', phone: '',
  school: '', dept: '', level: '', matric: '', idFile: null,
  stateCode: '', callUp: '', nyscFile: null,
  link: '', country: 'Nigeria',
  create: [], tools: [], experience: '', about: '', captain: false,
  agreeOriginal: false, agreeReview: false, agreeVerify: false,
};
const STORE = 'ifiok.creator.draft.v1';
const STEPS = ['You', 'Verify', 'Your craft', 'Review'];
const MAX_FILE = 5 * 1024 * 1024;

const isUrl = (v: string) => { try { const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`); return u.hostname.includes('.'); } catch { return false; } };
const isPhone = (v: string) => /^(?:\+?234|0)[789][01]\d{8}$/.test(v.replace(/[\s-]/g, ''));
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function validate(step: number, f: Form): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!f.category) e.category = 'Choose the option that describes you.';
    if (f.name.trim().length < 3 || !f.name.trim().includes(' ')) e.name = 'Enter your full name, first and last.';
    if (!isEmail(f.email.trim())) e.email = 'Enter an email address like name@example.com.';
    if (!isPhone(f.phone)) e.phone = 'Enter a Nigerian number such as 0803 000 0000 or +234 803 000 0000.';
  }
  if (step === 1) {
    if (f.category === 'student') {
      if (f.school.trim().length < 3) e.school = 'Pick your school from the list, or type its full name.';
      if (f.dept.trim().length < 2) e.dept = 'Enter your department.';
      if (!f.level) e.level = 'Choose your level.';
      if (f.matric.trim().length < 4) e.matric = 'Enter your matric or student ID number.';
      if (!f.idFile) e.idFile = 'Upload a clear photo of your school ID card.';
    }
    if (f.category === 'nysc') {
      if (!/^[A-Za-z]{2}\/\d{2}[A-Za-z]\/\d{3,5}$/.test(f.stateCode.trim())) e.stateCode = 'Use your state code format, for example LA/24A/1234.';
      if (f.callUp.trim().length < 6) e.callUp = 'Enter your call-up number.';
      if (!f.nyscFile) e.nyscFile = 'Upload a photo of your NYSC ID card or call-up letter.';
    }
    if (f.category === 'individual') {
      if (!isUrl(f.link.trim())) e.link = 'Add a link to your work, such as Behance, Instagram or Google Drive.';
      if (f.country !== 'Nigeria') e.country = 'The program is open in Nigeria only for now. Join the waitlist instead.';
    }
  }
  if (step === 2) {
    if (f.create.length === 0) e.create = 'Choose at least one thing you would like to make.';
    if (!f.experience) e.experience = 'Tell us roughly where you are.';
    if (f.link.trim() && !isUrl(f.link.trim())) e.link = 'That link does not look right. Check it and try again.';
    if (f.about.length > 300) e.about = 'Keep it under 300 characters.';
  }
  if (step === 3) {
    if (!f.agreeOriginal) e.agreeOriginal = 'Please confirm the work will be your own.';
    if (!f.agreeReview) e.agreeReview = 'Please confirm you understand Ifiok reviews and approves each template.';
    if (!f.agreeVerify) e.agreeVerify = 'We need your consent to check the details you gave.';
  }
  return e;
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`cr-field${error ? ' bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="cr-hint" id={`${id}-h`}>{hint}</p>}
      {error && <p className="cr-err" id={`${id}-e`} role="alert">{error}</p>}
    </div>
  );
}

function CampusPicker({ id, value, onChange, error }: { id: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const matches = useMemo(() => {
    const n = value.trim().toLowerCase();
    return (n ? CAMPUSES.filter((c) => c.toLowerCase().includes(n)) : CAMPUSES).slice(0, 8);
  }, [value]);
  useEffect(() => {
    const out = (e: Event) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', out);
    return () => document.removeEventListener('pointerdown', out);
  }, []);
  const pick = (v: string) => { onChange(v); setOpen(false); };
  return (
    <div className="cr-combo" ref={wrap}>
      <input
        id={id} value={value} autoComplete="off" placeholder="Start typing your school's name"
        role="combobox" aria-expanded={open} aria-controls={`${id}-list`} aria-autocomplete="list" aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setI(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setI((x) => Math.min(matches.length - 1, x + 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
          else if (e.key === 'Enter' && open && matches[i]) { e.preventDefault(); pick(matches[i]); }
          else if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && (
        <ul className="cr-list" id={`${id}-list`} role="listbox">
          {matches.map((c, idx) => (
            <li key={c} role="option" aria-selected={idx === i} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)} onMouseMove={() => setI(idx)}>{c}</li>
          ))}
          {matches.length === 0 && <li className="none">Not in the list? Keep typing the full name and we will use it.</li>}
        </ul>
      )}
    </div>
  );
}

function FilePick({ id, value, onChange, error, label }: { id: string; value: Upload; onChange: (v: Upload) => void; error?: string; label: string }) {
  const [msg, setMsg] = useState('');
  const onFile = (file?: File) => {
    setMsg('');
    if (!file) return;
    if (!/^image\/|application\/pdf/.test(file.type)) { setMsg('Use a photo (JPG or PNG) or a PDF.'); return; }
    if (file.size > MAX_FILE) { setMsg('That file is over 5 MB. Choose a smaller photo.'); return; }
    if (value?.preview) URL.revokeObjectURL(value.preview);
    onChange({ name: file.name, size: file.size, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined });
  };
  return (
    <div>
      <label htmlFor={id} className={`cr-drop${error || msg ? ' bad' : ''}${value ? ' has' : ''}`}>
        {value ? (
          <span className="cr-file">
            {value.preview ? <img src={value.preview} alt="" /> : <FileUp aria-hidden="true" />}
            <span><b>{value.name}</b><small>{(value.size / 1024).toFixed(0)} KB · tap to replace</small></span>
          </span>
        ) : (
          <span className="cr-file blank"><FileUp aria-hidden="true" /><span><b>{label}</b><small>JPG, PNG or PDF, up to 5 MB</small></span></span>
        )}
      </label>
      <input id={id} className="sr" type="file" accept="image/*,application/pdf" onChange={(e) => onFile(e.target.files?.[0])} aria-describedby={error || msg ? `${id}-e` : undefined} />
      {(msg || error) && <p className="cr-err" id={`${id}-e`} role="alert">{msg || error}</p>}
      {value && <button type="button" className="cr-link" onClick={() => { if (value.preview) URL.revokeObjectURL(value.preview); onChange(null); }}>Remove file</button>}
    </div>
  );
}

function Chips({ options, value, onChange, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="cr-chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value.includes(o)} onClick={() => toggle(o)}>{value.includes(o) && <Check aria-hidden="true" />}{o}</button>
      ))}
    </div>
  );
}

export default function ApplyForm({ onWaitlist }: { onWaitlist: () => void }) {
  const uid = useId().replace(/:/g, '');
  const [f, setF] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [draft, setDraft] = useState<boolean>(false);
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const set = useCallback(<K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setErrors((p) => (p[k as string] ? { ...p, [k]: undefined } : p)); }, []);

  // Offer to resume a saved draft (files are never saved).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) { const d = JSON.parse(raw); if (d && d.f && (d.f.name || d.f.email || d.f.category)) { setF({ ...EMPTY, ...d.f, idFile: null, nyscFile: null }); setStep(Math.min(d.step ?? 0, 3)); setDraft(true); } }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || done) return;
    try { localStorage.setItem(STORE, JSON.stringify({ f: { ...f, idFile: null, nyscFile: null }, step })); } catch {}
  }, [f, step, ready, done]);

  const focusFirstError = (e: Errors) => {
    const key = Object.keys(e).find((k) => e[k]);
    if (!key) return;
    requestAnimationFrame(() => (document.getElementById(`${uid}-${key}`) ?? top.current)?.focus?.());
  };
  const go = (n: number) => { setStep(n); setErrors({}); requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
  const next = () => {
    const e = validate(step, f);
    setErrors(e);
    if (Object.values(e).some(Boolean)) { focusFirstError(e); return; }
    go(step + 1);
  };
  const submit = () => {
    const e = validate(3, f);
    setErrors(e);
    if (Object.values(e).some(Boolean)) { focusFirstError(e); return; }
    setSending(true);
    window.setTimeout(() => {
      const ref = `ICC-${PROGRAM.cohort}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      setDone(ref);
      setSending(false);
      try { localStorage.removeItem(STORE); } catch {}
      requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }, 900);
  };
  const reset = () => { setF(EMPTY); setStep(0); setErrors({}); setDone(null); setDraft(false); try { localStorage.removeItem(STORE); } catch {} };

  const id = (k: string) => `${uid}-${k}`;
  const aria = (k: string) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `${id(k)}-e` : undefined });

  if (done) {
    return (
      <div className="cr-form done" ref={top} tabIndex={-1}>
        <CheckCircle2 className="cr-done-ic" aria-hidden="true" />
        <h3>Application received</h3>
        <p>Thank you, {f.name.split(' ')[0]}. Your reference is <b className="mono">{done}</b>.</p>
        <ol className="cr-next">
          <li className="on"><b>Under review</b><span>The Ifiok team reviews your application in {PROGRAM.reviewTime}.</span></li>
          <li><b>You hear from us</b><span>We email {f.email || 'you'} when there is a decision.</span></li>
          <li><b>Dashboard opens</b><span>Once approved, sign in to submit templates, add your payout details and see your payouts.</span></li>
        </ol>
        <p className="cr-proto">This is a prototype. Nothing was sent anywhere.</p>
        <div className="cr-actions">
          <button type="button" className="cr-btn line" onClick={async () => { try { await navigator.clipboard.writeText(done); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} }}>{copied ? 'Copied' : 'Copy reference'}</button>
          <button type="button" className="cr-btn line" onClick={reset}><RotateCcw aria-hidden="true" />Start a new application</button>
        </div>
      </div>
    );
  }

  const cat = f.category;
  return (
    <div className="cr-form" ref={top} tabIndex={-1}>
      <header className="cr-form-h">
        <div>
          <p className="cr-kick">Join the program</p>
          <h3>Apply as a creator</h3>
        </div>
        <span className="cr-step-n mono">Step {step + 1} of 4</span>
      </header>
      <ol className="cr-prog" aria-label="Progress">
        {STEPS.map((s, n) => (
          <li key={s} className={n < step ? 'done' : n === step ? 'now' : ''} aria-current={n === step ? 'step' : undefined}>
            <span>{n < step ? <Check aria-hidden="true" /> : n + 1}</span><b>{s}</b>
          </li>
        ))}
      </ol>
      {draft && (
        <p className="cr-resume" role="status">
          Welcome back. We kept your answers from last time. <button type="button" className="cr-link" onClick={reset}>Start over</button>
          <button type="button" className="cr-x" aria-label="Dismiss" onClick={() => setDraft(false)}><X aria-hidden="true" /></button>
        </p>
      )}

      {step === 0 && (
        <div className="cr-step">
          <fieldset className="cr-cats">
            <legend>Which describes you?</legend>
            <div className="cr-catgrid" role="radiogroup" aria-label="Creator category" id={id('category')} tabIndex={-1}>
              {([
                ['student', GraduationCap, 'Student', 'In a Nigerian university, polytechnic or college of education.'],
                ['nysc', IdCard, 'NYSC corps member', 'Currently serving and ready to create templates.'],
                ['individual', Briefcase, 'Individual', 'Designer, freelancer, graduate or skilled creator.'],
              ] as const).map(([v, Icon, t, p]) => (
                <button key={v} type="button" role="radio" aria-checked={cat === v} className="cr-cat" onClick={() => set('category', v)}>
                  <Icon aria-hidden="true" /><b>{t}</b><small>{p}</small>
                </button>
              ))}
            </div>
            {errors.category && <p className="cr-err" role="alert">{errors.category}</p>}
          </fieldset>
          <Field id={id('name')} label="Full name" error={errors.name}><input id={id('name')} value={f.name} autoComplete="name" onChange={(e) => set('name', e.target.value)} placeholder="First and last name" {...aria('name')} /></Field>
          <div className="cr-two">
            <Field id={id('email')} label="Email" error={errors.email}><input id={id('email')} type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" {...aria('email')} /></Field>
            <Field id={id('phone')} label="Phone" error={errors.phone}><input id={id('phone')} type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0803 000 0000" {...aria('phone')} /></Field>
          </div>
        </div>
      )}

      {step === 1 && cat === 'student' && (
        <div className="cr-step">
          <Field id={id('school')} label="School" hint="Universities, polytechnics and colleges of education across Nigeria." error={errors.school}>
            <CampusPicker id={id('school')} value={f.school} onChange={(v) => set('school', v)} error={errors.school} />
          </Field>
          <div className="cr-two">
            <Field id={id('dept')} label="Department" error={errors.dept}><input id={id('dept')} value={f.dept} onChange={(e) => set('dept', e.target.value)} placeholder="e.g. Mass Communication" {...aria('dept')} /></Field>
            <Field id={id('level')} label="Level" error={errors.level}>
              <select id={id('level')} value={f.level} onChange={(e) => set('level', e.target.value)} {...aria('level')}>
                <option value="">Choose level</option>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <Field id={id('matric')} label="Matric or student ID number" error={errors.matric}><input id={id('matric')} value={f.matric} onChange={(e) => set('matric', e.target.value)} placeholder="Your matric number" {...aria('matric')} /></Field>
          <div className="cr-field"><span className="cr-lbl">School ID card (photo)</span><FilePick id={id('idFile')} label="Tap to upload your school ID" value={f.idFile} onChange={(v) => set('idFile', v)} error={errors.idFile} /></div>
        </div>
      )}

      {step === 1 && cat === 'nysc' && (
        <div className="cr-step">
          <div className="cr-two">
            <Field id={id('stateCode')} label="NYSC state code" hint="For example LA/24A/1234" error={errors.stateCode}><input id={id('stateCode')} value={f.stateCode} onChange={(e) => set('stateCode', e.target.value.toUpperCase())} placeholder="LA/24A/1234" {...aria('stateCode')} /></Field>
            <Field id={id('callUp')} label="Call-up number" error={errors.callUp}><input id={id('callUp')} value={f.callUp} onChange={(e) => set('callUp', e.target.value)} placeholder="Your call-up number" {...aria('callUp')} /></Field>
          </div>
          <div className="cr-field"><span className="cr-lbl">NYSC ID card or call-up letter</span><FilePick id={id('nyscFile')} label="Tap to upload a photo" value={f.nyscFile} onChange={(v) => set('nyscFile', v)} error={errors.nyscFile} /></div>
        </div>
      )}

      {step === 1 && cat === 'individual' && (
        <div className="cr-step">
          <Field id={id('country')} label="Country" error={errors.country}>
            <select id={id('country')} value={f.country} onChange={(e) => set('country', e.target.value)} {...aria('country')}>
              <option>Nigeria</option><option>Another country</option>
            </select>
          </Field>
          {f.country !== 'Nigeria' && <p className="cr-note">The program is open in Nigeria only for now. <button type="button" className="cr-link" onClick={onWaitlist}>Join the waitlist for your country</button></p>}
          <Field id={id('link')} label="A link to your work" hint="Behance, Instagram, Google Drive or a personal site. It must open without a login." error={errors.link}><input id={id('link')} inputMode="url" value={f.link} onChange={(e) => set('link', e.target.value)} placeholder="behance.net/yourname" {...aria('link')} /></Field>
        </div>
      )}

      {step === 1 && !cat && <div className="cr-step"><p className="cr-note">Go back and choose which describes you first.</p></div>}

      {step === 2 && (
        <div className="cr-step">
          <div className="cr-field" id={id('create')} tabIndex={-1}><span className="cr-lbl">What would you like to make?</span><Chips options={TEMPLATE_TYPES} value={f.create} onChange={(v) => set('create', v)} label="Template types" />{errors.create && <p className="cr-err" role="alert">{errors.create}</p>}</div>
          <div className="cr-field"><span className="cr-lbl">Tools you use <i>(optional)</i></span><Chips options={TOOLS} value={f.tools} onChange={(v) => set('tools', v)} label="Tools" /></div>
          <fieldset className="cr-field" id={id('experience')} tabIndex={-1}>
            <legend className="cr-lbl">Where are you with design?</legend>
            <div className="cr-radios" role="radiogroup" aria-label="Experience">
              {([['beginner', 'Just starting', 'Learning the basics'], ['some', 'Comfortable', 'I have made designs for others'], ['pro', 'Experienced', 'I design regularly or professionally']] as const).map(([v, t, p]) => (
                <button key={v} type="button" role="radio" aria-checked={f.experience === v} onClick={() => set('experience', v)}><b>{t}</b><small>{p}</small></button>
              ))}
            </div>
            {errors.experience && <p className="cr-err" role="alert">{errors.experience}</p>}
          </fieldset>
          {cat !== 'individual' && <Field id={id('link')} label="A link to your work (optional)" hint="Share a few pieces you are proud of. If you have none yet, we will ask for a first template." error={errors.link}><input id={id('link')} inputMode="url" value={f.link} onChange={(e) => set('link', e.target.value)} placeholder="behance.net/yourname" {...aria('link')} /></Field>}
          <Field id={id('about')} label="Tell us about your style (optional)" error={errors.about}>
            <textarea id={id('about')} rows={3} maxLength={320} value={f.about} onChange={(e) => set('about', e.target.value)} placeholder="What do you like to design? Who is it for?" {...aria('about')} />
            <span className={`cr-count mono${f.about.length > 300 ? ' over' : ''}`}>{f.about.length}/300</span>
          </Field>
          {cat === 'student' && (
            <label className="cr-check"><input type="checkbox" checked={f.captain} onChange={(e) => set('captain', e.target.checked)} /><span><b>I would like to be a Campus Captain</b><small>Help other students at my school get started and keep their work to a high standard.</small></span></label>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="cr-step">
          <dl className="cr-sum">
            <div><dt>Name</dt><dd>{f.name}</dd><button type="button" className="cr-link" onClick={() => go(0)}>Edit</button></div>
            <div><dt>Contact</dt><dd>{f.email} · {f.phone}</dd><button type="button" className="cr-link" onClick={() => go(0)}>Edit</button></div>
            <div><dt>{cat === 'student' ? 'School' : cat === 'nysc' ? 'NYSC' : 'Work link'}</dt><dd>{cat === 'student' ? `${f.school} · ${f.dept} · ${f.level}` : cat === 'nysc' ? f.stateCode : f.link}</dd><button type="button" className="cr-link" onClick={() => go(1)}>Edit</button></div>
            <div><dt>You will make</dt><dd>{f.create.join(', ')}</dd><button type="button" className="cr-link" onClick={() => go(2)}>Edit</button></div>
          </dl>
          <p className="cr-note"><b>No bank details needed.</b> After you are approved, you add your payout details on your creator dashboard.</p>
          <div className="cr-checks" id={id('agreeOriginal')} tabIndex={-1}>
            {([
              ['agreeOriginal', 'Everything I submit will be my own original work.'],
              ['agreeReview', `I understand the Ifiok team reviews and approves every template, in ${PROGRAM.reviewTime}.`],
              ['agreeVerify', 'I agree that Ifiok may check the details I have given, such as my school or NYSC status.'],
            ] as const).map(([k, t]) => (
              <div key={k}>
                <label className="cr-check"><input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} aria-invalid={!!errors[k]} /><span>{t}</span></label>
                {errors[k] && <p className="cr-err" role="alert">{errors[k]}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="cr-actions bar">
        {step > 0 ? <button type="button" className="cr-btn line" onClick={() => go(step - 1)}><ArrowLeft aria-hidden="true" />Back</button> : <span />}
        {step < 3 ? (
          <button type="button" className="cr-btn solid" onClick={next}>Continue<ArrowRight aria-hidden="true" /></button>
        ) : (
          <button type="button" className="cr-btn solid" onClick={submit} disabled={sending}>{sending ? 'Sending…' : 'Submit application'}</button>
        )}
      </footer>
      <p className="cr-proto">Prototype: nothing is sent. Your answers stay on this device.</p>
    </div>
  );
}
