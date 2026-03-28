import React from 'react';
import { Difficulty } from '../data/snippets';

interface DifficultySelectorProps {
  current: Difficulty;
  onChange: (d: Difficulty) => void;
}

const LEVELS: { id: Difficulty; label: string }[] = [
  { id: 'easy',   label: 'easy' },
  { id: 'medium', label: 'medium' },
  { id: 'hard',   label: 'hard' },
];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ current, onChange }) => (
  <div className="flex flex-row lg:flex-col gap-3 items-center lg:items-start">
    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--caretColor)] mb-0 lg:mb-1 hidden lg:inline-block">
      Difficulty
    </span>
    <div className="flex flex-row lg:flex-col gap-2 lg:gap-3">
       {LEVELS.map(lv => {
         const active = current === lv.id;
         return (
           <button
             key={lv.id}
             onClick={() => onChange(lv.id)}
             className={`text-center lg:text-left text-xs lg:text-sm font-medium tracking-wide transition-all duration-200 ${active ? 'px-3 lg:px-0 lg:pl-2 border-b-2 lg:border-b-0 lg:border-l-2' : 'px-3 lg:px-0 lg:pl-2 border-b-2 lg:border-b-0 lg:border-l-2 border-transparent'}`}
             style={{
               color: active ? 'var(--textPrimary)' : 'var(--textMuted)',
               borderColor: active ? 'var(--caretColor)' : 'transparent',
               opacity: active ? 1 : 0.6
             }}
           >
             {lv.label}
           </button>
         );
       })}
    </div>
  </div>
);

export default DifficultySelector;
