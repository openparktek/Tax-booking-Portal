import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus } from "lucide-react";
import { bookingsApi, companiesApi } from "../lib/api";
import { toast } from "sonner";
import { usePickupLocations } from "../hooks/usePickupLocations";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import { VEHICLE_TYPES } from "../utils/constants";
import { useUser } from "../contexts/UserContext";
import KioskMapPicker from "./kiosk/KioskMapPicker";
import KioskReceipt from "./kiosk/KioskReceipt";
import { CheckCircle2, Printer, X as CloseIcon } from "lucide-react";

export default function CreateBookingDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { locations } = usePickupLocations();
  const [companies, setCompanies] = useState<any[]>([]);
  const { currentUser, isCustomer } = useUser();
  
  const [formData, setFormData] = useState({
    passenger: "",
    phone: "",
    email: "",
    flightNumber: "",
    vehicleType: "",
    company: "",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledTime: "",
  });
  const [submittedBooking, setSubmittedBooking] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-fill customer information when dialog opens
  useEffect(() => {
    if (open && isCustomer && currentUser) {
      console.log("CreateBookingDialog - Pre-filling customer data:", currentUser);
      setFormData(prev => ({
        ...prev,
        passenger: currentUser.name || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
      }));
    }
  }, [open, isCustomer, currentUser]);

  // Load companies from API
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await companiesApi.getAll();
        const companiesData = Array.isArray(response?.data) ? response.data : [];
        console.log("CreateBookingDialog - Companies loaded:", companiesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error("Error loading companies:", error);
        // Fallback to hardcoded companies if API fails
        setCompanies([
          { id: "1", name: "Elite Limo" },
          { id: "2", name: "Luxury Transport" },
          { id: "3", name: "Premier Cars" }
        ]);
      }
    };
    
    if (open) {
      loadCompanies();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Creating booking with data:", formData);
      
      // Calculate estimated fare based on vehicle type
      const estimatedFare = formData.vehicleType.includes("Luxury") ? 145 : 
                            formData.vehicleType === "SUV" ? 120 : 
                            formData.vehicleType === "Van" || formData.vehicleType === "Minibus" ? 95 : 85;
      
      const bookingData = {
        ...formData,
        status: "Pending Assignment", // New bookings need vehicle/driver assignment
        driver: "Unassigned",
        vehiclePlate: "",
        driverId: undefined,
        vehicleId: undefined,
        fare: estimatedFare,
        pickupTime: formData.scheduledTime,
        // Add customer information if this is a customer user
        ...(isCustomer && currentUser ? {
          customerId: currentUser.id,
          customerEmail: currentUser.email,
        } : {}),
      };
      
      const result = await bookingsApi.create(bookingData);
      
      console.log("Booking created successfully:", result);
      
      setSubmittedBooking({ ...bookingData, id: result.data.id });
      setShowSuccess(true);
      
      // Callback to refresh parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(error?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Manual Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess && submittedBooking ? (
          <div className="py-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Created!</h2>
            <p className="text-gray-600 mb-8">
              Booking ID: <span className="font-mono font-bold text-blue-600">{submittedBooking.id}</span>
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.print()}
                className="h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Receipt
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSuccess(false);
                  setSubmittedBooking(null);
                  setOpen(false);
                }}
                className="h-12 text-lg"
              >
                Close
              </Button>
            </div>

            <KioskReceipt booking={submittedBooking} />
          </div>
        ) : (
          <>
            <DialogHeader className="mb-4">
              <DialogTitle>Create New Booking</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new airport limousine booking.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passenger">Passenger Name</Label>
                <Input
                  id="passenger"
                  value={formData.passenger}
                  onChange={(e) =>
                    setFormData({ ...formData, passenger: e.target.value })
                  }
                  required
                  className="mt-1.5"
                  readOnly={isCustomer}
                  disabled={isCustomer}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="mt-1.5"
                  readOnly={isCustomer}
                  disabled={isCustomer}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="mt-1.5"
                  readOnly={isCustomer}
                  disabled={isCustomer}
                />
              </div>
              <div>
                <Label htmlFor="flightNumber">Flight Number</Label>
                <Input
                  id="flightNumber"
                  value={formData.flightNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, flightNumber: e.target.value })
                  }
                  className="mt-1.5"
                  placeholder="e.g., MS123"
                />
              </div>
              <div>
                <Label htmlFor="company">Limousine Company</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company: value })
                  }
                >
                  <SelectTrigger id="company" className="mt-1.5">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        No companies available
                      </div>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id || company.name} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicleType">Vehicle Type Required</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehicleType: value })
                  }
                >
                  <SelectTrigger id="vehicleType" className="mt-1.5">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduledTime">Scheduled Time</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledTime: e.target.value })
                  }
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="pickupLocation">
                  Pickup Location <span className="text-xs text-gray-500">(Airport Terminal)</span>
                </Label>
                <Select
                  value={formData.pickupLocation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pickupLocation: value })
                  }
                >
                  <SelectTrigger id="pickupLocation" className="mt-1.5">
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.filter(loc => loc.active).map((location) => (
                      <SelectItem key={location.id} value={location.name}>
                        {location.name} - {location.terminal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="dropoffLocation" className="mb-2 block">
                  Drop-off Location <span className="text-xs text-gray-500">(Click to select on map)</span>
                </Label>
                <KioskMapPicker
                  value={formData.dropoffLocation}
                  onChange={(loc) => setFormData({ ...formData, dropoffLocation: loc })}
                  placeholder="Search destination on map..."
                  showKeyboard={false}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}