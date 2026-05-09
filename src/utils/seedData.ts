// Helper function to seed initial data
import { bookingsApi, driversApi, companiesApi, vehiclesApi } from "../lib/api";

export async function seedInitialData() {
  try {
    console.log("Seed data function called - no fixed sample data will be created");
    console.log("All data should be added manually through the application UI");
    
    // This function no longer seeds any fixed sample data
    // Previously it created sample drivers, companies, vehicles, and bookings
    // Now it's empty to avoid confusion with real data
    
    return { success: true, message: "No sample data to seed - add data manually" };
  } catch (error) {
    console.error("Error in seed function:", error);
    return { success: false, error };
  }
}
