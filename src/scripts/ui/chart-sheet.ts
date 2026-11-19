import { CHAPTERS, CHAPTER_COUNT } from '../../data/chapters';
import { clamp } from '../../lib/math';
import { chapterArtImageUrl } from '../art/chapter-art';
import { state } from '../state';
import { createDialog } from './dialog';
import { activateOnEnterOrSpace, byId, query } from './dom';

const PAGE_TURN = 260;
const NAVIGATE_AFTER_CLOSE = 300;

export interface ChartSheet {
  open: (index: number) => void;
  /** Turns one page forward (1) or back (-1). */
  turn: (direction: number) => void;
  /** Closes the sheet and travels to the chapter of the page being read. */
  requestClose: () => void;
  /** Closes the sheet and stays where the page is. */
  close: () => void;
  trapTab: (event: KeyboardEvent) => void;
  readonly isOpen: boolean;
}

export const createChartSheet = ({ goTo }: { goTo: (index: number) => void }): ChartSheet => {
  const root = byId('chart-sheet');
  const sheet = query(root, '.sheet');
  const art = query(root, '.sheet-art');
  const body = query(root, '.sheet-body');
  const footer = query(root, '.sheet-footer');
  const prev = query<HTMLButtonElement>(root, '.sheet-prev');
  const next = query<HTMLButtonElement>(root, '.sheet-next');
  const counter = query(footer, 'span');
  const closeButton = query<HTMLButtonElement>(root, '.sheet-close');
  const pages = [...document.querySelectorAll<HTMLTemplateElement>('template[data-sheet]')];
  const dialog = createDialog(root, closeButton);
  let current = 0;

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
    dialog.open();
  };

  const turn = (direction: number) => {
    const target = clamp(current + direction, 0, CHAPTER_COUNT - 1);
    if (target === current) return;
    current = target;
    sheet.classList.add('is-turning');
    const focusOnFooter = !!document.activeElement?.closest('.sheet-footer');
    setTimeout(() => {
      fill(target);
      sheet.classList.remove('is-turning');
      const lostFocus = focusOnFooter && !root.contains(document.activeElement);
      const focusDisabled = document.activeElement instanceof HTMLButtonElement && document.activeElement.disabled;
      if (lostFocus || focusDisabled)
        (root.querySelector<HTMLButtonElement>('.sheet-footer button:not([disabled])') ?? closeButton).focus({
          preventScroll: true
        });
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
    query(chapter, '.open-chart').onclick = () => open(i);
  });
  const cameo = document.querySelector<HTMLElement>('.cameo');
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
