import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Coins, RefreshCw } from 'lucide-react';
import { useCurrency, type CurrencyCode } from '../../context/CurrencyContext';

export const CurrencySelector: React.FC = () => {
  const { selectedCurrency, companyBaseCurrency, setCurrency, exchangeRate, lastUpdated } = useCurrency();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { code: CurrencyCode; label: string; symbol: string; desc: string }[] = [
    { code: 'INR', label: 'INR (₹)', symbol: '₹', desc: 'Indian Rupee (Lakhs / Crores)' },
    { code: 'USD', label: 'USD ($)', symbol: '$', desc: 'US Dollar (Thousands / Millions)' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 transition-all duration-150 cursor-pointer shadow-sm"
        aria-label="Select Currency"
      >
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold shadow-inner">
          {selectedCurrency === 'INR' ? '₹' : '$'}
        </div>
        <div className="text-left">
          <span className="text-xs font-bold block leading-tight">
            {selectedCurrency === 'INR' ? '₹ INR' : '$ USD'}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Coins size={12} className="text-amber-500" />
              Display Currency
            </span>
          </div>

          <div className="py-1.5 space-y-1">
            {options.map((opt) => {
              const isSelected = opt.code === selectedCurrency;
              const isBase = opt.code === companyBaseCurrency;
              return (
                <button
                  key={opt.code}
                  onClick={() => {
                    setCurrency(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                      {opt.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-slate-800 dark:text-slate-100'}`}>
                          {opt.label}
                        </span>
                        {isBase && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                            Base
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {opt.desc}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check size={16} className="text-amber-600 dark:text-amber-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Exchange Rate Notice */}
          <div className="px-3 py-2 mt-1 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
            <RefreshCw size={11} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                1 USD = ₹{exchangeRate.toFixed(2)} INR
              </span>
              <span className="block text-[9px] mt-0.5">{lastUpdated}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
