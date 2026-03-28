import React, { useCallback } from 'react';
import { keyboardRows, getKeyIdsForChar, KeyDef } from '../data/keyboard';

interface VirtualKeyboardProps {
  activeKeys: Set<string>;
  nextChar: string;
  pressedKey: string;
  onKeyClick?: (value: string) => void;
}

const U = 44;
const DEPTH = 7;
const GAP = 5;
const RADIUS = 7;

const Key: React.FC<{
  keyDef: KeyDef;
  isActive: boolean;
  isExpected: boolean;
  onKeyClick?: (value: string) => void;
}> = ({ keyDef, isActive, isExpected: _isExpected, onKeyClick }) => {
  const w = (keyDef.width ?? 1) * U + ((keyDef.width ?? 1) - 1) * GAP;
  const h = U;

  const typePrefix =
    keyDef.type === 'alpha' ? '--alpha' :
    keyDef.type === 'mod' ? '--mod' : '--accent';

  const bgBot = isActive ? 'var(--accentBottom)' : `var(${typePrefix}Bottom)`;
  const bgTop = isActive ? 'var(--accentBg)' : `var(${typePrefix}Bg)`;
  const txtCol = isActive ? 'var(--accentText)' : `var(${typePrefix}Text)`;

  const handleClick = useCallback(() => {
    if (onKeyClick && keyDef.type === 'alpha') onKeyClick(keyDef.value);
  }, [onKeyClick, keyDef]);

  const faceY = isActive ? DEPTH + 1 : 0;
  const shadow = isActive
    ? 'inset 0 2px 5px rgba(0,0,0,0.55), inset 0 1px 2px rgba(0,0,0,0.7)'
    : 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.15)';

  return (
    <div
      onMouseDown={e => { e.preventDefault(); handleClick(); }}
      style={{
        position: 'relative',
        width: w,
        height: h + DEPTH,
        borderRadius: RADIUS,
        background: bgBot,
        boxShadow: isActive
          ? '0 1px 2px rgba(0,0,0,0.8)'
          : `0 ${DEPTH}px 0 rgba(0,0,0,0.65), 0 ${DEPTH + 3}px 10px rgba(0,0,0,0.5), 1px 0 0 rgba(0,0,0,0.3), -1px 0 0 rgba(0,0,0,0.2)`,
        border: '1px solid rgba(0,0,0,0.8)',
        borderLeft: '1px solid rgba(0,0,0,0.9)',
        borderRight: '1px solid rgba(0,0,0,0.6)',
        borderBottom: `${DEPTH}px solid rgba(0,0,0,0.0)`,
        cursor: onKeyClick && keyDef.type === 'alpha' ? 'pointer' : 'default',
        userSelect: 'none',
        flexShrink: 0,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 3,
          top: 2,
          width: w - 6,
          height: h - 4,
          borderRadius: RADIUS - 1,
          background: bgTop,
          color: txtCol,
          transform: `translateY(${faceY}px)`,
          transition: 'transform 0.04s ease, box-shadow 0.04s ease, background-color 0.04s',
          boxShadow: shadow,
          borderTop: '1px solid rgba(255,255,255,0.22)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '3px 4px 2px',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        {keyDef.shiftValue && keyDef.type === 'alpha' && (
          <span
            style={{
              fontSize: 7,
              lineHeight: 1,
              opacity: 0.55,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
              position: 'absolute',
              top: 3,
              left: 4,
            }}
          >
            {keyDef.shiftValue}
          </span>
        )}

        <span
          style={{
            fontSize: keyDef.type === 'alpha' ? 10 : 8,
            lineHeight: 1,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 600,
            letterSpacing: keyDef.type !== 'alpha' ? '0.02em' : 0,
            textTransform: keyDef.type !== 'alpha' ? 'uppercase' : 'none',
            opacity: keyDef.type !== 'alpha' ? 0.75 : 1,
            marginTop: 'auto',
            alignSelf: keyDef.id === 'enter' ? 'flex-end' : 'flex-start',
            marginBottom: 1,
            marginLeft: 2,
          }}
        >
          {keyDef.label}
        </span>

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            borderRadius: `${RADIUS - 1}px ${RADIUS - 1}px 0 0`,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.09) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeKeys, nextChar, pressedKey: _pressedKey, onKeyClick,
}) => {
  const expectedIds = new Set(getKeyIdsForChar(nextChar));
  const activeKeyIds = new Set<string>();

  for (const row of keyboardRows) {
    for (const key of row) {
      const held =
        activeKeys.has(key.value) ||
        (key.shiftValue && activeKeys.has(key.shiftValue)) ||
        (key.value === ' ' && activeKeys.has(' '));
      if (held) activeKeyIds.add(key.id);
      if ((key.id === 'lshift' || key.id === 'rshift') && activeKeys.has('Shift')) {
        activeKeyIds.add(key.id);
      }
    }
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: GAP,
        padding: '10px 12px 12px',
        borderRadius: 14,
        background: 'var(--boardBg)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.05)',
          'inset 0 -2px 0 rgba(0,0,0,0.4)',
          '0 14px 32px -8px rgba(0,0,0,0.65)',
          '0 4px 12px -4px rgba(0,0,0,0.5)',
        ].join(', '),
        perspective: 600,
        transform: 'rotateX(4deg)',
        transformOrigin: 'center bottom',
      }}
    >
      {keyboardRows.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: GAP }}>
          {row.map(keyDef => (
            <Key
              key={keyDef.id}
              keyDef={keyDef}
              isActive={activeKeyIds.has(keyDef.id)}
              isExpected={expectedIds.has(keyDef.id) && !activeKeyIds.has(keyDef.id)}
              onKeyClick={onKeyClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
