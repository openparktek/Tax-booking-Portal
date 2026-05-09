import { useCurrency } from "../contexts/CurrencyContext";
import { Card } from "./ui/card";
import { RefreshCw } from "lucide-react";

export default function CurrencyDebugInfo() {
  const { rates, currency, loading } = useCurrency();

  if (loading) {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 text-blue-700">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading exchange rates...</span>
        </div>
      </Card>
    );
  }

  if (!rates) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="text-sm text-red-800">
          ⚠️ Exchange rates not available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-blue-50 border-blue-200">
      <div className="text-sm">
        <div className="font-semibold text-blue-900 mb-2">
          Exchange Rates (Base: {rates.base})
        </div>
        <div className="space-y-1 text-blue-800">
          <div>1 USD = {rates.rates.USD?.toFixed(4) || "N/A"} USD</div>
          <div>1 USD = {rates.rates.EUR?.toFixed(4) || "N/A"} EUR</div>
          <div>1 USD = {rates.rates.EGP?.toFixed(2) || "N/A"} EGP</div>
        </div>
        <div className="mt-2 pt-2 border-t border-blue-300 text-blue-700">
          Selected: <span className="font-semibold">{currency}</span>
        </div>
        <div className="mt-1 text-xs text-blue-600">
          Example: $100 USD = {((100 / rates.rates.USD) * rates.rates[currency]).toFixed(2)} {currency}
        </div>
        <div className="mt-1 text-xs text-blue-500">
          Last updated: {new Date(rates.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}
