'use client';

import { ArrowRight, Check, CircleDot, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFocusTrap } from '@/components/design/overlays';
import { ACCENTS, GROUPS, KINDS, SETTINGS, kindById, naira, type CTemplate } from '@/data/creator-app';
import { CThumb, EDITOR, StatusPill } from './parts';

import { tr } from '@/i18n/tr';
export type NewSeed = { kindId?: string } | null;

export function NewTemplateDialog({ seed, onClose, onCreate }: { seed: NewSeed; onClose: () => void; onCreate: (v: { name: string; kindId: string; accent: string; fonts: string }) => void }) {
  const open = seed !== null;
  const [kindId, setKindId] = useState('flyer');
  const [name, setName] = useState('');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [fonts, setFonts] = useState('');
  const [err, setErr] = useState('');
  const ref = useFocusTrap(open, onClose);
  useEffect(() => { if (seed) { setKindId(seed.kindId ?? 'flyer'); setName(''); setFonts(''); setErr(''); } }, [seed]);
  if (!open) return null;
  const k = kindById(kindId);
  const isFont = k.group === 'Font templates';
  const create = () => {
    if (isFont && fonts.trim().length < 2) { setErr(tr("List the fonts you used. Only use fonts you are allowed to share.")); return; }
    onCreate({ name: name.trim() || `Untitled ${k.label.toLowerCase()}`, kindId, accent, fonts: fonts.trim() });
  };
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="nt-title" ref={ref}>
        <header className="dialog-h">
          <h2 id="nt-title">{tr("New template")}</h2>
          <button type="button" className="icon-x" onClick={onClose} aria-label={tr("Close")}><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <div className="nd-grid">
            <div className="cd-kinds">
              {GROUPS.map((g) => (
                <div key={g}>
                  <p className="lbl">{tr(g)}</p>
                  <div className="fmt-list" role="radiogroup" aria-label={tr(g)}>
                    {KINDS.filter((x) => x.group === g).map((x) => (
                      <button key={x.id} type="button" role="radio" aria-checked={kindId === x.id} className="fmt" onClick={() => setKindId(x.id)}>
                        <b>{tr(x.label)}</b><span className="mono">{tr(x.size)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="nd-side">
              <CThumb kindId={kindId} accent={accent} headline={name || k.label} sub={tr(k.size)} className="nd-prev" />
              <dl className="specs">
                <div><dt>{tr("Type")}</dt><dd>{tr(k.group)}</dd></div>
                <div><dt>{tr("Size")}</dt><dd className="mono">{tr(k.size)}</dd></div>
                <div><dt>{tr("Example payout if approved")}</dt><dd className="mono gold">{naira(k.bounty)}</dd></div>
              </dl>
              <label className="field"><span className="lbl">{tr("Name")}</span>
                <input id="nt-name" data-autofocus value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("Untitled {label}", { label: k.label.toLowerCase() })} maxLength={60} />
              </label>
              {isFont && (
                <label className="field"><span className="lbl">{tr("Fonts used")}</span>
                  <input id="nt-fonts" value={fonts} onChange={(e) => { setFonts(e.target.value); setErr(''); }} placeholder={tr("e.g. Archivo, DM Serif Display")} aria-invalid={!!err} />
                  <span className="muted">{tr("Use only fonts you may share: open-source fonts or fonts licensed for templates.")}</span>
                </label>
              )}
              {err && <p className="cd-err" role="alert">{err}</p>}
              <div>
                <p className="lbl">{tr("Colour")}</p>
                <div className="swatches">
                  {ACCENTS.map((c) => <button key={c} type="button" className="sw" style={{ background: c }} aria-label={tr("Colour {c}", { c })} aria-pressed={accent === c} onClick={() => setAccent(c)} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="dialog-f">
          <button type="button" className="btn-s" onClick={onClose}>{tr("Cancel")}</button>
          <button type="button" className="btn-p" onClick={create}><Plus aria-hidden="true" />{tr("Create template")}</button>
        </footer>
      </div>
    </div>
  );
}

export type SubmitData = { notes: string; theme: boolean; fonts: string };

export function TemplatePanel({ t, onClose, onDuplicate, onDelete, onSubmit, onSimulate, onPayouts }: {
  t: CTemplate | null; onClose: () => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void;
  onSubmit: (id: string, d: SubmitData) => void; onSimulate: (id: string, r: 'approve' | 'changes' | 'reject') => void; onPayouts: () => void;
}) {
  const [own, setOwn] = useState(false);
  const [fontsOk, setFontsOk] = useState(false);
  const [imgsOk, setImgsOk] = useState(false);
  const [theme, setTheme] = useState(false);
  const [notes, setNotes] = useState('');
  const [fonts, setFonts] = useState('');
  const [err, setErr] = useState('');
  const ref = useFocusTrap(t !== null, onClose);
  useEffect(() => { setOwn(false); setFontsOk(false); setImgsOk(false); setTheme(false); setNotes(''); setFonts(t?.fonts ?? ''); setErr(''); }, [t?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!t) return null;
  const k = kindById(t.kindId);
  const isFont = k.group === 'Font templates';
  const canSubmit = t.status === 'draft' || t.status === 'changes';
  const ready = own && fontsOk && imgsOk;
  const submit = () => {
    if (!ready) { setErr(tr("Please tick all three confirmations first.")); return; }
    if (isFont && fonts.trim().length < 2) { setErr(tr("List the fonts you used.")); return; }
    onSubmit(t.id, { notes: notes.trim(), theme, fonts: fonts.trim() });
  };
  const steps = [
    { l: 'Created', d: t.status === 'draft' ? t.updated : t.submitted ?? t.updated, on: true },
    { l: 'Submitted', d: t.submitted, on: !!t.submitted },
    { l: 'In review', d: t.status === 'review' ? 'Now' : undefined, on: t.status !== 'draft' },
    { l: t.status === 'rejected' ? 'Not approved' : t.status === 'changes' ? 'Changes requested' : 'Approved', d: t.decided ?? (t.status === 'changes' ? t.updated : undefined), on: t.status === 'approved' || t.status === 'rejected' || t.status === 'changes' },
  ];
  return (
    <div className="scrim side" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="detail" role="dialog" aria-modal="true" aria-labelledby="tp-title" ref={ref}>
        <header className="dialog-h">
          <div><h2 id="tp-title">{tr(t.name)}</h2><p className="muted">{tr("{label} · {size} · updated {updated}", { label: tr(k.label), size: tr(k.size), updated: tr(t.updated) })}</p></div>
          <button type="button" className="icon-x" onClick={onClose} aria-label={tr("Close")}><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <CThumb kindId={t.kindId} accent={t.accent} headline={t.headline} sub={tr(t.sub)} className="dt-prev" />
          <div className="dt-actions">
            <a className="btn-p" href={EDITOR} data-autofocus>{tr("Edit in editor")} <ArrowRight aria-hidden="true" /></a>
            <button type="button" className="btn-s" onClick={() => onDuplicate(t.id)}>{tr("Duplicate")}</button>
            <button type="button" className="btn-s danger" onClick={() => { onDelete(t.id); onClose(); }}>{tr("Delete")}</button>
          </div>

          <section className="dt-sec">
            <h3>{tr("Status")}</h3>
            <StatusPill status={t.status} />
            <ol className="cd-timeline">
              {steps.map((s) => (<li key={s.l} className={s.on ? 'on' : ''}><span className="dot">{s.on ? <Check aria-hidden="true" /> : <CircleDot aria-hidden="true" />}</span><b>{tr(s.l)}</b><small>{tr(s.d ?? '')}</small></li>))}
            </ol>
          </section>

          {t.notes.length > 0 && (
            <section className="dt-sec">
              <h3>{tr("Feedback from the Ifiok team")}</h3>
              <ul className="cd-notes">
                {t.notes.map((n, i) => (<li key={i} className={n.by}><b>{n.by === 'reviewer' ? tr("Ifiok reviewer") : tr("You")}</b><span>{tr(n.text)}</span><small>{tr(n.when)}</small></li>))}
              </ul>
            </section>
          )}

          {t.status === 'approved' && (
            <section className="dt-sec">
              <h3>{tr("Payout")}</h3>
              <p className="muted">{tr("Approved. {bounty} (example) was added to your earnings.", { bounty: naira(k.bounty) })}</p>
              <button type="button" className="btn-s" onClick={() => { onClose(); onPayouts(); }}>{tr("See it in Payouts")}</button>
            </section>
          )}

          {t.status === 'review' && (
            <section className="dt-sec">
              <h3>{tr("In review")}</h3>
              <p className="muted">{tr("The Ifiok team is reviewing this template. Reviews take {reviewTime}.", { reviewTime: tr(SETTINGS.reviewTime) })}</p>
              <div className="cd-sim">
                <p className="lbl">{tr("Prototype only: simulate the decision")}</p>
                <div>
                  <button type="button" className="btn-s" onClick={() => onSimulate(t.id, 'approve')}>{tr("Approve")}</button>
                  <button type="button" className="btn-s" onClick={() => onSimulate(t.id, 'changes')}>{tr("Request changes")}</button>
                  <button type="button" className="btn-s" onClick={() => onSimulate(t.id, 'reject')}>{tr("Not approve")}</button>
                </div>
              </div>
            </section>
          )}

          {t.status === 'rejected' && (
            <section className="dt-sec">
              <h3>{tr("Next step")}</h3>
              <p className="muted">{tr("You can duplicate this template, rework it and submit it again.")}</p>
              <button type="button" className="btn-s" onClick={() => onDuplicate(t.id)}>{tr("Duplicate and rework")}</button>
            </section>
          )}

          {canSubmit && (
            <section className="dt-sec">
              <h3>{t.status === 'changes' ? tr("Resubmit for review") : tr("Submit for review")}</h3>
              <ul className="checks">
                {k.printable && <li className="ok"><Check aria-hidden="true" />{tr("Print size, bleed and 300 DPI checked")}</li>}
                <li className="ok"><Check aria-hidden="true" />{tr("Text is editable")}</li>
              </ul>
              <label className="cd-check"><input type="checkbox" checked={own} onChange={(e) => { setOwn(e.target.checked); setErr(''); }} /><span>{tr("This is my own original work.")}</span></label>
              <label className="cd-check"><input type="checkbox" checked={fontsOk} onChange={(e) => { setFontsOk(e.target.checked); setErr(''); }} /><span>{tr("Every font in it is one I am allowed to share.")}</span></label>
              <label className="cd-check"><input type="checkbox" checked={imgsOk} onChange={(e) => { setImgsOk(e.target.checked); setErr(''); }} /><span>{tr("Every photo, icon and graphic is mine or licensed for templates.")}</span></label>
              {isFont && <label className="field"><span className="lbl">{tr("Fonts used")}</span><input value={fonts} onChange={(e) => { setFonts(e.target.value); setErr(''); }} placeholder={tr("e.g. Archivo, DM Serif Display")} /></label>}
              <label className="cd-check"><input type="checkbox" checked={theme} onChange={(e) => setTheme(e.target.checked)} /><span>{tr("Enter it in this month's theme:")} <b>{tr(SETTINGS.theme.name)}</b></span></label>
              <label className="field"><span className="lbl">{tr("Note for the reviewer (optional)")}</span>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={tr("Anything we should know?")} maxLength={300} />
              </label>
              {err && <p className="cd-err" role="alert">{err}</p>}
              <button type="button" className="btn-p wide" onClick={submit}>{t.status === 'changes' ? tr("Resubmit") : tr("Submit for review")}</button>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}

export function PayoutDialog({ open, amount, account, onClose, onConfirm }: { open: boolean; amount: number; account: string; onClose: () => void; onConfirm: () => void }) {
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog narrow" role="dialog" aria-modal="true" aria-labelledby="po-title" ref={ref}>
        <header className="dialog-h">
          <h2 id="po-title">{tr("Request a payout")}</h2>
          <button type="button" className="icon-x" onClick={onClose} aria-label={tr("Close")}><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <dl className="specs">
            <div><dt>{tr("Amount")}</dt><dd className="mono gold">{naira(amount)}</dd></div>
            <div><dt>{tr("Paid to")}</dt><dd>{account}</dd></div>
          </dl>
          <p className="muted">{tr("The Ifiok team reviews each payout request and pays by bank transfer to your verified account. You can follow it on the History tab.")}</p>
        </div>
        <footer className="dialog-f">
          <button type="button" className="btn-s" onClick={onClose}>{tr("Cancel")}</button>
          <button type="button" className="btn-p" data-autofocus onClick={onConfirm}>{tr("Confirm request")}</button>
        </footer>
      </div>
    </div>
  );
}
