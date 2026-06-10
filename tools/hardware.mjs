#!/usr/bin/env node
// Hardware / fastener shopping list, derived from the model's part counts so it
// stays in sync when slat or post counts change.
// Usage: node tools/hardware.mjs [model.html]
import { extractPartDefs } from './lib.mjs';

const htmlPath = process.argv[2] || 'bench-site.html';
const P = extractPartDefs(htmlPath);
const count = (re) => P.filter((p) => re.test(p.name)).length;

const seatSlats = count(/^seat-slat/);
const backSlats = count(/^back-slat/);
const posts = count(/^backrest-/);
const sideFrames = 2; // left/right A-frames

// joint → { fastener, qty }
const schedule = [
  ['Seat rails → front & back leg', '2½″ pocket screw', sideFrames * 2 * 2],
  ['Bottom rails → front & back leg', '2½″ pocket screw', sideFrames * 2 * 2],
  ['Front beam J → bottom rails', '2½″ pocket screw', 2 * 2],
  ['Rear beam K → legs', '2½″ pocket screw', 2 * 2],
  ['Backrest posts → rear beam', '2½″ pocket screw', posts * 2],
  ['Center leg AC → beam J', '2½″ pocket screw', 2],
  ['Center rail EC → AC + center post', '2½″ pocket screw', 2 * 2],
  ['Armrests → leg tops + post', '2½″ pocket screw', sideFrames * 3],
  ['Seat slats → 3 rails', '2½″ pocket screw', seatSlats * 3],
  ['Back slats → posts', '2–2½″ exterior screw (straight)', Math.round(backSlats * 1.6)],
  ['Backrest post → rail → leg', '⅜″×7″ carriage bolt (SS/galv) + 2 fender washers + nyloc', 4],
  ['Tails → tree', '⅜″×4–5″ exterior lag (SS/galv) + washer', 4],
];

const totals = {};
for (const [, fastener, qty] of schedule) totals[fastener] = (totals[fastener] || 0) + qty;

console.log(`HARDWARE — ${htmlPath}\n`);
console.log('By joint:');
for (const [joint, fastener, qty] of schedule) console.log(`  ${String(qty).padStart(3)} × ${fastener.padEnd(48)} ${joint}`);

console.log('\nShopping list:');
for (const [fastener, qty] of Object.entries(totals)) {
  const buy = /pocket|exterior screw/.test(fastener) ? `  → buy ${Math.ceil((qty + 5) / 5) * 5} (some spares)` : '';
  console.log(`  ${String(qty).padStart(3)} × ${fastener}${buy}`);
}
console.log('\n  Plus: wood glue (frame joints only — NOT slats), pine plugs for the pocket holes.');
