import type { ChartSheet } from './chart-sheet';
import type { FullMap } from './full-map';
import type { Navigation } from './navigation';

interface KeyboardTargets {
  navigation: Navigation;
  sheet: ChartSheet;
  fullMap: FullMap;
}

const NEXT_KEYS = ['ArrowDown', 'PageDown', ' '];
const PREVIOUS_KEYS = ['ArrowUp', 'PageUp'];
/** Space and Enter on these must keep their own meaning (press the button, follow the link…). */
const INTERACTIVE = 'button, a[href], input, textarea, select, summary, [role="button"], [tabindex]';

/** Page-level shortcuts. Escape, focus trapping and focus return are handled by the native dialogs. */
export const bindKeyboard = ({ navigation, sheet, fullMap }: KeyboardTargets): void => {
  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (sheet.isOpen) {
      if (event.key === 'ArrowRight') sheet.turn(1);
      if (event.key === 'ArrowLeft') sheet.turn(-1);
      return;
    }
    if (fullMap.isOpen) return;
    if (event.key === ' ' && (event.target as Element).closest?.(INTERACTIVE)) return;
    if (NEXT_KEYS.includes(event.key)) {
      event.preventDefault();
      navigation.step(1);
    }
    if (PREVIOUS_KEYS.includes(event.key)) {
      event.preventDefault();
      navigation.step(-1);
    }
  });
};
