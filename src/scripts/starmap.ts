import { drawAllChapterArt, whenArtAssetsReady } from './art/art-assets';
import { state, trackPointer } from './state';
import { type ChartSheet, createChartSheet } from './ui/chart-sheet';
import { byId } from './ui/dom';
import { createFullMap } from './ui/full-map';
import { bindKeyboard } from './ui/keyboard';
import { createNavigation } from './ui/navigation';
import { createStarTip } from './ui/star-tip';
import { createStaticSky } from './ui/static-sky';

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
  // Closing the intro also reveals the text, which waits hidden behind it (see intro.css).
  const closeIntro = () => {
    intro.classList.add('is-done');
    document.documentElement.classList.add('intro-done');
  };
  const canvas = byId<HTMLCanvasElement>('sky-canvas');
  const showStaticSky = createStaticSky(canvas);
  // A stable signal for tests and tooling that every engraving is in place.
  const markArtReady = () => document.documentElement.setAttribute('data-art-ready', '');

  // No WebGL (or the scene chunk failed to load): a static sky, the intro closes at once,
  // and the engravings are still drawn for the chart sheet and the full map.
  const fallBackToStaticSky = (error: unknown) => {
    console.warn('3D sky unavailable, showing a static one instead.', error);
    showStaticSky(true);
    closeIntro();
    whenArtAssetsReady()
      .then(() => drawAllChapterArt())
      .then(markArtReady);
  };

  // Three.js and the scene come in a separate chunk, loaded after the text is on screen.
  import('./scene/sky-scene')
    .then(({ startSkyScene }) =>
      startSkyScene({
        canvas,
        coordsElement: byId('coords'),
        onHover: (hover) => {
          state.hoveredNote = hover;
          showStarTip(hover);
        },
        onStart: () => setTimeout(closeIntro, INTRO_HOLD),
        onArtReady: markArtReady,
        onContextLost: () => showStaticSky(true),
        onContextRestored: () => showStaticSky(false)
      })
    )
    .catch(fallBackToStaticSky);

  window.addEventListener('click', (event) => {
    if (!state.hoveredNote || chartSheet.isOpen || (event.target as Element).closest(NOT_A_STAR_CLICK)) return;
    chartSheet.open(state.activeChapter);
  });
}
