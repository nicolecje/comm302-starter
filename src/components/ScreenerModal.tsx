import React, { useState, useMemo } from 'react';
import { X, Search, Filter, ArrowUpDown, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { InstrumentQuote } from '../data/marketData';

interface ScreenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruments: InstrumentQuote[];
  onSelectInstrument: (quote: InstrumentQuote) => void;
}

export const ScreenerModal: React.FC<ScreenerModalProps> = ({
  isOpen,
  onClose,
  instruments,
  onSelectInstrument
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'changePct' | 'price' | 'symbol'>('changePct');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = instruments.filter((item) => {
      const matchesType = filterType === 'all' || item.category === filterType;
      const matchesDirection =
        directionFilter === 'all' ||
        (directionFilter === 'gainers' && item.changePct > 0) ||
        (directionFilter === 'losers' && item.changePct < 0);
      const matchesQuery =
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesDirection && matchesQuery;
    });

    result.sort((a, b) => {
      let valA: number | string = a[sortField] ?? 0;
      let valB: number | string = b[sortField] ?? 0;
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [instruments, filterType, directionFilter, searchQuery, sortField, sortAsc]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#131722]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col h-[85vh] animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0F3FA] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#171b26]">Real-Time Market Screener</h3>
              <p className="text-xs text-[#6A7080]">Scan, filter, and analyze quantitative telemetry across all assets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#6A7080] hover:text-[#171b26] hover:bg-[#F8F9FD] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 bg-[#F8F9FD] border-b border-[#F0F3FA] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#6A7080] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name or symbol..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E0E3EB] rounded-lg text-xs text-[#171b26] focus:outline-none focus:border-[#2962ff]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Category */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E0E3EB] rounded-lg text-xs text-[#171b26] focus:outline-none font-medium"
            >
              <option value="all">All Asset Classes</option>
              <option value="us-stocks">US Stocks</option>
              <option value="indices">Indices</option>
              <option value="crypto">Crypto</option>
              <option value="futures">Futures &amp; Commodities</option>
              <option value="forex">Forex</option>
              <option value="etfs">ETFs</option>
            </select>

            {/* Gainers / Losers */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E0E3EB]">
              {(['all', 'gainers', 'losers'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setDirectionFilter(dir)}
                  className={`px-3 py-1 rounded-md font-medium capitalize transition-colors ${
                    directionFilter === dir
                      ? 'bg-[#131722] text-white shadow-xs'
                      : 'text-[#6A7080] hover:text-[#171b26]'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#FAF8FF] sticky top-0 z-10 border-b border-[#F0F3FA] text-[11px] font-bold text-[#6A7080] uppercase tracking-wider">
              <tr>
                <th 
                  className="py-3 px-6 cursor-pointer hover:text-[#171b26]"
                  onClick={() => {
                    setSortField('symbol');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    Symbol &amp; Name
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Asset Class</th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#171b26]"
                  onClick={() => {
                    setSortField('price');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    Last Price
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#171b26]"
                  onClick={() => {
                    setSortField('changePct');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    Change %
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3FA] text-xs">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6A7080]">
                    No instruments match your filter criteria
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item) => {
                  const isPositive = item.change >= 0;
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => {
                        onSelectInstrument(item);
                        onClose();
                      }}
                      className="hover:bg-[#F8F9FD] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] shrink-0"
                            style={{ backgroundColor: item.badgeColor || (isPositive ? '#089981' : '#F23645') }}
                          >
                            {item.flag || item.badgeText || item.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#171b26] group-hover:text-[#0049db] transition-colors">
                              {item.symbol}
                            </div>
                            <div className="text-xs text-[#6A7080] truncate max-w-xs">{item.name}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-semibold text-[#6A7080] px-2 py-0.5 rounded bg-[#FAF8FF] border border-[#E0E3EB]">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-sm tabular-nums text-[#171b26]">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-semibold text-xs ${
                          isPositive ? 'bg-[#EBF9F5] text-[#089981]' : 'bg-[#FDF0F1] text-[#F23645]'
                        }`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? '+' : ''}{item.changePct.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-[#6A7080]">
                        {item.volume || '18.4M'}
                      </td>

                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInstrument(item);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-full bg-[#FAF8FF] group-hover:bg-[#0049db] group-hover:text-white border border-[#E0E3EB] group-hover:border-transparent text-xs font-medium text-[#171b26] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Chart
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F8F9FD] border-t border-[#F0F3FA] text-xs text-[#6A7080] flex items-center justify-between shrink-0">
          <span>Displaying {filteredAndSorted.length} of {instruments.length} total tracked instruments</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#131722] text-white font-medium hover:bg-black transition-colors"
          >
            Close Screener
          </button>
        </div>
      </div>
    </div>
  );
};
