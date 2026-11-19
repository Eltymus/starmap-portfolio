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
| `src/data/constellations.js` | All content: constellation names, star notes (`FACTS`), chart pages (`PAGES`), geometry (`DEF`) |
| `src/scripts/starmap.js` | The 3D star map: sky, drawing animation, art plates, chart modal, full map |
| `src/pages/index.astro` | Page markup (sections, panels, modals) |
| `src/layouts/Base.astro` | `<head>`, fonts (self-hosted via Fontsource) |
| `src/styles/global.css` | Star Map styles; Tailwind utilities are available for new markup |
| `public/img/` | Gold engravings behind the constellations and the portrait |

## Deploy (GitHub Pages)

1. Push to the `main` branch of `github.com/<user>/starmap-portfolio`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes to `https://<user>.github.io/starmap-portfolio/`.

If the GitHub username or repo name changes, update `site` and `base` in `astro.config.mjs`.

## Image credits

Engravings are public domain, traced in gold: Mole Antonelliana (image provided by the author), Leonardo da Vinci's icosahedron (Pacioli, *De divina proportione*, 1509), grapes (*The Cultivation of the Native Grape*, 1868), stair (*Stair-Building*), open book (Nodier, *The Bibliomaniac*, 1894), bird with letter (chapbook *History of Birds*, c. 1830); the 90s computer is an Openclipart drawing (public domain).
