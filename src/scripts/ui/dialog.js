const OPEN_CLASS = 'is-open';

const tabbableElements = (root) => [...root.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')]
  .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');

export const createDialog = (root, initialFocus) => {
  let isOpen = false;
  let returnFocus = null;

  const open = () => {
    returnFocus = document.activeElement;
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
    if (root.contains(document.activeElement) && returnFocus && returnFocus.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  };

  const trapTab = (event) => {
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
