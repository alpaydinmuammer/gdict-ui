import React from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  onExportFavorites: () => void;
}

const ACCENT_COLORS = [
    { name: 'Indigo', hex: '#6366F1' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Rose', hex: '#F43F5E' },
    { name: 'Amber', hex: '#F59E0B' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
  onClearHistory,
  onExportFavorites
}) => {
  if (!isOpen) return null;

  // Reusable Switch Component for Data Visibility
  const ToggleSwitch = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!checked)}>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {label}
        </span>
        <div className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-[var(--p-accent)]' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 pb-8 space-y-6 custom-scrollbar">
          
          {/* Section: Appearance */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-5 space-y-6 border border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.184a1 1 0 011.896 0L17.472 6l-1.698 3.184A1 1 0 0115 10h-4a1 1 0 01-1-1V2zM4 10a6 6 0 1012 0 6 6 0 00-12 0zm8-4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
              </svg>
              Appearance
            </h3>
            
            {/* Theme Pill Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Interface Theme</span>
              <div className="relative flex items-center bg-slate-200 dark:bg-slate-700/50 rounded-full p-1 w-32 h-9 cursor-pointer" onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}>
                 {/* Sliding Background */}
                 <div className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-600 rounded-full shadow-sm transition-all duration-300 ${settings.theme === 'dark' ? 'translate-x-[100%] translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
                 
                 {/* Icons */}
                 <div className="w-1/2 flex justify-center items-center z-10 text-xs font-bold text-slate-600 dark:text-slate-400 gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                    Light
                 </div>
                 <div className="w-1/2 flex justify-center items-center z-10 text-xs font-bold text-slate-600 dark:text-slate-400 gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    Dark
                 </div>
              </div>
            </div>

            {/* UI Density Selector */}
            <div className="flex flex-col gap-2">
               <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Interface Density</span>
               <div className="flex bg-slate-200 dark:bg-slate-700/50 p-1 rounded-xl">
                   {['14px', '15px', '16px'].map((density) => {
                       const isSelected = settings.uiDensity === density;
                       let label = 'Default';
                       if(density === '14px') label = 'Ultra';
                       if(density === '15px') label = 'Compact';
                       
                       return (
                           <button
                             key={density}
                             onClick={() => updateSettings({ uiDensity: density as '14px' | '15px' | '16px' })}
                             className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                 isSelected 
                                 ? 'bg-white dark:bg-slate-600 text-[var(--p-accent)] shadow-sm' 
                                 : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                             }`}
                           >
                               {label}
                           </button>
                       );
                   })}
               </div>
            </div>

             {/* Accent Color Selector */}
             <div className="flex flex-col gap-3">
               <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Accent Color</span>
               <div className="flex items-center gap-4">
                  {ACCENT_COLORS.map((color) => {
                      const isSelected = settings.accentColor === color.hex;
                      return (
                      <button
                        key={color.name}
                        onClick={() => updateSettings({ accentColor: color.hex })}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                        style={{ 
                            backgroundColor: color.hex,
                            boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${color.hex}, 0 0 12px ${color.hex}` : 'none'
                        }}
                        title={color.name}
                      >
                         {isSelected && (
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                         )}
                      </button>
                  )})}
               </div>
            </div>

            {/* TTS Accent Selector */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice Accent</span>
                <span className="text-[10px] text-slate-400">Speech synthesis region</span>
              </div>
              <div className="relative">
                  <select
                    value={settings.tts_accent}
                    onChange={(e) => updateSettings({ tts_accent: e.target.value as 'en-US' | 'en-GB' })}
                    className="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:ring-[var(--p-accent)] outline-none shadow-sm cursor-pointer"
                  >
                    <option value="en-US">US English</option>
                    <option value="en-GB">UK English</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
              </div>
            </div>
          </div>

          {/* Section: Data Management */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-5 space-y-4 border border-slate-100 dark:border-white/5">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                 <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                 <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
               </svg>
               Data Visibility
             </h3>
             
             <div className="space-y-4">
                <ToggleSwitch 
                    label="Morphology (Word Family)" 
                    checked={settings.showMorphology} 
                    onChange={(v) => updateSettings({ showMorphology: v })} 
                />
                <div className="h-px bg-slate-200 dark:bg-slate-700/50"></div>
                <ToggleSwitch 
                    label="Frequency Analysis" 
                    checked={settings.showFrequency} 
                    onChange={(v) => updateSettings({ showFrequency: v })} 
                />
                <div className="h-px bg-slate-200 dark:bg-slate-700/50"></div>
                <ToggleSwitch 
                    label="Idioms, Slang & Culture" 
                    checked={settings.showIdioms} 
                    onChange={(v) => updateSettings({ showIdioms: v })} 
                />
             </div>
          </div>

          {/* Section: Actions */}
          <div className="flex flex-col gap-3">
                <button 
                  onClick={onExportFavorites}
                  className="w-full py-4 px-4 rounded-2xl bg-[var(--p-accent)] text-white text-sm font-bold shadow-lg shadow-[var(--p-accent)]/20 hover:shadow-[var(--p-accent)]/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                     <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                   </svg>
                   Export Favorites (TXT)
                </button>
                <button 
                  onClick={() => {
                      if(window.confirm('Are you sure you want to clear your entire search history? This cannot be undone.')) {
                          onClearHistory();
                      }
                  }}
                  className="w-full py-4 px-4 rounded-2xl bg-white dark:bg-slate-800 text-red-500 dark:text-red-400 text-sm font-bold border-2 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                     <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                   </svg>
                   Clear History
                </button>
             </div>

          {/* Section: Credits */}
          <div className="pt-6 mt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                </svg>
                Credits
              </h3>
              <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-5 border border-slate-100 dark:border-white/5">
                  <div className="space-y-4">
                      {/* Row 1 */}
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M10 2a6 6 0 00-6 6c0 1.887.454 3.665 1.257 5.234a.75.75 0 01.515.586c.04.5.463 1.18 1.035 1.18h6.386c.572 0 .996-.68 1.035-1.18a.75.75 0 01.515-.586A11.944 11.944 0 0016 8a6 6 0 00-6-6zM8.75 17.5a.75.75 0 00-1.5 0v.5c0 .414.336.75.75.75h4a.75.75 0 00.75-.75v-.5a.75.75 0 00-1.5 0H8.75z" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Konsept ve Vizyon</span>
                         </div>
                         <span className="text-sm font-bold text-[var(--p-accent)] text-right">Muammer Alpaydın</span>
                      </div>
                      
                      <div className="h-px bg-slate-200 dark:bg-white/5 w-full"></div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                         <div className="flex items-center gap-2">
                             <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd" />
                                </svg>
                             </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Geliştirme ve Kod</span>
                         </div>
                         <span className="text-sm font-bold text-[var(--p-accent)] text-right">Muammer Alpaydın</span>
                      </div>

                       <div className="h-px bg-slate-200 dark:bg-white/5 w-full"></div>

                       {/* Row 3 */}
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                         <div className="flex items-center gap-2">
                             <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3.502 3.502 0 005.25 3.03 2.22 2.22 0 01.602-.228c.844-.22 1.446-.96 1.619-1.815a4.495 4.495 0 004.927-4.721 3.5 3.5 0 001.602-2.766V5a2 2 0 00-2-2H4zm2 7a1 1 0 100-2 1 1 0 000 2zm3-1a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                             </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tasarım (UI/UX)</span>
                         </div>
                         <span className="text-sm font-bold text-[var(--p-accent)] text-right">Muammer Alpaydın</span>
                      </div>

                       <div className="h-px bg-slate-200 dark:bg-white/5 w-full"></div>

                      {/* Row 4 */}
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                         <div className="flex items-center gap-2">
                             <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M12.914 6.074a3 3 0 00-2.315-1.683L10.373 1l-1.057.001 1.74 3.48a3 3 0 00-1.396.901l-5.65 5.652c.813.565 1.71 1.134 2.604 1.705l3.86-3.86a1.5 1.5 0 012.122 0l1.414 1.414a1.5 1.5 0 010 2.122l-1.684 1.684 3.027 1.954 1.956-6.347a1.5 1.5 0 00-.406-1.638l-4.99-4.99z" />
                                    <path d="M7.447 16.297l-3.375 2.179a.75.75 0 01-.816-1.263l2.25-1.453 1.94 1.939zM12.553 16.297l3.375 2.179a.75.75 0 00.816-1.263l-2.25-1.453-1.94 1.939z" />
                                </svg>
                             </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Yapay Zeka Mimarisi</span>
                         </div>
                         <span className="text-sm font-bold text-[var(--p-accent)] text-right">Muammer Alpaydın</span>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Section: Feedback & Contact */}
          <div className="pt-6 mt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                </svg>
                Feedback & Contact
              </h3>
              <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-5 border border-slate-100 dark:border-white/5">
                 <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                     <div className="flex items-center gap-2">
                         <div className="p-1.5 rounded-lg bg-[var(--p-accent)]/10 text-[var(--p-accent)]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                            </svg>
                         </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">E-posta / İş Teklifleri</span>
                     </div>
                     <a href="mailto:alpaydinmuammer@gmail.com" className="text-sm font-bold text-[var(--p-accent)] text-right hover:underline break-all sm:break-normal">
                        alpaydinmuammer@gmail.com
                     </a>
                  </div>
              </div>
          </div>
          
          <div className="mt-6 mb-2 text-center">
              <p className="text-[10px] text-slate-400">© 2024 GDict AI Dictionary. All rights reserved.</p>
          </div>

        </div>
      </div>
    </div>
  );
};