import React from "react";
import BookingQRCode from "../BookingQRCode";
import { kioskTranslations } from "../../utils/kioskTranslations";

interface KioskReceiptProps {
  booking: any;
  language?: string;
  translations?: any;
  currencySymbol?: string;
}

export default function KioskReceipt({ 
  booking, 
  language = "en", 
  translations = kioskTranslations, 
  currencySymbol = "$" 
}: KioskReceiptProps) {
  if (!booking) return null;

  const t = translations[language] || translations.en || kioskTranslations.en;
  const date = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-GB');

  return (
    <div id="kiosk-receipt" className="hidden print:block p-8 bg-white text-black font-sans" style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider">Airport Limousine</h1>
        <p className="text-lg font-semibold">{t.confirmationSuccess || "Booking Receipt"}</p>
        <p className="text-sm opacity-75">{date}</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-bold">{t.bookingNumber}:</span>
          <span className="font-mono text-lg">{booking.id}</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-bold">{t.passenger}:</span>
          <span>{booking.passenger}</span>
        </div>

        {booking.passengerPhone && (
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">{t.phoneNumber}:</span>
            <span>{booking.passengerPhone}</span>
          </div>
        )}

        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-bold">{t.pickupLocation}:</span>
          <span className="text-right ml-4">{booking.pickupLocation || booking.pickupLoc?.name}</span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-bold">{t.destination}:</span>
          <span className="text-right ml-4">{booking.dropoffLocation}</span>
        </div>

        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="font-bold">{t.vehicleType}:</span>
          <span>{booking.vehicleType}</span>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-black flex justify-between items-center">
          <span className="text-xl font-black uppercase">{t.fare}:</span>
          <span className="text-2xl font-black">
            {currencySymbol}{booking.fare}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 mt-8">
        <div className="bg-white p-2 border-2 border-black">
          <BookingQRCode bookingId={booking.id} size={180} />
        </div>
        <p className="text-xs font-bold text-center mt-2 uppercase tracking-widest">
          Please show this at the cashier
        </p>
      </div>

      <div className="mt-10 pt-4 border-t border-dashed border-gray-400 text-center text-[10px] uppercase opacity-50">
        <p>Thank you for choosing our service</p>
        <p>OpenPark Booking System</p>
      </div>
    </div>
  );
}
