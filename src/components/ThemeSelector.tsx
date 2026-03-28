import React from 'react';
import { Theme } from '../data/themes';

interface ThemeSelectorProps {
  themes: Theme[];
  current: Theme;
  onChange: (t: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, current, onChange }) => (
  <div className="flex flex-row flex-wrap justify-center lg:flex-col gap-4 lg:gap-6 w-full lg:w-auto overflow-hidden px-4 py-2 lg:px-0 lg:py-0 rounded-xl" style={{ backgroundColor: 'var(--cardBg)' }}>
    {themes.map(t => {
      const active = current.id === t.id;
      return (
         <button
            key={t.id}
            onClick={() => onChange(t)}
            className="group flex flex-col items-center gap-1 sm:gap-2 transition-transform duration-300 hover:scale-110"
         >
           {/* Color Circle */}
           <div 
             className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full transition-all duration-300 ${active ? 'scale-110' : 'scale-100 opacity-80 group-hover:opacity-100'}`}
             style={{ 
                backgroundColor: t.accentBg || t.pageBg,
                // Inner rim matching page background
                border: active ? '3px solid var(--pageBg)' : '2px solid transparent',
                // Outer ring matching text color
                outline: active ? '2px solid var(--textPrimary)' : 'none',
                boxShadow: active ? `0 0 0 2px var(--textPrimary)` : '0 2px 4px rgba(0,0,0,0.5)'
              }} 
           />
           {/* Theme Name */}
           <span 
              className={`text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.2em] transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-60 hidden lg:block'}`}
              style={{ color: 'var(--textMuted)' }}
           >
              {t.name}
           </span>
         </button>
      );
    })}
  </div>
);

export default ThemeSelector;
