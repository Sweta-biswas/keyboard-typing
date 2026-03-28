import React from 'react';
import { Mode } from '../data/snippets';

interface ModeSelectorProps {
  current: Mode;
  onChange: (m: Mode) => void;
}

const MODES = [
  { id: 'normal' as Mode, label: 'normal' },
  { id: 'coding' as Mode, label: 'coding' },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ current, onChange }) => (
  <div className="flex flex-row lg:flex-col gap-3">
    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--caretColor)] mb-0 lg:mb-1 self-center lg:self-start hidden lg:inline-block">
      Mode
    </span>
    <div className="flex flex-row lg:flex-col gap-2 lg:gap-3">
       {MODES.map(m => {
         const active = current === m.id;
         return (
           <button
             key={m.id}
             onClick={() => onChange(m.id)}
             className={`text-center lg:text-left text-xs lg:text-sm font-medium tracking-wide transition-all duration-200 ${active ? 'px-3 lg:px-0 lg:pl-2 border-b-2 lg:border-b-0 lg:border-l-2' : 'px-3 lg:px-0 lg:pl-2 border-b-2 lg:border-b-0 lg:border-l-2 border-transparent'}`}
             style={{
               color: active ? 'var(--textPrimary)' : 'var(--textMuted)',
               borderColor: active ? 'var(--caretColor)' : 'transparent',
               opacity: active ? 1 : 0.6
             }}
           >
             {m.label}
           </button>
         );
       })}
    </div>
  </div>
);

export default ModeSelector;
