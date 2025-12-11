import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8 text-lg" }) => {
  return (
    <div className={`bg-gradient-to-br from-[var(--p-accent)] to-slate-900 dark:to-slate-800 rounded-lg flex items-center justify-center text-white font-display font-bold shadow-lg shadow-[var(--p-accent)]/30 ${className}`}>
      G
    </div>
  );
};