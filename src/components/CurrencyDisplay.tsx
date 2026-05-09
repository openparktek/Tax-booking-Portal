import { useCurrency, Currency } from "../contexts/CurrencyContext";

interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  fromCurrency?: Currency;
  className?: string;
}

export default function CurrencyDisplay({
  amount,
  fromCurrency = "USD",
  className = "",
}: CurrencyDisplayProps) {
  const { formatCurrency, rates } = useCurrency();

  // Handle null or undefined amounts
  if (amount === null || amount === undefined) {
    return <span className={className}>-</span>;
  }

  // Parse amount if it's a string (e.g., "$85.00")
  const numericAmount = typeof amount === "string"
    ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
    : amount;

  if (isNaN(numericAmount)) {
    return <span className={className}>-</span>;
  }

  if (!rates) {
    console.warn("CurrencyDisplay: Rates not yet loaded");
    return <span className={className}>Loading...</span>;
  }

  return <span className={className}>{formatCurrency(numericAmount, fromCurrency)}</span>;
}
