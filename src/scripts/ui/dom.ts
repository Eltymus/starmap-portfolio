/** The element with this id; throws if the markup is missing it, so a broken page fails loudly. */
export const byId = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
};

/** The first element matching the selector inside `root`; throws if there is none. */
export const query = <T extends Element = HTMLElement>(root: ParentNode, selector: string): T => {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
};

/** Runs `action` on click and on Enter/Space, for elements that act as buttons without being one. */
export const activateOnEnterOrSpace = (element: HTMLElement | SVGElement, action: () => void): void => {
  element.addEventListener('click', action);
  element.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent) || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    action();
  });
};
