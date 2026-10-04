'use client';

import { ArrowLeft, Brush, Check, GraduationCap, ShieldCheck, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AuthShell from './AuthShell';
import { Check1, Divider, Field, GoogleButton, PasswordField, cleanPhone, isEmail, isPhone } from './parts';
import { useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';
import { asset } from '@/lib/asset';

type Role = 'me' | 'student' | 'creator';
const ROLES: { id: Role; title: string; sub: string; Icon: typeof Brush; to: string }[] = [
  { id: 'me', title: 'Design and print', sub: 'For myself or my business', Icon: Brush, to: '/design/' },
  { id: 'student', title: 'I am a student', sub: 'Free perks with your school ID', Icon: GraduationCap, to: '/student/' },
  { id: 'creator', title: 'Make templates', sub: 'Get paid when Ifiok approves them', Icon: Wand2, to: '/creators/dashboard/' },
];

function strength(pw: string) {
  const rules = [pw.length >= 8, /[A-Za-z]/.test(pw), /\d/.test(pw)];
  const bonus = pw.length >= 12 || /[^A-Za-z0-9]/.test(pw);
  const score = rules.filter(Boolean).length + (rules.every(Boolean) && bonus ? 1 : 0);
  return { rules, score };
}

function OtpBoxes({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const set = (i: number, d: string) => {
    const digits = value.padEnd(6, ' ').split('');
    digits[i] = d || ' ';
    onChange(digits.join('').replace(/\s+$/, ''));
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <div className="au-field">
      <div className="au-otp" role="group" aria-label={tr('6-digit code')} onPaste={(e) => { const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (t) { e.preventDefault(); onChange(t); refs.current[Math.min(t.length, 5)]?.focus(); } }}>
        {Array.from({ length: 6 }, (_, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={1} value={(value[i] ?? '').trim()} aria-label={tr('Digit {n}', { n: i + 1 })} aria-invalid={!!error}
            onChange={(e) => set(i, e.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !value[i]?.trim() && i > 0) refs.current[i - 1]?.focus(); }} />
        ))}
      </div>
      {error && <p className="au-err" role="alert">{error}</p>}
    </div>
  );
}

export default function SignupForm() {
  useLang();
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [role, setRole] = useState<Role>('me');
  const [f, setF] = useState({ name: '', email: '', phone: '', pw: '' });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(30);
  const clear = (k: string) => setErr((e) => (e[k] ? { ...e, [k]: '' } : e));
  const set = (k: keyof typeof f) => (v: string) => { setF((p) => ({ ...p, [k]: v })); clear(k === 'pw' ? 'pw' : k); };
  const st = strength(f.pw);
  const dest = ROLES.find((r) => r.id === role)!.to;

  useEffect(() => {
    if (step !== 'verify' || wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [step, wait]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (f.name.trim().length < 2) n.name = tr('Enter your full name.');
    if (!isEmail(f.email)) n.email = f.email.trim() ? tr('That email does not look right.') : tr('Enter your email.');
    if (!isPhone(f.phone)) n.phone = tr('Enter a Nigerian phone number, like 0803 123 4567.');
    if (!st.rules.every(Boolean)) n.pw = tr('Use at least 8 characters, with a letter and a number.');
    if (!agree) n.agree = tr('Please accept the terms to continue.');
    setErr(n);
    if (Object.keys(n).length) return;
    setBusy(true);
    window.setTimeout(() => { setBusy(false); setStep('verify'); setWait(30); }, 700);
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) { setErr({ code: tr('Enter the 6-digit code.') }); return; }
    setErr({}); setBusy(true);
    window.setTimeout(() => { window.location.href = asset(dest); }, 700);
  };

  const label = st.score <= 1 ? tr('Weak') : st.score === 2 ? tr('Okay') : st.score === 3 ? tr('Good') : tr('Strong');

  return (
    <AuthShell>
      {step === 'form' ? (
        <form className="au-form" onSubmit={submit} noValidate>
          <h1>{tr('Create your Ifiok account')}</h1>
          <p className="au-sub">{tr('Free to start. Pay only when you print.')}</p>

          <fieldset className="au-roles">
            <legend>{tr('What will you do first?')}</legend>
            <div role="radiogroup" aria-label={tr('What will you do first?')}>
              {ROLES.map(({ id, title, sub, Icon }) => (
                <button key={id} type="button" role="radio" aria-checked={role === id} onClick={() => setRole(id)}>
                  <span className="ic"><Icon aria-hidden="true" /></span>
                  <span><b>{tr(title)}</b><small>{tr(sub)}</small></span>
                  <i aria-hidden="true"><Check /></i>
                </button>
              ))}
            </div>
          </fieldset>

          <Field label={tr('Full name')} value={f.name} onChange={set('name')} error={err.name} autoComplete="name" placeholder="Adaeze Okafor" />
          <Field label={tr('Email')} value={f.email} onChange={set('email')} error={err.email} autoComplete="email" inputMode="email" placeholder="name@email.com" />
          <Field label={tr('Phone number')} value={f.phone} onChange={set('phone')} error={err.phone} autoComplete="tel-national" inputMode="tel" placeholder="803 123 4567" prefix="🇳🇬 +234" hint={tr('We send your order updates and the code here.')} />
          <PasswordField label={tr('Password')} value={f.pw} onChange={set('pw')} error={err.pw} autoComplete="new-password">
            {f.pw && (
              <div className="au-meter" aria-live="polite">
                <div className="bars" data-s={st.score}><i /><i /><i /><i /></div>
                <span>{label}</span>
              </div>
            )}
            <ul className="au-rules">
              {[tr('8 or more characters'), tr('A letter'), tr('A number')].map((r, i) => <li key={r} className={st.rules[i] ? 'ok' : ''}><Check aria-hidden="true" />{r}</li>)}
            </ul>
          </PasswordField>
          <Check1 checked={agree} onChange={(v) => { setAgree(v); clear('agree'); }} error={err.agree}>
            {tr('I agree to the')} <a href="https://ifiok.ng/terms" target="_blank" rel="noopener noreferrer">{tr('Terms')}</a> {tr('and')} <a href="https://ifiok.ng/privacy" target="_blank" rel="noopener noreferrer">{tr('Privacy Policy')}</a>.
          </Check1>
          <button className="au-btn" type="submit" disabled={busy}>{busy ? tr('Creating your account…') : tr('Create account')}</button>
          <Divider />
          <GoogleButton label={tr('Sign up with Google')} onClick={() => { window.location.href = asset(dest); }} />
          <p className="au-swap">{tr('Already have an account?')} <a href={asset('/login/')}>{tr('Log in')}</a></p>
        </form>
      ) : (
        <form className="au-form au-center" onSubmit={verify} noValidate>
          <button type="button" className="au-back" onClick={() => { setStep('form'); setCode(''); setErr({}); }}><ArrowLeft aria-hidden="true" />{tr('Change number')}</button>
          <span className="au-ok"><ShieldCheck aria-hidden="true" /></span>
          <h1>{tr('Verify your phone')}</h1>
          <p className="au-sub">{tr('We sent a 6-digit code to +234 {phone}. Enter it below.', { phone: cleanPhone(f.phone).replace(/^(\d{3})(\d{3})(\d{0,4})$/, '$1 $2 $3').trim() })}</p>
          <OtpBoxes value={code} onChange={(v) => { setCode(v); clear('code'); }} error={err.code} />
          <button className="au-btn" type="submit" disabled={busy}>{busy ? tr('Verifying…') : tr('Verify and continue')}</button>
          <p className="au-swap">
            {wait > 0 ? tr('Resend code in {s}s', { s: wait }) : <button type="button" className="au-link" onClick={() => setWait(30)}>{tr('Resend code')}</button>}
          </p>
          <p className="au-hint">{tr('Prototype: any 6 digits will work.')}</p>
        </form>
      )}
    </AuthShell>
  );
}
