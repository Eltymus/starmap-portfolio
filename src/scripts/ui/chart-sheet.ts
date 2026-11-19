import { CHAPTERS, CHAPTER_COUNT } from '../../data/chapters';
import { clamp } from '../../lib/math';
import { chapterArtImageUrl } from '../art/chapter-art';
import { state } from '../state';
import { createDialog } from './dialog';
import { byId, query } from './dom';

const PAGE_TURN = 260;
const NAVIGATE_AFTER_CLOSE = 300;
const FADE_OUT = 1000;

export interface ChartSheet {
  open: (index: number) => void;
  /** Turns one page forward (1) or back (-1). */
  turn: (direction: number) => void;
  /** Closes the sheet and stays on the current chapter, even if another page was being read. */
  dismiss: () => void;
  readonly isOpen: boolean;
}

export const createChartSheet = ({ goTo }: { goTo: (index: number) => void }): ChartSheet => {
  const root = byId<HTMLDialogElement>('chart-sheet');
  const sheet = query(root, '.sheet');
  const art = query(root, '.sheet-art');
  const body = query(root, '.sheet-body');
  const prev = query<HTMLButtonElement>(root, '.sheet-prev');
  const next = query<HTMLButtonElement>(root, '.sheet-next');
  const counter = query(root, '.sheet-counter');
  const announcer = query(root, '.sheet-announcer');
  const closeButton = query<HTMLButtonElement>(root, '.sheet-close');
  const pages = [...document.querySelectorAll<HTMLTemplateElement>('template[data-sheet]')];
  let current = 0;
  let travelOnClose = true;

  // Closing (button, Escape or backdrop) travels to the chapter of the page being read.
  const dialog = createDialog(root, {
    fadeOut: FADE_OUT,
    onClose: () => {
      const index = current;
      if (travelOnClose && index !== state.activeChapter) setTimeout(() => goTo(index), NAVIGATE_AFTER_CLOSE);
      travelOnClose = true;
    }
  });

  const fill = (index: number) => {
    body.replaceChildren(pages[index].content.cloneNode(true));
    body.scrollTop = 0;
    const image = chapterArtImageUrl(index);
    art.style.backgroundImage = image ? 'url(' + image + ')' : 'none';
    prev.disabled = index === 0;
    next.disabled = index === CHAPTER_COUNT - 1;
    prev.textContent = index > 0 ? '‹ ' + CHAPTERS[index - 1].name : '';
    next.textContent = index < CHAPTER_COUNT - 1 ? CHAPTERS[index + 1].name + ' ›' : '';
    counter.textContent = index + 1 + ' / ' + CHAPTER_COUNT;
  };

  const open = (index: number) => {
    current = index;
    fill(index);
    announcer.textContent = '';
    dialog.open();
  };

  const turn = (direction: number) => {
    const target = clamp(current + direction, 0, CHAPTER_COUNT - 1);
    if (target === current) return;
    current = target;
    sheet.classList.add('is-turning');
    setTimeout(() => {
      fill(target);
      sheet.classList.remove('is-turning');
      announcer.textContent = `Chart ${target + 1} of ${CHAPTER_COUNT}: ${pages[target].dataset.title}`;
      const focused = document.activeElement;
      if (focused instanceof HTMLButtonElement && focused.disabled)
        (root.querySelector<HTMLButtonElement>('.sheet-footer button:not([disabled])') ?? closeButton).focus({
          preventScroll: true
        });
    }, PAGE_TURN);
  };

  closeButton.onclick = dialog.close;
  prev.onclick = () => turn(-1);
  next.onclick = () => turn(1);

  document.querySelectorAll('.chapter').forEach((chapter, i) => {
    query(chapter, '.open-chart').onclick = () => open(i);
  });
  const cameo = document.querySelector<HTMLButtonElement>('.cameo');
  if (cameo) cameo.onclick = () => open(0);

  return {
    open,
    turn,
    dismiss: () => {
      if (!dialog.isOpen) return;
      travelOnClose = false;
      dialog.close();
    },
    get isOpen() {
      return dialog.isOpen;
    }
  };
};
