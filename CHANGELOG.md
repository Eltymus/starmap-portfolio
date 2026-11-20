# Changelog

All notable changes to this project are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## [Unreleased]

### Changed

- The line drawings around the constellations are now public-domain engravings in gold, in the style of the
  constellations themselves: Monviso, Superga and the Po bridge for Turin; barrel and corkscrew for Siply; books, quill
  and bookplate for Book Relay; beer stein, flask and dragon for TavernVTT; telescope and laurel wreath for The climb.
  Saturn in the sky is an engraving too. The 15 images (`public/img/decor/`) weigh 242 kB in all.

### Removed

- The ecliptic: the gold line with tick marks that crossed the sky and the constellations (also gone from the static
  sky used without WebGL).

### Fixed

- `npm run og-image` works again: the page's Content-Security-Policy blocked the overlay the script injects.

## [1.1.1] - 2026-11-20

### Changed

- The 3D sky starts in short tasks instead of one long one: the browser gets the main thread back between steps,
  shaders compile in parallel before the first frame (`compileAsync`), and the engravings are drawn one chapter at a
  time. On the same build, Lighthouse's mobile Total Blocking Time drops from about 2.5 s to 1.7 s and Time to
  Interactive from 6.5 s to 4.9 s; the sky looks the same.

## [1.1.0] - 2026-11-20

### Added

- Share cards: canonical URL, Open Graph and Twitter `summary_large_image` tags, and a 1200×630 share image drawn from the
  real sky (`npm run og-image`).
- Structured data: a schema.org `Person` (name, role, Turin, GitHub and LinkedIn) in JSON-LD.
- Sitemap (`@astrojs/sitemap`) and `robots.txt`.
- A themed 404 page, "Uncharted sky", with its own end-to-end, accessibility and screenshot tests.
- Content-Security-Policy as a `<meta>` tag, with a test that fails on any violation.
- A static sky (`public/img/static-sky.webp`, `npm run static-sky`) shown when WebGL is unavailable or its context is
  lost; the page keeps working and the intro closes.
- Dependabot for npm and GitHub Actions, `engines` and `.nvmrc` pinned to Node 22.
- MIT license for the source code, this changelog.
- README opening with the live link, screenshots, highlights and Lighthouse scores; an architecture overview in
  `docs/architecture.md`.

### Changed

- Astro 5 → 7 (Vite 8), which clears every `npm audit` advisory (sharp/libvips, zod, esbuild); Node 22.23.4 or later
  is now required.
- TypeScript 5.9 → 6.0.
- ESLint 10, eslint-plugin-astro and astro-eslint-parser 3, Stylelint 18; GitHub Actions on their current majors.
- three.js 0.128 → 0.187, with colour management kept off so the palette renders as before.
- The 3D scene loads with a dynamic `import()`: the page script drops to 38 kB and the text no longer waits for
  three.js.
- Engravings are lossless WebP instead of PNG (708 kB → 374 kB); the two main font faces are preloaded.
- URLs always end with a slash (`trailingSlash: 'always'`), as GitHub Pages serves them.

### Removed

- Tailwind CSS, which no style used.

### Fixed

- The 3D sky stayed empty when WebGL was missing: the check `!THREE.WebGLRenderer` could never fail.
- The chart sheet could scroll inside its frame when a footer button was focused while it opened (also the cause of an
  intermittent screenshot test failure).
- External links now use `rel="noopener noreferrer"`.

## [1.0.0] - 2026-11-19

### Added

- The star map: an Astro site with a Three.js sky where each chapter draws a constellation over a gold engraving; star
  notes on hover, a chart sheet per chapter, a full map and a moon navigation.
- Linting (ESLint, Stylelint, Prettier), strict TypeScript, unit tests (Vitest), end-to-end and screenshot tests
  (Playwright) and a CI pipeline that deploys to GitHub Pages only when everything passes.
- Accessibility: native `<dialog>` elements, star notes readable by keyboard and screen readers, reduced-motion
  support and axe-core scans.

[Unreleased]: https://github.com/Eltymus/starmap-portfolio/compare/v1.1.1...HEAD
[1.1.1]: https://github.com/Eltymus/starmap-portfolio/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Eltymus/starmap-portfolio/compare/4bef5f1...v1.1.0
[1.0.0]: https://github.com/Eltymus/starmap-portfolio/tree/4bef5f1
