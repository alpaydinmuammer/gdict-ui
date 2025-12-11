import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (word: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative group">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-400 group-focus-within:text-[var(--p-accent)] transition-colors duration-300">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      <input
        type="text"
        className="w-full pl-14 pr-24 py-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 focus:border-[var(--p-accent)] focus:ring-4 focus:ring-[var(--p-accent)]/10 shadow-lg shadow-[var(--p-accent)]/5 focus:shadow-[var(--p-accent)]/20 transition-all duration-300 outline-none text-xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white font-medium"
        placeholder="Type a word..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
      />

      {/* Right Side Actions */}
      <div className="absolute inset-y-0 right-2 flex items-center gap-1">
         {/* Clear Button */}
         {inputValue && !isLoading && (
             <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Clear"
             >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
             </button>
         )}

         {/* Submit Button */}
         <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-xl transition-all duration-300 ${
                inputValue.trim() && !isLoading
                ? 'bg-[var(--p-accent)] text-white hover:opacity-90 shadow-md shadow-[var(--p-accent)]/30 transform hover:scale-105' 
                : 'bg-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
         >
           {isLoading ? (
             <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
           ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
           )}
         </button>
      </div>
    </form>
  );
};