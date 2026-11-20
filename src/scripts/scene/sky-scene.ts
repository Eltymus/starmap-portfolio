import { OUTPUT_COLOR_SPACE } from './color-management';
import * as THREE from 'three';
import { CHAPTERS, CHAPTER_COUNT, chapterSkyAngles } from '../../data/chapters';
import { clamp, easeInOutCubic } from '../../lib/math';
import { prefersReducedMotion } from '../../lib/motion';
import { formatSkyCoordinates } from '../../lib/sky-coordinates';
import { yieldToMain } from '../../lib/yield';
import { drawAllChapterArt, whenArtAssetsReady } from '../art/art-assets';
import { state } from '../state';
import { Constellation, type HoveredNote } from './constellation';
import { createShootingStar } from './shooting-star';
import { createSky, directionFromAngles } from './sky';
import { setStarPixelRatio, setStarTime } from './star-points';
import { createConstellationLabelTexture } from './textures';

export interface SkySceneOptions {
  canvas: HTMLCanvasElement;
  coordsElement: HTMLElement;
  /** Called every frame with the star note under the pointer, or null. */
  onHover: (hover: HoveredNote | null) => void;
  /** Called once, after the first frame has been rendered. */
  onStart: () => void;
  /** Called once the engravings have been drawn (they also back the chart sheet and the full map). */
  onArtReady?: () => void;
  /** The GPU dropped the WebGL context (driver reset, too many contexts): the sky stops drawing. */
  onContextLost?: () => void;
  /** The context is back and the sky draws again. */
  onContextRestored?: () => void;
}

const UP = new THREE.Vector3(0, 1, 0);
const ORIGIN = new THREE.Vector3();
const FORWARD = new THREE.Vector3(0, 0, -1);

const preferredPixelRatio = () => {
  const device = window.devicePixelRatio || 1;
  const pixels = innerWidth * innerHeight;
  return Math.min(device, pixels > 2.2e6 ? 1 : pixels > 1.3e6 ? 1.25 : 1.5);
};

const createAdaptiveResolution = (renderer: THREE.WebGLRenderer, getSize: () => { width: number; height: number }) => {
  let averageFrame = 16;
  let elapsed = 0;
  return (dt: number): void => {
    averageFrame = averageFrame * 0.95 + dt * 0.05;
    elapsed += dt;
    if (elapsed <= 1500) return;
    elapsed = 0;
    const current = renderer.getPixelRatio();
    const ceiling = preferredPixelRatio();
    let next = current;
    if (averageFrame > 21 && current > 0.75) next = Math.max(0.75, current - 0.15);
    else if (averageFrame < 14 && current < ceiling) next = Math.min(ceiling, current + 0.1);
    if (next === current) return;
    const { width, height } = getSize();
    renderer.setPixelRatio(next);
    renderer.setSize(width, height, false);
    setStarPixelRatio(next);
  };
};

/**
 * Starts the 3D sky on the canvas. Rejects if WebGL is not available (the renderer cannot get a context):
 * the caller shows a static sky instead.
 *
 * The start-up is split into short tasks so that the page stays responsive while the sky is built: the browser gets
 * the main thread back between steps, shaders compile in parallel (`compileAsync`) before the frame that first needs
 * them, and the engravings are drawn one per task.
 */
export const startSkyScene = async ({
  canvas,
  coordsElement,
  onHover,
  onStart,
  onArtReady,
  onContextLost,
  onContextRestored
}: SkySceneOptions): Promise<void> => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false
  });
  renderer.outputColorSpace = OUTPUT_COLOR_SPACE;
  renderer.setPixelRatio(preferredPixelRatio());
  let width = 1;
  let height = 1;
  let canvasRect = canvas.getBoundingClientRect();
  const fit = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    renderer.setPixelRatio(preferredPixelRatio());
    if (width && height) renderer.setSize(width, height, false);
    canvasRect = canvas.getBoundingClientRect();
    setStarPixelRatio(renderer.getPixelRatio());
  };
  new ResizeObserver(fit).observe(canvas);
  fit();
  await yieldToMain();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 500);
  const { paintStarNames, addOrnaments, paintOrnamentImages } = createSky(scene);
  await yieldToMain();

  const directions = CHAPTERS.map((_, i) => {
    const { azimuth, elevation } = chapterSkyAngles(i);
    return directionFromAngles(azimuth, elevation);
  });
  const constellations = CHAPTERS.map((chapter, i) => new Constellation(chapter, directions[i], scene));
  addOrnaments();
  const updateShootingStar = createShootingStar(scene);
  const updateResolution = createAdaptiveResolution(renderer, () => ({ width, height }));
  await yieldToMain();

  // While a compile is pending, frames skip rendering: drawing a material whose shader is still compiling would block
  // the main thread until it is done. The canvas keeps showing the last frame meanwhile.
  let pendingCompiles = 0;
  const compileShaders = async () => {
    pendingCompiles++;
    try {
      await renderer.compileAsync(scene, camera);
    } finally {
      pendingCompiles = Math.max(0, pendingCompiles - 1);
    }
  };

  // The engravings come after the first frame. Each one is drawn in its own task while the sky keeps moving; then
  // they are swapped in together, and the frames wait for the one new shader they need. (A texture goes to the GPU
  // when its constellation first comes into view, so those uploads are spread out by themselves.)
  const addChapterArt = async () => {
    await whenArtAssetsReady();
    const textures: [art: THREE.Texture, label: THREE.Texture][] = [];
    await drawAllChapterArt((art, i) =>
      textures.push([
        new THREE.CanvasTexture(art),
        createConstellationLabelTexture(CHAPTERS[i].name, CHAPTERS[i].subtitle)
      ])
    );
    await yieldToMain();
    textures.forEach(([art, label], i) => constellations[i].setArt(art, label));
    paintStarNames();
    paintOrnamentImages();
    await compileShaders();
    onArtReady?.();
  };

  const viewDirection = new THREE.Vector3();
  const lookMatrix = new THREE.Matrix4();
  const targetRotation = new THREE.Quaternion();
  camera.quaternion.setFromRotationMatrix(lookMatrix.lookAt(ORIGIN, directions[0], UP));

  let sideShift = 0.28;
  let lastTime = 0;
  let started = false;
  let coordsElapsed = 0;
  let frameRequest = 0;

  const frame = (time: number): void => {
    const dt = Math.min(50, time - (lastTime || time));
    lastTime = time;
    // Reduced motion: the camera jumps, nothing twinkles or drifts, constellations appear already drawn.
    const still = prefersReducedMotion();
    const clock = still ? 0 : time;
    const ease = (rate: number) => (still ? 1 : rate);
    setStarTime(clock);

    const progress = clamp(state.scrollProgress, 0, CHAPTER_COUNT - 1);
    const from = Math.floor(progress);
    const to = Math.min(CHAPTER_COUNT - 1, from + 1);
    const raw = progress - from;
    const eased = easeInOutCubic(raw);
    viewDirection.copy(directions[from]).lerp(directions[to], eased).normalize();
    const look = viewDirection
      .clone()
      .add(still ? ORIGIN : new THREE.Vector3(state.parallax.x * 0.06, -state.parallax.y * 0.04, 0))
      .normalize();
    targetRotation.setFromRotationMatrix(lookMatrix.lookAt(ORIGIN, look, new THREE.Vector3(0, 1, 0)));
    camera.quaternion.slerp(targetRotation, ease(0.055));
    const narrow = width / height < 0.9;
    camera.fov += ((narrow ? 72 : 52) + Math.sin(raw * Math.PI) * 10 - camera.fov) * ease(0.08);

    let hoverInfo = null;
    constellations.forEach((constellation, index) => {
      const info = constellation.update({
        index,
        isActive: index === state.activeChapter,
        time: clock,
        dt,
        still,
        camera,
        canvasRect,
        pointer: state.pointer
      });
      if (info) hoverInfo = info;
    });
    onHover(hoverInfo);

    updateShootingStar(time, dt, viewDirection, !still);

    const target = narrow ? 0 : (CHAPTERS[from].side + (CHAPTERS[to].side - CHAPTERS[from].side) * eased) * 0.27;
    sideShift += (target - sideShift) * ease(0.07);
    camera.setViewOffset(
      width,
      height,
      -sideShift * Math.min(width, 1700) * 0.5,
      narrow ? height * 0.17 : 0,
      width,
      height
    );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    updateResolution(dt);
    if (pendingCompiles === 0) renderer.render(scene, camera);

    coordsElapsed += dt;
    if (coordsElapsed > 120) {
      coordsElapsed = 0;
      coordsElement.textContent = formatSkyCoordinates(FORWARD.clone().applyQuaternion(camera.quaternion));
    }
    if (!started) {
      started = true;
      onStart();
    }
    frameRequest = requestAnimationFrame(frame);
  };

  const startLoop = () => {
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(frame);
  };

  // three already calls preventDefault() on a lost context, which allows it to be restored, and rebuilds
  // its GPU state (buffers, textures, shaders) on restore. Here: stop the loop meanwhile, then resume it.
  let contextLost = false;
  canvas.addEventListener('webglcontextlost', () => {
    contextLost = true;
    cancelAnimationFrame(frameRequest);
    onContextLost?.();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    lastTime = 0;
    // A compile that was pending when the context went away may never report back: draw again regardless.
    pendingCompiles = 0;
    onContextRestored?.();
    startLoop();
  });

  await compileShaders();
  if (!contextLost) startLoop();
  void addChapterArt();
};
