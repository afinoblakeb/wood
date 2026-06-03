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
| [Two-Seat 2×4 Garden Bench](projects/2x4-garden-bench.html) | A sturdy outdoor bench built entirely from 2×4 lumber — 48" × 30½" × 36½". Cut list, supply list, drawings, and assembly steps. |

## Structure

```
.
├── index.html                       # Landing page / project gallery
├── projects/
│   └── 2x4-garden-bench.html        # Detailed plan for the bench
├── assets/
│   ├── css/style.css                # Shared site theme (print-friendly)
│   └── img/                         # Images (if any)
├── .nojekyll                        # Serve files as-is (no Jekyll processing)
└── README.md
```

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
