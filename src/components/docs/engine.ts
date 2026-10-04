/* Editing helpers for the Docs mockup. The page is a browser-native contentEditable, so selection, typing and
   select-all are the browser's own. These helpers keep the selection across menus and dialogs and do the formatting. */

export const PX_PER_PT = 4 / 3;
export const BLOCKS = 'p,h1,h2,h3,h4,li,blockquote,div,td,th';

export type Fmt = { bold: boolean; italic: boolean; underline: boolean; strike: boolean; sup: boolean; sub: boolean; ul: boolean; ol: boolean; check: boolean; align: string; style: string; font: string; size: number; inTable: boolean; color: string; link: boolean };
export const NO_FMT: Fmt = { bold: false, italic: false, underline: false, strike: false, sup: false, sub: false, ul: false, ol: false, check: false, align: 'left', style: 'p', font: 'Arial', size: 11, inTable: false, color: '#000000', link: false };

const q = (c: string) => { try { return document.queryCommandState(c); } catch { return false; } };

export function elOf(n: Node | null): HTMLElement | null {
  if (!n) return null;
  return n.nodeType === 3 ? n.parentElement : (n as HTMLElement);
}

export function readFormat(ed: HTMLElement | null, families: { family: string; stack: string }[]): Fmt {
  const s = document.getSelection();
  if (!ed || !s || !s.rangeCount || !ed.contains(s.anchorNode)) return NO_FMT;
  const el = elOf(s.anchorNode);
  if (!el) return NO_FMT;
  const cs = getComputedStyle(el);
  const block = el.closest(BLOCKS) as HTMLElement | null;
  let style = 'p';
  const tag = block?.tagName.toLowerCase();
  if (tag === 'h1' || tag === 'h2' || tag === 'h3') style = tag;
  else if (tag === 'blockquote') style = 'quote';
  else if (block?.classList.contains('dx-title')) style = 'title';
  else if (block?.classList.contains('dx-subtitle')) style = 'subtitle';
  const first = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
  const fam = families.find((f) => f.family.toLowerCase() === first.toLowerCase())?.family ?? first;
  const list = el.closest('ul,ol') as HTMLElement | null;
  return {
    bold: q('bold'), italic: q('italic'), underline: q('underline'), strike: q('strikeThrough'), sup: q('superscript'), sub: q('subscript'),
    ul: list?.tagName === 'UL' && !list.classList.contains('dx-check'), ol: list?.tagName === 'OL', check: !!list?.classList.contains('dx-check'),
    align: q('justifyCenter') ? 'center' : q('justifyRight') ? 'right' : q('justifyFull') ? 'justify' : 'left',
    style, font: fam, size: Math.round(parseFloat(cs.fontSize) / PX_PER_PT), inTable: !!el.closest('td,th'), color: cs.color, link: !!el.closest('a'),
  };
}

/** Block elements touched by the current selection (inside the editor). */
export function selectedBlocks(ed: HTMLElement): HTMLElement[] {
  const s = document.getSelection();
  if (!s || !s.rangeCount) return [];
  const r = s.getRangeAt(0);
  const out = new Set<HTMLElement>();
  const start = elOf(r.startContainer)?.closest(BLOCKS) as HTMLElement | null;
  if (start && ed.contains(start) && start !== ed) out.add(start);
  const walker = document.createTreeWalker(ed, NodeFilter.SHOW_ELEMENT);
  let n = walker.nextNode() as HTMLElement | null;
  while (n) {
    if (n.matches(BLOCKS) && r.intersectsNode(n) && !n.querySelector(BLOCKS.replace(',div', ''))) out.add(n);
    n = walker.nextNode() as HTMLElement | null;
  }
  return [...out];
}

export function setFontSize(ed: HTMLElement, pt: number) {
  document.execCommand('styleWithCSS', false, 'false');
  document.execCommand('fontSize', false, '7');
  ed.querySelectorAll('font[size="7"]').forEach((f) => {
    const sp = document.createElement('span');
    sp.style.fontSize = `${Math.round(pt * PX_PER_PT * 10) / 10}px`;
    sp.innerHTML = (f as HTMLElement).innerHTML;
    f.replaceWith(sp);
  });
  // a span nested inside a span with its own size would win; clear sizes in the new span's children
  ed.querySelectorAll<HTMLElement>('span[style*="font-size"] span[style*="font-size"]').forEach((c) => { c.style.fontSize = ''; });
}

export function setStyle(ed: HTMLElement, id: string) {
  const map: Record<string, string> = { p: 'p', title: 'p', subtitle: 'p', h1: 'h1', h2: 'h2', h3: 'h3', quote: 'blockquote' };
  document.execCommand('formatBlock', false, map[id] ?? 'p');
  selectedBlocks(ed).forEach((b) => { b.classList.remove('dx-title', 'dx-subtitle'); if (id === 'title') b.classList.add('dx-title'); if (id === 'subtitle') b.classList.add('dx-subtitle'); });
}

export function setLineSpacing(ed: HTMLElement, v: string) { selectedBlocks(ed).forEach((b) => { b.style.lineHeight = v; }); }
export function setParaSpace(ed: HTMLElement, side: 'before' | 'after') {
  selectedBlocks(ed).forEach((b) => { if (side === 'before') b.style.marginTop = b.style.marginTop ? '' : '12pt'; else b.style.marginBottom = b.style.marginBottom ? '' : '12pt'; });
}

export function makeChecklist(ed: HTMLElement) {
  const s = document.getSelection();
  const el = elOf(s?.anchorNode ?? null);
  let list = el?.closest('ul,ol') as HTMLElement | null;
  if (!list || !ed.contains(list)) { document.execCommand('insertUnorderedList'); list = elOf(document.getSelection()?.anchorNode ?? null)?.closest('ul,ol') as HTMLElement | null; }
  if (list) { if (list.tagName === 'OL') { const ul = document.createElement('ul'); ul.innerHTML = list.innerHTML; list.replaceWith(ul); list = ul; } list.classList.toggle('dx-check'); }
}

export function changeCase(mode: 'lower' | 'upper' | 'title') {
  const s = document.getSelection();
  if (!s || s.isCollapsed) return;
  const t = s.toString();
  const out = mode === 'lower' ? t.toLowerCase() : mode === 'upper' ? t.toUpperCase() : t.toLowerCase().replace(/(^|\s)(\S)/g, (_m, a, b) => a + b.toUpperCase());
  document.execCommand('insertText', false, out);
}

export function clearFormatting(ed: HTMLElement) {
  document.execCommand('removeFormat');
  document.execCommand('unlink');
  selectedBlocks(ed).forEach((b) => { b.removeAttribute('style'); b.classList.remove('dx-title', 'dx-subtitle'); });
  document.execCommand('formatBlock', false, 'p');
}

export function tableHtml(rows: number, cols: number) {
  const cell = '<td><br></td>';
  const tr = `<tr>${cell.repeat(cols)}</tr>`;
  return `<table class="dx-table"><tbody>${tr.repeat(rows)}</tbody></table><p><br></p>`;
}

export function tableOp(op: string, ed: HTMLElement) {
  const s = document.getSelection();
  const cell = elOf(s?.anchorNode ?? null)?.closest('td,th') as HTMLTableCellElement | null;
  if (!cell || !ed.contains(cell)) return false;
  const row = cell.parentElement as HTMLTableRowElement;
  const table = cell.closest('table') as HTMLTableElement;
  const idx = cell.cellIndex;
  const blank = () => { const c = document.createElement('td'); c.innerHTML = '<br>'; return c; };
  if (op === 'row-above' || op === 'row-below') {
    const nr = document.createElement('tr'); for (let i = 0; i < row.cells.length; i++) nr.appendChild(blank());
    row.parentElement!.insertBefore(nr, op === 'row-above' ? row : row.nextSibling);
  } else if (op === 'col-left' || op === 'col-right') {
    Array.from(table.rows).forEach((r) => r.insertBefore(blank(), op === 'col-left' ? r.cells[idx] : r.cells[idx + 1] ?? null));
  } else if (op === 'del-row') { if (table.rows.length > 1) row.remove(); else table.remove(); }
  else if (op === 'del-col') { if (row.cells.length > 1) Array.from(table.rows).forEach((r) => r.cells[idx]?.remove()); else table.remove(); }
  else if (op === 'del') table.remove();
  return true;
}

/* ───── find & replace (uses the CSS Custom Highlight API where the browser has it) ───── */
export type Hit = { node: Text; start: number; end: number };
export function findAll(ed: HTMLElement, term: string, matchCase: boolean): Hit[] {
  const hits: Hit[] = [];
  if (!term) return hits;
  const needle = matchCase ? term : term.toLowerCase();
  const w = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
  let n = w.nextNode() as Text | null;
  while (n) {
    const hay = matchCase ? n.data : n.data.toLowerCase();
    let i = hay.indexOf(needle);
    while (i !== -1) { hits.push({ node: n, start: i, end: i + needle.length }); i = hay.indexOf(needle, i + needle.length); }
    n = w.nextNode() as Text | null;
  }
  return hits;
}
type HighlightApi = { highlights?: Map<string, unknown> };
export function paintHits(hits: Hit[], current: number) {
  const css = (typeof CSS !== 'undefined' ? (CSS as unknown as HighlightApi) : {}) as HighlightApi;
  const H = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
  if (!css.highlights || !H) return;
  const mk = (h: Hit) => { const r = document.createRange(); r.setStart(h.node, h.start); r.setEnd(h.node, h.end); return r; };
  css.highlights.set('dx-find', new H(...hits.filter((_, i) => i !== current).map(mk)));
  css.highlights.set('dx-find-cur', new H(...(hits[current] ? [mk(hits[current])] : [])));
}
export function clearHits() {
  const css = (typeof CSS !== 'undefined' ? (CSS as unknown as HighlightApi) : {}) as HighlightApi;
  css.highlights?.delete('dx-find'); css.highlights?.delete('dx-find-cur');
}

/* ───── export ───── */
export function toMarkdown(root: HTMLElement): string {
  const walk = (n: Node): string => {
    if (n.nodeType === 3) return (n.textContent ?? '').replace(/ /g, ' ');
    if (n.nodeType !== 1) return '';
    const el = n as HTMLElement; const kids = () => Array.from(el.childNodes).map(walk).join('');
    switch (el.tagName.toLowerCase()) {
      case 'h1': return `# ${kids()}\n\n`; case 'h2': return `## ${kids()}\n\n`; case 'h3': return `### ${kids()}\n\n`;
      case 'b': case 'strong': return `**${kids()}**`; case 'i': case 'em': return `_${kids()}_`;
      case 'a': return `[${kids()}](${el.getAttribute('href') ?? ''})`;
      case 'li': return `${el.parentElement?.tagName === 'OL' ? '1.' : '-'} ${kids()}\n`;
      case 'ul': case 'ol': return `${kids()}\n`;
      case 'br': return '\n'; case 'hr': return '---\n\n'; case 'blockquote': return `> ${kids()}\n\n`;
      case 'tr': return `| ${Array.from(el.children).map((c) => (c.textContent ?? '').trim()).join(' | ')} |\n`;
      case 'table': return `${kids()}\n`;
      case 'p': case 'div': return `${kids()}\n\n`;
      default: return kids();
    }
  };
  return walk(root).replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

export function download(name: string, mime: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** A small deterministic QR-style pattern for the preview. The real QR comes from the Ifiok QR service. */
export function qrSvg(seed: string): string {
  let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const N = 25, cell = 4; let rects = '';
  // the three square "finder" corners, each 7x7 with a 1-cell quiet border
  const corner = (x: number, y: number): boolean | null => {
    const o = x < 8 && y < 8 ? [0, 0] : x >= N - 8 && y < 8 ? [N - 7, 0] : x < 8 && y >= N - 8 ? [0, N - 7] : null;
    if (!o) return null;
    const fx = x - o[0], fy = y - o[1];
    if (fx < 0 || fy < 0 || fx > 6 || fy > 6) return false;
    return fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
  };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let on = corner(x, y);
    if (on === null) { h = Math.imul(h ^ (x * 31 + y * 17 + 7), 2246822519); on = ((h >>> 13) & 3) === 0; }
    if (on) rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N * cell} ${N * cell}" width="96" height="96" fill="#15241F"><rect width="100%" height="100%" fill="#fff"/>${rects}</svg>`;
}

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
