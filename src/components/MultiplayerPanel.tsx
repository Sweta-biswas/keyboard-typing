import React, { useEffect, useRef, useState } from 'react';
import { MultiplayerStatus, Opponent } from '../hooks/useMultiplayer';
import { Swords, RotateCcw, Trophy, Zap, User } from 'lucide-react';

interface Props {
  status: MultiplayerStatus;
  opponent: Opponent | null;
  socketId?: string;
  onSearch: () => void;
  onCancel: () => void;
  myProgress: number;
}

const STYLES = `
  @keyframes mpIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mpBlink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes mpBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40% { transform: translateY(-3px); opacity: 1; }
  }
  @keyframes mpPing {
    0%  { transform: scale(1);   opacity: 0.6; }
    70% { transform: scale(2);   opacity: 0; }
    100%{ transform: scale(2);   opacity: 0; }
  }
  @keyframes mpCountPop {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .mp-wrap  { animation: mpIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  .mp-blink { animation: mpBlink 1s step-end infinite; }
  .mp-d1    { animation: mpBounce 1.1s ease-in-out infinite 0s; }
  .mp-d2    { animation: mpBounce 1.1s ease-in-out infinite 0.18s; }
  .mp-d3    { animation: mpBounce 1.1s ease-in-out infinite 0.36s; }
  .mp-count { animation: mpCountPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
  .mp-cta:hover  { opacity: 1 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(var(--accentRgb),0.4) !important; }
  .mp-ghost:hover { border-color: rgba(255,255,255,0.22) !important; color: rgba(255,255,255,0.65) !important; }
`;

const ACCENT = 'var(--accent)';
const RIVAL  = '#e05c6a';
const MONO   = "'DM Mono', monospace";
const SANS   = "'Outfit', sans-serif";

const Lbl: React.FC<{ c?: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: c ?? 'rgba(255,255,255,0.28)' }}>
    {children}
  </span>
);

const MiniBar: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', flex: 1 }}>
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: `${pct}%`,
      background: `linear-gradient(90deg, ${color}44, ${color})`,
      borderRadius: 2,
      transition: 'width 0.45s cubic-bezier(0.22,1,0.36,1)',
    }} />
    {pct > 1 && pct < 99 && (
      <div style={{
        position: 'absolute', top: '50%', left: `${pct}%`,
        transform: 'translate(-50%, -50%)',
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        border: '1.5px solid rgba(0,0,0,0.5)',
        boxShadow: `0 0 8px ${color}`,
        transition: 'left 0.45s cubic-bezier(0.22,1,0.36,1)',
        zIndex: 2,
      }} />
    )}
  </div>
);

const shell: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.02)',
  minHeight: 42,
  position: 'relative',
  overflow: 'hidden',
};

const MultiplayerPanel: React.FC<Props> = ({ status, opponent, socketId, onSearch, onCancel, myProgress }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const countKey = useRef(0);

  useEffect(() => {
    if (status === 'found') {
      setCountdown(3);
      const iv = setInterval(() => {
        setCountdown(p => {
          if (p !== null && p > 1) { countKey.current++; return p - 1; }
          return null;
        });
      }, 1000);
      return () => clearInterval(iv);
    }
    setCountdown(null);
  }, [status]);

  const myPct  = Math.min(100, myProgress * 100);
  const oppPct = Math.min(100, (opponent?.progress ?? 0) * 100);
  const leading    = myPct >= oppPct;
  const isFinished = status === 'finished';

  /* ── IDLE ── */
  if (status === 'idle') return (
    <div className="mp-wrap" style={shell}>
      <style>{STYLES}</style>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(var(--accentRgb),0.1)', border: '1px solid rgba(var(--accentRgb),0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, flexShrink: 0 }}>
        <Swords size={13} />
      </div>
      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: 'var(--textPrimary)', flex: 1 }}>Race a live opponent</span>
      <button
        onClick={onSearch}
        className="mp-cta"
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 999, background: ACCENT, color: 'var(--accentText)', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, transition: 'all 0.15s ease', boxShadow: '0 3px 14px rgba(var(--accentRgb),0.3)' }}
      >
        <Zap size={11} /> find match
      </button>
    </div>
  );

  /* ── SEARCHING ── */
  if (status === 'searching') return (
    <div className="mp-wrap" style={shell}>
      <style>{STYLES}</style>
      <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
        {[0, 0.5].map(d => (
          <div key={d} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid var(--accent)', animation: `mpPing 1.8s ease-out ${d}s infinite` }} />
        ))}
        <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', background: 'rgba(var(--accentRgb),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
          <Swords size={9} />
        </div>
      </div>
      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: 'var(--textPrimary)' }}>Searching</span>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {['mp-d1','mp-d2','mp-d3'].map(c => <div key={c} className={c} style={{ width: 3, height: 3, borderRadius: '50%', background: ACCENT }} />)}
      </div>
      <div style={{ flex: 1 }} />
      <button
        onClick={onCancel}
        className="mp-ghost"
        style={{ padding: '5px 14px', borderRadius: 999, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s', flexShrink: 0 }}
      >
        cancel
      </button>
    </div>
  );

  /* ── FOUND / PLAYING / FINISHED ── */
  return (
    <div className="mp-wrap" style={{ ...shell, gap: 10 }}>
      <style>{STYLES}</style>

      {/* Countdown overlay */}
      {status === 'found' && countdown !== null && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(8,8,12,0.9)', backdropFilter: 'blur(8px)', borderRadius: 10 }}>
          <Lbl>starts in</Lbl>
          <span key={countKey.current} className="mp-count" style={{ fontFamily: MONO, fontSize: 22, color: ACCENT, textShadow: '0 0 20px rgba(var(--accentRgb),0.7)', lineHeight: 1 }}>
            {countdown}
          </span>
        </div>
      )}

      {/* YOU */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(var(--accentRgb),0.1)', border: '1px solid rgba(var(--accentRgb),0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT }}>
          <User size={11} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, color: ACCENT, fontWeight: 500, minWidth: 28 }}>
          {Math.round(myPct)}<span style={{ fontSize: 8, opacity: 0.55 }}>%</span>
        </span>
      </div>

      {/* YOUR bar */}
      <MiniBar pct={myPct} color={ACCENT} />

      {/* Centre: vs + lead */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: 36 }}>
        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>vs</span>
        <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '0.06em', textTransform: 'uppercase', color: leading ? ACCENT : RIVAL, transition: 'color 0.4s', opacity: 0.65 }}>
          {leading ? '▲ you' : '▼ rival'}
        </span>
      </div>

      {/* RIVAL bar */}
      <MiniBar pct={oppPct} color={RIVAL} />

      {/* RIVAL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: RIVAL, fontWeight: 500, minWidth: 28, textAlign: 'right' }}>
          {Math.round(oppPct)}<span style={{ fontSize: 8, opacity: 0.55 }}>%</span>
        </span>
        {opponent && (
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
            {opponent.wpm}<span style={{ opacity: 0.45, fontSize: 8 }}>w</span>
          </span>
        )}
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(224,92,106,0.1)', border: '1px solid rgba(224,92,106,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RIVAL }}>
          <Swords size={11} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

      {/* Status */}
      {isFinished ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, background: myPct >= oppPct ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${myPct >= oppPct ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.07)'}`, color: myPct >= oppPct ? '#ffd700' : 'rgba(255,255,255,0.3)', fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <Trophy size={9} />
            {myPct >= oppPct ? 'win' : 'loss'}
          </div>
          <button
            onClick={onCancel}
            className="mp-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s' }}
          >
            <RotateCcw size={9} /> exit
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div className="mp-blink" style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT }} />
          <Lbl c={ACCENT}>live</Lbl>
        </div>
      )}
    </div>
  );
};

export default MultiplayerPanel;