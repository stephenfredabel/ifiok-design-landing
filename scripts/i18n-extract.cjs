// Builds translations/design/en.json: every English source string of the design dashboards, with where it is used.
//   node scripts/i18n-extract.cjs          -> writes translations/design/en.json
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMPONENT_FILES = [
  'src/components/design/DesignApp.tsx', 'src/components/design/views.tsx', 'src/components/design/overlays.tsx', 'src/components/design/parts.tsx', 'src/components/design/docsViews.tsx',
  'src/components/student/StudentView.tsx', 'src/components/student/store.tsx',
  'src/components/creator/dialogs.tsx', 'src/components/creator/parts.tsx', 'src/components/creator/store.tsx', 'src/components/creator/views.tsx',
  'src/components/fonts/FontStudio.tsx', 'src/components/fonts/FontsView.tsx', 'src/components/fonts/parts.tsx', 'src/components/AppsMenu.tsx', 'src/components/ThemeToggle.tsx', 'src/components/CreatorInvite.tsx', 'src/components/auth/AuthShell.tsx', 'src/components/auth/parts.tsx', 'src/components/auth/LoginForm.tsx', 'src/components/auth/SignupForm.tsx', 'src/components/LangMenu.tsx',
];
// Sample/seed data whose text is shown on screen. Only these keys carry words; ids, colours, urls and numbers are skipped.
const DATA_FILES = ['src/components/design/data.ts', 'src/data/student.ts', 'src/data/creator-app.ts', 'src/data/fonts.ts', 'src/data/apps.ts'];
const TEXT_KEYS = new Set(['label', 'name', 'sub', 'headline', 'note', 'blurb', 'title', 'edited', 'eta', 'item', 'warn', 'text', 'when', 'updated', 'submitted', 'decided', 'date', 'badge', 'desc', 'description', 'cat', 'group', 'size', 'closes', 'reviewTime', 'short', 'tagline', 'hint', 'l', 'printer']);
// Named constants whose string contents are all shown to people.
const TEXT_CONSTS = new Set(['TEMPLATE_CATS', 'GROUPS', 'FONT_CATS', 'FONT_TAGS', 'LEVELS', 'STYLES', 'STEPS', 'STATUS']);
// Constants in data/creators.ts that the dashboards display.
const CREATORS_CONSTS = new Set(['STANDARDS', 'FAQ']);
// Never translate: brands, people and places in sample data, family names, bank names.
const SKIP_VALUES = new Set(['Ifiok', 'S', 'M', 'L']);
const hasLetter = (s) => /[A-Za-zÀ-ɏ]/.test(s);
const texty = (s) => hasLetter(s) && !/^(#|https?:|\/|--|ifiok\.|[a-z]+-[a-z0-9-]+$|[a-z]+$)/.test(s.trim());

const out = new Map(); // key -> Set(files)
const add = (key, file, line, forced = false) => {
  if (!key || !hasLetter(key) || (!forced && !texty(key)) || SKIP_VALUES.has(key)) return;
  if (!out.has(key)) out.set(key, new Set());
  out.get(key).add(`${file}:${line}`);
};
const litText = (n) => (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) ? n.text : null);
const tplKey = (e) => e.head.text + e.templateSpans.map((sp) => `{${sp.expression.getText()}}` + sp.literal.text).join('');

function scan(file, mode) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  const fromExpr = (e, forced) => {
    if (!e) return;
    if (ts.isConditionalExpression(e)) { fromExpr(e.whenTrue, forced); fromExpr(e.whenFalse, forced); return; }
    const t = litText(e); if (t != null) add(t, file, line(e), forced);
  };
  const allStrings = (n) => { const v = (c) => { const t = litText(c); if (t != null) add(t, file, line(c)); ts.forEachChild(c, v); }; v(n); };
  const visit = (n) => {
    // tr("...") and tr(cond ? "a" : "b")
    if (ts.isCallExpression(n) && n.expression.getText() === 'tr' && n.arguments[0]) fromExpr(n.arguments[0], true);
    if (mode !== 'creators' && ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && TEXT_KEYS.has(n.name.text)) { const t = litText(n.initializer); if (t != null) add(t, file, line(n)); }
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const nm = n.name.text;
      if (TEXT_CONSTS.has(nm) || (mode === 'creators' && CREATORS_CONSTS.has(nm))) {
        // STATUS-like maps: keys are ids, only values are text
        if (ts.isObjectLiteralExpression(n.initializer)) n.initializer.properties.forEach((p) => ts.isPropertyAssignment(p) && allStrings(p.initializer)); else allStrings(n.initializer);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
COMPONENT_FILES.forEach((f) => scan(f, 'component'));
DATA_FILES.forEach((f) => scan(f, 'data'));
scan('src/data/creators.ts', 'creators');

const entries = [...out.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, where]) => ({ key, where: [...where].slice(0, 3) }));
fs.mkdirSync(path.join(ROOT, 'translations/design'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'translations/design/en.json'), JSON.stringify(entries, null, 1) + '\n');
console.log(entries.length, 'strings');
