#!/usr/bin/env node
// Lumber-buy calculator: bin-pack the cuts into boards of a given stock length.
// Usage: node tools/pack.mjs [model.html] [--stock=120] [--kerf=0.5]
import { extractPartDefs, lengthOf } from './lib.mjs';

const args = process.argv.slice(2);
const htmlPath = args.find((a) => !a.startsWith('--')) || 'bench-site.html';
const stockArg = args.find((a) => a.startsWith('--stock='));
const kerfArg = args.find((a) => a.startsWith('--kerf='));
const kerf = kerfArg ? +kerfArg.split('=')[1] : 0.5;
const stocks = stockArg ? [+stockArg.split('=')[1]] : [96, 120, 144, 192]; // 8/10/12/16 ft

const partDefs = extractPartDefs(htmlPath);

// First-fit-decreasing pack, per lumber type.
function pack(cuts, stock) {
  const bins = [];
  for (const c of [...cuts].sort((a, b) => b - a)) {
    let placed = false;
    for (const b of bins) {
      if (b.rem >= c) { b.rem -= c; b.cuts.push(c); placed = true; break; }
    }
    if (!placed) bins.push({ rem: stock - c, cuts: [c] });
  }
  return bins;
}

const byType = {};
for (const p of partDefs) {
  const t = p.lumber || '2x4';
  (byType[t] = byType[t] || []).push(Math.ceil(lengthOf(p)) + kerf);
}

console.log(`LUMBER BUY — ${htmlPath}  (kerf+squareup ${kerf}" per cut)\n`);
for (const [type, cuts] of Object.entries(byType)) {
  const net = cuts.reduce((a, c) => a + c, 0);
  console.log(`${type}: ${cuts.length} cuts, ${(net / 12).toFixed(1)} net ft`);
  for (const stock of stocks) {
    if (cuts.some((c) => c > stock)) { console.log(`   ${stock / 12}ft: a cut exceeds this stock`); continue; }
    const bins = pack(cuts, stock);
    const waste = (100 * (1 - net / (bins.length * stock))).toFixed(0);
    console.log(`   ${String(stock / 12).padStart(2)}ft boards: ${bins.length}  (${waste}% waste)`);
  }
  console.log();
}
