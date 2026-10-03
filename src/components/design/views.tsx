'use client';

import { ArrowRight, ChevronRight, ExternalLink, FolderOpen, LayoutGrid, List, Plus, Search, Smartphone, Cloud, Eye, Type as TypeIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DesignCard, OrderCard, StagePill, TemplateCard } from './parts';
import { ACCOUNT_ROWS, QUICK, START_TILES, STAGES, TEMPLATES, TEMPLATE_CATS, TOOL_LINKS, USER, formatById, naira, type Design, type NavItem, type Order, type Stage, type Template } from './data';
import Thumb from './Thumb';

type Ops = { openDetail: (id: string) => void; duplicate: (id: string) => void; remove: (id: string) => void };

export function HomeView({ designs, orders, ops, go, newFrom, openPalette, useTemplate }: {
  designs: Design[]; orders: Order[]; ops: Ops; go: (v: string) => void; newFrom: (seed: { formatId?: string }) => void; openPalette: () => void; useTemplate: (t: Template) => void;
}) {
  const active = orders.filter((o) => o.stage !== 'delivered');
  return (
    <div className="view">
      <section className="hero-d d-only">
        <div className="hero-glow" aria-hidden="true" />
        <p className="hero-hi">Welcome back, {USER.first}</p>
        <h1>What will you design today?</h1>
        <button type="button" className="hero-search" onClick={openPalette}>
          <Search aria-hidden="true" /><span>Search designs, templates and tools</span><kbd>/</kbd>
        </button>
        <div className="quick" role="list" aria-label="Start a new design">
          {QUICK.map((id) => {
            const f = formatById(id);
            return (
              <button key={id} type="button" role="listitem" className="quick-i" onClick={() => newFrom({ formatId: id })}>
                <span className="quick-ic" aria-hidden="true"><Plus /></span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="m-home" aria-label="Start a design">
        <h1>Welcome back, {USER.first}</h1>
        <p className="muted">What do you want to design today?</p>
        <button type="button" className="m-search" onClick={openPalette}>
          <Search aria-hidden="true" /><span>Search designs, templates and tools</span>
        </button>
        <h2 className="m-h">Start a new design</h2>
        <div className="m-tiles">
          {START_TILES.map(({ id, label, sub, Icon }) => (
            <button key={id} type="button" className="m-tile" onClick={() => newFrom(id === 'custom' ? {} : { formatId: id })}>
              <span className="m-ic" aria-hidden="true"><Icon /></span>
              <b>{label}</b>
              <small>{sub}</small>
            </button>
          ))}
        </div>
        <div className="m-more">
          <a className="m-chip" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer"><FolderOpen aria-hidden="true" />Open a file</a>
          <button type="button" className="m-chip" onClick={() => go('templates')}><LayoutGrid aria-hidden="true" />Template gallery</button>
          <a className="m-chip" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer"><Eye aria-hidden="true" />View CorelDRAW</a>
          <a className="m-chip" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer"><TypeIcon aria-hidden="true" />Fonts for offline use</a>
        </div>
      </section>

      <section className="blk">
        <header className="blk-h"><h2>Continue designing</h2><button type="button" className="see" onClick={() => go('projects')}>See all <ChevronRight aria-hidden="true" /></button></header>
        <div className="rail-scroll">
          {designs.slice(0, 6).map((d) => (
            <div className="rs-i" key={d.id}><DesignCard d={d} onOpen={ops.openDetail} onDuplicate={ops.duplicate} onDelete={ops.remove} /></div>
          ))}
          {designs.length === 0 && <p className="muted">No designs yet. Pick a size above to start one.</p>}
        </div>
      </section>

      {active.length > 0 && (
        <section className="blk">
          <header className="blk-h"><h2>Print orders in progress</h2><button type="button" className="see" onClick={() => go('orders')}>All orders <ChevronRight aria-hidden="true" /></button></header>
          <div className="orders-g">
            {active.map((o) => <OrderCard key={o.id} o={o} design={designs.find((d) => d.id === o.designId)} onOpen={ops.openDetail} />)}
          </div>
        </section>
      )}

      {(['Marketing', 'Church & events'] as const).map((cat) => (
        <section className="blk" key={cat}>
          <header className="blk-h"><h2>{cat} templates</h2><button type="button" className="see" onClick={() => go('templates')}>See all <ChevronRight aria-hidden="true" /></button></header>
          <div className="rail-scroll">
            {TEMPLATES.filter((t) => t.cat === cat).map((t) => <div className="rs-i sm" key={t.id}><TemplateCard t={t} onUse={useTemplate} /></div>)}
          </div>
        </section>
      ))}

      <section className="blk">
        <header className="blk-h"><h2>Free tools</h2><a className="see" href="https://ifiok.ng/tools" target="_blank" rel="noopener noreferrer">All tools <ExternalLink aria-hidden="true" /></a></header>
        <div className="tool-g">
          {TOOL_LINKS.map(({ label, href, Icon }) => (
            <a key={label} className="tool" href={href} target="_blank" rel="noopener noreferrer"><Icon aria-hidden="true" /><span>{label}</span></a>
          ))}
        </div>
      </section>
    </div>
  );
}

const FILTERS: { id: 'all' | Stage; label: string }[] = [{ id: 'all', label: 'All' }, ...STAGES.map((s) => ({ id: s.id, label: s.label }))];

export function ProjectsView({ designs, ops, newFrom }: { designs: Design[]; ops: Ops; newFrom: (seed: Record<string, never>) => void }) {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState<'all' | Stage>('all');
  const [sort, setSort] = useState<'recent' | 'name'>('recent');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [where, setWhere] = useState<'cloud' | 'phone'>('cloud');
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = designs.filter((d) => (where === 'cloud' || d.device) && (stage === 'all' || d.stage === stage) && (!n || (d.name + ' ' + formatById(d.formatId).label).toLowerCase().includes(n)));
    return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list;
  }, [designs, q, stage, sort, where]);
  return (
    <div className="view">
      <header className="view-h">
        <div><h1>My files</h1><p className="muted">{shown.length} of {designs.length} designs</p></div>
        <button type="button" className="btn-p" onClick={() => newFrom({})}><Plus aria-hidden="true" />New design</button>
      </header>
      <div className="seg wide" role="group" aria-label="Where your files are">
        <button type="button" aria-pressed={where === 'cloud'} onClick={() => setWhere('cloud')}><Cloud aria-hidden="true" />&nbsp;All files</button>
        <button type="button" aria-pressed={where === 'phone'} onClick={() => setWhere('phone')}><Smartphone aria-hidden="true" />&nbsp;On this phone</button>
      </div>
      <div className="bar">
        <label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your designs" aria-label="Search your designs" /></label>
        <label className="sel"><span className="sr">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'name')}><option value="recent">Recently edited</option><option value="name">Name A to Z</option></select>
        </label>
        <div className="seg" role="group" aria-label="Layout">
          <button type="button" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} aria-label="Grid"><LayoutGrid aria-hidden="true" /></button>
          <button type="button" aria-pressed={layout === 'list'} onClick={() => setLayout('list')} aria-label="List"><List aria-hidden="true" /></button>
        </div>
      </div>
      <div className="chips" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={stage === f.id} onClick={() => setStage(f.id)}>
            {f.label}<small>{f.id === 'all' ? designs.length : designs.filter((d) => d.stage === f.id).length}</small>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty"><p><b>No designs match.</b> Try another word or status.</p><button type="button" className="btn-s" onClick={() => { setQ(''); setStage('all'); }}>Clear filters</button></div>
      ) : layout === 'grid' ? (
        <div className="dgrid">{shown.map((d) => <DesignCard key={d.id} d={d} onOpen={ops.openDetail} onDuplicate={ops.duplicate} onDelete={ops.remove} />)}</div>
      ) : (
        <ul className="dlist">
          {shown.map((d) => (
            <li key={d.id}>
              <button type="button" className="dl-row" onClick={() => ops.openDetail(d.id)}>
                <span className="dl-th"><Thumb formatId={d.formatId} accent={d.accent} headline={d.headline} sub={d.sub} /></span>
                <span className="dl-name"><b>{d.name}</b><small>{formatById(d.formatId).label} · {d.edited}</small></span>
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

export function TemplatesView({ useTemplate }: { useTemplate: (t: Template) => void }) {
  const [cat, setCat] = useState<string>('All');
  const [q, setQ] = useState('');
  const shown = TEMPLATES.filter((t) => (cat === 'All' || t.cat === cat) && (!q.trim() || (t.name + t.cat).toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <div className="view">
      <header className="view-h"><div><h1>Templates</h1><p className="muted">A sample of the 530+ free templates. Pick one to start a design.</p></div></header>
      <div className="bar"><label className="search"><Search aria-hidden="true" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" aria-label="Search templates" /></label></div>
      <div className="chips" role="group" aria-label="Category">
        {['All', ...TEMPLATE_CATS].map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {shown.length === 0 ? <div className="empty"><p><b>No templates match.</b> Try another word.</p></div> : <div className="tgrid">{shown.map((t) => <TemplateCard key={t.id} t={t} onUse={useTemplate} />)}</div>}
    </div>
  );
}

export function OrdersView({ orders, designs, ops }: { orders: Order[]; designs: Design[]; ops: Ops }) {
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const list = orders.filter((o) => (tab === 'active') === (o.stage !== 'delivered'));
  const spent = orders.reduce((s, o) => s + o.total, 0);
  return (
    <div className="view">
      <header className="view-h"><div><h1>Orders &amp; prints</h1><p className="muted">{orders.length} orders · {naira(spent)} in total</p></div></header>
      <div className="seg wide" role="tablist" aria-label="Orders">
        <button type="button" role="tab" aria-selected={tab === 'active'} aria-pressed={tab === 'active'} onClick={() => setTab('active')}>In progress</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} aria-pressed={tab === 'past'} onClick={() => setTab('past')}>Delivered</button>
      </div>
      {list.length === 0 ? <div className="empty"><p><b>Nothing here yet.</b></p></div> : <div className="orders-g">{list.map((o) => <OrderCard key={o.id} o={o} design={designs.find((d) => d.id === o.designId)} onOpen={ops.openDetail} />)}</div>}
    </div>
  );
}

export function PlaceholderView({ item }: { item: NavItem }) {
  const Icon = item.Icon;
  return (
    <div className="view">
      <div className="ph">
        <span className="ph-ic"><Icon aria-hidden="true" /></span>
        <h1>{item.label}</h1>
        <p>{item.blurb}</p>
        <p className="muted">This screen is part of the live app. The prototype shows Home, My files, Templates and Orders.</p>
        <a className="btn-p" href="https://designs.ifiok.ng" target="_blank" rel="noopener noreferrer">Open in Ifiok Designs <ArrowRight aria-hidden="true" /></a>
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
      <p className="side-h">Account</p>
      <ul className="acct-list">
        {ACCOUNT_ROWS.map(({ label, blurb, Icon, href }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              <span className="acct-ic" aria-hidden="true"><Icon /></span>
              <span><b>{label}</b><small>{blurb}</small></span>
              <ChevronRight aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <p className="side-h">My orders</p>
      <a className="acct-orders" href="#orders">Orders &amp; prints <ChevronRight aria-hidden="true" /></a>
    </div>
  );
}
