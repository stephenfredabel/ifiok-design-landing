'use client';

import { Check, Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { tr } from '@/i18n/tr';

export function GoogleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="au-google" onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" /></svg>
      <span>{label}</span>
    </button>
  );
}

export function Divider() {
  return <div className="au-or" role="separator"><span>{tr('or')}</span></div>;
}

type FieldProps = {
  label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string;
  type?: string; autoComplete?: string; inputMode?: 'text' | 'email' | 'tel' | 'numeric'; placeholder?: string; prefix?: string; aside?: React.ReactNode; autoFocus?: boolean; maxLength?: number;
};

export function Field({ label, value, onChange, error, hint, type = 'text', autoComplete, inputMode, placeholder, prefix, aside, autoFocus, maxLength }: FieldProps) {
  const id = useId();
  return (
    <div className="au-field">
      <div className="au-lbl"><label htmlFor={id}>{label}</label>{aside}</div>
      <div className={`au-in${error ? ' bad' : ''}`}>
        {prefix && <span className="au-pre">{prefix}</span>}
        <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} inputMode={inputMode} placeholder={placeholder} autoFocus={autoFocus} maxLength={maxLength} aria-invalid={!!error} aria-describedby={error ? id + '-e' : hint ? id + '-h' : undefined} />
      </div>
      {error ? <p className="au-err" id={id + '-e'} role="alert">{error}</p> : hint ? <p className="au-hint" id={id + '-h'}>{hint}</p> : null}
    </div>
  );
}

export function PasswordField({ label, value, onChange, error, autoComplete, aside, hint, children }: { label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string; aside?: React.ReactNode; hint?: string; children?: React.ReactNode }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="au-field">
      <div className="au-lbl"><label htmlFor={id}>{label}</label>{aside}</div>
      <div className={`au-in${error ? ' bad' : ''}`}>
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={!!error} aria-describedby={error ? id + '-e' : undefined} autoCapitalize="none" spellCheck={false} />
        <button type="button" className="au-eye" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? tr('Hide password') : tr('Show password')}>
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
      {error ? <p className="au-err" id={id + '-e'} role="alert">{error}</p> : hint ? <p className="au-hint">{hint}</p> : null}
      {children}
    </div>
  );
}

export function Check1({ checked, onChange, children, error }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; error?: string }) {
  return (
    <div className="au-field">
      <label className="au-check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error} /><span className="box" aria-hidden="true"><Check /></span><span>{children}</span></label>
      {error && <p className="au-err" role="alert">{error}</p>}
    </div>
  );
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
/** Nigerian numbers: 0803…, 803…, or +234803… */
export const cleanPhone = (v: string) => v.replace(/[\s()-]/g, '').replace(/^\+?234/, '').replace(/^0/, '');
export const isPhone = (v: string) => /^[789][01]\d{8}$/.test(cleanPhone(v));
