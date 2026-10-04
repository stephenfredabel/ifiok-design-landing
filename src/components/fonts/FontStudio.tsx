'use client';

import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleAlert, FileUp, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFocusTrap } from '@/components/design/overlays';
import { registerFont, type Say } from '@/components/creator/store';
import { FONT_CATS, FONT_TAGS, SPECIMEN, type FontCat, type FontEntry, type FontFile, type FontStatus } from '@/data/fonts';
import { MarksTags, fontStyleOf, useSampleFonts, weightOf } from './parts';

const STYLES = ['Regular', 'Italic', 'Light', 'Medium', 'SemiBold', 'Bold', 'Bold Italic', 'ExtraBold', 'Black'];
const MAX_FILE = 2 * 1024 * 1024;
const KEEP_BYTES = 700 * 1024;
const STATUS: Record<FontStatus, string> = { draft: 'Draft', review: 'In review', changes: 'Changes requested', approved: 'Approved', rejected: 'Not approved' };

export const FontStatusPill = ({ s }: { s: FontStatus }) => <span className={`stage st-${s}`}><i aria-hidden="true" />{STATUS[s]}</span>;

const guessStyle = (name: string) => {
  const n = name.toLowerCase();
  const it = /italic|oblique/.test(n);
  const w = /black|heavy/.test(n) ? 'Black' : /extra-?bold|ultra/.test(n) ? 'ExtraBold' : /semi-?bold|demi/.test(n) ? 'SemiBold' : /bold/.test(n) ? 'Bold' : /medium/.test(n) ? 'Medium' : /light|thin/.test(n) ? 'Light' : 'Regular';
  return it ? (w === 'Bold' ? 'Bold Italic' : w === 'Regular' ? 'Italic' : w) : w;
};
const toDataUrl = (file: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(file); });

type Draft = {
  id: string; family: string; cat: FontCat | ''; tags: string[]; description: string;
  files: (FontFile & { url: string; ok: boolean })[];
  marks: FontEntry['marks']; license: '' | 'I made this font' | 'I have the right to share this font'; confirm: boolean;
};
const blank = (): Draft => ({ id: 'nf' + Date.now(), family: '', cat: '', tags: [], description: '', files: [], marks: { yoruba: false, igbo: false, hausa: false }, license: '', confirm: false });
const STEPS = ['Details', 'Font files', 'Licence', 'Review'];

export function NewFontDialog({ open, initial, onClose, onSave }: { open: boolean; initial: FontEntry | null; onClose: () => void; onSave: (f: FontEntry, submit: boolean) => void }) {
  const [d, setD] = useState<Draft>(blank);
  const [step, setStep] = useState(0);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState('Welcome to Ifiok');
  const fileRef = useRef<HTMLInputElement>(null);
  const ref = useFocusTrap(open, onClose);

  useEffect(() => {
    if (!open) return;
    setStep(0); setErrs({}); setBusy(false);
    if (initial) {
      setD({
        id: initial.id, family: initial.family, cat: initial.cat, tags: initial.tags, description: initial.description ?? '', marks: initial.marks,
        files: (initial.files ?? []).map((f, i) => ({ ...f, url: initial.data?.[i]?.url ?? '', ok: !!initial.data?.[i]?.url })),
        license: (initial.license as Draft['license']) ?? '', confirm: false,
      });
    } else setD(blank());
  }, [open, initial]);
  if (!open) return null;

  const css = `ifiok-${d.id}`;
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => { setD((p) => ({ ...p, [k]: v })); setErrs((e) => ({ ...e, [k as string]: '' })); };

  const addFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    const e: string[] = [];
    const next = [...d.files];
    setBusy(true);
    for (const file of Array.from(list)) {
      if (next.length >= 6) { e.push('You can add up to 6 files.'); break; }
      if (!/\.(ttf|otf|woff2?)$/i.test(file.name)) { e.push(`${file.name}: use a .ttf, .otf, .woff or .woff2 file.`); continue; }
      if (file.size > MAX_FILE) { e.push(`${file.name}: over 2 MB. Choose a smaller file.`); continue; }
      if (next.some((f) => f.name === file.name)) { e.push(`${file.name} is already added.`); continue; }
      const style = guessStyle(file.name);
      try {
        const url = await toDataUrl(file);
        const ok = await registerFont(css, url, style);
        if (!ok) { e.push(`${file.name} could not be read as a font. It may be damaged.`); continue; }
        next.push({ name: file.name, size: file.size, style, url, ok: true });
      } catch { e.push(`${file.name} could not be read.`); }
    }
    setBusy(false);
    setD((p) => ({ ...p, files: next }));
    setErrs((x) => ({ ...x, files: e.join(' ') }));
    if (fileRef.current) fileRef.current.value = '';
  };
  const setStyle = (i: number, style: string) => {
    setD((p) => ({ ...p, files: p.files.map((f, k) => (k === i ? { ...f, style } : f)) }));
    const f = d.files[i]; if (f?.url) registerFont(css, f.url, style);
  };

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (d.family.trim().length < 2) e.family = 'Give your font a name.';
      if (!d.cat) e.cat = 'Choose a category.';
    }
    if (s === 1) {
      if (d.files.length === 0) e.files = 'Add at least one font file.';
      else if (d.files.some((f) => !f.ok)) e.files = 'Remove any file that could not be read.';
    }
    if (s === 2) {
      if (!d.license) e.license = 'Choose the option that fits.';
      if (!d.confirm) e.confirm = 'Please confirm before you continue.';
    }
    return e;
  };
  const next = () => { const e = validate(step); setErrs(e); if (Object.values(e).some(Boolean)) return; setStep((s) => s + 1); };
  const build = (status: FontStatus): FontEntry => {
    const keep = d.files.reduce((s, f) => s + f.size, 0) <= KEEP_BYTES && d.files.every((f) => f.url);
    return {
      id: d.id, family: d.family.trim(), css, by: 'You', cat: d.cat as FontCat, tags: d.tags, styles: Array.from(new Set(d.files.map((f) => f.style))), marks: d.marks,
      mine: true, status, updated: 'Today', submitted: status === 'review' ? 'Today' : initial?.submitted, license: d.license, description: d.description.trim(),
      files: d.files.map(({ name, size, style }) => ({ name, size, style })), data: keep ? d.files.map((f) => ({ name: f.style, url: f.url })) : undefined, notes: initial?.notes ?? [],
    };
  };
  const finish = (submit: boolean) => {
    for (const s of [0, 1, 2]) { const e = validate(s); if (Object.values(e).some(Boolean)) { setErrs(e); setStep(s); return; } }
    onSave(build(submit ? 'review' : 'draft'), submit);
  };

  const sample = (style: string) => ({ fontFamily: `"${css}", sans-serif`, fontWeight: weightOf(style), fontStyle: /italic/i.test(style) ? 'italic' : 'normal' } as const);
  const hasFiles = d.files.length > 0;

  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog fn-dialog" role="dialog" aria-modal="true" aria-labelledby="nf-title" ref={ref}>
        <header className="dialog-h">
          <div><h2 id="nf-title">{initial ? 'Edit font' : 'New font'}</h2><p className="muted">Step {step + 1} of 4 · {STEPS[step]}</p></div>
          <button type="button" className="icon-x" onClick={onClose} aria-label="Close"><X aria-hidden="true" /></button>
        </header>
        <ol className="fn-steps" aria-label="Progress">
          {STEPS.map((s, n) => <li key={s} className={n < step ? 'done' : n === step ? 'now' : ''} aria-current={n === step ? 'step' : undefined}><i /><span>{s}</span></li>)}
        </ol>
        <div className="dialog-b">
          {step === 0 && (
            <div className="fn-form">
              <label className="field"><span className="lbl">Font name</span>
                <input id="nf-family" data-autofocus value={d.family} onChange={(e) => set('family', e.target.value)} placeholder="e.g. Aso Ebi Display" maxLength={40} aria-invalid={!!errs.family} />
                {errs.family && <span className="cd-err" role="alert">{errs.family}</span>}
              </label>
              <label className="field"><span className="lbl">Category</span>
                <select id="nf-cat" value={d.cat} onChange={(e) => set('cat', e.target.value as FontCat)} aria-invalid={!!errs.cat}>
                  <option value="">Choose a category</option>
                  {FONT_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
                {errs.cat && <span className="cd-err" role="alert">{errs.cat}</span>}
              </label>
              <div className="field"><span className="lbl">What is it good for? <i>(optional)</i></span>
                <div className="fn-chips" role="group" aria-label="Tags">
                  {FONT_TAGS.map((t) => <button key={t} type="button" aria-pressed={d.tags.includes(t)} onClick={() => set('tags', d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t])}>{d.tags.includes(t) && <Check aria-hidden="true" />}{t}</button>)}
                </div>
              </div>
              <label className="field"><span className="lbl">A short description <i>(optional)</i></span>
                <textarea rows={3} value={d.description} onChange={(e) => set('description', e.target.value)} maxLength={200} placeholder="What inspired it? Where does it look best?" />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="fn-form">
              <label className="fn-drop" htmlFor="nf-files">
                <FileUp aria-hidden="true" />
                <span><b>{busy ? 'Reading your files…' : 'Choose font files'}</b><small>.ttf, .otf, .woff or .woff2 · up to 6 files · 2 MB each</small></span>
              </label>
              <input id="nf-files" ref={fileRef} className="sr" type="file" accept=".ttf,.otf,.woff,.woff2" multiple onChange={(e) => addFiles(e.target.files)} aria-describedby={errs.files ? 'nf-files-e' : undefined} />
              {errs.files && <p className="cd-err" id="nf-files-e" role="alert">{errs.files}</p>}
              {hasFiles && (
                <>
                  <ul className="fn-files">
                    {d.files.map((f, i) => (
                      <li key={f.name}>
                        <div className="fn-file-h">
                          <span><b>{f.name}</b><small>{(f.size / 1024).toFixed(0)} KB</small></span>
                          <button type="button" className="icon-x sm" aria-label={`Remove ${f.name}`} onClick={() => set('files', d.files.filter((_, k) => k !== i))}><Trash2 aria-hidden="true" /></button>
                        </div>
                        <label className="field"><span className="lbl">Style</span>
                          <select value={f.style} onChange={(e) => setStyle(i, e.target.value)}>{STYLES.map((s) => <option key={s}>{s}</option>)}</select>
                        </label>
                        {f.url ? <p className="fn-line" style={sample(f.style)}>{preview || SPECIMEN.line}</p> : <p className="muted">Preview unavailable for this saved file. Add it again to preview.</p>}
                      </li>
                    ))}
                  </ul>
                  <label className="field"><span className="lbl">Preview text</span><input value={preview} onChange={(e) => setPreview(e.target.value)} maxLength={60} /></label>
                  <div className="fn-check-box">
                    <p className="lbl">Check the extra letters</p>
                    <div className="fn-spec" style={d.files[0].url ? sample(d.files[0].style) : undefined}>
                      <p><small className="fn-lb">Yorùbá</small>{SPECIMEN.yoruba}</p>
                      <p><small className="fn-lb">Igbo</small>{SPECIMEN.igbo}</p>
                      <p><small className="fn-lb">Hausa</small>{SPECIMEN.hausa}</p>
                    </div>
                    <p className="muted">Look at each line. Tick a language only if every letter shows properly in your font.</p>
                    {([['yoruba', 'Yorùbá (ẹ ọ ṣ and tone marks)'], ['igbo', 'Igbo (ị ọ ụ ṅ)'], ['hausa', 'Hausa (ɓ ɗ ƙ ƴ)']] as const).map(([k, l]) => (
                      <label className="cd-check" key={k}><input type="checkbox" checked={d.marks[k]} onChange={(e) => set('marks', { ...d.marks, [k]: e.target.checked })} /><span>{l}</span></label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="fn-form">
              <p className="muted">Ifiok makes approved fonts free for designers to use in their designs. We need to be sure you have the right to share this font.</p>
              <fieldset className="fn-radios" aria-label="Licence">
                {(['I made this font', 'I have the right to share this font'] as const).map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={d.license === l} onClick={() => set('license', l)}>
                    <b>{l}</b><small>{l === 'I made this font' ? 'I drew the letters myself or with my team.' : 'It is open source, or the owner has given me written permission.'}</small>
                  </button>
                ))}
              </fieldset>
              {errs.license && <p className="cd-err" role="alert">{errs.license}</p>}
              <label className="cd-check"><input type="checkbox" checked={d.confirm} onChange={(e) => set('confirm', e.target.checked)} /><span>I confirm this is true. I understand Ifiok may remove a font if this turns out to be wrong.</span></label>
              {errs.confirm && <p className="cd-err" role="alert">{errs.confirm}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="fn-form">
              <div className="fn-review" style={hasFiles && d.files[0].url ? sample(d.files[0].style) : undefined}>
                <p className="big">{d.family || 'Your font'}</p>
                <p>{SPECIMEN.line}</p>
              </div>
              <dl className="specs">
                <div><dt>Name</dt><dd>{d.family}</dd></div>
                <div><dt>Category</dt><dd>{d.cat}</dd></div>
                <div><dt>Styles</dt><dd>{Array.from(new Set(d.files.map((f) => f.style))).join(', ')}</dd></div>
                <div><dt>Extra letters</dt><dd>{[d.marks.yoruba && 'Yorùbá', d.marks.igbo && 'Igbo', d.marks.hausa && 'Hausa'].filter(Boolean).join(', ') || 'None ticked'}</dd></div>
                <div><dt>Licence</dt><dd>{d.license}</dd></div>
              </dl>
              <p className="cd-note"><CircleAlert aria-hidden="true" />The Ifiok team reviews every font. If it is approved, a one-off payment is added to your earnings.</p>
            </div>
          )}
        </div>
        <footer className="dialog-f fn-foot">
          {step > 0 ? <button type="button" className="btn-s" onClick={() => setStep((s) => s - 1)}><ArrowLeft aria-hidden="true" />Back</button> : <button type="button" className="btn-s" onClick={onClose}>Cancel</button>}
          {step < 3 ? (
            <button type="button" className="btn-p" onClick={next} disabled={busy}>Continue<ArrowRight aria-hidden="true" /></button>
          ) : (
            <>
              <button type="button" className="btn-s" onClick={() => finish(false)}>Save draft</button>
              <button type="button" className="btn-p" onClick={() => finish(true)}>Submit for review</button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}

export function FontStudioView({ fonts, onNew, onOpen }: { fonts: FontEntry[]; onNew: () => void; onOpen: (id: string) => void }) {
  useSampleFonts();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | FontStatus>('all');
  const shown = useMemo(() => fonts.filter((f) => (status === 'all' || f.status === status) && (!q.trim() || f.family.toLowerCase().includes(q.trim().toLowerCase()))), [fonts, q, status]);
  const filters: { id: 'all' | FontStatus; label: string }[] = [{ id: 'all', label: 'All' }, ...(Object.keys(STATUS) as FontStatus[]).map((s) => ({ id: s, label: STATUS[s] }))];
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>My fonts</h1><p className="muted">Fonts designers can click and start using. {shown.length} of {fonts.length}.</p></div>
        <button type="button" className="btn-p" onClick={onNew}><Plus aria-hidden="true" />New font</button>
      </header>
      <div className="bar"><label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your fonts" aria-label="Search your fonts" /></label></div>
      <div className="chips" role="group" aria-label="Filter by status">
        {filters.map((f) => <button key={f.id} type="button" className="chip" aria-pressed={status === f.id} onClick={() => setStatus(f.id)}>{f.label}<small>{f.id === 'all' ? fonts.length : fonts.filter((x) => x.status === f.id).length}</small></button>)}
      </div>
      {shown.length === 0 ? (
        <div className="empty"><p><b>{fonts.length === 0 ? 'No fonts yet.' : 'No fonts match.'}</b> {fonts.length === 0 ? 'Upload a font file to get started.' : 'Try another word or status.'}</p>{fonts.length === 0 ? <button type="button" className="btn-p" onClick={onNew}>New font</button> : <button type="button" className="btn-s" onClick={() => { setQ(''); setStatus('all'); }}>Clear filters</button>}</div>
      ) : (
        <ul className="fn-list">
          {shown.map((f) => (
            <li key={f.id}>
              <button type="button" className="fn-row" onClick={() => onOpen(f.id)}>
                <span className="fn-row-s" style={fontStyleOf(f)} aria-hidden="true">Aa</span>
                <span className="fn-row-m"><b>{f.family}</b><small>{f.cat} · {f.styles.length} style{f.styles.length === 1 ? '' : 's'} · {f.updated}</small><MarksTags f={f} /></span>
                <FontStatusPill s={f.status ?? 'draft'} />
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MyFontPanel({ f, onClose, onEdit, onDelete, onSubmit, onDecide, onUse, onWallet }: {
  f: FontEntry | null; onClose: () => void; onEdit: (f: FontEntry) => void; onDelete: (id: string) => void; onSubmit: (id: string, note: string) => void;
  onDecide: (id: string, r: 'approve' | 'changes' | 'reject') => void; onUse: (f: FontEntry) => void; onWallet: () => void;
}) {
  const ref = useFocusTrap(f !== null, onClose);
  const [note, setNote] = useState('');
  useEffect(() => setNote(''), [f?.id]);
  if (!f) return null;
  const s = f.status ?? 'draft';
  const canSubmit = s === 'draft' || s === 'changes';
  const steps = [
    { l: 'Created', d: f.submitted ?? f.updated, on: true },
    { l: 'Submitted', d: f.submitted, on: !!f.submitted },
    { l: 'In review', d: s === 'review' ? 'Now' : undefined, on: s !== 'draft' },
    { l: s === 'rejected' ? 'Not approved' : s === 'changes' ? 'Changes requested' : 'Approved', d: f.decided, on: s === 'approved' || s === 'rejected' || s === 'changes' },
  ];
  return (
    <div className="scrim side" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="detail fn-panel" role="dialog" aria-modal="true" aria-labelledby="mf-title" ref={ref}>
        <header className="dialog-h">
          <div><h2 id="mf-title">{f.family}</h2><p className="muted">{f.cat} · updated {f.updated}</p></div>
          <button type="button" className="icon-x" onClick={onClose} aria-label="Close"><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <div className="fn-spec" style={fontStyleOf(f)}><p className="big">Aa</p><p>{SPECIMEN.line}</p></div>
          <div className="dt-actions">
            <button type="button" className="btn-p" data-autofocus onClick={() => onUse(f)}>Try it in a design<ArrowRight aria-hidden="true" /></button>
            {canSubmit && <button type="button" className="btn-s" onClick={() => onEdit(f)}>Edit</button>}
            <button type="button" className="btn-s danger" onClick={() => { onDelete(f.id); onClose(); }}>Delete</button>
          </div>
          <section className="dt-sec">
            <h3>Status</h3>
            <FontStatusPill s={s} />
            <ol className="cd-timeline">{steps.map((x) => <li key={x.l} className={x.on ? 'on' : ''}><span className="dot">{x.on ? <Check aria-hidden="true" /> : <i />}</span><b>{x.l}</b><small>{x.d ?? ''}</small></li>)}</ol>
          </section>
          {(f.notes?.length ?? 0) > 0 && (
            <section className="dt-sec"><h3>Feedback from the Ifiok team</h3>
              <ul className="cd-notes">{f.notes!.map((n, i) => <li key={i} className={n.by}><b>{n.by === 'reviewer' ? 'Ifiok reviewer' : 'You'}</b><span>{n.text}</span><small>{n.when}</small></li>)}</ul>
            </section>
          )}
          {s === 'approved' && <section className="dt-sec"><h3>Live for designers</h3><p className="muted">Designers can click this font and start using it. Your one-off payment was added to your earnings.</p><button type="button" className="btn-s" onClick={() => { onClose(); onWallet(); }}>See it in Earnings</button></section>}
          {s === 'review' && (
            <section className="dt-sec"><h3>In review</h3><p className="muted">The Ifiok team is reviewing this font. Reviews take about 5 working days.</p>
              <div className="cd-sim"><p className="lbl">Prototype only: simulate the decision</p>
                <div><button type="button" className="btn-s" onClick={() => onDecide(f.id, 'approve')}>Approve</button><button type="button" className="btn-s" onClick={() => onDecide(f.id, 'changes')}>Request changes</button><button type="button" className="btn-s" onClick={() => onDecide(f.id, 'reject')}>Not approve</button></div>
              </div>
            </section>
          )}
          {canSubmit && (
            <section className="dt-sec"><h3>{s === 'changes' ? 'Resubmit for review' : 'Submit for review'}</h3>
              <label className="field"><span className="lbl">Note for the reviewer (optional)</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} /></label>
              <button type="button" className="btn-p wide" onClick={() => onSubmit(f.id, note.trim())}>{s === 'changes' ? 'Resubmit' : 'Submit for review'}</button>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}

export type { Say };
