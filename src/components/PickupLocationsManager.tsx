import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { usePickupLocations } from "../hooks/usePickupLocations";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

export default function PickupLocationsManager() {
  const { locations, loading, createLocation, updateLocation, deleteLocation } = usePickupLocations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    terminal: "",
    zone: "",
    active: true,
  });

  const handleOpenDialog = (location?: any) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        terminal: location.terminal,
        zone: location.zone,
        active: location.active,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: "",
        terminal: "",
        zone: "",
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
        toast.success("Pickup location updated successfully!");
      } else {
        await createLocation(formData);
        toast.success("Pickup location created successfully!");
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save pickup location");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pickup location?")) {
      return;
    }

    try {
      await deleteLocation(id);
      toast.success("Pickup location deleted successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete pickup location");
    }
  };

  const handleToggleActive = async (location: any) => {
    try {
      await updateLocation(location.id, { active: !location.active });
      toast.success(`Pickup location ${!location.active ? "activated" : "deactivated"}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update location status");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-gray-900 mb-1">Pickup Locations</h3>
          <p className="text-sm text-gray-600">
            Manage available airport pickup locations for bookings
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Pickup Location" : "Add Pickup Location"}
              </DialogTitle>
              <DialogDescription>
                Configure a new pickup location at the airport
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="location-name">Location Name</Label>
                <Input
                  id="location-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Terminal 1 - Arrival Hall A"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="terminal">Terminal</Label>
                <Input
                  id="terminal"
                  value={formData.terminal}
                  onChange={(e) =>
                    setFormData({ ...formData, terminal: e.target.value })
                  }
                  placeholder="e.g., Terminal 1"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="zone">Zone/Gate</Label>
                <Input
                  id="zone"
                  value={formData.zone}
                  onChange={(e) =>
                    setFormData({ ...formData, zone: e.target.value })
                  }
                  placeholder="e.g., Zone A or Gate 3"
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm text-gray-900">Active</p>
                  <p className="text-xs text-gray-600">
                    Available for booking selection
                  </p>
                </div>
                <Switch
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
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLocation ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm text-gray-600">
                Location Name
              </th>
              <th className="text-left py-3 px-4 text-sm text-gray-600">
                Terminal
              </th>
              <th className="text-left py-3 px-4 text-sm text-gray-600">
                Zone
              </th>
              <th className="text-left py-3 px-4 text-sm text-gray-600">
                Status
              </th>
              <th className="text-right py-3 px-4 text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Loading locations...
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No pickup locations configured
                </td>
              </tr>
            ) : (
              locations.map((location) => (
                <tr key={location.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{location.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {location.terminal}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {location.zone}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          location.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {location.active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={location.active}
                        onCheckedChange={() => handleToggleActive(location)}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(location)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
