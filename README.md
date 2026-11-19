# Starmap portfolio

Personal portfolio of **Lorenzo Tripodi** — a gold-on-navy star map in Three.js. Every section draws a constellation; each star holds a note, and "Open the chart" shows the full details.

Built with [Astro](https://astro.build) (static output), strict TypeScript, plain CSS and [Three.js](https://threejs.org). Deployed for free on GitHub Pages.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321/starmap-portfolio/
npm run build      # static site in dist/
npm run preview
```

## Quality checks

| Command                  | What it does                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `npm run lint`           | ESLint (JS/TS/Astro), Stylelint (CSS) and a Prettier format check                                |
| `npm run format`         | Rewrites every file in the house style (Prettier)                                                |
| `npm run check`          | Type-checks the whole project with `astro check`                                                 |
| `npm test`               | Unit tests (Vitest) for the pure logic: pen trails, maths, sky coordinates, chapter data         |
| `npm run test:e2e`       | End-to-end tests (Playwright) against the built site: navigation, dialogs, keyboard, screenshots |
| `npm run test:e2e:linux` | The same suite inside the Linux container used by CI (needs Docker)                              |
| `npm run verify`         | Everything above, in the order CI runs it                                                        |
| `npm run og-image`       | Redraws `public/og-image.jpg`, the 1200×630 share image, from the built site (run after a build) |

Screenshot baselines live in `tests/e2e/__screenshots__/`, one set per platform. CI compares against the Linux set; after an intentional visual change, refresh it with `npm run build && npm run test:e2e:linux -- --update-snapshots` (and `npm run test:e2e:update` for the local set).

## Accessibility

- The chart sheet and the full map are native `<dialog>` elements opened with `showModal()`: the page behind is inert, Escape closes them and focus returns to the control that opened them.
- Every star note shown on hover is also listed under **The stars** at the end of each chart sheet, for keyboard and screen reader users.
- With `prefers-reduced-motion`, scrolling is instant, CSS animations stop, and the 3D sky stops twinkling: constellations appear already drawn, without sparks or shooting stars.
- An axe-core scan of the page and of both dialogs runs in the end-to-end suite.

## Where things live

| Path                     | What                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/chapters.ts`   | All content, one object per chapter: name, subtitle, star notes, chart-sheet page, constellation geometry and layout tweaks       |
| `src/data/types.ts`      | Types of the content (`Chapter`, `Sheet`, `Figure`): a misspelt or missing field fails the build                                  |
| `src/pages/index.astro`  | The page: the text of every section, composed from components                                                                     |
| `src/components/`        | Reusable Astro pieces: `Chapter` (section + card), `Button`, `Link`, `Chips`, `StackList`, `Timeline`, dialogs, moon nav, header… |
| `src/layouts/Base.astro` | `<head>`: fonts (self-hosted via Fontsource), canonical URL, Open Graph / Twitter cards, JSON-LD `Person`                         |
| `src/pages/404.astro`    | The "uncharted sky" page GitHub Pages serves for any missing address                                                              |
| `src/lib/`               | Shared helpers: asset URLs, math, colour palette and canvas fonts                                                                 |
| `src/scripts/starmap.ts` | Entry point that wires the UI and the 3D scene together                                                                           |
| `src/scripts/ui/`        | Navigation, chart sheet, full map, star tooltip, keyboard, shared dialog behaviour                                                |
| `src/scripts/scene/`     | Three.js: renderer loop, sky, star shader, constellations, shooting star, textures                                                |
| `src/scripts/art/`       | Canvas engravings: drawing primitives, the engraving and decorations of each chapter                                              |
| `src/styles/`            | One CSS file per component, imported in order by `global.css`; colours, fonts and easings live in `tokens.css`                    |
| `public/img/`            | Gold engravings behind the constellations and the portrait                                                                        |

### Common edits

- **Change a colour or font**: `src/styles/tokens.css` (CSS) and `src/lib/theme.ts` (canvas / SVG drawn in JS).
- **Change a section's text**: `src/pages/index.astro`.
- **Change a chart sheet, star notes or a constellation**: the chapter's object in `src/data/chapters.ts`.
- **Change a chapter's engraving**: the function with the chapter `id` in `src/scripts/art/engravings.ts` and `decorations.ts`.

## Search and sharing

- Every page has a canonical URL, Open Graph and Twitter card tags; the share image is `public/og-image.jpg`.
- The home page describes the author as a schema.org `Person` (name, role, city, GitHub and LinkedIn from `src/data/chapters.ts`).
- `@astrojs/sitemap` writes `sitemap-index.xml` at build time; `public/robots.txt` points to it. On a project site
  (`<user>.github.io/<repo>/`) crawlers only read the `robots.txt` at the domain root, so the sitemap is also linked from
  `<head>` and can be submitted in Google Search Console.

## Security

- GitHub Pages cannot send custom headers, so the Content-Security-Policy is a `<meta>` tag, built from `src/lib/csp.ts`
  and added to production builds only (the dev server needs inline scripts). It allows scripts, stylesheets and fonts from
  the site itself, `data:` images (the chart-sheet engravings) and inline style attributes. `frame-ancestors` cannot be
  set from a meta tag.
- An end-to-end test uses the whole site (WebGL sky, chart sheet, full map, 404) and fails on any CSP violation.

## Deploy (GitHub Pages)

1. Push to the `main` branch of `github.com/<user>/starmap-portfolio`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The workflow in `.github/workflows/ci.yml` runs lint, type check, unit and end-to-end tests on every push and pull request; on `main`, only when they all pass, it builds and publishes to `https://<user>.github.io/starmap-portfolio/`.

If the GitHub username or repo name changes, update `site` and `base` in `astro.config.mjs`.

## Image credits

Engravings are public domain, traced in gold: Mole Antonelliana (image provided by the author), Leonardo da Vinci's icosahedron (Pacioli, _De divina proportione_, 1509), grapes (_The Cultivation of the Native Grape_, 1868), stair (_Stair-Building_), open book (Nodier, _The Bibliomaniac_, 1894), bird with letter (chapbook _History of Birds_, c. 1830); the 90s computer is an Openclipart drawing (public domain).
