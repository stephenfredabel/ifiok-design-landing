// node scripts/i18n-check-part.cjs <chunk.json> <translated.json>
// Checks that every key of the chunk is translated and that {placeholders} are kept exactly.
const fs = require('fs');
const [chunk, out] = process.argv.slice(2);
const src = JSON.parse(fs.readFileSync(chunk, 'utf8'));
let t;
try { t = JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { console.log('INVALID JSON:', e.message); process.exit(1); }
const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',');
let bad = 0;
for (const { key } of src) {
  const v = t[key];
  if (typeof v !== 'string' || !v.trim()) { console.log('MISSING', JSON.stringify(key)); bad++; continue; }
  if (ph(v) !== ph(key)) { console.log('PLACEHOLDERS', JSON.stringify(key), '->', JSON.stringify(v)); bad++; }
}
const extra = Object.keys(t).filter((k) => !src.some((s) => s.key === k));
if (extra.length) { console.log('UNKNOWN KEYS', extra.slice(0, 5)); bad += extra.length; }
console.log(bad ? `${bad} problem(s)` : `ok (${src.length} strings)`);
process.exit(bad ? 1 : 0);
