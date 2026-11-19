import { CHAPTERS, CHAPTER_COUNT } from '../../data/chapters.js';
import { clamp } from '../../lib/math.js';
import { chapterArtImageUrl } from '../art/chapter-art.js';
import { state } from '../state.js';
import { createDialog } from './dialog.js';

const PAGE_TURN = 260;
const NAVIGATE_AFTER_CLOSE = 300;

const activateOnEnterOrSpace = (element, action) => {
  element.onclick = action;
  element.onkeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };
};

export const createChartSheet = ({ goTo }) => {
  const root = document.getElementById('chart-sheet');
  const sheet = root.querySelector('.sheet');
  const art = root.querySelector('.sheet-art');
  const body = root.querySelector('.sheet-body');
  const footer = root.querySelector('.sheet-footer');
  const prev = root.querySelector('.sheet-prev');
  const next = root.querySelector('.sheet-next');
  const counter = footer.querySelector('span');
  const closeButton = root.querySelector('.sheet-close');
  const pages = [...document.querySelectorAll('template[data-sheet]')];
  const dialog = createDialog(root, closeButton);
  let current = 0;

  const fill = (index) => {
    body.replaceChildren(pages[index].content.cloneNode(true));
    body.scrollTop = 0;
    const image = chapterArtImageUrl(index);
    art.style.backgroundImage = image ? 'url(' + image + ')' : 'none';
    prev.disabled = index === 0;
    next.disabled = index === CHAPTER_COUNT - 1;
    prev.textContent = index > 0 ? '‹ ' + CHAPTERS[index - 1].name : '';
    next.textContent = index < CHAPTER_COUNT - 1 ? CHAPTERS[index + 1].name + ' ›' : '';
    counter.textContent = (index + 1) + ' / ' + CHAPTER_COUNT;
  };

  const open = (index) => {
    current = index;
    fill(index);
    dialog.open();
  };

  const turn = (direction) => {
    const target = clamp(current + direction, 0, CHAPTER_COUNT - 1);
    if (target === current) return;
    current = target;
    sheet.classList.add('is-turning');
    const focusOnFooter = document.activeElement && document.activeElement.closest && document.activeElement.closest('.sheet-footer');
    setTimeout(() => {
      fill(target);
      sheet.classList.remove('is-turning');
      const lostFocus = focusOnFooter && !root.contains(document.activeElement);
      const focusDisabled = document.activeElement && document.activeElement.disabled;
      if (lostFocus || focusDisabled) (root.querySelector('.sheet-footer button:not([disabled])') || closeButton).focus({ preventScroll: true });
    }, PAGE_TURN);
  };

  closeButton.onclick = () => {
    const index = current;
    dialog.close();
    if (index !== state.activeChapter) setTimeout(() => goTo(index), NAVIGATE_AFTER_CLOSE);
  };
  prev.onclick = () => turn(-1);
  next.onclick = () => turn(1);
  root.addEventListener('click', (event) => {
    if (event.target === root) closeButton.click();
  });

  document.querySelectorAll('.chapter').forEach((chapter, i) => {
    chapter.querySelector('.open-chart').onclick = () => open(i);
  });
  const cameo = document.querySelector('.cameo');
  if (cameo) activateOnEnterOrSpace(cameo, () => open(0));

  return {
    open,
    turn,
    requestClose: () => closeButton.click(),
    close: dialog.close,
    trapTab: dialog.trapTab,
    get isOpen() {
      return dialog.isOpen;
    }
  };
};
