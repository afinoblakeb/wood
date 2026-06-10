# 🪚 Woodshop Plans

A simple, static HTML site that hosts detailed, printable woodworking project
plans — full cut lists, supply lists, dimensioned drawings, and step-by-step
instructions. It's plain HTML + CSS with no build step, so it renders on
**GitHub Pages** with zero friction.

## Live site

Once GitHub Pages is enabled (see below), the site is served from the repo root:

```
https://afinoblakeb.github.io/wood/
```

## Projects

| Project | Description |
| --- | --- |
| [Interactive 3D bench model](index.html) | A real-time Three.js model of the bench with assembled / exploded / individual-part views. Every board is a separately addressable mesh built from actual lumber sizes. |
| [3D model — 2×6 / 1×6 variant](bench-variant.html) | A copy of the model exploring wider lumber (2×6 armrests & seat slats, 1×6 back slats) with routed/eased edges. The original all‑2×4 design is unchanged. |
| [3D model — sloped + tree‑anchored site install](bench-site.html) | A copy for the real site: whole bench reclined 5° on a 4″ slope, front legs lengthened, and the bottom rails extended into "tails" that lag onto a tree behind the bench. |
| [Build-Day Guide — sloped tree bench](projects/build-day.html) | The authoritative build-day runbook for the on-site install: tonight checklist, cut list with protractor settings, fastener schedule for the exact kit, temp-framing / scribe-to-fit workflow, jigs, sequence, and finishing. |
| [Two-Seat A-Frame Bench — plan](projects/2x4-garden-bench.html) | The original flat-ground written plan. Superseded by the Build-Day Guide for the sloped/tree install. |
| [All plans (gallery)](plans.html) | Project gallery / landing page. |

## Structure

```
.
├── bench-site.html                  # Interactive 3D model — the active build (sloped/tree)
├── index.html / bench-variant.html  # Legacy flat-ground model + 2×6 variant
├── plans.html                       # Project gallery / landing page
├── projects/
│   ├── build-day.html               # Authoritative build-day guide (sloped install)
│   ├── 2x4-garden-bench.html        # Original flat-ground written plan
│   ├── bench-decisions.md           # Decision log (why each choice was made)
│   └── _template/                   # Scaffold for starting a new project
├── tools/                           # Model verification & generators (Node + Python)
│   ├── lib.mjs · emit.mjs           # Extract part data from a model without a browser
│   ├── cutlist.mjs · pack.mjs       # Cut list + lumber-buy, generated from the model
│   ├── hardware.mjs                 # Fastener shopping list
│   ├── interfere.py                 # Volumetric interference check (0 pairs required)
│   └── verify.mjs                   # Syntax + interference gate (used by CI)
├── .github/workflows/               # pages.yml (deploy, gated by verify) · verify.yml (PRs)
├── assets/css/style.css             # Shared site theme (print-friendly)
├── package.json                     # `npm run verify | cutlist | pack | hardware`
├── .nojekyll                        # Serve files as-is (no Jekyll processing)
└── README.md
```

## Tooling — the model is the single source of truth

Cut lists, lumber buys, and hardware lists are **generated from the model**, never
hand-copied (that's where drift bugs come from). With Node + Python 3:

```
npm run verify                 # syntax-check every model + 0-interference check
node tools/cutlist.mjs  bench-site.html
node tools/pack.mjs     bench-site.html      # boards-to-buy at 8/10/12/16 ft
node tools/hardware.mjs bench-site.html
```

**CI** runs `verify` on every push/PR and **before each Pages deploy**, so a model
with a syntax error or overlapping boards can't ship. The active build model is
gated strictly; the legacy flat-ground pages are reported but not yet gated.

### The 3D viewer (`index.html`)

A single, self-contained file — all CSS and JS are inline, and Three.js loads
from a CDN via an ES-module import map, so it deploys to GitHub Pages with no
build step. Key dimensions (overall W/H/D, seat height, backrest angle, slat
counts, and the actual lumber cross-sections) are parametrized as named
constants at the top of the script. Three render modes: **Assembled**,
**Exploded** (0–100% slider), and **Individual** (isolate any named board).
Click any board to read its name and dimensions.

## Enabling GitHub Pages

1. Go to the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose the `main` branch and the `/ (root)` folder, then **Save**.
4. Wait a minute for the first deploy, then visit the URL shown on that page.

The `.nojekyll` file tells GitHub Pages to serve the files exactly as they are
(no Jekyll build), which is all this plain HTML site needs.

## Conventions for plans

- **Actual lumber dimensions** are used throughout (a 2×4 is 1½" × 3½").
- Each plan includes a **cut list**, a **lumber & supply list**, **dimensioned
  drawings**, and **step-by-step instructions**.
- Pages are **print-friendly** — use the browser's Print command for a clean
  shop copy.

## Adding a new plan

Start from the scaffold in **`projects/_template/`** (see its `README.md`):

1. Copy the closest model (`bench-site.html`) to `<project>.html` and edit the
   parametric constants. Run `npm run verify` until it's interference-free.
2. Copy `projects/_template/plan.html` to `projects/<project>.html`; fill the cut
   list / lumber / hardware using `node tools/cutlist.mjs <project>.html` etc.
3. Copy `projects/_template/decisions.md` to `projects/<project>-decisions.md` and
   log choices as you go.
4. Add a card to `plans.html` and a row to the Projects table above.

## License

Personal project. Plans are provided as-is — always work safely and
double-check measurements for your own build. Measure twice, cut once.
