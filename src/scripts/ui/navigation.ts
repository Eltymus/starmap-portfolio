import { CHAPTERS, CHAPTER_COUNT } from '../../data/chapters';
import { state } from '../state';
import { byId } from './dom';

const ACTIVE_CLASS = 'is-active';
const LABEL_FADE = 250;

export interface Navigation {
  /** Scrolls to a chapter. */
  goTo: (index: number) => void;
  /** Moves one chapter forward (direction > 0) or back. */
  step: (direction: number) => void;
}

export const createNavigation = ({ onChapterChange }: { onChapterChange: (index: number) => void }): Navigation => {
  const scroller = byId('scroller');
  const chapters = [...document.querySelectorAll<HTMLElement>('.chapter')];
  const moonButtons = [...document.querySelectorAll<HTMLButtonElement>('#moons button')];
  const progressFill = byId('moon-progress');
  const label = byId('chapter-label');
  const hint = byId('scroll-hint');

  const goTo = (index: number) => scroller.scrollTo({ top: index * scroller.clientHeight, behavior: 'smooth' });

  const setActive = (index: number) => {
    if (index === state.activeChapter) return;
    state.activeChapter = index;
    onChapterChange(index);
    chapters.forEach((chapter, i) => chapter.classList.toggle(ACTIVE_CLASS, i === index));
    moonButtons.forEach((button, i) => button.classList.toggle(ACTIVE_CLASS, i === index));
    label.style.opacity = '0';
    setTimeout(() => {
      label.textContent = CHAPTERS[index].name;
      label.style.opacity = '1';
    }, LABEL_FADE);
    hint.style.opacity = index === 0 ? '1' : '0';
  };

  moonButtons.forEach((button, i) => {
    button.onclick = () => goTo(i);
  });
  document
    .querySelectorAll<HTMLElement>('[data-go]')
    .forEach((button) => button.addEventListener('click', () => goTo(Number(button.dataset.go))));

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

  const step = (direction: number) =>
    goTo(direction > 0 ? Math.min(CHAPTER_COUNT - 1, state.activeChapter + 1) : Math.max(0, state.activeChapter - 1));

  return { goTo, step };
};
