import React, { useEffect, useMemo } from 'react';
import { MatchModalState } from '../hooks/useMultiplayer';
import { RotateCcw, Trophy, WifiOff, XCircle } from 'lucide-react';

interface RaceResultModalProps {
  result: MatchModalState | null;
  onClose: () => void;
  onExit: () => void;
}

const ICONS = {
  win: Trophy,
  loss: XCircle,
  disconnect: WifiOff,
  opponent_exit: RotateCcw,
} as const;

const COLORS = {
  win: '#f5c451',
  loss: '#f16f7c',
  disconnect: '#7dd3fc',
  opponent_exit: '#f5c451',
} as const;

const RaceResultModal: React.FC<RaceResultModalProps> = ({ result, onClose, onExit }) => {
  useEffect(() => {
    if (!result) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, onClose]);

  const particles = useMemo(() => {
    if (result?.outcome !== 'win') return [];

    return Array.from({ length: 18 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 18;
      const distance = 80 + (index % 3) * 18;
      return {
        id: index,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: `${index * 25}ms`,
      };
    });
  }, [result]);

  if (!result) return null;

  const Icon = ICONS[result.outcome];
  const accent = COLORS[result.outcome];
  const showExitAction = result.outcome === 'win' || result.outcome === 'loss';

  return (
    <>
      <style>{`
        @keyframes raceModalIn {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes raceBurst {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          30% { opacity: 1; }
          to { opacity: 0; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1); }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'rgba(5, 8, 15, 0.72)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 'min(440px, 100%)',
            borderRadius: 24,
            border: `1px solid ${accent}33`,
            background: 'linear-gradient(180deg, rgba(12,16,24,0.98) 0%, rgba(7,10,16,0.98) 100%)',
            boxShadow: `0 24px 60px rgba(0,0,0,0.45), 0 0 40px ${accent}22`,
            padding: '28px 24px 22px',
            overflow: 'hidden',
            animation: 'raceModalIn 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          {result.outcome === 'win' && particles.map(particle => (
            <span
              key={particle.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '36%',
                width: 10,
                height: 10,
                borderRadius: 999,
                background: particle.id % 2 === 0 ? accent : 'var(--accent)',
                boxShadow: `0 0 14px ${accent}`,
                ['--x' as string]: `${particle.x}px`,
                ['--y' as string]: `${particle.y}px`,
                animation: `raceBurst 720ms ease-out ${particle.delay} forwards`,
              }}
            />
          ))}

          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: accent,
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
            }}
          >
            <Icon size={28} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                margin: 0,
                color: 'var(--textPrimary)',
                fontFamily: "'Outfit', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '0.03em',
              }}
            >
              {result.title}
            </h2>
            <p
              style={{
                margin: '10px 0 0',
                color: 'var(--textMuted)',
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              {result.message}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 10,
              marginTop: 22,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: `1px solid ${accent}40`,
                background: `${accent}16`,
                color: accent,
                cursor: 'pointer',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              close
            </button>
            {showExitAction && (
              <button
                onClick={onExit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--textPrimary)',
                  cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <RotateCcw size={12} />
                exit race
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RaceResultModal;
