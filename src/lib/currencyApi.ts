// Currency conversion API using exchangerate-api.com (free, supports EGP)
const CACHE_KEY = "currency_rates";
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

interface ExchangeRates {
  base: string;
  rates: {
    [key: string]: number;
  };
  timestamp: number;
}

// Fallback rates in case API fails
const FALLBACK_RATES: ExchangeRates = {
  base: "USD",
  rates: {
    USD: 1,
    EUR: 0.92,
    EGP: 49.5,
  },
  timestamp: Date.now(),
};

export async function fetchExchangeRates(baseCurrency = "USD"): Promise<ExchangeRates> {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION && parsed.base === baseCurrency) {
        console.log("✓ Using cached exchange rates:", parsed);
        return parsed;
      } else {
        console.log("✗ Cache expired or different base currency");
      }
    }

    console.log(`📡 Fetching fresh exchange rates from API (base: ${baseCurrency})...`);
    
    // Using exchangerate-api.com which supports EGP
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("✓ API response received:", data);
    
    // Validate that we have the currencies we need
    if (!data.rates || !data.rates.USD || !data.rates.EUR || !data.rates.EGP) {
      console.warn("⚠ Missing required currencies in API response, using fallback");
      return FALLBACK_RATES;
    }
    
    // Extract only the currencies we need
    const rates: ExchangeRates = {
      base: baseCurrency,
      rates: {
        USD: data.rates.USD,
        EUR: data.rates.EUR,
        EGP: data.rates.EGP,
      },
      timestamp: Date.now(),
    };

    // Cache the rates
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    console.log("✓ Exchange rates cached successfully:", rates);

    return rates;
  } catch (error) {
    console.error("✗ Error fetching exchange rates:", error);
    
    // Try to return cached rates even if expired
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("⚠ Using expired cached rates due to API error:", parsed);
        return parsed;
      } catch (e) {
        console.error("✗ Failed to parse cached rates:", e);
      }
    }
    
    console.log("⚠ Using fallback rates:", FALLBACK_RATES);
    return FALLBACK_RATES;
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Validate input
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.warn("Invalid amount for conversion:", amount);
    return 0;
  }

  // Check if we have the required rates
  if (!rates.rates[fromCurrency]) {
    console.error(`Missing rate for source currency: ${fromCurrency}`, rates);
    return amount;
  }
  
  if (!rates.rates[toCurrency]) {
    console.error(`Missing rate for target currency: ${toCurrency}`, rates);
    return amount;
  }

  // Convert to base currency first, then to target currency
  const baseAmount = amount / rates.rates[fromCurrency];
  const convertedAmount = baseAmount * rates.rates[toCurrency];

  console.log(`💱 Converting ${amount} ${fromCurrency} → ${convertedAmount.toFixed(2)} ${toCurrency}`, {
    fromRate: rates.rates[fromCurrency],
    toRate: rates.rates[toCurrency],
    base: rates.base,
  });

  return convertedAmount;
}
