import React from 'react';
import { TypingStats } from '../hooks/useTyping';
import { Mode } from '../data/snippets';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface StatsDisplayProps {
  stats: TypingStats;
  isFinished: boolean;
  timeLeft: number;
  mode: Mode;
  totalDuration: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs font-mono shadow-xl"
        style={{
          background: 'var(--surfaceBg)',
          border: '1px solid var(--surfaceBorder)',
          color: 'var(--textPrimary)',
        }}
      >
        <div style={{ color: 'var(--textMuted)', marginBottom: 4 }}>{label}s</div>
        {payload.map((entry: any) => (
          <div key={entry.name} style={{ color: entry.color }}>
            {entry.name}&nbsp;{entry.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, isFinished, timeLeft, mode, totalDuration }) => {
  const elapsedSec = totalDuration - timeLeft;

  if (isFinished) {
    const chartData = stats.history.length > 0
      ? stats.history
      : [{ time: 1, wpm: stats.wpm, raw: stats.wpm, accuracy: stats.accuracy }];

    const grade = (() => {
      if (stats.wpm >= 120) return { label: 'S', color: '#a855f7' };
      if (stats.wpm >= 90)  return { label: 'A', color: 'var(--accent)' };
      if (stats.wpm >= 60)  return { label: 'B', color: '#60a5fa' };
      if (stats.wpm >= 40)  return { label: 'C', color: '#34d399' };
      return { label: 'D', color: 'var(--textMuted)' };
    })();

    return (
      <div className="w-full animate-slide-up">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-mono text-sm font-medium tracking-widest uppercase" style={{ color: 'var(--textMuted)' }}>
            results
          </h2>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-lg font-black"
            style={{ background: `${grade.color}22`, color: grade.color, border: `1px solid ${grade.color}44` }}
          >
            {grade.label}
          </div>
        </div>

        {/* Main: stats left + chart right */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start w-full mb-10">
          {/* Big stats */}
          <div className="flex flex-row md:flex-col gap-8 shrink-0">
            {/* WPM */}
            <div className="stat-chip animate-fade-in" style={{ animationDelay: '80ms' }}>
              <span className="label">wpm</span>
              <span className="value" style={{ color: 'var(--accent)' }}>{stats.wpm}</span>
            </div>
            {/* Accuracy */}
            <div className="stat-chip animate-fade-in" style={{ animationDelay: '160ms' }}>
              <span className="label">accuracy</span>
              <span className="value" style={{ color: 'var(--textPrimary)' }}>{stats.accuracy}<span style={{ fontSize: 28 }}>%</span></span>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 w-full min-h-[200px] animate-fade-in" style={{ animationDelay: '240ms' }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="time"
                  stroke="transparent"
                  tick={{ fill: 'var(--textMuted)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={20}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: 'var(--textMuted)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
                  animationDuration={1200}
                />
                <Line
                  type="monotone"
                  dataKey="raw"
                  stroke="var(--textMuted)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  opacity={0.45}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex gap-5 mt-1 pl-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded" style={{ background: 'var(--accent)' }} />
                <span className="text-[10px] font-mono" style={{ color: 'var(--textMuted)' }}>wpm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-px rounded" style={{ background: 'var(--textMuted)', opacity: 0.5 }} />
                <span className="text-[10px] font-mono" style={{ color: 'var(--textMuted)' }}>raw</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="accent-line mb-6" />

        {/* Detail chips */}
        <div
          className="flex flex-wrap gap-8 animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          {[
            { label: 'test type', value: mode },
            { label: 'time',      value: `${elapsedSec}s` },
            { label: 'correct',   value: stats.correct },
            { label: 'incorrect', value: stats.incorrect, color: stats.incorrect > 0 ? 'var(--incorrect)' : undefined },
            { label: 'keystrokes',value: stats.totalTyped },
          ].map(chip => (
            <div key={chip.label} className="stat-chip">
              <span className="label">{chip.label}</span>
              <span
                className="font-mono text-xl font-semibold"
                style={{ color: chip.color ?? 'var(--textPrimary)' }}
              >
                {chip.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Live compact
  return (
    <div className="flex items-center gap-5 font-mono text-sm">
      <div className="flex items-center gap-1.5">
        <span style={{ color: 'var(--textMuted)' }}>wpm</span>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{stats.wpm}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span style={{ color: 'var(--textMuted)' }}>acc</span>
        <span style={{ color: 'var(--textPrimary)', fontWeight: 600 }}>{stats.accuracy}%</span>
      </div>
    </div>
  );
};

export default StatsDisplay;
