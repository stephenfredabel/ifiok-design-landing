'use client';

import { ArrowUpRight, Globe, LayoutGrid, List, Plus, Rows3, Search, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { APPS, LAYERS, NEXT_UP, surfaceLabel, type AppEntry, type Surface } from '@/data/apps';
import { T } from '@/i18n/LangProvider';
import { asset } from '@/lib/asset';

type StatusFilter = 'all' | 'live' | 'soon';
type PlatformFilter = 'any' | 'web' | 'android';
type View = 'cards' | 'table';

const isLive = (a: AppEntry) => a.web?.status === 'live' || a.android?.status === 'live';

function SurfaceAction({ s, name }: { s?: Surface; name: string }) {
  // Nothing to press yet: the status pill already says so.
  if (!s || s.status === 'soon') return null;
  return (
    <a className="act on" href={s.url ?? 'https://ifiok.ng'} aria-label={`${s.url ? 'Open' : 'Request access to'} ${name}`}>
      {s.url ? 'Open' : 'Request access'} <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

function Pill({ s }: { s?: Surface }) {
  const cls = !s ? 'na' : s.status;
  return (
    <span className={`spill ${cls}`}>
      <i aria-hidden="true" />
      {surfaceLabel(s)}
    </span>
  );
}

function Card({ a }: { a: AppEntry }) {
  return (
    <article className="appcard" id={a.slug}>
      <header>
        {a.icon ? <img className="tile img" src={asset(`/apps/${a.icon}`)} alt="" width={48} height={48} /> : <span className="tile" style={{ background: a.tile }}><a.Icon aria-hidden="true" /></span>}
        <div>
          <h3>{a.name}</h3>
          <span className="ltag">{LAYERS.find((l) => l.id === a.layer)!.label}</span>
        </div>
      </header>
      <p className="tagline">{a.tagline}</p>
      <ul className="feat">
        {a.features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <div className="surfs">
        {([['Web app', Globe, a.web], ['Android app', Smartphone, a.android]] as const).map(([label, Icon, s]) => (
          <div className="surf" key={label}>
            <span className="sname"><Icon aria-hidden="true" />{label}</span>
            <Pill s={s} />
            <SurfaceAction s={s} name={`${a.name} ${label}`} />
            {s?.pkg && <code className="pkg">{s.pkg}</code>}
          </div>
        ))}
      </div>
    </article>
  );
}

function Table({ apps }: { apps: AppEntry[] }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr><th>App</th><th>Layer</th><th>Web</th><th>Android</th><th><span className="sr">Open</span></th></tr>
        </thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a.slug} id={a.slug}>
              <td>
                <span className="tcell">
                  {a.icon ? <img className="tile sm img" src={asset(`/apps/${a.icon}`)} alt="" width={34} height={34} /> : <span className="tile sm" style={{ background: a.tile }}><a.Icon aria-hidden="true" /></span>}
                  <span><b>{a.name}</b><small>{a.tagline}</small></span>
                </span>
              </td>
              <td>{LAYERS.find((l) => l.id === a.layer)!.label}</td>
              <td><Pill s={a.web} /></td>
              <td><Pill s={a.android} /></td>
              <td className="tact"><SurfaceAction s={a.web?.status === 'live' ? a.web : a.android} name={a.name} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AppDashboard() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [platform, setPlatform] = useState<PlatformFilter>('any');
  const [view, setView] = useState<View>('cards');

  const liveCount = APPS.filter(isLive).length;
  const androidLive = APPS.filter((a) => a.android?.status === 'live').length;
  const soonCount = APPS.length - liveCount;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return APPS.filter((a) => {
      if (status === 'live' && !isLive(a)) return false;
      if (status === 'soon' && isLive(a)) return false;
      if (platform !== 'any' && !a[platform]) return false;
      if (!needle) return true;
      return [a.name, a.short, a.tagline, ...a.features].join(' ').toLowerCase().includes(needle);
    });
  }, [q, status, platform]);

  const filtered = q !== '' || status !== 'all' || platform !== 'any';
  const reset = () => { setQ(''); setStatus('all'); setPlatform('any'); };

  return (
    <>
      <div className="dash-head">
        <div className="wrap">
          <p className="crumb"><a href="https://ifiok.ng">Ifiok</a> <span aria-hidden="true">/</span> <T k="apps.crumb">Apps</T></p>
          <h1><T k="apps.h1">Every Ifiok app, in one place.</T></h1>
          <p className="lead"><T k="apps.lead">Print, design, documents, device security and customer insight. Pick the app you need, on the web or on your phone.</T></p>
          <dl className="stats">
            <div><dt><T k="apps.s1">Apps</T></dt><dd>{APPS.length}</dd></div>
            <div><dt><T k="apps.s2">Live now</T></dt><dd>{liveCount}</dd></div>
            <div><dt><T k="apps.s3">On Android</T></dt><dd>{androidLive}</dd></div>
            <div><dt><T k="apps.s4">Coming soon</T></dt><dd>{soonCount}</dd></div>
          </dl>
        </div>
      </div>

      <div className="wrap dash">
        <aside className="dash-side" aria-label="Browse by layer">
          <p className="side-h"><T k="apps.layers">Layers</T></p>
          <nav>
            {LAYERS.map((l) => {
              const n = shown.filter((a) => a.layer === l.id).length;
              return (
                <a key={l.id} href={`#layer-${l.id}`} aria-disabled={n === 0}>
                  <span><b>{l.label}</b><small>{l.blurb}</small></span>
                  <em className="mono">{n}</em>
                </a>
              );
            })}
            <a href="#next"><span><b>Next</b><small>More to come</small></span><em className="mono">+</em></a>
          </nav>
          <div className="legend">
            <p className="side-h"><T k="apps.legend">Status</T></p>
            <span className="spill live"><i />Live</span>
            <span className="spill soon"><i />Coming soon</span>
            <span className="spill na"><i />Not available</span>
          </div>
        </aside>

        <div className="dash-main">
          <div className="toolbar" role="search">
            <label className="search">
              <Search aria-hidden="true" />
              <input id="app-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps and features" aria-label="Search apps and features" />
            </label>
            <div className="seg" role="group" aria-label="Status">
              {(['all', 'live', 'soon'] as const).map((v) => (
                <button key={v} type="button" aria-pressed={status === v} onClick={() => setStatus(v)}>
                  {v === 'all' ? 'All' : v === 'live' ? 'Live' : 'Coming soon'}
                </button>
              ))}
            </div>
            <div className="seg" role="group" aria-label="Platform">
              {(['any', 'web', 'android'] as const).map((v) => (
                <button key={v} type="button" aria-pressed={platform === v} onClick={() => setPlatform(v)}>
                  {v === 'any' ? 'Any device' : v === 'web' ? 'Web' : 'Android'}
                </button>
              ))}
            </div>
            <div className="seg view" role="group" aria-label="Layout">
              <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')} aria-label="Card view" title="Card view"><LayoutGrid aria-hidden="true" /></button>
              <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')} aria-label="Table view" title="Table view"><List aria-hidden="true" /></button>
            </div>
          </div>
          <p className="count" aria-live="polite">{shown.length} of {APPS.length} apps{filtered && <> · <button type="button" className="linkbtn" onClick={reset}>Clear filters</button></>}</p>

          {shown.length === 0 ? (
            <div className="empty">
              <Rows3 aria-hidden="true" />
              <p><b>No app matches that.</b> Try a different word, or clear the filters.</p>
              <button type="button" className="btn btn-line" onClick={reset}>Clear filters</button>
            </div>
          ) : view === 'table' ? (
            <Table apps={shown} />
          ) : (
            LAYERS.map((l) => {
              const inLayer = shown.filter((a) => a.layer === l.id);
              if (inLayer.length === 0) return null;
              return (
                <section className="layer" id={`layer-${l.id}`} key={l.id}>
                  <h2><span>{l.label}</span><small>{l.blurb}</small></h2>
                  <div className={`cards${inLayer.length === 1 ? ' solo' : ''}`}>
                    {inLayer.map((a) => <Card key={a.slug} a={a} />)}
                  </div>
                </section>
              );
            })
          )}

          <section className="layer" id="next">
            <h2><span><T k="apps.next">Next</T></span><small><T k="apps.nextb">More apps are on the way</T></small></h2>
            <div className="appcard ghost">
              <span className="tile" aria-hidden="true"><Plus /></span>
              <div>
                <h3>{NEXT_UP.label}</h3>
                <p className="tagline"><T k="apps.nextp">New Ifiok apps will appear here as they launch, each with its web and Android status.</T></p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="alt sysmap" id="system">
        <div className="wrap">
          <div className="sechead">
            <span className="kick"><T k="apps.map">How it fits together</T></span>
            <h2><T k="apps.maph">One account. Four layers. Room to grow.</T></h2>
            <p><T k="apps.mapp">Every app sits in a layer, so you always know where a new one belongs and what it connects to.</T></p>
          </div>
          <div className="map" aria-label="Ifiok app map">
            <div className="map-base"><b>Ifiok account</b><span>One account for the whole family</span></div>
            <div className="map-cols">
              {LAYERS.map((l) => (
                <div className="map-col" key={l.id}>
                  <p className="map-h">{l.label}</p>
                  {APPS.filter((a) => a.layer === l.id).map((a) => (
                    <a className="node" href={`#${a.slug}`} key={a.slug}>
                      {a.icon ? <img className="tile sm img" src={asset(`/apps/${a.icon}`)} alt="" width={34} height={34} /> : <span className="tile sm" style={{ background: a.tile }}><a.Icon aria-hidden="true" /></span>}
                      <span><b>{a.short}</b><small>{isLive(a) ? 'Live' : 'Coming soon'}</small></span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div className="map-more"><Plus aria-hidden="true" /> More to come</div>
          </div>
        </div>
      </section>
    </>
  );
}
