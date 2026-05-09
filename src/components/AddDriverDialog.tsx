import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { driversApi, companiesApi, vehiclesApi } from "../lib/api";
import { toast } from "sonner";

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddDriverDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddDriverDialogProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    licenseNumber: "",
    vehicleId: "",
  });

  // Load companies and vehicles
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [companiesRes, vehiclesRes] = await Promise.all([
        companiesApi.getAll(),
        vehiclesApi.getAll(),
      ]);

      if (companiesRes.success) {
        setCompanies(companiesRes.data || []);
      }

      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.company || !formData.phone || !formData.licenseNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await driversApi.create({
        ...formData,
        rating: 5.0, // Default rating for new drivers
        trips: 0,    // New driver starts with 0 trips
      });

      if (result.success) {
        toast.success("Driver added successfully!");
        onOpenChange(false);
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "Failed to add driver");
      }
    } catch (error: any) {
      console.error("Error adding driver:", error);
      toast.error(error.message || "Failed to add driver");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
      licenseNumber: "",
      vehicleId: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filter available vehicles (not assigned to other drivers or same company)
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.company === formData.company
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            Add a new driver to the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Driver Name */}
            <div>
              <Label htmlFor="name">Driver Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter driver name"
                className="mt-1.5"
                required
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.company}
                onValueChange={(value) => {
                  handleChange("company", value);
                  // Reset vehicle selection when company changes
                  handleChange("vehicleId", "");
                }}
              >
                <SelectTrigger id="company" className="mt-1.5">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No companies available
                    </SelectItem>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+966 50 123 4567"
                className="mt-1.5"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="driver@example.com"
                className="mt-1.5"
              />
            </div>

            {/* License Number */}
            <div>
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
                placeholder="DL-123456789"
                className="mt-1.5"
                required
              />
            </div>

            {/* Assigned Vehicle (Optional) */}
            <div>
              <Label htmlFor="vehicleId">Assigned Vehicle</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(value) => handleChange("vehicleId", value)}
                disabled={!formData.company}
              >
                <SelectTrigger id="vehicleId" className="mt-1.5">
                  <SelectValue placeholder="Select vehicle (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {!formData.company ? (
                    <SelectItem value="none" disabled>
                      Select a company first
                    </SelectItem>
                  ) : availableVehicles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No vehicles available for this company
                    </SelectItem>
                  ) : (
                    availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate || vehicle.plateNumber} - {vehicle.brand}{" "}
                        {vehicle.model} ({vehicle.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                You can assign a vehicle later if needed
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Driver"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
