import React, { useState, useEffect, useCallback } from 'react';
import { useTyping } from './hooks/useTyping';
import { useSound, SoundStyle } from './hooks/useSound';
import { Mode, Difficulty, TIMER_OPTIONS, TimerDuration } from './data/snippets';
import { themes, defaultTheme, Theme } from './data/themes';
import { useMultiplayer } from './hooks/useMultiplayer';

import TypingArea from './components/TypingArea';
import VirtualKeyboard from './components/VirtualKeyboard';
import StatsDisplay from './components/StatsDisplay';
import Timer from './components/Timer';
import MultiplayerPanel from './components/MultiplayerPanel';
import RaceResultModal from './components/RaceResultModal';
import ExitRaceConfirmModal from './components/ExitRaceConfirmModal';
//@ts-ignore
import logo from './assets/logo.png';
import { RotateCcw, Swords, Volume2, Volume1, VolumeX, Keyboard } from 'lucide-react';

// ── Inject global styles ────────────────────────────────────────────────────
const GlobalStyle = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Outfit:wght@300;400;500;600;700;800&display=swap');

      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html, body, #root {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      body {
        background: var(--pageBg);
        font-family: 'Outfit', sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      ::-webkit-scrollbar { display: none; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 18px rgba(var(--accentRgb), 0.2); }
        50%       { box-shadow: 0 0 32px rgba(var(--accentRgb), 0.45); }
      }

      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }

      .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
      .fade-up-d1 { animation-delay: 0.05s; }
      .fade-up-d2 { animation-delay: 0.1s; }
      .fade-up-d3 { animation-delay: 0.15s; }

      .pill-btn {
        padding: 5px 13px;
        border-radius: 999px;
        font-size: 12px;
        font-family: 'DM Mono', monospace;
        font-weight: 400;
        letter-spacing: 0.02em;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        transition: all 0.18s ease;
        color: var(--textMuted);
        white-space: nowrap;
        user-select: none;
      }

      .pill-btn:hover {
        background: rgba(255,255,255,0.06);
        color: var(--textPrimary);
        border-color: rgba(255,255,255,0.08);
      }

      .pill-btn.active {
        background: rgba(var(--accentRgb), 0.12);
        color: var(--accent);
        border-color: rgba(var(--accentRgb), 0.25);
      }

      .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--textMuted);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        border-radius: 8px;
        transition: all 0.18s ease;
      }

      .icon-btn:hover {
        color: var(--textPrimary);
        background: rgba(255,255,255,0.06);
      }

      .icon-btn.active {
        color: var(--accent);
        background: rgba(var(--accentRgb), 0.1);
      }

      /* Noise texture overlay via pseudo */
      .noise-layer::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0.025;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 200px;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 11px 34px;
        border-radius: 999px;
        background: var(--accent);
        color: var(--accentText);
        border: none;
        cursor: pointer;
        font-family: 'DM Mono', monospace;
        font-weight: 500;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        animation: pulseGlow 3s ease-in-out infinite;
      }

      .reset-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(var(--accentRgb), 0.4) !important;
      }

      .sep {
        width: 1px;
        height: 14px;
        background: rgba(255,255,255,0.1);
        flex-shrink: 0;
        margin: 0 3px;
      }

      /* ── Theme swatch strip ── */
      .theme-strip {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 999px;
        padding: 2px 6px;
        position: relative;
        overflow: visible;
        flex-shrink: 0;
      }

      .theme-swatch {
        position: relative;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        padding: 0;
        cursor: pointer;
        border: none;
        outline: none;
        transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
        flex-shrink: 0;
        overflow: hidden;
        background: transparent;
      }

      .theme-swatch::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        z-index: 2;
        pointer-events: none;
      }

      .theme-swatch:hover {
        transform: scale(1.2);
        z-index: 5;
      }

      .theme-swatch.active {
        transform: scale(1.18);
        z-index: 5;
      }

      .theme-swatch.active::before {
        border-color: rgba(255,255,255,0.7);
        box-shadow: 0 0 0 1.5px rgba(0,0,0,0.5) inset;
      }

      /* Split half-and-half fill */
      .theme-swatch-fill {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        overflow: hidden;
      }

      .theme-swatch-fill .half-bg {
        position: absolute;
        top: 0; left: 0;
        width: 50%; height: 100%;
      }

      .theme-swatch-fill .half-accent {
        position: absolute;
        top: 0; right: 0;
        width: 50%; height: 100%;
      }

      /* Tooltip on hover */
      .theme-swatch .swatch-tip {
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%) translateY(4px);
        background: rgba(10,10,14,0.92);
        color: rgba(255,255,255,0.85);
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        letter-spacing: 0.08em;
        white-space: nowrap;
        padding: 4px 8px;
        border-radius: 5px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease, transform 0.15s ease;
        border: 1px solid rgba(255,255,255,0.1);
        z-index: 100;
      }

      .theme-swatch:hover .swatch-tip {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* Active glow ring around entire strip for selected accent */
      .theme-strip::after {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: 999px;
        pointer-events: none;
        box-shadow: 0 0 14px rgba(var(--accentRgb), 0.15);
        z-index: 0;
      }

      .logo-mark {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'DM Mono', monospace;
        font-weight: 500;
        font-size: 11px;
        letter-spacing: -0.03em;
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
      }

      .logo-mark::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        pointer-events: none;
      }

      .shimmer-text {
        background: linear-gradient(
          90deg,
          var(--textMuted) 0%,
          var(--textPrimary) 40%,
          var(--accent) 50%,
          var(--textPrimary) 60%,
          var(--textMuted) 100%
        );
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: shimmer 5s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
};

// ── Main App ────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('normal');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [soundStyle, setSoundStyle] = useState<SoundStyle>('click');
  const [showKbd, setShowKbd] = useState(true);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<TimerDuration>(60);
  const [showExitRaceConfirm, setShowExitRaceConfirm] = useState(false);

  const mp = useMultiplayer();
  const isTypingDisabled = isMultiplayer && mp.status !== 'playing';

  // Apply theme CSS vars
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--pageBg', theme.pageBg);
    r.style.setProperty('--textPrimary', theme.textPrimary);
    r.style.setProperty('--textMuted', theme.textMuted);
    r.style.setProperty('--correct', theme.correct);
    r.style.setProperty('--incorrect', theme.incorrect);
    r.style.setProperty('--caretColor', theme.caretColor);
    r.style.setProperty('--boardBg', theme.boardBg);
    r.style.setProperty('--alphaBg', theme.alphaBg);
    r.style.setProperty('--alphaBottom', theme.alphaBottom);
    r.style.setProperty('--alphaText', theme.alphaText);
    r.style.setProperty('--modBg', theme.modBg);
    r.style.setProperty('--modBottom', theme.modBottom);
    r.style.setProperty('--modText', theme.modText);
    r.style.setProperty('--accentBg', theme.accentBg);
    r.style.setProperty('--accentBottom', theme.accentBottom);
    r.style.setProperty('--accentText', theme.accentText);
    r.style.setProperty('--highlightGlow', theme.highlightGlow);
    const hex = theme.accentBg.replace('#', '');
    if (hex.length === 6) {
      r.style.setProperty('--accentRgb',
        `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`
      );
    }
    r.style.setProperty('--accent', theme.accentBg);
    r.style.setProperty('--surfaceBorder', 'rgba(255,255,255,0.07)');
    r.style.setProperty('--surfaceBg', theme.boardBg);
  }, [theme]);

  const { playClick } = useSound(soundStyle);

  const {
    passage, charStates, currentIndex,
    stats, timeLeft, isStarted, isFinished,
    activeKeys, pressedKey, resetTest, injectChar,
    setExternalPassage, forceStart,
  } = useTyping(mode, difficulty, selectedDuration, playClick, isTypingDisabled);

  const nextChar = passage[currentIndex] ?? '';
  const totalDuration = selectedDuration ?? 0;
  const myProgress = passage.length > 0 ? stats.correct / passage.length : 0;
  const isMatchSettingsSynced =
    !isMultiplayer ||
    (
      (!mp.matchMode || mode === mp.matchMode) &&
      (!mp.matchDifficulty || difficulty === mp.matchDifficulty) &&
      (!mp.matchDuration || selectedDuration === mp.matchDuration)
    );

  useEffect(() => {
    if (!isMultiplayer || !isMatchSettingsSynced) return;
    if ((mp.status === 'found' || mp.status === 'playing') && mp.passage) {
      setExternalPassage(mp.passage);
    }
    if (mp.status === 'playing') forceStart();
  }, [isMultiplayer, isMatchSettingsSynced, mp.status, mp.passage, forceStart, setExternalPassage]);

  useEffect(() => {
    if (isMultiplayer && mp.matchMode && mode !== mp.matchMode) {
      setMode(mp.matchMode);
    }
  }, [isMultiplayer, mp.matchMode, mode]);

  useEffect(() => {
    if (isMultiplayer && mp.matchDifficulty && difficulty !== mp.matchDifficulty) {
      setDifficulty(mp.matchDifficulty);
    }
  }, [isMultiplayer, mp.matchDifficulty, difficulty]);

  useEffect(() => {
    if (isMultiplayer && mp.matchDuration && selectedDuration !== mp.matchDuration) {
      setSelectedDuration(mp.matchDuration);
    }
  }, [isMultiplayer, mp.matchDuration, selectedDuration]);

  useEffect(() => {
    if (isMultiplayer && isStarted && mp.status === 'playing') {
      mp.sendProgress(myProgress, stats.wpm, stats.accuracy, currentIndex);
    }
  }, [stats.correct, stats.wpm]);

  useEffect(() => {
    if (isMultiplayer && isFinished && mp.status === 'playing') mp.finishMatch();
  }, [isFinished]);

  useEffect(() => {
    if (mp.exitVersion > 0) {
      setShowExitRaceConfirm(false);
      resetTest();
    }
  }, [mp.exitVersion, resetTest]);

  const handleReset = useCallback(() => {
    if (soundStyle !== 'none') playClick();
    resetTest();
  }, [soundStyle, playClick, resetTest]);

  const soundIcon =
    soundStyle === 'click' ? <Volume2 size={13} /> :
      soundStyle === 'soft' ? <Volume1 size={13} /> :
        <VolumeX size={13} />;

  const cycleSoundStyle = () => {
    setSoundStyle(s => s === 'click' ? 'soft' : s === 'soft' ? 'none' : 'click');
  };

  const showTyping = !isFinished && (!isMultiplayer || mp.status === 'playing' || mp.status === 'found');
  const areRaceSettingsLocked = isMultiplayer;
  const lockedPillStyle = areRaceSettingsLocked
    ? { opacity: 0.55, cursor: 'not-allowed' as const }
    : undefined;
  const requestExitRace = useCallback(() => {
    if (isMultiplayer) {
      setShowExitRaceConfirm(true);
    }
  }, [isMultiplayer]);

  const handleExitRace = useCallback(() => {
    setShowExitRaceConfirm(false);
    mp.dismissResultModal();
    if (isMultiplayer) {
      mp.exitRace();
    }
  }, [mp, isMultiplayer]);

  return (
    <>
      <GlobalStyle />
      <ExitRaceConfirmModal
        open={showExitRaceConfirm}
        onCancel={() => setShowExitRaceConfirm(false)}
        onConfirm={handleExitRace}
      />
      <RaceResultModal
        result={mp.resultModal}
        onClose={mp.dismissResultModal}
        onExit={requestExitRace}
      />
      <div
        className="noise-layer"
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--pageBg)',
          color: 'var(--textPrimary)',
          fontFamily: "'Outfit', sans-serif",
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow blob */}
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(var(--accentRgb), 0.06) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.6s ease',
        }} />

        {/* ══ HEADER ══════════════════════════════════════════════════════ */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          flexShrink: 0,
          zIndex: 10,
          position: 'relative',
        }}>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <img
              src={logo}
              alt="KeyroX"
              style={{
                height: 34,
                width: 34,
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 14px rgba(255, 184, 77, 0.34))',
              }}
            />

            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: '0.1em',
                background: 'linear-gradient(90deg, #fffdf8 0%, #ffd59a 52%, #ffb347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 22px rgba(255, 179, 71, 0.18)',
              }}
            >
              KeyroX
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(!isMultiplayer || mp.status === 'playing') && !isFinished && (
              <Timer
                timeLeft={timeLeft}
                totalDuration={totalDuration}
                isStarted={isStarted}
                isFinished={isFinished}
              />
            )}

            {!isMultiplayer && (
              <button
                onClick={handleReset}
                title="Restart (Tab)"
                className="reset-btn"
                style={{
                  padding: '8px 18px',
                  fontSize: '11px',
                  animation: 'none', // optional: disable pulse if too distracting
                }}
              >
                <RotateCcw size={13} />
                restart
              </button>
            )}
          </div>
        </header>

        {/* ══ MAIN ════════════════════════════════════════════════════════ */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 36px',
          width: '100%',
          maxWidth: 960,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          gap: 0,
          minHeight: 0,
        }}>

          {/* Multiplayer panel */}
          {isMultiplayer && (
            <div className="fade-up" style={{ width: '100%', marginBottom: 20 }}>
              <MultiplayerPanel
                status={mp.status}
                opponent={mp.opponent}
                socketId={mp.socketId}
                onSearch={mp.searchMatch}
                onCancel={mp.cancelSearch}
                onExitRace={requestExitRace}
                myProgress={myProgress}
                matchPreference={mp.matchPreference}
                onMatchPreferenceChange={mp.setMatchPreference}
              />
            </div>
          )}

          {/* ── Results screen ── */}
          {isFinished && (
            <div className="fade-up" style={{ width: '100%', textAlign: 'center' }}>
              <StatsDisplay stats={stats} isFinished timeLeft={timeLeft} mode={mode} totalDuration={totalDuration} />
              {!isMultiplayer && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                  <button onClick={handleReset} className="reset-btn">
                    <RotateCcw size={13} />
                    new test
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Active test layout ── */}
          {!isFinished && (
            <div
              className="fade-up"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                flex: 1,
                minHeight: 0,
                justifyContent: 'center',
              }}
            >



              {/* Typing area */}
              {showTyping && (
                <div className="fade-up fade-up-d1" style={{ width: '100%' }}>
                  <TypingArea
                    passage={passage}
                    charStates={charStates}
                    currentIndex={currentIndex}
                    isFinished={isFinished}
                    expanded={!showKbd}
                  />
                </div>
              )}

              {/* ── Settings toolbar ── */}
              <div
                className="fade-up fade-up-d2"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid var(--surfaceBorder)',
                  flexWrap: 'nowrap',
                  gap: 8,
                  minHeight: 36,
                }}
              >
                {/* Left controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0,
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  overflowY: 'visible',
                  minWidth: 0,
                  scrollbarWidth: 'none',
                  paddingBottom: 2,
                }}>
                  <button className={`pill-btn ${mode === 'normal' ? 'active' : ''}`} onClick={() => setMode('normal')} disabled={areRaceSettingsLocked} style={lockedPillStyle}>normal</button>
                  <button className={`pill-btn ${mode === 'coding' ? 'active' : ''}`} onClick={() => setMode('coding')} disabled={areRaceSettingsLocked} style={lockedPillStyle}>coding</button>
                  <div className="sep" />
                  {TIMER_OPTIONS.map(duration => (
                    <button
                      key={duration}
                      className={`pill-btn ${selectedDuration === duration ? 'active' : ''}`}
                      onClick={() => setSelectedDuration(duration)}
                      disabled={areRaceSettingsLocked}
                      style={lockedPillStyle}
                    >
                      {duration}s
                    </button>
                  ))}
                  <div className="sep" />
                  <button className={`pill-btn ${difficulty === 'easy' ? 'active' : ''}`} onClick={() => setDifficulty('easy')} disabled={areRaceSettingsLocked} style={lockedPillStyle}>easy</button>
                  <button className={`pill-btn ${difficulty === 'medium' ? 'active' : ''}`} onClick={() => setDifficulty('medium')} disabled={areRaceSettingsLocked} style={lockedPillStyle}>medium</button>
                  <button className={`pill-btn ${difficulty === 'hard' ? 'active' : ''}`} onClick={() => setDifficulty('hard')} disabled={areRaceSettingsLocked} style={lockedPillStyle}>hard</button>
                  <div className="sep" />
                  <button
                    className="pill-btn"
                    onClick={cycleSoundStyle}
                    title={`Sound: ${soundStyle}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {soundIcon} {soundStyle}
                  </button>
                  <div className="sep" />
                  <button
                    className={`pill-btn ${isMultiplayer ? 'active' : ''}`}
                    onClick={() => { setIsMultiplayer(v => !v); if (isMultiplayer) mp.cancelSearch(); }}
                    title="Multiplayer race"
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <Swords size={11} /> race
                  </button>
                  <div className="sep" />

                  {/* Theme swatch strip */}
                  <div className="theme-strip" style={{ marginLeft: 2 }}>
                    {themes.map(t => (
                      <button
                        key={t.id}
                        className={`theme-swatch ${theme.id === t.id ? 'active' : ''}`}
                        onClick={() => setTheme(t)}
                        aria-label={t.name}
                      >
                        {/* Split bg / accent fill */}
                        <div className="theme-swatch-fill">
                          <div className="half-bg" style={{ background: t.boardBg }} />
                          <div className="half-accent" style={{ background: t.accentBg }} />
                        </div>
                        {/* Hover tooltip */}
                        <span className="swatch-tip">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: keyboard toggle */}
                <button
                  onClick={() => setShowKbd(v => !v)}
                  title="Toggle keyboard"
                  className={`icon-btn ${showKbd ? 'active' : ''}`}
                  style={{ flexShrink: 0 }}
                >
                  <Keyboard size={14} />
                </button>
              </div>

              {/* Virtual keyboard */}
              {showTyping && showKbd && (
                <div
                  className="fade-up fade-up-d3"
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                >
                  <VirtualKeyboard
                    activeKeys={activeKeys}
                    nextChar={isFinished ? '' : nextChar}
                    pressedKey={pressedKey}
                    onKeyClick={v => injectChar(v)}
                  />
                </div>
              )}

            </div>
          )}
        </main>

        {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
        <footer style={{
          borderTop: '1px solid var(--surfaceBorder)',
          padding: '8px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          zIndex: 10,
          position: 'relative',
        }}>
          <span
            className="shimmer-text"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              opacity: 0.8
            }}
          >
            press any key to begin
          </span>
        </footer>

      </div>
    </>
  );
};

export default App;
