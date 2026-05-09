import { useState, useEffect } from "react";
import { analyticsApi } from "../lib/api";

export function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Don't log to console repeatedly to avoid spam
      if (!error) {
        console.warn("Dashboard stats unavailable - using static data");
      }
      // Set empty stats to prevent errors
      setStats({
        totalTrips: 0,
        activeTrips: 0,
        fleetUtilization: 0,
        revenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Only refresh stats every 60 seconds to reduce API calls
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refresh: fetchStats };
}
