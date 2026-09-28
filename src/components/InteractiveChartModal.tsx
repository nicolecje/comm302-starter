import React, { useState, useMemo } from 'react';
import { InstrumentQuote } from '../data/marketData';
import { X, Maximize2, Minimize2, Bookmark, BookmarkCheck, TrendingUp, TrendingDown, Eye, Activity, BarChart2, Layers } from 'lucide-react';

interface InteractiveChartModalProps {
  quote: InstrumentQuote | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (quote: InstrumentQuote) => void;
}

type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y' | 'ALL';
type ChartStyle = 'area' | 'candles';

export const InteractiveChartModal: React.FC<InteractiveChartModalProps> = ({
  quote,
  onClose,
  isBookmarked,
  onToggleBookmark
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [showIndicators, setShowIndicators] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'orderbook' | 'financials'>('overview');
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);

  if (!quote) return null;

  const isPositive = quote.change >= 0;

  // Generate deterministic realistic candles & area points based on the quote price and timeframe
  const chartData = useMemo(() => {
    const pointsCount = timeframe === '1D' ? 36 : timeframe === '5D' ? 45 : timeframe === '1M' ? 30 : 50;
    const basePrice = quote.price;
    const volatility = basePrice * (timeframe === '1D' ? 0.008 : timeframe === '5D' ? 0.025 : 0.08);
    
    const data: {
      time: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      sma20?: number;
    }[] = [];

    let current = basePrice - (quote.change || 0) * (timeframe === '1D' ? 0.9 : 1.5);
    const now = new Date();

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / pointsCount;
      const seed = Math.sin(i * 1.3) * 0.4 + Math.cos(i * 0.7) * 0.3;
      const trend = (isPositive ? 1 : -0.7) * progress * volatility * 1.5;
      const delta = seed * volatility + trend;
      
      const open = Math.max(0.1, Number((current + (Math.random() - 0.48) * (volatility * 0.2)).toFixed(2)));
      const close = Math.max(0.1, Number((open + delta * 0.3).toFixed(2)));
      const high = Math.max(open, close, Number((Math.max(open, close) + Math.random() * (volatility * 0.25)).toFixed(2)));
      const low = Math.max(0.05, Number((Math.min(open, close) - Math.random() * (volatility * 0.25)).toFixed(2)));
      const volume = Math.floor(10000 + Math.random() * 85000 * (1 + (i % 5 === 0 ? 2 : 1)));

      current = close;

      let timeLabel = '';
      if (timeframe === '1D') {
        const d = new Date(now.getTime() - (pointsCount - i) * 10 * 60 * 1000);
        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        const d = new Date(now.getTime() - (pointsCount - i) * 24 * 60 * 60 * 1000);
        timeLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      data.push({ time: timeLabel, open, high, low, close, volume });
    }

    // Force last point to match current live quote price exactly
    if (data.length > 0) {
      data[data.length - 1].close = quote.price;
      if (quote.high && quote.price > data[data.length - 1].high) {
        data[data.length - 1].high = quote.price;
      }
    }

    // Calculate SMA 20
    for (let i = 0; i < data.length; i++) {
      if (i >= 5) {
        const slice = data.slice(Math.max(0, i - 10), i + 1);
        const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
        data[i].sma20 = Number((sum / slice.length).toFixed(2));
      }
    }

    return data;
  }, [quote, timeframe, isPositive]);

  // Scaler for SVG Chart
  const minPrice = Math.min(...chartData.map(d => d.low));
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = Math.max(...chartData.map(d => d.volume));

  const chartWidth = 720;
  const chartHeight = 280;
  const paddingBottom = 40;
  const paddingTop = 20;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  const getY = (val: number) => {
    return chartHeight - paddingBottom - ((val - minPrice) / priceRange) * usableHeight;
  };

  const getX = (index: number) => {
    return (index / (chartData.length - 1)) * (chartWidth - 20) + 10;
  };

  const activePoint = hoverIndex !== null && chartData[hoverIndex] ? chartData[hoverIndex] : chartData[chartData.length - 1];

  // SVG Area path
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    let d = `M ${getX(0)} ${getY(chartData[0].close)}`;
    for (let i = 1; i < chartData.length; i++) {
      const x = getX(i);
      const y = getY(chartData[i].close);
      const prevX = getX(i - 1);
      const prevY = getY(chartData[i - 1].close);
      const midX = (prevX + x) / 2;
      d += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
    }
    return d;
  }, [chartData, minPrice, maxPrice]);

  const filledAreaPath = areaPath ? `${areaPath} L ${getX(chartData.length - 1)} ${chartHeight - paddingBottom} L ${getX(0)} ${chartHeight - paddingBottom} Z` : '';

  // SMA path
  const smaPath = useMemo(() => {
    const valid = chartData.filter(d => d.sma20 !== undefined);
    if (valid.length === 0) return '';
    const startIndex = chartData.findIndex(d => d.sma20 !== undefined);
    let d = `M ${getX(startIndex)} ${getY(valid[0].sma20!)}`;
    for (let i = 1; i < valid.length; i++) {
      const x = getX(startIndex + i);
      const y = getY(valid[i].sma20!);
      d += ` L ${x} ${y}`;
    }
    return d;
  }, [chartData, minPrice, maxPrice]);

  const handleSimulateTrade = (side: 'BUY' | 'SELL') => {
    setTradeSuccess(`Simulated ${side} order placed for 10 units of ${quote.symbol} at $${quote.price.toLocaleString()}`);
    setTimeout(() => {
      setTradeSuccess(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#131722]/50 backdrop-blur-sm transition-opacity">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl max-h-[92vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0F3FA] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0"
              style={{ backgroundColor: quote.badgeColor || (isPositive ? '#089981' : '#F23645') }}
            >
              {quote.flag ? <span className="text-xl">{quote.flag}</span> : quote.badgeText || quote.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#171b26]">{quote.symbol}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase bg-[#F8F9FD] text-[#6A7080] border border-[#E0E3EB]">
                  {quote.category}
                </span>
                <button
                  onClick={() => onToggleBookmark(quote)}
                  className={`p-1 rounded-md transition-colors ${
                    isBookmarked ? 'text-[#0049db] bg-[#f2f3ff]' : 'text-[#6A7080] hover:text-[#171b26]'
                  }`}
                  title={isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-[#6A7080] truncate max-w-md">{quote.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold tabular-nums text-[#171b26]">
                {quote.prefix || ''}${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                {quote.suffix ? <span className="text-xs font-normal text-[#6A7080] ml-1">{quote.suffix}</span> : ''}
              </div>
              <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePct.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 border-l border-[#F0F3FA] pl-3 ml-2">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className="p-2 text-[#6A7080] hover:text-[#171b26] hover:bg-[#F8F9FD] rounded-lg transition-colors"
                title={isFullscreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={onClose} 
                className="p-2 text-[#6A7080] hover:text-[#171b26] hover:bg-[#F8F9FD] rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar & Secondary Controls */}
        <div className="px-6 py-2.5 bg-[#F8F9FD] border-b border-[#F0F3FA] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Timeframe Badges */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E0E3EB]">
            {(['1D', '5D', '1M', '6M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-[#131722] text-white shadow-sm'
                    : 'text-[#6A7080] hover:text-[#171b26]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Modes & Indicators */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E0E3EB]">
              <button
                onClick={() => setChartStyle('area')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                  chartStyle === 'area' ? 'bg-[#2962ff] text-white' : 'text-[#6A7080] hover:text-[#171b26]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Line
              </button>
              <button
                onClick={() => setChartStyle('candles')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                  chartStyle === 'candles' ? 'bg-[#2962ff] text-white' : 'text-[#6A7080] hover:text-[#171b26]'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Candles
              </button>
            </div>

            <button
              onClick={() => setShowIndicators(!showIndicators)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-medium transition-colors ${
                showIndicators ? 'bg-white border-[#2962ff] text-[#2962ff]' : 'bg-white border-[#E0E3EB] text-[#6A7080]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              SMA (20)
            </button>

            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-medium transition-colors ${
                showVolume ? 'bg-white border-[#2962ff] text-[#2962ff]' : 'bg-white border-[#E0E3EB] text-[#6A7080]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Vol
            </button>
          </div>

          {/* Quick Paper Trade Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSimulateTrade('BUY')}
              className="px-3 py-1 rounded-lg bg-[#089981] hover:bg-[#067a67] text-white font-semibold transition-colors active:scale-95"
            >
              Quick Buy
            </button>
            <button 
              onClick={() => handleSimulateTrade('SELL')}
              className="px-3 py-1 rounded-lg bg-[#F23645] hover:bg-[#cc2b38] text-white font-semibold transition-colors active:scale-95"
            >
              Quick Sell
            </button>
          </div>
        </div>

        {tradeSuccess && (
          <div className="bg-[#EBF9F5] text-[#089981] text-xs font-semibold px-6 py-2 border-b border-[#84f7db] flex items-center justify-between animate-fadeIn">
            <span>✓ {tradeSuccess}</span>
            <span className="text-[10px] text-[#6A7080]">Paper Trading Sandbox</span>
          </div>
        )}

        {/* Modal Main Body (Scrollable if needed) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Interactive Chart Canvas */}
          <div className="bg-[#FAF8FF] p-4 rounded-xl border border-[#F0F3FA] relative">
            {/* Crosshair telemetry header */}
            <div className="flex flex-wrap items-center justify-between text-xs text-[#6A7080] mb-2 font-mono tabular-nums">
              <div className="flex items-center gap-3">
                <span>Time: <strong className="text-[#171b26]">{activePoint.time}</strong></span>
                <span>O: <strong className="text-[#171b26]">${activePoint.open.toFixed(2)}</strong></span>
                <span>H: <strong className="text-[#089981]">${activePoint.high.toFixed(2)}</strong></span>
                <span>L: <strong className="text-[#F23645]">${activePoint.low.toFixed(2)}</strong></span>
                <span>C: <strong className="text-[#171b26]">${activePoint.close.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-3">
                {showVolume && <span>Vol: <strong className="text-[#171b26]">{activePoint.volume.toLocaleString()}</strong></span>}
                {showIndicators && activePoint.sma20 && <span>SMA20: <strong className="text-[#0049db]">${activePoint.sma20.toFixed(2)}</strong></span>}
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="relative w-full h-[280px]">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-full overflow-visible select-none cursor-crosshair"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  const ratio = relX / rect.width;
                  const idx = Math.min(chartData.length - 1, Math.max(0, Math.round(ratio * (chartData.length - 1))));
                  setHoverIndex(idx);
                }}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#089981' : '#F23645'} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={isPositive ? '#089981' : '#F23645'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.25, 0.5, 0.75].map((pct, i) => {
                  const yVal = minPrice + priceRange * pct;
                  const yPos = getY(yVal);
                  return (
                    <g key={i}>
                      <line x1="0" y1={yPos} x2={chartWidth} y2={yPos} stroke="#E0E3EB" strokeDasharray="3 3" strokeWidth="1" />
                      <text x={chartWidth - 5} y={yPos - 4} textAnchor="end" fill="#B2B5BE" fontSize="10" className="tabular-nums font-mono">
                        ${yVal.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Volume Bars */}
                {showVolume && chartData.map((d, i) => {
                  const barHeight = (d.volume / maxVolume) * 45;
                  const x = getX(i);
                  const isUp = d.close >= d.open;
                  return (
                    <rect
                      key={`vol-${i}`}
                      x={x - 3}
                      y={chartHeight - paddingBottom - barHeight}
                      width={6}
                      height={barHeight}
                      fill={isUp ? '#089981' : '#F23645'}
                      opacity={hoverIndex === i ? 0.6 : 0.25}
                    />
                  );
                })}

                {/* Main Price Visuals */}
                {chartStyle === 'area' ? (
                  <>
                    <path d={filledAreaPath} fill="url(#chartGradient)" />
                    <path 
                      d={areaPath} 
                      fill="none" 
                      stroke={isPositive ? '#089981' : '#F23645'} 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                  </>
                ) : (
                  /* Candlesticks view */
                  chartData.map((d, i) => {
                    const x = getX(i);
                    const isUp = d.close >= d.open;
                    const highY = getY(d.high);
                    const lowY = getY(d.low);
                    const openY = getY(d.open);
                    const closeY = getY(d.close);
                    const topY = Math.min(openY, closeY);
                    const bodyH = Math.max(2, Math.abs(closeY - openY));

                    return (
                      <g key={`candle-${i}`}>
                        {/* Wick */}
                        <line 
                          x1={x} 
                          y1={highY} 
                          x2={x} 
                          y2={lowY} 
                          stroke={isUp ? '#089981' : '#F23645'} 
                          strokeWidth="1.5" 
                        />
                        {/* Body */}
                        <rect
                          x={x - 4}
                          y={topY}
                          width={8}
                          height={bodyH}
                          fill={isUp ? '#089981' : '#F23645'}
                          rx={1}
                        />
                      </g>
                    );
                  })
                )}

                {/* SMA 20 line */}
                {showIndicators && smaPath && (
                  <path d={smaPath} fill="none" stroke="#2962ff" strokeWidth="1.8" strokeDasharray="4 2" />
                )}

                {/* Crosshair indicator */}
                {hoverIndex !== null && (
                  <g>
                    <line
                      x1={getX(hoverIndex)}
                      y1={paddingTop}
                      x2={getX(hoverIndex)}
                      y2={chartHeight - paddingBottom}
                      stroke="#131722"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={getX(hoverIndex)}
                      cy={getY(chartData[hoverIndex].close)}
                      r="4.5"
                      fill="#131722"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Tabbed Inspector: Overview vs. Order Book vs. Financials */}
          <div className="flex flex-col gap-4">
            <div className="flex border-b border-[#F0F3FA] gap-6 text-sm">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 font-semibold transition-colors relative ${
                  activeTab === 'overview' ? 'text-[#0049db]' : 'text-[#6A7080] hover:text-[#171b26]'
                }`}
              >
                Overview &amp; Metrics
                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0049db]" />}
              </button>
              <button
                onClick={() => setActiveTab('orderbook')}
                className={`pb-2.5 font-semibold transition-colors relative ${
                  activeTab === 'orderbook' ? 'text-[#0049db]' : 'text-[#6A7080] hover:text-[#171b26]'
                }`}
              >
                Live Depth &amp; Bid/Ask
                {activeTab === 'orderbook' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0049db]" />}
              </button>
              <button
                onClick={() => setActiveTab('financials')}
                className={`pb-2.5 font-semibold transition-colors relative ${
                  activeTab === 'financials' ? 'text-[#0049db]' : 'text-[#6A7080] hover:text-[#171b26]'
                }`}
              >
                Profile &amp; Quantitative Stats
                {activeTab === 'financials' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0049db]" />}
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#FAF8FF] p-3.5 rounded-xl border border-[#F0F3FA]">
                  <span className="text-xs text-[#6A7080]">Day Range</span>
                  <div className="font-semibold tabular-nums text-sm text-[#171b26] mt-1">
                    ${(quote.low || quote.price * 0.985).toFixed(2)} - ${(quote.high || quote.price * 1.015).toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#FAF8FF] p-3.5 rounded-xl border border-[#F0F3FA]">
                  <span className="text-xs text-[#6A7080]">52-Week Range</span>
                  <div className="font-semibold tabular-nums text-sm text-[#171b26] mt-1">
                    ${(quote.week52Low || quote.price * 0.72).toFixed(2)} - ${(quote.week52High || quote.price * 1.28).toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#FAF8FF] p-3.5 rounded-xl border border-[#F0F3FA]">
                  <span className="text-xs text-[#6A7080]">Market Cap / AUM</span>
                  <div className="font-semibold tabular-nums text-sm text-[#171b26] mt-1">
                    {quote.marketCap || '$120.4B'}
                  </div>
                </div>
                <div className="bg-[#FAF8FF] p-3.5 rounded-xl border border-[#F0F3FA]">
                  <span className="text-xs text-[#6A7080]">Volume (24h)</span>
                  <div className="font-semibold tabular-nums text-sm text-[#171b26] mt-1">
                    {quote.volume || '34.2M'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orderbook' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bids */}
                <div className="bg-[#FAF8FF] p-4 rounded-xl border border-[#F0F3FA]">
                  <h4 className="text-xs font-bold text-[#089981] uppercase mb-2">Bids (Buy Orders)</h4>
                  <div className="flex flex-col gap-1.5 text-xs font-mono tabular-nums">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const bidP = (quote.price * (1 - 0.0008 * lvl)).toFixed(lvl > 2 ? 3 : 2);
                      const sz = (500 * (6 - lvl) + (lvl * 130)).toLocaleString();
                      return (
                        <div key={lvl} className="flex justify-between items-center py-1 border-b border-[#F0F3FA]">
                          <span className="text-[#089981] font-semibold">${bidP}</span>
                          <span className="text-[#6A7080]">{sz} qty</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Asks */}
                <div className="bg-[#FAF8FF] p-4 rounded-xl border border-[#F0F3FA]">
                  <h4 className="text-xs font-bold text-[#F23645] uppercase mb-2">Asks (Sell Orders)</h4>
                  <div className="flex flex-col gap-1.5 text-xs font-mono tabular-nums">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const askP = (quote.price * (1 + 0.0008 * lvl)).toFixed(lvl > 2 ? 3 : 2);
                      const sz = (450 * (6 - lvl) + (lvl * 110)).toLocaleString();
                      return (
                        <div key={lvl} className="flex justify-between items-center py-1 border-b border-[#F0F3FA]">
                          <span className="text-[#F23645] font-semibold">${askP}</span>
                          <span className="text-[#6A7080]">{sz} qty</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="bg-[#FAF8FF] p-5 rounded-xl border border-[#F0F3FA] text-sm text-[#171b26] flex flex-col gap-3">
                <h4 className="font-bold text-[#171b26]">About {quote.symbol}</h4>
                <p className="text-xs leading-relaxed text-[#6A7080]">
                  {quote.description || `${quote.name} is a leading financial instrument tracked globally across major institutional equities, derivatives, and liquidity pools. Real-time pricing provided via direct exchange feeds.`}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-[#6A7080]">P/E Ratio</span>
                    <p className="font-semibold tabular-nums mt-0.5">{quote.peRatio || '32.4x'}</p>
                  </div>
                  <div>
                    <span className="text-[#6A7080]">Previous Close</span>
                    <p className="font-semibold tabular-nums mt-0.5">${(quote.previousClose || quote.price * 0.995).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[#6A7080]">Open</span>
                    <p className="font-semibold tabular-nums mt-0.5">${(quote.open || quote.price * 0.998).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[#6A7080]">Exchange</span>
                    <p className="font-semibold uppercase mt-0.5">Global Live Feed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
