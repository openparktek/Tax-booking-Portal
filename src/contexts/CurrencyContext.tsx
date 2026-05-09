import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchExchangeRates, convertCurrency } from "../lib/currencyApi";
import { toast } from "sonner";

export type Currency = "USD" | "EUR" | "EGP";

interface ExchangeRates {
  base: string;
  rates: {
    [key: string]: number;
  };
  timestamp: number;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: ExchangeRates | null;
  loading: boolean;
  formatCurrency: (amount: number, fromCurrency?: Currency) => string;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  EGP: "E£",
};

const CURRENCY_STORAGE_KEY = "selected_currency";
const CACHE_KEY = "currency_rates";

// Default fallback rates
const DEFAULT_RATES: ExchangeRates = {
  base: "USD",
  rates: {
    USD: 1,
    EUR: 0.92,
    EGP: 49.5,
  },
  timestamp: Date.now(),
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return (saved as Currency) || "USD";
  });
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExchangeRates();
  }, []);

  const loadExchangeRates = async () => {
    setLoading(true);
    console.log("Loading exchange rates...");
    
    try {
      const fetchedRates = await fetchExchangeRates("USD");
      console.log("Successfully fetched rates:", fetchedRates);
      setRates(fetchedRates);
      
      // Show info toast on first load
      const isFirstLoad = !localStorage.getItem("currency_rates_loaded");
      if (isFirstLoad) {
        toast.info("Live exchange rates loaded", {
          description: "All prices automatically convert to your selected currency",
          duration: 4000,
        });
        localStorage.setItem("currency_rates_loaded", "true");
      }
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
      console.log("Using default fallback rates:", DEFAULT_RATES);
      setRates(DEFAULT_RATES);
      
      toast.error("Using approximate exchange rates", {
        description: "Could not fetch live rates",
        duration: 3000,
      });
    } finally {
      setLoading(false);
      console.log("Exchange rates loading complete");
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    console.log(`Changing currency from ${currency} to ${newCurrency}`);
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  };

  const formatCurrency = (amount: number, fromCurrency: Currency = "USD"): string => {
    if (!rates) {
      console.error("No rates available for formatting - this should not happen");
      return `${CURRENCY_SYMBOLS[currency]}${amount.toFixed(2)}`;
    }

    const converted = convertCurrency(amount, fromCurrency, currency, rates);
    const symbol = CURRENCY_SYMBOLS[currency];

    return `${symbol}${converted.toFixed(2)}`;
  };

  const convertAmount = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (!rates) {
      console.error("No rates available for conversion");
      return amount;
    }
    return convertCurrency(amount, fromCurrency, toCurrency, rates);
  };

  const refreshRates = async () => {
    console.log("Manually refreshing exchange rates...");
    localStorage.removeItem(CACHE_KEY);
    await loadExchangeRates();
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        loading,
        formatCurrency,
        convertAmount,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
