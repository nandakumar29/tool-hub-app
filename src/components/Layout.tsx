import React, { useState } from 'react';
import { TOOLS } from '../data/tools';
import { Search, Hammer, Menu, X, ArrowUp, Heart, Sparkles, ExternalLink, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  darkTheme: boolean;
  onToggleTheme: () => void;
}

export default function Layout({
  children,
  activeView,
  onNavigate,
  searchQuery,
  onSearchChange,
  darkTheme,
  onToggleTheme
}: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  // Filter tools for instant autocomplete suggester
  const filterSuggest = () => {
    if (!searchQuery.trim()) return [];
    return TOOLS.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  };

  const suggestions = filterSuggest();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkTheme ? 'bg-zinc-950 text-white dark' : 'bg-slate-50/70 text-slate-900'}`}>
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-zinc-850 transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')} id="site-logo-container">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/25">
              <Hammer className="w-5 h-5 text-indigo-50" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">ToolHub</span>
              </span>
              <span className="block text-[9px] text-indigo-500/80 dark:text-zinc-400 font-bold uppercase tracking-wider">all in one click</span>
            </div>
          </div>

          {/* Core desktop navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
               onClick={() => onNavigate('home')}
               className={`text-sm font-semibold transition ${activeView === 'home' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white'}`}
            >
              Home
            </button>
            <button
               onClick={() => onNavigate('blog')}
               className={`text-sm font-semibold transition ${activeView.startsWith('blog') ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white'}`}
            >
              SEO Blog
            </button>
            <button
               onClick={() => onNavigate('about')}
               className={`text-sm font-semibold transition ${activeView === 'about' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white'}`}
            >
              About
            </button>
            <button
               onClick={() => onNavigate('contact')}
               className={`text-sm font-semibold transition ${activeView === 'contact' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white'}`}
            >
              Contact
            </button>
          </nav>

          {/* Autocomplete Search Bar */}
          <div className="hidden lg:block relative w-80">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search 20+ direct online utilities..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-zinc-850 rounded-xl text-xs font-semibold bg-slate-100/60 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-400 transition-all text-slate-800 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3 top-2.5" />
            </div>

            {/* Suggestions drop card */}
            {showSuggest && suggestions.length > 0 && (
               <div className="absolute top-11 left-0 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg p-2.5 space-y-1 z-50">
                {suggestions.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onNavigate(`tools/${t.id}`); onSearchChange(''); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-between font-semibold"
                  >
                    <span className="text-slate-700 dark:text-zinc-200">{t.name}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded capitalize">{t.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3">

            {/* Theme mode toggler */}
            <button
              onClick={onToggleTheme}
              className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-zinc-300 transition"
              aria-label="Toggle App Theme"
            >
              {darkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-600 transition"
              aria-label="Toggle Navigation Drawer"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-850 p-4 space-y-3 z-50">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 20+ free utility templates..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-col gap-2 font-semibold text-sm">
            <button
               onClick={() => { onNavigate('home'); setMenuOpen(false); }}
               className="text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300"
            >
              Home
            </button>
            <button
               onClick={() => { onNavigate('blog'); setMenuOpen(false); }}
               className="text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300"
            >
              SEO Blog & Articles
            </button>
            <button
               onClick={() => { onNavigate('about'); setMenuOpen(false); }}
               className="text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300"
            >
              About ToolHub
            </button>

            <button
               onClick={() => { onNavigate('contact'); setMenuOpen(false); }}
               className="text-left py-2 px-3 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      )}

      {/* PRIMARY CONTAINER BLOCK */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-350 border-t border-zinc-200 dark:border-zinc-850 transition py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Branding block */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Hammer className="w-4.5 h-4.5" />
              </div>
              <span className="text-md font-extrabold tracking-tight text-zinc-900 dark:text-white">ToolHub <span className="text-xs font-normal text-zinc-400">all in one click</span></span>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
              India's premium multi-feature online workspace providing local browser calculators, secure hashing developers modules, and lightning-fast image assets compressors. Fast, free and optimized.
            </p>
          </div>

          {/* Col 2: Categories quick paths */}
          <div>
            <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-white tracking-widest mb-4 font-display">Functional Hubs</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Finance Calculators Suite</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Developers Hash & Encoding</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Word Counters & Utilities</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Lossless Image Compressors</button></li>
            </ul>
          </div>

          {/* Col 3: Legals guidelines / policy page */}
          <div>
            <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-white tracking-widest mb-4 font-display">Privacy & Guidelines</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><button onClick={() => onNavigate('privacy-policy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-indigo-600 dark:hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Terms & Conditions</button></li>
              <li><button onClick={() => onNavigate('sitemap')} className="hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Sitemap Visualizer</button></li>
              <li><button onClick={() => onNavigate('robots')} className="hover:text-indigo-400 text-zinc-500 dark:text-zinc-400 transition">Robots.txt Specification</button></li>
            </ul>
          </div>

          {/* Col 4: Reach out */}
          <div>
            <h4 className="text-xs font-bold uppercase text-zinc-900 dark:text-white tracking-widest mb-4 font-display">General Contact</h4>
            <ul className="space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
              <li>support@tool-hub-app.vercel.app</li>
              <li>Optimized for Google AdSense</li>
              <li><button onClick={() => onNavigate('contact')} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1 transition">Send secure email <ExternalLink className="w-3 h-3" /></button></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT SUMMARY */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center flex flex-col md:flex-row items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} ToolHub (all in one click). Developed by Nandakumar T M. All rights reserved.</p>
          <p className="flex items-center gap-1.5 mt-2 md:mt-0 font-medium">
            Formulated in India with
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            for dynamic browser safety.
          </p>
        </div>
      </footer>

    </div>
  );
}
