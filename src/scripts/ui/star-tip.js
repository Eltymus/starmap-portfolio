import { CHAPTERS } from '../../data/chapters.js';

const VISIBLE_CLASS = 'is-visible';
const OFFSET_X = 26;
const OFFSET_Y = 22;
const VIEWPORT_MARGIN = 8;
const OBSTACLES = '.chapter.is-active .panel, #moons, header .header-meta, header .logo, #coords, #scroll-hint';

const overlaps = (box, rect) =>
  !(box.r <= rect.left || box.l >= rect.right || box.b <= rect.top || box.t >= rect.bottom);

export const createStarTip = () => {
  const tip = document.getElementById('star-tip');
  const title = tip.querySelector('b');
  const text = tip.querySelector('span');
  let currentKey = '';

  const hide = () => {
    tip.classList.remove(VISIBLE_CLASS);
    document.body.style.cursor = '';
    currentKey = '';
  };

  const choosePlacement = (x, y) => {
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const obstacles = [...document.querySelectorAll(OBSTACLES)]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width);
    const candidates = [
      ['up-right', x + OFFSET_X, y - OFFSET_Y - height],
      ['up-left', x - OFFSET_X - width, y - OFFSET_Y - height],
      ['down-right', x + OFFSET_X, y + OFFSET_Y],
      ['down-left', x - OFFSET_X - width, y + OFFSET_Y]
    ];
    let pick = candidates[0];
    let best = -1;
    candidates.forEach((candidate) => {
      const box = { l: candidate[1], t: candidate[2], r: candidate[1] + width, b: candidate[2] + height };
      let score = 0;
      if (
        box.l > VIEWPORT_MARGIN &&
        box.t > VIEWPORT_MARGIN &&
        box.r < window.innerWidth - VIEWPORT_MARGIN &&
        box.b < window.innerHeight - VIEWPORT_MARGIN
      )
        score += 2;
      if (!obstacles.some((rect) => overlaps(box, rect))) score += 3;
      if (score > best) {
        best = score;
        pick = candidate;
      }
    });
    return pick;
  };

  return (hover) => {
    if (!hover) return hide();
    document.body.style.cursor = 'pointer';
    const key = hover.n + hover.txt;
    if (key !== currentKey) {
      currentKey = key;
      title.textContent = CHAPTERS[hover.n].numeral + ' · ' + CHAPTERS[hover.n].name;
      text.textContent = hover.txt;
      tip.classList.remove(VISIBLE_CLASS);
      void tip.offsetWidth;
    }
    const [placement, left, top] = choosePlacement(hover.sx, hover.sy);
    tip.className = VISIBLE_CLASS + ' ' + placement;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  };
};
