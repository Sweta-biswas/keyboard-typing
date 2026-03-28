import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalDuration: number;
  isStarted: boolean;
  isFinished: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalDuration, isStarted }) => {
  const isCritical = totalDuration > 0 && timeLeft <= Math.min(10, Math.ceil(totalDuration / 3));
  const isWarning =
    totalDuration > 0 &&
    timeLeft <= Math.min(20, Math.ceil((totalDuration * 2) / 3)) &&
    !isCritical;

  const color = isCritical
    ? 'var(--incorrect)'
    : isWarning
      ? 'var(--accent)'
      : 'var(--textMuted)';

  const display = formatTime(timeLeft);

  return (
    <div className="flex items-center gap-2">
      {/* Glowing dot */}
      <div
        className="w-1.5 h-1.5 rounded-full transition-all duration-500"
        style={{
          background: isStarted ? color : 'var(--textMuted)',
          boxShadow: isStarted && isCritical ? `0 0 8px ${color}` : 'none',
          opacity: isStarted ? 1 : 0.4,
        }}
      />
      <span
        className="font-mono text-lg font-medium tabular-nums tracking-tighter transition-colors duration-300"
        style={{ color, letterSpacing: '-0.04em' }}
      >
        {display}
      </span>
    </div>
  );
};

export default Timer;
