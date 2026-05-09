import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Enter destination...",
}: GooglePlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Simulated autocomplete - in production, use Google Places API
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    // Simulated API call with common Cairo/Egypt destinations
    // In production, replace with actual Google Places API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allPlaces = [
      "Cairo International Airport",
      "Cairo Tower, Zamalek, Cairo",
      "Cairo Marriott Hotel, Zamalek",
      "Four Seasons Hotel Cairo at Nile Plaza",
      "Giza Pyramids, Giza Governorate",
      "The Egyptian Museum, Tahrir Square, Cairo",
      "Khan el-Khalili, Islamic Cairo",
      "Cairo Festival City Mall, New Cairo",
      "Heliopolis, Cairo",
      "Maadi, Cairo Governorate",
      "New Cairo City",
      "6th of October City",
      "Sheikh Zayed City",
      "Nasr City, Cairo",
      "Downtown Cairo",
      "Garden City, Cairo",
      "Alexandria, Alexandria Governorate",
      "Sharm El Sheikh, South Sinai",
      "Hurghada, Red Sea Governorate",
      "Luxor, Luxor Governorate",
    ];

    const filtered = allPlaces.filter((place) =>
      place.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 5));
    setLoading(false);
    setShowSuggestions(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Debounce the API call
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 mt-1.5"
          required
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && value.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            No destinations found. Type to search...
          </p>
        </div>
      )}
    </div>
  );
}
