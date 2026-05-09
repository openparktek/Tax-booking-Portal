import { Link, useParams } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  User,
  Car,
  Star,
  QrCode,
  Printer,
  UserX,
  RefreshCw,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import { bookingsApi } from "../../lib/api";
import { toast } from "sonner";
import { useUser } from "../../contexts/UserContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import QRCode from "react-qr-code";
import KioskReceipt from "../../components/kiosk/KioskReceipt";

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Waiting: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
  "Pending Assignment": "bg-orange-100 text-orange-700",
  "Confirmed at Airport": "bg-purple-100 text-purple-700",
  Confirmed: "bg-green-100 text-green-700",
};

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isCustomer, hasPermission } = useUser();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await bookingsApi.getById(id);
      if (response.success) {
        setBooking(response.data);
      } else {
        toast.error("Failed to load booking");
      }
    } catch (error) {
      console.error("Error loading booking:", error);
      toast.error("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      toast.loading("Sending booking confirmation email...");
      // TODO: Implement email API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      toast.dismiss();
      toast.success("Booking confirmation sent to " + booking.email);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to send email");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-1">Booking Details</h1>
            <p className="text-gray-600">Booking ID: {booking.id}</p>
          </div>
          <div className="flex gap-3">
            {!isCustomer && hasPermission('fleet') && booking.status !== 'Pending Assignment' && (
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reassign Driver
              </Button>
            )}
            {!isCustomer && (
              <Button variant="outline" className="text-red-600">
                <UserX className="w-4 h-4 mr-2" />
                Cancel Booking
              </Button>
            )}
            <Button onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <KioskReceipt booking={booking} />
            <Button
              variant="outline"
              className="text-blue-600"
              onClick={handleSendEmail}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Passenger Info */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Passenger Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="text-gray-900">{booking.passenger}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {booking.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">{booking.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Flight Number</p>
                <p className="text-gray-900">{booking.flightNumber || "N/A"}</p>
              </div>
            </div>
          </Card>

          {/* Trip Info */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Trip Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                  <p className="text-gray-900">
                    {booking.pickupLocation || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Drop-off Location</p>
                  <p className="text-gray-900">
                    {booking.dropoffLocation || "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Scheduled Time</p>
                  <p className="text-gray-900">{booking.scheduledTime || booking.pickupTime || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vehicle Type</p>
                  <p className="text-gray-900">{booking.vehicleType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Company</p>
                  <p className="text-gray-900">{booking.company || "N/A"}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Fare Breakdown */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Fare Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-900">Estimated Fare</span>
                <span className="text-gray-900">{formatCurrency(booking.fare || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status</span>
                <span className="text-gray-900">Pending</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Trip Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200"></div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-900 mb-1">Booking Created</p>
                  <p className="text-sm text-gray-600">Nov 29, 9:45 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200"></div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-900 mb-1">Driver Assigned</p>
                  <p className="text-sm text-gray-600">Nov 29, 9:47 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200"></div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-900 mb-1">Driver En Route</p>
                  <p className="text-sm text-gray-600">Nov 29, 10:15 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-gray-600 mb-1">Passenger Picked Up</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Badge */}
          <Card className="p-6">
            <div className="text-center">
              <Badge
                className={`${
                  statusColors[booking.status] || "bg-gray-100 text-gray-700"
                } px-4 py-2 text-base mb-3`}
              >
                {booking.status}
              </Badge>
              <p className="text-sm text-gray-600">
                {booking.status === 'Pending Assignment' 
                  ? 'Waiting for driver assignment' 
                  : 'Driver is on the way to pickup location'}
              </p>
            </div>
          </Card>

          {/* Driver Info - Only show if driver is assigned */}
          {booking.driver && booking.driver !== 'Unassigned' && (
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Driver</h3>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">{booking.driver}</p>
                  <p className="text-sm text-gray-600">{booking.company || "N/A"}</p>
                </div>
              </div>
              {booking.driverPhone && (
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Driver
                </Button>
              )}
            </Card>
          )}

          {/* Vehicle Info - Only show if vehicle is assigned */}
          {booking.vehiclePlate && booking.vehiclePlate !== '' && (
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Vehicle</h3>
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-4">
                <Car className="w-12 h-12 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Plate Number</p>
                  <p className="text-gray-900">{booking.vehiclePlate}</p>
                </div>
                {booking.vehicleType && (
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-gray-900">{booking.vehicleType}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* QR Code */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4 text-center">Booking QR Code</h3>
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center">
              <QRCode
                value={booking.id}
                size={128}
                level="L"
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Scan at kiosk to confirm booking
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}