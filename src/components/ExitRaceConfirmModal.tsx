import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ExitRaceConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ExitRaceConfirmModal: React.FC<ExitRaceConfirmModalProps> = ({ open, onCancel, onConfirm }) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
      if (event.key === 'Enter') onConfirm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(5, 8, 15, 0.78)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          width: 'min(420px, 100%)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(180deg, rgba(12,16,24,0.98) 0%, rgba(7,10,16,0.98) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          padding: '28px 24px 22px',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#f5c451',
            background: 'rgba(245,196,81,0.12)',
            border: '1px solid rgba(245,196,81,0.24)',
          }}
        >
          <AlertTriangle size={28} />
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
            Exit Race?
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
            Leaving now will end the multiplayer race for both players and reset the timer.
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
            onClick={onCancel}
            style={{
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
            stay
          </button>
          <button
            onClick={onConfirm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid rgba(245,196,81,0.3)',
              background: 'rgba(245,196,81,0.14)',
              color: '#f5c451',
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
        </div>
      </div>
    </div>
  );
};

export default ExitRaceConfirmModal;
