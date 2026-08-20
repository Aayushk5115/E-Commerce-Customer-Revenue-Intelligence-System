import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrencyRates } from '../services/api';

export type CurrencyCode = 'INR' | 'USD';

interface CurrencyContextType {
  selectedCurrency: CurrencyCode;
  companyBaseCurrency: CurrencyCode;
  exchangeRate: number; // 1 USD = X INR
  lastUpdated: string;
  setCurrency: (currency: CurrencyCode) => void;
  setCompanyBaseCurrency: (currency: CurrencyCode) => void;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  formatCurrency: (amount?: number | null, options?: { compact?: boolean; decimals?: number }) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'selected_dashboard_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved === 'INR' || saved === 'USD' ? saved : 'INR';
  });

  const [companyBaseCurrency, setCompanyBaseCurrencyState] = useState<CurrencyCode>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(83.5);
  const [lastUpdated, setLastUpdated] = useState<string>('Configured exchange rate (1 USD = ₹83.50)');

  useEffect(() => {
    fetchCurrencyRates()
      .then((data) => {
        if (data && data.rates && data.rates.INR) {
          setExchangeRate(data.rates.INR);
          setLastUpdated(data.last_updated || 'Live rate');
        }
      })
      .catch((err) => console.error('Using fallback exchange rate 83.5:', err));
  }, []);

  const setCurrency = (curr: CurrencyCode) => {
    setSelectedCurrencyState(curr);
    sessionStorage.setItem(STORAGE_KEY, curr);
  };

  const setCompanyBaseCurrency = (curr: CurrencyCode) => {
    setCompanyBaseCurrencyState(curr);
  };

  const convert = (
    amount: number,
    from: CurrencyCode = companyBaseCurrency,
    to: CurrencyCode = selectedCurrency
  ): number => {
    if (amount === 0 || isNaN(amount) || !isFinite(amount)) return 0;
    if (from === to) return amount;
    if (from === 'INR' && to === 'USD') return amount / exchangeRate;
    if (from === 'USD' && to === 'INR') return amount * exchangeRate;
    return amount;
  };

  const formatCurrency = (
    amount?: number | null,
    options: { compact?: boolean; decimals?: number } = { compact: true }
  ): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return '-';
    
    const converted = convert(amount, companyBaseCurrency, selectedCurrency);
    const compact = options.compact !== false;

    if (selectedCurrency === 'INR') {
      const absVal = Math.abs(converted);
      const sign = converted < 0 ? '-' : '';

      if (compact) {
        if (absVal >= 10000000) {
          // Crores (Cr)
          return `${sign}₹${(absVal / 10000000).toFixed(options.decimals ?? 2)} Cr`;
        } else if (absVal >= 100000) {
          // Lakhs (L)
          return `${sign}₹${(absVal / 100000).toFixed(options.decimals ?? 1)} L`;
        } else if (absVal >= 1000) {
          // Thousands (K)
          return `${sign}₹${(absVal / 1000).toFixed(options.decimals ?? 1)}K`;
        }
      }

      return `${sign}₹${absVal.toLocaleString('en-IN', {
        maximumFractionDigits: options.decimals ?? 2,
        minimumFractionDigits: 0,
      })}`;
    } else {
      // USD format
      const absVal = Math.abs(converted);
      const sign = converted < 0 ? '-' : '';

      if (compact) {
        if (absVal >= 1000000000) {
          return `${sign}$${(absVal / 1000000000).toFixed(options.decimals ?? 2)}B`;
        } else if (absVal >= 1000000) {
          return `${sign}$${(absVal / 1000000).toFixed(options.decimals ?? 1)}M`;
        } else if (absVal >= 1000) {
          return `${sign}$${(absVal / 1000).toFixed(options.decimals ?? 1)}K`;
        }
      }

      return `${sign}$${absVal.toLocaleString('en-US', {
        maximumFractionDigits: options.decimals ?? 2,
        minimumFractionDigits: 0,
      })}`;
    }
  };

  const getCurrencySymbol = (): string => {
    return selectedCurrency === 'INR' ? '₹' : '$';
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        companyBaseCurrency,
        exchangeRate,
        lastUpdated,
        setCurrency,
        setCompanyBaseCurrency,
        convert,
        formatCurrency,
        getCurrencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
