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

interface EditCompanyDialogProps {
  company: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedCompany: any) => void;
}

export default function EditCompanyDialog({
  company,
  open,
  onOpenChange,
  onSuccess,
}: EditCompanyDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    fleetSize: "",
    activeDrivers: "",
    status: "Active",
    settlementCycle: "Weekly",
  });

  // Update form data when company changes or dialog opens
  useEffect(() => {
    if (company && open) {
      console.log("Loading company data into form:", company);
      setFormData({
        name: company.name || "",
        contact: company.contact || "",
        email: company.email || "",
        phone: company.phone || "",
        fleetSize: company.fleetSize?.toString() || "",
        activeDrivers: company.activeDrivers?.toString() || "",
        status: company.status || "Active",
        settlementCycle: company.settlementCycle || "Weekly",
      });
    }
  }, [company, open]);

  // Don't render if no company
  if (!company && open) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company) {
      toast.error("No company selected");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Updating company ID:", company.id);
      console.log("With form data:", formData);
      
      // TODO: Replace with actual API call
      // const result = await companiesApi.update(company.id, formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Company updated successfully");
      
      // Create updated company object with the new data
      const updatedCompany = {
        id: company.id,
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
        phone: formData.phone,
        fleetSize: parseInt(formData.fleetSize) || 0,
        activeDrivers: parseInt(formData.activeDrivers) || 0,
        status: formData.status,
        settlementCycle: formData.settlementCycle,
      };
      
      toast.success("Company updated successfully!");
      onSuccess(updatedCompany);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast.error(error.message || "Failed to update company");
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
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update company information and settings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Elite Limo Service"
                required
              />
            </div>

            {/* Contact Person */}
            <div>
              <Label htmlFor="contact">Contact Person</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
                placeholder="John Anderson"
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
                placeholder="contact@elitelimo.com"
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

            {/* Fleet Size */}
            <div>
              <Label htmlFor="fleetSize">Fleet Size</Label>
              <Input
                id="fleetSize"
                type="number"
                value={formData.fleetSize}
                onChange={(e) => handleChange("fleetSize", e.target.value)}
                placeholder="45"
                required
              />
            </div>

            {/* Active Drivers */}
            <div>
              <Label htmlFor="activeDrivers">Active Drivers</Label>
              <Input
                id="activeDrivers"
                type="number"
                value={formData.activeDrivers}
                onChange={(e) => handleChange("activeDrivers", e.target.value)}
                placeholder="38"
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Settlement Cycle */}
            <div>
              <Label htmlFor="settlementCycle">Settlement Cycle</Label>
              <Select
                value={formData.settlementCycle}
                onValueChange={(value) => handleChange("settlementCycle", value)}
              >
                <SelectTrigger id="settlementCycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
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
