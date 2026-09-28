import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { InstrumentQuote } from '../data/marketData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allInstruments: InstrumentQuote[];
  onSelectInstrument: (quote: InstrumentQuote) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allInstruments,
  onSelectInstrument
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter instruments
  const filtered = allInstruments.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      onSelectInstrument(filtered[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#131722]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#F0F3FA] gap-3 bg-white">
          <Search className="w-5 h-5 text-[#6A7080] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search markets, stocks, crypto, futures, indices, forex..."
            className="w-full text-base font-normal text-[#171b26] placeholder-[#6A7080] focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#B2B5BE] hover:text-[#171b26] p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-[#6A7080] bg-[#F8F9FD] border border-[#E0E3EB] rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#F0F3FA] bg-[#F8F9FD] overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'us-stocks', label: 'US Stocks' },
            { id: 'indices', label: 'Indices' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'futures', label: 'Futures & Commodities' },
            { id: 'forex', label: 'Forex' },
            { id: 'etfs', label: 'ETFs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#131722] text-white shadow-xs'
                  : 'text-[#6A7080] hover:text-[#171b26] hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#F0F3FA]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#6A7080] text-sm">
              No matching instruments found for "{query}"
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const isPositive = item.change >= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectInstrument(item);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F4F6FB]' : 'hover:bg-[#F8F9FD]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: item.badgeColor || (isPositive ? '#089981' : '#F23645') }}
                    >
                      {item.flag || item.badgeText || item.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#171b26]">{item.symbol}</span>
                        <span className="text-[10px] uppercase font-semibold text-[#6A7080] px-1.5 py-0.5 rounded bg-white border border-[#E0E3EB]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#6A7080] truncate max-w-xs">{item.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-bold text-sm tabular-nums text-[#171b26]">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isPositive ? '+' : ''}{item.changePct.toFixed(2)}%</span>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-[#B2B5BE] transition-transform ${isSelected ? 'translate-x-1 text-[#0049db]' : ''}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#F8F9FD] border-t border-[#F0F3FA] text-[11px] text-[#6A7080] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select to open chart</span>
          </div>
          <span>Showing {filtered.length} instruments</span>
        </div>
      </div>
    </div>
  );
};
