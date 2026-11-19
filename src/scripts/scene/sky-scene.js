import * as THREE from 'three';
import { CHAPTERS, CHAPTER_COUNT, chapterSkyAngles } from '../../data/chapters.js';
import { clamp, easeInOutCubic } from '../../lib/math.js';
import { drawChapterArt } from '../art/chapter-art.js';
import { loadEngravingImages } from '../art/engravings.js';
import { state } from '../state.js';
import { Constellation } from './constellation.js';
import { createShootingStar } from './shooting-star.js';
import { createSky, directionFromAngles } from './sky.js';
import { setStarPixelRatio, setStarTime } from './star-points.js';
import { createConstellationLabelTexture } from './textures.js';

const UP = new THREE.Vector3(0, 1, 0);
const ORIGIN = new THREE.Vector3();
const ART_BUILD_TIMEOUT = 2500;
const ART_FONTS = ['600 40px Cinzel', 'italic 600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"'];

const preferredPixelRatio = () => {
  const device = window.devicePixelRatio || 1;
  const pixels = innerWidth * innerHeight;
  return Math.min(device, pixels > 2.2e6 ? 1 : pixels > 1.3e6 ? 1.25 : 1.5);
};

const pad2 = (value) => String(value).padStart(2, '0');

const formatSkyCoordinates = (camera) => {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  let rightAscension = Math.atan2(forward.x, -forward.z) / (Math.PI * 2) * 24;
  if (rightAscension < 0) rightAscension += 24;
  const declination = Math.asin(clamp(forward.y, -1, 1)) * 180 / Math.PI;
  return 'RA ' + pad2(Math.floor(rightAscension)) + 'h ' + pad2(Math.floor((rightAscension % 1) * 60)) + 'm · DEC ' + (declination >= 0 ? '+' : '−') + pad2(Math.abs(Math.round(declination))) + '°';
};

const createAdaptiveResolution = (renderer, getSize) => {
  let averageFrame = 16;
  let elapsed = 0;
  return (dt) => {
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

export const startSkyScene = ({ canvas, coordsElement, onHover, onStart }) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false });
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

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 500);
  const { paintStarNames, addOrnaments } = createSky(scene);

  const directions = CHAPTERS.map((_, i) => {
    const { azimuth, elevation } = chapterSkyAngles(i);
    return directionFromAngles(azimuth, elevation);
  });
  const constellations = CHAPTERS.map((chapter, i) => new Constellation(chapter, directions[i], scene));

  let artBuilt = false;
  const buildArt = () => {
    if (artBuilt) return;
    artBuilt = true;
    constellations.forEach((constellation, i) => {
      const artTexture = new THREE.CanvasTexture(drawChapterArt(i));
      constellation.setArt(artTexture, createConstellationLabelTexture(CHAPTERS[i].name, CHAPTERS[i].subtitle));
    });
    paintStarNames();
  };
  const imagesReady = loadEngravingImages();
  if (document.fonts && document.fonts.load) Promise.all([imagesReady, ...ART_FONTS.map((font) => document.fonts.load(font))]).then(buildArt, buildArt);
  setTimeout(buildArt, ART_BUILD_TIMEOUT);

  addOrnaments();
  const updateShootingStar = createShootingStar(scene);
  const updateResolution = createAdaptiveResolution(renderer, () => ({ width, height }));

  const viewDirection = new THREE.Vector3();
  const lookMatrix = new THREE.Matrix4();
  const targetRotation = new THREE.Quaternion();
  camera.quaternion.setFromRotationMatrix(lookMatrix.lookAt(ORIGIN, directions[0], UP));

  let sideShift = 0.28;
  let lastTime = 0;
  let started = false;
  let coordsElapsed = 0;

  const frame = (time) => {
    const dt = Math.min(50, time - (lastTime || time));
    lastTime = time;
    setStarTime(time);

    const progress = clamp(state.scrollProgress, 0, CHAPTER_COUNT - 1);
    const from = Math.floor(progress);
    const to = Math.min(CHAPTER_COUNT - 1, from + 1);
    const raw = progress - from;
    const eased = easeInOutCubic(raw);
    viewDirection.copy(directions[from]).lerp(directions[to], eased).normalize();
    const look = viewDirection.clone().add(new THREE.Vector3(state.parallax.x * 0.06, -state.parallax.y * 0.04, 0)).normalize();
    targetRotation.setFromRotationMatrix(lookMatrix.lookAt(ORIGIN, look, new THREE.Vector3(0, 1, 0)));
    camera.quaternion.slerp(targetRotation, 0.055);
    const narrow = width / height < 0.9;
    camera.fov += ((narrow ? 72 : 52) + Math.sin(raw * Math.PI) * 10 - camera.fov) * 0.08;

    let hoverInfo = null;
    constellations.forEach((constellation, index) => {
      const info = constellation.update({ index, isActive: index === state.activeChapter, time, dt, camera, canvasRect, pointer: state.pointer });
      if (info) hoverInfo = info;
    });
    onHover(hoverInfo);

    updateShootingStar(time, dt, viewDirection);

    const target = narrow ? 0 : (CHAPTERS[from].side + (CHAPTERS[to].side - CHAPTERS[from].side) * eased) * 0.27;
    sideShift += (target - sideShift) * 0.07;
    camera.setViewOffset(width, height, -sideShift * Math.min(width, 1700) * 0.5, narrow ? height * 0.17 : 0, width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    updateResolution(dt);
    renderer.render(scene, camera);

    coordsElapsed += dt;
    if (coordsElapsed > 120) {
      coordsElapsed = 0;
      coordsElement.textContent = formatSkyCoordinates(camera);
    }
    if (!started) {
      started = true;
      onStart();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
