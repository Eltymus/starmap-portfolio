import * as THREE from 'three';
import { startSkyScene } from './scene/sky-scene.js';
import { state, trackPointer } from './state.js';
import { createChartSheet } from './ui/chart-sheet.js';
import { createFullMap } from './ui/full-map.js';
import { bindKeyboard } from './ui/keyboard.js';
import { createNavigation } from './ui/navigation.js';
import { createStarTip } from './ui/star-tip.js';

const INTRO_HOLD = 1600;
const NOT_A_STAR_CLICK = 'button, a, .panel, header, #moons, #chart-sheet, #full-map, .cameo';

export function startStarMap() {
  trackPointer();
  const showStarTip = createStarTip();
  let sheet = null;
  const navigation = createNavigation({
    onChapterChange: () => {
      if (sheet && sheet.isOpen) sheet.close();
    }
  });
  sheet = createChartSheet({ goTo: navigation.goTo });
  const fullMap = createFullMap({ goTo: navigation.goTo });
  bindKeyboard({ navigation, sheet, fullMap });

  const intro = document.getElementById('intro');
  if (!THREE || !THREE.WebGLRenderer) {
    intro.classList.add('is-done');
    return;
  }

  startSkyScene({
    canvas: document.getElementById('sky-canvas'),
    coordsElement: document.getElementById('coords'),
    onHover: (hover) => {
      state.hoveredNote = hover;
      showStarTip(hover);
    },
    onStart: () => setTimeout(() => intro.classList.add('is-done'), INTRO_HOLD)
  });

  window.addEventListener('click', (event) => {
    if (!state.hoveredNote || sheet.isOpen || event.target.closest(NOT_A_STAR_CLICK)) return;
    sheet.open(state.activeChapter);
  });
}
