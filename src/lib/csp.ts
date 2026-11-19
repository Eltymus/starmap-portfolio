/**
 * Content-Security-Policy, sent as a <meta> tag because GitHub Pages cannot set response headers.
 * (A meta policy cannot use frame-ancestors, report-uri or sandbox: those need a real header.)
 *
 * - Scripts: only the bundled modules from this origin. The JSON-LD block is data, not script.
 * - Styles: stylesheets from this origin (no inline <style>: astro.config sets inlineStylesheets
 *   to 'never'); inline style *attributes* stay allowed for the staggered transition delays.
 * - Images: this origin plus data: URLs (chart-sheet engravings rendered from canvas, CSS noise).
 * - WebGL needs no directive: the sky draws to a canvas and loads nothing.
 */
export const CSP_DIRECTIVES: Readonly<Record<string, readonly string[]>> = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  // Fallback for browsers without the -elem / -attr split.
  'style-src': ["'self'", "'unsafe-inline'"],
  'style-src-elem': ["'self'"],
  'style-src-attr': ["'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'none'"]
};

export const CONTENT_SECURITY_POLICY = Object.entries(CSP_DIRECTIVES)
  .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
  .join('; ');
