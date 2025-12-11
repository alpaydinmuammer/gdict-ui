import React, { useState } from 'react';
import { HistoryItem, FavoriteItem } from '../types';

interface SidebarProps {
  isOpen: boolean;
  isDesktop?: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  history: HistoryItem[];
  onSelectWord: (word: string) => void;
  onDeleteFavorite: (word: string) => void;
  onDeleteHistory: (word: string) => void;
}

const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
  
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
};

const getBadgeInfo = (pos: string) => {
    const lowerPos = pos ? pos.toLowerCase() : '';
    if (lowerPos.includes('noun')) return { label: 'N', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' };
    if (lowerPos.includes('verb')) return { label: 'V', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' };
    if (lowerPos.includes('adjective') || lowerPos.includes('adj')) return { label: 'Adj', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' };
    if (lowerPos.includes('adverb')) return { label: 'Adv', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' };
    return { label: '?', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' };
};

const getFrequencyColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-400';
    return 'bg-red-400';
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isDesktop = false,
  onClose,
  favorites,
  history,
  onSelectWord,
  onDeleteFavorite,
  onDeleteHistory
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  const Content = (
    <div className={`flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-white/20 dark:border-white/10 shadow-2xl ${isDesktop ? 'rounded-2xl border bg-white/50 dark:bg-slate-900/50 shadow-none' : ''}`}>
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-slate-200/50 dark:border-white/5">
           <h2 className="text-lg font-display font-bold text-slate-800 dark:text-white">My Library</h2>
           {!isDesktop && (
               <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
           )}
        </div>

        {/* Tabs */}
        <div className="flex p-3 gap-2">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              activeTab === 'favorites' 
                ? 'bg-[var(--p-accent)]/10 text-[var(--p-accent)] shadow-sm ring-1 ring-[var(--p-accent)]/20' 
                : 'text-slate-500 hover:bg-slate-100/50 dark:hover:bg-white/5'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              activeTab === 'history' 
                ? 'bg-[var(--p-accent)]/10 text-[var(--p-accent)] shadow-sm ring-1 ring-[var(--p-accent)]/20' 
                : 'text-slate-500 hover:bg-slate-100/50 dark:hover:bg-white/5'
            }`}
          >
            History
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
          {activeTab === 'favorites' ? (
            favorites.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                    <p className="text-xs">No favorites yet.</p>
                </div>
            ) : (
                favorites.map(item => {
                    const badge = getBadgeInfo(item.part_of_speech);
                    return (
                        <div key={item.word} className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200/50 dark:hover:border-white/5">
                            <div className="flex-grow flex flex-col cursor-pointer" onClick={() => { onSelectWord(item.word); if(!isDesktop) onClose(); }}>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize font-display text-sm">{item.word}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}>
                                        {badge.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    {/* Frequency Micro Bar */}
                                    <div className="w-8 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${getFrequencyColor(item.frequency_score)}`}
                                            style={{ width: `${item.frequency_score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onDeleteFavorite(item.word)}
                                className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all absolute right-2 top-1/2 -translate-y-1/2"
                                title="Remove from favorites"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    );
                })
            )
          ) : (
            history.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                    <p className="text-xs">No recent history.</p>
                </div>
            ) : (
                history.map((item) => {
                     const badge = getBadgeInfo(item.part_of_speech);
                     return (
                        <div key={item.word} className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200/50 dark:hover:border-white/5">
                            <div className="flex-grow flex flex-col cursor-pointer" onClick={() => { onSelectWord(item.word); if(!isDesktop) onClose(); }}>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize font-display text-sm">{item.word}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}>
                                        {badge.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {getTimeAgo(item.timestamp)}
                                    </span>
                                    {/* Frequency Micro Bar */}
                                    <div className="w-6 h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${getFrequencyColor(item.frequency_score)}`}
                                            style={{ width: `${item.frequency_score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => onDeleteHistory(item.word)}
                                className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all absolute right-2 top-1/2 -translate-y-1/2"
                                title="Remove from history"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                     );
                })
            )
          )}
        </div>
      </div>
  );

  if (isDesktop) {
      return Content;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 transform transition-transform duration-300 ease-in-out z-50 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {Content}
      </div>
    </>
  );
};