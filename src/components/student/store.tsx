'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Say } from '@/components/creator/store';

import { tr } from '@/i18n/tr';
export type StudentStatus = 'none' | 'pending' | 'rejected' | 'verified';
export type Application = { school: string; dept: string; level: string; matric: string; idName: string; submitted: string };
export type StudentState = { status: StudentStatus; app: Application | null; note: string; expires: string; dismissed: boolean };

const EMPTY: StudentState = { status: 'none', app: null, note: '', expires: '', dismissed: false };
const KEY = 'ifiok.student.v1';

type Ctx = StudentState & {
  submit: (a: Application) => void;
  decide: (r: 'approve' | 'decline') => void;
  restart: () => void;
  dismiss: () => void;
};
const C = createContext<Ctx | null>(null);
export const useStudent = () => useContext(C);

const inAYear = () => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); };

export function StudentProvider({ say, children }: { say: Say; children: React.ReactNode }) {
  const [s, setS] = useState<StudentState>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setS({ ...EMPTY, ...JSON.parse(raw) }); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s, ready]);

  const submit = useCallback((a: Application) => { setS((p) => ({ ...p, status: 'pending', app: a, note: '' })); say(tr("Submitted. The Ifiok team will review your student ID.")); }, [say]);
  const decide = useCallback((r: 'approve' | 'decline') => {
    if (r === 'approve') { setS((p) => ({ ...p, status: 'verified', expires: inAYear(), note: '' })); say(tr("Verified. Your student perks are on.")); }
    else { setS((p) => ({ ...p, status: 'rejected', note: 'We could not read your student ID. Please upload a clear, well-lit photo of the front of the card and apply again.' })); say(tr("Declined.")); }
  }, [say]);
  const restart = useCallback(() => setS((p) => ({ ...p, status: 'none', note: '' })), []);
  const dismiss = useCallback(() => setS((p) => ({ ...p, dismissed: true })), []);
  return <C.Provider value={{ ...s, submit, decide, restart, dismiss }}>{children}</C.Provider>;
}
