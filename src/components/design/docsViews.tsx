'use client';

import { ChevronRight, ExternalLink, FileUp, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DesignCard, TemplateCard } from './parts';
import { BLANK_DOC, DOC_TEMPLATES, TOOL_LINKS, formatById, isDoc, type Design, type Template } from './data';
import { useFocusTrap } from './overlays';
import Thumb from './Thumb';
import { DOCS_EDITOR } from './parts';
import { tr } from '@/i18n/tr';

type Ops = { openDetail: (id: string) => void; duplicate: (id: string) => void; remove: (id: string) => void };
const ACCENTS = ['#0B7A7F', '#DAA019', '#B6322B', '#1F3A8A', '#15241F', '#7A1D4A'];
export type NewDocSeed = { template?: Template } | null;

/** Pick a document type, give it a name and create it. It opens in the Ifiok Docs editor. */
export function NewDocDialog({ seed, onClose, onCreate }: { seed: NewDocSeed; onClose: () => void; onCreate: (v: { name: string; formatId: string; accent: string; headline: string; sub: string }) => void }) {
  const open = seed !== null;
  const [t, setT] = useState<Template>(BLANK_DOC);
  const [name, setName] = useState('');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const ref = useFocusTrap(open, onClose);
  useEffect(() => { if (seed) { const s = seed.template ?? BLANK_DOC; setT(s); setName(seed.template?.name ?? ''); setAccent(seed.template?.accent ?? ACCENTS[0]); } }, [seed]);
  if (!open) return null;
  const f = formatById(t.formatId);
  const pick = (x: Template) => { setT(x); setAccent(x.accent); };
  return (
    <div className="scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="ndoc-title" ref={ref}>
        <header className="dialog-h">
          <h2 id="ndoc-title">{tr("New document")}</h2>
          <button type="button" className="icon-x" onClick={onClose} aria-label={tr("Close")}><X aria-hidden="true" /></button>
        </header>
        <div className="dialog-b">
          <div className="nd-grid">
            <div>
              <p className="lbl">{tr("Start from")}</p>
              <div className="fmt-list" role="radiogroup" aria-label={tr("Document type")}>
                {[BLANK_DOC, ...DOC_TEMPLATES].map((x) => (
                  <button key={x.id} type="button" role="radio" aria-checked={t.id === x.id} className="fmt" onClick={() => pick(x)}>
                    <b>{tr(x.name)}</b>
                    <span className="mono">{tr(formatById(x.formatId).note)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="nd-side">
              <Thumb formatId={t.formatId} accent={accent} headline={name || t.headline} sub={tr(t.sub)} className="nd-prev" />
              <label className="field">
                <span className="lbl">{tr("Name")}</span>
                <input data-autofocus value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("Untitled document")} maxLength={60} />
              </label>
              <div>
                <p className="lbl">{tr("Colour")}</p>
                <div className="swatches">
                  {ACCENTS.map((c) => (
                    <button key={c} type="button" className="sw" style={{ background: c }} aria-label={tr("Colour {c}", { c })} aria-pressed={accent === c} onClick={() => setAccent(c)} />
                  ))}
                </div>
              </div>
              <p className="muted">{tr("Opens in Ifiok Docs. You can send it to a verified printer from there.")}</p>
            </div>
          </div>
        </div>
        <footer className="dialog-f">
          <button type="button" className="btn-s" onClick={onClose}>{tr("Cancel")}</button>
          <button type="button" className="btn-p" onClick={() => onCreate({ name: name.trim() || tr("Untitled document"), formatId: f.id, accent, headline: t.headline, sub: t.sub })}>
            <Plus aria-hidden="true" />{tr("Create document")}
          </button>
        </footer>
      </div>
    </div>
  );
}

/** The Ifiok Docs side of the shared dashboard: start a document, your documents, and the PDF tools. */
export function DocsView({ designs, ops, newDoc }: { designs: Design[]; ops: Ops; newDoc: (t?: Template) => void }) {
  const docs = designs.filter(isDoc);
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>{tr("Documents")}</h1><p className="muted">{tr("Write, edit and sign documents and PDFs with Ifiok Docs.")}</p></div>
        <button type="button" className="btn-p" onClick={() => newDoc()}><Plus aria-hidden="true" />{tr("New document")}</button>
      </header>

      <section className="actions" aria-label={tr("Bring a document in")}>
        <a className="act-tile" href={DOCS_EDITOR} target="_blank" rel="noopener noreferrer">
          <span className="act-ic" aria-hidden="true"><FileUp /></span>
          <span><b>{tr("Open a document")}</b><small>{tr("Word, PDF or text, up to 25 MB")}</small></span>
        </a>
        <a className="act-tile" href="https://ifiok.ng/tools/pdf-to-word" target="_blank" rel="noopener noreferrer">
          <span className="act-ic" aria-hidden="true"><ExternalLink /></span>
          <span><b>{tr("PDF to Word")}</b><small>{tr("Turn a PDF into an editable document")}</small></span>
        </a>
      </section>

      <section className="blk">
        <header className="blk-h"><h2>{tr("Start a document")}</h2></header>
        <div className="rail-scroll">
          {DOC_TEMPLATES.map((t) => <div className="rs-i sm" key={t.id}><TemplateCard t={t} onUse={(x) => newDoc(x)} /></div>)}
        </div>
      </section>

      <section className="blk">
        <header className="blk-h"><h2>{tr("Your documents")}</h2></header>
        {docs.length === 0 ? (
          <div className="empty"><p><b>{tr("No documents yet.")}</b> {tr("Pick a template above to write your first one.")}</p></div>
        ) : (
          <div className="dgrid">{docs.map((d) => <DesignCard key={d.id} d={d} onOpen={ops.openDetail} onDuplicate={ops.duplicate} onDelete={ops.remove} />)}</div>
        )}
      </section>

      <section className="blk">
        <header className="blk-h"><h2>{tr("PDF tools")}</h2><a className="see" href="https://ifiok.ng/tools" target="_blank" rel="noopener noreferrer">{tr("All tools")} <ChevronRight aria-hidden="true" /></a></header>
        <div className="tool-g">
          {TOOL_LINKS.map(({ label, href, Icon }) => (
            <a key={label} className="tool" href={href} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" /><span>{tr(label)}</span></a>
          ))}
        </div>
      </section>
    </div>
  );
}
