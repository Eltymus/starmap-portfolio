import { CHAPTERS, CHAPTER_COUNT } from '../../data/chapters.js';
import { state } from '../state.js';

const ACTIVE_CLASS = 'is-active';
const LABEL_FADE = 250;

export const createNavigation = ({ onChapterChange }) => {
  const scroller = document.getElementById('scroller');
  const chapters = [...document.querySelectorAll('.chapter')];
  const moonButtons = [...document.querySelectorAll('#moons button')];
  const progressFill = document.getElementById('moon-progress');
  const label = document.getElementById('chapter-label');
  const hint = document.getElementById('scroll-hint');

  const goTo = (index) => scroller.scrollTo({ top: index * scroller.clientHeight, behavior: 'smooth' });

  const setActive = (index) => {
    if (index === state.activeChapter) return;
    state.activeChapter = index;
    onChapterChange(index);
    chapters.forEach((chapter, i) => chapter.classList.toggle(ACTIVE_CLASS, i === index));
    moonButtons.forEach((button, i) => button.classList.toggle(ACTIVE_CLASS, i === index));
    label.style.opacity = 0;
    setTimeout(() => {
      label.textContent = CHAPTERS[index].name;
      label.style.opacity = 1;
    }, LABEL_FADE);
    hint.style.opacity = index === 0 ? 1 : 0;
  };

  moonButtons.forEach((button, i) => {
    button.onclick = () => goTo(i);
  });
  document
    .querySelectorAll('[data-go]')
    .forEach((button) => button.addEventListener('click', () => goTo(+button.dataset.go)));

  scroller.addEventListener(
    'scroll',
    () => {
      state.scrollProgress = scroller.scrollTop / Math.max(1, scroller.clientHeight);
      setActive(Math.round(state.scrollProgress));
      progressFill.style.height = (state.scrollProgress / (CHAPTER_COUNT - 1)) * 100 + '%';
    },
    { passive: true }
  );

  setActive(0);

  const step = (direction) =>
    goTo(direction > 0 ? Math.min(CHAPTER_COUNT - 1, state.activeChapter + 1) : Math.max(0, state.activeChapter - 1));

  return { goTo, step };
};
