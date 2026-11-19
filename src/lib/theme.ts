export const COLORS = {
  gold: '#E2BE74',
  goldLight: '#F6DFA6',
  goldPale: '#F3D99B',
  navy: '#0A1233',
  skyBlue: '#DDE6FF',
  muted: '#C3C6DA',
  mapCenter: '#17265F',
  mapEdge: '#08102C'
} as const;

export const HEX = {
  gold: 0xe2be74,
  strokeWhite: 0xfff0c8,
  clusterBlue: 0xdde8ff,
  hazeBlue: 0xb9c6ff,
  hazeGold: 0xffe0a8
} as const;

export const STAR_TEMPERATURES = [0xcfe0ff, 0xffffff, 0xfff1d0, 0xf4d58c, 0xffb98a];

export const GOLD_GRADIENT_STOPS: readonly (readonly [offset: number, color: string])[] = [
  [0, '#F7E2A8'],
  [0.45, '#D2A24E'],
  [0.7, '#F3D490'],
  [1, '#B98A35']
];

export const fontCaps = (size: number, weight = 600): string => `${weight} ${size}px Cinzel, serif`;

export const fontClassic = (size: number, style = 'italic 500'): string =>
  `${style} ${size}px "Cormorant Garamond", serif`;

export const fontMono = (size: number): string => `500 ${size}px ui-monospace, Menlo, monospace`;
