export const state = {
  activeChapter: -1,
  scrollProgress: 0,
  pointer: { x: -999, y: -999 },
  parallax: { x: 0, y: 0 },
  hoveredNote: null
};

export const trackPointer = () => {
  const follow = (event) => {
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
