'use client';

import { ArrowLeft, MailCheck } from 'lucide-react';
import { useState } from 'react';
import AuthShell from './AuthShell';
import { Check1, Divider, Field, GoogleButton, PasswordField, isEmail, isPhone } from './parts';
import { useLang } from '@/i18n/LangProvider';
import { tr } from '@/i18n/tr';
import { asset } from '@/lib/asset';

type Mode = 'login' | 'forgot' | 'sent';

export default function LoginForm() {
  useLang();
  const [mode, setMode] = useState<Mode>('login');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [keep, setKeep] = useState(true);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const checkId = () => (!id.trim() ? tr('Enter your email or phone number.') : id.includes('@') ? (isEmail(id) ? '' : tr('That email does not look right.')) : isPhone(id) ? '' : tr('Enter a Nigerian phone number, like 0803 123 4567.'));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const a = checkId(); if (a) next.id = a;
    if (!pw) next.pw = tr('Enter your password.');
    setErr(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    window.setTimeout(() => { setDone(true); window.location.href = asset('/design/'); }, 700);
  };

  const sendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(id)) { setErr({ id: id.trim() ? tr('That email does not look right.') : tr('Enter the email you signed up with.') }); return; }
    setErr({}); setBusy(true);
    window.setTimeout(() => { setBusy(false); setMode('sent'); }, 600);
  };

  const google = () => { setDone(true); window.location.href = asset('/design/'); };

  return (
    <AuthShell>
      {mode === 'login' && (
        <form className="au-form" onSubmit={submit} noValidate>
          <h1>{tr('Welcome back')}</h1>
          <p className="au-sub">{tr('Log in to your designs, orders and earnings.')}</p>
          <GoogleButton label={tr('Continue with Google')} onClick={google} />
          <Divider />
          <Field label={tr('Email or phone number')} value={id} onChange={(v) => { setId(v); setErr((e) => ({ ...e, id: '' })); }} error={err.id} autoComplete="username" inputMode="text" placeholder="name@email.com" autoFocus />
          <PasswordField label={tr('Password')} value={pw} onChange={(v) => { setPw(v); setErr((e) => ({ ...e, pw: '' })); }} error={err.pw} autoComplete="current-password"
            aside={<button type="button" className="au-link" onClick={() => { setErr({}); setMode('forgot'); }}>{tr('Forgot password?')}</button>} />
          <Check1 checked={keep} onChange={setKeep}>{tr('Keep me logged in on this device')}</Check1>
          <button className="au-btn" type="submit" disabled={busy || done}>{busy || done ? tr('Logging in…') : tr('Log in')}</button>
          <p className="au-swap">{tr('New to Ifiok?')} <a href={asset('/signup/')}>{tr('Create an account')}</a></p>
        </form>
      )}

      {mode === 'forgot' && (
        <form className="au-form" onSubmit={sendReset} noValidate>
          <button type="button" className="au-back" onClick={() => { setErr({}); setMode('login'); }}><ArrowLeft aria-hidden="true" />{tr('Back to log in')}</button>
          <h1>{tr('Reset your password')}</h1>
          <p className="au-sub">{tr('Enter the email you signed up with. We will send you a link to choose a new password.')}</p>
          <Field label={tr('Email')} value={id} onChange={setId} error={err.id} autoComplete="email" inputMode="email" placeholder="name@email.com" autoFocus />
          <button className="au-btn" type="submit" disabled={busy}>{busy ? tr('Sending…') : tr('Send reset link')}</button>
        </form>
      )}

      {mode === 'sent' && (
        <div className="au-form au-center">
          <span className="au-ok"><MailCheck aria-hidden="true" /></span>
          <h1>{tr('Check your email')}</h1>
          <p className="au-sub">{tr('If {email} has an Ifiok account, a reset link is on its way. It works for 30 minutes.', { email: id.trim() })}</p>
          <button className="au-btn" type="button" onClick={() => setMode('login')}>{tr('Back to log in')}</button>
          <p className="au-swap">{tr('Nothing arrived?')} <button type="button" className="au-link" onClick={() => setMode('forgot')}>{tr('Try again')}</button></p>
        </div>
      )}
    </AuthShell>
  );
}
