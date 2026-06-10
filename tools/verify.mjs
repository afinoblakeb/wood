#!/usr/bin/env node
// Verify every model page: JS syntax-check the embedded module + 0 interferences.
// Usage: node tools/verify.mjs            (checks all model pages)
//        node tools/verify.mjs a.html ... (checks the given pages)
// Exits non-zero if any check fails — used by CI.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { extractPartDefs } from './lib.mjs';

const DEFAULT_MODELS = ['index.html', 'bench-variant.html', 'bench-site.html'];
// Models whose failures FAIL the build. The legacy flat-ground pages
// (index/bench-variant) have known pre-existing overlaps pending convergence
// onto the shared core, so they're reported but don't gate CI yet.
const GATED = new Set(['bench-site.html']);
const explicit = process.argv.slice(2);
const models = (explicit.length ? explicit : DEFAULT_MODELS).filter((f) =>
  fs.existsSync(f) && /<script type="module">/.test(fs.readFileSync(f, 'utf8'))
);

let failed = 0; // gated failures only
let warned = 0; // non-gated (legacy) failures
const isGated = (m) => explicit.length > 0 || GATED.has(m);
const mark = (m) => { if (isGated(m)) failed++; else warned++; };
for (const model of models) {
  const html = fs.readFileSync(model, 'utf8');
  const mod = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];

  // 1) JS syntax check the embedded module
  const tmpJs = path.join(os.tmpdir(), `verify-${path.basename(model)}.mjs`);
  fs.writeFileSync(tmpJs, mod);
  const chk = spawnSync('node', ['--check', tmpJs], { encoding: 'utf8' });
  if (chk.status !== 0) {
    console.log(`✗ ${model}: SYNTAX ERROR\n${chk.stderr}`);
    mark(model);
    continue;
  }

  // 2) Extract parts + interference check
  let parts;
  try {
    parts = extractPartDefs(model);
  } catch (e) {
    console.log(`✗ ${model}: could not extract parts — ${e.message}`);
    mark(model);
    continue;
  }
  const tmpJson = path.join(os.tmpdir(), `verify-${path.basename(model)}.json`);
  fs.writeFileSync(tmpJson, JSON.stringify(parts));
  const intf = spawnSync('python3', [path.join('tools', 'interfere.py'), tmpJson], { encoding: 'utf8' });
  const pairs = (intf.stdout.match(/total interfering pairs:\s*(\d+)/) || [])[1] ?? '?';
  if (intf.status !== 0) {
    console.log(`✗ ${model}: ${parts.length} parts, ${pairs} INTERFERENCES`);
    console.log(intf.stdout.split('\n').filter((l) => l.includes('<->')).map((l) => '   ' + l.trim()).join('\n'));
    mark(model);
    continue;
  }
  console.log(`✓ ${model}: syntax OK, ${parts.length} parts, 0 interferences`);
}

if (warned) console.log(`\n(${warned} legacy model(s) have known issues — not gating CI)`);
console.log(failed ? `\n${failed} gated model(s) FAILED` : `\nAll gated model(s) passed`);
process.exit(failed ? 1 : 0);
