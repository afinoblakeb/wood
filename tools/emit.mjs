#!/usr/bin/env node
// Extract a viewer's part definitions to JSON (for the other tools / CI).
// Usage: node tools/emit.mjs <model.html> [out.json]
import fs from 'fs';
import { extractPartDefs } from './lib.mjs';

const [, , htmlPath = 'bench-site.html', outPath] = process.argv;
const partDefs = extractPartDefs(htmlPath);
const json = JSON.stringify(partDefs, null, 0);
if (outPath) {
  fs.writeFileSync(outPath, json);
  console.error(`${partDefs.length} parts → ${outPath}`);
} else {
  process.stdout.write(json);
}
