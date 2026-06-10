// Shared helpers for the woodworking model tools.
// The viewers (index.html, bench-variant.html, bench-site.html) each embed a
// self-contained Three.js module whose geometry section builds a `partDefs`
// array (every board: name, lumber, dim, size|verts, pos, rotX). These tools
// extract that array WITHOUT a browser by slicing out the pure-geometry portion
// and eval'ing it against a tiny THREE stub.
import fs from 'fs';

// Minimal THREE stub — the geometry section only needs MathUtils.degToRad.
const THREE_STUB = { MathUtils: { degToRad: (d) => (d * Math.PI) / 180 } };

export function extractPartDefs(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const m = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`No <script type="module"> found in ${htmlPath}`);
  const mod = m[1];
  const start = mod.indexOf('const W =');
  if (start < 0) throw new Error(`Could not find geometry start ('const W =') in ${htmlPath}`);
  // End at the THREE.JS SCENE banner (geometry/partDefs are all built before it).
  const sceneAt = mod.indexOf('THREE.JS SCENE');
  const end = sceneAt > 0 ? mod.lastIndexOf('/*', sceneAt) : mod.length;
  const geo = mod.slice(start, end);
  // eslint-disable-next-line no-new-func
  const partDefs = new Function('THREE', geo + '\n;return partDefs;')(THREE_STUB);
  if (!Array.isArray(partDefs)) throw new Error('partDefs is not an array');
  return partDefs;
}

// Long-axis length of a board (inches). Angled parts carry `verts` (8 corners,
// 0-3 bottom / 4-7 top); box parts carry `size`.
export function lengthOf(p) {
  if (p.verts) {
    const mid = (idx) =>
      idx
        .reduce((a, i) => [a[0] + p.verts[i][0], a[1] + p.verts[i][1], a[2] + p.verts[i][2]], [0, 0, 0])
        .map((s) => s / 4);
    const b = mid([0, 1, 2, 3]);
    const t = mid([4, 5, 6, 7]);
    return Math.hypot(t[0] - b[0], t[1] - b[1], t[2] - b[2]);
  }
  return Math.max(...p.size);
}

// Base name with side/number stripped. The cut list further splits by length, so
// identical boards merge (e.g. all 3 backrest posts) while same-family-but-
// different-length parts stay separate (front legs vs the shorter center leg AC).
export function groupKey(name) {
  return name.replace(/-(left|right|center)$/, '').replace(/-\d+$/, '');
}
