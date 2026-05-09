import { useState, useEffect } from "react";
import { driversApi } from "../lib/api";

export function useDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await driversApi.getAll();
      setDrivers(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching drivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();

    // Listen for drivers cleared event
    const handleDriversCleared = () => {
      console.log("Drivers cleared event received, refreshing...");
      fetchDrivers();
    };

    window.addEventListener('driversCleared', handleDriversCleared);

    return () => {
      window.removeEventListener('driversCleared', handleDriversCleared);
    };
  }, []);

  const createDriver = async (data: any) => {
    try {
      const response = await driversApi.create(data);
      await fetchDrivers(); // Refresh list
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    drivers,
    loading,
    error,
    refresh: fetchDrivers,
    createDriver,
  };
}
