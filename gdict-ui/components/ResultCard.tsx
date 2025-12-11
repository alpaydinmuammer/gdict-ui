import React, { useState } from 'react';
import { DictionaryEntry, AppSettings } from '../types';

interface ResultCardProps {
  data: DictionaryEntry;
  onSearch: (word: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  settings: AppSettings;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, onSearch, isFavorite, onToggleFavorite, settings }) => {
  const [activeExampleIndex, setActiveExampleIndex] = useState<number | null>(null);
  
  const getFrequencyColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'; 
    if (score >= 40) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';   
    return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]';                      
  };

  const frequencyColorClass = getFrequencyColor(data.frequency_score);

  // Main word speaker handler
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel current speech
      const utterance = new SpeechSynthesisUtterance(data.word);
      utterance.lang = settings.tts_accent; 
      utterance.rate = 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang === settings.tts_accent);
      if (matchingVoice) {
          utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Example sentence speaker handler
  const handleExampleSpeak = (text: string, index: number) => {
    if ('speechSynthesis' in window) {
        // If clicking the same button that is playing, stop it.
        if (activeExampleIndex === index) {
            window.speechSynthesis.cancel();
            setActiveExampleIndex(null);
            return;
        }

        window.speechSynthesis.cancel();
        setActiveExampleIndex(index);

        // Remove quotes for cleaner speech if present
        const cleanText = text.replace(/^"|"$/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = settings.tts_accent;
        utterance.rate = 0.9; // Slightly slower for examples

        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang === settings.tts_accent);
        if (matchingVoice) {
            utterance.voice = matchingVoice;
        }

        utterance.onend = () => {
            setActiveExampleIndex(null);
        };

        utterance.onerror = () => {
            setActiveExampleIndex(null);
        };

        window.speechSynthesis.speak(utterance);
    }
  };

  const hasWordFamily = data.word_family && Object.values(data.word_family).some(val => val !== null && val !== undefined && val !== '');

  return (
    <div className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-white/20 dark:border-white/5 overflow-hidden animate-fade-in-up">
      {/* Header - Compact */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5 relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--p-accent)] rounded-full blur-2xl pointer-events-none opacity-10"></div>

        <div className="flex flex-col gap-3 relative z-10">
            <div className="flex justify-between items-start">
                 <div className="flex flex-col">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight capitalize bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                        {data.word}
                    </h2>
                    <div className="flex items-center gap-2 text-base text-slate-500 dark:text-slate-400 font-mono tracking-wide mt-1">
                        <span>/{data.pronunciation}/</span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSpeak}
                        className="p-2.5 rounded-full bg-white dark:bg-slate-800 text-[var(--p-accent)] shadow-md shadow-[var(--p-accent)]/10 hover:shadow-[var(--p-accent)]/20 hover:scale-105 transition-all duration-300 border border-slate-100 dark:border-slate-700"
                        title={`Listen in ${settings.tts_accent === 'en-US' ? 'US' : 'UK'} English`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                            <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                        </svg>
                    </button>

                    <button 
                        onClick={onToggleFavorite}
                        className={`p-2.5 rounded-full transition-all duration-300 shadow-md hover:scale-105 border ${
                            isFavorite 
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-100 dark:border-red-900/30 shadow-red-500/20' 
                            : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-red-400 border-slate-100 dark:border-slate-700 shadow-slate-500/10'
                        }`}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isFavorite ? 0 : 2} className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                    </button>
                 </div>
            </div>
          
          <div className="flex items-center gap-3 mt-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase border border-slate-200 dark:border-white/5">
                {data.level}
            </span>
            {settings.showFrequency && (
                <div className="flex-grow max-w-[120px] flex items-center h-full">
                <div className="flex-grow h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${frequencyColorClass}`}
                        style={{ width: `${data.frequency_score}%` }}
                    ></div>
                </div>
                </div>
            )}
          </div>

        </div>
      </div>

      {/* Meanings - Compact */}
      <div className="p-6 space-y-6">
        {data.meanings.map((meaning, index) => (
          <div key={index} className="flex gap-4 group">
            <div className="flex-shrink-0 mt-0.5">
                 <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(var(--p-accent-rgb),0.1)] text-[var(--p-accent)] text-base font-display font-bold italic shadow-sm border border-slate-100 dark:border-white/5">
                    {meaning.type.substring(0, 1)}
                 </span>
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-bold text-[var(--p-accent)] uppercase tracking-widest opacity-80">
                    {meaning.type}
                </span>
              </div>
              
              <p className="text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {meaning.definition_tr}
              </p>

              <div className="mt-2 pl-3 border-l-2 border-[var(--p-accent)]/30">
                <div className="flex items-start gap-2.5">
                    {/* Play Button for Example */}
                    <button 
                        onClick={() => handleExampleSpeak(meaning.example_en, index)}
                        className={`mt-0.5 p-1 rounded-full hover:bg-[rgba(var(--p-accent-rgb),0.1)] transition-colors flex-shrink-0 ${
                            activeExampleIndex === index ? 'text-[var(--p-accent)]' : 'text-slate-400 dark:text-slate-500'
                        }`}
                        title="Listen to example"
                    >
                         {activeExampleIndex === index ? (
                             // Pause/Stop Icon
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                             </svg>
                         ) : (
                             // Play Icon
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                             </svg>
                         )}
                    </button>
                    
                    <div>
                        <p className={`text-sm italic transition-colors ${activeExampleIndex === index ? 'text-[var(--p-accent)] font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        "{meaning.example_en}"
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {meaning.example_tr}
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Idioms & Slang Radar - Conditional Visibility */}
        {settings.showIdioms && data.idioms_slang && data.idioms_slang.length > 0 && (
          <div className="p-4 mt-6 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-500/20 relative overflow-hidden shadow-sm">
             <div className="absolute top-0 right-0 p-20 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-3 text-orange-600 dark:text-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.591a.75.75 0 101.06 1.06l1.591-1.591zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.591-1.591a.75.75 0 10-1.06 1.06l1.591 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.591a.75.75 0 001.06 1.061l1.591-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                    <h3 className="text-xs font-bold uppercase tracking-widest">Street Smart</h3>
                </div>
                
                <div className="grid gap-2">
                    {data.idioms_slang.map((item, idx) => (
                        <div key={idx} className="bg-white/80 dark:bg-slate-900/60 border border-orange-100 dark:border-orange-500/20 rounded-lg p-3 backdrop-blur-sm transition-colors">
                            <p className="text-base font-display font-bold text-slate-800 dark:text-orange-100">"{item.phrase}"</p>
                            <p className="text-xs text-slate-600 dark:text-orange-200/70 mt-0.5">{item.meaning_tr}</p>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        )}

        {/* Word Family / Morphology - Conditional Visibility */}
        {settings.showMorphology && hasWordFamily && (
          <div className="pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Morphology
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['noun', 'verb', 'adjective', 'adverb'].map((type) => {
                 const word = data.word_family?.[type as keyof typeof data.word_family];
                 if (!word) return null;
                 return (
                    <div key={type} className="p-3 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:border-[var(--p-accent)]/30 transition-all group cursor-pointer" onClick={() => onSearch(word)}>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">{type}</span>
                        <span className="text-sm text-[var(--p-accent)] font-medium group-hover:underline">
                            {word}
                        </span>
                    </div>
                 );
              })}
            </div>
          </div>
        )}

        {/* Collocations Section - Compact */}
        {data.collocations && data.collocations.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-white/5">
             <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Collocations
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.collocations.map((col, i) => (
                <button 
                    key={i} 
                    onClick={() => onSearch(col)}
                    className="px-3 py-1.5 rounded-lg bg-[rgba(var(--p-accent-rgb),0.1)] text-[var(--p-accent)] border border-transparent hover:border-[var(--p-accent)]/30 text-xs font-medium transition-all hover:bg-[rgba(var(--p-accent-rgb),0.2)] hover:scale-105"
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Synonyms - Compact */}
        {data.synonyms && data.synonyms.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-white/5">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Synonyms
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.synonyms.map((syn, i) => (
                <button 
                    key={i}
                    onClick={() => onSearch(syn)} 
                    className="px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400 text-xs hover:text-[var(--p-accent)] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {syn}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};