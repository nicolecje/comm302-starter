import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  INITIAL_PRIMARY_INDICES,
  INITIAL_SECONDARY_INDICES,
  INITIAL_WORLD_INDICES,
  INITIAL_US_STOCKS,
  HIGHEST_VOLUME_STOCKS,
  MOST_VOLATILE_STOCKS,
  TOP_GAINERS_STOCKS,
  EARNINGS_TODAY,
  INITIAL_CRYPTO,
  CRYPTO_MARKET_CAP_RANKING,
  CRYPTO_TVL_RANKING,
  CRYPTO_MOVERS,
  INITIAL_COMMODITIES,
  ENERGY_FUTURES,
  AGRICULTURAL_FUTURES,
  INDEX_FUTURES,
  INITIAL_FOREX,
  US_TREASURY_YIELDS,
  GLOBAL_10Y_BENCHMARK,
  CORPORATE_BONDS,
  INITIAL_ETFS,
  ECONOMIC_INDICATORS,
  InstrumentQuote
} from './data/marketData';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { SearchModal } from './components/SearchModal';
import { CustomizeViewModal, ViewSettings } from './components/CustomizeViewModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { ScreenerModal } from './components/ScreenerModal';
import { Bookmark, Globe, Bell, User, Check, ChevronDown } from 'lucide-react';

const DEFAULT_SETTINGS: ViewSettings = {
  sections: {
    indices: true,
    usStocks: true,
    worldStocks: true,
    crypto: true,
    futures: true,
    forex: true,
    bonds: true,
    etfs: true,
    economy: true
  },
  liveSimulation: true,
  simulationSpeed: 'normal'
};

export default function App() {
  // Market quotes state
  const [primaryIndices, setPrimaryIndices] = useState(INITIAL_PRIMARY_INDICES);
  const [secondaryIndices, setSecondaryIndices] = useState(INITIAL_SECONDARY_INDICES);
  const [worldIndices, setWorldIndices] = useState(INITIAL_WORLD_INDICES);
  const [usStocks, setUsStocks] = useState(INITIAL_US_STOCKS);
  const [cryptoCoins, setCryptoCoins] = useState(INITIAL_CRYPTO);
  const [commodities, setCommodities] = useState(INITIAL_COMMODITIES);
  const [forexPairs, setForexPairs] = useState(INITIAL_FOREX);
  const [etfs, setEtfs] = useState(INITIAL_ETFS);

  // US Stocks Trading Session mode: 'regular' vs 'premarket'
  const [marketSession, setMarketSession] = useState<'regular' | 'premarket'>('regular');

  // Flash updates map: ticker -> 'up' | 'down'
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down'>>({});

  // Active navigation tab & category
  const [activeCategory, setActiveCategory] = useState<string>('indices');
  const [activeNav, setActiveNav] = useState<string>('Markets');

  // Modals & Drawers state
  const [selectedQuote, setSelectedQuote] = useState<InstrumentQuote | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isScreenerOpen, setIsScreenerOpen] = useState(false);
  const [marketRegionDropdown, setMarketRegionDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Markets, everywhere');

  // Language & Notification dropdowns
  const [langDropdown, setLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [notifDropdown, setNotifDropdown] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ViewSettings>(() => {
    const cached = localStorage.getItem('tv_view_settings');
    return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
  });

  // Watchlist persisted state
  const [watchlist, setWatchlist] = useState<InstrumentQuote[]>(() => {
    const cached = localStorage.getItem('tv_watchlist');
    return cached ? JSON.parse(cached) : [INITIAL_US_STOCKS[0], INITIAL_CRYPTO[0], INITIAL_PRIMARY_INDICES[0]];
  });

  // Save watchlist & settings to localStorage
  useEffect(() => {
    localStorage.setItem('tv_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('tv_view_settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Consolidate all instruments for Search and Screener
  const allInstruments = useMemo(() => {
    return [
      ...primaryIndices,
      ...secondaryIndices,
      ...worldIndices,
      ...usStocks,
      ...cryptoCoins,
      ...commodities,
      ...forexPairs,
      ...etfs
    ];
  }, [primaryIndices, secondaryIndices, worldIndices, usStocks, cryptoCoins, commodities, forexPairs, etfs]);

  // Real-time market tick simulation
  useEffect(() => {
    if (!settings.liveSimulation) return;

    const intervalMs =
      settings.simulationSpeed === 'fast' ? 1500 : settings.simulationSpeed === 'relaxed' ? 5500 : 2800;

    const interval = setInterval(() => {
      // Pick 2-3 random instruments to tick
      const targetGroup = Math.floor(Math.random() * 5);
      const newFlash: Record<string, 'up' | 'down'> = {};

      if (targetGroup === 0) {
        // Tick US stocks
        setUsStocks((prev) =>
          prev.map((stock) => {
            if (Math.random() > 0.4) return stock;
            const delta = (Math.random() - 0.48) * (stock.price * 0.0018);
            const newPrice = Math.max(1, Number((stock.price + delta).toFixed(2)));
            const newChange = Number((stock.change + delta).toFixed(2));
            const newChangePct = Number(((newChange / (stock.previousClose || stock.price)) * 100).toFixed(2));
            newFlash[stock.id] = delta >= 0 ? 'up' : 'down';
            return {
              ...stock,
              price: newPrice,
              change: newChange,
              changePct: newChangePct
            };
          })
        );
      } else if (targetGroup === 1) {
        // Tick Crypto
        setCryptoCoins((prev) =>
          prev.map((coin) => {
            if (Math.random() > 0.45) return coin;
            const delta = (Math.random() - 0.47) * (coin.price * 0.003);
            const decimals = coin.price > 100 ? 2 : 3;
            const newPrice = Number((coin.price + delta).toFixed(decimals));
            const newChange = Number((coin.change + delta).toFixed(decimals));
            const newChangePct = Number(((newChange / (coin.previousClose || coin.price)) * 100).toFixed(2));
            newFlash[coin.id] = delta >= 0 ? 'up' : 'down';
            return {
              ...coin,
              price: newPrice,
              change: newChange,
              changePct: newChangePct
            };
          })
        );
      } else if (targetGroup === 2) {
        // Tick Primary Indices
        setPrimaryIndices((prev) =>
          prev.map((idx) => {
            if (Math.random() > 0.5) return idx;
            const delta = (Math.random() - 0.46) * (idx.price * 0.0006);
            const newPrice = Number((idx.price + delta).toFixed(2));
            const newChange = Number((idx.change + delta).toFixed(2));
            const newChangePct = Number(((newChange / (idx.previousClose || idx.price)) * 100).toFixed(2));
            newFlash[idx.id] = delta >= 0 ? 'up' : 'down';
            return {
              ...idx,
              price: newPrice,
              change: newChange,
              changePct: newChangePct
            };
          })
        );
      } else if (targetGroup === 3) {
        // Tick Commodities
        setCommodities((prev) =>
          prev.map((comm) => {
            if (Math.random() > 0.5) return comm;
            const delta = (Math.random() - 0.48) * (comm.price * 0.001);
            const newPrice = Number((comm.price + delta).toFixed(comm.price > 10 ? 2 : 3));
            const newChange = Number((comm.change + delta).toFixed(comm.price > 10 ? 2 : 3));
            newFlash[comm.id] = delta >= 0 ? 'up' : 'down';
            return {
              ...comm,
              price: newPrice,
              change: newChange
            };
          })
        );
      } else {
        // Tick Forex
        setForexPairs((prev) =>
          prev.map((fx) => {
            if (Math.random() > 0.5) return fx;
            const delta = (Math.random() - 0.5) * 0.0004;
            const newPrice = Number((fx.price + delta).toFixed(4));
            newFlash[fx.id] = delta >= 0 ? 'up' : 'down';
            return {
              ...fx,
              price: newPrice,
              bid: Number((newPrice - 0.0001).toFixed(4)),
              ask: Number((newPrice + 0.0001).toFixed(4))
            };
          })
        );
      }

      setFlashStates(newFlash);
      setTimeout(() => {
        setFlashStates({});
      }, 1100);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [settings.liveSimulation, settings.simulationSpeed]);

  // Watchlist toggle handler
  const handleToggleBookmark = (quote: InstrumentQuote) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.id === quote.id);
      if (exists) {
        return prev.filter((item) => item.id !== quote.id);
      } else {
        return [...prev, quote];
      }
    });
  };

  const isBookmarked = (id: string) => watchlist.some((item) => item.id === id);

  // Smooth scroll to category anchor
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#171b26] antialiased selection:bg-[#2962ff] selection:text-white">
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white border-b border-[#F0F3FA]">
        <div className="h-16 w-full px-4 lg:px-6 flex items-center justify-between gap-3 max-w-[1440px] mx-auto">
          {/* Left: Brand + Search + Primary Nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-1.5 shrink-0 select-none group"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#171b26] group-hover:text-[#2962ff] transition-colors" fill="currentColor" viewBox="0 0 28 28">
                  <path d="M4 7h4v14H4V7zm8 4h4v10h-4V11zm8-7h4v17h-4V4z"></path>
                  <polygon points="12,4 16,4 10,21 6,21"></polygon>
                  <polygon points="20,4 24,4 18,21 14,21"></polygon>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#171b26]">TradingView</span>
            </a>

            {/* Global Search Bar (Ctrl+K) */}
            <div className="relative hidden xl:flex items-center">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center bg-[#F8F9FD] hover:bg-[#F4F6FB] border border-[#F0F3FA] hover:border-[#E0E3EB] rounded-full px-3 py-1.5 gap-2.5 cursor-pointer transition-colors w-64 text-left"
              >
                <span className="material-symbols-outlined text-[#6A7080] text-[18px]">search</span>
                <span className="text-xs text-[#6A7080] flex-1">Search</span>
                <span className="text-[10px] font-bold bg-white text-[#6A7080] px-1.5 py-0.5 rounded border border-[#E0E3EB]">
                  Ctrl+K
                </span>
              </button>
            </div>

            {/* Top Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 h-16">
              {['Products', 'Community', 'Markets', 'Brokers', 'More'].map((navItem) => (
                <button
                  key={navItem}
                  onClick={() => {
                    setActiveNav(navItem);
                    if (navItem === 'Products') setIsScreenerOpen(true);
                  }}
                  className={`h-full flex items-center px-3 text-sm font-medium transition-colors border-b-2 ${
                    activeNav === navItem
                      ? 'text-[#0049db] border-[#0049db] font-semibold'
                      : 'text-[#434656] hover:text-[#171b26] border-transparent'
                  }`}
                >
                  {navItem}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Actions, Lang, Notifications, Watchlist, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex xl:hidden items-center justify-center w-9 h-9 rounded-full hover:bg-[#F8F9FD] text-[#434656] transition-colors"
              title="Search"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Watchlist Quick Toggle */}
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-[#F8F9FD] text-[#434656] hover:text-[#171b26] transition-colors relative"
              title="Open Watchlist"
            >
              <Bookmark className="w-4 h-4 text-[#0049db]" />
              <span className="text-xs font-semibold hidden md:inline">Watchlist</span>
              {watchlist.length > 0 && (
                <span className="w-4 h-4 bg-[#2962ff] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-[#F8F9FD] text-[#434656] hover:text-[#171b26] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">language</span>
                <span className="text-xs font-semibold uppercase">{selectedLang}</span>
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-[#E0E3EB] py-1 z-50">
                  {['EN', 'DE', 'FR', 'ES', 'JA'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#F8F9FD] font-medium flex items-center justify-between"
                    >
                      <span>{lang === 'EN' ? 'English (US)' : lang === 'DE' ? 'Deutsch' : lang === 'FR' ? 'Français' : lang === 'ES' ? 'Español' : '日本語'}</span>
                      {selectedLang === lang && <Check className="w-3.5 h-3.5 text-[#0049db]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button 
                onClick={() => setNotifDropdown(!notifDropdown)}
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F8F9FD] text-[#434656] hover:text-[#171b26] transition-colors relative"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#2962ff] rounded-full animate-ping" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#2962ff] rounded-full" />
              </button>

              {notifDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E0E3EB] p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F3FA]">
                    <span className="font-bold text-xs text-[#171b26]">Market Alerts</span>
                    <span className="text-[10px] text-[#089981] font-semibold">Live Streaming</span>
                  </div>
                  <div className="py-2 flex flex-col gap-2 text-xs">
                    <div className="p-2 bg-[#F8F9FD] rounded-lg">
                      <p className="font-semibold text-[#171b26]">NVDA crossed $141.50</p>
                      <span className="text-[10px] text-[#6A7080]">Volume surged +2.18% in regular session</span>
                    </div>
                    <div className="p-2 bg-[#F8F9FD] rounded-lg">
                      <p className="font-semibold text-[#171b26]">Bitcoin held above $96,400</p>
                      <span className="text-[10px] text-[#6A7080]">BTC dominance now at 58.4%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Get started CTA */}
            <button
              onClick={() => setIsScreenerOpen(true)}
              className="hidden sm:inline-flex items-center justify-center text-sm font-medium text-white bg-[#2962ff] hover:bg-[#0049db] px-4 py-1.5 rounded-full transition-colors active:scale-95 shadow-xs"
            >
              Get started
            </button>

            {/* Profile Avatar */}
            <div 
              onClick={() => setIsWatchlistOpen(true)}
              className="w-8 h-8 rounded-full bg-[#0049db] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#2962ff]/40 transition-all text-white"
              title="User Profile & Watchlist"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="w-full pt-16">
        <div className="flex flex-col w-full">
          {/* 2. STICKY CATEGORY FILTER BAR */}
          <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3 border-b border-[#F0F3FA] transition-all duration-200">
            <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'indices', label: 'Indices' },
                  { id: 'us-stocks', label: 'US stocks' },
                  { id: 'world-stocks', label: 'World stocks' },
                  { id: 'crypto', label: 'Crypto' },
                  { id: 'futures', label: 'Futures' },
                  { id: 'forex', label: 'Forex' },
                  { id: 'bonds', label: 'Government bonds' },
                  { id: 'corporate-bonds', label: 'Corporate bonds' },
                  { id: 'etfs', label: 'ETFs' },
                  { id: 'economy', label: 'Economy' }
                ].map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <a
                      key={cat.id}
                      href={`#${cat.id}`}
                      onClick={(e) => scrollToSection(e, cat.id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#131722] text-white shadow-sm'
                          : 'hover:bg-[#F8F9FD] text-[#171b26]'
                      }`}
                    >
                      {cat.label}
                    </a>
                  );
                })}
              </div>

              {/* Customize View Trigger */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsCustomizeOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F9FD] hover:bg-[#F4F6FB] text-xs font-semibold text-[#6A7080] hover:text-[#171b26] transition-colors border border-transparent hover:border-[#E0E3EB]"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Customize view</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN DATA CONTAINER */}
          <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-16">
            {/* HERO SECTION */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3 relative">
                <div 
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => setMarketRegionDropdown(!marketRegionDropdown)}
                >
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-[#171b26] tracking-tight flex items-center gap-2">
                    {selectedRegion}
                    <span className="material-symbols-outlined text-[36px] text-[#6A7080] group-hover:translate-y-0.5 transition-transform">
                      expand_more
                    </span>
                  </h1>
                </div>

                {marketRegionDropdown && (
                  <div className="absolute top-14 left-0 w-64 bg-white rounded-xl shadow-2xl border border-[#E0E3EB] py-2 z-30 animate-in fade-in duration-150">
                    {[
                      'Markets, everywhere',
                      'Americas Equities',
                      'European Financials',
                      'Asia-Pacific Markets',
                      'Cryptocurrency & DeFi'
                    ].map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setSelectedRegion(region);
                          setMarketRegionDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#171b26] hover:bg-[#F8F9FD] font-medium flex items-center justify-between"
                      >
                        <span>{region}</span>
                        {selectedRegion === region && <Check className="w-4 h-4 text-[#0049db]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-base text-[#6A7080] max-w-2xl leading-relaxed">
                Real-time telemetry and quantitative performance across global equities, digital assets, sovereign debt, currency pairs, and macro indices.
              </p>
            </div>

            {/* 1. INDICES SECTION */}
            {settings.sections.indices && (
              <section className="flex flex-col gap-6" id="indices">
                <div className="flex items-baseline justify-between">
                  <a
                    href="#indices"
                    onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                    className="group flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[#171b26] hover:text-[#0049db] transition-colors"
                  >
                    Indices
                    <span className="material-symbols-outlined text-[24px] text-[#6A7080] group-hover:translate-x-1 group-hover:text-[#0049db] transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <span className="text-xs font-semibold text-[#6A7080]">Updated real-time • NY/EST</span>
                </div>

                {/* Top Primary Indices Cards Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {primaryIndices.map((idx) => {
                    const isUp = idx.change >= 0;
                    const flash = flashStates[idx.id];
                    return (
                      <div
                        key={idx.id}
                        onClick={() => setSelectedQuote(idx)}
                        className={`bg-white p-5 rounded-2xl shadow-xs hover:shadow-md border border-[#F0F3FA] hover:border-[#E0E3EB] transition-all flex flex-col justify-between group cursor-pointer ${
                          flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                              style={{ backgroundColor: idx.badgeColor }}
                            >
                              {idx.badgeText}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-[#171b26] group-hover:text-[#0049db] transition-colors">
                                {idx.symbol}
                              </h3>
                              <span className="text-xs text-[#6A7080] uppercase">{idx.name}</span>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-0.5 ${
                            isUp ? 'bg-[#EBF9F5] text-[#089981]' : 'bg-[#FDF0F1] text-[#F23645]'
                          }`}>
                            {isUp ? '▲ +' : '▼ '}{idx.changePct.toFixed(2)}%
                          </span>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <div className="text-xl font-bold tabular-nums text-[#171b26]">
                              {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-xs font-semibold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                              {isUp ? '+' : ''}{idx.change.toFixed(2)} pts
                            </div>
                          </div>

                          {/* Mini Sparkline SVG */}
                          <svg className={`w-32 h-10 overflow-visible ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`} fill="none" viewBox="0 0 100 30">
                            {isUp ? (
                              <>
                                <path d="M0,25 Q20,24 35,18 T65,12 T100,4" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                                <path d="M0,25 Q20,24 35,18 T65,12 T100,4 L100,30 L0,30 Z" fill="currentColor" fillOpacity="0.08" />
                              </>
                            ) : (
                              <>
                                <path d="M0,8 Q30,10 50,16 T80,22 T100,27" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                                <path d="M0,8 Q30,10 50,16 T80,22 T100,27 L100,30 L0,30 Z" fill="currentColor" fillOpacity="0.08" />
                              </>
                            )}
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Secondary Indices Ticker Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {secondaryIndices.map((idx) => {
                    const isUp = idx.changePct >= 0;
                    return (
                      <div
                        key={idx.id}
                        onClick={() => setSelectedQuote(idx)}
                        className="bg-white p-3 rounded-xl shadow-xs border border-[#F0F3FA] flex flex-col justify-between hover:bg-[#F4F6FB] transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-[#171b26]">{idx.symbol}</span>
                          <span className={`text-[11px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                            {isUp ? '+' : ''}{idx.changePct.toFixed(2)}%
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-bold tabular-nums text-[#171b26]">
                          {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* World Indices Sub-Section */}
                {settings.sections.worldStocks && (
                  <div className="mt-2 flex flex-col gap-4" id="world-stocks">
                    <div className="flex items-center justify-between">
                      <a 
                        href="#world-stocks" 
                        onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                        className="text-lg font-bold text-[#171b26] hover:text-[#0049db] flex items-center gap-1 transition-colors"
                      >
                        World indices
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </a>
                      <button 
                        onClick={() => setIsScreenerOpen(true)}
                        className="text-xs font-semibold text-[#0049db] hover:underline"
                      >
                        See all major indices
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {worldIndices.map((idx) => {
                        const isUp = idx.changePct >= 0;
                        return (
                          <div
                            key={idx.id}
                            onClick={() => setSelectedQuote(idx)}
                            className="bg-white p-3.5 rounded-xl shadow-xs border border-[#F0F3FA] flex flex-col justify-between hover:bg-[#F4F6FB] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[18px]">{idx.flag}</span>
                              <span className="text-xs font-semibold text-[#171b26] truncate">{idx.symbol}</span>
                            </div>
                            <div className="mt-2 flex items-baseline justify-between">
                              <span className="text-sm font-bold tabular-nums text-[#171b26]">
                                {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`text-[11px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                                {isUp ? '+' : ''}{idx.changePct.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 2. US STOCKS SECTION */}
            {settings.sections.usStocks && (
              <section className="flex flex-col gap-6" id="us-stocks">
                <div className="flex items-baseline justify-between">
                  <a
                    href="#us-stocks"
                    onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                    className="group flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[#171b26] hover:text-[#0049db] transition-colors"
                  >
                    US stocks
                    <span className="material-symbols-outlined text-[24px] text-[#6A7080] group-hover:translate-x-1 group-hover:text-[#0049db] transition-transform">
                      chevron_right
                    </span>
                  </a>

                  {/* Regular hours vs Pre-market switch */}
                  <div className="flex items-center gap-1 bg-[#F8F9FD] p-1 rounded-full border border-[#E0E3EB]">
                    <button
                      onClick={() => setMarketSession('regular')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        marketSession === 'regular'
                          ? 'bg-[#131722] text-white shadow-xs'
                          : 'text-[#6A7080] hover:text-[#171b26]'
                      }`}
                    >
                      Regular hours
                    </button>
                    <button
                      onClick={() => setMarketSession('premarket')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        marketSession === 'premarket'
                          ? 'bg-[#131722] text-white shadow-xs'
                          : 'text-[#6A7080] hover:text-[#171b26]'
                      }`}
                    >
                      Pre-market
                    </button>
                  </div>
                </div>

                {/* Major Tech Tickers Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {usStocks.map((stock) => {
                    const isUp = stock.changePct >= 0;
                    const flash = flashStates[stock.id];
                    return (
                      <div
                        key={stock.id}
                        onClick={() => setSelectedQuote(stock)}
                        className={`bg-white p-4 rounded-xl shadow-xs border border-[#F0F3FA] hover:border-[#E0E3EB] hover:shadow-md transition-all cursor-pointer group ${
                          flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-bold text-[#171b26] group-hover:text-[#0049db] transition-colors">
                            {stock.symbol}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isUp ? 'bg-[#EBF9F5] text-[#089981]' : 'bg-[#FDF0F1] text-[#F23645]'
                          }`}>
                            {isUp ? '+' : ''}{stock.changePct.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-[#6A7080] truncate">{stock.name}</p>
                        <div className="mt-3 text-lg font-bold tabular-nums text-[#171b26]">
                          ${stock.price.toFixed(2)}
                        </div>
                        <svg className={`w-full h-8 mt-2 ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`} fill="none" viewBox="0 0 80 20">
                          {isUp ? (
                            <path d="M0,18 Q20,15 35,8 T60,6 T80,2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                          ) : (
                            <path d="M0,4 Q20,8 40,12 T60,15 T80,18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                          )}
                        </svg>
                      </div>
                    );
                  })}
                </div>

                {/* 4 Column Detailed Screener Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  {/* Col 1: Highest Volume Stocks */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <h4 className="font-bold text-base text-[#171b26]">Highest volume</h4>
                        <button onClick={() => setIsScreenerOpen(true)} className="text-xs text-[#0049db] hover:underline font-semibold">
                          View all
                        </button>
                      </div>
                      <div className="flex flex-col">
                        {HIGHEST_VOLUME_STOCKS.map((item) => (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              const found = usStocks.find((s) => s.symbol === item.symbol) || {
                                id: item.symbol.toLowerCase(),
                                symbol: item.symbol,
                                name: item.name,
                                category: 'us-stocks' as const,
                                price: item.price,
                                change: (item.price * item.changePct) / 100,
                                changePct: item.changePct,
                                volume: item.volume,
                                sparkline: [15, 14, 12, 10, 8, 4]
                              };
                              setSelectedQuote(found);
                            }}
                            className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.symbol}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold tabular-nums text-[#171b26]">${item.price.toFixed(2)}</div>
                              <div className="text-[10px] font-bold text-[#089981]">
                                +{item.changePct.toFixed(2)}% • {item.volume}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsScreenerOpen(true)}
                      className="mt-3 text-center py-2 bg-[#F8F9FD] hover:bg-[#F4F6FB] rounded-xl text-xs text-[#6A7080] font-semibold transition-colors"
                    >
                      See all actively traded
                    </button>
                  </div>

                  {/* Col 2: Most Volatile Stocks */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <h4 className="font-bold text-base text-[#171b26]">Most volatile</h4>
                        <button onClick={() => setIsScreenerOpen(true)} className="text-xs text-[#0049db] hover:underline font-semibold">
                          View all
                        </button>
                      </div>
                      <div className="flex flex-col">
                        {MOST_VOLATILE_STOCKS.map((item) => {
                          const isUp = item.changePct >= 0;
                          return (
                            <div
                              key={item.symbol}
                              onClick={() => {
                                setSelectedQuote({
                                  id: item.symbol.toLowerCase(),
                                  symbol: item.symbol,
                                  name: item.name,
                                  category: 'us-stocks',
                                  price: item.price,
                                  change: (item.price * item.changePct) / 100,
                                  changePct: item.changePct,
                                  sparkline: isUp ? [10, 12, 14, 18] : [18, 14, 12, 10]
                                });
                              }}
                              className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                            >
                              <div>
                                <div className="text-xs font-bold text-[#171b26]">{item.symbol}</div>
                                <div className="text-[11px] text-[#6A7080]">{item.name}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold tabular-nums text-[#171b26]">${item.price.toFixed(2)}</div>
                                <div className={`text-[10px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                                  {isUp ? '+' : ''}{item.changePct.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsScreenerOpen(true)}
                      className="mt-3 text-center py-2 bg-[#F8F9FD] hover:bg-[#F4F6FB] rounded-xl text-xs text-[#6A7080] font-semibold transition-colors"
                    >
                      See all biggest changes
                    </button>
                  </div>

                  {/* Col 3: Stock Gainers */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <h4 className="font-bold text-base text-[#171b26]">Top gainers</h4>
                        <span className="text-[11px] font-bold text-[#089981]">Today</span>
                      </div>
                      <div className="flex flex-col">
                        {TOP_GAINERS_STOCKS.map((item) => (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              setSelectedQuote({
                                id: item.symbol.toLowerCase(),
                                symbol: item.symbol,
                                name: item.name,
                                category: 'us-stocks',
                                price: item.price,
                                change: (item.price * item.changePct) / 100,
                                changePct: item.changePct,
                                sparkline: [12, 14, 16, 20]
                              });
                            }}
                            className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.symbol}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold tabular-nums text-[#171b26]">${item.price.toFixed(2)}</div>
                              <span className="px-1.5 py-0.5 rounded bg-[#EBF9F5] text-[#089981] text-[10px] font-bold">
                                +{item.changePct.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsScreenerOpen(true)}
                      className="mt-3 text-center py-2 bg-[#F8F9FD] hover:bg-[#F4F6FB] rounded-xl text-xs text-[#6A7080] font-semibold transition-colors"
                    >
                      See all daily gainers
                    </button>
                  </div>

                  {/* Col 4: Earnings Calendar Preview */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3">
                        <h4 className="font-bold text-base text-[#171b26]">Earnings today</h4>
                        <span className="material-symbols-outlined text-[#6A7080] text-[20px]">calendar_today</span>
                      </div>
                      <div className="flex flex-col">
                        {EARNINGS_TODAY.map((item) => (
                          <div
                            key={item.symbol}
                            className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.symbol}</div>
                              <div className="text-[11px] text-[#6A7080] truncate w-24">{item.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-[#171b26] font-medium">Est: {item.est}</div>
                              <div className={`text-[10px] font-bold ${item.status === 'beat' ? 'text-[#089981]' : 'text-[#B2B5BE]'}`}>
                                {item.status === 'beat' ? `Act: ${item.act}` : item.act}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsScreenerOpen(true)}
                      className="mt-3 text-center py-2 bg-[#F8F9FD] hover:bg-[#F4F6FB] rounded-xl text-xs text-[#6A7080] font-semibold transition-colors"
                    >
                      See full earnings calendar
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 3. CRYPTO SECTION */}
            {settings.sections.crypto && (
              <section className="flex flex-col gap-6" id="crypto">
                <div className="flex items-baseline justify-between">
                  <a
                    href="#crypto"
                    onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                    className="group flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[#171b26] hover:text-[#0049db] transition-colors"
                  >
                    Crypto
                    <span className="material-symbols-outlined text-[24px] text-[#6A7080] group-hover:translate-x-1 group-hover:text-[#0049db] transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#6A7080]">24h Vol: <strong className="text-[#171b26]">$148.2B</strong></span>
                    <span className="text-[#6A7080]">BTC Dom: <strong className="text-[#171b26]">58.4%</strong></span>
                  </div>
                </div>

                {/* Top Coins Bento Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cryptoCoins.map((coin) => {
                    const isUp = coin.changePct >= 0;
                    const flash = flashStates[coin.id];
                    return (
                      <div
                        key={coin.id}
                        onClick={() => setSelectedQuote(coin)}
                        className={`bg-white p-5 rounded-2xl shadow-xs hover:shadow-md border border-[#F0F3FA] hover:border-[#E0E3EB] transition-all flex flex-col justify-between group cursor-pointer ${
                          flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm text-white"
                              style={{ backgroundColor: coin.badgeColor }}
                            >
                              {coin.badgeText}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-[#171b26] group-hover:text-[#0049db] transition-colors">
                                {coin.symbol}
                              </h3>
                              <span className="text-xs text-[#6A7080]">{coin.name}</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-[#EBF9F5] text-[#089981] text-xs font-semibold">
                            ▲ +{coin.changePct.toFixed(2)}%
                          </span>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <div className="text-xl font-bold tabular-nums text-[#171b26]">
                              ${coin.price.toLocaleString(undefined, { minimumFractionDigits: coin.price > 100 ? 2 : 3 })}
                            </div>
                            <div className="text-xs text-[#6A7080]">Cap: {coin.marketCap}</div>
                          </div>
                          <svg className="w-28 h-8 text-[#089981]" fill="none" viewBox="0 0 70 20">
                            <path d="M0,18 Q15,16 30,10 T55,6 T70,2" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3 Column Crypto Ranking Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Col 1: Market Cap Ranking */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-bold text-base text-[#171b26]">Market cap ranking</h4>
                      <button onClick={() => setIsScreenerOpen(true)} className="text-xs text-[#0049db] hover:underline font-semibold">
                        Full list
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {CRYPTO_MARKET_CAP_RANKING.map((item) => (
                        <div
                          key={item.rank}
                          onClick={() => {
                            const found = cryptoCoins.find((c) => c.symbol.toLowerCase() === item.name.toLowerCase()) || {
                              id: item.symbol.toLowerCase(),
                              symbol: item.name,
                              name: item.symbol,
                              category: 'crypto' as const,
                              price: 100,
                              change: 2,
                              changePct: item.changePct,
                              marketCap: item.mcap,
                              sparkline: [10, 12, 15, 18]
                            };
                            setSelectedQuote(found);
                          }}
                          className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#B2B5BE] font-bold">{item.rank}</span>
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.name}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold tabular-nums text-[#171b26]">{item.mcap}</div>
                            <div className={`text-[10px] font-bold ${item.changePct >= 0 ? 'text-[#089981]' : 'text-[#6A7080]'}`}>
                              {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Col 2: TVL Ranking (DeFi) */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-bold text-base text-[#171b26]">TVL ranking (DeFi)</h4>
                      <button onClick={() => setIsScreenerOpen(true)} className="text-xs text-[#0049db] hover:underline font-semibold">
                        View protocols
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {CRYPTO_TVL_RANKING.map((item) => (
                        <div
                          key={item.rank}
                          onClick={() => {
                            setSelectedQuote({
                              id: item.symbol.toLowerCase(),
                              symbol: item.name,
                              name: item.symbol,
                              category: 'crypto',
                              price: 15.20,
                              change: 0.60,
                              changePct: item.changePct,
                              sparkline: [12, 14, 15, 18]
                            });
                          }}
                          className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#B2B5BE] font-bold">{item.rank}</span>
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.name}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold tabular-nums text-[#171b26]">{item.tvl}</div>
                            <div className="text-[10px] font-bold text-[#089981]">
                              +{item.changePct.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Col 3: Movers (24h) */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-bold text-base text-[#171b26]">Movers (24h)</h4>
                      <span className="text-[10px] text-[#6A7080]">Volume &gt; $10M</span>
                    </div>
                    <div className="flex flex-col">
                      {CRYPTO_MOVERS.map((item) => {
                        const isUp = item.changePct >= 0;
                        return (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              setSelectedQuote({
                                id: item.symbol.toLowerCase(),
                                symbol: item.name,
                                name: item.symbol,
                                category: 'crypto',
                                price: 28.50,
                                change: (28.50 * item.changePct) / 100,
                                changePct: item.changePct,
                                sparkline: isUp ? [10, 12, 15, 19] : [19, 15, 12, 10]
                              });
                            }}
                            className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.name}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.symbol}</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isUp ? 'bg-[#EBF9F5] text-[#089981]' : 'bg-[#FDF0F1] text-[#F23645]'
                            }`}>
                              {isUp ? '+' : ''}{item.changePct.toFixed(2)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 4. FUTURES & COMMODITIES */}
            {settings.sections.futures && (
              <section className="flex flex-col gap-6" id="futures">
                <div className="flex items-baseline justify-between">
                  <a
                    href="#futures"
                    onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                    className="group flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[#171b26] hover:text-[#0049db] transition-colors"
                  >
                    Futures and commodities
                    <span className="material-symbols-outlined text-[24px] text-[#6A7080] group-hover:translate-x-1 group-hover:text-[#0049db] transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <button onClick={() => setIsScreenerOpen(true)} className="text-xs font-semibold text-[#0049db] hover:underline">
                    See full commodities board
                  </button>
                </div>

                {/* Primary Commodity Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {commodities.map((comm) => {
                    const isUp = comm.changePct >= 0;
                    return (
                      <div
                        key={comm.id}
                        onClick={() => setSelectedQuote(comm)}
                        className="bg-white p-4 rounded-xl shadow-xs border border-[#F0F3FA] hover:border-[#E0E3EB] hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-[#171b26] group-hover:text-[#0049db] transition-colors">
                            {comm.symbol}
                          </span>
                          <span className={`text-[10px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                            {isUp ? '+' : ''}{comm.changePct.toFixed(2)}%
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6A7080] block truncate">{comm.name}</span>
                        <div className="mt-3 text-lg font-bold tabular-nums text-[#171b26]">
                          ${comm.price.toLocaleString(undefined, { minimumFractionDigits: comm.price > 10 ? 2 : 3 })}
                        </div>
                        <span className="text-[11px] text-[#6A7080]">{comm.suffix}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Futures Breakdown Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Energy */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-bold text-base text-[#171b26]">Energy futures</h4>
                      <button onClick={() => setIsScreenerOpen(true)} className="text-xs text-[#0049db] hover:underline font-semibold">
                        View all
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {ENERGY_FUTURES.map((item) => {
                        const isUp = item.changePct >= 0;
                        return (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              setSelectedQuote({
                                id: item.symbol.toLowerCase(),
                                symbol: item.name,
                                name: item.symbol,
                                category: 'futures',
                                price: item.price,
                                change: (item.price * item.changePct) / 100,
                                changePct: item.changePct,
                                sparkline: isUp ? [10, 12, 15] : [15, 12, 10]
                              });
                            }}
                            className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.name}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold tabular-nums text-[#171b26]">
                                ${item.price.toFixed(item.price > 10 ? 2 : 3)}
                              </div>
                              <div className={`text-[10px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                                {isUp ? '+' : ''}{item.changePct.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Agricultural */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-bold text-base text-[#171b26]">Agricultural</h4>
                      <button onClick={() => setIsScreenerOpen(true)} className="text-xs text-[#0049db] hover:underline font-semibold">
                        View all
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {AGRICULTURAL_FUTURES.map((item) => {
                        const isUp = item.changePct >= 0;
                        return (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              setSelectedQuote({
                                id: item.symbol.toLowerCase(),
                                symbol: item.name,
                                name: item.symbol,
                                category: 'futures',
                                price: item.price,
                                change: (item.price * item.changePct) / 100,
                                changePct: item.changePct,
                                sparkline: [12, 14, 16]
                              });
                            }}
                            className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.name}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold tabular-nums text-[#171b26]">${item.price.toFixed(2)}</div>
                              <div className={`text-[10px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                                {isUp ? '+' : ''}{item.changePct.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Index Futures */}
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-bold text-base text-[#171b26]">Index futures</h4>
                      <button onClick={() => setIsScreenerOpen(true)} className="text-xs text-[#0049db] hover:underline font-semibold">
                        View all
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {INDEX_FUTURES.map((item) => {
                        const isUp = item.changePct >= 0;
                        return (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              setSelectedQuote({
                                id: item.symbol.toLowerCase(),
                                symbol: item.name,
                                name: item.symbol,
                                category: 'futures',
                                price: item.price,
                                change: (item.price * item.changePct) / 100,
                                changePct: item.changePct,
                                sparkline: [12, 14, 16]
                              });
                            }}
                            className="flex items-center justify-between py-2 hover:bg-[#F8F9FD] px-2 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#171b26]">{item.name}</div>
                              <div className="text-[11px] text-[#6A7080]">{item.symbol}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold tabular-nums text-[#171b26]">
                                {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              <div className={`text-[10px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                                {isUp ? '+' : ''}{item.changePct.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 5. FOREX & CURRENCIES */}
            {settings.sections.forex && (
              <section className="flex flex-col gap-6" id="forex">
                <div className="flex items-baseline justify-between">
                  <a
                    href="#forex"
                    onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                    className="group flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[#171b26] hover:text-[#0049db] transition-colors"
                  >
                    Forex and currencies
                    <span className="material-symbols-outlined text-[24px] text-[#6A7080] group-hover:translate-x-1 group-hover:text-[#0049db] transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#6A7080]">USD Index (DXY):</span>
                    <span className="font-bold tabular-nums text-sm text-[#171b26]">106.82</span>
                    <span className="text-[#089981] font-bold">+0.14%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {forexPairs.map((pair) => {
                    const isUp = pair.changePct >= 0;
                    return (
                      <div
                        key={pair.id}
                        onClick={() => setSelectedQuote(pair)}
                        className="bg-white p-4 rounded-xl shadow-xs border border-[#F0F3FA] hover:border-[#E0E3EB] hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-[#171b26] group-hover:text-[#0049db] transition-colors">
                            {pair.symbol}
                          </span>
                          <span className={`text-[10px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                            {isUp ? '+' : ''}{pair.changePct.toFixed(2)}%
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6A7080] block truncate">{pair.name}</span>
                        <div className="mt-3 text-lg font-bold tabular-nums text-[#171b26]">
                          {pair.price.toFixed(4)}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[#B2B5BE] text-[10px] font-mono tabular-nums">
                          <span>Bid: {pair.bid?.toFixed(4)}</span>
                          <span>Ask: {pair.ask?.toFixed(4)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 6. BONDS & SOVEREIGN YIELDS */}
            {settings.sections.bonds && (
              <section className="flex flex-col gap-6" id="bonds">
                <div className="flex items-baseline justify-between">
                  <a
                    href="#bonds"
                    onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                    className="group flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[#171b26] hover:text-[#0049db] transition-colors"
                  >
                    Bonds &amp; Sovereign Yields
                    <span className="material-symbols-outlined text-[24px] text-[#6A7080] group-hover:translate-x-1 group-hover:text-[#0049db] transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <button onClick={() => setIsScreenerOpen(true)} className="text-xs font-semibold text-[#0049db] hover:underline">
                    Interactive Yield Curves
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* US Treasury Yields */}
                  <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-4">
                      <h4 className="font-bold text-base text-[#171b26]">US Treasury Yields</h4>
                      <span className="text-[10px] font-bold text-[#6A7080] uppercase">Benchmark</span>
                    </div>
                    <div className="flex flex-col">
                      {US_TREASURY_YIELDS.map((item) => (
                        <div
                          key={item.maturity}
                          onClick={() => {
                            setSelectedQuote({
                              id: item.maturity.toLowerCase().replace(/[^a-z0-9]/g, ''),
                              symbol: item.maturity,
                              name: 'US Sovereign Debt Benchmark',
                              category: 'bonds',
                              price: parseFloat(item.yield),
                              change: parseFloat(item.change),
                              changePct: parseFloat(item.change),
                              suffix: '% Yield',
                              sparkline: [4.9, 5.0, 5.1, 5.2]
                            });
                          }}
                          className={`flex items-center justify-between py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                            item.isHighlighted
                              ? 'bg-[#F8F9FD] text-[#0049db]'
                              : 'hover:bg-[#F8F9FD] text-[#171b26]'
                          }`}
                        >
                          <span className={`text-xs ${item.isHighlighted ? 'font-bold text-[#0049db]' : 'font-semibold'}`}>
                            {item.maturity}
                          </span>
                          <div className="text-right">
                            <span className={`text-xs font-bold tabular-nums ${item.isHighlighted ? 'text-[#0049db]' : ''}`}>
                              {item.yield}
                            </span>
                            <span className="text-[#F23645] text-[10px] font-bold ml-2">
                              {item.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Global 10Y Benchmark */}
                  <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#F0F3FA]">
                    <div className="flex items-center justify-between pb-4">
                      <h4 className="font-bold text-base text-[#171b26]">Global 10Y Benchmark</h4>
                      <span className="text-[10px] font-bold text-[#6A7080] uppercase">Sovereign Debt</span>
                    </div>
                    <div className="flex flex-col">
                      {GLOBAL_10Y_BENCHMARK.map((item) => (
                        <div
                          key={item.country}
                          onClick={() => {
                            setSelectedQuote({
                              id: item.country.toLowerCase().replace(/[^a-z0-9]/g, ''),
                              symbol: `${item.country} 10Y`,
                              name: 'Sovereign 10-Year Benchmark Yield',
                              category: 'bonds',
                              flag: item.flag,
                              price: parseFloat(item.yield),
                              change: -0.02,
                              changePct: -0.4,
                              suffix: '% Yield',
                              sparkline: [4.2, 4.3, 4.4]
                            });
                          }}
                          className="flex items-center justify-between py-2.5 px-2 hover:bg-[#F8F9FD] rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[18px]">{item.flag}</span>
                            <span className="text-xs font-semibold text-[#171b26]">{item.country}</span>
                          </div>
                          <span className="text-xs font-bold tabular-nums text-[#171b26]">{item.yield}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Corporate Bonds Highlights */}
                  <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#F0F3FA]" id="corporate-bonds">
                    <div className="flex items-center justify-between pb-4">
                      <h4 className="font-bold text-base text-[#171b26]">Corporate Bonds</h4>
                      <span className="text-[10px] font-bold text-[#6A7080] uppercase">Fixed &amp; Floating</span>
                    </div>
                    <div className="flex flex-col">
                      {CORPORATE_BONDS.map((bond) => (
                        <div
                          key={bond.name}
                          onClick={() => {
                            setSelectedQuote({
                              id: bond.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
                              symbol: bond.name,
                              name: bond.sub,
                              category: 'bonds',
                              price: 100,
                              change: 0.15,
                              changePct: 0.15,
                              suffix: bond.badge,
                              sparkline: [98, 99, 100]
                            });
                          }}
                          className="flex items-center justify-between py-2.5 px-2 hover:bg-[#F8F9FD] rounded-lg cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="text-xs font-bold text-[#171b26]">{bond.name}</div>
                            <div className="text-[11px] text-[#6A7080]">{bond.sub}</div>
                          </div>
                          <span className="px-2 py-1 rounded bg-[#F8F9FD] text-[#171b26] text-[10px] font-bold border border-[#E0E3EB]">
                            {bond.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 7. ETFS & MACRO ECONOMY */}
            {settings.sections.etfs && (
              <section className="flex flex-col gap-6" id="etfs">
                <div className="flex items-baseline justify-between">
                  <a
                    href="#etfs"
                    onClick={(e) => { e.preventDefault(); setIsScreenerOpen(true); }}
                    className="group flex items-center gap-2 text-2xl sm:text-3xl font-bold text-[#171b26] hover:text-[#0049db] transition-colors"
                  >
                    ETFs and World Economy
                    <span className="material-symbols-outlined text-[24px] text-[#6A7080] group-hover:translate-x-1 group-hover:text-[#0049db] transition-transform">
                      chevron_right
                    </span>
                  </a>
                  <span className="text-xs font-semibold text-[#6A7080]">Global Tracking</span>
                </div>

                {/* ETFs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {etfs.map((etf) => {
                    const isUp = etf.changePct >= 0;
                    return (
                      <div
                        key={etf.id}
                        onClick={() => setSelectedQuote(etf)}
                        className="bg-white p-4 rounded-xl shadow-xs border border-[#F0F3FA] hover:border-[#E0E3EB] hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-[#171b26] group-hover:text-[#0049db] transition-colors">
                            {etf.symbol}
                          </span>
                          <span className="text-[10px] font-bold text-[#089981]">+{etf.changePct.toFixed(2)}%</span>
                        </div>
                        <span className="text-xs text-[#6A7080] truncate block">{etf.name}</span>
                        <div className="mt-2 text-lg font-bold tabular-nums text-[#171b26]">${etf.price.toFixed(2)}</div>
                        <div className="mt-2 text-[#B2B5BE] text-[11px] truncate">{etf.notes}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Macro Economic Table Snapshot */}
                {settings.sections.economy && (
                  <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#F0F3FA] flex flex-col gap-4" id="economy">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base text-[#171b26]">Economic indicators snapshot</h4>
                        <span className="text-xs text-[#6A7080]">Key sovereign macroeconomic fundamentals</span>
                      </div>
                      <button onClick={() => setIsScreenerOpen(true)} className="text-xs font-semibold text-[#0049db] hover:underline">
                        Full Heatmap
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-[#6A7080] font-bold uppercase tracking-wider text-[11px] border-b border-[#F0F3FA]">
                            <th className="pb-3 px-2">Country</th>
                            <th className="pb-3 px-2">GDP (Nominal)</th>
                            <th className="pb-3 px-2">GDP Growth</th>
                            <th className="pb-3 px-2">Interest Rate</th>
                            <th className="pb-3 px-2">Inflation Rate</th>
                            <th className="pb-3 px-2">Unemployment</th>
                            <th className="pb-3 px-2">Debt to GDP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0F3FA] text-[#171b26]">
                          {ECONOMIC_INDICATORS.map((ind) => {
                            const isPositiveGrowth = ind.gdpGrowth >= 0;
                            return (
                              <tr key={ind.country} className="hover:bg-[#F8F9FD] transition-colors cursor-pointer">
                                <td className="py-3 px-2 font-bold flex items-center gap-2">
                                  <span className="text-base">{ind.flag}</span> {ind.country}
                                </td>
                                <td className="py-3 px-2 font-bold tabular-nums">{ind.gdpNominal}</td>
                                <td className={`py-3 px-2 font-bold tabular-nums ${isPositiveGrowth ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                                  {isPositiveGrowth ? '+' : ''}{ind.gdpGrowth.toFixed(1)}%
                                </td>
                                <td className="py-3 px-2 font-semibold tabular-nums">{ind.interestRate.toFixed(2)}%</td>
                                <td className="py-3 px-2 font-semibold tabular-nums">{ind.inflationRate.toFixed(1)}%</td>
                                <td className="py-3 px-2 font-semibold tabular-nums">{ind.unemployment.toFixed(1)}%</td>
                                <td className={`py-3 px-2 font-bold tabular-nums ${ind.debtToGdp > 100 ? 'text-[#F23645]' : 'text-[#089981]'}`}>
                                  {ind.debtToGdp.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* BOTTOM INSTITUTIONAL BANNER */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#F0F3FA] flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">query_stats</span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#171b26]">Explore Pine Script® &amp; Real-Time Screeners</h4>
                  <p className="text-xs text-[#6A7080]">Backtest automated strategies across 1,300,000+ financial instruments.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    // Open Supercharts with the first stock (NVDA)
                    setSelectedQuote(usStocks[0]);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#131722] text-white font-medium text-xs hover:bg-black transition-colors active:scale-95 shadow-xs"
                >
                  Open Supercharts
                </button>
                <button
                  onClick={() => setIsScreenerOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#F8F9FD] hover:bg-[#F4F6FB] font-medium text-xs text-[#171b26] transition-colors border border-[#E0E3EB] active:scale-95"
                >
                  Launch Screener
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-[#F0F3FA] py-8">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6A7080]">
          <div className="flex items-center gap-2">
            <span>© 2024 TradingView, Inc. All financial data provided for reference.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#171b26] transition-colors">
              Terms of Service
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#171b26] transition-colors">
              Privacy Policy
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#171b26] transition-colors">
              Disclaimers
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#171b26] transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      {/* 1. Supercharts Detail Modal */}
      {selectedQuote && (
        <InteractiveChartModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          isBookmarked={isBookmarked(selectedQuote.id)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* 2. Quick Search (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allInstruments={allInstruments}
        onSelectInstrument={(item) => setSelectedQuote(item)}
      />

      {/* 3. Customize View Modal */}
      <CustomizeViewModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onReset={() => setSettings(DEFAULT_SETTINGS)}
      />

      {/* 4. Watchlist Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onRemove={(id) => setWatchlist((prev) => prev.filter((item) => item.id !== id))}
        onSelect={(quote) => setSelectedQuote(quote)}
      />

      {/* 5. Screener Modal */}
      <ScreenerModal
        isOpen={isScreenerOpen}
        onClose={() => setIsScreenerOpen(false)}
        instruments={allInstruments}
        onSelectInstrument={(quote) => setSelectedQuote(quote)}
      />
    </div>
  );
}
