import type { HoveredNote, Pointer } from './scene/constellation';

/** Shared, mutable state read by the render loop and written by the UI. */
interface StarMapState {
  /** Index of the chapter in view; -1 before the first scroll event. */
  activeChapter: number;
  /** Scroll position in chapters (1.5 = halfway between the second and third). */
  scrollProgress: number;
  pointer: Pointer;
  /** Pointer position relative to the viewport centre, -0.5…0.5 on both axes. */
  parallax: Pointer;
  hoveredNote: HoveredNote | null;
}

export const state: StarMapState = {
  activeChapter: -1,
  scrollProgress: 0,
  pointer: { x: -999, y: -999 },
  parallax: { x: 0, y: 0 },
  hoveredNote: null
};

export const trackPointer = (): void => {
  const follow = (event: PointerEvent) => {
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
  };
  window.addEventListener('pointermove', follow);
  window.addEventListener('pointerdown', follow);
  window.addEventListener('pointermove', (event) => {
    state.parallax.x = event.clientX / window.innerWidth - 0.5;
    state.parallax.y = event.clientY / window.innerHeight - 0.5;
  });
};
