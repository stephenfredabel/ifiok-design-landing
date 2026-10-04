'use client';

import { ArrowLeft, BadgeCheck, Check, MapPin, Minus, Plus, Star, Store, Truck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DOC_FINISHES, DOC_PAPERS, FINISHES, PAPERS, PRINTERS, naira, priceOf, type Printer } from './data';
import { asset } from '@/lib/asset';
import { tr } from '@/i18n/tr';

type Sort = 'price' | 'near' | 'fast' | 'rated';
const STEP_NAMES = ['Spec', 'Printer', 'Review'];
const SORTS: [Sort, string][] = [['price', 'Best price'], ['near', 'Nearest'], ['fast', 'Fastest'], ['rated', 'Top rated']];

/** The hand-off to the print marketplace: choose the spec, compare verified printers, place the order. */
export default function SendToPrinter({ open, onClose, kind, name, problems }: { open: boolean; onClose: () => void; kind: 'design' | 'doc'; name: string; problems: number }) {
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState(kind === 'doc' ? 10 : 100);
  const papers = kind === 'doc' ? DOC_PAPERS : PAPERS;
  const finishes = kind === 'doc' ? DOC_FINISHES : FINISHES;
  const [paper, setPaper] = useState(papers[0].id);
  const [finish, setFinish] = useState(finishes[0].id);
  const [how, setHow] = useState<'pickup' | 'delivery'>('pickup');
  const [sort, setSort] = useState<Sort>('price');
  const [pid, setPid] = useState<string | null>(null);
  const [ref, setRef] = useState('');

  useEffect(() => { if (open) { setStep(0); setPid(null); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);

  const pf = papers.find((p) => p.id === paper)!.f, ff = finishes.find((f) => f.id === finish)!.f;
  const list = useMemo(() => {
    const l = PRINTERS.filter((p) => (how === 'pickup' ? p.pickup : p.delivery));
    const price = (p: Printer) => priceOf(p, qty, pf, ff);
    return [...l].sort((a, b) => (sort === 'price' ? price(a) - price(b) : sort === 'near' ? a.km - b.km : sort === 'fast' ? a.days - b.days : b.rating - a.rating));
  }, [how, sort, qty, pf, ff]);
  const chosen = PRINTERS.find((p) => p.id === pid) ?? null;
  const total = chosen ? priceOf(chosen, qty, pf, ff) + (how === 'delivery' ? 2500 : 0) : 0;

  if (!open) return null;
  return (
    <div className="ex-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ex-sheet-p" role="dialog" aria-modal="true" aria-labelledby="stp-title">
        <header className="stp-h">
          {step > 0 && step < 3 ? <button type="button" className="stp-back" onClick={() => setStep(step - 1)} aria-label={tr('Back')}><ArrowLeft aria-hidden="true" /></button> : <span className="stp-back" />}
          <div><h2 id="stp-title">{step === 3 ? tr('Order sent') : tr('Send to a verified printer')}</h2><p>{name}</p></div>
          <button type="button" className="stp-x" onClick={onClose} aria-label={tr('Close')}><X aria-hidden="true" /></button>
        </header>

        {step < 3 && (
          <ol className="stp-steps" aria-label={tr('Progress')}>
            {STEP_NAMES.map((s, i) => <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}><i>{i < step ? <Check aria-hidden="true" /> : i + 1}</i><span>{tr(s)}</span></li>)}
          </ol>
        )}

        <div className="stp-b">
          {step === 0 && (
            <>
              {problems > 0 && <p className="stp-warn" role="status">{tr('{count} print check needs a look. You can still continue.', { count: problems })}</p>}
              <div className="stp-field"><b>{tr('Quantity')}</b>
                <div className="stp-qty"><button type="button" aria-label={tr('Fewer')} onClick={() => setQty(Math.max(kind === 'doc' ? 1 : 50, qty - (kind === 'doc' ? 5 : 50)))}><Minus aria-hidden="true" /></button><span>{qty.toLocaleString('en-NG')}</span><button type="button" aria-label={tr('More')} onClick={() => setQty(qty + (kind === 'doc' ? 5 : 50))}><Plus aria-hidden="true" /></button></div>
              </div>
              <div className="stp-field"><b>{tr('Paper')}</b><div className="stp-opts" role="radiogroup" aria-label={tr('Paper')}>{papers.map((p) => <button key={p.id} type="button" role="radio" aria-checked={paper === p.id} onClick={() => setPaper(p.id)}>{tr(p.label)}</button>)}</div></div>
              <div className="stp-field"><b>{kind === 'doc' ? tr('Binding') : tr('Finish')}</b><div className="stp-opts" role="radiogroup" aria-label={kind === 'doc' ? tr('Binding') : tr('Finish')}>{finishes.map((p) => <button key={p.id} type="button" role="radio" aria-checked={finish === p.id} onClick={() => setFinish(p.id)}>{tr(p.label)}</button>)}</div></div>
              <div className="stp-field"><b>{tr('Get it by')}</b>
                <div className="stp-opts" role="radiogroup" aria-label={tr('Get it by')}>
                  <button type="button" role="radio" aria-checked={how === 'pickup'} onClick={() => setHow('pickup')}><Store aria-hidden="true" />{tr('Pick up')}</button>
                  <button type="button" role="radio" aria-checked={how === 'delivery'} onClick={() => setHow('delivery')}><Truck aria-hidden="true" />{tr('Delivery')}</button>
                </div>
              </div>
              <p className="stp-loc"><MapPin aria-hidden="true" />{tr('Near Yaba, Lagos')} · <button type="button" className="stp-link">{tr('Change')}</button></p>
            </>
          )}

          {step === 1 && (
            <>
              <p className="stp-sync"><BadgeCheck aria-hidden="true" />{tr('Printers and prices come live from Ifiok Market')}</p>
              <div className="stp-sort" role="group" aria-label={tr('Sort printers')}>
                {SORTS.map(([id, l]) => <button key={id} type="button" aria-pressed={sort === id} onClick={() => setSort(id)}>{tr(l)}</button>)}
              </div>
              <ul className="stp-list">
                {list.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="stp-p" aria-pressed={pid === p.id} onClick={() => setPid(p.id)}>
                      <span className="stp-pn"><b>{p.shop}</b><em><BadgeCheck aria-hidden="true" />{tr('Verified')}</em>{p.badge && <small>{tr(p.badge)}</small>}</span>
                      <span className="stp-pm"><MapPin aria-hidden="true" />{p.area} · {tr('{km} km away', { km: p.km })}<Star aria-hidden="true" />{p.rating} ({p.reviews})</span>
                      <span className="stp-pm">{p.days === 1 ? tr('Ready in 1 day') : tr('Ready in {days} days', { days: p.days })}</span>
                      <span className="stp-pr">{naira(priceOf(p, qty, pf, ff))}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 2 && chosen && (
            <>
              <dl className="stp-rev">
                <div><dt>{tr('File')}</dt><dd>{name}</dd></div>
                <div><dt>{tr('Printer')}</dt><dd>{chosen.shop}</dd></div>
                <div><dt>{tr('Spec')}</dt><dd>{qty.toLocaleString('en-NG')} · {tr(papers.find((p) => p.id === paper)!.label)} · {tr(finishes.find((f) => f.id === finish)!.label)}</dd></div>
                <div><dt>{tr('Get it by')}</dt><dd>{how === 'pickup' ? tr('Pick up at {area}', { area: chosen.area }) : tr('Delivery')}</dd></div>
                <div><dt>{tr('Printing')}</dt><dd>{naira(priceOf(chosen, qty, pf, ff))}</dd></div>
                {how === 'delivery' && <div><dt>{tr('Delivery fee')}</dt><dd>{naira(2500)}</dd></div>}
                <div className="tot"><dt>{tr('Total')}</dt><dd>{naira(total)}</dd></div>
              </dl>
              <p className="stp-note">{tr('Ifiok does not print your file. {name} prints it, and Ifiok holds your payment until you confirm you received it.', { name: chosen.shop })}</p>
            </>
          )}

          {step === 3 && chosen && (
            <div className="stp-done">
              <span className="stp-ok"><Check aria-hidden="true" /></span>
              <h3>{tr('{name} has your file', { name: chosen.shop })}</h3>
              <p>{tr('Order {ref} is in your Orders. The printer confirms within 15 minutes and you will get a message here and on WhatsApp.', { ref })}</p>
              <div className="stp-act">
                <a className="ex-btn p" href={asset('/design/#orders')}>{tr('Track in Orders')}</a>
                <button type="button" className="ex-btn" onClick={onClose}>{tr('Back to editor')}</button>
              </div>
            </div>
          )}
        </div>

        {step < 3 && (
          <footer className="stp-f">
            {step === 0 && <button type="button" className="ex-btn p wide" onClick={() => setStep(1)}>{tr('See printers near me')}</button>}
            {step === 1 && <button type="button" className="ex-btn p wide" disabled={!chosen} onClick={() => setStep(2)}>{chosen ? tr('Continue with {name}', { name: chosen.shop }) : tr('Choose a printer')}</button>}
            {step === 2 && <button type="button" className="ex-btn p wide" onClick={() => { setRef('IFK-' + (20430 + Math.floor(Math.random() * 60))); setStep(3); }}>{tr('Pay {amount} and send', { amount: naira(total) })}</button>}
          </footer>
        )}
      </div>
    </div>
  );
}
