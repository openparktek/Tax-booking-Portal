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
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import { useCurrency } from "../contexts/CurrencyContext";

interface FareZone {
  id: number;
  name: string;
  vehicleType: string;
  baseFare: number;
  perKm: number;
  nightSurcharge: number;
  active: boolean;
}

interface EditFareDialogProps {
  zone: FareZone;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (zone: FareZone) => void;
}

export default function EditFareDialog({
  zone,
  open,
  onOpenChange,
  onSave,
}: EditFareDialogProps) {
  const [formData, setFormData] = useState<FareZone>(zone);
  const { currency } = useCurrency();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast.success("Fare updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Fare - {zone.name}</DialogTitle>
          <DialogDescription>
            Update pricing for {zone.vehicleType} in {zone.name}
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
                <SelectItem value="Sedan">Sedan</SelectItem>
                <SelectItem value="Luxury Sedan">Luxury Sedan</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
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
                value={formData.baseFare}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseFare: parseFloat(e.target.value),
                  })
                }
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
                value={formData.perKm}
                onChange={(e) =>
                  setFormData({ ...formData, perKm: parseFloat(e.target.value) })
                }
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
              value={formData.nightSurcharge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nightSurcharge: parseFloat(e.target.value),
                })
              }
              className="mt-1.5"
              required
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label htmlFor="active" className="cursor-pointer">
              Active Status
            </Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
