#!/usr/bin/env node
// Cut list straight from the model — the single source of truth for lengths.
// Usage: node tools/cutlist.mjs [model.html] [--json]
import { extractPartDefs, lengthOf, groupKey } from './lib.mjs';

const args = process.argv.slice(2);
const htmlPath = args.find((a) => !a.startsWith('--')) || 'bench-site.html';
const asJson = args.includes('--json');

const partDefs = extractPartDefs(htmlPath);

// Collapse mirror/numbered parts into one row, capturing the max length seen.
const groups = new Map();
for (const p of partDefs) {
  const len = lengthOf(p);
  const key = groupKey(p.name) + '@' + len.toFixed(1); // split families by length
  const label = p.label.replace(/\s*\(.*?\)\s*$/, '').replace(/\s+\d+$/, '');
  const g = groups.get(key) || { key, label, lumber: p.lumber, qty: 0, len: 0, note: '' };
  g.qty += 1;
  g.len = Math.max(g.len, len);
  // keep any angle/cut note from the dim string (text after the lumber size)
  const note = (p.dim || '').replace(/^\d+×\d+\s*·\s*[\d.]+″?\s*/, '').trim();
  if (note && !g.note) g.note = note;
  groups.set(key, g);
}

const rows = [...groups.values()];
let total = { '2x4': 0, '2x6': 0 };
for (const r of rows) total[r.lumber] = (total[r.lumber] || 0) + r.len * r.qty;

if (asJson) {
  process.stdout.write(JSON.stringify({ model: htmlPath, rows, totalsFt: Object.fromEntries(Object.entries(total).map(([k, v]) => [k, +(v / 12).toFixed(1)])) }, null, 2));
  process.exit(0);
}

const pad = (s, n) => String(s).padEnd(n);
console.log(`CUT LIST — ${htmlPath}  (${partDefs.length} parts)\n`);
console.log(pad('Part', 26), pad('Qty', 4), pad('Lumber', 7), pad('Length', 8), 'Cut / notes');
console.log('-'.repeat(92));
for (const r of rows) {
  console.log(pad(r.label, 26), pad('×' + r.qty, 4), pad(r.lumber, 7), pad(r.len.toFixed(1) + '"', 8), r.note);
}
console.log('-'.repeat(92));
for (const [k, v] of Object.entries(total)) if (v) console.log(`${k} total: ${(v / 12).toFixed(1)} linear ft`);
