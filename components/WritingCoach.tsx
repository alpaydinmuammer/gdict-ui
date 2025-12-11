import React, { useState } from 'react';
import { checkGrammar } from '../services/geminiService';
import { GrammarAnalysis } from '../types';

export const WritingCoach: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setAnalysis(null);
    setError(null);
    
    try {
      const result = await checkGrammar(inputText);
      setAnalysis(result);
    } catch (err: any) {
      setError("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('mükemmel') || s.includes('perfect')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (s.includes('kritik') || s.includes('critical')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in-up">
        {/* Input Area Card */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-white/20 dark:border-white/5 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-[rgba(var(--p-accent-rgb),0.1)] to-white/0 dark:to-slate-900/0">
                 <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Writing Coach</h2>
                 <p className="text-slate-500 dark:text-slate-400">
                     Paste your text below. Our AI Professor will analyze grammar, tone, and provide corrections.
                 </p>
             </div>
             
             <div className="p-6">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or paste your English text here..."
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-[var(--p-accent)]/20 focus:border-[var(--p-accent)] outline-none transition-all resize-y min-h-[150px] text-slate-700 dark:text-slate-200 font-sans text-lg"
                />
                
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleCheck}
                        disabled={loading || !inputText.trim()}
                        className={`px-8 py-3 rounded-xl font-bold text-base transition-all flex items-center gap-2 ${
                            loading || !inputText.trim()
                            ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600 cursor-not-allowed'
                            : 'bg-[var(--p-accent)] text-white hover:opacity-90 shadow-lg shadow-[var(--p-accent)]/30 hover:scale-105'
                        }`}
                    >
                        {loading ? (
                             <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                             </>
                        ) : (
                             <>
                                Analyze Text
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                             </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}
             </div>
        </div>

        {/* Results Card */}
        {analysis && (
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-white/20 dark:border-white/5 p-8 animate-fade-in-up">
                
                {/* Status Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ${getStatusColor(analysis.analysis_status)}`}>
                        {analysis.analysis_status}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-white/10">
                        Tone: {analysis.tone}
                    </span>
                </div>

                {/* Professor's Feedback */}
                <div className="mb-8 p-6 bg-[rgba(var(--p-accent-rgb),0.1)] rounded-2xl border border-[var(--p-accent)]/20">
                    <div className="flex gap-4">
                         <div className="mt-1 flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-[rgba(var(--p-accent-rgb),0.2)] flex items-center justify-center text-[var(--p-accent)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M11.25 4.533A9.707 9.707 0 006 3.75c-6.612 0-8.437 5.762-7.588 9.132a18.991 18.991 0 01-1.352 2.651 2.443 2.443 0 003.553 2.825 8.959 8.959 0 00.32-1.391c.214-.15.426-.307.636-.469a8.956 8.956 0 001.998-2.607 16.035 16.035 0 01-.194-4.358zM19.197 12.016A16.046 16.046 0 0118 16.898c1.396.96 2.923 1.836 4.544 2.602.264.124.567.05.76-.173a2.443 2.443 0 00-.733-3.666c-.156-.098-.31-.197-.463-.298a8.95 8.95 0 00.413-1.638 8.966 8.966 0 00-1.615-3.088c-.287.112-.58.214-.878.307zM16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                </svg>
                            </div>
                         </div>
                         <div className="space-y-2">
                             <h4 className="text-sm font-bold text-[var(--p-accent)] uppercase tracking-wide">Professor's Summary</h4>
                             <p className="text-base text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">"{analysis.overall_summary}"</p>
                         </div>
                    </div>
                </div>

                {/* Errors List */}
                {analysis.errors.length > 0 ? (
                    <div className="space-y-4 mb-8">
                        {analysis.errors.map((err, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800/50 border border-red-100 dark:border-red-500/20 rounded-2xl p-5 flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0 flex items-center gap-3 md:w-1/4">
                                     <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400">
                                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                     </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">{err.type}</span>
                                        <span className="text-sm font-mono text-slate-500 dark:text-slate-400 line-through decoration-red-400/50 decoration-2">{err.error_text}</span>
                                    </div>
                                </div>
                                <div className="flex-grow pl-0 md:pl-4 md:border-l border-slate-100 dark:border-white/5 space-y-2">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{err.explanation}</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-lg inline-flex">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                        </svg>
                                        Correction: <span className="underline decoration-2 decoration-emerald-300 dark:decoration-emerald-700">{err.suggestion}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mb-8 p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                         <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm4.45 10.335a1 1 0 00-1.786 0l-1.25 2.165a1 1 0 001.786 1.03l1.25-2.165a1 1 0 000-1.03zM13.25 9a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                         </div>
                         <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-100">Flawless!</h3>
                         <p className="text-emerald-700 dark:text-emerald-300">No grammatical errors found. Your text is clean and professional.</p>
                    </div>
                )}

                {/* Suggested Revision */}
                <div className="bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-inner">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M2.879 7.121A3 3 0 007.5 6.66a2.997 2.997 0 012.5-1.34c1.655 0 3 1.345 3 3 0 1.655-1.345 3-3 3-1.655 0-3-1.345-3-3a1 1 0 10-2 0c0 2.761 2.239 5 5 5s5-2.239 5-5-2.239-5-5-5a5 5 0 00-4.621 2.879z" />
                        </svg>
                        Improved Version
                    </h4>
                    <p className="text-xl font-medium text-slate-900 dark:text-white font-display leading-relaxed">
                        {analysis.suggested_revision}
                    </p>
                    <div className="mt-4 flex justify-end">
                         <button 
                             onClick={() => navigator.clipboard.writeText(analysis.suggested_revision)}
                             className="text-xs font-bold text-[var(--p-accent)] hover:underline flex items-center gap-1"
                         >
                             Copy to Clipboard
                         </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};