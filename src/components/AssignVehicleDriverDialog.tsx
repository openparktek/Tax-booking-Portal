import { useState, useEffect } from "react";
import { Button } from "./ui/button";
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
import { User } from "lucide-react";
import { bookingsApi, driversApi } from "../lib/api";
import { toast } from "sonner";

interface AssignVehicleDriverDialogProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AssignVehicleDriverDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
}: AssignVehicleDriverDialogProps) {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  // Load drivers from API filtered by company and vehicle type
  useEffect(() => {
    if (open && booking) {
      console.log("AssignVehicle - Dialog opened with booking:", booking);
      loadDrivers();
      // Set existing assignment if any - ensure it's a string
      setSelectedDriverId(booking.driverId ? String(booking.driverId) : "");
    }
  }, [open, booking]);

  const loadDrivers = async () => {
    try {
      const response = await driversApi.getAll();
      const allDrivers = Array.isArray(response?.data) ? response.data : [];
      
      console.log("AssignVehicle - All drivers from API:", allDrivers);
      console.log("AssignVehicle - Booking company:", booking.company);
      console.log("AssignVehicle - Booking vehicle type:", booking.vehicleType);
      
      // Filter by company, vehicle type match, and available status
      const availableDrivers = allDrivers.filter(
        (d: any) =>
          d.company === booking.company &&
          d.vehicleType === booking.vehicleType &&
          d.status === "Available"
      );
      
      console.log("AssignVehicle - Filtered available drivers:", availableDrivers);
      console.log("AssignVehicle - Driver IDs and types:", availableDrivers.map(d => ({ id: d.id, type: typeof d.id })));
      setDrivers(availableDrivers);
    } catch (error) {
      console.error("AssignVehicle - Error loading drivers:", error);
      toast.error("Failed to load drivers");
      setDrivers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }

    setLoading(true);

    try {
      console.log("AssignVehicle - Looking for driver with ID:", selectedDriverId);
      console.log("AssignVehicle - Available drivers:", drivers.map(d => ({ id: d.id, type: typeof d.id })));
      
      // Compare as strings since Select returns string values
      const selectedDriver = drivers.find((d) => String(d.id) === selectedDriverId);

      if (!selectedDriver) {
        console.error("AssignVehicle - Driver not found. Selected ID:", selectedDriverId, "Available IDs:", drivers.map(d => d.id));
        throw new Error("Invalid driver selection");
      }
      
      console.log("AssignVehicle - Found driver:", selectedDriver);

      // Update the booking with assigned driver
      const updatedBooking = {
        ...booking,
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
        status: "Confirmed", // Change status from "Pending Assignment" to "Confirmed"
      };

      await bookingsApi.update(booking.id, updatedBooking);

      toast.success("Driver assigned successfully!");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error assigning driver:", error);
      toast.error(error?.message || "Failed to assign driver");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  console.log("AssignVehicle - RENDER - selectedDriverId:", selectedDriverId, "drivers count:", drivers.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription>
            Assign a driver from your fleet to this booking.
          </DialogDescription>
        </DialogHeader>

        {/* Booking Info */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Booking ID:</span>
            <span className="text-gray-900">{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Passenger:</span>
            <span className="text-gray-900">{booking.passenger}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Company:</span>
            <span className="text-gray-900">{booking.company}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Flight:</span>
            <span className="text-gray-900">{booking.flightNumber || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vehicle Type Needed:</span>
            <span className="text-gray-900">{booking.vehicleType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pickup:</span>
            <span className="text-gray-900">{booking.pickupLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Drop-off:</span>
            <span className="text-gray-900">{booking.dropoffLocation}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Driver Selection */}
          <div>
            <Label htmlFor="driver" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Select Driver
            </Label>
            <Select 
              value={selectedDriverId} 
              onValueChange={(value) => {
                console.log("AssignVehicle - Selected driver ID:", value, "Type:", typeof value);
                setSelectedDriverId(value);
              }}
            >
              <SelectTrigger id="driver" className="mt-1.5">
                <SelectValue placeholder="Choose a driver from your fleet" />
              </SelectTrigger>
              <SelectContent>
                {drivers.length === 0 ? (
                  <SelectItem value="no-drivers" disabled>
                    No available {booking.vehicleType} drivers for {booking.company}
                  </SelectItem>
                ) : (
                  drivers.map((driver) => (
                    <SelectItem key={driver.id} value={String(driver.id)}>
                      {driver.name} - {driver.vehicleType} ({driver.status})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1.5">
              Showing available {booking.vehicleType} drivers from {booking.company}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedDriverId}
            >
              {loading ? "Assigning..." : "Assign & Confirm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}