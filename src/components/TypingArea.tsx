import React, { useRef, useEffect } from 'react';
import { CharState } from '../hooks/useTyping';

interface TypingAreaProps {
  passage: string;
  charStates: CharState[];
  currentIndex: number;
  isFinished: boolean;
  expanded?: boolean;
}

const TypingArea: React.FC<TypingAreaProps> = ({
  passage, charStates, currentIndex, isFinished, expanded = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (currentCharRef.current && scrollContainerRef.current) {
      // 'center' elegantly keeps the active text in the exact middle of our fixed view!
      currentCharRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentIndex]);

  const getStyle = (state: CharState): React.CSSProperties => {
    switch (state) {
      case 'correct': return { color: 'var(--correct)' };
      case 'incorrect': return { color: 'var(--incorrect)' };
      case 'current': return { color: 'var(--textPrimary)', background: 'rgba(var(--accentRgb), 0.1)', borderRadius: '4px' };
      default: return { color: 'var(--textPrimary)', opacity: 0.25 }; // More consistent than fixed grey
    }
  };

  return (
    <div
      className="relative w-full select-none outline-none"
      style={{
        height: expanded ? 'auto' : '180px',
      }}
    >
      {!expanded && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, var(--pageBg) 20%, transparent)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-10 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to top, var(--pageBg) 20%, transparent)' }}
          />
        </>
      )}

      <div
        ref={scrollContainerRef}
        className="font-mono text-[26px] sm:text-[32px] leading-relaxed whitespace-pre-wrap break-all"
        style={{
          height: expanded ? 'auto' : '100%',
          overflowY: expanded ? 'visible' : 'hidden',
          padding: expanded ? '12px 0' : '40px 0'
        }}
      >
        {passage.split('').map((char, index) => {
          const state = charStates[index] ?? 'pending';
          const isCurrent = index === currentIndex && !isFinished;

          if (char === ' ') {
            if (state === 'incorrect') {
              return (
                <span
                  key={index}
                  className="inline-block mx-[0.1ch]"
                  style={{
                    background: 'var(--incorrect)',
                    opacity: 0.6,
                    width: '0.6ch',
                    height: '1.2em',
                    verticalAlign: 'middle',
                    borderRadius: '2px',
                  }}
                >
                  &nbsp;
                </span>
              );
            }
            return (
              <span key={index} className="relative inline-block" style={{ width: '0.6ch' }}>
                {isCurrent && (
                  <span
                    className="caret-blink absolute left-0 bottom-1 w-full rounded-sm"
                    style={{
                      height: '3px',
                      background: 'var(--caretColor)',
                      bottom: '2px',
                      boxShadow: '0 0 10px var(--caretColor)'
                    }}
                  />
                )}
                &nbsp;
              </span>
            );
          }

          return (
            <span
              key={index}
              ref={isCurrent ? currentCharRef : null}
              className="relative inline-block transition-all duration-150 px-[1px]"
              style={getStyle(state)}
            >
              {isCurrent && (
                <span
                  className="caret-blink absolute left-0 w-full rounded-sm"
                  style={{
                    height: '3px',
                    bottom: '1px',
                    background: 'var(--caretColor)',
                    boxShadow: '0 0 12px var(--caretColor)',
                  }}
                  aria-hidden="true"
                />
              )}
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TypingArea;
