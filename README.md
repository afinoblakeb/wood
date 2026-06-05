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
| [Two-Seat A-Frame Bench — plan](projects/2x4-garden-bench.html) | The written build plan, synced to the model: cut list with angle cuts, fastener schedule, supply list, and step-by-step assembly. |
| [All plans (gallery)](plans.html) | Project gallery / landing page. |

## Structure

```
.
├── index.html                       # Interactive 3D bench viewer (Three.js, self-contained)
├── plans.html                       # Project gallery / landing page
├── projects/
│   └── 2x4-garden-bench.html        # Detailed written plan for the bench
├── assets/
│   ├── css/style.css                # Shared site theme (print-friendly)
│   └── img/                         # Images (if any)
├── .nojekyll                        # Serve files as-is (no Jekyll processing)
└── README.md
```

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

1. Copy `projects/2x4-garden-bench.html` as a starting template.
2. Update the drawings, cut list, supply list, and steps.
3. Add a new `<article class="card">` to the gallery in `index.html`.
4. Add a row to the Projects table above.

## License

Personal project. Plans are provided as-is — always work safely and
double-check measurements for your own build. Measure twice, cut once.
