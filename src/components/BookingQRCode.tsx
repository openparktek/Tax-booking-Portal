import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface BookingQRCodeProps {
  bookingId: string;
  size?: number;
}

export default function BookingQRCode({ bookingId, size = 180 }: BookingQRCodeProps) {
  const [qrDataURL, setQrDataURL] = useState("");

  useEffect(() => {
    if (bookingId) {
      QRCode.toDataURL(bookingId, { width: size, margin: 1 })
        .then((url) => setQrDataURL(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [bookingId, size]);

  if (!qrDataURL) {
    return (
      <div 
        className="bg-gray-100 rounded animate-pulse flex items-center justify-center" 
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <img
      src={qrDataURL}
      alt="Booking QR Code"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
