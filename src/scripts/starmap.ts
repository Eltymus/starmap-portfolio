import * as THREE from 'three';
import { startSkyScene } from './scene/sky-scene';
import { state, trackPointer } from './state';
import { type ChartSheet, createChartSheet } from './ui/chart-sheet';
import { byId } from './ui/dom';
import { createFullMap } from './ui/full-map';
import { bindKeyboard } from './ui/keyboard';
import { createNavigation } from './ui/navigation';
import { createStarTip } from './ui/star-tip';

const INTRO_HOLD = 1600;
const NOT_A_STAR_CLICK = 'button, a, .panel, header, #moons, #chart-sheet, #full-map, .cameo';

export function startStarMap(): void {
  trackPointer();
  const showStarTip = createStarTip();
  let sheet: ChartSheet | null = null;
  const navigation = createNavigation({
    onChapterChange: () => {
      sheet?.dismiss();
    }
  });
  const chartSheet = createChartSheet({ goTo: navigation.goTo });
  sheet = chartSheet;
  const fullMap = createFullMap({ goTo: navigation.goTo });
  bindKeyboard({ navigation, sheet: chartSheet, fullMap });

  const intro = byId('intro');
  if (!THREE || !THREE.WebGLRenderer) {
    intro.classList.add('is-done');
    return;
  }

  startSkyScene({
    canvas: byId<HTMLCanvasElement>('sky-canvas'),
    coordsElement: byId('coords'),
    onHover: (hover) => {
      state.hoveredNote = hover;
      showStarTip(hover);
    },
    onStart: () => setTimeout(() => intro.classList.add('is-done'), INTRO_HOLD)
  });

  window.addEventListener('click', (event) => {
    if (!state.hoveredNote || chartSheet.isOpen || (event.target as Element).closest(NOT_A_STAR_CLICK)) return;
    chartSheet.open(state.activeChapter);
  });
}
