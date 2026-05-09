import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Scan, Printer, CheckCircle2, LogOut, QrCode as QrCodeIcon, Car, Users, ArrowRight, Phone, User, MapPin, Navigation, Plane, ChevronRight, ChevronLeft, Info } from "lucide-react";
import KioskMapPicker from "../../components/kiosk/KioskMapPicker";
import VirtualKeyboard from "../../components/kiosk/VirtualKeyboard";
import { bookingsApi, kioskApi } from "../../lib/api";
import { usePickupLocations } from "../../hooks/usePickupLocations";
import { VEHICLE_TYPES } from "../../utils/constants";
import { toast } from "sonner";
import { useUser } from "../../contexts/UserContext";
import { useCurrency, Currency } from "../../contexts/CurrencyContext";
import { useNavigate } from "react-router";
import { authApi } from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import BookingQRCode from "../../components/BookingQRCode";
import KioskReceipt from "../../components/kiosk/KioskReceipt";

// Country flags with language codes
const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

// Currency options with symbols and flags
const currencies = [
  { code: "USD" as Currency, name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR" as Currency, name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "EGP" as Currency, name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬" },
];

import { kioskTranslations as translations } from "../../utils/kioskTranslations";

type Step = "language" | "currency" | "choice" | "input" | "request-form-1" | "request-form-2" | "request-form-3" | "request-submitted" | "confirmation";

export default function KioskInterface() {
  const [step, setStep] = useState<Step>("language");
  const [language, setLanguage] = useState<string>("en");
  const [currencyCode, setCurrencyCode] = useState<Currency>("USD");
  const [bookingNumber, setBookingNumber] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutPassword, setLogoutPassword] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    passenger: "",
    phone: "",
    vehicleType: "",
    pickupLocation: "",
    dropoffLocation: "",
    flightNumber: "",
  });
  const [submittedBooking, setSubmittedBooking] = useState<any>(null);

  // ── Virtual keyboard state ─────────────────────────────────────────────────
  const [kbVisible, setKbVisible] = useState(false);
  const [kbTarget, setKbTarget] = useState<"passenger" | "phone" | "flightNumber" | null>(null);

  const showKb = (field: "passenger" | "phone" | "flightNumber") => {
    setKbTarget(field);
    setKbVisible(true);
  };
  const hideKb = () => {
    setKbVisible(false);
    setKbTarget(null);
  };
  const handleKbInput = (val: string) => {
    if (!kbTarget) return;
    setRequestForm(prev => ({ ...prev, [kbTarget]: val }));
  };

  const { user, logout } = useUser();
  const { currency, setCurrency, formatCurrency, convertAmount } = useCurrency();
  const navigate = useNavigate();

  const t = translations[language];

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    setStep("currency");
  };

  const handleCurrencySelect = (currencyCode: Currency) => {
    setCurrencyCode(currencyCode);
    setCurrency(currencyCode);
    setStep("choice");
  };

  const handleChoice = (choice: "booking" | "request") => {
    if (choice === "booking") {
      setStep("input");
    } else {
      // Auto-show keyboard pointed at passenger field when entering the form
      setKbTarget("passenger");
      setKbVisible(true);
      setStep("request-form-1");
    }
  };

  const { locations } = usePickupLocations();

  const handleSubmitRequest = async () => {
    if (!requestForm.passenger.trim() || !requestForm.phone.trim()) {
      toast.error(t.passengerName + " & " + t.phoneNumber + " are required");
      return;
    }

    setLoading(true);
    try {
      // Calculate estimated fare based on vehicle type (same as CreateBookingDialog)
      const estimatedFare = requestForm.vehicleType.includes("Luxury") ? 145 : 
                            requestForm.vehicleType === "SUV" ? 120 : 
                            requestForm.vehicleType === "Van" || requestForm.vehicleType === "Minibus" ? 95 : 85;

      const bookingData = {
        ...requestForm,
        status: "Pending Assignment",
        driver: "Unassigned",
        fare: estimatedFare,
        pickupTime: new Date(Date.now() + 15 * 60000).toISOString(), // ASAP = 15 mins from now
      };

      const result = await kioskApi.createBooking(bookingData);
      
      if (result.success && result.data) {
        setBooking(result.data);
        setStep("request-submitted");
        toast.success(t.requestSuccess);
      } else {
        toast.error("Failed to create request");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingNumber.trim()) {
      toast.error("Please enter a booking number");
      return;
    }

    setLoading(true);
    try {
      const response = await kioskApi.getBookingStatus(bookingNumber.trim());
      
      if (response.success && response.data) {
        // Update booking status to "Confirmed at Airport"
        await bookingsApi.update(bookingNumber.trim(), {
          ...response.data,
          status: "Confirmed at Airport",
        });
        
        setBooking(response.data);
        setStep("confirmation");
        toast.success(t.confirmationSuccess);
      } else {
        toast.error("Booking not found");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    // We use a dedicated component for printing to ensure it's clean and only contains relevant info
    window.print();
  };

  const handleReset = () => {
    setStep("language");
    setLanguage("en");
    setCurrencyCode("USD");
    setBookingNumber("");
    setBooking(null);
    setRequestForm({
      passenger: "",
      phone: "",
      vehicleType: "",
      pickupLocation: "",
      dropoffLocation: "",
      flightNumber: "",
    });
  };

  const handleLogoutVerify = async () => {
    if (!logoutPassword.trim()) {
      toast.error("Please enter password");
      return;
    }

    setLogoutLoading(true);
    try {
      // Get current user ID
      const currentUserData = localStorage.getItem('openpark_current_user');
      if (!currentUserData) {
        toast.error("No user session found");
        setLogoutLoading(false);
        return;
      }

      const userData = JSON.parse(currentUserData);
      
      // For kiosk logout, just verify the password by attempting a login
      try {
        const loginResult = await authApi.login(userData.email, logoutPassword);
        if (!loginResult.success) {
          toast.error("Incorrect password");
          setLogoutPassword("");
          setLogoutLoading(false);
          return;
        }
      } catch (err) {
        toast.error("Incorrect password");
        setLogoutPassword("");
        setLogoutLoading(false);
        return;
      }

      // Password verified - logout successful
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to verify password");
      setLogoutLoading(false);
    } finally {
      setShowLogoutDialog(false);
      setLogoutPassword("");
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center overflow-hidden relative">
      
      {/* Logout Button - Top Right Corner */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full"
        onClick={() => setShowLogoutDialog(true)}
      >
        <LogOut className="w-6 h-6" />
      </Button>

      <div className="w-full h-full max-w-[1080px] mx-auto">
{step === "language" && (
          <div className="h-full flex flex-col items-center justify-center px-[3vw] py-[2vh]">
            <div className="text-center mb-[3vh]">
              <h1 className="text-[clamp(2rem,4vw,3.5rem)] text-white mb-[2vh] leading-tight px-4">{t.welcome}</h1>
              <p className="text-[clamp(1.25rem,2.5vw,1.75rem)] text-blue-100">{t.selectLanguage}</p>
            </div>
            {/* 2 columns x 4 rows - Dynamic sizing based on viewport */}
            <div className="grid grid-cols-2 gap-[1.5vw] w-full px-[3vw] max-h-[70vh]">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="outline"
                  className="h-[16vh] min-h-[120px] hover:scale-105 transition-all duration-200 bg-white/95 hover:bg-white border-4 border-white/50 hover:border-white shadow-2xl rounded-2xl"
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  <div className="flex flex-col items-center gap-[1vh]">
                    <span className="text-[clamp(3rem,6vw,5rem)] leading-none">{lang.flag}</span>
                    <span className="text-[clamp(1rem,1.8vw,1.5rem)] font-semibold text-gray-900">{lang.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Currency Selection - Dynamic Responsive */}
        {step === "currency" && (
          <div className="h-full flex flex-col items-center justify-center px-[3vw] py-[2vh]">
            <div className="text-center mb-[3vh]">
              <h1 className="text-[clamp(2rem,4vw,3.5rem)] text-white mb-[2vh] leading-tight px-4">{t.welcome}</h1>
              <p className="text-[clamp(1.25rem,2.5vw,1.75rem)] text-blue-100">{t.selectCurrency}</p>
            </div>
            {/* 3 large currency buttons in a single row */}
            <div className="flex gap-[2vw] w-full px-[5vw] justify-center">
              {currencies.map((cur) => (
                <Button
                  key={cur.code}
                  variant="outline"
                  className="flex-1 h-[25vh] min-h-[180px] max-w-[280px] hover:scale-105 transition-all duration-200 bg-white/95 hover:bg-white border-4 border-white/50 hover:border-white shadow-2xl rounded-2xl"
                  onClick={() => handleCurrencySelect(cur.code)}
                >
                  <div className="flex flex-col items-center gap-[1.5vh]">
                    <span className="text-[clamp(4rem,8vw,6rem)] leading-none">{cur.flag}</span>
                    <span className="text-[clamp(1.25rem,2.5vw,2rem)] font-semibold text-gray-900">{cur.symbol}</span>
                    <span className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-600">{cur.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Choice Selection - Booking vs Request */}
        {step === "choice" && (
          <div className="h-full flex flex-col items-center justify-center px-[3vw] py-[2vh]">
            <div className="text-center mb-[5vh]">
              <h1 className="text-[clamp(2rem,4vw,3.5rem)] text-white mb-[2vh] leading-tight px-4">{t.welcome}</h1>
            </div>
            <div className="flex gap-[3vw] w-full px-[5vw] justify-center">
              <Button
                variant="outline"
                className="flex-1 h-[30vh] min-h-[200px] max-w-[400px] hover:scale-105 transition-all duration-200 bg-white/95 hover:bg-white border-4 border-white/50 hover:border-white shadow-2xl rounded-3xl"
                onClick={() => handleChoice("booking")}
              >
                <div className="flex flex-col items-center gap-[2vh]">
                  <div className="w-[12vh] h-[12vh] bg-blue-100 rounded-full flex items-center justify-center">
                    <Scan className="w-[6vh] h-[6vh] text-blue-600" />
                  </div>
                  <span className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-bold text-gray-900">{t.iHaveBooking}</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-[30vh] min-h-[200px] max-w-[400px] hover:scale-105 transition-all duration-200 bg-blue-50/95 hover:bg-white border-4 border-blue-400/50 hover:border-blue-400 shadow-2xl rounded-3xl"
                onClick={() => handleChoice("request")}
              >
                <div className="flex flex-col items-center gap-[2vh]">
                  <div className="w-[12vh] h-[12vh] bg-green-100 rounded-full flex items-center justify-center">
                    <Car className="w-[6vh] h-[6vh] text-green-600" />
                  </div>
                  <span className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-bold text-gray-900">{t.requestRide}</span>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Request Form 1 - Passenger Info */}
        {step === "request-form-1" && (
          <div className="h-full flex flex-col items-center justify-center px-[4vw] py-[3vh] bg-white">
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-[4vh] px-4">
                <Button variant="ghost" size="lg" className="h-16 w-16 rounded-full" onClick={() => setStep("choice")}>
                  <ChevronLeft className="w-10 h-10" />
                </Button>
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                </div>
                <div className="w-16"></div>
              </div>

              <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] text-gray-900 mb-[4vh] text-center font-bold">{t.requestRide}</h2>
              
              <div className="space-y-[3vh] px-[2vw]">
                {/* Passenger Name */}
                <div>
                  <div className="flex items-center gap-2 mb-3 ml-1">
                    <User className="w-6 h-6 text-gray-500" />
                    <Label className="text-xl text-gray-600">{t.passengerName}</Label>
                  </div>
                  <input
                    readOnly
                    className="w-full rounded-2xl border-2 cursor-pointer bg-white outline-none"
                    style={{
                      height: "88px",
                      fontSize: "1.5rem",
                      padding: "0 20px",
                      borderColor: kbTarget === "passenger" ? "#3b82f6" : "#d1d5db",
                    }}
                    placeholder="John Doe"
                    value={requestForm.passenger}
                    onPointerDown={(e) => { e.preventDefault(); showKb("passenger"); }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <div className="flex items-center gap-2 mb-3 ml-1">
                    <Phone className="w-6 h-6 text-gray-500" />
                    <Label className="text-xl text-gray-600">{t.phoneNumber}</Label>
                  </div>
                  <input
                    readOnly
                    className="w-full rounded-2xl border-2 cursor-pointer bg-white outline-none"
                    style={{
                      height: "88px",
                      fontSize: "1.5rem",
                      padding: "0 20px",
                      borderColor: kbTarget === "phone" ? "#3b82f6" : "#d1d5db",
                    }}
                    placeholder="+20 123 456 7890"
                    value={requestForm.phone}
                    onPointerDown={(e) => { e.preventDefault(); showKb("phone"); }}
                  />
                </div>

                <Button 
                  className="w-full h-24 text-3xl rounded-2xl mt-8 font-bold"
                  onClick={() => { hideKb(); setStep("request-form-2"); }}
                  disabled={!requestForm.passenger.trim() || !requestForm.phone.trim()}
                >
                  {t.next}
                  <ChevronRight className="ml-3 w-10 h-10" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Request Form 2 - Vehicle & Pickup */}
        {step === "request-form-2" && (
          <div className="h-full flex flex-col items-center justify-start px-[4vw] py-[3vh] bg-white overflow-y-auto">
            <div className="w-full max-w-4xl">
              <div className="flex items-center justify-between mb-[4vh] px-4">
                <Button variant="ghost" size="lg" className="h-16 w-16 rounded-full" onClick={() => setStep("request-form-1")}>
                  <ChevronLeft className="w-10 h-10" />
                </Button>
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                </div>
                <div className="w-16"></div>
              </div>

              <h2 className="text-3xl font-bold mb-6 px-4">{t.selectVehicle}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 px-4">
                {VEHICLE_TYPES.map((v) => (
                  <Button
                    key={v}
                    variant={requestForm.vehicleType === v ? "default" : "outline"}
                    className={`h-24 text-xl rounded-2xl border-2 ${requestForm.vehicleType === v ? "border-blue-600" : "border-gray-200"}`}
                    onClick={() => setRequestForm({...requestForm, vehicleType: v})}
                  >
                    <Car className="mr-2 w-6 h-6" />
                    {v}
                  </Button>
                ))}
              </div>

              <h2 className="text-3xl font-bold mb-6 px-4">{t.selectPickup}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mb-8">
                {locations.filter(l => l.active).map((loc) => (
                  <Button
                    key={loc.id}
                    variant={requestForm.pickupLocation === loc.name ? "default" : "outline"}
                    className={`h-20 text-lg rounded-2xl border-2 text-left justify-start px-6 ${requestForm.pickupLocation === loc.name ? "border-blue-600" : "border-gray-200"}`}
                    onClick={() => setRequestForm({...requestForm, pickupLocation: loc.name})}
                  >
                    <MapPin className="mr-3 w-6 h-6 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold">{loc.name}</span>
                      <span className="text-sm opacity-80">{loc.terminal}</span>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="px-4 pb-8">
                <Button 
                  className="w-full h-24 text-3xl rounded-2xl font-bold"
                  onClick={() => setStep("request-form-3")}
                  disabled={!requestForm.vehicleType || !requestForm.pickupLocation}
                >
                  {t.next}
                  <ChevronRight className="ml-3 w-10 h-10" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Request Form 3 - Dropoff & Flight */}
        {step === "request-form-3" && (
          <div className="h-full flex flex-col items-center justify-center px-[4vw] py-[3vh] bg-white">
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-[4vh] px-4">
                <Button variant="ghost" size="lg" className="h-16 w-16 rounded-full" onClick={() => setStep("request-form-2")}>
                  <ChevronLeft className="w-10 h-10" />
                </Button>
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                </div>
                <div className="w-16"></div>
              </div>

              <h2 className="text-3xl font-bold mb-8 text-center">{t.destination}</h2>
              
              <div className="space-y-6 px-4">
                {/* Destination picker */}
                <KioskMapPicker
                  value={requestForm.dropoffLocation}
                  onChange={(val) => setRequestForm({...requestForm, dropoffLocation: val})}
                  placeholder={t.enterDestination || "Search for your destination..."}
                  language={language}
                />

                {/* Flight number */}
                <div>
                  <div className="flex items-center gap-2 mb-3 ml-1">
                    <Plane className="w-6 h-6 text-gray-500" />
                    <Label className="text-xl text-gray-600">{t.flightNo} <span className="text-gray-400 font-normal text-base">(optional)</span></Label>
                  </div>
                  <input
                    readOnly
                    className="w-full rounded-2xl border-2 cursor-pointer bg-white outline-none"
                    style={{
                      height: "88px",
                      fontSize: "1.5rem",
                      padding: "0 20px",
                      borderColor: kbTarget === "flightNumber" ? "#3b82f6" : "#d1d5db",
                    }}
                    placeholder={t.flightNo}
                    value={requestForm.flightNumber}
                    onPointerDown={(e) => { e.preventDefault(); showKb("flightNumber"); }}
                  />
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 mt-4">
                  <div className="flex items-start gap-4">
                    <Info className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-xl font-bold text-blue-900">{t.asap}</p>
                      <p className="text-lg text-blue-700">Request will be processed immediately.</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-24 text-3xl rounded-2xl mt-8 font-bold bg-green-600 hover:bg-green-700"
                  onClick={handleSubmitRequest}
                  disabled={loading || !requestForm.dropoffLocation.trim()}
                >
                  {loading ? "Processing..." : t.submitRequest}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Virtual keyboard — rendered at root level, shared across all form steps */}
        <VirtualKeyboard
          visible={kbVisible}
          value={kbTarget ? requestForm[kbTarget] : ""}
          onInput={handleKbInput}
          onDone={hideKb}
        />

        {/* Hidden printable receipt */}
        <KioskReceipt 
          booking={booking || submittedBooking} 
          language={language}
          translations={translations}
          currencySymbol={currencies.find(c => c.code === currencyCode)?.symbol || "$"}
        />

        {/* Request Submitted - Success */}
        {step === "request-submitted" && booking && (
          <div className="h-full flex flex-col items-center justify-center px-[4vw] py-[3vh] bg-white">
            <div className="w-full max-w-3xl text-center">
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">{t.requestSuccess}</h2>
              <p className="text-2xl text-gray-600 mb-12 px-8">{t.requestSuccessMsg}</p>

              <div className="bg-gray-50 p-8 rounded-3xl border-4 border-gray-100 inline-block mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm inline-block">
                  <BookingQRCode bookingId={booking.id} />
                </div>
                <p className="mt-4 text-xl font-bold text-gray-900">ID: {booking.id}</p>
              </div>

              <div className="flex gap-4 px-4">
                <Button variant="outline" className="flex-1 h-20 text-2xl rounded-2xl border-4" onClick={handleReset}>
                  {t.backToStart}
                </Button>
                <Button className="flex-1 h-20 text-2xl rounded-2xl" onClick={() => window.print()}>
                  <Printer className="mr-3 w-8 h-8" />
                  {t.printReceipt}
                </Button>
              </div>
            </div>
          </div>
        )}
{step === "input" && (
          <div className="h-full flex flex-col items-center justify-center px-[4vw] py-[3vh] bg-white">
            <div className="w-full max-w-3xl">
              <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] text-gray-900 mb-[3vh] text-center leading-tight px-4">{t.enterBooking}</h2>
              
              <div className="space-y-[2vh] px-[2vw]">
                <div>
                  <label className="block text-[clamp(1rem,2vw,1.5rem)] text-gray-600 mb-[1.5vh] text-center">
                    {t.bookingNumber}
                  </label>
                  <Input
                    type="text"
                    value={bookingNumber}
                    onChange={(e) => setBookingNumber(e.target.value)}
                    placeholder="BK-12345"
                    className="text-[clamp(1.5rem,3vw,2rem)] h-[8vh] min-h-[64px] text-center border-4 rounded-xl font-medium"
                    autoFocus
                  />
                </div>

                <div className="space-y-[1.5vh] pt-[1vh]">
                  <Button
                    size="lg"
                    className="w-full h-[8vh] min-h-[64px] text-[clamp(1rem,2vw,1.5rem)]"
                    onClick={handleConfirmBooking}
                    disabled={loading}
                  >
                    <CheckCircle2 className="w-[2.5vw] h-[2.5vw] min-w-[24px] min-h-[24px] mr-3" />
                    {loading ? "Processing..." : t.confirm}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-[8vh] min-h-[64px] text-[clamp(1rem,2vw,1.5rem)] border-4"
                    onClick={() => toast.info("QR Scanner not implemented yet")}
                  >
                    <Scan className="w-[2.5vw] h-[2.5vw] min-w-[24px] min-h-[24px] mr-3" />
                    {t.scanQR}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full h-[6vh] min-h-[48px] text-[clamp(0.875rem,1.5vw,1.25rem)] mt-[2vh]"
                  onClick={handleReset}
                >
                  {t.backToStart}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Screen - Dynamic Responsive */}
        {step === "confirmation" && booking && (
          <div className="h-full flex flex-col items-center justify-start px-[4vw] py-[3vh] bg-white overflow-y-auto">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-[3vh]">
                <div className="w-[12vh] h-[12vh] min-w-[96px] min-h-[96px] bg-green-100 rounded-full flex items-center justify-center mx-auto mb-[2vh]">
                  <CheckCircle2 className="w-[6vh] h-[6vh] min-w-[48px] min-h-[48px] text-green-600" />
                </div>
                <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] text-gray-900 mb-[1.5vh] leading-tight">{t.confirmationSuccess}</h2>
                <p className="text-[clamp(0.875rem,1.8vw,1.25rem)] text-gray-600 px-4">{t.confirmationMessage}</p>
              </div>

              <div className="px-[2vw]">
                {/* QR Code for Cashier */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-[2vh] mb-[3vh]">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-[1.5vh]">
                      <QrCodeIcon className="w-5 h-5 text-blue-600" />
                      <p className="text-[clamp(0.875rem,1.5vw,1.125rem)] text-blue-900 font-semibold">
                        Show this QR code to the cashier
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                      <BookingQRCode bookingId={booking.id} />
                    </div>
                    <p className="text-[clamp(0.75rem,1.3vw,0.875rem)] text-gray-600 mt-[1vh] text-center">
                      Booking ID: {booking.id}
                    </p>
                  </div>
                </div>

                <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] text-gray-900 mb-[2vh]">{t.bookingDetails}</h3>
                <div className="bg-gray-50 rounded-xl p-[2vh] space-y-[1.5vh] border-2 border-gray-200">
                  <div className="space-y-[1.5vh]">
                    <div className="flex justify-between items-start pb-[1vh] border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-gray-600 mb-[0.5vh]">{t.bookingNumber}</p>
                        <p className="text-[clamp(1rem,2vw,1.5rem)] text-gray-900 font-semibold">{booking.id}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pb-[1vh] border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-gray-600 mb-[0.5vh]">{t.passenger}</p>
                        <p className="text-[clamp(1rem,2vw,1.5rem)] text-gray-900 font-semibold">{booking.passenger}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pb-[1vh] border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-gray-600 mb-[0.5vh]">{t.pickupLocation}</p>
                        <p className="text-[clamp(0.875rem,1.8vw,1.125rem)] text-gray-900">{booking.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pb-[1vh] border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-gray-600 mb-[0.5vh]">{t.dropoffLocation}</p>
                        <p className="text-[clamp(0.875rem,1.8vw,1.125rem)] text-gray-900">{booking.dropoffLocation}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pb-[1vh] border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-gray-600 mb-[0.5vh]">{t.scheduledTime}</p>
                        <p className="text-[clamp(0.875rem,1.8vw,1.125rem)] text-gray-900">{booking.scheduledTime || booking.pickupTime}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pb-[1vh] border-b border-gray-200">
                      <div className="flex-1">
                        <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-gray-600 mb-[0.5vh]">{t.vehicleType}</p>
                        <p className="text-[clamp(0.875rem,1.8vw,1.125rem)] text-gray-900">{booking.vehicleType}</p>
                      </div>
                    </div>
                    <div className="pt-[1vh]">
                      <p className="text-[clamp(0.875rem,1.5vw,1rem)] text-gray-600 mb-[1vh]">{t.fare}</p>
                      <p className="text-[clamp(2rem,4vw,3rem)] text-gray-900 font-bold">
                        {formatCurrency(booking.fare, "USD")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-[3vh] space-y-[1.5vh]">
                  <Button
                    size="lg"
                    className="w-full h-[8vh] min-h-[64px] text-[clamp(1rem,2vw,1.5rem)]"
                    onClick={handlePrintReceipt}
                  >
                    <Printer className="w-[2.5vw] h-[2.5vw] min-w-[24px] min-h-[24px] mr-3" />
                    {t.printReceipt}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-[6vh] min-h-[56px] text-[clamp(0.875rem,1.8vw,1.25rem)] border-4"
                    onClick={handleReset}
                  >
                    {t.backToStart}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Kiosk Logout</DialogTitle>
            <DialogDescription className="text-base">
              Please enter the kiosk password to logout and return to the login screen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={logoutPassword}
                onChange={(e) => setLogoutPassword(e.target.value)}
                placeholder="Enter password"
                className="text-xl h-14 border-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogoutVerify();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowLogoutDialog(false);
                setLogoutPassword("");
              }}
              disabled={logoutLoading}
              className="h-12"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLogoutVerify}
              disabled={logoutLoading}
              className="h-12"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutLoading ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}