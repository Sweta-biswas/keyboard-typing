export type KeyType = 'alpha' | 'mod' | 'accent';

export interface KeyDef {
  label: string;
  value: string;
  shiftValue?: string;
  width?: number; // width multiplier
  id: string;
  type: KeyType; // NEW: allows us to color code based on type
}

// Emulating a 75% mechanical layout similar to the image
export const keyboardRows: KeyDef[][] = [
  // ROW 0: Esc, F-keys, etc. (often smaller in real life, but we'll map them full width)
  [
    { id: 'esc', label: 'esc', value: 'Escape', width: 1.25, type: 'accent' },
    { id: 'f1', label: '☀', value: 'F1', width: 1, type: 'alpha' },
    { id: 'f2', label: '☼', value: 'F2', width: 1, type: 'alpha' },
    { id: 'f3', label: '⊟', value: 'F3', width: 1, type: 'alpha' },
    { id: 'f4', label: 'Q', value: 'F4', width: 1, type: 'alpha' },
    { id: 'f5', label: '🎙', value: 'F5', width: 1, type: 'mod' },
    { id: 'f6', label: '☾', value: 'F6', width: 1, type: 'mod' },
    { id: 'f7', label: '◁◁', value: 'F7', width: 1, type: 'mod' },
    { id: 'f8', label: '▷II', value: 'F8', width: 1, type: 'mod' },
    { id: 'f9', label: '▷▷', value: 'F9', width: 1, type: 'mod' },
    { id: 'f10', label: '🔇', value: 'F10', width: 1, type: 'mod' },
    { id: 'f11', label: '🔉', value: 'F11', width: 1, type: 'mod' },
    { id: 'f12', label: '🔊', value: 'F12', width: 1, type: 'mod' },
    { id: 'ins', label: '⏏', value: 'Insert', width: 1, type: 'mod' },
    { id: 'del', label: 'del', value: 'Delete', width: 1, type: 'mod' },
    { id: 'light', label: '💡', value: 'Light', width: 1, type: 'mod' },
  ],
  // ROW 1: Numbers
  [
    { id: 'backtick', label: '`', value: '`', shiftValue: '~', width: 1, type: 'alpha' },
    { id: 'key-1', label: '1', value: '1', shiftValue: '!', width: 1, type: 'alpha' },
    { id: 'key-2', label: '2', value: '2', shiftValue: '@', width: 1, type: 'alpha' },
    { id: 'key-3', label: '3', value: '3', shiftValue: '#', width: 1, type: 'alpha' },
    { id: 'key-4', label: '4', value: '4', shiftValue: '$', width: 1, type: 'alpha' },
    { id: 'key-5', label: '5', value: '5', shiftValue: '%', width: 1, type: 'alpha' },
    { id: 'key-6', label: '6', value: '6', shiftValue: '^', width: 1, type: 'alpha' },
    { id: 'key-7', label: '7', value: '7', shiftValue: '&', width: 1, type: 'alpha' },
    { id: 'key-8', label: '8', value: '8', shiftValue: '*', width: 1, type: 'alpha' },
    { id: 'key-9', label: '9', value: '9', shiftValue: '(', width: 1, type: 'alpha' },
    { id: 'key-0', label: '0', value: '0', shiftValue: ')', width: 1, type: 'alpha' },
    { id: 'dash', label: '-', value: '-', shiftValue: '_', width: 1, type: 'alpha' },
    { id: 'equals', label: '=', value: '=', shiftValue: '+', width: 1, type: 'alpha' },
    { id: 'backspace', label: '←', value: 'Backspace', width: 2, type: 'mod' }, // 2u backspace
    { id: 'pgup', label: 'pgup', value: 'PageUp', width: 1, type: 'mod' },
  ],
  // ROW 2: QWERTY
  [
    { id: 'tab', label: 'tab', value: 'Tab', width: 1.5, type: 'mod' }, // 1.5u tab
    { id: 'q', label: 'Q', value: 'q', shiftValue: 'Q', width: 1, type: 'alpha' },
    { id: 'w', label: 'W', value: 'w', shiftValue: 'W', width: 1, type: 'alpha' },
    { id: 'e', label: 'E', value: 'e', shiftValue: 'E', width: 1, type: 'alpha' },
    { id: 'r', label: 'R', value: 'r', shiftValue: 'R', width: 1, type: 'alpha' },
    { id: 't', label: 'T', value: 't', shiftValue: 'T', width: 1, type: 'alpha' },
    { id: 'y', label: 'Y', value: 'y', shiftValue: 'Y', width: 1, type: 'alpha' },
    { id: 'u', label: 'U', value: 'u', shiftValue: 'U', width: 1, type: 'alpha' },
    { id: 'i', label: 'I', value: 'i', shiftValue: 'I', width: 1, type: 'alpha' },
    { id: 'o', label: 'O', value: 'o', shiftValue: 'O', width: 1, type: 'alpha' },
    { id: 'p', label: 'P', value: 'p', shiftValue: 'P', width: 1, type: 'alpha' },
    { id: 'lbracket', label: '[', value: '[', shiftValue: '{', width: 1, type: 'alpha' },
    { id: 'rbracket', label: ']', value: ']', shiftValue: '}', width: 1, type: 'alpha' },
    { id: 'backslash', label: '\\', value: '\\', shiftValue: '|', width: 1.5, type: 'alpha' }, // 1.5u backslash
    { id: 'pgdn', label: 'pgdn', value: 'PageDown', width: 1, type: 'mod' },
  ],
  // ROW 3: ASDF
  [
    { id: 'capslock', label: 'caps lock', value: 'CapsLock', width: 1.75, type: 'mod' }, // 1.75u caps
    { id: 'a', label: 'A', value: 'a', shiftValue: 'A', width: 1, type: 'alpha' },
    { id: 's', label: 'S', value: 's', shiftValue: 'S', width: 1, type: 'alpha' },
    { id: 'd', label: 'D', value: 'd', shiftValue: 'D', width: 1, type: 'alpha' },
    { id: 'f', label: 'F', value: 'f', shiftValue: 'F', width: 1, type: 'alpha' },
    { id: 'g', label: 'G', value: 'g', shiftValue: 'G', width: 1, type: 'alpha' },
    { id: 'h', label: 'H', value: 'h', shiftValue: 'H', width: 1, type: 'alpha' },
    { id: 'j', label: 'J', value: 'j', shiftValue: 'J', width: 1, type: 'alpha' },
    { id: 'k', label: 'K', value: 'k', shiftValue: 'K', width: 1, type: 'alpha' },
    { id: 'l', label: 'L', value: 'l', shiftValue: 'L', width: 1, type: 'alpha' },
    { id: 'semicolon', label: ';', value: ';', shiftValue: ':', width: 1, type: 'alpha' },
    { id: 'quote', label: "'", value: "'", shiftValue: '"', width: 1, type: 'alpha' },
    { id: 'enter', label: 'return', value: 'Enter', width: 2.25, type: 'mod' }, // 2.25u enter, mod
    { id: 'home', label: 'home', value: 'Home', width: 1, type: 'mod' },
  ],
  // ROW 4: ZXCV
  [
    { id: 'lshift', label: 'shift', value: 'Shift', width: 2.25, type: 'mod' }, // 2.25u lshift
    { id: 'z', label: 'Z', value: 'z', shiftValue: 'Z', width: 1, type: 'alpha' },
    { id: 'x', label: 'X', value: 'x', shiftValue: 'X', width: 1, type: 'alpha' },
    { id: 'c', label: 'C', value: 'c', shiftValue: 'C', width: 1, type: 'alpha' },
    { id: 'v', label: 'V', value: 'v', shiftValue: 'V', width: 1, type: 'alpha' },
    { id: 'b', label: 'B', value: 'b', shiftValue: 'B', width: 1, type: 'alpha' },
    { id: 'n', label: 'N', value: 'n', shiftValue: 'N', width: 1, type: 'alpha' },
    { id: 'm', label: 'M', value: 'm', shiftValue: 'M', width: 1, type: 'alpha' },
    { id: 'comma', label: ',', value: ',', shiftValue: '<', width: 1, type: 'alpha' },
    { id: 'period', label: '.', value: '.', shiftValue: '>', width: 1, type: 'alpha' },
    { id: 'slash', label: '/', value: '/', shiftValue: '?', width: 1, type: 'alpha' },
    { id: 'rshift', label: 'shift', value: 'Shift', width: 1.75, type: 'mod' }, // 1.75u rshift
    { id: 'up', label: '↑', value: 'ArrowUp', width: 1, type: 'alpha' },
    { id: 'end', label: 'end', value: 'End', width: 1, type: 'mod' },
  ],
  // ROW 5: Spacebar row (Apple-style 75% approximation)
  [
    { id: 'lctrl', label: 'ctrl', value: 'Control', width: 1.25, type: 'mod' },
    { id: 'lopt', label: 'option', value: 'Alt', width: 1.25, type: 'mod' },
    { id: 'lcmd', label: '⌘', value: 'Meta', width: 1.25, type: 'mod' },
    { id: 'space', label: '', value: ' ', width: 6.25, type: 'alpha' }, // 6.25u space
    { id: 'rcmd', label: '⌘', value: 'Meta', width: 1.25, type: 'mod' },
    { id: 'fn', label: 'fn', value: 'Fn', width: 1, type: 'mod' },
    { id: 'rctrl', label: 'ctrl', value: 'Control', width: 1, type: 'mod' },
    { id: 'left', label: '←', value: 'ArrowLeft', width: 1, type: 'alpha' },
    { id: 'down', label: '↓', value: 'ArrowDown', width: 1, type: 'alpha' },
    { id: 'right', label: '→', value: 'ArrowRight', width: 1, type: 'alpha' },
  ],
];

export function getKeyIdsForChar(char: string): string[] {
  const ids: string[] = [];
  for (const row of keyboardRows) {
    for (const key of row) {
      if (key.value === char || key.shiftValue === char) {
        ids.push(key.id);
        if (key.shiftValue === char && key.type !== 'mod') {
          ids.push('lshift');
        }
      }
    }
  }
  if (char === ' ') ids.push('space');
  return ids;
}
