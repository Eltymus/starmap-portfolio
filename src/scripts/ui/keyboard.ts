import type { ChartSheet } from './chart-sheet';
import type { FullMap } from './full-map';
import type { Navigation } from './navigation';

interface KeyboardTargets {
  navigation: Navigation;
  sheet: ChartSheet;
  fullMap: FullMap;
}

export const bindKeyboard = ({ navigation, sheet, fullMap }: KeyboardTargets): void => {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && (sheet.isOpen || fullMap.isOpen)) {
      (sheet.isOpen ? sheet : fullMap).trapTab(event);
      return;
    }
    if (event.key === 'Escape') {
      fullMap.close();
      if (sheet.isOpen) sheet.requestClose();
      return;
    }
    if (sheet.isOpen) {
      if (event.key === 'ArrowRight') sheet.turn(1);
      if (event.key === 'ArrowLeft') sheet.turn(-1);
      return;
    }
    if (fullMap.isOpen) return;
    if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault();
      navigation.step(1);
    }
    if (['ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      navigation.step(-1);
    }
  });
};
