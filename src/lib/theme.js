export const COLORS = {
  gold: '#E2BE74',
  goldLight: '#F6DFA6',
  goldPale: '#F3D99B',
  navy: '#0A1233',
  skyBlue: '#DDE6FF',
  muted: '#C3C6DA',
  mapCenter: '#17265F',
  mapEdge: '#08102C'
};

export const HEX = {
  gold: 0xE2BE74,
  strokeWhite: 0xFFF0C8,
  clusterBlue: 0xDDE8FF,
  hazeBlue: 0xB9C6FF,
  hazeGold: 0xFFE0A8
};

export const STAR_TEMPERATURES = [0xCFE0FF, 0xFFFFFF, 0xFFF1D0, 0xF4D58C, 0xFFB98A];

export const GOLD_GRADIENT_STOPS = [[0, '#F7E2A8'], [0.45, '#D2A24E'], [0.7, '#F3D490'], [1, '#B98A35']];

export const fontCaps = (size, weight = 600) => `${weight} ${size}px Cinzel, serif`;

export const fontClassic = (size, style = 'italic 500') => `${style} ${size}px "Cormorant Garamond", serif`;

export const fontMono = (size) => `500 ${size}px ui-monospace, Menlo, monospace`;
