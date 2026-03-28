export interface Theme {
  id: string;
  name: string;
  
  // App
  pageBg: string;
  textPrimary: string;
  textMuted: string;
  correct: string;
  incorrect: string;
  caretColor: string;

  // Keyboard Chassis
  boardBg: string;

  // Alpha keys
  alphaBg: string;
  alphaBottom: string;
  alphaText: string;

  // Modifier keys
  modBg: string;
  modBottom: string;
  modText: string;

  // Accent keys
  accentBg: string;
  accentBottom: string;
  accentText: string;

  // Highlight/Pressed global
  highlightGlow: string;
}

export const themes: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    pageBg: '#1a1a1c',
    textPrimary: '#d1d1d1',
    textMuted: '#666666',
    correct: '#d1d1d1',
    incorrect: '#d95252',
    caretColor: '#8a8a8a',
    boardBg: '#3d3f41',
    alphaBg: '#f2f0e9',
    alphaBottom: '#c2c0ba',
    alphaText: '#333333',
    modBg: '#a8a59f',
    modBottom: '#82807a',
    modText: '#333333',
    accentBg: '#d95252',
    accentBottom: '#a63c3c',
    accentText: '#ffffff',
    highlightGlow: 'rgba(217,82,82,0.3)',
  },
  {
    id: 'mint',
    name: 'Mint',
    pageBg: '#181f20',
    textPrimary: '#a0babc',
    textMuted: '#445b5e',
    correct: '#a0babc',
    incorrect: '#f87171',
    caretColor: '#88cfa9',
    boardBg: '#2d3535',
    alphaBg: '#ffffff',
    alphaBottom: '#dcdcdc',
    alphaText: '#333333',
    modBg: '#356b71',
    modBottom: '#244b50',
    modText: '#92cdd3',
    accentBg: '#88cfa9',
    accentBottom: '#63a985',
    accentText: '#1f4f37',
    highlightGlow: 'rgba(136,207,169,0.35)',
  },
  {
    id: 'royal',
    name: 'Royal',
    pageBg: '#131518',
    textPrimary: '#90a4c2',
    textMuted: '#3e4a5c',
    correct: '#90a4c2',
    incorrect: '#e64e4e',
    caretColor: '#f0d32d',
    boardBg: '#373a3c',
    alphaBg: '#294572',
    alphaBottom: '#1b2e4d',
    alphaText: '#90a4c2',
    modBg: '#272728',
    modBottom: '#161616',
    modText: '#7a7a7a',
    accentBg: '#f0d32d',
    accentBottom: '#c2aa21',
    accentText: '#3a3304',
    highlightGlow: 'rgba(240,211,45,0.3)',
  },
  {
    id: 'dolch',
    name: 'Dolch',
    pageBg: '#121213',
    textPrimary: '#929aa6',
    textMuted: '#474b52',
    correct: '#929aa6',
    incorrect: '#ca3c38',
    caretColor: '#ca3c38',
    boardBg: '#2a2b2e',
    alphaBg: '#424953',
    alphaBottom: '#2a2f36',
    alphaText: '#b0b8c6',
    modBg: '#2e3034',
    modBottom: '#1c1d1f',
    modText: '#696d74',
    accentBg: '#ca3c38',
    accentBottom: '#9b2b27',
    accentText: '#ffffff',
    highlightGlow: 'rgba(202,60,56,0.3)',
  },
  {
    id: 'sand',
    name: 'Sand',
    pageBg: '#1b1919',
    textPrimary: '#eaddda',
    textMuted: '#665c5b',
    correct: '#eaddda',
    incorrect: '#d95252',
    caretColor: '#c97b7e',
    boardBg: '#363738',
    alphaBg: '#eaddda',
    alphaBottom: '#c7b8b5',
    alphaText: '#756966',
    modBg: '#c97b7e',
    modBottom: '#a15d60',
    modText: '#f9d8d9',
    accentBg: '#eaddda',
    accentBottom: '#c7b8b5',
    accentText: '#c97b7e',
    highlightGlow: 'rgba(201,123,126,0.3)',
  },
  {
    id: 'scarlet',
    name: 'Scarlet',
    pageBg: '#1a1616',
    textPrimary: '#e8e8e8',
    textMuted: '#5e4847',
    correct: '#e8e8e8',
    incorrect: '#ff6b6b',
    caretColor: '#c7382d',
    boardBg: '#2e2e30',
    alphaBg: '#f8f9fb',
    alphaBottom: '#c2c7ce',
    alphaText: '#333333',
    modBg: '#6b2c28',
    modBottom: '#4a1d1a',
    modText: '#d68f8a',
    accentBg: '#c7382d',
    accentBottom: '#94271f',
    accentText: '#ffffff',
    highlightGlow: 'rgba(199,56,45,0.35)',
  }
];

export const defaultTheme = themes[0];
