import React from 'react';
import { X, Trash2, ArrowUpRight, TrendingUp, TrendingDown, Bookmark } from 'lucide-react';
import { InstrumentQuote } from '../data/marketData';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: InstrumentQuote[];
  onRemove: (id: string) => void;
  onSelect: (quote: InstrumentQuote) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  onRemove,
  onSelect
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-[#131722]/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#E0E3EB] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#F0F3FA] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#0049db] fill-[#0049db]/20" />
            <h3 className="font-bold text-lg text-[#171b26]">My Watchlist</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F8F9FD] border border-[#E0E3EB] font-bold text-[#6A7080]">
              {watchlist.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#6A7080] hover:text-[#171b26] hover:bg-[#F8F9FD] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {watchlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#6A7080]">
              <div className="w-12 h-12 rounded-full bg-[#FAF8FF] border border-[#E0E3EB] flex items-center justify-center mb-3 text-[#6A7080]">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-[#171b26] mb-1">Your watchlist is empty</p>
              <p className="text-xs">Click the bookmark icon on any ticker card or chart modal to track your favorite assets in real time.</p>
            </div>
          ) : (
            watchlist.map((item) => {
              const isPositive = item.change >= 0;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="p-3.5 bg-white hover:bg-[#F8F9FD] border border-[#F0F3FA] hover:border-[#E0E3EB] rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: item.badgeColor || (isPositive ? '#089981' : '#F23645') }}
                    >
                      {item.flag || item.badgeText || item.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#171b26] group-hover:text-[#0049db] transition-colors">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#6A7080]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#6A7080] truncate max-w-[150px]">{item.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-sm tabular-nums text-[#171b26]">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${isPositive ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isPositive ? '+' : ''}{item.changePct.toFixed(2)}%</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                      className="p-1.5 text-[#B2B5BE] hover:text-[#F23645] hover:bg-[#FDF0F1] rounded-lg transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-[#F8F9FD] border-t border-[#F0F3FA] text-xs text-[#6A7080] flex justify-between items-center shrink-0">
          <span>Synced with local cache</span>
          <span className="font-medium text-[#171b26]">Real-time quotes active</span>
        </div>
      </div>
    </div>
  );
};
