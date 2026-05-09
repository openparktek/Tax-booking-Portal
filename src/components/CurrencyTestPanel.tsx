import { useCurrency } from "../contexts/CurrencyContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import CurrencyDisplay from "./CurrencyDisplay";

export default function CurrencyTestPanel() {
  const { currency, rates, refreshRates, loading } = useCurrency();

  const testAmounts = [10, 50, 100, 500, 1000];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Currency Conversion Test</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={refreshRates}
          disabled={loading}
        >
          Refresh Rates
        </Button>
      </div>
      
      <div className="space-y-2 text-sm">
        {testAmounts.map((amount) => (
          <div key={amount} className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">${amount} USD =</span>
            <span className="font-semibold text-gray-900">
              <CurrencyDisplay amount={amount} fromCurrency="USD" />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Current: {currency}</div>
          {rates && (
            <>
              <div>USD rate: {rates.rates.USD}</div>
              <div>EUR rate: {rates.rates.EUR}</div>
              <div>EGP rate: {rates.rates.EGP}</div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
