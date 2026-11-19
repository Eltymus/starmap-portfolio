const OPEN_CLASS = 'is-open';
const CLOSING_CLASS = 'is-closing';

export interface Dialog {
  open: () => void;
  close: () => void;
  readonly isOpen: boolean;
}

interface DialogOptions {
  /** How long the closing fade lasts, in ms; the dialog stays visible but inert meanwhile. */
  fadeOut: number;
  /** Called after every close: button, Escape, backdrop click or code. */
  onClose?: () => void;
}

/**
 * Animated wrapper around a native modal <dialog>. The browser makes the rest of the page inert,
 * closes on Escape and gives focus back to the element that opened it; this adds the fade in and out.
 */
export const createDialog = (dialog: HTMLDialogElement, { fadeOut, onClose }: DialogOptions): Dialog => {
  let fadeTimer: ReturnType<typeof setTimeout> | undefined;

  const finishFade = () => {
    clearTimeout(fadeTimer);
    dialog.classList.remove(CLOSING_CLASS);
    dialog.inert = false;
  };

  const open = () => {
    if (dialog.open) return;
    finishFade();
    dialog.showModal();
    // Flush styles so the opening transition starts from the closed state.
    void dialog.offsetWidth;
    dialog.classList.add(OPEN_CLASS);
  };

  dialog.addEventListener('close', () => {
    dialog.classList.remove(OPEN_CLASS);
    dialog.classList.add(CLOSING_CLASS);
    dialog.inert = true;
    fadeTimer = setTimeout(finishFade, fadeOut);
    onClose?.();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  return {
    open,
    close: () => dialog.close(),
    get isOpen() {
      return dialog.open;
    }
  };
};
