import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, Search, X, CheckCircle2, Loader2, XCircle } from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Prediction {
  place_id: string;
  description: string;
}

interface KioskMapPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: string;
}

// ── Mock fallback suggestions ──────────────────────────────────────────────────
const MOCK_PLACES = [
  "Cairo International Airport",
  "Cairo Tower, Zamalek",
  "Cairo Marriott Hotel, Zamalek",
  "Four Seasons Hotel Cairo, Nile Plaza",
  "Giza Pyramids, Giza",
  "The Egyptian Museum, Tahrir Square",
  "Khan el-Khalili, Islamic Cairo",
  "Cairo Festival City Mall, New Cairo",
  "Heliopolis, Cairo",
  "Maadi, Cairo",
  "New Cairo City",
  "6th of October City",
  "Sheikh Zayed City",
  "Nasr City, Cairo",
  "Downtown Cairo",
  "Garden City, Cairo",
  "Alexandria Governorate",
  "Sharm El Sheikh, South Sinai",
  "Hurghada, Red Sea",
  "Luxor City",
];

// ── Google Maps loader (singleton) ────────────────────────────────────────────
const GMAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
let mapsLoaded = false;
let mapsLoading = false;
const mapsCallbacks: Array<() => void> = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (mapsLoaded) { resolve(); return; }
    mapsCallbacks.push(resolve);
    if (mapsLoading) return;
    mapsLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAP_KEY}&libraries=places&language=en`;
    script.async = true;
    script.onload = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach(cb => cb());
      mapsCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function KioskMapPicker({
  value,
  onChange,
  placeholder = "Search destination...",
}: KioskMapPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selected, setSelected] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [kbVisible, setKbVisible] = useState(true);
  const [mapsReady, setMapsReady] = useState(mapsLoaded);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  // AutocompleteService does NOT need a map — init as soon as SDK is loaded
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // ── Load SDK ──
  useEffect(() => {
    if (!GMAP_KEY) return;
    loadGoogleMaps().then(() => setMapsReady(true));
  }, []);

  // ── Init AutocompleteService as soon as SDK is ready (no map needed) ──
  useEffect(() => {
    if (!mapsReady) return;
    if (!autocompleteService.current) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
    }
  }, [mapsReady]);

  // ── Init Map when modal opens ──
  useEffect(() => {
    if (!open || !mapsReady || !mapRef.current) return;
    if (mapInstanceRef.current) return; // already initialised

    const center = selected
      ? { lat: selected.lat, lng: selected.lng }
      : { lat: 30.0444, lng: 31.2357 };

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: selected ? 15 : 11,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
    });
    mapInstanceRef.current = map;

    const marker = new google.maps.Marker({
      map,
      position: center,
      visible: !!selected,
      animation: google.maps.Animation.DROP,
    });
    markerRef.current = marker;

    // PlacesService needs a map instance
    placesService.current = new google.maps.places.PlacesService(map);

    // Click on map → reverse geocode
    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition(e.latLng);
      marker.setVisible(true);
      setPredictions([]);
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const name = results[0].formatted_address;
          setSelected({ name, lat, lng });
          setQuery(name);
        }
      });
    });

    return () => {
      google.maps.event.clearInstanceListeners(map);
      mapInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mapsReady]);

  // ── Move marker when selected changes ──
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !selected) return;
    const pos = { lat: selected.lat, lng: selected.lng };
    markerRef.current.setPosition(pos);
    markerRef.current.setVisible(true);
    mapInstanceRef.current.panTo(pos);
    mapInstanceRef.current.setZoom(15);
  }, [selected]);

  // ── Search ──
  const search = useCallback((q: string) => {
    if (!q || q.length < 2) { setPredictions([]); return; }

    if (mapsReady && autocompleteService.current) {
      setLoading(true);
      autocompleteService.current.getPlacePredictions(
        { input: q, types: ["geocode", "establishment"] },
        (results, status) => {
          setLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results.map(r => ({ place_id: r.place_id, description: r.description })));
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      // Mock fallback
      const filtered = MOCK_PLACES
        .filter(p => p.toLowerCase().includes(q.toLowerCase()))
        .map(p => ({ place_id: p, description: p }));
      setPredictions(filtered.slice(0, 6));
    }
  }, [mapsReady]);

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(q), 250);
  }, [search]);

  const clearSearch = () => {
    setQuery("");
    setSelected(null);
    setPredictions([]);
    if (markerRef.current) markerRef.current.setVisible(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: 30.0444, lng: 31.2357 });
      mapInstanceRef.current.setZoom(11);
    }
    setKbVisible(true);
  };

  const selectPrediction = (p: Prediction) => {
    setQuery(p.description);
    setPredictions([]);

    if (mapsReady && placesService.current) {
      placesService.current.getDetails(
        { placeId: p.place_id, fields: ["geometry", "formatted_address", "name"] },
        (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
            const lat = result.geometry.location.lat();
            const lng = result.geometry.location.lng();
            const name = result.formatted_address || result.name || p.description;
            setSelected({ name, lat, lng });
          }
        }
      );
    } else {
      setSelected({ name: p.description, lat: 30.0444, lng: 31.2357 });
    }
  };

  const handleConfirm = () => {
    if (selected) {
      onChange(selected.name);
    } else if (query.trim()) {
      onChange(query.trim());
    }
    setOpen(false);
    setPredictions([]);
  };

  const handleOpen = () => {
    setQuery(value || "");
    setSelected(value ? { name: value, lat: 30.0444, lng: 31.2357 } : null);
    setPredictions([]);
    mapInstanceRef.current = null; // force re-init on next render
    setOpen(true);
    setKbVisible(true);
  };

  const hasValue = !!value;

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full h-24 rounded-2xl border-2 flex items-center gap-5 px-6 text-left transition-all duration-200
          ${hasValue
            ? "border-green-500 bg-green-50 hover:bg-green-100"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
          }`}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${hasValue ? "bg-green-100" : "bg-gray-100"}`}>
          <MapPin className={`w-8 h-8 ${hasValue ? "text-green-600" : "text-gray-400"}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-gray-500 font-medium mb-0.5">Drop-off Destination</span>
          <span className={`text-xl font-semibold truncate ${hasValue ? "text-gray-900" : "text-gray-400"}`}>
            {value || placeholder}
          </span>
        </div>
        {hasValue && <CheckCircle2 className="ml-auto shrink-0 w-8 h-8 text-green-500" />}
      </button>

      {/* ── Full-screen modal ── */}
      {open && createPortal(
        <div style={{ position:"fixed", inset:0, zIndex:9990, display:"flex", flexDirection:"column", background:"#fff" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 14px", borderBottom:"1px solid #e5e7eb", flexShrink:0 }}>
            {/* Close */}
            <button
              type="button"
              onPointerDown={() => setOpen(false)}
              style={{ width:56, height:56, borderRadius:"50%", background:"#f3f4f6", border:"none", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer" }}
            >
              <X size={28} color="#374151" />
            </button>

            {/* Search box */}
            <div style={{ flex:1, position:"relative" }}>
              <Search style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} size={24} color="#9ca3af" />
              <input
                type="text"
                value={query}
                readOnly
                onPointerDown={() => setKbVisible(true)}
                placeholder="Type a destination..."
                style={{
                  width:"100%",
                  height:"60px",
                  paddingLeft:"48px",
                  paddingRight: query ? "52px" : "14px",
                  fontSize:"1.35rem",
                  borderRadius:"16px",
                  border:"2px solid #3b82f6",
                  outline:"none",
                  background:"#fff",
                  fontWeight:500,
                  color:"#111827",
                  boxSizing:"border-box",
                }}
              />
              {/* Clear button inside search box */}
              {query.length > 0 && (
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); clearSearch(); }}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", padding:0 }}
                >
                  <XCircle size={26} color="#9ca3af" />
                </button>
              )}
              {loading && (
                <Loader2 style={{ position:"absolute", right: query ? 44 : 12, top:"50%", transform:"translateY(-50%)" }} size={22} color="#3b82f6" className="animate-spin" />
              )}
            </div>
          </div>

          {/* Map area */}
          <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
            <div ref={mapRef} style={{ width:"100%", height:"100%", background:"#f3f4f6" }} />

            {/* No API key placeholder */}
            {!mapsReady && !GMAP_KEY && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#eff6ff,#f1f5f9)", pointerEvents:"none" }}>
                <MapPin size={80} color="#93c5fd" />
                <p style={{ fontSize:"1.5rem", fontWeight:700, color:"#4b5563", marginTop:16 }}>Map Preview</p>
                <p style={{ fontSize:"1rem", color:"#9ca3af", marginTop:8 }}>
                  Add <code style={{ background:"#fff", padding:"2px 8px", borderRadius:6, color:"#3b82f6" }}>VITE_GOOGLE_MAPS_API_KEY</code> to enable live map
                </p>
              </div>
            )}

            {/* Predictions dropdown */}
            {predictions.length > 0 && (
              <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:10, background:"#fff", boxShadow:"0 8px 32px rgba(0,0,0,0.18)", maxHeight:"55vh", overflowY:"auto" }}>
                {predictions.map((p) => (
                  <button
                    key={p.place_id}
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); selectPrediction(p); }}
                    style={{ width:"100%", display:"flex", alignItems:"center", gap:16, padding:"18px 20px", background:"none", border:"none", borderBottom:"1px solid #f3f4f6", cursor:"pointer", textAlign:"left" }}
                  >
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <MapPin size={22} color="#2563eb" />
                    </div>
                    <span style={{ fontSize:"1.2rem", color:"#1f2937", lineHeight:1.3 }}>{p.description}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Selected pin label */}
            {selected && predictions.length === 0 && (
              <div style={{ position:"absolute", bottom:16, left:16, right:16, zIndex:5, background:"rgba(255,255,255,0.95)", borderRadius:14, padding:"12px 18px", boxShadow:"0 4px 20px rgba(0,0,0,0.15)", display:"flex", alignItems:"center", gap:12 }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink:0 }} />
                <span style={{ fontSize:"1rem", color:"#1f2937", fontWeight:500, lineHeight:1.3 }}>{selected.name}</span>
              </div>
            )}
          </div>

          {/* Confirm bar */}
          <div style={{
            flexShrink:0,
            padding:"12px 16px",
            paddingBottom: kbVisible ? "340px" : "16px",
            borderTop:"1px solid #e5e7eb",
            background:"#fff",
            transition:"padding-bottom 0.2s",
          }}>
            <button
              type="button"
              onPointerDown={handleConfirm}
              disabled={!selected && !query.trim()}
              style={{
                width:"100%",
                height:"76px",
                borderRadius:"18px",
                background: (!selected && !query.trim()) ? "#d1d5db" : "#16a34a",
                border:"none",
                color:"#fff",
                fontSize:"1.4rem",
                fontWeight:800,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:12,
                cursor: (!selected && !query.trim()) ? "default" : "pointer",
                transition:"background 0.15s",
              }}
            >
              <CheckCircle2 size={30} />
              Confirm Destination
            </button>
          </div>

          {/* Virtual keyboard */}
          <VirtualKeyboard
            visible={kbVisible}
            value={query}
            onInput={handleQueryChange}
            onDone={() => setKbVisible(false)}
          />
        </div>,
        document.body
      )}
    </>
  );
}
