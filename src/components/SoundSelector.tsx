import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { SoundStyle } from '../hooks/useSound';

interface SoundSelectorProps {
  current: SoundStyle;
  onChange: (s: SoundStyle) => void;
}

const OPTIONS: { id: SoundStyle; label: string; icon: React.ElementType }[] = [
  { id: 'click', label: 'Click', icon: Volume2 },
  { id: 'soft',  label: 'Soft',  icon: Volume1 },
  { id: 'none',  label: 'Off',   icon: VolumeX },
];

const SoundSelector: React.FC<SoundSelectorProps> = ({ current, onChange }) => (
  <div className="flex flex-row lg:flex-col gap-3 items-center lg:items-start">
    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--caretColor)] mb-0 lg:mb-1 hidden lg:inline-block">
      Sound
    </span>
    <div className="flex flex-row lg:flex-col gap-2 lg:gap-3">
       {OPTIONS.map(opt => {
         const active = current === opt.id;
         const Icon = opt.icon;
         return (
           <button
             key={opt.id}
             onClick={() => onChange(opt.id)}
             title={opt.label}
             className={`flex items-center justify-center lg:justify-start gap-1 lg:gap-2 text-center lg:text-left text-xs lg:text-sm font-medium tracking-wide transition-all duration-200 ${active ? 'px-3 lg:px-0 lg:pl-2 border-b-2 lg:border-b-0 lg:border-l-2' : 'px-3 lg:px-0 lg:pl-2 border-b-2 lg:border-b-0 lg:border-l-2 border-transparent'}`}
             style={{
               color: active ? 'var(--textPrimary)' : 'var(--textMuted)',
               borderColor: active ? 'var(--caretColor)' : 'transparent',
               opacity: active ? 1 : 0.6
             }}
           >
             <Icon size={14} className="lg:w-[16px] lg:h-[16px]" />
             <span>{opt.label.toLowerCase()}</span>
           </button>
         );
       })}
    </div>
  </div>
);

export default SoundSelector;
