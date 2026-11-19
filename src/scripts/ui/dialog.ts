const OPEN_CLASS = 'is-open';

const tabbableElements = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')].filter(
    (element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden'
  );

export interface Dialog {
  root: HTMLElement;
  open: () => void;
  close: () => void;
  trapTab: (event: KeyboardEvent) => void;
  readonly isOpen: boolean;
}

export const createDialog = (root: HTMLElement, initialFocus: HTMLElement): Dialog => {
  let isOpen = false;
  let returnFocus: HTMLElement | null = null;

  const open = () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.classList.add(OPEN_CLASS);
    root.setAttribute('aria-hidden', 'false');
    isOpen = true;
    initialFocus.focus({ preventScroll: true });
  };

  const close = () => {
    if (!isOpen) return;
    root.classList.remove(OPEN_CLASS);
    root.setAttribute('aria-hidden', 'true');
    isOpen = false;
    if (
      root.contains(document.activeElement) &&
      returnFocus &&
      returnFocus.isConnected &&
      returnFocus !== document.body
    )
      returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  };

  const trapTab = (event: KeyboardEvent) => {
    const focusable = tabbableElements(root);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (!root.contains(current)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return {
    root,
    open,
    close,
    trapTab,
    get isOpen() {
      return isOpen;
    }
  };
};
