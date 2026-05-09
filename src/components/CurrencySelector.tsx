import { useCurrency, Currency } from "../contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DollarSign, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "EGP", label: "EGP - Egyptian Pound", symbol: "E£" },
];

export default function CurrencySelector() {
  const { currency, setCurrency, loading, rates, refreshRates } = useCurrency();

  const handleRefreshRates = async () => {
    await refreshRates();
    toast.success("Exchange rates refreshed");
  };

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
      ) : (
        <DollarSign className="w-4 h-4 text-gray-500" />
      )}
      <Select
        value={currency}
        onValueChange={(value) => {
          console.log("Switching to currency:", value);
          console.log("Current rates:", rates);
          setCurrency(value as Currency);
        }}
        disabled={loading}
      >
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((curr) => (
            <SelectItem key={curr.value} value={curr.value}>
              {curr.symbol} {curr.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefreshRates}
        title="Refresh exchange rates"
        className="h-9 w-9"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  );
}
