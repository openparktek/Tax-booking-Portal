import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
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
import { toast } from "sonner";
import { companiesApi, driversApi } from "../lib/api";

interface EditDriverDialogProps {
  driver: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditDriverDialog({
  driver,
  open,
  onOpenChange,
  onSuccess,
}: EditDriverDialogProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    vehicle: "",
    status: "Online",
    documents: "Valid",
    licenseNumber: "",
    licenseExpiry: "",
  });

  // Load companies from API when dialog opens
  useEffect(() => {
    if (open) {
      const loadCompanies = async () => {
        try {
          setLoadingCompanies(true);
          const response = await companiesApi.getAll();
          const companiesData = Array.isArray(response?.data) ? response.data : [];
          console.log("EditDriverDialog - Companies loaded from API:", companiesData);
          setCompanies(companiesData);
        } catch (error) {
          console.error("EditDriverDialog - Error loading companies:", error);
          toast.error("Failed to load companies");
          setCompanies([]);
        } finally {
          setLoadingCompanies(false);
        }
      };
      
      loadCompanies();
    }
  }, [open]);

  // Update form data when driver changes or dialog opens
  useEffect(() => {
    if (driver && open) {
      console.log("Loading driver data into form:", driver);
      setFormData({
        name: driver.name || "",
        email: driver.email || "",
        phone: driver.phone || "",
        company: driver.company || "",
        vehicle: driver.vehicle || "",
        status: driver.status || "Online",
        documents: driver.documents || "Valid",
        licenseNumber: driver.licenseNumber || "",
        licenseExpiry: driver.licenseExpiry || "",
      });
    }
  }, [driver, open]);

  // Don't render if no driver
  if (!driver && open) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driver) {
      toast.error("No driver selected");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Updating driver ID:", driver.id);
      console.log("With form data:", formData);
      
      // Call the API to update the driver
      const result = await driversApi.update(driver.id, formData);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update driver");
      }
      
      console.log("Driver updated successfully");
      
      toast.success("Driver updated successfully!");
      if (onSuccess) {
        onSuccess(); // Call onSuccess to trigger refresh
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating driver:", error);
      toast.error(error.message || "Failed to update driver");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>
            Update driver information and status
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Driver Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Driver Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="David Lee"
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
                placeholder="david.lee@company.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company">Company</Label>
              <Select
                value={formData.company}
                onValueChange={(value) => handleChange("company", value)}
                disabled={loadingCompanies}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select company"} />
                </SelectTrigger>
                <SelectContent>
                  {companies.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No companies available
                    </div>
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

            {/* Vehicle */}
            <div>
              <Label htmlFor="vehicle">Vehicle Plate</Label>
              <Input
                id="vehicle"
                value={formData.vehicle}
                onChange={(e) => handleChange("vehicle", e.target.value)}
                placeholder="أ ب ج -1234"
                required
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="On Trip">On Trip</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Documents Status */}
            <div>
              <Label htmlFor="documents">Documents Status</Label>
              <Select
                value={formData.documents}
                onValueChange={(value) => handleChange("documents", value)}
              >
                <SelectTrigger id="documents">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Valid">Valid</SelectItem>
                  <SelectItem value="Expiring">Expiring</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* License Number */}
            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
                placeholder="DL123456789"
              />
            </div>

            {/* License Expiry */}
            <div>
              <Label htmlFor="licenseExpiry">License Expiry Date</Label>
              <Input
                id="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) => handleChange("licenseExpiry", e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
