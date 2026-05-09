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
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { bookingsApi } from "../lib/api";
import { toast } from "sonner";
import { usePickupLocations } from "../hooks/usePickupLocations";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import { VEHICLE_TYPES } from "../utils/constants";

interface EditBookingDialogProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditBookingDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: EditBookingDialogProps) {
  console.log("EditBookingDialog - RENDER - open:", open, "booking:", booking);
  
  const [loading, setLoading] = useState(false);
  const { locations } = usePickupLocations();
  
  const [formData, setFormData] = useState({
    passenger: "",
    phone: "",
    email: "",
    flightNumber: "",
    vehicleType: "Sedan",
    pickupLocation: "",
    dropoffLocation: "",
    scheduledTime: "",
  });
  
  console.log("EditBookingDialog - RENDER - formData:", formData);

  // Update form data when dialog opens with a booking
  useEffect(() => {
    console.log("EditBookingDialog - useEffect triggered. open:", open, "booking:", booking);
    
    if (open && booking) {
      console.log("EditBookingDialog - Loading booking data into form:", booking);
      console.log("EditBookingDialog - Booking keys:", Object.keys(booking));
      
      // Handle datetime-local format - convert from ISO string or keep existing datetime-local value
      let scheduledTime = booking.scheduledTime || booking.pickupTime || "";
      
      // If the time is in ISO format, convert it to datetime-local format (YYYY-MM-DDTHH:mm)
      if (scheduledTime && !scheduledTime.includes("T")) {
        // If it's just a display format string, try to parse it
        // For now, set to empty so user can select a new time
        console.log("EditBookingDialog - Time format not recognized, clearing scheduledTime:", scheduledTime);
        scheduledTime = "";
      } else if (scheduledTime && scheduledTime.includes("T")) {
        // It's already in ISO format, convert to datetime-local format
        // Remove seconds and timezone info: "2025-11-29T10:45:00.000Z" -> "2025-11-29T10:45"
        scheduledTime = scheduledTime.slice(0, 16);
      }
      
      const newFormData = {
        passenger: booking.passenger || "",
        phone: booking.phone || "",
        email: booking.email || "",
        flightNumber: booking.flightNumber || "",
        vehicleType: booking.vehicleType || "Sedan",
        pickupLocation: booking.pickupLocation || "",
        dropoffLocation: booking.dropoffLocation || "",
        scheduledTime: scheduledTime,
      };
      
      console.log("EditBookingDialog - Setting form data:", newFormData);
      setFormData(newFormData);
    } else if (open && !booking) {
      console.log("EditBookingDialog - Dialog opened but no booking provided!");
    } else if (!open) {
      console.log("EditBookingDialog - Dialog is closed, resetting form");
      // Reset form when dialog closes
      setFormData({
        passenger: "",
        phone: "",
        email: "",
        flightNumber: "",
        vehicleType: "Sedan",
        pickupLocation: "",
        dropoffLocation: "",
        scheduledTime: "",
      });
    }
  }, [open, booking]);

  // Don't render if no booking
  if (!booking && open) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking) {
      toast.error("No booking selected");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("EditBookingDialog - Updating booking ID:", booking.id);
      console.log("EditBookingDialog - With form data:", formData);
      
      // Ensure both scheduledTime and pickupTime are updated
      const updateData = {
        ...formData,
        pickupTime: formData.scheduledTime, // Also update pickupTime field
      };
      
      console.log("EditBookingDialog - Final update data:", updateData);
      
      const result = await bookingsApi.update(booking.id, updateData);
      
      console.log("EditBookingDialog - Booking updated successfully:", result);
      
      toast.success("Booking updated successfully!");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("EditBookingDialog - Error updating booking:", error);
      toast.error(error?.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Booking - {booking?.id}</DialogTitle>
          <DialogDescription>
            Update the booking details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-passenger">Passenger Name</Label>
              <Input
                id="edit-passenger"
                value={formData.passenger}
                onChange={(e) =>
                  setFormData({ ...formData, passenger: e.target.value })
                }
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-flightNumber">Flight Number</Label>
              <Input
                id="edit-flightNumber"
                value={formData.flightNumber}
                onChange={(e) =>
                  setFormData({ ...formData, flightNumber: e.target.value })
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-vehicleType">Vehicle Type</Label>
              <Select
                value={formData.vehicleType}
                onValueChange={(value) =>
                  setFormData({ ...formData, vehicleType: value })
                }
              >
                <SelectTrigger id="edit-vehicleType" className="mt-1.5">
                  <SelectValue />
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
              <Label htmlFor="edit-scheduledTime">Scheduled Time</Label>
              <Input
                id="edit-scheduledTime"
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
              <Label htmlFor="edit-pickupLocation">Pickup Location</Label>
              <Select
                value={formData.pickupLocation}
                onValueChange={(value) =>
                  setFormData({ ...formData, pickupLocation: value })
                }
              >
                <SelectTrigger id="edit-pickupLocation" className="mt-1.5">
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
              <Label htmlFor="edit-dropoffLocation">Drop-off Location</Label>
              <GooglePlacesAutocomplete
                value={formData.dropoffLocation}
                onChange={(value) =>
                  setFormData({ ...formData, dropoffLocation: value })
                }
                placeholder="Search for destination..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
