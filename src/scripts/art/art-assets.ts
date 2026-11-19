import { CHAPTERS } from '../../data/chapters';
import { drawChapterArt } from './chapter-art';
import { loadEngravingImages } from './engravings';

/** After this long the art is drawn anyway, with whatever images and fonts have arrived. */
const ART_ASSETS_TIMEOUT = 2500;
const ART_FONTS = ['600 40px Cinzel', 'italic 600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"'];

/** Resolves once the engraving images and the fonts the art is lettered in are loaded, or after a timeout. */
export const whenArtAssetsReady = (): Promise<void> => {
  const fonts = document.fonts?.load ? ART_FONTS.map((font) => document.fonts.load(font)) : [];
  const loaded = Promise.all([loadEngravingImages(), ...fonts]).then(
    () => undefined,
    () => undefined
  );
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, ART_ASSETS_TIMEOUT));
  return Promise.race([loaded, timeout]);
};

/** Draws every chapter's engraving: the 3D sky, the chart sheet and the full map all read them. */
export const drawAllChapterArt = (): HTMLCanvasElement[] => CHAPTERS.map((_, index) => drawChapterArt(index));
