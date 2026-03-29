import React, { useEffect, useRef, useState } from 'react';
import { MatchPreference, MultiplayerStatus, Opponent } from '../hooks/useMultiplayer';
import { Swords, RotateCcw, Trophy, Zap, User } from 'lucide-react';

interface Props {
  status: MultiplayerStatus;
  opponent: Opponent | null;
  socketId?: string;
  onSearch: () => void;
  onCancel: () => void;
  onExitRace: () => void;
  myProgress: number;
  matchPreference: MatchPreference;
  onMatchPreferenceChange: (value: MatchPreference) => void;
}

const STYLES = `
  @keyframes mpIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes mpBlink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes mpBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
    40% { transform: translateY(-4px); opacity: 1; }
  }
  @keyframes mpPing {
    0%  { transform: scale(1); opacity: 0.6; }
    70% { transform: scale(2.2); opacity: 0; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes mpCountPop {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .mp-wrap { animation: mpIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
  .mp-blink { animation: mpBlink 1s step-end infinite; }
  .mp-d1 { animation: mpBounce 1.1s ease-in-out infinite 0s; }
  .mp-d2 { animation: mpBounce 1.1s ease-in-out infinite 0.18s; }
  .mp-d3 { animation: mpBounce 1.1s ease-in-out infinite 0.36s; }
  .mp-count { animation: mpCountPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
  .mp-cta:hover  { opacity: 1 !important; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(var(--accentRgb),0.45) !important; }
  .mp-ghost:hover { border-color: rgba(255,255,255,0.22) !important; color: rgba(255,255,255,0.6) !important; }
`;

const ACCENT  = 'var(--accent)';
const RIVAL   = '#e05c6a';
const MONO    = "'DM Mono', monospace";
const SANS    = "'Outfit', sans-serif";

const PREFERENCE_OPTIONS: { id: MatchPreference; label: string }[] = [
  { id: 'normal', label: 'normal' },
  { id: 'coding', label: 'coding' },
  { id: 'any',    label: 'any'    },
];

/* ── tiny helpers ─────────────────────────────────── */

const Mono: React.FC<{ size?: number; color?: string; children: React.ReactNode }> = ({
  size = 9, color = 'rgba(255,255,255,0.28)', children,
}) => (
  <span style={{ fontFamily: MONO, fontSize: size, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>
    {children}
  </span>
);

const PreferenceSelector: React.FC<{
  value: MatchPreference;
  onChange: (v: MatchPreference) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => (
  <div style={{ display: 'flex', gap: 5 }}>
    {PREFERENCE_OPTIONS.map(o => {
      const active = value === o.id;
      return (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          disabled={disabled}
          style={{
            padding: '4px 11px',
            borderRadius: 999,
            border: active
              ? '1px solid rgba(var(--accentRgb),0.4)'
              : '1px solid rgba(255,255,255,0.08)',
            background: active ? 'rgba(var(--accentRgb),0.12)' : 'transparent',
            color:  active ? ACCENT : 'var(--textMuted)',
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: disabled && !active ? 0.45 : 1,
            transition: 'all 0.15s',
          }}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

/* ── race track ───────────────────────────────────── */

const RacerRow: React.FC<{
  label: string;
  pct: number;
  color: string;
  wpm?: number;
  icon: React.ReactNode;
}> = ({ label, pct, color, wpm, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    {/* avatar */}
    <div style={{
      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
      background: `rgba(${color === ACCENT ? 'var(--accentRgb)' : '224,92,106'},0.1)`,
      border: `1px solid rgba(${color === ACCENT ? 'var(--accentRgb)' : '224,92,106'},0.25)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color,
    }}>
      {icon}
    </div>

    {/* name */}
    <Mono size={10} color={color}>{label}</Mono>

    {/* track */}
    <div style={{ flex: 1, position: 'relative', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${pct}%`,
        background: `linear-gradient(90deg, rgba(${color === ACCENT ? 'var(--accentRgb)' : '224,92,106'},0.4), ${color})`,
        borderRadius: 3,
        transition: 'width 0.45s cubic-bezier(0.22,1,0.36,1)',
      }} />
      {pct > 1 && pct < 99 && (
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%,-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: color,
          border: '2px solid rgba(0,0,0,0.5)',
          transition: 'left 0.45s cubic-bezier(0.22,1,0.36,1)',
          zIndex: 2,
        }} />
      )}
    </div>

    {/* pct */}
    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color, minWidth: 36, textAlign: 'right' }}>
      {Math.round(pct)}<span style={{ fontSize: 8, opacity: 0.5 }}>%</span>
    </span>

    {/* wpm (optional) */}
    {wpm !== undefined && (
      <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.22)', minWidth: 30, textAlign: 'right' }}>
        {wpm}<span style={{ opacity: 0.45, fontSize: 8 }}>w</span>
      </span>
    )}
  </div>
);

const VsDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
    <Mono size={8} color="rgba(255,255,255,0.14)">vs</Mono>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
  </div>
);

/* ── shared panel chrome ──────────────────────────── */

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mp-wrap" style={{
    width: '100%',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.025)',
    overflow: 'hidden',
  }}>
    <style>{STYLES}</style>
    {children}
  </div>
);

const PanelHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  }}>
    {children}
  </div>
);

const PanelBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
    {children}
  </div>
);

const IconBox: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{
    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
    background: `rgba(var(--accentRgb),0.1)`,
    border: `1px solid rgba(var(--accentRgb),0.2)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color,
  }}>
    {children}
  </div>
);

const CtaButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="mp-cta"
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      width: '100%', padding: '10px',
      borderRadius: 10,
      background: ACCENT,
      border: 'none', cursor: 'pointer',
      fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#fff', fontWeight: 600,
      transition: 'all 0.15s',
      boxShadow: '0 4px 18px rgba(var(--accentRgb),0.3)',
    }}
  >
    {icon}{label}
  </button>
);

const GhostButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="mp-ghost"
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      width: '100%', padding: '8px',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'transparent',
      color: 'rgba(255,255,255,0.3)',
      cursor: 'pointer',
      fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
      transition: 'all 0.15s',
    }}
  >
    {icon}{label}
  </button>
);

/* ── main component ───────────────────────────────── */

const MultiplayerPanel: React.FC<Props> = ({
  status,
  opponent,
  onSearch,
  onCancel,
  onExitRace,
  myProgress,
  matchPreference,
  onMatchPreferenceChange,
}) => {
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
  const isFinished = status === 'finished';

  /* ── idle ── */
  if (status === 'idle') return (
    <Panel>
      <PanelHeader>
        <IconBox color={ACCENT}><Swords size={13} /></IconBox>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: 'var(--textPrimary)', flex: 1 }}>
          Race a live opponent
        </span>
      </PanelHeader>
      <PanelBody>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Mono>race mode</Mono>
          <PreferenceSelector value={matchPreference} onChange={onMatchPreferenceChange} />
        </div>
        <CtaButton onClick={onSearch} icon={<Zap size={12} />} label="find match" />
      </PanelBody>
    </Panel>
  );

  /* ── searching ── */
  if (status === 'searching') return (
    <Panel>
      <PanelHeader>
        {/* pulsing ring */}
        <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
          {[0, 0.5].map(d => (
            <div key={d} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid var(--accent)',
              animation: `mpPing 1.8s ease-out ${d}s infinite`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 6, borderRadius: '50%',
            background: 'rgba(var(--accentRgb),0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT,
          }}>
            <Swords size={9} />
          </div>
        </div>

        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: 'var(--textPrimary)', flex: 1 }}>
          Searching for a match
        </span>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {['mp-d1', 'mp-d2', 'mp-d3'].map(c => (
            <div key={c} className={c} style={{ width: 3, height: 3, borderRadius: '50%', background: ACCENT }} />
          ))}
        </div>
      </PanelHeader>

      <PanelBody>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Mono>matching</Mono>
          <PreferenceSelector value={matchPreference} onChange={onMatchPreferenceChange} disabled />
        </div>
        <GhostButton onClick={onCancel} icon={<RotateCcw size={11} />} label="cancel search" />
      </PanelBody>
    </Panel>
  );

  /* ── found / racing / finished — compact single-row bar ── */
  return (
    <div className="mp-wrap" style={{
      position: 'relative',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.025)',
      minHeight: 40,
      overflow: 'hidden',
    }}>
      <style>{STYLES}</style>

      {/* countdown overlay */}
      {status === 'found' && countdown !== null && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: 'rgba(8,8,12,0.92)',
          backdropFilter: 'blur(6px)',
          borderRadius: 10,
        }}>
          <Mono size={9} color="rgba(255,255,255,0.3)">starts in</Mono>
          <span
            key={countKey.current}
            className="mp-count"
            style={{ fontFamily: MONO, fontSize: 22, color: ACCENT, lineHeight: 1 }}
          >
            {countdown}
          </span>
        </div>
      )}

      {/* left: status indicator */}
      {isFinished ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 999, flexShrink: 0,
          background: myPct >= oppPct ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${myPct >= oppPct ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.07)'}`,
          color: myPct >= oppPct ? '#ffd700' : 'rgba(255,255,255,0.3)',
        }}>
          <Trophy size={10} />
          <Mono size={9} color={myPct >= oppPct ? '#ffd700' : 'rgba(255,255,255,0.3)'}>
            {myPct >= oppPct ? 'win' : 'loss'}
          </Mono>
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 999, flexShrink: 0,
          border: '1px solid rgba(var(--accentRgb),0.2)',
          background: 'rgba(var(--accentRgb),0.07)',
        }}>
          <div className="mp-blink" style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT, flexShrink: 0 }} />
          <Mono size={9} color={ACCENT}>live</Mono>
        </div>
      )}

      {/* you: stacked avatar + label + pct */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'rgba(var(--accentRgb),0.1)',
          border: '1px solid rgba(var(--accentRgb),0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT,
        }}>
          <User size={11} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7 }}>you</span>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: ACCENT, lineHeight: 1 }}>
          {Math.round(myPct)}<span style={{ fontSize: 7, opacity: 0.5 }}>%</span>
        </span>
      </div>

      {/* you: track */}
      <div style={{ flex: 1, position: 'relative', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${myPct}%`,
          background: `linear-gradient(90deg, rgba(var(--accentRgb),0.35), var(--accent))`,
          borderRadius: 3,
          transition: 'width 0.45s cubic-bezier(0.22,1,0.36,1)',
        }} />
        {myPct > 1 && myPct < 99 && (
          <div style={{
            position: 'absolute', top: '50%', left: `${myPct}%`,
            transform: 'translate(-50%,-50%)',
            width: 9, height: 9, borderRadius: '50%',
            background: ACCENT, border: '2px solid rgba(0,0,0,0.5)',
            transition: 'left 0.45s cubic-bezier(0.22,1,0.36,1)', zIndex: 2,
          }} />
        )}
      </div>

      {/* vs */}
      <Mono size={8} color="rgba(255,255,255,0.18)">vs</Mono>

      {/* rival: track */}
      <div style={{ flex: 1, position: 'relative', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${oppPct}%`,
          background: `linear-gradient(90deg, rgba(224,92,106,0.35), ${RIVAL})`,
          borderRadius: 3,
          transition: 'width 0.45s cubic-bezier(0.22,1,0.36,1)',
        }} />
        {oppPct > 1 && oppPct < 99 && (
          <div style={{
            position: 'absolute', top: '50%', left: `${oppPct}%`,
            transform: 'translate(-50%,-50%)',
            width: 9, height: 9, borderRadius: '50%',
            background: RIVAL, border: '2px solid rgba(0,0,0,0.5)',
            transition: 'left 0.45s cubic-bezier(0.22,1,0.36,1)', zIndex: 2,
          }} />
        )}
      </div>

      {/* rival: stacked avatar + label + pct */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'rgba(224,92,106,0.1)',
          border: '1px solid rgba(224,92,106,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: RIVAL,
        }}>
          <Swords size={11} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: RIVAL, opacity: 0.7 }}>rival</span>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: RIVAL, lineHeight: 1 }}>
          {Math.round(oppPct)}<span style={{ fontSize: 7, opacity: 0.5 }}>%</span>
        </span>
      </div>

      {/* divider */}
      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

      {/* exit / play again */}
      <button
        onClick={isFinished ? onCancel : onExitRace}
        className="mp-ghost"
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 999, flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent',
          color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer',
          fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
          transition: 'all 0.15s',
        }}
      >
        <RotateCcw size={9} />
        {isFinished ? 'again' : 'exit'}
      </button>
    </div>
  );
};

export default MultiplayerPanel;