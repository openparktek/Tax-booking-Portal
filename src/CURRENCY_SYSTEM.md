# Currency System Documentation

## Overview
OpenPark now features a comprehensive multi-currency system with live exchange rates from public sources (Frankfurter API, similar to XE.com).

## Supported Currencies
- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **EGP** - Egyptian Pound (E£)

## Features

### 1. Live Exchange Rates
- Fetched from **Frankfurter API** (free public source)
- Cached for 1 hour to reduce API calls
- Automatic fallback to approximate rates if API fails
- Updates automatically on page load

### 2. Currency Selector
- Located in the top header bar
- Available on all pages
- Selection persists across sessions (localStorage)
- Visual loading indicator during rate fetch

### 3. Automatic Conversion
All monetary values throughout the application are automatically converted:
- Dashboard revenue metrics
- Booking fares
- Settlement amounts
- Fare zone pricing
- Company revenue shares

### 4. Components

#### CurrencyContext (`/contexts/CurrencyContext.tsx`)
Global state management for:
- Current selected currency
- Exchange rates
- Conversion utilities
- Format functions

#### CurrencyDisplay Component (`/components/CurrencyDisplay.tsx`)
Displays formatted currency values with automatic conversion
```tsx
<CurrencyDisplay amount={100} fromCurrency="USD" />
```

#### CurrencySelector Component (`/components/CurrencySelector.tsx`)
Dropdown selector in the header for switching currencies

### 5. API Integration

**Endpoint**: `https://api.frankfurter.app/latest`

**Example Response**:
```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.92,
    "EGP": 49.5
  }
}
```

### 6. Usage Examples

**Format currency in components:**
```tsx
import { useCurrency } from "../contexts/CurrencyContext";

function MyComponent() {
  const { formatCurrency } = useCurrency();
  return <div>{formatCurrency(100)}</div>; // Shows: $100.00 or €92.00 or E£4,950.00
}
```

**Convert between currencies:**
```tsx
const { convertAmount } = useCurrency();
const inEGP = convertAmount(100, "USD", "EGP");
```

**Display with CurrencyDisplay:**
```tsx
<CurrencyDisplay amount={100} fromCurrency="USD" />
```

## Updated Pages
✅ Admin Dashboard - Revenue metrics
✅ Bookings List - Fare column
✅ Fares & Zones - All pricing fields
✅ Settlement Dashboard - All revenue data
✅ Company Details - Revenue share
✅ Edit Fare Dialog - Currency labels

## Cache & Performance
- Exchange rates cached in localStorage
- Cache duration: 1 hour
- Reduces API calls
- Instant currency switching (no API call needed)

## Error Handling
- API failure → Fallback to approximate rates
- Network error → User notification via toast
- Invalid amounts → Display dash (-)

## Future Enhancements
- Add more currencies (GBP, AED, SAR)
- Manual refresh button for rates
- Historical rate tracking
- Custom rate overrides for testing
