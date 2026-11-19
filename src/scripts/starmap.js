import * as THREE from 'three';
import { NAMES, SUBS, SIDE, ROMAN, FACTS, PAGES, DEF } from '../data/constellations.js';

const BASE = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';

export function startStarMap() {

  const ICO_PNG = BASE + 'img/icosahedron.png';
  const GRAPE_PNG = BASE + 'img/grapes.png';
  const PC_PNG = BASE + 'img/computer.png';
  const BIRD_PNG = BASE + 'img/bird.png';
  const BOOK_PNG = BASE + 'img/book.png';
  const STAIR_PNG = BASE + 'img/stairs.png';
  const MOLE_PNG = BASE + 'img/mole.png';
  const NS = NAMES.length;
  const scroller = document.getElementById('scroller');
  const secs = [...document.querySelectorAll('.sec')];
  const moonsEl = document.getElementById('moons');
  const go = (i) => scroller.scrollTo({ top: i * scroller.clientHeight, behavior: 'smooth' });
  const moonSVG = (k) => { const l = k <= 4 ? k / 4 : (8 - k) / 4, d = 18 * l, sx = k < 4 ? -1 : 1; return '<svg viewBox="-4 -4 30 30" aria-hidden="true"><defs><mask id="m' + k + '"><rect x="-4" y="-4" width="30" height="30" fill="white"/><circle cx="' + (11 + sx * d) + '" cy="11" r="9" fill="black"/></mask></defs><circle class="orb" cx="11" cy="11" r="13.5" fill="none" stroke="#E2BE74" stroke-width=".8" stroke-dasharray="1.5 2.5"/><circle cx="11" cy="11" r="9" fill="none" stroke="#E2BE74" stroke-width="1"/>' + (k === 4 ? '<circle cx="11" cy="11" r="9" fill="#E2BE74"/>' : k ? '<circle cx="11" cy="11" r="9" fill="#E2BE74" mask="url(#m' + k + ')"/>' : '<circle cx="11" cy="11" r="1.6" fill="#E2BE74"/>') + '</svg>'; };
  const miniSVG = (i, extra) => { const d = DEF[i]; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; d.p.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, -y); y1 = Math.max(y1, -y); }); const pad = 1.2, w = Math.max(x1 - x0, y1 - y0) + pad * 2, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    let h = '<svg class="mini" viewBox="' + (cx - w / 2) + ' ' + (cy - w / 2) + ' ' + w + ' ' + w + '" aria-hidden="true">';
    d.e.forEach(([a, b], k) => { h += '<line pathLength="1" style="transition-delay:' + ((extra || 0.7) + k * 0.09).toFixed(2) + 's" x1="' + d.p[a][0] + '" y1="' + (-d.p[a][1]) + '" x2="' + d.p[b][0] + '" y2="' + (-d.p[b][1]) + '"/>'; });
    d.p.forEach(([x, y], k) => { const dl = ((extra || 0.7) + k * 0.06).toFixed(2); h += '<circle class="h" style="transition-delay:' + dl + 's" cx="' + x + '" cy="' + (-y) + '" r=".55"/><circle style="transition-delay:' + dl + 's" cx="' + x + '" cy="' + (-y) + '" r=".24"/>'; });
    return h + '</svg>'; };
  NAMES.forEach((n, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', n); b.innerHTML = '<span><b>' + ROMAN[i] + '</b>' + n + '</span>' + moonSVG(i); b.onclick = () => go(i); moonsEl.appendChild(b); });
  document.querySelectorAll('.sec').forEach((sec, i) => { const card = sec.querySelector('.card'); if (!card) return; card.insertAdjacentHTML('afterbegin', '<span class="med" aria-hidden="true">' + ROMAN[i] + '</span>' + miniSVG(i, 0.9)); });
  let px = -999, py = -999;
  window.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; });
  window.addEventListener('pointerdown', (e) => { px = e.clientX; py = e.clientY; });
  const tip = document.getElementById('tip');
  let tipKey = '';
  const hit = (a2, b2) => !(a2.r <= b2.left || a2.l >= b2.right || a2.b <= b2.top || a2.t >= b2.bottom);
  const showTip = (h) => { if (!h) { tip.classList.remove('on'); if (!photoHover) document.body.style.cursor = ''; tipKey = ''; return; } document.body.style.cursor = 'pointer'; const k = h.n + h.txt; if (k !== tipKey) { tipKey = k; tip.querySelector('b').textContent = ROMAN[h.n] + ' · ' + NAMES[h.n]; tip.querySelector('span').textContent = h.txt; tip.classList.remove('on'); void tip.offsetWidth; }
    const w = tip.offsetWidth, ht = tip.offsetHeight, obs = [...document.querySelectorAll('.sec.on .panel, #moons, header .hr, header .logo, #coords, #hint')].map(e => e.getBoundingClientRect()).filter(r2 => r2.width);
    const C = [['ru', h.sx + 26, h.sy - 22 - ht], ['lu', h.sx - 26 - w, h.sy - 22 - ht], ['rd', h.sx + 26, h.sy + 22], ['ld', h.sx - 26 - w, h.sy + 22]];
    let pick = C[0], best = -1; C.forEach(c => { const box = { l: c[1], t: c[2], r: c[1] + w, b: c[2] + ht }; let sc2 = 0; if (box.l > 8 && box.t > 8 && box.r < window.innerWidth - 8 && box.b < window.innerHeight - 8) sc2 += 2; if (!obs.some(o => hit(box, o))) sc2 += 3; if (sc2 > best) { best = sc2; pick = c; } });
    tip.className = 'on ' + pick[0]; tip.style.left = pick[1] + 'px'; tip.style.top = pick[2] + 'px'; };
  // the chart sheet: one calm column over a faint engraving of the constellation
  const artCanvases = [];
  let drawerOpen = false, plateI = 0;
  const dr = document.getElementById('plate'), pgEl = dr.querySelector('.pg'), bgEl = dr.querySelector('.pgbg');
  const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  const bgCache = {};
  const plateBg = (i) => { if (bgCache[i]) return bgCache[i]; const c = mkCanvas(1024, 1024), x = c.getContext('2d'); if (artCanvases[i]) x.drawImage(artCanvases[i], 0, 0);
    goldStroke(x, 2.4); const d = DEF[i]; d.e.forEach(([a, b]) => { x.beginPath(); x.moveTo(X(d.p[a][0]), Y(d.p[a][1])); x.lineTo(X(d.p[b][0]), Y(d.p[b][1])); x.stroke(); }); d.p.forEach(p => sparkle(x, X(p[0]), Y(p[1]), 16));
    if (!artCanvases[i]) return ''; return (bgCache[i] = c.toDataURL('image/png')); };
  const fillPlate = (i) => { const P = PAGES[i];
    let r = (i === 0 ? '<figure class="ptr"><img alt="Portrait of Lorenzo Tripodi" src="' + PORTRAIT + '"><figcaption>Laurentius · observed in Turin</figcaption></figure>' : '') + '<span class="k">' + (i ? 'CHART ' + ROMAN[i] + ' · ' : '') + NAMES[i].toUpperCase() + '</span><h2>' + P.t + '</h2><p class="sub">' + P.role + '<i>' + P.when + '</i></p><span class="orn">✦</span>';
    if (P.obs) r += '<ol class="ent2">' + P.obs.map((o, k) => '<li><em>' + ROM[k] + '</em>' + o + '</li>').join('') + '</ol>';
    if (P.jobs) r += '<ol class="ent2">' + P.jobs.map((j, k) => '<li><em>' + ROM[k] + '</em><b>' + j[0] + '</b><small>' + j[1] + '</small>' + j[2] + '</li>').join('') + '</ol>';
    if (P.groups) r += '<h5>INSTRUMENTS</h5>' + P.groups.map(g2 => '<p class="inst"><i>' + g2[0] + '</i>' + g2[1] + '</p>').join('');
    if (P.ins) r += '<h5>INSTRUMENTS</h5><p class="inst">' + P.ins.join(' · ') + '</p>';
    if (P.links) r += '<h5>BEARINGS</h5><div class="lnk2">' + P.links.map(l => '<a href="' + l[1] + '"' + (l[1].startsWith('http') ? ' target="_blank" rel="noopener"' : '') + '>' + l[0] + '</a>').join('') + '</div>';
    const sc2 = dr.querySelector('.pgs'); sc2.innerHTML = r; sc2.scrollTop = 0;
    const bg = plateBg(i); bgEl.style.backgroundImage = bg ? 'url(' + bg + ')' : 'none';
    const pv = dr.querySelector('.pv'), nx = dr.querySelector('.nx'); pv.disabled = i === 0; nx.disabled = i === NS - 1;
    pv.textContent = i > 0 ? '‹ ' + NAMES[i - 1] : ''; nx.textContent = i < NS - 1 ? NAMES[i + 1] + ' ›' : ''; dr.querySelector('.pgf span').textContent = (i + 1) + ' / ' + NS; };
  const openDrawer = (i) => { plateI = i; fillPlate(i); dr.classList.add('open'); dr.setAttribute('aria-hidden', 'false'); drawerOpen = true; };
  { const cm = document.querySelector('.cameo'); if (cm) { cm.onclick = () => openDrawer(0); cm.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(0); } }; } }
  const closeDrawer = () => { dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); drawerOpen = false; };
  const turn = (dir) => { const n2 = clamp(plateI + dir, 0, NS - 1); if (n2 === plateI) return; plateI = n2; pgEl.classList.add('swap'); setTimeout(() => { fillPlate(n2); pgEl.classList.remove('swap'); }, 260); };
  dr.querySelector('.cl').onclick = () => { const i = plateI; closeDrawer(); if (i !== active) setTimeout(() => go(i), 300); };
  dr.querySelector('.pv').onclick = () => turn(-1); dr.querySelector('.nx').onclick = () => turn(1);
  dr.addEventListener('click', (e) => { if (e.target === dr) dr.querySelector('.cl').click(); });
  document.querySelectorAll('.sec').forEach((sec, i) => { const pnl = sec.querySelector('.panel'); const b = document.createElement('button'); b.className = 'more'; b.type = 'button'; b.innerHTML = '<span class="ln"></span>Open the chart<span class="st">✦</span>'; b.onclick = () => openDrawer(i); pnl.appendChild(b); });



  // the complete chart: every constellation on one planisphere
  const fullEl = document.getElementById('full'), fsv = document.getElementById('fmsvg');
  let fullOpen = false, fullBuilt = false, fullArt = false;
  const buildFull = () => { fullBuilt = true; fullArt = artCanvases.filter(Boolean).length === NS; let h = '<defs><radialGradient id="fmbg" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#17265F"/><stop offset="1" stop-color="#08102C"/></radialGradient><radialGradient id="fmmw" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F6DFA6" stop-opacity=".16"/><stop offset="1" stop-color="#F6DFA6" stop-opacity="0"/></radialGradient></defs>';
    h += '<circle r="96" fill="url(#fmbg)"/><ellipse rx="110" ry="20" fill="url(#fmmw)" transform="rotate(-28)"/>';
    let sd = 7; const R = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
    for (let k = 0; k < 420; k++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 93, big = R() < 0.06; h += '<circle class="tw" cx="' + (Math.cos(a) * rr).toFixed(2) + '" cy="' + (Math.sin(a) * rr).toFixed(2) + '" r="' + (big ? 0.55 : 0.12 + R() * 0.25).toFixed(2) + '" fill="' + (R() < 0.3 ? '#F6DFA6' : '#DDE6FF') + '" style="animation-delay:-' + (R() * 3).toFixed(2) + 's;animation-duration:' + (2 + R() * 3).toFixed(2) + 's"/>'; }
    h += '<g fill="none" stroke="#E2BE74" stroke-width=".2" opacity=".35" stroke-dasharray=".6 1.6">' + [30, 60].map(r2 => '<circle r="' + r2 + '"/>').join('') + [0, 1, 2, 3, 4, 5].map(k => '<line x1="' + (Math.cos(k * Math.PI / 6) * -92) + '" y1="' + (Math.sin(k * Math.PI / 6) * -92) + '" x2="' + (Math.cos(k * Math.PI / 6) * 92) + '" y2="' + (Math.sin(k * Math.PI / 6) * 92) + '"/>').join('') + '</g>';
    h += '<circle cx="9" cy="-6" r="56" fill="none" stroke="#E2BE74" stroke-width=".3" opacity=".35"/>';
    h += '<g class="rot"><circle r="92" fill="none" stroke="#E2BE74" stroke-width=".35"/><circle r="97" fill="none" stroke="#E2BE74" stroke-width=".25" opacity=".7"/>';
    for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2, L = k % 3 ? 1.4 : 3; h += '<line x1="' + (Math.cos(a) * 92) + '" y1="' + (Math.sin(a) * 92) + '" x2="' + (Math.cos(a) * (92 + L)) + '" y2="' + (Math.sin(a) * (92 + L)) + '" stroke="#E2BE74" stroke-width=".25"/>'; }
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2 - Math.PI / 2; h += '<text x="' + (Math.cos(a) * 102).toFixed(2) + '" y="' + (Math.sin(a) * 102 + 1).toFixed(2) + '" font-family="Cinzel" font-size="2.8" fill="#E2BE74" text-anchor="middle" transform="rotate(' + (k * 15) + ' ' + (Math.cos(a) * 102).toFixed(2) + ' ' + (Math.sin(a) * 102 + 1).toFixed(2) + ')">' + k + 'h</text>'; }
    h += '</g>';
    h += '<g opacity=".9"><path d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6 Z" fill="none" stroke="#E2BE74" stroke-width=".3"/><circle r="3" fill="none" stroke="#E2BE74" stroke-width=".25"/><text y="17" font-family="Cinzel" font-weight="600" font-size="4.2" letter-spacing=".9" fill="#E2BE74" text-anchor="middle">LORENZO TRIPODI</text><text y="22.5" font-family="Cormorant Garamond" font-style="italic" font-size="3.6" fill="#C3C6DA" text-anchor="middle">Mappa caelestis · MMXXVI</text></g>';
    DEF.forEach((d, i) => { const az = -i * 0.74 + 0.2, el = 0.12 + 0.2 * Math.sin(i * 1.4), th = az - Math.PI / 2, rho = 64 - el * 34, cx = Math.cos(th) * rho, cy = Math.sin(th) * rho, k2 = 2.0;
      const img = plateBg(i);
      h += '<g class="cg" data-i="' + i + '" tabindex="0" role="button" aria-label="' + NAMES[i] + '" transform="translate(' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ')"><circle class="hl" r="' + (i === 7 ? 17 : 15.5) + '"/>';
      if (img) h += '<image href="' + img + '" x="' + (-8 * k2) + '" y="' + (-8 * k2) + '" width="' + (16 * k2) + '" height="' + (16 * k2) + '"/>';
      d.e.forEach(([a, b], e) => { h += '<line pathLength="1" style="transition-delay:' + (0.4 + i * 0.12 + e * 0.05).toFixed(2) + 's" x1="' + (d.p[a][0] * k2) + '" y1="' + (-d.p[a][1] * k2) + '" x2="' + (d.p[b][0] * k2) + '" y2="' + (-d.p[b][1] * k2) + '"/>'; });
      d.p.forEach(p => { h += '<circle class="s" style="transition-delay:' + (0.5 + i * 0.12).toFixed(2) + 's" cx="' + (p[0] * k2) + '" cy="' + (-p[1] * k2) + '" r=".55"/>'; });
      h += '<text y="' + (i === 5 ? 19.5 : 18.5) + '">' + NAMES[i].toUpperCase() + '</text><text class="sb" y="' + (i === 5 ? 22.6 : 21.6) + '">' + SUBS[i] + '</text><text class="hr2" y="-16.8">you are here</text></g>'; });
    fsv.innerHTML = h;
    fsv.querySelectorAll('.cg').forEach(g => { const i = +g.dataset.i; const goTo = () => { closeFull(); setTimeout(() => go(i), 350); }; g.addEventListener('click', goTo); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(); } }); }); };
  const openFull = () => { if (!fullBuilt || !fullArt) buildFull(); fsv.querySelectorAll('.cg').forEach(g => g.classList.toggle('here', +g.dataset.i === active)); fullEl.classList.add('open'); fullEl.setAttribute('aria-hidden', 'false'); fullOpen = true; };
  const closeFull = () => { fullEl.classList.remove('open'); fullEl.setAttribute('aria-hidden', 'true'); fullOpen = false; };
  document.getElementById('mapBtn').onclick = openFull; fullEl.querySelector('.fmx').onclick = closeFull; fullEl.addEventListener('click', (e) => { if (e.target === fullEl || e.target.classList.contains('fm')) closeFull(); });
  const ixEl = document.getElementById('index'), ixg = document.getElementById('ixg');
  NAMES.forEach((n, i) => { const c = document.createElement('button'); c.className = 'ixc'; c.style.transitionDelay = (0.08 + i * 0.06) + 's'; c.innerHTML = miniSVG(i, 0.35 + i * 0.08) + '<span class="num">' + (i ? 'CHART ' + ROMAN[i] : 'FRONTISPIECE') + '</span><span class="nm">' + n + '</span><span class="sb">' + SUBS[i] + '</span>'; c.onclick = () => { closeIx(); setTimeout(() => go(i), 250); }; ixg.appendChild(c); });
  const openIx = () => { [...ixg.children].forEach((c, i) => c.classList.toggle('cur', i === active)); ixEl.classList.add('open'); ixEl.setAttribute('aria-hidden', 'false'); };
  const closeIx = () => { ixEl.classList.remove('open'); ixEl.setAttribute('aria-hidden', 'true'); };
  const ixB = document.getElementById('ixBtn'); if (ixB) ixB.onclick = openIx; document.getElementById('ixClose').onclick = closeIx; ixEl.addEventListener('click', (e) => { if (e.target === ixEl) closeIx(); });
  const moons = [...moonsEl.querySelectorAll('button')];
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));
  let prog = 0, active = -1;
  const labelEl = document.getElementById('label');
  const setActive = (a) => { if (a === active) return; active = a; if (typeof closeDrawer === 'function' && drawerOpen) closeDrawer(); secs.forEach((s, i) => s.classList.toggle('on', i === a)); moons.forEach((d, i) => d.classList.toggle('on', i === a)); labelEl.style.opacity = 0; setTimeout(() => { labelEl.textContent = NAMES[a]; labelEl.style.opacity = 1; }, 250); document.getElementById('hint').style.opacity = a === 0 ? 1 : 0; };
  const fillEl = document.getElementById('fill');
  scroller.addEventListener('scroll', () => { prog = scroller.scrollTop / Math.max(1, scroller.clientHeight); setActive(Math.round(prog)); fillEl.style.height = (prog / (NS - 1) * 100) + '%'; }, { passive: true });
  setActive(0);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeIx(); closeFull(); if (drawerOpen) dr.querySelector('.cl').click(); return; }
    if (drawerOpen) { if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1); return; }
    if (ixEl.classList.contains('open') || fullOpen) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(Math.min(NS - 1, active + 1)); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(Math.max(0, active - 1)); }
  });
  let mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });
  const intro = document.getElementById('intro');
  if (!THREE || !THREE.WebGLRenderer) { intro.classList.add('done'); return; }

  const T = THREE;
  const cv = document.getElementById('c');
  const r = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false });
  const PR = () => { const d = window.devicePixelRatio || 1, px = innerWidth * innerHeight; return Math.min(d, px > 2.2e6 ? 1 : px > 1.3e6 ? 1.25 : 1.5); }; r.setPixelRatio(PR());
  let W = 1, H = 1;
  let cvRect = cv.getBoundingClientRect(); const fit = () => { W = cv.clientWidth; H = cv.clientHeight; r.setPixelRatio(PR()); if (W && H) r.setSize(W, H, false); cvRect = cv.getBoundingClientRect(); try { mats.forEach(m => { if (m.uniforms.uPR) m.uniforms.uPR.value = r.getPixelRatio(); }); } catch (e) {} };
  new ResizeObserver(fit).observe(cv); fit();
  const rnd = Math.random, gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (f) => f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
  const GOLD = '#E2BE74', GOLD_L = '#F6DFA6';

  /* ---------- sparkle star shader (4-point glints on bright stars) ---------- */
  const mats = [];
  const VS = `attribute vec3 aColor; attribute float aSize; attribute float aPhase; attribute float aType;
    uniform float uTime; uniform float uPR; uniform float uTw; uniform float uMax;
    varying vec3 vC; varying float vT; varying float vType; varying float vRot; varying float vGl;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
      float h1 = fract(aPhase * 43.17), h2 = fract(aPhase * 91.73), h3 = fract(aPhase * 17.31);
      float amp = uTw * (0.35 + 1.4 * h1);
      float w = 0.5 + 0.5 * sin(uTime * 0.001 * (0.5 + h2 * 3.2) + aPhase * 40.0) * (0.6 + 0.4 * sin(uTime * 0.00037 * (1.0 + h3) + aPhase * 9.0));
      float gl = pow(max(0.0, sin(uTime * 0.00045 * (0.4 + h3 * 1.6) + aPhase * 71.0)), 70.0) * step(0.5, aType);
      vT = clamp(1.0 - amp * w, 0.15, 1.0) + gl * 1.3; vGl = gl;
      gl_PointSize = min(uMax, aSize * (1.0 + gl * 0.9) * uPR * (100.0 / max(0.1, -mv.z))); vC = aColor; vType = aType;
      vRot = aPhase * 0.6 + uTime * 0.00004 * step(2.5, aType) + gl * 0.4; }`;
  const FS = `uniform float uAlpha; uniform float uFlare; varying vec3 vC; varying float vT; varying float vType; varying float vRot; varying float vGl;
    void main(){ vec2 p = gl_PointCoord - 0.5; float d = length(p);
      float g = pow(smoothstep(0.5, 0.0, d), 3.0);
      float cr = cos(vRot), sr = sin(vRot); vec2 q = mat2(cr, -sr, sr, cr) * p;
      float r4 = exp(-abs(q.x) * 55.0) * smoothstep(0.5, 0.0, abs(q.y)) + exp(-abs(q.y) * 55.0) * smoothstep(0.5, 0.0, abs(q.x));
      vec2 q2 = mat2(0.7071, -0.7071, 0.7071, 0.7071) * q;
      float r8 = (exp(-abs(q2.x) * 80.0) * smoothstep(0.3, 0.0, abs(q2.y)) + exp(-abs(q2.y) * 80.0) * smoothstep(0.3, 0.0, abs(q2.x))) * 0.7;
      float ring = exp(-pow((d - 0.36) * 30.0, 2.0)) * 0.35 + exp(-pow((d - 0.44) * 60.0, 2.0)) * 0.15;
      float rays = (r4 * step(0.5, vType) + r8 * step(1.5, vType)) * (uFlare + vGl * 1.6) + r4 * vGl * 1.2;
      float rg = ring * step(2.5, vType) * uFlare;
      float core = smoothstep(0.09, 0.0, d);
      float a = clamp(g + rays + rg + core, 0.0, 1.0) * uAlpha * vT; if (a < 0.003) discard;
      gl_FragColor = vec4(vC * (1.0 + core * 0.7), a); }`;
  const starMat = (o) => { o = o || {}; const m = new T.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uPR: { value: r.getPixelRatio() }, uTw: { value: o.tw == null ? 0.35 : o.tw }, uMax: { value: o.max || 40 }, uAlpha: { value: o.alpha == null ? 1 : o.alpha }, uFlare: { value: o.flare || 0 } }, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending }); mats.push(m); return m; };
  const starGeo = (pos, col, size, type) => { const n = pos.length / 3, ph = new Float32Array(n); for (let i = 0; i < n; i++) ph[i] = rnd(); const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aColor', new T.BufferAttribute(col, 3)); g.setAttribute('aSize', new T.BufferAttribute(size, 1)); g.setAttribute('aPhase', new T.BufferAttribute(ph, 1)); g.setAttribute('aType', new T.BufferAttribute(type || new Float32Array(n).fill(1), 1)); return g; };
  const cloud = (n, fn, o) => { const p = new Float32Array(n * 3), c = new Float32Array(n * 3), s = new Float32Array(n), ty = new Float32Array(n), v = new T.Vector3(), col = new T.Color(), meta = { type: 1 }; for (let i = 0; i < n; i++) { meta.type = o && o.type != null ? o.type : 1; const sz = fn(i, v, col, meta); p.set([v.x, v.y, v.z], i * 3); c.set([col.r, col.g, col.b], i * 3); s[i] = sz; ty[i] = meta.type; } return new T.Points(starGeo(p, c, s, ty), starMat(o)); };

  const sc = new T.Scene();
  const cam = new T.PerspectiveCamera(56, 1, 0.1, 500);
  const sky = new T.Group(); sc.add(sky);
  // stars: faint field, mid, and bright glints
  sky.add(cloud(5000, (i, v, c) => { v.set(gauss(), gauss(), gauss()).normalize().multiplyScalar(110); c.setHSL(0.6 + rnd() * 0.08, 0.3, 0.75).multiplyScalar(0.35 + rnd() * 0.35); return 1.2 + rnd() * 1.3; }, { tw: 0.55, max: 4 }));
  const MW = new T.Quaternion().setFromEuler(new T.Euler(0.55, 0, 0.4));
  sky.add(cloud(9000, (i, v, c) => { const a = rnd() * Math.PI * 2, w = gauss() * (0.1 + 0.06 * Math.sin(a * 3)); v.set(Math.cos(a), w, Math.sin(a)).normalize().multiplyScalar(105).applyQuaternion(MW); c.setHSL(rnd() < 0.25 ? 0.1 : 0.62, 0.4, 0.7).multiplyScalar(0.18 + rnd() * 0.3); return 1.3 + rnd() * 1.8; }, { tw: 0.5, max: 4 }));
  const TEMP = [0xCFE0FF, 0xFFFFFF, 0xFFF1D0, 0xF4D58C, 0xFFB98A];
  sky.add(cloud(1400, (i, v, c, m) => { v.set(gauss(), gauss(), gauss()).normalize().multiplyScalar(104); c.set(TEMP[Math.floor(rnd() * TEMP.length)]).multiplyScalar(0.55 + rnd() * 0.3); m.type = 0; return 2.2 + rnd() * 1.8; }, { tw: 0.7, max: 6 }));
  sky.add(cloud(320, (i, v, c, m) => { v.set(gauss(), gauss(), gauss()).normalize().multiplyScalar(100); c.set(TEMP[Math.floor(rnd() * TEMP.length)]); m.type = rnd() < 0.55 ? 1 : rnd() < 0.7 ? 2 : 3; return (m.type === 3 ? 9 : 5) + rnd() * 6; }, { tw: 0.5, max: 18, flare: 0.9 }));
  // soft golden haze along the Milky Way
  { const hc = document.createElement('canvas'); hc.width = hc.height = 128; const hx = hc.getContext('2d'); const gr = hx.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,225,170,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); hx.fillStyle = gr; hx.fillRect(0, 0, 128, 128); const ht = new T.CanvasTexture(hc);
    for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2 + rnd() * 0.1; const sp = new T.Sprite(new T.SpriteMaterial({ map: ht, transparent: true, opacity: 0.07 + rnd() * 0.07, blending: T.AdditiveBlending, depthWrite: false, color: rnd() < 0.3 ? 0xB9C6FF : 0xFFE0A8 })); sp.position.set(Math.cos(a), gauss() * 0.06, Math.sin(a)).normalize().multiplyScalar(100).applyQuaternion(MW); sp.scale.setScalar(22 + rnd() * 26); sky.add(sp); } }
  // a small open cluster (like the Pleiades) with a gold reflection haze
  { const cd = new T.Vector3(0.75, 0.42, 0.5).normalize(); const cl = cloud(11, (i, v, c, m) => { v.copy(cd).multiplyScalar(98).add(new T.Vector3(gauss() * 3, gauss() * 2.2, gauss() * 3)); c.set(0xDDE8FF); m.type = i < 4 ? 3 : 2; return i < 4 ? 12 : 6 + rnd() * 3; }, { tw: 0.35, max: 22, flare: 1 }); sky.add(cl); }
  // a few named bright stars, labelled like an antique atlas
  const starLabel = (txt) => { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d'); x.fillStyle = '#E2BE74'; x.font = 'italic 500 52px "Cormorant Garamond", serif'; x.textBaseline = 'middle'; x.fillText(txt, 8, 50); return new T.CanvasTexture(c); };
  const named = [];
  ['Vega', 'Altair', 'Deneb', 'Sirius', 'Capella', 'Rigel', 'Arcturus', 'Aldebaran', 'Spica', 'Polaris', 'Antares', 'Regulus'].forEach((nm, k) => {
    const az = k / 12 * Math.PI * 2 + 0.37, el = (k % 2 ? 1 : -1) * (0.38 + (k % 3) * 0.16) + (nm === 'Polaris' ? 0.9 : 0); const dv = new T.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
    const pt = cloud(1, (i, v, c, m) => { v.copy(dv).multiplyScalar(96); c.set(TEMP[k % TEMP.length]); m.type = 3; return 15; }, { tw: 0.3, max: 30, flare: 1 }); sky.add(pt);
    const lb = new T.Mesh(new T.PlaneGeometry(10, 1.9), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); lb.position.copy(dv).multiplyScalar(96); lb.lookAt(0, 0, 0); lb.translateX(-5.9); lb.translateY(-1.1); sky.add(lb); named.push({ lb, nm }); });


  // celestial grid + ecliptic (dashed gold), like an antique chart
  const gridMat = new T.LineDashedMaterial({ color: 0xE2BE74, dashSize: 0.9, gapSize: 0.9, transparent: true, opacity: 0.09 });
  const circle = (R, q, seg) => { const pts = []; for (let i = 0; i <= (seg || 180); i++) { const a = i / (seg || 180) * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R).applyQuaternion(q)); } const g = new T.BufferGeometry().setFromPoints(pts); return g; };
  for (let k = 0; k < 6; k++) { const l = new T.Line(circle(96, new T.Quaternion().setFromEuler(new T.Euler(Math.PI / 2, k * Math.PI / 6, 0, 'YXZ'))), gridMat); l.computeLineDistances(); sky.add(l); }
  [-60, -30, 0, 30, 60].forEach(d => { const lat = d * Math.PI / 180, pts = []; for (let i = 0; i <= 180; i++) { const a = i / 180 * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a) * Math.cos(lat) * 96, Math.sin(lat) * 96, Math.sin(a) * Math.cos(lat) * 96)); } const l = new T.Line(new T.BufferGeometry().setFromPoints(pts), gridMat); l.computeLineDistances(); sky.add(l); });
  const eq = new T.Quaternion().setFromEuler(new T.Euler(0.41, 0.3, 0));
  sky.add(new T.Line(circle(94, eq, 360), new T.LineBasicMaterial({ color: 0xE2BE74, transparent: true, opacity: 0.22 })));
  { const tk = []; for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, L = i % 6 ? 0.9 : 2.2; const p = new T.Vector3(Math.cos(a), 0, Math.sin(a)); tk.push(p.clone().multiplyScalar(94).add(new T.Vector3(0, -L / 2, 0)).applyQuaternion(eq), p.clone().multiplyScalar(94).add(new T.Vector3(0, L / 2, 0)).applyQuaternion(eq)); } sky.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(tk), new T.LineBasicMaterial({ color: 0xE2BE74, transparent: true, opacity: 0.22 }))); }

  /* ---------- canvas line-art helpers ---------- */
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const goldStroke = (x, w) => { const g = x.createLinearGradient(0, 0, x.canvas.width, x.canvas.height); g.addColorStop(0, '#F7E2A8'); g.addColorStop(0.45, '#D2A24E'); g.addColorStop(0.7, '#F3D490'); g.addColorStop(1, '#B98A35'); x.strokeStyle = g; x.fillStyle = g; x.lineWidth = w || 3; x.lineCap = 'round'; x.lineJoin = 'round'; };
  const sparkle = (x, cx, cy, r) => { x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r); x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill(); };
  // illustration space: star units → 1024px canvas covering 16×16 units
  const U = 64, X = (v) => 512 + v * U, Y = (v) => 512 - v * U;
  const line = (x, pts, close) => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(X(p[0]), Y(p[1])) : x.moveTo(X(p[0]), Y(p[1]))); if (close) x.closePath(); x.stroke(); };
  const dotted = (x, fn) => { x.save(); x.setLineDash([2, 12]); fn(); x.restore(); };
  const scatter = (x, n, seed) => { let s = seed; const R = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < n; i++) { const px = 60 + R() * 904, py = 60 + R() * 904, rr = 4 + R() * 10; x.globalAlpha = 0.5 + R() * 0.5; sparkle(x, px, py, rr); } x.globalAlpha = 1; };

    // an elegant quill: curved shaft, asymmetric vane with barbs, a couple of splits and a cut nib
    const fineQuill = (x, cx, cy, s, r) => { x.save(); x.translate(X(cx), Y(cy)); x.rotate(r); const L = 3.6 * s * U;
      const sh = (t) => [Math.sin(t * Math.PI) * 0.12 * s * U * t, -t * L];
      x.lineWidth = 1.3; x.beginPath(); for (let k = 0; k <= 30; k++) { const [a, b] = sh(k / 30); k ? x.lineTo(a, b) : x.moveTo(a, b); } x.stroke();
      const vane = (side, wmax) => { const pts = []; for (let k = 0; k <= 30; k++) { const t = 0.22 + 0.78 * k / 30, [a, b] = sh(t), w = Math.sin(Math.min(1, (t - 0.22) / 0.7) * Math.PI * 0.92) * wmax * (1 - Math.max(0, t - 0.85) * 3); pts.push([a + side * w, b - w * 0.35]); } return pts; };
      [[-1, 0.5 * s * U], [1, 0.32 * s * U]].forEach(([side, wm]) => { const v = vane(side, wm); x.lineWidth = 1.1; x.beginPath(); v.forEach((p, k) => { k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); }); const [ea, eb] = sh(1); x.lineTo(ea, eb); x.stroke();
        x.lineWidth = 0.55; for (let k = 2; k < 30; k += 1) { if (side < 0 && (k === 11 || k === 12 || k === 19)) continue; const t = 0.22 + 0.78 * k / 30, [a, b] = sh(t); const p = v[k]; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo((a + p[0]) / 2, b - Math.abs(p[0] - a) * 0.12, p[0], p[1]); x.stroke(); } });
      x.save(); x.globalAlpha *= 0.12; const vl = vane(-1, 0.5 * s * U), vr = vane(1, 0.32 * s * U); x.beginPath(); vl.forEach((p, k) => k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); vr.reverse().forEach(p => x.lineTo(p[0], p[1])); x.closePath(); x.fill(); x.restore();
      x.lineWidth = 1.2; x.beginPath(); x.moveTo(-3, 0); x.lineTo(0, 0.42 * s * U); x.lineTo(3, 0); x.stroke(); x.beginPath(); x.moveTo(0, 0.12 * s * U); x.lineTo(0, 0.36 * s * U); x.stroke();
      x.lineWidth = 0.8; x.setLineDash([2, 5]); x.beginPath(); x.moveTo(0, 0.5 * s * U); x.quadraticCurveTo(0.6 * s * U, 0.9 * s * U, 1.4 * s * U, 0.7 * s * U); x.stroke(); x.setLineDash([]); x.restore(); };
  /* ---------- themed engravings around each constellation ---------- */
  const DECO = (() => {
    const fx = (x, a, fn) => { x.save(); x.globalAlpha = a; fn(); x.restore(); };
    const txt = (x, t, cx, cy, size, font) => { x.font = (font || 'italic 500 ') + size + 'px "Cormorant Garamond", serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, X(cx), Y(cy)); };
    const quill = (x, cx, cy, s, r) => { x.save(); x.translate(X(cx), Y(cy)); x.rotate(r); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-0.35 * s * U, -1.2 * s * U, 0.05 * s * U, -2.6 * s * U); x.quadraticCurveTo(0.45 * s * U, -1.2 * s * U, 0, 0); x.stroke(); x.beginPath(); x.moveTo(0, 0.2 * s * U); x.lineTo(0.02 * s * U, -2.4 * s * U); x.stroke(); for (let k = 1; k < 9; k++) { const yy = -k * 0.26 * s * U; x.beginPath(); x.moveTo(0, yy); x.lineTo(-0.22 * s * U * Math.sin(k / 9 * Math.PI), yy - 0.12 * s * U); x.moveTo(0, yy); x.lineTo(0.22 * s * U * Math.sin(k / 9 * Math.PI), yy - 0.12 * s * U); x.stroke(); } x.restore(); };
    const divider = (x, cx, cy, s) => { x.beginPath(); x.moveTo(X(cx), Y(cy + 1.4 * s)); x.lineTo(X(cx - 0.7 * s), Y(cy - 1.1 * s)); x.moveTo(X(cx), Y(cy + 1.4 * s)); x.lineTo(X(cx + 0.7 * s), Y(cy - 1.1 * s)); x.stroke(); x.beginPath(); x.arc(X(cx), Y(cy + 1.4 * s), 0.14 * s * U, 0, 7); x.stroke(); x.beginPath(); x.arc(X(cx), Y(cy - 0.2 * s), 1.0 * s * U, 0.75, Math.PI - 0.75); x.stroke(); };
    const book = (x, cx, cy, w, h, r) => { x.save(); x.translate(X(cx), Y(cy)); x.rotate(r || 0); x.strokeRect(-w * U / 2, -h * U / 2, w * U, h * U); x.beginPath(); x.moveTo(-w * U / 2 + 6, -h * U / 2); x.lineTo(-w * U / 2 + 6, h * U / 2); x.stroke(); x.restore(); };
    const env = (x, cx, cy, w, h, r) => { x.save(); x.translate(X(cx), Y(cy)); x.rotate(r || 0); x.strokeRect(-w * U / 2, -h * U / 2, w * U, h * U); x.beginPath(); x.moveTo(-w * U / 2, -h * U / 2); x.lineTo(0, h * U * 0.1); x.lineTo(w * U / 2, -h * U / 2); x.stroke(); x.restore(); };
    const nodes = (x, pts, links) => { links.forEach(([a, b]) => { x.beginPath(); x.moveTo(X(pts[a][0]), Y(pts[a][1])); x.bezierCurveTo(X((pts[a][0] + pts[b][0]) / 2), Y(pts[a][1]), X((pts[a][0] + pts[b][0]) / 2), Y(pts[b][1]), X(pts[b][0]), Y(pts[b][1])); x.stroke(); }); pts.forEach(p => { x.strokeRect(X(p[0]) - 13, Y(p[1]) - 10, 26, 20); }); };
    return [
      (x) => { fx(x, 0.75, () => { x.lineWidth = 1.4; fineQuill(x, -6.4, -6.2, 1.15, 0.42); divider(x, 6.4, -4.6, 0.9); txt(x, 'MMXXVI', 6.4, -6.6, 26, '600 '); x.font = '600 26px Cinzel, serif'; x.fillText('EX ASTRIS · AD OPUS', 512, Y(7.3)); }); },
      (x) => { fx(x, 0.7, () => { x.lineWidth = 1.3;
        [[[-7.6, 3.5], [-6.3, 5.0], [-5.5, 4.2], [-4.2, 5.5], [-3.0, 4.3], [-2.2, 4.7], [-1.3, 3.6]], [[1.3, 3.6], [2.4, 4.6], [3.3, 4.1], [4.6, 5.6], [5.6, 4.4], [6.5, 5.0], [7.6, 3.5]]].forEach(rg => { x.beginPath(); rg.forEach((p, k) => k ? x.lineTo(X(p[0]), Y(p[1])) : x.moveTo(X(p[0]), Y(p[1]))); x.stroke();
          rg.forEach((p, k) => { if (k && k < rg.length - 1 && p[1] > rg[k - 1][1] && p[1] > rg[k + 1][1]) { x.beginPath(); x.moveTo(X(p[0] - 0.35), Y(p[1] - 0.4)); x.lineTo(X(p[0] - 0.15), Y(p[1] - 0.25)); x.lineTo(X(p[0]), Y(p[1] - 0.42)); x.lineTo(X(p[0] + 0.18), Y(p[1] - 0.26)); x.lineTo(X(p[0] + 0.32), Y(p[1] - 0.4)); x.stroke(); x.save(); x.lineWidth = 0.7; for (let h = 0.5; h < 1.2; h += 0.18) { x.beginPath(); x.moveTo(X(p[0] - h * 0.5), Y(p[1] - h)); x.lineTo(X(p[0] - h * 0.2), Y(p[1] - h - 0.15)); x.stroke(); } x.restore(); } }); });
        x.beginPath(); x.moveTo(X(4.1), Y(-4.35)); x.quadraticCurveTo(X(5.6), Y(-2.9), X(7.4), Y(-3.6)); x.stroke();
        x.beginPath(); x.arc(X(5.6), Y(-2.95), 0.32 * U, Math.PI, 0); x.stroke(); x.strokeRect(X(5.28), Y(-2.95), 0.64 * U, 0.3 * U); x.beginPath(); x.moveTo(X(5.6), Y(-2.63)); x.lineTo(X(5.6), Y(-2.25)); x.stroke();
        for (let k = 0; k < 3; k++) { x.beginPath(); const yy = -5.1 - k * 0.3; x.moveTo(X(-7.5), Y(yy)); for (let i = 0; i <= 30; i++) x.lineTo(X(-7.5 + i * 0.5), Y(yy + Math.sin(i * 0.9 + k) * 0.08)); x.stroke(); }
        txt(x, 'Augusta Taurinorum', 0, 6.6, 30); txt(x, 'Superga', 5.6, -1.75, 22); txt(x, 'Padus', -6.2, -6.0, 22); }); },
      (x) => { fx(x, 0.72, () => { x.lineWidth = 1.3;
        nodes(x, [[3.2, -5.4], [5.0, -4.4], [5.0, -6.4], [6.8, -5.4]], [[0, 1], [0, 2], [1, 3], [2, 3]]); txt(x, 'workflow', 5.0, -7.2, 22);
        txt(x, '{ }', -6.4, -5.6, 64, 'italic 600 '); txt(x, '=>', 6.6, 5.6, 54, 'italic 600 '); }); },
      (x) => { fx(x, 0.72, () => { x.lineWidth = 1.3;
        x.beginPath(); x.ellipse(X(-6.3), Y(-4.7), 1.1 * U, 0.35 * U, 0, 0, 7); x.stroke(); x.beginPath(); x.moveTo(X(-7.4), Y(-4.7)); x.quadraticCurveTo(X(-7.65), Y(-3.4), X(-7.4), Y(-2.1)); x.moveTo(X(-5.2), Y(-4.7)); x.quadraticCurveTo(X(-4.95), Y(-3.4), X(-5.2), Y(-2.1)); x.stroke(); x.beginPath(); x.ellipse(X(-6.3), Y(-2.1), 1.1 * U, 0.35 * U, 0, 0, 7); x.stroke(); [-4.1, -2.7].forEach(yy => { x.beginPath(); x.ellipse(X(-6.3), Y(yy), 1.18 * U, 0.33 * U, 0, 0, Math.PI); x.stroke(); });
        x.save(); x.translate(X(6.4), Y(4.6)); x.rotate(0.5); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 1.6 * U); x.stroke(); x.beginPath(); for (let i = 0; i <= 24; i++) { const yy = 0.4 * U + i * 0.05 * U; x.lineTo(Math.sin(i * 1.1) * 0.18 * U, yy); } x.stroke(); x.strokeRect(-0.7 * U, -0.18 * U, 1.4 * U, 0.18 * U); x.restore();
        txt(x, 'In vino veritas', 0, 6.9, 30); }); },
      (x) => { fx(x, 0.72, () => { x.lineWidth = 1.3;
        book(x, -6.4, -5.6, 2.4, 0.42, 0.04); book(x, -6.2, -5.15, 2.1, 0.42, -0.05); book(x, -6.5, -4.72, 2.2, 0.4, 0.03);
        quill(x, 6.8, -6.4, 1.1, 0.35);
        x.save(); x.translate(X(-5.9), Y(5.7)); x.strokeRect(-1.25 * U, -0.95 * U, 2.5 * U, 1.9 * U); x.lineWidth = 0.8; x.strokeRect(-1.1 * U, -0.8 * U, 2.2 * U, 1.6 * U);
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a2, b2]) => { x.beginPath(); x.arc(a2 * 1.1 * U, b2 * 0.8 * U, 0.16 * U, 0, 7); x.stroke(); });
          x.font = '600 22px Cinzel, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EX LIBRIS', 0, -0.32 * U); x.font = 'italic 600 30px "Cormorant Garamond", serif'; x.fillText('L. T.', 0, 0.22 * U);
          x.beginPath(); x.moveTo(-0.6 * U, 0.55 * U); x.lineTo(0.6 * U, 0.55 * U); x.stroke(); x.restore();
        txt(x, 'Ex libris, ad amicos', 0, 7.0, 30); }); },
      (x) => { fx(x, 0.72, () => { x.lineWidth = 1.3;
        x.save(); x.translate(X(6.3), Y(5.6)); x.rotate(-0.25); x.strokeRect(-0.7 * U, -0.7 * U, 1.4 * U, 1.4 * U); x.beginPath(); x.moveTo(-0.7 * U, -0.7 * U); x.lineTo(-0.35 * U, -1.05 * U); x.lineTo(1.05 * U, -1.05 * U); x.lineTo(0.7 * U, -0.7 * U); x.moveTo(1.05 * U, -1.05 * U); x.lineTo(1.05 * U, 0.35 * U); x.lineTo(0.7 * U, 0.7 * U); x.stroke(); [[-0.35, -0.35], [0, 0], [0.35, 0.35]].forEach(([a, b]) => { x.beginPath(); x.arc(a * U, b * U, 5, 0, 7); x.fill(); }); x.restore();
        // a potion flask with bubbles
        x.save(); x.translate(X(-6.3), Y(-5.4)); x.beginPath(); x.arc(0, 0.25 * U, 0.85 * U, -Math.PI / 2 + 0.42, Math.PI * 1.5 - 0.42); x.lineTo(-0.3 * U, -1.15 * U); x.lineTo(0.3 * U, -1.15 * U); x.closePath(); x.stroke(); x.strokeRect(-0.36 * U, -1.38 * U, 0.72 * U, 0.23 * U);
        x.beginPath(); x.moveTo(-0.8 * U, 0.35 * U); x.bezierCurveTo(-0.4 * U, 0.15 * U, 0.3 * U, 0.5 * U, 0.8 * U, 0.3 * U); x.stroke(); x.save(); x.globalAlpha *= 0.25; x.beginPath(); x.moveTo(-0.8 * U, 0.35 * U); x.bezierCurveTo(-0.4 * U, 0.15 * U, 0.3 * U, 0.5 * U, 0.8 * U, 0.3 * U); x.arc(0, 0.25 * U, 0.85 * U, 0.1, Math.PI - 0.1); x.fill(); x.restore();
        [[-0.2, -0.1, 5], [0.15, -0.45, 4], [-0.05, -0.8, 3], [0.25, 0.05, 3]].forEach(([a, b, r2]) => { x.beginPath(); x.arc(a * U, b * U, r2, 0, 7); x.stroke(); }); sparkle(x, 0.7 * U, -1.3 * U, 10); x.restore();
        // a heraldic shield with a chevron and three stars
        x.save(); x.translate(X(6.2), Y(-5.4)); x.beginPath(); x.moveTo(-0.85 * U, -0.95 * U); x.lineTo(0.85 * U, -0.95 * U); x.lineTo(0.85 * U, 0.1 * U); x.quadraticCurveTo(0.8 * U, 0.85 * U, 0, 1.2 * U); x.quadraticCurveTo(-0.8 * U, 0.85 * U, -0.85 * U, 0.1 * U); x.closePath(); x.stroke();
        x.lineWidth = 1; x.beginPath(); x.moveTo(-0.7 * U, -0.82 * U); x.lineTo(0.7 * U, -0.82 * U); x.lineTo(0.7 * U, 0.08 * U); x.quadraticCurveTo(0.66 * U, 0.72 * U, 0, 1.03 * U); x.quadraticCurveTo(-0.66 * U, 0.72 * U, -0.7 * U, 0.08 * U); x.closePath(); x.stroke();
        x.lineWidth = 1.3; x.beginPath(); x.moveTo(-0.7 * U, 0.45 * U); x.lineTo(0, -0.15 * U); x.lineTo(0.7 * U, 0.45 * U); x.stroke(); [[-0.4, -0.5], [0.4, -0.5], [0, 0.6]].forEach(([a, b]) => sparkle(x, a * U, b * U, 9)); x.restore();
        txt(x, 'Hic sunt dracones', -5.4, 6.6, 28); }); },
      (x) => { fx(x, 0.72, () => { x.lineWidth = 1.3;
        // a brass telescope on its tripod, pointed at the stars
        x.save(); x.translate(X(-6.0), Y(-5.0)); x.beginPath(); x.moveTo(0, 0); x.lineTo(-0.75 * U, 1.6 * U); x.moveTo(0, 0); x.lineTo(0.75 * U, 1.6 * U); x.moveTo(0, 0); x.lineTo(0.1 * U, 1.7 * U); x.stroke(); x.beginPath(); x.arc(0, 0, 0.1 * U, 0, 7); x.stroke();
        x.rotate(-0.62); x.strokeRect(-1.0 * U, -0.17 * U, 1.3 * U, 0.34 * U); x.strokeRect(0.3 * U, -0.23 * U, 0.85 * U, 0.46 * U); x.strokeRect(1.15 * U, -0.3 * U, 0.35 * U, 0.6 * U); x.strokeRect(-1.25 * U, -0.11 * U, 0.25 * U, 0.22 * U); [-0.4, 0.75].forEach(a => { x.beginPath(); x.moveTo(a * U, -0.2 * U); x.lineTo(a * U, 0.2 * U); x.stroke(); }); x.restore();
        dotted(x, () => { x.lineWidth = 2; x.beginPath(); x.moveTo(X(-4.7), Y(-3.75)); x.quadraticCurveTo(X(-4.2), Y(-2.6), X(-4.6), Y(-1.6)); x.stroke(); }); sparkle(x, X(-4.7), Y(-1.3), 12);
        // a laurel wreath, for the summits reached
        x.save(); x.translate(X(6.2), Y(-5.3)); const WR = 0.95 * U;
        [-1, 1].forEach(sd => { x.beginPath(); x.arc(0, 0, WR, Math.PI / 2 - sd * 0.2, Math.PI / 2 - sd * 2.3, sd > 0); x.stroke();
          for (let k = 0; k < 8; k++) { const a = Math.PI / 2 - sd * (0.3 + k * 0.26), px2 = Math.cos(a) * WR, py2 = Math.sin(a) * WR, tg = Math.atan2(-Math.cos(a) * sd, Math.sin(a) * sd); [-1, 1].forEach(io => { x.save(); x.translate(px2, py2); x.rotate(tg + io * 0.55); x.beginPath(); x.ellipse(9, 0, 9, 3.6, 0, 0, 7); x.stroke(); x.restore(); }); } });
        x.beginPath(); x.moveTo(-0.3 * U, 1.05 * U); x.quadraticCurveTo(0, 0.85 * U, 0.3 * U, 1.05 * U); x.stroke(); sparkle(x, 0, -0.05 * U, 14); x.restore();
        txt(x, 'Per aspera ad astra', 0, 7.2, 32); }); },
      (x) => { fx(x, 0.72, () => { x.lineWidth = 1.3;
        x.beginPath(); x.arc(X(6.2), Y(5.6), 1.2 * U, 0, 7); x.stroke(); x.beginPath(); x.ellipse(X(6.2), Y(5.6), 0.5 * U, 1.2 * U, 0, 0, 7); x.stroke(); [-0.6, 0, 0.6].forEach(o => { x.beginPath(); x.ellipse(X(6.2), Y(5.6 + o), Math.sqrt(1.44 - o * o) * U, 0.12 * U, 0, 0, 7); x.stroke(); });
        env(x, -6.4, 5.8, 2.0, 1.3, -0.15); env(x, -5.4, 4.6, 1.5, 1.0, 0.2);
        x.beginPath(); x.arc(X(5.9), Y(-6.4), 0.42 * U, 0, 7); x.stroke(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; x.beginPath(); x.arc(X(5.9) + Math.cos(a) * 0.5 * U, Y(-6.4) + Math.sin(a) * 0.5 * U, 4, 0, 7); x.stroke(); } x.font = '600 24px Cinzel, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LT', X(5.9), Y(-6.4));
        txt(x, 'Mittite verba', 0, 7.1, 30); }); }
    ];
  })();
  const moleImg = new Image(); moleImg.src = MOLE_PNG; const icoImg = new Image(); icoImg.src = ICO_PNG; const grapeImg = new Image(); grapeImg.src = GRAPE_PNG; const stairImg = new Image(); stairImg.src = STAIR_PNG; const bookImg = new Image(); bookImg.src = BOOK_PNG; const pcImg = new Image(); pcImg.src = PC_PNG; const birdImg = new Image(); birdImg.src = BIRD_PNG;
  const FRAME_R = [0, 5.9, 6.3, 5.9, 6.4, 5.6, 6.1, 6.4];
  const FRAME_C = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0.2]];
  const ringFrame = (x, R, C) => { x.save(); x.translate((C || [0, 0])[0] * U, -(C || [0, 0])[1] * U); goldStroke(x, 2.6); x.globalAlpha = 0.95; x.setLineDash([2, 12]); x.beginPath(); x.arc(512, 512, R * U, 0, 7); x.stroke(); x.setLineDash([]); x.globalAlpha = 0.6; x.lineWidth = 1.1; x.beginPath(); x.arc(512, 512, (R + 0.22) * U, 0, 7); x.stroke();
    x.globalAlpha = 0.75; for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, L = k % 6 ? 0.1 : 0.22; x.beginPath(); x.moveTo(512 + Math.cos(a) * (R + 0.22) * U, 512 + Math.sin(a) * (R + 0.22) * U); x.lineTo(512 + Math.cos(a) * (R + 0.22 + L) * U, 512 + Math.sin(a) * (R + 0.22 + L) * U); x.stroke(); }
    x.globalAlpha = 0.8; [0, 1, 2, 3].forEach(k => { const a = k * Math.PI / 2; sparkle(x, 512 + Math.cos(a) * (R + 0.6) * U, 512 + Math.sin(a) * (R + 0.6) * U, 9); }); x.restore(); };
  const ART = [
    (x) => { // Laurentius — oval cartouche with laurel, framing the portrait
      goldStroke(x, 2); x.beginPath(); x.arc(512, 512, 5.9 * U, 0, 7); x.stroke(); x.lineWidth = 1; x.beginPath(); x.arc(512, 512, 5.55 * U, 0, 7); x.stroke();
      for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; if (i % 8 === 0) sparkle(x, 512 + Math.cos(a) * 5.73 * U, 512 + Math.sin(a) * 5.73 * U, 9); }
      { // compass rose: 32 faint rhumb lines and half-shaded facets on each point
        x.save(); x.lineWidth = 0.8; for (let k = 0; k < 32; k++) { const a = k / 32 * Math.PI * 2; x.globalAlpha = k % 4 ? 0.22 : 0.45; x.beginPath(); x.moveTo(512 + Math.cos(a) * 1.3 * U, 512 + Math.sin(a) * 1.3 * U); x.lineTo(512 + Math.cos(a) * 5.55 * U, 512 + Math.sin(a) * 5.55 * U); x.stroke(); } x.restore();
        const P = DEF[0].p; x.save(); for (let k = 0; k < 8; k++) { const tp = P[1 + k], vl = P[9 + (k + 7) % 8]; x.globalAlpha = k % 2 ? 0.16 : 0.26; x.beginPath(); x.moveTo(512, 512); x.lineTo(X(tp[0]), Y(tp[1])); x.lineTo(X(vl[0]), Y(vl[1])); x.closePath(); x.fill(); } x.restore();
        x.save(); x.lineWidth = 1; x.beginPath(); x.arc(512, 512, 1.3 * U, 0, 7); x.stroke(); x.beginPath(); x.arc(512, 512, 0.45 * U, 0, 7); x.stroke(); x.restore();
        x.save(); x.font = '600 26px Cinzel, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; [['N', 0, 5.62], ['E', 5.62, 0], ['S', 0, -5.62], ['W', -5.62, 0]].forEach(([s, u, v]) => { x.fillStyle = '#0A1233'; x.beginPath(); x.arc(X(u), Y(v), 16, 0, 7); x.fill(); x.fillStyle = '#F3D99B'; x.fillText(s, X(u), Y(v) + 1); }); x.restore(); }
      // laurel: two branches hugging the cartouche, pointed leaves with midribs, a few berries, a ribbon bow
      const leaf = (cx, cy, len, w, ang) => { x.save(); x.translate(cx, cy); x.rotate(ang); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * 0.45, -w, len, 0); x.quadraticCurveTo(len * 0.45, w, 0, 0); x.closePath(); x.globalAlpha *= 0.14; x.fill(); x.globalAlpha /= 0.14; x.stroke(); x.save(); x.lineWidth = 0.7; x.beginPath(); x.moveTo(len * 0.08, 0); x.lineTo(len * 0.9, 0); x.stroke(); x.restore(); x.restore(); };
      [-1, 1].forEach(sd => { const rx = 6.25 * U, ry = 6.25 * U, cy = 512, A0 = Math.PI / 2 + sd * 0.1, A1 = Math.PI / 2 + sd * 1.25;
        x.lineWidth = 1.6; x.beginPath(); for (let k = 0; k <= 40; k++) { const a = A0 + (A1 - A0) * k / 40; k ? x.lineTo(512 + Math.cos(a) * rx, cy + Math.sin(a) * ry) : x.moveTo(512 + Math.cos(a) * rx, cy + Math.sin(a) * ry); } x.stroke();
        x.lineWidth = 1.2;
        for (let k = 0; k < 11; k++) { const t = 0.06 + k * 0.088, a = A0 + (A1 - A0) * t, px = 512 + Math.cos(a) * rx, py = cy + Math.sin(a) * ry, ta = a + sd * Math.PI / 2, sz = 1 - t * 0.55;
          leaf(px, py, 30 * sz, 9 * sz, ta + Math.PI + sd * 0.55); leaf(px, py, 26 * sz, 8 * sz, ta + Math.PI - sd * 0.75);
          if (k % 3 === 1) { x.beginPath(); x.arc(px + Math.cos(a) * 9, py + Math.sin(a) * 9, 3.2, 0, 7); x.fill(); } }
        leaf(512 + Math.cos(A1) * rx, cy + Math.sin(A1) * ry, 22, 7, A1 + sd * Math.PI / 2 + Math.PI); });
      x.lineWidth = 1.4; const by = Y(-6.3); x.beginPath(); x.moveTo(512, by); x.bezierCurveTo(512 - 34, by - 22, 512 - 46, by + 14, 512, by); x.bezierCurveTo(512 + 46, by + 14, 512 + 34, by - 22, 512, by); x.stroke();
      x.beginPath(); x.moveTo(512 - 4, by + 2); x.quadraticCurveTo(512 - 16, by + 26, 512 - 28, by + 34); x.moveTo(512 + 4, by + 2); x.quadraticCurveTo(512 + 16, by + 26, 512 + 28, by + 34); x.stroke(); x.beginPath(); x.arc(512, by, 4, 0, 7); x.fill();
      scatter(x, 10, 3); },
    (x) => { // Mole Antonelliana — traced line art of the engraving Lorenzo chose
      if (moleImg.complete && moleImg.naturalWidth) { const k = (9.6 / 1085) * U; x.drawImage(moleImg, 512 + (60 - 248) * k, 512 - (5.0 + 17 * 9.6 / 1085) * U, 380 * k, 1110 * k); }
      goldStroke(x, 1.4); scatter(x, 10, 7); },
    (x) => { // a 90s desktop computer — CRT monitor, case and keyboard, traced in gold
      if (pcImg.complete && pcImg.naturalWidth) { const k = 0.016 * U; x.drawImage(pcImg, 512 - 300 * k, 512 - 295 * k, 600 * k, 590 * k); }
      goldStroke(x, 1.4); x.save(); x.globalAlpha = 0.85; x.font = '500 25px ui-monospace, Menlo, monospace'; x.textAlign = 'left'; x.textBaseline = 'middle';
      ['C:\\LORENZO> dir /stack', ' VUE  NUXT  REACT  NODE', ' SQL  DOCKER  N8N  AI', 'C:\\LORENZO> _'].forEach((s, n) => x.fillText(s, X(-3.75), Y(3.2 - n * 0.62)));
      x.restore(); scatter(x, 12, 11); },
    (x) => { // a bunch of grapes — wood engraving from 'The Cultivation of the Native Grape' (1866), traced in gold
      if (grapeImg.complete && grapeImg.naturalWidth) { const k = (9.6 / 372) * U; x.drawImage(grapeImg, 512 - 155 * k, 512 - 186 * k, 311 * k, 372 * k); }
      goldStroke(x, 1.4); scatter(x, 12, 13); },
    (x) => { // an open book — from the title page of Nodier's 'The Bibliomaniac' (1894), traced in gold
      if (bookImg.complete && bookImg.naturalWidth) { const k = 0.0131 * 1.18 * U; x.drawImage(bookImg, 512 - 397 * k, 512 - 152 * k, 794 * k, 305 * k); }
      goldStroke(x, 1.4);
      dotted(x, () => { x.beginPath(); x.moveTo(X(-0.39), Y(1.05)); x.bezierCurveTo(X(-1.4), Y(3.0), X(0.7), Y(4.2), X(1.89), Y(4.84)); x.stroke(); });
      [[-1.05, 2.6, 12], [-0.25, 3.9, 16], [1.89, 4.84, 22]].forEach(([a, b, s]) => sparkle(x, X(a), Y(b), s)); scatter(x, 10, 17); },
    (x) => { // Leonardo da Vinci's hollow icosahedron (Pacioli, De divina proportione, 1509) — the D20
      if (icoImg.complete && icoImg.naturalWidth) { const k = (9 / 648) * U; x.drawImage(icoImg, 512 - 321 * k, 512 - 343 * k, 642 * k, 683 * k); }
      goldStroke(x, 2); x.textAlign = 'center'; x.textBaseline = 'middle';
      x.lineWidth = 2; x.beginPath(); x.moveTo(X(-3.6), Y(-4.85)); x.lineTo(X(3.6), Y(-4.85)); x.lineTo(X(3.2), Y(-5.5)); x.lineTo(X(3.6), Y(-6.15)); x.lineTo(X(-3.6), Y(-6.15)); x.lineTo(X(-3.2), Y(-5.5)); x.closePath(); x.stroke();
      x.font = '600 30px Cinzel, serif'; x.fillText('NATURAL TWENTY', 512, Y(-5.48)); scatter(x, 14, 19); },
    (x) => { // a staircase with scrolled brackets — from 'Stair-Building and the Steel Square' (1904), traced in gold
      if (stairImg.complete && stairImg.naturalWidth) { const k = (10 / 318) * U; x.drawImage(stairImg, 512 - 201 * k, 512 - 150 * k, 400 * k, 294 * k); }
      goldStroke(x, 1.4); scatter(x, 12, 23); },
    (x) => { // a bird in flight carrying a letter — chapbook woodcut, 'History of Birds' (c. 1830), in gold
      if (birdImg.complete && birdImg.naturalWidth) { const k = (11 / 641) * U; x.drawImage(birdImg, 512 - 320 * k, 512 - 157 * k, 641 * k, 314 * k); x.drawImage(birdImg, 512 - 320 * k, 512 - 157 * k, 641 * k, 314 * k); }
      goldStroke(x, 1.4); scatter(x, 12, 29); }
  ];
  const labelTex = (name, sub) => { const c = mkCanvas(1024, 220), x = c.getContext('2d'); goldStroke(x, 1.5); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '600 64px Cinzel, serif'; const sp = name.toUpperCase().split('').join(String.fromCharCode(8202)); x.fillText(sp, 512, 80);
    x.font = 'italic 500 44px "Cormorant Garamond", serif'; x.fillText(sub, 512, 160);
    const w = Math.min(460, x.measureText(sub).width / 2 + 120); x.beginPath(); x.moveTo(512 - w, 160); x.lineTo(512 - x.measureText(sub).width / 2 - 26, 160); x.moveTo(512 + x.measureText(sub).width / 2 + 26, 160); x.lineTo(512 + w, 160); x.stroke();
    return new T.CanvasTexture(c); };
  const ornTex = (kind) => { const c = mkCanvas(512, 512), x = c.getContext('2d'); goldStroke(x, 3);
    if (kind === 'saturn') { x.beginPath(); x.arc(256, 256, 90, 0, 7); x.stroke(); x.lineWidth = 1.5; for (let i = -60; i <= 60; i += 30) { x.beginPath(); x.ellipse(256, 256 + i, Math.sqrt(90 * 90 - i * i), 10, 0, 0, Math.PI); x.stroke(); } x.lineWidth = 3; x.beginPath(); x.ellipse(256, 256, 200, 48, -0.35, 0.15, Math.PI * 2 - 0.15 + Math.PI * 0); x.stroke(); }
    if (kind === 'moon') { x.beginPath(); x.arc(256, 256, 150, -1.2, 1.2 + Math.PI, true); x.stroke(); x.beginPath(); x.arc(330, 220, 130, -1.75, 1.95, true); x.stroke(); x.lineWidth = 1; for (let i = 0; i < 18; i++) { const a = 1.9 + i * 0.13; x.beginPath(); x.moveTo(256 + Math.cos(a) * 146, 256 + Math.sin(a) * 146); x.lineTo(256 + Math.cos(a) * 118, 256 + Math.sin(a) * 118); x.stroke(); } sparkle(x, 400, 120, 22); sparkle(x, 430, 360, 12); }
    if (kind === 'comet') { x.beginPath(); x.arc(380, 150, 34, 0, 7); x.stroke(); x.lineWidth = 1.5; for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(380 - 30, 150 + i * 9); x.quadraticCurveTo(250, 220 + i * 18, 70, 400 + i * 22); x.stroke(); } }
    if (kind === 'sun') { x.beginPath(); x.arc(256, 256, 70, 0, 7); x.stroke(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, L = i % 2 ? 130 : 170; x.beginPath(); x.moveTo(256 + Math.cos(a - 0.08) * 90, 256 + Math.sin(a - 0.08) * 90); x.lineTo(256 + Math.cos(a) * L, 256 + Math.sin(a) * L); x.lineTo(256 + Math.cos(a + 0.08) * 90, 256 + Math.sin(a + 0.08) * 90); x.stroke(); } x.lineWidth = 1.2; x.beginPath(); x.arc(256, 256, 54, 0, 7); x.stroke(); }
    return new T.CanvasTexture(c); };

  /* ---------- constellations ---------- */
  const DIR = DEF.map((_, i) => { const az = -i * 0.74 + 0.2, el = 0.12 + 0.2 * Math.sin(i * 1.4); return new T.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)); });
  const DIST = 40, SCALE = 1.42;
  const goldC = new T.Color(0xE2BE74);
  // shared textures for glowing strokes and ignition rings
  const stripeTex = (() => { const c = mkCanvas(8, 64), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(255,220,150,0)'); g.addColorStop(0.5, 'rgba(255,226,160,1)'); g.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = g; x.fillRect(0, 0, 8, 64); return new T.CanvasTexture(c); })();
  const ringTex = (() => { const c = mkCanvas(128, 128), x = c.getContext('2d'); x.strokeStyle = 'rgba(246,223,166,1)'; x.lineWidth = 3; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.stroke(); x.lineWidth = 1; x.globalAlpha = 0.5; x.beginPath(); x.arc(64, 64, 48, 0, 7); x.stroke(); return new T.CanvasTexture(c); })();
  const ribbonGeo = new T.PlaneGeometry(1, 1);
  // one continuous stroke per figure: pair odd vertices along shortest paths (retraced, not redrawn), then walk an Euler path
  const buildTrails = (d) => {
    const n = d.p.length, D = (a, b) => Math.hypot(d.p[a][0] - d.p[b][0], d.p[a][1] - d.p[b][1]);
    const multi = d.e.map(([a, b]) => ({ a, b, v: false })), deg = new Array(n).fill(0); multi.forEach(m => { deg[m.a]++; deg[m.b]++; });
    let odd = [...Array(n).keys()].filter(v => deg[v] % 2);
    while (odd.length > 2) { let bi = 1, bj = 2, bd = Infinity; for (let i = 0; i < odd.length; i++) for (let j = i + 1; j < odd.length; j++) { const dd = D(odd[i], odd[j]); if (dd < bd) { bd = dd; bi = i; bj = j; } } multi.push({ a: odd[bi], b: odd[bj], v: true }); odd = odd.filter((_, k) => k !== bi && k !== bj); }
    const used = new Array(multi.length).fill(false), inc = [...Array(n)].map(() => []); multi.forEach((m, k) => { inc[m.a].push(k); inc[m.b].push(k); });
    const start = odd.length ? Math.min(...odd) : 0, stack = [{ v: start, e: -1 }], seq = [];
    while (stack.length) { const top = stack[stack.length - 1], k = inc[top.v].find(q => !used[q]); if (k === undefined) seq.push(stack.pop()); else { used[k] = true; const m = multi[k]; stack.push({ v: m.a === top.v ? m.b : m.a, e: k }); } }
    seq.reverse(); const trails = [[]];
    for (let i = 1; i < seq.length; i++) { const m = multi[seq[i].e]; if (m.v) { if (trails[trails.length - 1].length) trails.push([]); continue; } trails[trails.length - 1].push({ a: seq[i - 1].v, b: seq[i].v }); }
    return trails.filter(t => t.length); };
  const cons = DEF.map((d, i) => {
    const g = new T.Group(); g.position.copy(DIR[i]).multiplyScalar(DIST); g.lookAt(0, 0, 0); g.scale.setScalar(SCALE); sc.add(g);
    const n = d.p.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), size = new Float32Array(n), base = [];
    d.p.forEach((v, k) => { pos.set([v[0], v[1], 0.05], k * 3); col.set([1, 0.93, 0.78], k * 3); base.push(6 + ((k * 37) % 4)); size[k] = base[k] * 0.35; });
    const sg = starGeo(pos, col, size, new Float32Array(n).fill(2)), sm = starMat({ tw: 0.25, max: 44, flare: 0.7, alpha: 0.6 }); g.add(new T.Points(sg, sm));
    const trails = buildTrails(d), segs = []; let cum = 0;
    trails.forEach((tr, ti) => { let c0 = 0; tr.forEach(st => { const sg2 = { a: new T.Vector2(d.p[st.a][0], d.p[st.a][1]), b: new T.Vector2(d.p[st.b][0], d.p[st.b][1]), ia: st.a, ib: st.b, trail: ti }; sg2.len = sg2.a.distanceTo(sg2.b); sg2.c0 = c0; c0 += sg2.len; sg2.ang = Math.atan2(sg2.b.y - sg2.a.y, sg2.b.x - sg2.a.x); segs.push(sg2); }); cum = Math.max(cum, c0); });
    const NT = trails.length;
    const lp = new Float32Array(segs.length * 6), lg = new T.BufferGeometry(); lg.setAttribute('position', new T.BufferAttribute(lp, 3));
    const lm = new T.LineBasicMaterial({ color: 0xFFF0C8, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }); g.add(new T.LineSegments(lg, lm));
    // soft glowing ribbons under each stroke
    const gm = new T.MeshBasicMaterial({ map: stripeTex, color: 0xE2BE74, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false });
    segs.forEach(s => { s.rib = new T.Mesh(ribbonGeo, gm); s.rib.rotation.z = s.ang; s.rib.visible = false; g.add(s.rib); });
    const glp = []; segs.forEach(s => glp.push(s.a.x, s.a.y, 0, s.b.x, s.b.y, 0));
    const gl = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(glp, 3)), new T.LineDashedMaterial({ color: 0xE2BE74, dashSize: 0.12, gapSize: 0.22, transparent: true, opacity: 0 })); gl.computeLineDistances(); g.add(gl);
    const art = new T.Mesh(new T.PlaneGeometry(16, 16), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); art.position.z = -0.05; g.add(art);
    const lab = new T.Mesh(new T.PlaneGeometry(9, 1.93), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); lab.position.set(0, i === 5 ? -7.4 : i === 7 ? -7.0 : i === 0 ? -7.35 : -6.3, 0); g.add(lab);
    const pen = new T.Points(starGeo(new Float32Array(NT * 3).fill(999), new Float32Array(NT * 3).map((_, k) => [1, 0.92, 0.75][k % 3]), new Float32Array(NT).fill(20), new Float32Array(NT).fill(2)), starMat({ tw: 0, max: 64, flare: 1.4, alpha: 0 })); g.add(pen);
    // pen trail dust
    const ND = 90, dP = new Float32Array(ND * 3).fill(999), dS = new Float32Array(ND), dust = new T.Points(starGeo(dP, new Float32Array(ND * 3).map((_, k) => k % 3 === 2 ? 0.6 : 1), dS, new Float32Array(ND).fill(1)), starMat({ tw: 0.5, max: 14, flare: 0.8 })); g.add(dust);
    const dV = []; for (let k = 0; k < ND; k++) dV.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0 });
    // expanding rings on ignition
    const rings = []; for (let k = 0; k < 6; k++) { const m = new T.Mesh(ribbonGeo, new T.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); m.position.z = 0.06; g.add(m); rings.push({ m, t: 1 }); }
    return { g, d, segs, NT, total: cum, lp, lg, lm, gm, gl, art, lab, pen, dust, dP, dS, dV, rings, sg, sm, base, size, draw: 0, done: false, ign: new Float32Array(n), flash: new Float32Array(n), lit: new Uint8Array(n), visited: false, facts: FACTS[i] || {}, hov: -1 };
  });
  const burst = (c, x, y, big) => { const r0 = c.rings.find(r => r.t >= 1) || c.rings[0]; r0.t = 0; r0.x = x; r0.y = y; r0.big = big ? 3.2 : 1; r0.m.position.x = x; r0.m.position.y = y; };
  const emitDust = (c, x, y, n) => { for (let k = 0; k < n; k++) { const p = c.dV.find(q => q.life <= 0); if (!p) return; p.x = x; p.y = y; const a = rnd() * Math.PI * 2, sp = 0.003 + rnd() * 0.012; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - 0.002; p.life = 1; p.s = 2 + rnd() * 4; } };
  // portrait inside the first constellation: set PHOTO_URL (a data: URL) to use the real photo
  const PHOTO_URL = '';
  const PORTRAIT = BASE + 'img/portrait.webp'; { const ci = document.getElementById('cameoImg'); if (ci) ci.src = PORTRAIT; }
  const silhouettePath = (x) => { const P = DEF[0].p; x.beginPath(); P.forEach((p, i) => { const q = P[(i + 1) % P.length], mx2 = (X(p[0]) + X(q[0])) / 2, my2 = (Y(p[1]) + Y(q[1])) / 2; if (i === 0) x.moveTo(mx2, my2); else x.quadraticCurveTo(X(p[0]), Y(p[1]), mx2, my2); }); const p0 = P[0], q0 = P[1]; x.quadraticCurveTo(X(p0[0]), Y(p0[1]), (X(p0[0]) + X(q0[0])) / 2, (Y(p0[1]) + Y(q0[1])) / 2); x.closePath(); };
  const portraitTex = (img) => { const c = mkCanvas(1024, 1024), x = c.getContext('2d'); x.save(); if (!img) { silhouettePath(x); x.clip(); }
    if (img) { const ps = 0.012467; x.drawImage(img, X((68 - 520) * ps), Y(4.9), 939 * ps * U, 754 * ps * U); }
    else { const g2 = x.createLinearGradient(0, Y(5), 0, Y(-4.4)); g2.addColorStop(0, '#2A3A78'); g2.addColorStop(1, '#0E1740'); x.fillStyle = g2; x.fillRect(0, 0, 1024, 1024); x.fillStyle = 'rgba(226,190,116,.18)'; x.beginPath(); x.ellipse(512, Y(2.3), 1.9 * U, 2.3 * U, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(512, Y(-3.6), 4.2 * U, 2.6 * U, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#F3D99B'; x.font = '600 34px Cinzel, serif'; x.textAlign = 'center'; x.fillText('YOUR PHOTO', 512, Y(-1.6)); x.font = 'italic 500 30px "Cormorant Garamond", serif'; x.fillText('revealed by the stars', 512, Y(-2.2)); }
    x.restore(); const g3 = x.createRadialGradient(512, 512, 2.5 * U, 512, 512, 6.5 * U); g3.addColorStop(0, 'rgba(0,0,0,0)'); g3.addColorStop(1, 'rgba(10,18,51,0.55)'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = g3; x.fillRect(0, 0, 1024, 1024); return new T.CanvasTexture(c); };
  const portrait = new T.Mesh(new T.PlaneGeometry(16, 16), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); portrait.position.z = -0.03; portrait.visible = false;
  let photoHover = false, photoA = 0;
  const buildArt = () => cons.forEach((c, i) => { const cnv = mkCanvas(1024, 1024), cx2 = cnv.getContext('2d'); if (i) ringFrame(cx2, FRAME_R[i], FRAME_C[i]); ART[i](cx2); goldStroke(cx2, 1.3); DECO[i](cx2); artCanvases[i] = cnv; c.art.material.map = new T.CanvasTexture(cnv); c.art.material.needsUpdate = true; c.lab.material.map = labelTex(NAMES[i], SUBS[i]); c.lab.material.needsUpdate = true; });
  let built = false; const doBuild = () => { if (built) return; built = true; buildArt(); cons[0].g.add(portrait); if (PHOTO_URL) { const im = new Image(); im.onload = () => { portrait.material.map = portraitTex(im); portrait.material.needsUpdate = true; }; im.src = PHOTO_URL; } portrait.material.map = portraitTex(null); portrait.material.needsUpdate = true; named.forEach(n => { n.lb.material.map = starLabel(n.nm); n.lb.material.opacity = 0.7; n.lb.material.needsUpdate = true; }); };
  const imgReady = (im) => new Promise(res => { if (im.complete) res(); else { im.onload = res; im.onerror = res; } }); const moleReady = Promise.all([imgReady(moleImg), imgReady(icoImg), imgReady(grapeImg), imgReady(stairImg), imgReady(bookImg), imgReady(pcImg), imgReady(birdImg)]);
  if (document.fonts && document.fonts.load) Promise.all([moleReady, document.fonts.load('600 40px Cinzel'), document.fonts.load('italic 600 40px "Cormorant Garamond"'), document.fonts.load('italic 500 40px "Cormorant Garamond"')]).then(doBuild, doBuild); setTimeout(doBuild, 2500);

  // sky ornaments, placed between the constellations
  [['moon', 0.05, 0.62, 13], ['saturn', -1.25, 0.55, 12], ['comet', -2.6, 0.62, 12], ['sun', -3.7, 0.55, 12], ['saturn', -4.9, -0.3, 9]].forEach(([k, az, el, s]) => {
    const m = new T.Mesh(new T.PlaneGeometry(s, s), new T.MeshBasicMaterial({ map: ornTex(k), transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending }));
    m.position.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).multiplyScalar(60); m.lookAt(0, 0, 0); sky.add(m); });

  // shooting stars
  const shg = new T.BufferGeometry(); shg.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3)); shg.setAttribute('color', new T.BufferAttribute(new Float32Array([0, 0, 0, 1, 0.9, 0.7]), 3));
  const shm = new T.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: T.AdditiveBlending }); sc.add(new T.Line(shg, shm));
  let shoot = null, nextShoot = 3000;

  /* ---------- camera & loop ---------- */
  const coordsEl = document.getElementById('coords');
  const dir = DIR[0].clone(), tgt = new T.Vector3(), m4 = new T.Matrix4(), qT = new T.Quaternion(), ORIGIN = new T.Vector3();
  cam.quaternion.setFromRotationMatrix(m4.lookAt(ORIGIN, DIR[0], new T.Vector3(0, 1, 0)));
  let shCur = 0.28, last = 0, started = false, coordT = 0;
  let curHov = null, fAvg = 16, fChk = 0;
  window.addEventListener('click', (e) => { if (!curHov || drawerOpen || e.target.closest('button, a, .panel, header, #moons, #plate, #full, #index, .cameo')) return; openDrawer(active); });
  const loop = (time) => {
    const dt = Math.min(50, time - (last || time)); last = time;
    mats.forEach(m => { m.uniforms.uTime.value = time; });
    const p = clamp(prog, 0, NS - 1), i0 = Math.floor(p), i1 = Math.min(NS - 1, i0 + 1), raw = p - i0, f = ease(raw);
    tgt.copy(DIR[i0]).lerp(DIR[i1], f).normalize();
    const look = tgt.clone().add(new T.Vector3(mx * 0.06, -my * 0.04, 0)).normalize();
    qT.setFromRotationMatrix(m4.lookAt(ORIGIN, look, new T.Vector3(0, 1, 0)));
    cam.quaternion.slerp(qT, 0.055);
    const narrow = W / H < 0.9;
    cam.fov += ((narrow ? 72 : 52) + Math.sin(raw * Math.PI) * 10 - cam.fov) * 0.08;
    // constellations
    let hoverInfo = null;
    cons.forEach((c, i) => {
      const isA = i === active;
      if (isA) { c.visited = true; c.draw = Math.min(c.total, c.draw + dt * 0.0095); }
      const k0 = c.draw; const penP = new Array(c.NT).fill(null);
      const segIdle = !isA && c._segK === k0; c._segK = k0;
      if (!segIdle) c.segs.forEach((s, k) => { const t = clamp((k0 - s.c0) / s.len, 0, 1); const ex = s.a.x + (s.b.x - s.a.x) * t, ey = s.a.y + (s.b.y - s.a.y) * t; c.lp.set([s.a.x, s.a.y, 0, ex, ey, 0], k * 6);
        if (t > 0) { const L = s.len * t; s.rib.visible = true; s.rib.scale.set(L, 0.42, 1); s.rib.position.set(s.a.x + (s.b.x - s.a.x) * t / 2, s.a.y + (s.b.y - s.a.y) * t / 2, 0.01); } else s.rib.visible = false;
        if (t > 0 && t < 1) penP[s.trail] = [ex, ey];
        if (k0 > s.c0 && !c.lit[s.ia]) { c.lit[s.ia] = 1; c.flash[s.ia] = 1; if (isA) { burst(c, s.a.x, s.a.y); emitDust(c, s.a.x, s.a.y, 8); } }
        if (t >= 1 && !c.lit[s.ib]) { c.lit[s.ib] = 1; c.flash[s.ib] = 1; if (isA) { burst(c, s.b.x, s.b.y); emitDust(c, s.b.x, s.b.y, 10); } } });
      if (!segIdle) c.lg.attributes.position.needsUpdate = true;
      const done = c.draw >= c.total - 1e-3;
      if (done && !c.done) { c.done = true; if (isA) { for (let v = 0; v < c.base.length; v++) c.flash[v] = 1.2; burst(c, 0, 0, true); } }
      c.lm.opacity += ((isA ? 0.95 : c.visited ? 0.32 : 0) - c.lm.opacity) * 0.06;
      c.gm.opacity += ((isA ? 0.55 + 0.12 * Math.sin(time * 0.002 + i) : c.visited ? 0.14 : 0) - c.gm.opacity) * 0.06;
      c.gl.material.opacity += ((isA && !done ? 0.28 : !c.visited ? 0.06 : 0) - c.gl.material.opacity) * 0.05;
      c.art.material.opacity += ((isA && c.draw > c.total * 0.55 ? 0.75 : 0) - c.art.material.opacity) * (isA ? 0.03 : 0.08);
      c.lab.material.opacity += ((isA && done ? 1 : c.visited ? 0.25 : 0) - c.lab.material.opacity) * 0.05;
      c.sm.uniforms.uAlpha.value += ((isA ? 1 : c.visited ? 0.55 : 0.35) - c.sm.uniforms.uAlpha.value) * 0.06;
      // stars: ignition, flash, and a gentle pulse on the ones that hold a note
      for (let v = 0; v < c.base.length; v++) { c.ign[v] += ((c.lit[v] ? 1 : 0) - c.ign[v]) * 0.12; c.flash[v] *= 0.94;
        const note = isA && done && c.facts[v] ? 1 + 0.16 * (0.5 + 0.5 * Math.sin(time * 0.004 + v * 1.7)) : 1;
        c.size[v] = c.base[v] * (0.35 + 0.65 * c.ign[v]) * (1 + c.flash[v] * 1.1) * note * (c.hov === v ? 1.5 : 1); }
      { let mv = isA; if (!mv) for (let v = 0; v < c.base.length; v++) if (c.flash[v] > 0.01 || Math.abs(c.ign[v] - (c.lit[v] ? 1 : 0)) > 0.01) { mv = true; break; } if (mv || !c._st) c.sg.attributes.aSize.needsUpdate = true; c._st = !mv; }
      // the pen and its trail
      const anyPen = isA && penP.some(q => q);
      if (anyPen) { const pa = c.pen.geometry.attributes.position.array; penP.forEach((q, k) => { if (q) { pa.set([q[0], q[1], 0.08], k * 3); if (rnd() < 0.7) emitDust(c, q[0], q[1], 1); } else pa.set([999, 999, 0], k * 3); }); c.pen.geometry.attributes.position.needsUpdate = true; c.pen.material.uniforms.uAlpha.value += (1 - c.pen.material.uniforms.uAlpha.value) * 0.3; } else c.pen.material.uniforms.uAlpha.value *= 0.85;
      let anyDust = false; c.dV.forEach((p, k) => { if (p.life > 0) { anyDust = true; p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06; p.vy -= 0.00002 * dt; p.life -= 0.0011 * dt; c.dP[k * 3] = p.x; c.dP[k * 3 + 1] = p.y; c.dP[k * 3 + 2] = 0.07; c.dS[k] = p.s * Math.max(0, p.life); } else { c.dS[k] = 0; } });
      if (anyDust || c._dust) { c.dust.geometry.attributes.position.needsUpdate = true; c.dust.geometry.attributes.aSize.needsUpdate = true; } c._dust = anyDust;
      // rings
      c.art.visible = c.art.material.opacity > 0.004; c.lab.visible = c.lab.material.opacity > 0.004; c.gl.visible = c.gl.material.opacity > 0.004; c.rings.forEach(r => { r.m.visible = r.t < 1; });
      c.rings.forEach(r => { if (r.t < 1) { r.t = Math.min(1, r.t + dt * 0.0012); const e = 1 - Math.pow(1 - r.t, 3); r.m.scale.setScalar((0.3 + e * 2.2) * r.big); r.m.material.opacity = (1 - r.t) * 0.45; } else r.m.material.opacity = 0; });
      // hover notes
      c.hov = -1;
      if (isA && done) { const rect = cvRect; for (const key in c.facts) { const v = +key; const wp = new T.Vector3(c.d.p[v][0], c.d.p[v][1], 0.05).applyMatrix4(c.g.matrixWorld).project(cam); const sx = (wp.x * 0.5 + 0.5) * rect.width + rect.left, sy = (-wp.y * 0.5 + 0.5) * rect.height + rect.top; if (Math.hypot(sx - px, sy - py) < 26) { c.hov = v; hoverInfo = { sx, sy, txt: c.facts[key], n: i }; break; } } }
    });

    
    curHov = hoverInfo; showTip(hoverInfo);
    // shooting star
    if (!shoot && time > nextShoot) { const a = tgt.clone().multiplyScalar(70).add(new T.Vector3((rnd() - .5) * 50, 14 + rnd() * 10, (rnd() - .5) * 20)); shoot = { a, v: new T.Vector3(-(0.6 + rnd()), -0.45, (rnd() - .5) * 0.3).normalize(), t: 0 }; }
    if (shoot) { shoot.t += dt / 1100; const head = shoot.a.clone().addScaledVector(shoot.v, shoot.t * 34), tail = head.clone().addScaledVector(shoot.v, -7); shg.attributes.position.array.set([tail.x, tail.y, tail.z, head.x, head.y, head.z]); shg.attributes.position.needsUpdate = true; shm.opacity = Math.sin(Math.min(1, shoot.t) * Math.PI); if (shoot.t >= 1) { shoot = null; shm.opacity = 0; nextShoot = time + 4000 + rnd() * 6000; } }
    // panel-aware framing
    const target = narrow ? 0 : (SIDE[i0] + (SIDE[i1] - SIDE[i0]) * f) * 0.27; shCur += (target - shCur) * 0.07;
    cam.setViewOffset(W, H, -shCur * Math.min(W, 1700) * 0.5, narrow ? H * 0.17 : 0, W, H); cam.aspect = W / H; cam.updateProjectionMatrix();
    fAvg = fAvg * 0.95 + dt * 0.05; fChk += dt;
    if (fChk > 1500) { fChk = 0; const cur = r.getPixelRatio(), mx2 = PR(); let nx = cur; if (fAvg > 21 && cur > 0.75) nx = Math.max(0.75, cur - 0.15); else if (fAvg < 14 && cur < mx2) nx = Math.min(mx2, cur + 0.1);
      if (nx !== cur) { r.setPixelRatio(nx); r.setSize(W, H, false); mats.forEach(m => { if (m.uniforms.uPR) m.uniforms.uPR.value = nx; }); } }
    r.render(sc, cam);
    coordT += dt; if (coordT > 120) { coordT = 0; const fw = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); let ra = Math.atan2(fw.x, -fw.z) / (Math.PI * 2) * 24; if (ra < 0) ra += 24; const dec = Math.asin(clamp(fw.y, -1, 1)) * 180 / Math.PI; coordsEl.textContent = 'RA ' + String(Math.floor(ra)).padStart(2, '0') + 'h ' + String(Math.floor((ra % 1) * 60)).padStart(2, '0') + 'm · DEC ' + (dec >= 0 ? '+' : '−') + String(Math.abs(Math.round(dec))).padStart(2, '0') + '°'; }
    if (!started) { started = true; setTimeout(() => intro.classList.add('done'), 1600); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
