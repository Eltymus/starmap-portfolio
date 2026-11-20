# Changelog

All notable changes to this project are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## [Unreleased]

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

### Changed

- Astro 5 → 7 (Vite 8), which clears every `npm audit` advisory (sharp/libvips, zod, esbuild); Node 22.23.4 or later
  is now required.
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

[Unreleased]: https://github.com/Eltymus/starmap-portfolio/compare/4bef5f1...HEAD
[1.0.0]: https://github.com/Eltymus/starmap-portfolio/tree/4bef5f1
