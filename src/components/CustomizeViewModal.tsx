import React from 'react';
import { X, Check, RotateCcw, Sliders, Radio } from 'lucide-react';

export interface ViewSettings {
  sections: {
    indices: boolean;
    usStocks: boolean;
    worldStocks: boolean;
    crypto: boolean;
    futures: boolean;
    forex: boolean;
    bonds: boolean;
    etfs: boolean;
    economy: boolean;
  };
  liveSimulation: boolean;
  simulationSpeed: 'fast' | 'normal' | 'relaxed';
}

interface CustomizeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ViewSettings;
  onUpdateSettings: (newSettings: ViewSettings) => void;
  onReset: () => void;
}

export const CustomizeViewModal: React.FC<CustomizeViewModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReset
}) => {
  if (!isOpen) return null;

  const toggleSection = (key: keyof ViewSettings['sections']) => {
    onUpdateSettings({
      ...settings,
      sections: {
        ...settings.sections,
        [key]: !settings.sections[key]
      }
    });
  };

  const setLiveSimulation = (val: boolean) => {
    onUpdateSettings({
      ...settings,
      liveSimulation: val
    });
  };

  const setSpeed = (speed: 'fast' | 'normal' | 'relaxed') => {
    onUpdateSettings({
      ...settings,
      simulationSpeed: speed
    });
  };

  const sectionLabels: { key: keyof ViewSettings['sections']; label: string; desc: string }[] = [
    { key: 'indices', label: 'Primary Indices & Ticker Ribbon', desc: 'S&P 500, Nasdaq 100, Dow 30, Russell 2000, VIX' },
    { key: 'worldStocks', label: 'World Indices', desc: 'Nikkei 225, FTSE 100, DAX, CAC 40, Hang Seng, Nifty 50' },
    { key: 'usStocks', label: 'US Equities & Screeners', desc: 'Magnificent 7, High volume, Volatile, Gainers, Earnings' },
    { key: 'crypto', label: 'Crypto & Digital Assets', desc: 'BTC, ETH, SOL, XRP, Market cap rankings, TVL DeFi' },
    { key: 'futures', label: 'Futures & Commodities', desc: 'Gold, Silver, Crude Oil, Natural Gas, Ag & Indices' },
    { key: 'forex', label: 'Forex & Currencies', desc: 'EUR/USD, USD/JPY, GBP/USD, DXY Dollar Index' },
    { key: 'bonds', label: 'Bonds & Sovereign Yields', desc: 'US Treasury yield curve, Global 10Y benchmarks, Corporate' },
    { key: 'etfs', label: 'ETFs & Macro Economy', desc: 'SPY, QQQ, IBIT, SOXL and Sovereign macroeconomic matrix' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131722]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#F0F3FA] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#171b26]">Customize Market Board</h3>
              <p className="text-xs text-[#6A7080]">Configure visible asset classes and telemetry refresh cadence</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[#6A7080] hover:text-[#171b26] hover:bg-[#F8F9FD] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Live Telemetry Speed */}
          <div className="bg-[#FAF8FF] p-4 rounded-xl border border-[#F0F3FA] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#171b26] flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${settings.liveSimulation ? 'text-[#089981] animate-pulse' : 'text-[#6A7080]'}`} />
                  Real-Time Live Telemetry
                </span>
                <p className="text-xs text-[#6A7080]">Simulate tick price fluctuations with visual flash cues</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.liveSimulation}
                  onChange={(e) => setLiveSimulation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E0E3EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2962ff]"></div>
              </label>
            </div>

            {settings.liveSimulation && (
              <div className="pt-2 border-t border-[#F0F3FA] flex items-center justify-between text-xs">
                <span className="text-[#6A7080]">Tick Cadence</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E0E3EB]">
                  {(['fast', 'normal', 'relaxed'] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeed(spd)}
                      className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                        settings.simulationSpeed === spd
                          ? 'bg-[#131722] text-white shadow-xs'
                          : 'text-[#6A7080] hover:text-[#171b26]'
                      }`}
                    >
                      {spd === 'fast' ? '1.5s' : spd === 'normal' ? '3.0s' : '6.0s'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section Visibility */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#6A7080] uppercase tracking-wider">Visible Market Sections</span>
            <div className="divide-y divide-[#F0F3FA] border border-[#F0F3FA] rounded-xl overflow-hidden bg-white">
              {sectionLabels.map((sec) => {
                const isEnabled = settings.sections[sec.key];
                return (
                  <div
                    key={sec.key}
                    onClick={() => toggleSection(sec.key)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#F8F9FD] cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-[#171b26]">{sec.label}</h4>
                      <p className="text-xs text-[#6A7080]">{sec.desc}</p>
                    </div>
                    <div 
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isEnabled ? 'bg-[#0049db] border-[#0049db] text-white' : 'border-[#E0E3EB] bg-white'
                      }`}
                    >
                      {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-[#F8F9FD] border-t border-[#F0F3FA] flex items-center justify-between text-xs shrink-0">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-[#6A7080] hover:text-[#171b26] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to default
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#131722] text-white font-medium hover:bg-black transition-colors"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
