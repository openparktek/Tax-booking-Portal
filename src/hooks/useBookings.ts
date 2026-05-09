import { useState, useEffect } from "react";
import { bookingsApi } from "../lib/api";

export function useBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsApi.getAll();
      console.log("Fetched bookings:", response);
      setBookings(response.data || []);
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to fetch bookings";
      setError(errorMsg);
      console.error("Error fetching bookings:", err);
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const createBooking = async (data: any) => {
    try {
      const response = await bookingsApi.create(data);
      await fetchBookings(); // Refresh list
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateBooking = async (id: string, data: any) => {
    try {
      const response = await bookingsApi.update(id, data);
      await fetchBookings(); // Refresh list
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await bookingsApi.delete(id);
      await fetchBookings(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}

export function useBooking(id: string) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingsApi.getById(id);
        setBooking(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  return { booking, loading, error };
}
