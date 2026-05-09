import { useState } from "react";
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
import { toast } from "sonner";
import { zonesApi } from "../lib/api";
import { useCurrency } from "../contexts/CurrencyContext";
import { VEHICLE_TYPES } from "../utils/constants";

interface AddZoneDialogProps {
  onSuccess: () => void;
}

export default function AddZoneDialog({ onSuccess }: AddZoneDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currency } = useCurrency();
  
  const [formData, setFormData] = useState({
    name: "",
    vehicleType: "",
    baseFare: "",
    perKm: "",
    nightSurcharge: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.vehicleType || !formData.baseFare || !formData.perKm || !formData.nightSurcharge) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await zonesApi.create({
        name: formData.name,
        vehicleType: formData.vehicleType,
        baseFare: parseFloat(formData.baseFare),
        perKm: parseFloat(formData.perKm),
        nightSurcharge: parseFloat(formData.nightSurcharge),
        active: true,
      });
      
      if (response.success) {
        toast.success("Zone added successfully!");
        setFormData({
          name: "",
          vehicleType: "",
          baseFare: "",
          perKm: "",
          nightSurcharge: "",
        });
        setOpen(false);
        onSuccess();
      } else {
        toast.error("Failed to add zone");
      }
    } catch (error: any) {
      console.error("Error adding zone:", error);
      toast.error(error.message || "Failed to add zone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Zone</DialogTitle>
          <DialogDescription>
            Create a new pricing zone for airport limousine services
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="zone-name">Zone Name</Label>
            <Input
              id="zone-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Airport Zone, Downtown, Business District"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="vehicle-type">Vehicle Type</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value) =>
                setFormData({ ...formData, vehicleType: value })
              }
            >
              <SelectTrigger id="vehicle-type" className="mt-1.5">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base-fare">Base Fare ({currency})</Label>
              <Input
                id="base-fare"
                type="number"
                step="0.01"
                min="0"
                value={formData.baseFare}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseFare: e.target.value,
                  })
                }
                placeholder="50.00"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="per-km">Per Km ({currency})</Label>
              <Input
                id="per-km"
                type="number"
                step="0.01"
                min="0"
                value={formData.perKm}
                onChange={(e) =>
                  setFormData({ ...formData, perKm: e.target.value })
                }
                placeholder="2.50"
                className="mt-1.5"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="night-surcharge">Night Surcharge ({currency})</Label>
            <Input
              id="night-surcharge"
              type="number"
              step="0.01"
              min="0"
              value={formData.nightSurcharge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nightSurcharge: e.target.value,
                })
              }
              placeholder="10.00"
              className="mt-1.5"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Zone"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
