import { useState, useEffect } from "react";
import { pickupLocationsApi } from "../lib/api";

export interface PickupLocation {
  id: string;
  name: string;
  terminal: string;
  zone: string;
  active: boolean;
  createdAt: string;
}

// Removed local getAuthHeaders as it's handled by apiCall

export function usePickupLocations() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await pickupLocationsApi.getAll();
      // Handle different response formats (backend might return { success: true, data: [...] } or { locations: [...] })
      const data = response.data || response.locations || response;
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pickup locations:", error);
      setLocations([
        { id: "1", name: "Terminal 1 - Arrival Hall A", terminal: "Terminal 1", zone: "A", active: true, createdAt: new Date().toISOString() },
        { id: "2", name: "Terminal 1 - Arrival Hall B", terminal: "Terminal 1", zone: "B", active: true, createdAt: new Date().toISOString() },
        { id: "3", name: "Terminal 2 - Arrival Hall C", terminal: "Terminal 2", zone: "C", active: true, createdAt: new Date().toISOString() },
        { id: "4", name: "Terminal 3 - Arrival Hall D", terminal: "Terminal 3", zone: "D", active: true, createdAt: new Date().toISOString() },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLocations(); }, []);

  const createLocation = async (location: Omit<PickupLocation, "id" | "createdAt">) => {
    try {
      await pickupLocationsApi.create(location);
      await fetchLocations();
      return true;
    } catch (error) { console.error("Error creating pickup location:", error); throw error; }
  };

  const updateLocation = async (id: string, updates: Partial<PickupLocation>) => {
    try {
      await pickupLocationsApi.update(id, updates);
      await fetchLocations();
      return true;
    } catch (error) { console.error("Error updating pickup location:", error); throw error; }
  };

  const deleteLocation = async (id: string) => {
    try {
      await pickupLocationsApi.delete(id);
      await fetchLocations();
      return true;
    } catch (error) { console.error("Error deleting pickup location:", error); throw error; }
  };

  return { locations, loading, refresh: fetchLocations, createLocation, updateLocation, deleteLocation };
}
