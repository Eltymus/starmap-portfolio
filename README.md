# Starmap portfolio

Personal portfolio of **Lorenzo Tripodi** — a gold-on-navy star map in Three.js. Every section draws a constellation; each star holds a note, and "Open the chart" shows the full details.

Built with [Astro](https://astro.build) (static output), [Tailwind CSS v4](https://tailwindcss.com) and [Three.js](https://threejs.org). Deployed for free on GitHub Pages.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321/starmap-portfolio/
npm run build      # static site in dist/
npm run preview
```

## Where things live

| Path | What |
| --- | --- |
| `src/data/chapters.js` | All content, one object per chapter: name, subtitle, star notes, chart-sheet page, constellation geometry and layout tweaks |
| `src/pages/index.astro` | The page: the text of every section, composed from components |
| `src/components/` | Reusable Astro pieces: `Chapter` (section + card), `Button`, `Link`, `Chips`, `StackList`, `Timeline`, dialogs, moon nav, header… |
| `src/layouts/Base.astro` | `<head>`, fonts (self-hosted via Fontsource) |
| `src/lib/` | Shared helpers: asset URLs, math, colour palette and canvas fonts |
| `src/scripts/starmap.js` | Entry point that wires the UI and the 3D scene together |
| `src/scripts/ui/` | Navigation, chart sheet, full map, star tooltip, keyboard, shared dialog behaviour |
| `src/scripts/scene/` | Three.js: renderer loop, sky, star shader, constellations, shooting star, textures |
| `src/scripts/art/` | Canvas engravings: drawing primitives, the engraving and decorations of each chapter |
| `src/styles/` | One CSS file per component, imported in order by `global.css`; colours, fonts and easings live in `tokens.css` |
| `public/img/` | Gold engravings behind the constellations and the portrait |

### Common edits

- **Change a colour or font**: `src/styles/tokens.css` (CSS) and `src/lib/theme.js` (canvas / SVG drawn in JS).
- **Change a section's text**: `src/pages/index.astro`.
- **Change a chart sheet, star notes or a constellation**: the chapter's object in `src/data/chapters.js`.
- **Change a chapter's engraving**: the function with the chapter `id` in `src/scripts/art/engravings.js` and `decorations.js`.

## Deploy (GitHub Pages)

1. Push to the `main` branch of `github.com/<user>/starmap-portfolio`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes to `https://<user>.github.io/starmap-portfolio/`.

If the GitHub username or repo name changes, update `site` and `base` in `astro.config.mjs`.

## Image credits

Engravings are public domain, traced in gold: Mole Antonelliana (image provided by the author), Leonardo da Vinci's icosahedron (Pacioli, *De divina proportione*, 1509), grapes (*The Cultivation of the Native Grape*, 1868), stair (*Stair-Building*), open book (Nodier, *The Bibliomaniac*, 1894), bird with letter (chapbook *History of Birds*, c. 1830); the 90s computer is an Openclipart drawing (public domain).
