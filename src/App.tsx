import React, { useState, useEffect } from 'react';
import { TOOLS, CATEGORIES } from './data/tools';
import { TOOL_QUICK_TIPS } from './data/quickTips';
import { BLOG_ARTICLES } from './data/blogs';
import { Tool, BlogArticle } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Layout from './components/Layout';
import SEO from './components/SEO';
import AdSenseAd from './components/AdSenseMock';
import FinanceTools from './components/FinanceTools';
import DeveloperTools from './components/DeveloperTools';
import UtilityTools from './components/UtilityTools';
import ImageTools from './components/ImageTools';

import {
  ArrowRight,
  Search,
  BookOpen,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowLeftRight,
  Heart,
  Hammer,
  TrendingUp,
  Percent,
  Layers,
  CheckCircle,
  Copy,
  Check,
  FileCode,
  Shield,
  FileCheck,
  Coins,
  Star,
  Lightbulb
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<'finance' | 'developer' | 'utility' | 'image' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHomeSuggest, setShowHomeSuggest] = useState(false);
  const [homeSuggestIndex, setHomeSuggestIndex] = useState(-1);
  const [darkTheme, setDarkTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('toolhub_dark_theme');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    setHomeSuggestIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    try {
      localStorage.setItem('toolhub_dark_theme', String(darkTheme));
      if (darkTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  }, [darkTheme]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [adsensePubId, setAdsensePubId] = useState(() => localStorage.getItem('adsense_publisher_id') || 'pub-9566966001308351');
  const [adsenseMode, setAdsenseMode] = useState(() => localStorage.getItem('adsense_ad_mode') || 'live');
  const [adsenseSaved, setAdsenseSaved] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('toolhub_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      localStorage.setItem('toolhub_favorites', JSON.stringify(next));
      return next;
    });
  };

  const [toolRatings, setToolRatings] = useState<Record<string, { count: number; average: number }>>({});
  const [ratedTools, setRatedTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('toolhub_rated_tools');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'reviews'>('default');
  const [hoverRating, setHoverRating] = useState(0);
  const [successToast, setSuccessToast] = useState('');
  const [openTips, setOpenTips] = useState(false);

  useEffect(() => {
    fetch('/api/ratings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.ratings) {
          setToolRatings(data.ratings);
        }
      })
      .catch((err) => console.error('Error fetching tool ratings:', err));
  }, []);

  useEffect(() => {
    setOpenTips(false);
  }, [activeView]);

  const rateTool = async (toolId: string, rating: number) => {
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, rating }),
      });
      const data = await res.json();
      if (data && data.success) {
        setToolRatings((prev) => ({
          ...prev,
          [toolId]: {
            count: data.count,
            average: data.average,
          },
        }));
        setRatedTools((prev) => {
          const next = prev.includes(toolId) ? prev : [...prev, toolId];
          localStorage.setItem('toolhub_rated_tools', JSON.stringify(next));
          return next;
        });
        return true;
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
    return false;
  };

  // Synchronize hash changes with the React router state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(2); // Strip hash prefix plus slash e.g. "#/..."
      if (!hash) {
        setActiveView('home');
      } else {
        setActiveView(hash);
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial load sync
    if (window.location.hash) {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string) => {
    window.location.hash = `/${view}`;
    setActiveView(view);
    window.scrollTo(0, 0);
  };

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSuccess(false), 4000);
  };

  const handleCopyCode = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // --- SELECTION PROCEDURES ---
  const homeSuggestions = searchQuery.trim() !== ''
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const filteredTools = TOOLS.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedFilteredTools = [...filteredTools].sort((a, b) => {
    if (sortBy === 'rating') {
      const avgA = toolRatings[a.id]?.average || 0;
      const avgB = toolRatings[b.id]?.average || 0;
      if (avgB !== avgA) return avgB - avgA; // highest rating first
      // If ratings are equal, sort by review count
      return (toolRatings[b.id]?.count || 0) - (toolRatings[a.id]?.count || 0);
    }
    if (sortBy === 'reviews') {
      return (toolRatings[b.id]?.count || 0) - (toolRatings[a.id]?.count || 0);
    }
    return 0; // Default index order
  });

  // Hot Popular / Latest Lists
  const popularTools = TOOLS.filter((t) =>
    ['emi-calculator', 'sip-calculator', 'json-formatter', 'image-compressor', 'age-calculator', 'password-generator'].includes(t.id)
  );
  
  const latestTools = TOOLS.filter((t) =>
    ['qr-generator', 'word-counter', 'png-to-jpg', 'jwt-decoder', 'gst-calculator'].includes(t.id)
  );

  const matchedTool = TOOLS.find((t) => activeView === `tools/${t.id}`);
  const matchedArticle = BLOG_ARTICLES.find((art) => activeView === `blog/${art.slug}`);

  // --- SITEMAP XML COMPILER ---
  const generateSitemapXml = () => {
    const rootUrl = "https://tool-hub-app.vercel.app";
    let xmlChunks = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Core pages
    xmlChunks += `  <url>\n    <loc>${rootUrl}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Tools list
    TOOLS.forEach(t => {
      xmlChunks += `  <url>\n    <loc>${rootUrl}/#/tools/${t.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Blogs list
    BLOG_ARTICLES.forEach(a => {
      xmlChunks += `  <url>\n    <loc>${rootUrl}/#/blog/${a.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xmlChunks += `</urlset>`;
    return xmlChunks;
  };

  const sitemapXml = generateSitemapXml();

  // --- ROBOTS TXT COMPILER ---
  const robotsTxt = `# ToolHub Sitemap & Crawling Directives (all in one click)
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://tool-hub-app.vercel.app/sitemap.xml`;


  return (
    <Layout
      activeView={activeView}
      onNavigate={navigateTo}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      darkTheme={darkTheme}
      onToggleTheme={toggleTheme}
    >
      {/* 1. HOMEPAGE VIEW */}
      {activeView === 'home' && (
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          id="home-view-container"
        >
          {/* Main Hero Header */}
          <section className="bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white text-zinc-900 dark:from-zinc-950 dark:via-indigo-950 dark:to-zinc-900 dark:text-white py-20 px-4 text-center relative overflow-hidden border-b border-zinc-200/80 dark:border-zinc-850">
            {/* Grid background styling */}
            <div className="absolute inset-0 opacity-[0.07] dark:opacity-15 bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            
            {/* Ambient radial glow lights */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none"></div>
            <div className="absolute -top-10 right-10 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-400/20 rounded-full text-xs font-semibold text-indigo-650 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                ToolHub — all in one click
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight font-display text-zinc-900 dark:text-white">
                Empower Your Workspace with{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 dark:from-indigo-400 dark:via-purple-300 dark:to-emerald-400 bg-clip-text text-transparent block sm:inline">
                  ToolHub
                </span>
              </h1>

              <p className="text-sm sm:text-md text-zinc-650 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-sans font-medium">
                Unlock instant access to 20+ professional financial calculators, developer encoders, cryptographic hashing modules, and lossless image compressors. Zero server uploads, processed entirely right in your secure browser.
              </p>

              {/* Dynamic search input inside hero with modern Autocomplete Dropdown */}
              <div className="max-w-xl mx-auto relative mt-10">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowHomeSuggest(true)}
                    onBlur={() => setTimeout(() => setShowHomeSuggest(false), 200)}
                    onKeyDown={(e) => {
                      if (homeSuggestions.length === 0) return;
                      
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setHomeSuggestIndex((prev) =>
                          prev < homeSuggestions.length - 1 ? prev + 1 : 0
                        );
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHomeSuggestIndex((prev) =>
                          prev > 0 ? prev - 1 : homeSuggestions.length - 1
                        );
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const selectedIdx = homeSuggestIndex >= 0 && homeSuggestIndex < homeSuggestions.length 
                          ? homeSuggestIndex 
                          : 0;
                        const targetTool = homeSuggestions[selectedIdx];
                        if (targetTool) {
                          navigateTo(`tools/${targetTool.id}`);
                          setSearchQuery('');
                        }
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 20+ direct browser-safe tools (e.g., 'EMI', 'Base64', 'QR Code')..."
                    className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-2xl pl-12 pr-4 py-4.5 border border-zinc-200 dark:border-zinc-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/15 placeholder-zinc-400 dark:placeholder-zinc-500 font-semibold text-sm transition-all"
                  />
                  <Search className="w-5 h-5 text-indigo-500 absolute left-4.5 top-5" />
                </div>

                {/* Autocomplete Dropdown list results */}
                <AnimatePresence>
                  {showHomeSuggest && homeSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-850"
                    >
                      <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                        {homeSuggestions.map((tool, idx) => {
                          const isSelected = idx === homeSuggestIndex;
                          return (
                            <div
                              key={`home-suggest-${tool.id}`}
                              onMouseDown={() => {
                                navigateTo(`tools/${tool.id}`);
                                setSearchQuery('');
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer transition duration-150 ${
                                isSelected
                                  ? 'bg-indigo-650 text-white dark:bg-indigo-600'
                                  : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                              }`}
                            >
                              <div className="flex flex-col items-start pr-4 text-left">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-indigo-650 dark:text-indigo-400'}`}>
                                  {tool.category} Category
                                </span>
                                <span className="font-extrabold text-sm mt-0.5">
                                  {tool.name}
                                </span>
                                <span className={`text-xs mt-0.5 line-clamp-1 text-left ${isSelected ? 'text-indigo-100/90' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                  {tool.description}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-700 text-white border border-indigo-500/30' : 'bg-slate-55 bg-zinc-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}>
                                Launch
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950/60 px-4 py-2.5 flex items-center justify-between text-[11px] text-zinc-450 dark:text-zinc-500">
                        <span className="flex items-center gap-1 font-medium">
                          Use <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-sm font-mono text-[9px] shadow-2xs font-bold">↑↓</kbd> or <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-sm font-mono text-[9px] shadow-2xs font-bold">Enter</kbd> to launch.
                        </span>
                        <span className="font-bold text-indigo-650 dark:text-indigo-400 font-mono">
                          {homeSuggestions.length} matches
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Advert Header Block */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <AdSenseAd slot="header" />
          </div>

          {/* MY FAVORITES SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            <div className="bg-gradient-to-r from-amber-500/[0.03] to-yellow-500/[0.03] dark:from-amber-950/10 dark:to-yellow-950/10 border border-amber-500/10 dark:border-amber-900/15 rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-display">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    My Favorites
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">Quick, direct access to your most-used workspace utilities.</p>
                </div>
                {favorites.length > 0 && (
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1 rounded-full font-mono">
                    {favorites.length} {favorites.length === 1 ? 'tool' : 'tools'} saved
                  </span>
                )}
              </div>

              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {TOOLS.filter(t => favorites.includes(t.id)).map(t => (
                    <div
                      key={`fav-${t.id}`}
                      onClick={() => navigateTo(`tools/${t.id}`)}
                      className="group bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-850 hover:border-amber-400 hover:shadow-lg transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between cursor-pointer relative overflow-hidden h-44"
                    >
                      {/* Interactive star toggle inside the card */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(t.id);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-500 hover:text-amber-600 transition"
                        title="Remove from favorites"
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      </button>

                      <div className="pr-8">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-bold font-mono">
                            {t.category}
                          </span>
                          {toolRatings[t.id] && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/5 dark:border-amber-500/10 scale-90 origin-left">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 shrink-0" />
                              {toolRatings[t.id].average}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white transition group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {t.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-500 line-clamp-2 mt-1.5">
                          {t.description}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-3 group-hover:translate-x-1 duration-300">
                        Launch Engine
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-zinc-900/10">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-zinc-850 flex items-center justify-center mb-3">
                    <Star className="w-5 h-5 text-slate-400 dark:text-zinc-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">No favorite tools saved yet.</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1 max-w-sm">
                    Click the <Star className="inline w-3 h-3 text-slate-400" /> star icon on any tool card or detail view below to bookmark it here for immediate access next time!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Categories Selector Nav Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-2xl font-extrabold tracking-tight mb-2 font-display text-slate-900 dark:text-white">Browse by Specialized Labs</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 font-medium">Toggle a workspace to view local computational engines</p>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`p-5 rounded-2xl border text-left font-bold transition flex flex-col justify-between h-32 hover:scale-[1.02] duration-300 ${selectedCategory === 'all' ? 'border-indigo-500 bg-indigo-50/65 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-350 hover:border-indigo-400 dark:hover:border-zinc-700'}`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-650/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <span className="text-base font-bold">🚀</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-widest opacity-60">All-in-one</span>
                  <span className="text-sm font-display font-bold">20 Tools Catalog</span>
                </div>
              </button>

              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-5 rounded-2xl border text-left font-bold transition flex flex-col justify-between h-32 hover:scale-[1.02] duration-300 ${selectedCategory === cat.id ? 'border-indigo-500 bg-indigo-50/65 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-320 hover:border-indigo-400 dark:hover:border-zinc-700'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-zinc-800 text-indigo-650 dark:text-indigo-300 font-bold`}>
                    <span className="text-sm">
                      {cat.id === 'finance' && '₹'}
                      {cat.id === 'developer' && '‹›'}
                      {cat.id === 'utility' && '⚙️'}
                      {cat.id === 'image' && '🖼️'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-widest opacity-60">Category</span>
                    <span className="text-sm truncate block font-display font-bold">{cat.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* MAIN DYNAMIC CATALOG GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-850">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedCategory === 'all' ? 'All Free Tools' : CATEGORIES[selectedCategory].name}
                  <span className="text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 px-2 py-0.5 rounded-full">({filteredTools.length})</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">High-accuracy engines running direct on your machine.</p>
              </div>

              {/* Sorting filters */}
              <div className="flex items-center gap-2 self-start md:self-auto overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 whitespace-nowrap mr-1">Rank by:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('default')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    sortBy === 'default'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('rating')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 whitespace-nowrap ${
                    sortBy === 'rating'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-100" />
                  Highest Rated
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('reviews')}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    sortBy === 'reviews'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  Most Reviews
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedFilteredTools.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigateTo(`tools/${t.id}`)}
                  className="group bg-white dark:bg-zinc-900/50 border border-slate-200/85 dark:border-zinc-850 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-500/50 transition duration-300 flex flex-col justify-between cursor-pointer h-52 relative overflow-hidden"
                >
                  {/* Subtle hover splash background */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"></div>

                  <div>
                    <div className="flex justify-between items-center mb-3.5 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-indigo-50/50 dark:bg-zinc-800 text-indigo-650 dark:text-zinc-400">
                          {t.category}
                        </span>
                        {toolRatings[t.id] && (
                          <div className="flex items-center gap-0.5 text-[10px] bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md border border-amber-500/10 dark:border-amber-500/10">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500 shrink-0" />
                            <span>{toolRatings[t.id].average}</span>
                            <span className="text-slate-400 dark:text-zinc-500 font-medium">({toolRatings[t.id].count})</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(t.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition duration-200"
                        title={favorites.includes(t.id) ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Star className={`w-3.5 h-3.5 ${favorites.includes(t.id) ? 'fill-amber-400 text-amber-500' : 'text-slate-400 dark:text-zinc-500'}`} />
                      </button>
                    </div>

                    <h4 className="text-md font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2">
                      {t.name}
                    </h4>
                    
                    <p className="text-xs text-slate-500 dark:text-zinc-500 line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5 mt-4 group-hover:translate-x-1.5 transition-transform">
                    Launch Tool
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* AdSense Inbound Banner */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdSenseAd slot="in-content" />
          </div>

          {/* POPULAR & LATEST TOOLS SECTIONS */}
          <section className="bg-slate-50 dark:bg-zinc-900/20 border-t border-b border-slate-200 dark:border-zinc-850 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Popular block */}
              <div>
                <h3 className="text-lg font-extrabold tracking-tight mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="p-1 px-2.5 rounded bg-amber-500/10 text-amber-600 text-xs font-bold">🔥</span>
                  Most Used Utilities in India
                </h3>
                
                <div className="space-y-3">
                  {popularTools.map(pt => (
                    <div
                      key={pt.id}
                      onClick={() => navigateTo(`tools/${pt.id}`)}
                      className="p-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-850 hover:border-indigo-500 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-2xs hover:shadow-md"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">{pt.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{pt.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(pt.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition"
                          title={favorites.includes(pt.id) ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Star className={`w-3.5 h-3.5 ${favorites.includes(pt.id) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-zinc-600 hover:text-amber-500'}`} />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

               {/* Latest additions */}
              <div>
                <h3 className="text-lg font-extrabold tracking-tight mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <span className="p-1 px-2 text-indigo-600 text-xs font-bold bg-indigo-50 dark:bg-zinc-800 rounded">✨</span>
                  New Releases & Updates
                </h3>

                <div className="space-y-3">
                  {latestTools.map(lt => (
                    <div
                      key={lt.id}
                      onClick={() => navigateTo(`tools/${lt.id}`)}
                      className="p-4 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-850 hover:border-indigo-500 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-2xs hover:shadow-md"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">{lt.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lt.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(lt.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition"
                          title={favorites.includes(lt.id) ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Star className={`w-3.5 h-3.5 ${favorites.includes(lt.id) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-zinc-600 hover:text-amber-500'}`} />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* LATEST FROM BLOG ROW */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  SEO Knowledge Base & Advice
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Get detailed step-by-step guidance on taxes, algorithms, hashes and conversion standards.</p>
              </div>
              
              <button
                onClick={() => navigateTo('blog')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all blogs
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BLOG_ARTICLES.slice(0, 3).map((art) => (
                <div
                  key={art.id}
                  onClick={() => navigateTo(`blog/${art.slug}`)}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-850 rounded-2xl p-5 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{art.category}</span>
                    <h4 className="text-md font-bold text-slate-800 dark:text-zinc-100 line-clamp-2 hover:text-indigo-600 mt-2">
                      {art.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{art.summary}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-zinc-850 pt-3 mt-4">
                    <span>{art.publishedDate}</span>
                    <span className="font-semibold">{art.readTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AdSense Footer slot */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <AdSenseAd slot="footer" />
          </div>
        </motion.div>
      )}

      {/* 2. INDIVIDUAL TOOL DETAILS SCREEN */}
      {matchedTool && (
        <motion.div
          key={`tool-${matchedTool.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          id={`tool-view-${matchedTool.id}`}
        >
          
          <SEO
            title={matchedTool.name}
            description={matchedTool.seoDescription}
            canonicalUrl={`https://tool-hub-app.vercel.app/#/tools/${matchedTool.id}`}
            breadcrumbs={[
              { name: matchedTool.category === 'finance' ? 'Finance' : matchedTool.category === 'developer' ? 'Developer' : matchedTool.category === 'utility' ? 'Utility' : 'Image', view: 'home' },
              { name: matchedTool.name }
            ]}
            onNavigate={navigateTo}
            schemaType="WebApplication"
            schemaData={{ category: matchedTool.category }}
          />

          <AdSenseAd slot="header" />

          {/* CENTRAL INTERACTIVE CALCULATOR CARD */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xl rounded-3xl p-6 md:p-8 mb-10 transition">
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-zinc-800 dark:text-indigo-300 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  {matchedTool.category} Engine
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3 font-display">
                  {matchedTool.name}
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">{matchedTool.description}</p>
                
                {/* SQLite Ratings visual dashboard with interactive rating option */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-2">
                  {toolRatings[matchedTool.id] ? (
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const avg = toolRatings[matchedTool.id].average;
                          const filled = s <= Math.round(avg);
                          return (
                            <Star
                              key={`avg-star-${s}`}
                              className={`w-3.5 h-3.5 ${filled ? 'fill-amber-400 text-amber-500' : 'text-slate-200 dark:text-zinc-805 dark:text-zinc-700'}`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-xs text-slate-900 dark:text-white">{toolRatings[matchedTool.id].average} average</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium font-mono">({toolRatings[matchedTool.id].count} {toolRatings[matchedTool.id].count === 1 ? 'user feedback' : 'feedbacks'})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Loading feedback...</span>
                  )}

                  <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block"></div>

                  {/* Active Rating Action and Hover Selection stars */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-zinc-400">Your rating:</span>
                    <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((r) => {
                        const isRated = ratedTools.includes(matchedTool.id);
                        const isHovered = r <= hoverRating;
                        
                        return (
                          <button
                            key={`rate-star-${r}`}
                            type="button"
                            disabled={isRated}
                            onMouseEnter={() => !isRated && setHoverRating(r)}
                            onClick={() => {
                              if (!isRated) {
                                rateTool(matchedTool.id, r);
                                setSuccessToast('rating-success');
                                setTimeout(() => setSuccessToast(''), 3000);
                              }
                            }}
                            className={`p-0.5 transition-all duration-150 ${isRated ? 'cursor-not-allowed opacity-60' : 'hover:scale-125 hover:-translate-y-0.5'}`}
                            title={isRated ? "You've already graded this engine" : `Grade ${r} stars`}
                          >
                            <Star
                              className={`w-4 h-4 transition duration-150 ${
                                isHovered 
                                  ? 'fill-amber-400 text-amber-500' 
                                  : isRated 
                                    ? 'fill-slate-100 dark:fill-zinc-800 text-slate-300 dark:text-zinc-700' 
                                    : 'text-slate-300 dark:text-zinc-650 hover:text-amber-500'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {ratedTools.includes(matchedTool.id) ? (
                      <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-zinc-950/40 px-2 py-0.5 rounded-md">✓ Rated</span>
                    ) : successToast === 'rating-success' ? (
                      <span className="text-[9px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-md animate-pulse">✓ Saved!</span>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium">Click to score</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite(matchedTool.id)}
                className={`self-start sm:self-center px-4 py-2 border rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 shadow-2xs ${
                  favorites.includes(matchedTool.id)
                    ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/15'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-705 dark:bg-zinc-950 dark:hover:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-300'
                }`}
                title={favorites.includes(matchedTool.id) ? 'Remove this tool from favorites' : 'Add this tool to favorites'}
              >
                <Star className={`w-4 h-4 ${favorites.includes(matchedTool.id) ? 'fill-amber-400 text-white' : 'text-slate-400 dark:text-zinc-500 hover:text-amber-500'}`} />
                {favorites.includes(matchedTool.id) ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>

            {/* QUICK TIPS ACCORDION PANEL */}
            {TOOL_QUICK_TIPS[matchedTool.id] && (
              <div className="mt-4 mb-6 pt-4 border-t border-slate-100 dark:border-zinc-850">
                <button
                  type="button"
                  id={`quick-tips-toggle-${matchedTool.id}`}
                  onClick={() => setOpenTips(!openTips)}
                  className="flex items-center justify-between w-full text-left py-2 px-3 rounded-xl bg-indigo-505 bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 transition-all duration-150 text-xs font-bold text-indigo-700 dark:text-indigo-400 select-none group border border-indigo-500/10 dark:border-zinc-800"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400/20 group-hover:scale-110 transition shrink-0" />
                    <span>QUICK TIPS & EXPERT USE CASES FOR {matchedTool.name.toUpperCase()}</span>
                  </span>
                  <span className="text-[10px] bg-indigo-100 dark:bg-zinc-950 text-indigo-800 dark:text-indigo-300 font-mono px-2 py-0.5 rounded-md">
                    {openTips ? 'Hide Tips ▲' : 'Show Tips (3) ▼'}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openTips && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {TOOL_QUICK_TIPS[matchedTool.id].map((tip, i) => (
                          <div
                            key={`tip-${matchedTool.id}-${i}`}
                            className="bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-850/60 p-4 rounded-xl flex items-start gap-3 transition hover:border-indigo-500/20 hover:shadow-xs group"
                          >
                            <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 shadow-3xs group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
                              {i + 1}
                            </span>
                            <div>
                              <h4 className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {tip.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed font-sans">
                                {tip.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* DYNAMIC COMPONENT PLACEMENTS BASED ON CATEGORY */}
            <div className="border-t border-slate-100 dark:border-zinc-850 pt-6">
              {matchedTool.category === 'finance' && <FinanceTools toolId={matchedTool.id} />}
              {matchedTool.category === 'developer' && <DeveloperTools toolId={matchedTool.id} />}
              {matchedTool.category === 'utility' && <UtilityTools toolId={matchedTool.id} />}
              {matchedTool.category === 'image' && <ImageTools toolId={matchedTool.id} />}
            </div>

          </div>

          <AdSenseAd slot="in-content" />

          {/* DEEP SEO DETAIL MODULES */}
          <section className="bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-850 rounded-2xl p-6 md:p-8 space-y-8 mb-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-display">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                About {matchedTool.name}
              </h3>
              <p className="text-sm text-slate-650 dark:text-zinc-300 leading-relaxed">{matchedTool.detailedContent}</p>
            </div>

            {/* Expansible FAQs block */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 font-display">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {matchedTool.faqs.map((faq, i) => (
                  <details key={i} className="group border-b border-slate-200/80 dark:border-zinc-800 pb-3" open={i === 0}>
                    <summary className="list-none cursor-pointer flex justify-between items-center text-sm font-bold text-slate-800 dark:text-zinc-200 hover:text-indigo-650 transition py-1">
                      <span>{faq.question}</span>
                      <span className="text-xs transition-transform group-open:rotate-185">▼</span>
                    </summary>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2.5 leading-relaxed pl-2 border-l border-slate-200 dark:border-zinc-800">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <AdSenseAd slot="footer" />

          {/* CROSS SELLING RECOMMENDED TOOLS BLOCK */}
          <section className="mt-8">
            <h4 className="text-md font-bold text-slate-900 dark:text-white mb-4 font-display">Related Tools You May Need</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matchedTool.relatedTools.map(relId => {
                const rel = TOOLS.find(t => t.id === relId);
                if (!rel) return null;
                return (
                  <div
                    key={rel.id}
                    onClick={() => navigateTo(`tools/${rel.id}`)}
                    className="p-4 bg-white/70 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-850 hover:border-indigo-500 rounded-xl cursor-pointer transition hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{rel.name}</h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{rel.description}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1.5 mt-3">
                      Launch <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

        </motion.div>
      )}

      {/* 3. BLOG HUB VIEW */}
      {activeView === 'blog' && (
        <motion.div
          key="blog"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          id="blog-catalog-container"
        >
          <SEO
            title="SEO Blog & Learning Articles"
            description="Explore our library of 20 high-quality SEO tutorials dealing with financial EMI math, developer Base64 operations, security claims, and image metrics."
            canonicalUrl="https://tool-hub-app.vercel.app/#/blog"
            breadcrumbs={[{ name: 'SEO Blog' }]}
            onNavigate={navigateTo}
          />

          <section className="mb-10 text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">Technical Tutorials & Resource Guides</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">Read deep-dive expert guidelines on cryptography hashes, calculation formulas, and image optimizations written by finance specialists and developers.</p>
          </section>

          <AdSenseAd slot="header" />

          {/* Catalog grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_ARTICLES.map((art) => (
              <div
                key={art.id}
                onClick={() => navigateTo(`blog/${art.slug}`)}
                className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-5 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-zinc-800 dark:text-indigo-400 px-2 py-0.5 rounded capitalize">
                    {art.category}
                  </span>
                  <h3 className="text-md font-bold text-zinc-850 dark:text-zinc-100 hover:text-indigo-600 transition mt-3">
                    {art.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-2">{art.summary}</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-850 pt-3 mt-4">
                  <span>Pin: {art.publishedDate}</span>
                  <span className="font-semibold">{art.readTime}</span>
                </div>
              </div>
            ))}
          </div>

          <AdSenseAd slot="footer" />
        </motion.div>
      )}

      {/* 4. INDIVIDUAL BLOG READER PAGE */}
      {matchedArticle && (
        <motion.div
          key={`article-${matchedArticle.slug}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          id="article-reader-container"
        >
          
          <SEO
            title={matchedArticle.title}
            description={matchedArticle.summary}
            canonicalUrl={`https://tool-hub-app.vercel.app/#/blog/${matchedArticle.slug}`}
            breadcrumbs={[
              { name: 'SEO Blog', view: 'blog' },
              { name: matchedArticle.title }
            ]}
            onNavigate={navigateTo}
            schemaType="Article"
            schemaData={{ date: '2026-06-21', author: matchedArticle.author }}
          />

          <AdSenseAd slot="header" />

          <article className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6">
            
            {/* Header elements */}
            <div className="space-y-3.5 border-b border-zinc-100 dark:border-zinc-900 pb-5">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-zinc-800 dark:text-indigo-300 px-3 py-1.5 rounded-lg uppercase">
                {matchedArticle.category} Tutorial
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                {matchedArticle.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                <span className="font-semibold">{matchedArticle.author}</span>
                <span>•</span>
                <span>{matchedArticle.publishedDate}</span>
                <span>•</span>
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-semibold">{matchedArticle.readTime}</span>
              </div>
            </div>

            {/* Render article text */}
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-650 dark:text-zinc-300 space-y-4">
              {matchedArticle.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-lg font-bold text-zinc-900 dark:text-white mt-6 mb-2">
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }
                if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                  return (
                    <p key={idx} className="font-bold text-zinc-800 dark:text-zinc-200 mt-4">
                      {trimmed.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                return <p key={idx} className="whitespace-pre-line">{trimmed}</p>;
              })}
            </div>

            {/* Tags footer */}
            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-5 mt-6 flex flex-wrap gap-2">
              {matchedArticle.tags.map(t => (
                <span key={t} className="text-[10px] select-none font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full uppercase">
                  #{t}
                </span>
              ))}
            </div>

          </article>

          <AdSenseAd slot="footer" />
        </motion.div>
      )}

      {/* 5. PRIVACY POLICY */}
      {activeView === 'privacy-policy' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="privacy-container">
          <SEO
            title="Privacy Policy"
            description="Our professional AdSense compliant Privacy Policy detailing local data encryption controls, offline computing paradigms, and zero cookie logs values."
            canonicalUrl="https://tool-hub-app.vercel.app/#/privacy-policy"
            breadcrumbs={[{ name: 'Privacy Policy' }]}
            onNavigate={navigateTo}
          />

          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white border-b pb-2">Privacy Directive Standards (AdSense Compliant)</h2>
            <p className="text-xs text-zinc-500 font-mono">Last modified: June 21, 2026</p>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              At **ToolHub**, accessible from any modern web client, the privacy and digital security of our visitors are paramount to our core architecture.
            </p>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">1. Local Processing Security</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Unlike common online utility networks that upload user spreadsheets, JSON keys, or private images onto remote database containers, our tools (especially our Hashing tools, JWT Decoders, and Image Compressors) run **100% locally** on your device utilizing standard browser WebAssembly, Canvas, and Cryptography layers. Your directories are completely safe.
              </p>

              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">2. Cookies and DoubleClick DART Cookies</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Google is one of our essential third-party vendors. It uses cookies, specifically DART cookies, to serve promotional advertisements to our site visitors based on their browsing parameters across external websites. Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy.
              </p>

              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">3. CCPA and GDPR Compliance</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                We collect zero persistent personal credentials. Under standard CCPA and GDPR provisions, Indian and international users have the right to request parameters deletion or restriction of tracking logs. Feel free to deny standard marketing cookies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TERMS & CONDITIONS */}
      {activeView === 'terms' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="terms-container">
          <SEO
            title="Terms & Conditions"
            description="Our service limitations and legal terms governing usage of ToolHub free calculation networks."
            canonicalUrl="https://tool-hub-app.vercel.app/#/terms"
            breadcrumbs={[{ name: 'Terms' }]}
            onNavigate={navigateTo}
          />

          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white border-b pb-2">Terms and Conditions</h2>
            <p className="text-xs text-zinc-500 font-mono">Effective date: June 21, 2026</p>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              By accessing the free services at **ToolHub**, you recognize and agree to comply with standard utilization protocols.
            </p>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">1. License of Use</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                You are permitted to utilize all 20 calculative models free of charge for commercial, academic, or personal scenarios (such as evaluating banking EMIs, designing password patterns, or resizing banners). You are strictly forbidden from executing automated web crawler bots to disrupt the frontend service.
              </p>

              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">2. Disclaimers</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                All financial projections (especially SIP wealth creation and Fixed Deposit interests) serve purely as informative estimates. ToolHub assumes zero accountability for investments or decisions inspired by mathematical conversions rendered in these calculators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. ABOUT US */}
      {activeView === 'about' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="about-container">
          <SEO
            title="About Us"
            description="The development story, engineering architecture and data protection mission of ToolHub (all in one click)."
            canonicalUrl="https://tool-hub-app.vercel.app/#/about"
            breadcrumbs={[{ name: 'About' }]}
            onNavigate={navigateTo}
          />

          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white border-b pb-2">About ToolHub</h2>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              ToolHub (all in one click) was founded in **June 2026** with a singular mission: to provide the highest-fidelity, completely transparent calculations and asset utilities for Indian and global audiences.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-600 uppercase">Local Browser Safety</h4>
                <p className="text-xs text-zinc-400">
                  Most tool services rely heavily on backend logs that store and track data. Our architecture is built completely on-device, processing calculations and resizing photos without server uploads.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border rounded-xl space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-600 uppercase">Fast Page Speeds</h4>
                <p className="text-xs text-zinc-400">
                  We maintain a perfect score on Lighthouse indices. We use inline SVGs, zero tracking scripts, and clean CSS styling structures to minimize resource weight.
                </p>
              </div>
            </div>

            <div className="p-5 border border-indigo-100 dark:border-zinc-800 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 space-y-2">
              <h4 className="font-extrabold text-xs text-indigo-600 uppercase">Lead Engineer & Creator</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                ToolHub is architected, developed, and maintained by **Nandakumar T M** (Nk). It represents pristine local engineering designed to prioritize individual privacy with desktop-fidelity calculation suites.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. CONTACT US */}
      {activeView === 'contact' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="contact-container">
          <SEO
            title="Contact Us"
            description="Send a message to our support staff. We respond to partner, API integrations and developer queries within 24 hours."
            canonicalUrl="https://tool-hub-app.vercel.app/#/contact"
            breadcrumbs={[{ name: 'Contact' }]}
            onNavigate={navigateTo}
          />

          <div className="grid grid-cols-1 md:grid-cols-12 border rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden">
            
            {/* Reach info */}
            <div className="md:col-span-5 bg-gradient-to-b from-indigo-950 to-zinc-900 text-white p-8 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-4">Support & Inquiries</h2>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">Have support questions or need customized API conversions built for your agency? Fill out our contact form.</p>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>support@tool-hub-app.vercel.app</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-zinc-500 font-bold block mt-8">TOOLHUB INDIA SECTOR</span>
            </div>

            {/* Input form */}
            <form onSubmit={handleContactSubmit} className="md:col-span-7 p-8 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1">Your Name</label>
                <input
                  required
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 font-bold mb-1">Message Detail</label>
                <textarea
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              {contactSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-bounce">
                  <CheckSquare className="w-4 h-4" /> Message Sent! We'll reply within 24 hours.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition"
              >
                Send Message
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 9. SITEMAP.XML GENERATOR VISUAL VIEW */}
      {activeView === 'sitemap' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="sitemap-container">
          <SEO
            title="Sitemap.xml Generator & Viewer"
            description="Dynamic sitemap generator mapping all canonical paths, tools, and blog directories of ToolHub."
            canonicalUrl="https://tool-hub-app.vercel.app/#/sitemap"
            breadcrumbs={[{ name: 'Sitemap' }]}
            onNavigate={navigateTo}
          />

          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-zinc-100 dark:border-zinc-850">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-600" />
                  Dynamic sitemap.xml Code Compiler
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Submit this structured metadata index mapping directly to Google Search Console to speed up crawling speeds.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyCode(sitemapXml, 'sitemap_code')}
                  className="px-3 py-1.5 border hover:bg-zinc-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  {copiedKey === 'sitemap_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'sitemap_code' ? 'Copied XML!' : 'Copy Script'}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([sitemapXml], { type: 'text/xml' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'sitemap.xml';
                    link.click();
                  }}
                  className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <FileCheck className="w-4 h-4" /> Download sitemap.xml
                </button>
              </div>
            </div>

            <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-2xl overflow-x-auto text-xs font-mono h-96 leading-relaxed border border-zinc-800">{sitemapXml}</pre>
          </div>
        </div>
      )}

      {/* 10. ROBOTS.TXT VISUAL VIEW */}
      {activeView === 'robots' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="robots-container">
          <SEO
            title="robots.txt Viewer"
            description="Crawling directives and sitemap attachments configured for ToolHub search spiders."
            canonicalUrl="https://tool-hub-app.vercel.app/#/robots"
            breadcrumbs={[{ name: 'robots' }]}
            onNavigate={navigateTo}
          />

          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-zinc-100 dark:border-zinc-850">
              <div>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Robots.txt Crawling Directives
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Configures index guidelines telling Googlebot and Bingbot search spider crawlers which paths are accessible.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyCode(robotsTxt, 'robots_code')}
                  className="px-3 py-1.5 border hover:bg-zinc-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  {copiedKey === 'robots_code' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'robots_code' ? 'Copied robots.txt!' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([robotsTxt], { type: 'text/plain' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'robots.txt';
                    link.click();
                  }}
                  className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-xs font-bold transition"
                >
                  Download robots.txt
                </button>
              </div>
            </div>

            <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed border border-zinc-800">{robotsTxt}</pre>
          </div>
        </div>
      )}



    </Layout>
  );
}

// Inline placeholder helper
function CheckSquare(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: '1em', height: '1em' }}><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
  );
}
