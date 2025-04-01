export const themes = {
  gray: {
    name: 'Cinza',
    primary: '#9e9e9e',
    secondary: '#e0e0e0',
    accent: '#9e9e9e',
    background: '#ffffff',
    text: '#000000',
  },
  cyan: {
    name: 'Ciano',
    primary: '#5ecde0',
    secondary: '#00fff2',
    accent: '#5ecde0',
    background: '#ffffff',
    text: '#000000',
  },
  mint: {
    name: 'Menta',
    primary: '#c4ffc9',
    secondary: '#00fff2',
    accent: '#5ecde0',
    background: '#ffffff',
    text: '#000000',
  },
} as const;

export type ThemeName = keyof typeof themes; 