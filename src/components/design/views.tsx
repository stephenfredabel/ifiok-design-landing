'use client';

import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, FolderOpen, LayoutGrid, List, Plus, Search, Smartphone, Cloud, Eye, Type as TypeIcon } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useMemo, useState } from 'react';
import { DesignCard, OrderCard, StagePill, TemplateCard } from './parts';
import { ACCOUNT_ROWS, DOC_TEMPLATES, QUICK, STAGES, TEMPLATES, TEMPLATE_CATS, TOOL_LINKS, USER, formatById, isDoc, naira, type Design, type NavItem, type Order, type Stage, type Template } from './data';
import Thumb from './Thumb';

import { tr } from '@/i18n/tr';
/** One horizontal line that swipes on touch and shows arrow buttons on wider screens. */
export function ScrollRow({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<{ l: boolean; r: boolean }>({ l: false, r: false });
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener('scroll', measure); };
  }, [measure]);
  const by = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: 'smooth' });
  return (
    <div className="srow" data-l={edge.l ? '' : undefined} data-r={edge.r ? '' : undefined}>
      <button type="button" className="srow-btn l" aria-label={tr("Scroll left")} onClick={() => by(-1)} tabIndex={edge.l ? 0 : -1}><ChevronLeft aria-hidden="true" /></button>
      <div className="srow-track" ref={ref} role="list" aria-label={label}>{children}</div>
      <button type="button" className="srow-btn r" aria-label={tr("Scroll right")} onClick={() => by(1)} tabIndex={edge.r ? 0 : -1}><ChevronRight aria-hidden="true" /></button>
    </div>
  );
}

type Ops = { openDetail: (id: string) => void; duplicate: (id: string) => void; remove: (id: string) => void };

export function HomeView({ designs: all, orders, ops, go, newFrom, newDoc, openPalette, useTemplate, slot, hero }: {
  newDoc: (t?: Template) => void; slot?: React.ReactNode; hero?: { title: string; sub?: string; quick: readonly string[] }; designs: Design[]; orders: Order[]; ops: Ops; go: (v: string) => void; newFrom: (seed: { formatId?: string }) => void; openPalette: () => void; useTemplate: (t: Template) => void;
}) {
  const active = orders.filter((o) => o.stage !== 'delivered');
  const designs = all.filter((d) => !isDoc(d));
  const docs = all.filter(isDoc);
  return (
    <div className="view">
      <section className="hero-d">
        <div className="hero-glow" aria-hidden="true" />
        <p className="hero-hi">{tr("Welcome back, {first}", { first: USER.first })}</p>
        <h1>{hero?.title ?? tr("What will you design today?")}</h1>
        {hero?.sub && <p className="cd-hero-sub">{tr(hero.sub)}</p>}
        <button type="button" className="hero-search" onClick={openPalette}>
          <Search aria-hidden="true" /><span>{tr("Search designs, documents and tools")}</span><kbd>/</kbd>
        </button>
        <ScrollRow label={tr("Start a new design")}>
          {(hero?.quick ?? QUICK).map((id) => {
            const f = formatById(id);
            return (
              <button key={id} type="button" role="listitem" className="quick-i" onClick={() => newFrom({ formatId: id })}>
                <span className="quick-ic" aria-hidden="true"><Plus /></span>
                <span>{tr(f.label)}</span>
              </button>
            );
          })}
          <button type="button" role="listitem" className="quick-i" onClick={() => newDoc()}>
            <span className="quick-ic custom" aria-hidden="true"><Plus /></span>
            <span>{tr("Document")}</span>
          </button>
          <button type="button" role="listitem" className="quick-i" onClick={() => newFrom({})}>
            <span className="quick-ic custom" aria-hidden="true"><Plus /></span>
            <span>{tr("Custom size")}</span>
          </button>
        </ScrollRow>
      </section>

      <section className="actions" aria-label={tr("Bring something in")}>
        <a className="act-tile" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer">
          <span className="act-ic" aria-hidden="true"><FolderOpen /></span>
          <span><b>{tr("Open a file")}</b><small>{tr("PDF, PowerPoint, images")}</small></span>
        </a>
        <button type="button" className="act-tile" onClick={() => go('templates')}>
          <span className="act-ic" aria-hidden="true"><LayoutGrid /></span>
          <span><b>{tr("Template gallery")}</b><small>{tr("530+ free templates")}</small></span>
        </button>
        <a className="act-tile" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer">
          <span className="act-ic" aria-hidden="true"><Eye /></span>
          <span><b>{tr("View CorelDRAW")}</b><small>{tr("Open .cdr without CorelDRAW")}</small></span>
        </a>
        <a className="act-tile" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer">
          <span className="act-ic" aria-hidden="true"><TypeIcon /></span>
          <span><b>{tr("Offline fonts")}</b><small>{tr("Add fonts for use without data")}</small></span>
        </a>
      </section>

      {slot}

      <section className="blk">
        <header className="blk-h"><h2>{tr("Continue designing")}</h2><button type="button" className="see" onClick={() => go('projects')}>{tr("See all")} <ChevronRight aria-hidden="true" /></button></header>
        <div className="rail-scroll">
          {designs.slice(0, 6).map((d) => (
            <div className="rs-i" key={d.id}><DesignCard d={d} onOpen={ops.openDetail} onDuplicate={ops.duplicate} onDelete={ops.remove} /></div>
          ))}
          {designs.length === 0 && <p className="muted">{tr("No designs yet. Pick a size above to start one.")}</p>}
        </div>
      </section>

      <section className="blk">
        <header className="blk-h"><h2>{tr("Your documents")}</h2><button type="button" className="see" onClick={() => go('docs')}>{tr("See all")} <ChevronRight aria-hidden="true" /></button></header>
        <div className="rail-scroll">
          <div className="rs-i sm"><button type="button" className="tcard newdoc" onClick={() => newDoc()} aria-label={tr("New document")}><span className="nd-plus" aria-hidden="true"><Plus /></span><span className="tcard-name">{tr("New document")}</span><span className="tcard-sub">{tr("Ifiok Docs")}</span></button></div>
          {docs.slice(0, 5).map((d) => (
            <div className="rs-i" key={d.id}><DesignCard d={d} onOpen={ops.openDetail} onDuplicate={ops.duplicate} onDelete={ops.remove} /></div>
          ))}
          {docs.length === 0 && DOC_TEMPLATES.slice(0, 4).map((t) => <div className="rs-i sm" key={t.id}><TemplateCard t={t} onUse={(x) => newDoc(x)} /></div>)}
        </div>
      </section>

      {active.length > 0 && (
        <section className="blk">
          <header className="blk-h"><h2>{tr("Print orders in progress")}</h2><button type="button" className="see" onClick={() => go('orders')}>{tr("All orders")} <ChevronRight aria-hidden="true" /></button></header>
          <div className="orders-g">
            {active.map((o) => <OrderCard key={o.id} o={o} design={designs.find((d) => d.id === o.designId)} onOpen={ops.openDetail} />)}
          </div>
        </section>
      )}

      {(['Marketing', 'Church & events'] as const).map((cat) => (
        <section className="blk" key={cat}>
          <header className="blk-h"><h2>{tr("{cat} templates", { cat: tr(cat) })}</h2><button type="button" className="see" onClick={() => go('templates')}>{tr("See all")} <ChevronRight aria-hidden="true" /></button></header>
          <div className="rail-scroll">
            {TEMPLATES.filter((t) => t.cat === cat).map((t) => <div className="rs-i sm" key={t.id}><TemplateCard t={t} onUse={useTemplate} /></div>)}
          </div>
        </section>
      ))}

      <section className="blk">
        <header className="blk-h"><h2>{tr("PDF tools")}</h2><a className="see" href="https://ifiok.ng/tools" target="_blank" rel="noopener noreferrer">{tr("All tools")} <ExternalLink aria-hidden="true" /></a></header>
        <div className="tool-g">
          {TOOL_LINKS.map(({ label, href, Icon }) => (
            <a key={label} className="tool" href={href} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" /><span>{tr(label)}</span></a>
          ))}
        </div>
      </section>
    </div>
  );
}

const FILTERS: { id: 'all' | Stage; label: string }[] = [{ id: 'all', label: 'All' }, ...STAGES.map((s) => ({ id: s.id, label: s.label }))];

export function ProjectsView({ designs, ops, onNew }: { designs: Design[]; ops: Ops; onNew: () => void }) {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'all' | 'design' | 'doc'>('all');
  const [stage, setStage] = useState<'all' | Stage>('all');
  const [sort, setSort] = useState<'recent' | 'name'>('recent');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [where, setWhere] = useState<'cloud' | 'phone'>('cloud');
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = designs.filter((d) => (where === 'cloud' || d.device) && (kind === 'all' || (kind === 'doc') === isDoc(d)) && (stage === 'all' || d.stage === stage) && (!n || (d.name + ' ' + formatById(d.formatId).label).toLowerCase().includes(n)));
    return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list;
  }, [designs, q, stage, sort, where, kind]);
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>{tr("My files")}</h1><p className="muted">{tr("{shownCount} of {designsCount} files", { shownCount: shown.length, designsCount: designs.length })}</p></div>
        <button type="button" className="btn-p" onClick={onNew}><Plus aria-hidden="true" />{tr("New")}</button>
      </header>
      <div className="seg wide" role="group" aria-label={tr("Where your files are")}>
        <button type="button" aria-pressed={where === 'cloud'} onClick={() => setWhere('cloud')}><Cloud aria-hidden="true" />&nbsp;{tr("All files")}</button>
        <button type="button" aria-pressed={where === 'phone'} onClick={() => setWhere('phone')}><Smartphone aria-hidden="true" />&nbsp;{tr("On this phone")}</button>
      </div>
      <div className="bar">
        <label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search your files")} aria-label={tr("Search your files")} /></label>
        <label className="sel"><span className="sr">{tr("Sort")}</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'name')}><option value="recent">{tr("Recently edited")}</option><option value="name">{tr("Name A to Z")}</option></select>
        </label>
        <div className="seg" role="group" aria-label={tr("Layout")}>
          <button type="button" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} aria-label={tr("Grid")}><LayoutGrid aria-hidden="true" /></button>
          <button type="button" aria-pressed={layout === 'list'} onClick={() => setLayout('list')} aria-label={tr("List")}><List aria-hidden="true" /></button>
        </div>
      </div>
      <div className="chips" role="group" aria-label={tr("Filter by app")}>
        {([['all', 'All files'], ['design', 'Designs'], ['doc', 'Documents']] as const).map(([id, label]) => (
          <button key={id} type="button" className="chip" aria-pressed={kind === id} onClick={() => setKind(id)}>
            {tr(label)}<small>{id === 'all' ? designs.length : designs.filter((d) => (id === 'doc') === isDoc(d)).length}</small>
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label={tr("Filter by status")}>
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={stage === f.id} onClick={() => setStage(f.id)}>
            {tr(f.label)}<small>{f.id === 'all' ? designs.length : designs.filter((d) => d.stage === f.id).length}</small>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty"><p><b>{tr("No files match.")}</b> {tr("Try another word or status.")}</p><button type="button" className="btn-s" onClick={() => { setQ(''); setStage('all'); setKind('all'); }}>{tr("Clear filters")}</button></div>
      ) : layout === 'grid' ? (
        <div className="dgrid">{shown.map((d) => <DesignCard key={d.id} d={d} onOpen={ops.openDetail} onDuplicate={ops.duplicate} onDelete={ops.remove} />)}</div>
      ) : (
        <ul className="dlist">
          {shown.map((d) => (
            <li key={d.id}>
              <button type="button" className="dl-row" onClick={() => ops.openDetail(d.id)}>
                <span className="dl-th"><Thumb formatId={d.formatId} accent={d.accent} headline={d.headline} sub={tr(d.sub)} /></span>
                <span className="dl-name"><b>{tr(d.name)}</b><small>{tr(formatById(d.formatId).label)} · {tr(d.edited)}</small></span>
                <StagePill stage={d.stage} />
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TemplatesView({ useTemplate, initialCat = 'All' }: { useTemplate: (t: Template) => void; initialCat?: string }) {
  const [cat, setCat] = useState<string>(initialCat);
  const [q, setQ] = useState('');
  const shown = TEMPLATES.filter((t) => (cat === 'All' || t.cat === cat) && (!q.trim() || (t.name + t.cat).toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <div className="view">
      <header className="view-h"><div><h1>{tr("Templates")}</h1><p className="muted">{tr("A sample of the 530+ free templates. Pick one to start a design.")}</p></div></header>
      <div className="bar"><label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search templates")} aria-label={tr("Search templates")} /></label></div>
      <div className="chips" role="group" aria-label={tr("Category")}>
        {['All', ...TEMPLATE_CATS].map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{tr(c)}</button>)}
      </div>
      {shown.length === 0 ? <div className="empty"><p><b>{tr("No templates match.")}</b> {tr("Try another word.")}</p></div> : <div className="tgrid">{shown.map((t) => <TemplateCard key={t.id} t={t} onUse={useTemplate} />)}</div>}
    </div>
  );
}

export function OrdersView({ orders, designs, ops }: { orders: Order[]; designs: Design[]; ops: Ops }) {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const list = orders.filter((o) => (tab === 'active') === (o.stage !== 'delivered'));
  const spent = orders.reduce((s, o) => s + o.total, 0);
  return (
    <div className="view">
      <header className="view-h"><div><h1>{tr("Orders & prints")}</h1><p className="muted">{tr("{ordersCount} orders · {spent} in total", { ordersCount: orders.length, spent: naira(spent) })}</p></div></header>
      <div className="seg wide" role="tablist" aria-label={tr("Orders")}>
        <button type="button" role="tab" aria-selected={tab === 'active'} aria-pressed={tab === 'active'} onClick={() => setTab('active')}>{tr("In progress")}</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} aria-pressed={tab === 'past'} onClick={() => setTab('past')}>{tr("Delivered")}</button>
      </div>
      {list.length === 0 ? <div className="empty"><p><b>{tr("Nothing here yet.")}</b></p></div> : <div className="orders-g">{list.map((o) => <OrderCard key={o.id} o={o} design={designs.find((d) => d.id === o.designId)} onOpen={ops.openDetail} />)}</div>}
    </div>
  );
}

export function PlaceholderView({ item }: { item: NavItem }) {
  const Icon = item.Icon;
  return (
    <div className="view">
      <div className="ph">
        <span className="ph-ic"><Icon aria-hidden="true" /></span>
        <h1>{tr(item.label)}</h1>
        <p>{tr(item.blurb)}</p>
        <p className="muted">{tr("This screen is part of the live app. The prototype shows Home, My files, Templates and Orders.")}</p>
        <a className="btn-p" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer">{tr("Open in Ifiok Designs")} <ArrowRight aria-hidden="true" /></a>
      </div>
    </div>
  );
}


export function AccountView() {
  return (
    <div className="view narrow">
      <section className="acct-card">
        <span className="avatar big">{USER.initial}</span>
        <div><h1>{USER.first}</h1><p className="muted">{USER.email}</p></div>
      </section>
      <p className="side-h">{tr("Account")}</p>
      <ul className="acct-list">
        {ACCOUNT_ROWS.map(({ label, blurb, Icon, href }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              <span className="acct-ic" aria-hidden="true"><Icon /></span>
              <span><b>{tr(label)}</b><small>{tr(blurb)}</small></span>
              <ChevronRight aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <p className="side-h">{tr("My orders")}</p>
      <a className="acct-orders" href="#orders">{tr("Orders & prints")} <ChevronRight aria-hidden="true" /></a>
    </div>
  );
}
