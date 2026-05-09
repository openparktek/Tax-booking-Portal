import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Save, MapPin, Trash2 } from "lucide-react";
import { Switch } from "../../components/ui/switch";
import EditFareDialog from "../../components/EditFareDialog";
import AddZoneDialog from "../../components/AddZoneDialog";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import { zonesApi } from "../../lib/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

export default function FaresZones() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Load zones from API
  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const response = await zonesApi.getAll();
      if (response.success) {
        setZones(response.data || []);
        console.log("Zones loaded:", response.data);
      } else {
        toast.error("Failed to load zones");
      }
    } catch (error: any) {
      console.error("Error loading zones:", error);
      toast.error(error.message || "Failed to load zones");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zone: any) => {
    setEditingZone(zone);
    setEditDialogOpen(true);
  };

  const handleSave = async (updatedZone: any) => {
    try {
      const response = await zonesApi.update(updatedZone.id, updatedZone);
      if (response.success) {
        setZones(zones.map((z) => (z.id === updatedZone.id ? response.data : z)));
        toast.success("Zone updated successfully");
      } else {
        toast.error("Failed to update zone");
      }
    } catch (error: any) {
      console.error("Error updating zone:", error);
      toast.error(error.message || "Failed to update zone");
    }
  };

  const handleToggleActive = async (id: string) => {
    const zone = zones.find((z) => z.id === id);
    if (!zone) return;

    try {
      const response = await zonesApi.update(id, { ...zone, active: !zone.active });
      if (response.success) {
        setZones(zones.map((z) => (z.id === id ? { ...z, active: !z.active } : z)));
        toast.success(`Zone ${zone.active ? "deactivated" : "activated"}`);
      } else {
        toast.error("Failed to update zone");
      }
    } catch (error: any) {
      console.error("Error toggling zone:", error);
      toast.error(error.message || "Failed to update zone");
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      const response = await zonesApi.clearAll();
      if (response.success) {
        toast.success(response.message || "All zones cleared successfully");
        setZones([]);
        setClearDialogOpen(false);
      } else {
        toast.error("Failed to clear zones");
      }
    } catch (error: any) {
      console.error("Error clearing zones:", error);
      toast.error(error.message || "Failed to clear zones");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteZone = async (id: string) => {
    try {
      const response = await zonesApi.delete(id);
      if (response.success) {
        setZones(zones.filter((z) => z.id !== id));
        toast.success("Zone deleted successfully");
      } else {
        toast.error("Failed to delete zone");
      }
    } catch (error: any) {
      console.error("Error deleting zone:", error);
      toast.error(error.message || "Failed to delete zone");
    }
  };

  // Group zones by zone name for the map view
  const uniqueZones = Array.from(
    new Set(zones.map((z) => z.name))
  ).map((name, index) => {
    const zoneRecords = zones.filter((z) => z.name === name);
    const trips = zoneRecords.reduce((sum, z) => sum + (z.trips || 0), 0);
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#f43f5e",
    ];
    return {
      id: index + 1,
      name,
      color: colors[index % colors.length],
      trips,
    };
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Fares & Zones</h1>
          <p className="text-gray-600">
            Manage pricing and geographical zones
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setClearDialogOpen(true)}
            disabled={zones.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Zones
          </Button>
          <AddZoneDialog onSuccess={loadZones} />
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-6">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                {zones.length === 0
                  ? "No zones configured. Use the Clear All Zones button above to start fresh, then add your zones below."
                  : `${zones.length} zone configuration${zones.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-600">
                Loading zones...
              </div>
            ) : zones.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  No zones configured yet. Start by adding your first zone.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">
                        Zone
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">
                        Vehicle Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">
                        Base Fare
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">
                        Per Km
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">
                        Night Surcharge
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">
                        Active
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {zone.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {zone.vehicleType}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <CurrencyDisplay amount={zone.baseFare} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <CurrencyDisplay amount={zone.perKm} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <CurrencyDisplay amount={zone.nightSurcharge} />
                        </td>
                        <td className="py-3 px-4">
                          <Switch
                            checked={zone.active}
                            onCheckedChange={() => handleToggleActive(zone.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(zone)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteZone(zone.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <div className="grid grid-cols-4 gap-6">
            <Card className="col-span-3 p-6">
              <h3 className="text-gray-900 mb-4">Zone Map</h3>
              <div className="bg-gray-100 rounded-lg h-[600px] relative overflow-hidden">
                {/* Map background */}
                <div className="absolute inset-0 opacity-30">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 600"
                    className="text-gray-400"
                  >
                    <path
                      d="M 0 200 L 800 200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M 0 400 L 800 400"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M 200 0 L 200 600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M 400 0 L 400 600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M 600 0 L 600 600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Placeholder message if no zones */}
                {uniqueZones.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">
                      No zones to display on map
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Zone polygons */}
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 800 600"
                      className="absolute inset-0"
                    >
                      {uniqueZones.slice(0, 5).map((zone, index) => {
                        const polygonPositions = [
                          "50,50 250,50 250,250 50,250",
                          "300,150 550,150 550,350 300,350",
                          "600,100 750,100 750,300 600,300",
                          "100,350 300,350 300,550 100,550",
                          "400,400 650,400 650,550 400,550",
                        ];
                        return (
                          <polygon
                            key={zone.id}
                            points={polygonPositions[index]}
                            fill={zone.color}
                            opacity="0.2"
                            stroke={zone.color}
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>

                    {/* Zone labels */}
                    {uniqueZones.slice(0, 5).map((zone, index) => {
                      const labelPositions = [
                        { top: "6rem", left: "6rem" },
                        { top: "12rem", left: "24rem" },
                        { top: "8rem", right: "6rem" },
                        { bottom: "8rem", left: "8rem" },
                        { bottom: "6rem", right: "12rem" },
                      ];
                      const pos = labelPositions[index];
                      return (
                        <div
                          key={zone.id}
                          className="absolute bg-white px-3 py-2 rounded-lg shadow-md"
                          style={pos}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: zone.color }}
                            ></div>
                            <span className="text-sm text-gray-900">
                              {zone.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Zones</h3>
              <div className="space-y-3">
                {uniqueZones.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No zones configured
                  </p>
                ) : (
                  uniqueZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: zone.color }}
                        ></div>
                        <p className="text-sm text-gray-900">{zone.name}</p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {zone.trips} trips this month
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Fare Dialog */}
      {editingZone && (
        <EditFareDialog
          zone={editingZone}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSave}
        />
      )}

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Zones</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {zones.length} zone configuration(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              disabled={clearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {clearing ? "Clearing..." : "Clear All Zones"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
