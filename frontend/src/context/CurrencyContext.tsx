import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrencyRates } from '../services/api';

export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'BRL';

export interface CurrencyRatesMap {
  USD: number;
  INR: number;
  GBP: number;
  BRL: number;
}

interface CurrencyContextType {
  selectedCurrency: CurrencyCode;
  companyBaseCurrency: CurrencyCode;
  rates: CurrencyRatesMap;
  lastUpdated: string;
  setCurrency: (currency: CurrencyCode) => void;
  setCompanyBaseCurrency: (currency: CurrencyCode) => void;
  convert: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => number;
  formatCurrency: (amount?: number | null, options?: { compact?: boolean; decimals?: number }) => string;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'selected_dashboard_currency';

const DEFAULT_RATES: CurrencyRatesMap = {
  USD: 1.0,
  INR: 83.50,
  GBP: 0.78,
  BRL: 5.50,
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY) as CurrencyCode;
    return ['INR', 'USD', 'GBP', 'BRL'].includes(saved) ? saved : 'USD';
  });

  const [companyBaseCurrency, setCompanyBaseCurrencyState] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<CurrencyRatesMap>(DEFAULT_RATES);
  const [lastUpdated, setLastUpdated] = useState<string>('Configured Exchange Engine (USD, INR, GBP, BRL)');

  useEffect(() => {
    fetchCurrencyRates()
      .then((data) => {
        if (data && data.rates) {
          setRates({
            USD: data.rates.USD || 1.0,
            INR: data.rates.INR || 83.50,
            GBP: data.rates.GBP || 0.78,
            BRL: data.rates.BRL || 5.50,
          });
          setLastUpdated(data.last_updated || 'Live rate');
        }
      })
      .catch((err) => console.error('Using default exchange rates:', err));
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

    const fromRate = rates[from] || 1.0;
    const toRate = rates[to] || 1.0;

    // Convert from -> USD
    const amountInUSD = from === 'USD' ? amount : amount / fromRate;
    // Convert USD -> to
    return to === 'USD' ? amountInUSD : amountInUSD * toRate;
  };

  const formatCurrency = (
    amount?: number | null,
    options: { compact?: boolean; decimals?: number } = { compact: true }
  ): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return '—';

    const converted = convert(amount, companyBaseCurrency, selectedCurrency);
    const compact = options.compact !== false;
    const absVal = Math.abs(converted);
    const sign = converted < 0 ? '-' : '';

    if (selectedCurrency === 'INR') {
      if (compact) {
        if (absVal >= 10000000) {
          return `${sign}₹${(absVal / 10000000).toFixed(options.decimals ?? 2)} Cr`;
        } else if (absVal >= 100000) {
          return `${sign}₹${(absVal / 100000).toFixed(options.decimals ?? 1)} L`;
        } else if (absVal >= 1000) {
          return `${sign}₹${(absVal / 1000).toFixed(options.decimals ?? 1)}K`;
        }
      }
      return `${sign}₹${absVal.toLocaleString('en-IN', {
        maximumFractionDigits: options.decimals ?? 2,
        minimumFractionDigits: 0,
      })}`;
    }

    if (selectedCurrency === 'GBP') {
      if (compact) {
        if (absVal >= 1000000000) {
          return `${sign}£${(absVal / 1000000000).toFixed(options.decimals ?? 2)}B`;
        } else if (absVal >= 1000000) {
          return `${sign}£${(absVal / 1000000).toFixed(options.decimals ?? 1)}M`;
        } else if (absVal >= 1000) {
          return `${sign}£${(absVal / 1000).toFixed(options.decimals ?? 1)}K`;
        }
      }
      return `${sign}£${absVal.toLocaleString('en-GB', {
        maximumFractionDigits: options.decimals ?? 2,
        minimumFractionDigits: 0,
      })}`;
    }

    if (selectedCurrency === 'BRL') {
      if (compact) {
        if (absVal >= 1000000) {
          return `${sign}R$ ${(absVal / 1000000).toFixed(options.decimals ?? 1)}M`;
        } else if (absVal >= 1000) {
          return `${sign}R$ ${(absVal / 1000).toFixed(options.decimals ?? 1)}K`;
        }
      }
      return `${sign}R$ ${absVal.toLocaleString('pt-BR', {
        maximumFractionDigits: options.decimals ?? 2,
        minimumFractionDigits: 0,
      })}`;
    }

    // Default USD
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
  };

  const getCurrencySymbol = (): string => {
    switch (selectedCurrency) {
      case 'INR':
        return '₹';
      case 'GBP':
        return '£';
      case 'BRL':
        return 'R$';
      case 'USD':
      default:
        return '$';
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        companyBaseCurrency,
        rates,
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
