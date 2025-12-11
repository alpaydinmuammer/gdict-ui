import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultCard } from './components/ResultCard';
import { Sidebar } from './components/Sidebar';
import { WritingCoach } from './components/WritingCoach';
import { SettingsModal } from './components/SettingsModal';
import { Logo } from './components/Logo';
import { lookupWord, getDailyWord } from './services/geminiService';
import { DictionaryEntry, SearchState, WordOfTheDay, HistoryItem, AppSettings, FavoriteItem } from './types';

// Default Settings
const DEFAULT_SETTINGS: AppSettings = {
    theme: 'light',
    accentColor: '#6366F1', // Indigo
    tts_accent: 'en-US',
    uiDensity: '14px', // New Default: Ultra Compact
    showMorphology: true,
    showFrequency: true,
    showIdioms: true
};

// Helper to convert Hex to RGB for Tailwind opacity support
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '99, 102, 241';
};

function App() {
    const [activeTab, setActiveTab] = useState<'dictionary' | 'coach'>('dictionary');
    const [searchState, setSearchState] = useState<SearchState>({
        status: 'idle',
        data: null,
        error: null,
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [wordOfTheDay, setWordOfTheDay] = useState<WordOfTheDay | null>(null);

    // Settings State
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            if (typeof window !== 'undefined') {
                // 1. Check for standalone ui_density key first (per requirement)
                const storedDensity = localStorage.getItem('ui_density');

                // 2. Load general settings object
                const storedSettings = localStorage.getItem('gemini_dict_settings');
                let parsedSettings = {};
                if (storedSettings) {
                    parsedSettings = JSON.parse(storedSettings);
                }

                // 3. Merge defaults with stored settings
                const merged = { ...DEFAULT_SETTINGS, ...parsedSettings };

                // 4. Override uiDensity if standalone key exists and is valid
                if (storedDensity && ['14px', '15px', '16px'].includes(storedDensity)) {
                    merged.uiDensity = storedDensity as '14px' | '15px' | '16px';
                }

                // Check system preference for initial theme if not set
                if (window.matchMedia('(prefers-color-scheme: dark)').matches && !storedSettings) {
                    merged.theme = 'dark';
                }

                return merged;
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
        return DEFAULT_SETTINGS;
    });

    // Check for Welcome Banner
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('has_seen_welcome_banner');
        if (!hasSeenWelcome) {
            setShowWelcomeBanner(true);
        }
    }, []);

    // Apply Theme Effect
    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings.theme]);

    // Apply UI Density Effect & Persistence
    useEffect(() => {
        const root = document.documentElement;
        const density = settings.uiDensity || DEFAULT_SETTINGS.uiDensity;

        // Apply to root font-size (scales 1rem)
        root.style.fontSize = density;

        // Persist to standalone key as requested
        localStorage.setItem('ui_density', density);
    }, [settings.uiDensity]);

    // Apply Accent Color Effect
    useEffect(() => {
        const root = document.documentElement;
        const hex = settings.accentColor || DEFAULT_SETTINGS.accentColor;
        root.style.setProperty('--p-accent', hex);
        root.style.setProperty('--p-accent-rgb', hexToRgb(hex));
    }, [settings.accentColor]);

    // Persist Settings (General Object)
    useEffect(() => {
        localStorage.setItem('gemini_dict_settings', JSON.stringify(settings));
    }, [settings]);

    // Load Data from LocalStorage on mount
    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem('gemini_dict_favorites');
            const storedHistory = localStorage.getItem('gemini_dict_history');

            if (storedFavorites) {
                const parsed = JSON.parse(storedFavorites);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    const migrated: FavoriteItem[] = parsed.map((w: string) => ({
                        word: w,
                        part_of_speech: '?',
                        frequency_score: 50
                    }));
                    setFavorites(migrated);
                } else {
                    setFavorites(parsed);
                }
            }

            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory) && parsedHistory.length > 0 && typeof parsedHistory[0] === 'string') {
                    const migratedHistory: HistoryItem[] = parsedHistory.map((word: string) => ({
                        word: word,
                        timestamp: Date.now(),
                        frequency_score: 50,
                        part_of_speech: 'Unknown'
                    }));
                    setHistory(migratedHistory);
                } else {
                    setHistory(parsedHistory);
                }
            }
        } catch (e) {
            console.error("Failed to load local storage data", e);
        }
    }, []);

    // Word of the Day Logic
    useEffect(() => {
        const fetchWOTD = async () => {
            const today = new Date().toISOString().split('T')[0];
            const storedDate = localStorage.getItem('gemini_wotd_date');
            const storedData = localStorage.getItem('gemini_wotd_data');

            if (storedDate === today && storedData) {
                setWordOfTheDay(JSON.parse(storedData));
            } else {
                try {
                    const data = await getDailyWord();
                    localStorage.setItem('gemini_wotd_date', today);
                    localStorage.setItem('gemini_wotd_data', JSON.stringify(data));
                    setWordOfTheDay(data);
                } catch (e) {
                    console.error("Failed to fetch WOTD", e);
                }
            }
        };

        fetchWOTD();
    }, []);

    // Persistence Effects for Data
    useEffect(() => {
        localStorage.setItem('gemini_dict_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('gemini_dict_history', JSON.stringify(history));
    }, [history]);

    // --- Handlers ---

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleClearHistory = () => {
        setHistory([]);
        localStorage.removeItem('gemini_dict_history');
        setIsSettingsOpen(false);
    };

    const handleDismissWelcome = () => {
        setShowWelcomeBanner(false);
        localStorage.setItem('has_seen_welcome_banner', 'true');
    };

    const handleExportFavorites = () => {
        if (favorites.length === 0) {
            alert("No favorites to export.");
            return;
        }
        const textContent = favorites.map(f => f.word).join('\n');
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gdict_favorites_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFavorite = (entry: DictionaryEntry) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.word === entry.word);
            if (exists) {
                return prev.filter(f => f.word !== entry.word);
            } else {
                let pos = 'Unknown';
                if (entry.meanings && entry.meanings.length > 0) {
                    pos = entry.meanings[0].type;
                }
                const newItem: FavoriteItem = {
                    word: entry.word,
                    part_of_speech: pos,
                    frequency_score: entry.frequency_score
                };
                return [newItem, ...prev];
            }
        });
    };

    const removeFromHistory = (word: string) => {
        setHistory(prev => prev.filter(item => item.word !== word));
    };

    const removeFromFavorites = (word: string) => {
        setFavorites(prev => prev.filter(item => item.word !== word));
    };

    const addToHistory = (entry: DictionaryEntry) => {
        setHistory(prev => {
            const filtered = prev.filter(item => item.word.toLowerCase() !== entry.word.toLowerCase());
            let pos = 'Unknown';
            if (entry.meanings && entry.meanings.length > 0) {
                pos = entry.meanings[0].type;
            }
            const newItem: HistoryItem = {
                word: entry.word,
                timestamp: Date.now(),
                frequency_score: entry.frequency_score,
                part_of_speech: pos
            };
            return [newItem, ...filtered].slice(0, 20);
        });
    };

    const handleSearch = async (word: string) => {
        if (activeTab === 'coach') {
            setActiveTab('dictionary');
        }

        setSearchState({ status: 'loading', data: null, error: null });
        setIsSidebarOpen(false);

        try {
            const data = await lookupWord(word);
            setSearchState({ status: 'success', data, error: null });
            if (data.meanings && data.meanings.length > 0) {
                addToHistory(data);
            }
        } catch (err: any) {
            console.error(err);
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (err.message && err.message.includes("API Key")) {
                errorMessage = "API Configuration Error: API Key is missing.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            setSearchState({ status: 'error', data: null, error: errorMessage });
        }
    };

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 relative font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                updateSettings={updateSettings}
                onClearHistory={handleClearHistory}
                onExportFavorites={handleExportFavorites}
            />

            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--p-accent)] rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-10 animate-blob"></div>
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-start">

                {/* Desktop Sidebar Column */}
                <div className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-4 h-[calc(100vh-2rem)] overflow-hidden">
                    <Sidebar
                        isOpen={true} // Always open on desktop
                        isDesktop={true} // New prop to switch mode
                        onClose={() => { }}
                        favorites={favorites}
                        history={history}
                        onSelectWord={handleSearch}
                        onDeleteFavorite={removeFromFavorites}
                        onDeleteHistory={removeFromHistory}
                    />
                </div>

                {/* Mobile Sidebar (Drawer) */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    isDesktop={false}
                    onClose={() => setIsSidebarOpen(false)}
                    favorites={favorites}
                    history={history}
                    onSelectWord={handleSearch}
                    onDeleteFavorite={removeFromFavorites}
                    onDeleteHistory={removeFromHistory}
                />

                {/* Main Content Column */}
                <div className="flex-1 w-full min-w-0">

                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            {/* Hamburger (Mobile Only) */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="md:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-white/5 transition-colors backdrop-blur-sm"
                                aria-label="Open Menu"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-2">
                                <Logo />
                                <h1 className="text-xl font-display font-bold tracking-tight text-slate-800 dark:text-slate-100">
                                    GDict
                                </h1>
                            </div>
                        </div>

                        {/* Settings Button */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200/50 dark:border-white/5 backdrop-blur-sm"
                            aria-label="Settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    {/* Content Area */}
                    <main className="flex flex-col gap-6">

                        {/* 1. Welcome Banner (Dismissible) */}
                        {showWelcomeBanner && (
                            <div className="relative w-full p-4 rounded-xl bg-gradient-to-r from-[var(--p-accent)]/10 to-transparent border border-[var(--p-accent)]/20 flex justify-between items-center gap-4 animate-fade-in-up">
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[var(--p-accent)] mb-1">Hoş Geldiniz!</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        Premium deneyim için hemen <button onClick={() => setIsSettingsOpen(true)} className="font-bold hover:underline">Ayarlar'a gidin</button> ve Vurgu Renginizi seçin.
                                    </p>
                                </div>
                                <button
                                    onClick={handleDismissWelcome}
                                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="flex gap-1 p-1 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 w-fit">
                            <button
                                onClick={() => setActiveTab('dictionary')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'dictionary'
                                        ? 'bg-white dark:bg-slate-800 shadow-md text-[var(--p-accent)]'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                Dictionary
                            </button>
                            <button
                                onClick={() => setActiveTab('coach')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'coach'
                                        ? 'bg-white dark:bg-slate-800 shadow-md text-[var(--p-accent)]'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                Writing Coach
                            </button>
                        </div>

                        {/* Conditional Content Based on Active Tab */}
                        {activeTab === 'dictionary' ? (
                            <>
                                <div className={`transition-all duration-500 ease-out ${searchState.status === 'idle' ? 'md:mt-[10vh]' : ''}`}>

                                    {/* 2. Main Search Box */}
                                    <SearchBar onSearch={handleSearch} isLoading={searchState.status === 'loading'} />

                                    {/* Idle State Content */}
                                    {searchState.status === 'idle' && (
                                        <>
                                            {/* 3. Suggested Query Tags */}
                                            <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                                {["Ubiquitous", "Serendipity", "Collocation", "Phrasal Verb"].map((tag) => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => handleSearch(tag)}
                                                        className="px-3 py-1 text-xs font-medium rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-[var(--p-accent)] hover:text-[var(--p-accent)] hover:bg-[var(--p-accent)]/5 transition-all"
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* 4. WOTD Slimline Banner */}
                                            {wordOfTheDay && (
                                                <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                                    <div className="relative group w-full p-[1px] rounded-2xl bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-shadow duration-500">
                                                        <div className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-slate-950/80 backdrop-blur-xl rounded-[0.9rem] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">

                                                            {/* Shapes - smaller */}
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] transform translate-x-10 -translate-y-10"></div>

                                                            <div className="flex-1 min-w-0 relative z-10 flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-amber-500">
                                                                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                                                                        </svg>
                                                                        Word of the Day
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-wrap items-baseline gap-2">
                                                                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white capitalize tracking-tight">
                                                                        {wordOfTheDay.word}
                                                                    </h3>
                                                                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium opacity-90">
                                                                        {wordOfTheDay.definition_tr}
                                                                    </span>
                                                                </div>

                                                                <p className="text-xs italic text-slate-500 dark:text-slate-400 line-clamp-1 border-l-2 border-amber-300/50 pl-2">
                                                                    "{wordOfTheDay.context}"
                                                                </p>
                                                            </div>

                                                            <button
                                                                onClick={() => handleSearch(wordOfTheDay.word)}
                                                                className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 text-xs font-bold hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 relative z-10"
                                                            >
                                                                Explore
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Results Section */}
                                <div className="w-full pb-10 mt-6">
                                    {/* Structured Pulsing Fade Skeleton */}
                                    {searchState.status === 'loading' && (
                                        <div className="w-full rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-6 space-y-8 shadow-xl relative overflow-hidden animate-fade-in-up">
                                            {/* Header Skeleton */}
                                            <div className="space-y-4">
                                                {/* Word Title */}
                                                <div className="h-10 w-1/3 bg-slate-300 dark:bg-slate-700 rounded-xl animate-soft-pulse"></div>
                                                {/* Pronunciation & Tags */}
                                                <div className="flex gap-3">
                                                    <div className="h-4 w-1/6 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse" style={{ animationDelay: '100ms' }}></div>
                                                    <div className="h-4 w-1/12 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse" style={{ animationDelay: '200ms' }}></div>
                                                </div>
                                            </div>

                                            {/* Meanings Skeleton - Card 1 */}
                                            <div className="space-y-4 pt-2">
                                                <div className="flex gap-4">
                                                    <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded-lg animate-soft-pulse flex-shrink-0"></div>
                                                    <div className="w-full space-y-3">
                                                        <div className="h-4 w-1/4 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse mb-2"></div>
                                                        <div className="h-3 w-full bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse" style={{ animationDelay: '300ms' }}></div>
                                                        <div className="h-3 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse" style={{ animationDelay: '400ms' }}></div>
                                                        <div className="h-3 w-4/6 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse" style={{ animationDelay: '500ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meanings Skeleton - Card 2 */}
                                            <div className="space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="h-8 w-8 bg-slate-300 dark:bg-slate-700 rounded-lg animate-soft-pulse flex-shrink-0" style={{ animationDelay: '200ms' }}></div>
                                                    <div className="w-full space-y-3">
                                                        <div className="h-4 w-1/5 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse mb-2" style={{ animationDelay: '300ms' }}></div>
                                                        <div className="h-3 w-11/12 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse" style={{ animationDelay: '600ms' }}></div>
                                                        <div className="h-3 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse" style={{ animationDelay: '700ms' }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Extras Skeleton (Pills) */}
                                            <div className="border-t border-slate-200 dark:border-white/5 pt-6">
                                                <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded-md animate-soft-pulse mb-4"></div>
                                                <div className="flex flex-wrap gap-2">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className="h-8 w-20 bg-slate-300 dark:bg-slate-700 rounded-lg animate-soft-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {searchState.status === 'error' && (
                                        <div className="p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-800/50 text-center animate-fade-in-up mt-6">
                                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Error</h3>
                                            <p className="text-sm text-red-600 dark:text-red-300">{searchState.error}</p>
                                        </div>
                                    )}

                                    {searchState.status === 'success' && searchState.data?.correction && (
                                        <div className="w-full mb-4 p-3 bg-amber-50/80 dark:bg-amber-900/30 backdrop-blur-md border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center gap-2 animate-fade-in-down">
                                            <div className="p-1 bg-amber-100 dark:bg-amber-800/40 rounded-full text-amber-600 dark:text-amber-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-amber-900 dark:text-amber-100">
                                                <span>Did you mean</span>
                                                <button
                                                    onClick={() => handleSearch(searchState.data!.correction!)}
                                                    className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
                                                >
                                                    "{searchState.data.correction}"?
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {searchState.status === 'success' && searchState.data && searchState.data.meanings && searchState.data.meanings.length > 0 && (
                                        <ResultCard
                                            data={searchState.data}
                                            onSearch={handleSearch}
                                            isFavorite={favorites.some(f => f.word === searchState.data!.word)}
                                            onToggleFavorite={() => toggleFavorite(searchState.data!)}
                                            settings={settings}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            <WritingCoach />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default App;