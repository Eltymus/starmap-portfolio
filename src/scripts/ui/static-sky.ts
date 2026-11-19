import { assetUrl } from '../../lib/assets';

const STATIC_SKY_URL = assetUrl('img/static-sky.webp');

/**
 * A flat picture of the sky that stands in for the 3D one when WebGL is missing or its context is lost.
 * The image is only requested the first time it is shown. Returns a function that shows or hides it.
 */
export const createStaticSky = (canvas: HTMLCanvasElement): ((visible: boolean) => void) => {
  let image: HTMLImageElement | null = null;
  return (visible) => {
    if (visible && !image) {
      image = document.createElement('img');
      image.className = 'static-sky';
      image.src = STATIC_SKY_URL;
      image.alt = '';
      image.decoding = 'async';
      canvas.after(image);
    }
    document.documentElement.toggleAttribute('data-static-sky', visible);
  };
};
