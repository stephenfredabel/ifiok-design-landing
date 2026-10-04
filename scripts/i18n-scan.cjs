// Lists every string literal / JSX text in the design-dashboard source with its syntactic context.
const ts = require('typescript');
const fs = require('fs');
const files = process.argv.slice(2);
const hasLetter = (s) => /[A-Za-zÀ-ɏ]/.test(s);
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out = [];
  const ctx = (n) => {
    const p = n.parent;
    if (!p) return '';
    if (ts.isJsxAttribute(p)) return 'attr:' + p.name.getText();
    if (ts.isJsxExpression(p) && p.parent && ts.isJsxAttribute(p.parent)) return 'attr:' + p.parent.name.getText();
    if (ts.isPropertyAssignment(p)) return 'prop:' + p.name.getText();
    if (ts.isCallExpression(p)) return 'arg:' + p.expression.getText().slice(0, 30);
    if (ts.isBinaryExpression(p)) return 'bin:' + p.operatorToken.getText();
    if (ts.isConditionalExpression(p)) return 'cond';
    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) return 'import';
    if (ts.isCaseClause(p)) return 'case';
    if (ts.isArrayLiteralExpression(p)) return 'array';
    if (ts.isVariableDeclaration(p)) return 'var:' + p.name.getText();
    if (ts.isTemplateSpan(p)) return 'tpl';
    return ts.SyntaxKind[p.kind];
  };
  const visit = (n) => {
    if (ts.isImportDeclaration(n) || ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n)) return;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) {
      const t = n.getText().slice(1, -1);
      if (hasLetter(t)) out.push([sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, ctx(n), t.slice(0, 90)]);
    }
    if (ts.isJsxText(n) && hasLetter(n.getText())) out.push([sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, 'jsxtext', n.getText().trim().replace(/\s+/g, ' ').slice(0, 90)]);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  console.log('## ' + f + ' (' + out.length + ')');
  for (const o of out) console.log(o.join(' | '));
}
