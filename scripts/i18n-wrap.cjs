// One-off codemod: wraps visible text in the design dashboard with tr("English source").
// Usage: node scripts/i18n-wrap.cjs <files...>   (idempotent: skips text already inside tr())
const ts = require('typescript');
const fs = require('fs');

const TEXT_KEYS = new Set(['label', 'name', 'sub', 'headline', 'note', 'blurb', 'title', 'edited', 'eta', 'item', 'warn', 'text', 'when', 'updated', 'submitted', 'decided', 'date', 'badge', 'desc', 'description', 'cat', 'group', 'size', 'closes', 'reviewTime', 'short', 'tagline', 'hint', 'printer']);
const ATTRS = new Set(['aria-label', 'title', 'placeholder', 'alt', 'label', 'text', 'hint', 'sub', 'desc', 'description', 'empty', 'heading', 'cta', 'eyebrow', 'tip']);
const SKIP_TAGS = new Set(['style', 'script', 'code', 'pre']);
const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", middot: '·', mdash: '—', ndash: '–', hellip: '…', copy: '©', times: '×', rarr: '→', larr: '←' };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e] ?? m));
const hasLetter = (s) => /[A-Za-zÀ-ɏ]/.test(s);

/** JSX whitespace rules. */
function jsxText(raw) {
  const lines = raw.split(/\r?\n/);
  let out = '';
  lines.forEach((ln, i) => {
    let t = ln.replace(/\t/g, ' ');
    if (i > 0) t = t.replace(/^ +/, '');
    if (i < lines.length - 1) t = t.replace(/ +$/, '');
    if (t) out += (out && i > 0 ? ' ' : '') + t;
  });
  return decode(out);
}

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const q = (s) => JSON.stringify(s);
  const insideTr = (n) => { for (let p = n.parent; p; p = p.parent) if (ts.isCallExpression(p) && p.expression.getText() === 'tr') return true; return false; };

  const isTextMember = (e) => ts.isPropertyAccessExpression(e) && TEXT_KEYS.has(e.name.text);
  const hasNested = (e) => { let bad = false; const v = (n) => { if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n) || ts.isStringLiteralLike(n) || ts.isTemplateExpression(n) || ts.isConditionalExpression(n) || (ts.isBinaryExpression(n) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(n.operatorToken.kind)) || ts.isArrowFunction(n)) bad = true; else ts.forEachChild(n, v); }; v(e); return bad; };
  const simple = (e) => !hasNested(e) && (ts.isIdentifier(e) || ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e) || ts.isCallExpression(e) || ts.isNumericLiteral(e) || ts.isParenthesizedExpression(e) || ts.isNonNullExpression(e) || ts.isBinaryExpression(e));
  const nameOf = (e, used) => {
    let base = ts.isIdentifier(e) ? e.text : ts.isPropertyAccessExpression(e) ? (e.name.text === 'length' && ts.isIdentifier(e.expression) ? e.expression.text + 'Count' : e.name.text) : ts.isCallExpression(e) ? (e.arguments.length && (ts.isIdentifier(e.arguments[0]) || ts.isPropertyAccessExpression(e.arguments[0])) ? (ts.isIdentifier(e.arguments[0]) ? e.arguments[0].text : e.arguments[0].name.text) : ts.isIdentifier(e.expression) ? e.expression.text : ts.isPropertyAccessExpression(e.expression) && ts.isPropertyAccessExpression(e.expression.expression) ? e.expression.expression.name.text : 'n') : 'n';
    base = base.replace(/[^A-Za-z0-9_]/g, '') || 'n';
    let n = base, i = 2;
    while (used.has(n)) n = base + i++;
    used.add(n);
    return n;
  };
  const exprText = (e) => (isTextMember(e) ? `tr(${e.getText()})` : e.getText());
  const varsObj = (vars) => `{ ${vars.map(([n, e]) => (e === n ? n : `${n}: ${e}`)).join(', ')} }`;
  const call = (key, vars) => `tr(${q(key)}${vars.length ? ', ' + varsObj(vars) : ''})`;

  const texty = (s) => hasLetter(s) && (/\s/.test(s.trim()) || /^[A-Z]/.test(s.trim())) && !/^(#|https?:|\/|--)/.test(s.trim());
  const base = require('path').basename(file);
  const inFunction = (n) => { for (let p = n.parent; p; p = p.parent) if (ts.isFunctionLike(p)) return true; return false; };
  function tplCall(e) {
    const used = new Set(); const vars = []; let key = e.head.text;
    for (const sp of e.templateSpans) { const nm = nameOf(sp.expression, used); key += `{${nm}}` + sp.literal.text; vars.push([nm, ts.isIdentifier(sp.expression) && sp.expression.text === nm ? nm : exprText(sp.expression)]); }
    return hasLetter(key.replace(/\{\w+\}/g, '')) ? call(key, vars) : null;
  }
  /** Wrap human text found in the branches of a conditional / && / || expression. */
  function wrapBranches(e) {
    if (ts.isParenthesizedExpression(e)) return wrapBranches(e.expression);
    if (ts.isConditionalExpression(e)) { wrapBranches(e.whenTrue); wrapBranches(e.whenFalse); return; }
    if (ts.isBinaryExpression(e)) { const k = e.operatorToken.kind; if (k === ts.SyntaxKind.AmpersandAmpersandToken) wrapBranches(e.right); else if (k === ts.SyntaxKind.BarBarToken || k === ts.SyntaxKind.QuestionQuestionToken) { wrapBranches(e.left); wrapBranches(e.right); } return; }
    if ((ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) && texty(e.text) && !insideTr(e)) edits.push([e.getStart(), e.getEnd(), call(e.text, [])]);
    else if (ts.isTemplateExpression(e) && !insideTr(e)) { const c = tplCall(e); if (c && texty(e.head.text + e.templateSpans.map((sp) => sp.literal.text).join('') + ' x')) edits.push([e.getStart(), e.getEnd(), c]); }
  }
  const D_KEYS = new Set([...TEXT_KEYS, 'msg']);
  const STORE_KEYS = new Set(['msg', 'label']);
  function runs(children, isJsxChild) {
    let cur = [];
    const flush = () => {
      if (cur.length) processRun(cur);
      cur = [];
    };
    for (const c of children) {
      if (ts.isJsxText(c)) cur.push(c);
      else if (ts.isJsxExpression(c) && (!c.expression || (simple(c.expression) || (ts.isStringLiteral(c.expression) && !hasLetter(c.expression.text)) || (ts.isStringLiteral(c.expression))))) { if (c.expression) cur.push(c); }
      else flush();
    }
    flush();
  }

  function processRun(run) {
    // Build the key.
    const used = new Set();
    const vars = [];
    let key = '';
    let first = null, last = null;
    let textLetters = false;
    // Offsets of the replaced range: from first non-space char of the first piece to the last non-space char of the last piece.
    const pieces = [];
    for (const c of run) {
      if (ts.isJsxText(c)) {
        const raw = src.slice(c.pos, c.end);
        const t = jsxText(raw);
        pieces.push({ n: c, t, text: true });
        if (hasLetter(t)) textLetters = true;
      } else if (ts.isStringLiteral(c.expression)) {
        pieces.push({ n: c, t: c.expression.text, text: true });
        if (hasLetter(c.expression.text)) textLetters = true;
      } else pieces.push({ n: c, expr: c.expression });
    }
    if (!textLetters) return;
    for (const p of pieces) {
      if (p.text) key += p.t;
      else {
        const nm = nameOf(p.expr, used);
        key += `{${nm}}`;
        vars.push([nm, ts.isIdentifier(p.expr) && p.expr.text === nm ? nm : exprText(p.expr)]);
      }
    }
    // Locate the replaced range.
    const firstP = pieces[0], lastP = pieces[pieces.length - 1];
    let start = firstP.n.getStart();
    let end = firstP.n === lastP.n ? firstP.n.getEnd() : lastP.n.getEnd();
    if (ts.isJsxText(firstP.n)) { const raw = src.slice(firstP.n.pos, firstP.n.end); start = firstP.n.pos + (raw.length - raw.trimStart().length); }
    if (ts.isJsxText(lastP.n)) { const raw = src.slice(lastP.n.pos, lastP.n.end); end = lastP.n.pos + raw.trimEnd().length; }
    // Keep &nbsp; spacing out of the key.
    while (src.startsWith('&nbsp;', start)) { start += 6; key = key.replace(/^\u00A0/, ''); }
    while (src.slice(0, end).endsWith('&nbsp;') && end - 6 > start) { end -= 6; key = key.replace(/\u00A0$/, ''); }
    // Leading/trailing spaces of the key already sit outside the range.
    key = key.replace(/^\s+|\s+$/g, (m) => (m.includes(' ') ? m : ''));
    if (!key) return;
    // skip when already wrapped
    if (run.some((c) => insideTr(c))) return;
    edits.push([start, end, `{${call(key, vars)}}`]);
  }

  function visit(n) {
    if ((ts.isJsxElement(n) && !SKIP_TAGS.has(n.openingElement.tagName.getText())) || ts.isJsxFragment(n)) runs(n.children);
    if (ts.isJsxAttribute(n) && n.initializer && ATTRS.has(n.name.getText()) && !insideTr(n)) {
      const init = n.initializer;
      if (ts.isStringLiteral(init) && hasLetter(init.text)) edits.push([init.getStart(), init.getEnd(), `{${call(decode(init.text), [])}}`]);
      else if (ts.isJsxExpression(init) && init.expression) {
        const e = init.expression;
        if ((ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) && hasLetter(e.text)) edits.push([e.getStart(), e.getEnd(), call(e.text, [])]);
        else if (ts.isTemplateExpression(e)) {
          const used = new Set(); const vars = []; let key = e.head.text;
          for (const sp of e.templateSpans) { const nm = nameOf(sp.expression, used); key += `{${nm}}` + sp.literal.text; vars.push([nm, ts.isIdentifier(sp.expression) && sp.expression.text === nm ? nm : exprText(sp.expression)]); }
          if (hasLetter(key.replace(/\{\w+\}/g, ''))) edits.push([e.getStart(), e.getEnd(), call(key, vars)]);
        } else if (isTextMember(e)) edits.push([e.getStart(), e.getEnd(), `tr(${e.getText()})`]);
      }
    }
    // conditional strings in JSX children
    if (ts.isJsxExpression(n) && n.expression && (ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent)) && !isTextMember(n.expression) && (ts.isConditionalExpression(n.expression) || ts.isBinaryExpression(n.expression))) wrapBranches(n.expression);
    if (ts.isJsxAttribute(n) && n.initializer && ts.isJsxExpression(n.initializer) && n.initializer.expression && ATTRS.has(n.name.getText()) && (ts.isConditionalExpression(n.initializer.expression) || ts.isBinaryExpression(n.initializer.expression))) wrapBranches(n.initializer.expression);
    // object props that carry text (toasts, palette rows, ...), only where they run at render/event time
    if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && (base === 'store.tsx' ? STORE_KEYS : D_KEYS).has(n.name.text) && inFunction(n) && !insideTr(n)) {
      const v = n.initializer;
      if ((ts.isStringLiteral(v) || ts.isNoSubstitutionTemplateLiteral(v)) && texty(v.text)) edits.push([v.getStart(), v.getEnd(), call(v.text, [])]);
      else if (ts.isTemplateExpression(v)) { const c = tplCall(v); if (c) edits.push([v.getStart(), v.getEnd(), c]); }
      else if (ts.isConditionalExpression(v)) wrapBranches(v);
    }
    // say("...") toasts
    if (ts.isCallExpression(n) && /(^|\.)say$/.test(n.expression.getText()) && n.arguments[0] && !insideTr(n)) wrapBranches(n.arguments[0]);
    // errors[x] = '...', errs.push('...'), setErr('...')
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && inFunction(n) && (ts.isPropertyAccessExpression(n.left) || ts.isElementAccessExpression(n.left)) && !insideTr(n)) wrapBranches(n.right);
    if (ts.isCallExpression(n) && /(^|\.)(setErr|setError|setNote|setMsg|push)$/.test(n.expression.getText()) && !insideTr(n)) n.arguments.forEach((a) => { if (!ts.isIdentifier(a)) wrapBranches(a); });
    // {x.label} as a lone child expression
    if (ts.isJsxExpression(n) && n.expression && isTextMember(n.expression) && (ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent)) && !insideTr(n)) {
      // only when not part of a handled run (a run with letters already rewrote it)
      edits.push([n.expression.getStart(), n.expression.getEnd(), `tr(${n.expression.getText()})`, 'member']);
    }
    ts.forEachChild(n, visit);
  }
  visit(sf);

  // Resolve overlaps: drop 'member' edits that sit inside a run edit.
  const full = edits.filter((e) => e[3] !== 'member');
  const kept = [...full];
  for (const e of edits.filter((x) => x[3] === 'member')) if (!full.some((f) => e[0] >= f[0] && e[1] <= f[1])) kept.push(e);
  // nested attr edits inside runs can't occur (attrs are on elements, which break runs).
  kept.sort((a, b) => b[0] - a[0]);
  let out = src;
  for (const [s, e, r] of kept) out = out.slice(0, s) + r + out.slice(e);
  if (kept.length && !/from '@\/i18n\/tr'/.test(out)) {
    const imports = [...out.matchAll(/^import[^;]*;\s*$/gm)];
    const at = imports.length ? imports[imports.length - 1].index + imports[imports.length - 1][0].length : 0;
    out = out.slice(0, at) + "\nimport { tr } from '@/i18n/tr';" + out.slice(at);
  }
  fs.writeFileSync(file, out);
  console.log(file, kept.length, 'edits');
}
