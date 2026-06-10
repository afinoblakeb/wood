# New project scaffold

Copy this folder to start a new woodworking project, then:

1. **Model** — copy the closest existing viewer (`bench-site.html` is the most
   evolved) to `<project>.html` at the repo root. Edit the parametric constants at
   the top of the `<script type="module">` block. Keep all dimensions as named
   constants in inches; use *actual* lumber sizes (2×4 = 1½″×3½″).
2. **Plan** — copy `plan.html` here to `projects/<project>.html` and fill it in.
   Generate the cut list / lumber / hardware from the model rather than typing
   numbers:
   ```
   node tools/cutlist.mjs  <project>.html
   node tools/pack.mjs     <project>.html
   node tools/hardware.mjs <project>.html
   ```
3. **Decisions** — copy `decisions.md` here to `projects/<project>-decisions.md`
   and log choices as you make them (see `projects/bench-decisions.md`).
4. **Verify** — `npm run verify` (or add the model to `GATED` in
   `tools/verify.mjs` once it's interference-free). CI runs this on every push and
   blocks the deploy if a model has a syntax error or overlapping boards.
5. **Wire it up** — add a card to `plans.html` and a row to `README.md`.

## Conventions
- One self-contained HTML file per model (inline CSS/JS, Three.js via importmap) so
  it deploys to GitHub Pages with no build step.
- Cut lists, lumber buys, and hardware lists are **generated from the model** —
  never hand-copied (that's where every drift bug came from).
- Site/ground/tree-dependent cuts are left long and scribed on site; the model
  documents intent, the dry-fit sets the final.
