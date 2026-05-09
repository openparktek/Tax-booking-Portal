import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", logger(console.log));
app.use("*", cors());

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Health check
app.get("/make-server-eaaf5c1c/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ==================== BOOKINGS ====================

// Get all bookings
app.get("/make-server-eaaf5c1c/bookings", async (c) => {
  try {
    const bookings = await kv.getByPrefix("booking:");
    return c.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return c.json({ success: false, error: "Failed to fetch bookings" }, 500);
  }
});

// Get single booking
app.get("/make-server-eaaf5c1c/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const booking = await kv.get(`booking:${id}`);
    
    if (!booking) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    return c.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return c.json({ success: false, error: "Failed to fetch booking" }, 500);
  }
});

// Create booking
app.post("/make-server-eaaf5c1c/bookings", async (c) => {
  try {
    const body = await c.req.json();
    const id = `BK-${Date.now()}`;
    const booking = {
      id,
      ...body,
      status: body.status || "Waiting", // Use provided status or default to "Waiting"
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`booking:${id}`, booking);
    return c.json({ success: true, data: booking }, 201);
  } catch (error) {
    console.error("Error creating booking:", error);
    return c.json({ success: false, error: "Failed to create booking" }, 500);
  }
});

// Update booking
app.put("/make-server-eaaf5c1c/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`booking:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating booking:", error);
    return c.json({ success: false, error: "Failed to update booking" }, 500);
  }
});

// Delete booking
app.delete("/make-server-eaaf5c1c/bookings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`booking:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Booking not found" }, 404);
    }
    
    await kv.del(`booking:${id}`);
    return c.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return c.json({ success: false, error: "Failed to delete booking" }, 500);
  }
});

// ==================== DRIVERS ====================

// Get all drivers
app.get("/make-server-eaaf5c1c/drivers", async (c) => {
  try {
    const drivers = await kv.getByPrefix("driver:");
    return c.json({ success: true, data: drivers });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return c.json({ success: false, error: "Failed to fetch drivers" }, 500);
  }
});

// Get single driver
app.get("/make-server-eaaf5c1c/drivers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const driver = await kv.get(`driver:${id}`);
    
    if (!driver) {
      return c.json({ success: false, error: "Driver not found" }, 404);
    }
    
    return c.json({ success: true, data: driver });
  } catch (error) {
    console.error("Error fetching driver:", error);
    return c.json({ success: false, error: "Failed to fetch driver" }, 500);
  }
});

// Create driver
app.post("/make-server-eaaf5c1c/drivers", async (c) => {
  try {
    const body = await c.req.json();
    const id = `DRV-${Date.now()}`;
    const driver = {
      id,
      ...body,
      status: "Offline",
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`driver:${id}`, driver);
    return c.json({ success: true, data: driver }, 201);
  } catch (error) {
    console.error("Error creating driver:", error);
    return c.json({ success: false, error: "Failed to create driver" }, 500);
  }
});

// Update driver
app.put("/make-server-eaaf5c1c/drivers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`driver:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Driver not found" }, 404);
    }
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`driver:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating driver:", error);
    return c.json({ success: false, error: "Failed to update driver" }, 500);
  }
});

// Delete driver
app.delete("/make-server-eaaf5c1c/drivers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`driver:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Driver not found" }, 404);
    }
    
    await kv.del(`driver:${id}`);
    return c.json({ success: true, message: "Driver deleted successfully" });
  } catch (error) {
    console.error("Error deleting driver:", error);
    return c.json({ success: false, error: "Failed to delete driver" }, 500);
  }
});

// Clear all drivers (useful for removing sample data)
app.delete("/make-server-eaaf5c1c/drivers", async (c) => {
  try {
    // Get all driver keys directly from the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { data: driverKeys, error: dbError } = await supabase
      .from("kv_store_eaaf5c1c")
      .select("key, value")
      .like("key", "driver:%");
    
    if (dbError) {
      console.error("Database error fetching drivers:", dbError);
      throw dbError;
    }
    
    console.log(`Found ${driverKeys?.length || 0} drivers to clear`);
    
    // Delete each driver using their exact key
    for (const entry of (driverKeys || [])) {
      console.log(`Deleting driver with key: ${entry.key}`);
      await kv.del(entry.key);
    }
    
    return c.json({ 
      success: true, 
      message: `Successfully cleared ${driverKeys?.length || 0} driver(s)`,
      count: driverKeys?.length || 0
    });
  } catch (error) {
    console.error("Error clearing drivers:", error);
    return c.json({ success: false, error: "Failed to clear drivers" }, 500);
  }
});

// ==================== COMPANIES ====================

// Get all companies
app.get("/make-server-eaaf5c1c/companies", async (c) => {
  try {
    const companies = await kv.getByPrefix("company:");
    return c.json({ success: true, data: companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return c.json({ success: false, error: "Failed to fetch companies" }, 500);
  }
});

// Get company by ID
app.get("/make-server-eaaf5c1c/companies/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const company = await kv.get(`company:${id}`);
    
    if (!company) {
      return c.json({ success: false, error: "Company not found" }, 404);
    }
    
    return c.json({ success: true, data: company });
  } catch (error) {
    console.error("Error fetching company:", error);
    return c.json({ success: false, error: "Failed to fetch company" }, 500);
  }
});

// Create company
app.post("/make-server-eaaf5c1c/companies", async (c) => {
  try {
    const body = await c.req.json();
    const id = `COMP-${Date.now()}`;
    const company = {
      id,
      ...body,
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`company:${id}`, company);
    return c.json({ success: true, data: company }, 201);
  } catch (error) {
    console.error("Error creating company:", error);
    return c.json({ success: false, error: "Failed to create company" }, 500);
  }
});

// ==================== VEHICLES ====================

// Get all vehicles
app.get("/make-server-eaaf5c1c/vehicles", async (c) => {
  try {
    const vehicles = await kv.getByPrefix("vehicle:");
    return c.json({ success: true, data: vehicles });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return c.json({ success: false, error: "Failed to fetch vehicles" }, 500);
  }
});

// Create vehicle
app.post("/make-server-eaaf5c1c/vehicles", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.plateNumber || `VEH-${Date.now()}`;
    const vehicle = {
      ...body,
      id: id, // Use plate number as ID for consistency
      plate: body.plateNumber, // Store both plate and plateNumber for compatibility
      status: body.status || "Available",
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`vehicle:${id}`, vehicle);
    return c.json({ success: true, data: vehicle }, 201);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return c.json({ success: false, error: "Failed to create vehicle" }, 500);
  }
});

// Update vehicle
app.put("/make-server-eaaf5c1c/vehicles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    let existing = await kv.get(`vehicle:${id}`);
    let keyToUpdate = `vehicle:${id}`;
    
    // If not found by ID, try to find by searching all vehicles
    if (!existing) {
      console.log(`Vehicle not found by ID ${id}, searching all vehicles...`);
      const allVehicles = await kv.getByPrefix("vehicle:");
      const foundVehicle = allVehicles.find((v: any) => 
        v.id === id || v.plate === id || v.plateNumber === id
      );
      
      if (foundVehicle) {
        existing = foundVehicle;
        // Use the most reliable identifier as the key
        keyToUpdate = `vehicle:${foundVehicle.plate || foundVehicle.plateNumber || foundVehicle.id}`;
      }
    }
    
    if (!existing) {
      console.error(`Vehicle not found for update: ${id}`);
      return c.json({ success: false, error: "Vehicle not found" }, 404);
    }
    
    // Check if plate number is being changed
    const newPlateNumber = body.plateNumber || body.plate;
    const oldPlateNumber = existing.plate || existing.plateNumber || existing.id;
    const plateChanged = newPlateNumber && newPlateNumber !== oldPlateNumber;
    
    const updatedVehicle = {
      ...existing,
      ...body,
      id: plateChanged ? newPlateNumber : (existing.id || oldPlateNumber),
      plate: newPlateNumber || existing.plate,
      plateNumber: newPlateNumber || existing.plateNumber,
      updatedAt: new Date().toISOString(),
    };
    
    if (plateChanged) {
      // Delete old entry and create new one with new plate as ID
      console.log(`Vehicle plate changed from ${oldPlateNumber} to ${newPlateNumber}`);
      await kv.del(keyToUpdate);
      // Also clean up any alternate keys
      if (existing.plate) await kv.del(`vehicle:${existing.plate}`);
      if (existing.plateNumber) await kv.del(`vehicle:${existing.plateNumber}`);
      if (existing.id) await kv.del(`vehicle:${existing.id}`);
      
      await kv.set(`vehicle:${newPlateNumber}`, updatedVehicle);
    } else {
      // Just update the existing entry
      console.log(`Updating vehicle with key: ${keyToUpdate}`);
      await kv.set(keyToUpdate, updatedVehicle);
    }
    
    return c.json({ success: true, data: updatedVehicle });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return c.json({ success: false, error: "Failed to update vehicle" }, 500);
  }
});

// Delete vehicle
app.delete("/make-server-eaaf5c1c/vehicles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`[DELETE VEHICLE] Attempting to delete vehicle: ${id}`);
    
    // First, get ALL database keys to find the exact match
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );
    
    const { data: dbKeys, error: dbError } = await supabase
      .from("kv_store_eaaf5c1c")
      .select("key, value")
      .like("key", "vehicle:%");
    
    if (dbError) {
      console.error(`[DELETE VEHICLE] Database error:`, dbError);
      throw dbError;
    }
    
    console.log(`[DELETE VEHICLE] Found ${dbKeys?.length || 0} vehicles in database`);
    
    // Find the matching vehicle(s)
    const matchingEntries = dbKeys?.filter((entry: any) => {
      const v = entry.value;
      const matches = v.id === id || v.plate === id || v.plateNumber === id;
      if (matches) {
        console.log(`[DELETE VEHICLE] Match found - Key: ${entry.key}, Vehicle ID: ${v.id}, Plate: ${v.plate || v.plateNumber}`);
      }
      return matches;
    }) || [];
    
    if (matchingEntries.length === 0) {
      console.error(`[DELETE VEHICLE] No matching vehicle found for ID: ${id}`);
      console.log(`[DELETE VEHICLE] All database keys:`, dbKeys?.map((e: any) => ({
        key: e.key,
        id: e.value.id,
        plate: e.value.plate || e.value.plateNumber
      })));
      return c.json({ success: false, error: "Vehicle not found" }, 404);
    }
    
    // Delete all matching entries
    console.log(`[DELETE VEHICLE] Deleting ${matchingEntries.length} matching entries`);
    const keysToDelete = matchingEntries.map((entry: any) => entry.key);
    
    for (const key of keysToDelete) {
      console.log(`[DELETE VEHICLE] Deleting key: ${key}`);
      await kv.del(key);
    }
    
    console.log(`[DELETE VEHICLE] Successfully deleted vehicle ${id}`);
    return c.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return c.json({ success: false, error: "Failed to delete vehicle" }, 500);
  }
});

// Clean up orphaned vehicles (vehicles with non-existent companies)
app.post("/make-server-eaaf5c1c/vehicles/cleanup-orphaned", async (c) => {
  try {
    const vehicles = await kv.getByPrefix("vehicle:");
    const companies = await kv.getByPrefix("company:");
    
    // Create a set of valid company names
    const validCompanyNames = new Set(companies.map((company: any) => company.name));
    
    console.log(`Found ${vehicles.length} vehicles and ${companies.length} companies`);
    console.log(`Valid company names:`, Array.from(validCompanyNames));
    
    // Find vehicles whose company name doesn't exist in the companies list
    const orphanedVehicles = vehicles.filter((vehicle: any) => {
      const hasValidCompany = validCompanyNames.has(vehicle.company);
      if (!hasValidCompany) {
        console.log(`Orphaned vehicle found: ${vehicle.plate} (${vehicle.company})`);
      }
      return !hasValidCompany;
    });
    
    console.log(`Found ${orphanedVehicles.length} orphaned vehicles to delete`);
    
    // Delete all orphaned vehicles using multiple key attempts
    for (const vehicle of orphanedVehicles) {
      const possibleKeys = [
        `vehicle:${vehicle.id}`,
        `vehicle:${vehicle.plate}`,
        `vehicle:${vehicle.plateNumber}`
      ].filter(Boolean);
      
      for (const key of possibleKeys) {
        await kv.del(key);
      }
      
      console.log(`Deleted orphaned vehicle: ${vehicle.plate} (${vehicle.company})`);
    }
    
    return c.json({ 
      success: true, 
      message: `Cleaned up ${orphanedVehicles.length} orphaned vehicle(s)`,
      deletedVehicles: orphanedVehicles.map((v: any) => ({ id: v.id, plate: v.plate, company: v.company }))
    });
  } catch (error) {
    console.error("Error cleaning up orphaned vehicles:", error);
    return c.json({ success: false, error: "Failed to clean up orphaned vehicles" }, 500);
  }
});

// Get all vehicle keys (for debugging)
app.get("/make-server-eaaf5c1c/vehicles/debug-keys", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );
    
    const { data, error } = await supabase
      .from("kv_store_eaaf5c1c")
      .select("key, value")
      .like("key", "vehicle:%");
    
    if (error) {
      throw error;
    }
    
    const vehicleData = data.map((item: any) => ({
      key: item.key,
      plate: item.value.plate || item.value.plateNumber,
      id: item.value.id,
      company: item.value.company
    }));
    
    return c.json({ success: true, data: vehicleData });
  } catch (error) {
    console.error("Error getting vehicle keys:", error);
    return c.json({ success: false, error: "Failed to get vehicle keys" }, 500);
  }
});

// ==================== ANALYTICS ====================

// Get dashboard stats
app.get("/make-server-eaaf5c1c/analytics/dashboard", async (c) => {
  try {
    const bookings = await kv.getByPrefix("booking:");
    const drivers = await kv.getByPrefix("driver:");
    const vehicles = await kv.getByPrefix("vehicle:");
    
    const today = new Date().toDateString();
    const todayBookings = bookings.filter((b: any) => 
      new Date(b.createdAt).toDateString() === today
    );
    
    const activeTrips = bookings.filter((b: any) => 
      b.status === "In Progress" || b.status === "Waiting"
    );
    
    const availableVehicles = vehicles.filter((v: any) => v.status === "Available");
    const utilization = vehicles.length > 0 
      ? ((vehicles.length - availableVehicles.length) / vehicles.length * 100).toFixed(0)
      : 0;
    
    const todayRevenue = todayBookings.reduce((sum: number, b: any) => {
      // Handle both string format ("$85.00") and number format (85)
      let fare = 0;
      if (typeof b.fare === 'number') {
        fare = b.fare;
      } else if (typeof b.fare === 'string') {
        fare = parseFloat(b.fare.replace('$', '') || '0');
      }
      return sum + fare;
    }, 0);
    
    return c.json({
      success: true,
      data: {
        totalTripsToday: todayBookings.length,
        activeTrips: activeTrips.length,
        fleetUtilization: utilization,
        revenueToday: todayRevenue,
        totalDrivers: drivers.length,
        totalVehicles: vehicles.length,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return c.json({ success: false, error: "Failed to fetch analytics" }, 500);
  }
});

// ==================== LIVE TRIPS ====================

// Get live trips
app.get("/make-server-eaaf5c1c/trips/live", async (c) => {
  try {
    const bookings = await kv.getByPrefix("booking:");
    const liveTrips = bookings.filter((b: any) => 
      b.status === "In Progress" || b.status === "Waiting"
    );
    
    return c.json({ success: true, data: liveTrips });
  } catch (error) {
    console.error("Error fetching live trips:", error);
    return c.json({ success: false, error: "Failed to fetch live trips" }, 500);
  }
});

// ==================== ZONES & FARES ====================

// Get all zones/fares
app.get("/make-server-eaaf5c1c/zones", async (c) => {
  try {
    const zones = await kv.getByPrefix("zone:");
    return c.json({ success: true, data: zones });
  } catch (error) {
    console.error("Error fetching zones:", error);
    return c.json({ success: false, error: "Failed to fetch zones" }, 500);
  }
});

// Create zone/fare
app.post("/make-server-eaaf5c1c/zones", async (c) => {
  try {
    const body = await c.req.json();
    const id = `ZONE-${Date.now()}`;
    const zone = {
      id,
      ...body,
      active: body.active !== undefined ? body.active : true,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`zone:${id}`, zone);
    return c.json({ success: true, data: zone }, 201);
  } catch (error) {
    console.error("Error creating zone:", error);
    return c.json({ success: false, error: "Failed to create zone" }, 500);
  }
});

// Update zone/fare
app.put("/make-server-eaaf5c1c/zones/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`zone:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Zone not found" }, 404);
    }
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`zone:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating zone:", error);
    return c.json({ success: false, error: "Failed to update zone" }, 500);
  }
});

// Delete zone/fare
app.delete("/make-server-eaaf5c1c/zones/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`zone:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Zone not found" }, 404);
    }
    
    await kv.del(`zone:${id}`);
    return c.json({ success: true, message: "Zone deleted successfully" });
  } catch (error) {
    console.error("Error deleting zone:", error);
    return c.json({ success: false, error: "Failed to delete zone" }, 500);
  }
});

// Clear all zones (useful for removing sample data)
app.delete("/make-server-eaaf5c1c/zones", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { data: zoneKeys, error: dbError } = await supabase
      .from("kv_store_eaaf5c1c")
      .select("key, value")
      .like("key", "zone:%");
    
    if (dbError) {
      console.error("Database error fetching zones:", dbError);
      throw dbError;
    }
    
    console.log(`Found ${zoneKeys?.length || 0} zones to clear`);
    
    for (const entry of (zoneKeys || [])) {
      console.log(`Deleting zone with key: ${entry.key}`);
      await kv.del(entry.key);
    }
    
    return c.json({ 
      success: true, 
      message: `Successfully cleared ${zoneKeys?.length || 0} zone(s)`,
      count: zoneKeys?.length || 0
    });
  } catch (error) {
    console.error("Error clearing zones:", error);
    return c.json({ success: false, error: "Failed to clear zones" }, 500);
  }
});

// ==================== PICKUP LOCATIONS ====================

// Get all pickup locations
app.get("/make-server-eaaf5c1c/pickup-locations", async (c) => {
  try {
    const locations = await kv.getByPrefix("pickup-location:");
    return c.json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching pickup locations:", error);
    return c.json({ success: false, error: "Failed to fetch pickup locations" }, 500);
  }
});

// Create pickup location
app.post("/make-server-eaaf5c1c/pickup-locations", async (c) => {
  try {
    const body = await c.req.json();
    const id = `LOC-${Date.now()}`;
    const location = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`pickup-location:${id}`, location);
    return c.json({ success: true, location }, 201);
  } catch (error) {
    console.error("Error creating pickup location:", error);
    return c.json({ success: false, error: "Failed to create pickup location" }, 500);
  }
});

// Update pickup location
app.put("/make-server-eaaf5c1c/pickup-locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`pickup-location:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Pickup location not found" }, 404);
    }
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`pickup-location:${id}`, updated);
    return c.json({ success: true, location: updated });
  } catch (error) {
    console.error("Error updating pickup location:", error);
    return c.json({ success: false, error: "Failed to update pickup location" }, 500);
  }
});

// Delete pickup location
app.delete("/make-server-eaaf5c1c/pickup-locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`pickup-location:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Pickup location not found" }, 404);
    }
    
    await kv.del(`pickup-location:${id}`);
    return c.json({ success: true, message: "Pickup location deleted" });
  } catch (error) {
    console.error("Error deleting pickup location:", error);
    return c.json({ success: false, error: "Failed to delete pickup location" }, 500);
  }
});

// ==================== ROLES ====================

// Initialize default roles if they don't exist
const initializeRoles = async () => {
  try {
    const existingRoles = await kv.getByPrefix("role:");
    
    if (existingRoles.length === 0) {
      console.log("Initializing default roles...");
      
      const defaultRoles = [
        {
          id: "role-1",
          name: "Administrator",
          description: "Full system access with all permissions",
          permissions: [
            "dashboard",
            "bookings",
            "companies",
            "drivers",
            "fleet",
            "trips",
            "settlements",
            "fares",
            "alerts",
            "audit",
            "settings",
            "users"
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "role-2",
          name: "Company Manager",
          description: "Manage company operations, fleet, and bookings",
          permissions: [
            "dashboard",
            "bookings",
            "drivers",
            "fleet",
            "trips",
            "settlements",
            "fares"
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "role-3",
          name: "Company Cashier",
          description: "Handle financial transactions and settlements",
          permissions: [
            "dashboard",
            "bookings",
            "settlements",
            "fares"
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "role-4",
          name: "Drivers Supervisor",
          description: "Assign drivers to vehicles and manage driver operations",
          permissions: [
            "dashboard",
            "bookings",
            "drivers",
            "fleet",
            "trips"
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "role-5",
          name: "Customer",
          description: "Book rides and view trip history",
          permissions: [
            "bookings",
            "trips"
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "role-6",
          name: "Kiosk",
          description: "Airport kiosk terminal for passenger check-in",
          permissions: [
            "kiosk"
          ],
          createdAt: new Date().toISOString(),
        }
      ];
      
      for (const role of defaultRoles) {
        await kv.set(`role:${role.id}`, role);
      }
      
      console.log("Default roles initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing roles:", error);
  }
};

// Call initialization on server start
initializeRoles();

// Get all roles
app.get("/make-server-eaaf5c1c/roles", async (c) => {
  try {
    const roles = await kv.getByPrefix("role:");
    return c.json({ success: true, data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return c.json({ success: false, error: "Failed to fetch roles" }, 500);
  }
});

// Get single role
app.get("/make-server-eaaf5c1c/roles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const role = await kv.get(`role:${id}`);
    
    if (!role) {
      return c.json({ success: false, error: "Role not found" }, 404);
    }
    
    return c.json({ success: true, data: role });
  } catch (error) {
    console.error("Error fetching role:", error);
    return c.json({ success: false, error: "Failed to fetch role" }, 500);
  }
});

// Create role
app.post("/make-server-eaaf5c1c/roles", async (c) => {
  try {
    const body = await c.req.json();
    const id = `role-${Date.now()}`;
    const role = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`role:${id}`, role);
    return c.json({ success: true, data: role }, 201);
  } catch (error) {
    console.error("Error creating role:", error);
    return c.json({ success: false, error: "Failed to create role" }, 500);
  }
});

// Update role
app.put("/make-server-eaaf5c1c/roles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`role:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Role not found" }, 404);
    }
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`role:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating role:", error);
    return c.json({ success: false, error: "Failed to update role" }, 500);
  }
});

// Delete role
app.delete("/make-server-eaaf5c1c/roles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`role:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "Role not found" }, 404);
    }
    
    // Check if any users have this role
    const users = await kv.getByPrefix("user:");
    const usersWithRole = users.filter(user => user.roleId === id);
    
    if (usersWithRole.length > 0) {
      return c.json({ 
        success: false, 
        error: `Cannot delete role: ${usersWithRole.length} user(s) are assigned to this role` 
      }, 400);
    }
    
    await kv.del(`role:${id}`);
    return c.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return c.json({ success: false, error: "Failed to delete role" }, 500);
  }
});

// Add missing Kiosk role if it doesn't exist
app.post("/make-server-eaaf5c1c/roles/add-kiosk", async (c) => {
  try {
    const existingKioskRole = await kv.get("role:role-6");
    
    if (existingKioskRole) {
      return c.json({ 
        success: true, 
        message: "Kiosk role already exists",
        data: existingKioskRole
      });
    }
    
    const kioskRole = {
      id: "role-6",
      name: "Kiosk",
      description: "Airport kiosk terminal for passenger check-in",
      permissions: ["kiosk"],
      createdAt: new Date().toISOString(),
    };
    
    await kv.set("role:role-6", kioskRole);
    
    return c.json({ 
      success: true, 
      message: "Kiosk role created successfully",
      data: kioskRole
    }, 201);
  } catch (error) {
    console.error("Error adding Kiosk role:", error);
    return c.json({ success: false, error: "Failed to add Kiosk role" }, 500);
  }
});

// ==================== USERS ====================

// Get all users
app.get("/make-server-eaaf5c1c/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: "Failed to fetch users" }, 500);
  }
});

// Get single user
app.get("/make-server-eaaf5c1c/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = await kv.get(`user:${id}`);
    
    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ success: false, error: "Failed to fetch user" }, 500);
  }
});

// Create user
app.post("/make-server-eaaf5c1c/users", async (c) => {
  try {
    const body = await c.req.json();
    
    // Check if email already exists
    const existingUsers = await kv.getByPrefix("user:");
    const emailExists = existingUsers.some(user => user.email === body.email);
    
    if (emailExists) {
      return c.json({ success: false, error: "Email already exists" }, 400);
    }
    
    const id = `user-${Date.now()}`;
    const user = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`user:${id}`, user);
    return c.json({ success: true, data: user }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ success: false, error: "Failed to create user" }, 500);
  }
});

// Update user
app.put("/make-server-eaaf5c1c/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(`user:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    
    // Check if email is being changed and if it already exists
    if (body.email && body.email !== existing.email) {
      const existingUsers = await kv.getByPrefix("user:");
      const emailExists = existingUsers.some(user => user.email === body.email && user.id !== id);
      
      if (emailExists) {
        return c.json({ success: false, error: "Email already exists" }, 400);
      }
    }
    
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`user:${id}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ success: false, error: "Failed to update user" }, 500);
  }
});

// Delete user
app.delete("/make-server-eaaf5c1c/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`user:${id}`);
    
    if (!existing) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    
    await kv.del(`user:${id}`);
    return c.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ success: false, error: "Failed to delete user" }, 500);
  }
});

// Verify user password (for secure logout, etc.)
app.post("/make-server-eaaf5c1c/users/verify-password", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return c.json({ success: false, error: "User ID and password are required" }, 400);
    }

    // Get user from KV store
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      // Also check customers table
      const customer = await kv.get(`customer:${userId}`);
      
      if (!customer) {
        return c.json({ success: false, error: "User not found" }, 404);
      }
      
      // Verify password for customer
      if (customer.password === password) {
        return c.json({ success: true, message: "Password verified" });
      } else {
        return c.json({ success: false, error: "Incorrect password" }, 401);
      }
    }
    
    // Verify password for regular user
    if (user.password === password) {
      return c.json({ success: true, message: "Password verified" });
    } else {
      return c.json({ success: false, error: "Incorrect password" }, 401);
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    return c.json({ success: false, error: "Failed to verify password" }, 500);
  }
});

// Initialize default admin user if no users exist
app.post("/make-server-eaaf5c1c/users/init-admin", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    
    // Only create if no users exist
    if (users.length === 0) {
      const adminId = `user-${Date.now()}`;
      const adminUser = {
        id: adminId,
        name: "Administrator",
        email: "admin@openpark.hu",
        password: "123456",
        roleId: "role-1",
        status: "active",
        createdAt: new Date().toISOString(),
      };
      
      await kv.set(`user:${adminId}`, adminUser);
      return c.json({ 
        success: true, 
        message: "Default admin user created",
        data: { email: "admin@openpark.hu", password: "123456" }
      }, 201);
    }
    
    return c.json({ 
      success: true, 
      message: "Users already exist, no initialization needed" 
    });
  } catch (error) {
    console.error("Error initializing admin user:", error);
    return c.json({ success: false, error: "Failed to initialize admin user" }, 500);
  }
});

// ==================== CUSTOMERS ====================

// Customer registration
app.post("/make-server-eaaf5c1c/customers/register", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, mobile, password } = body;
    
    // Validation
    if (!name || !email || !password) {
      return c.json({ 
        success: false, 
        message: "Name, email, and password are required" 
      }, 400);
    }
    
    // Check if email already exists
    const existingUsers = await kv.getByPrefix("user:");
    const existingCustomers = await kv.getByPrefix("customer:");
    const emailExists = [...existingUsers, ...existingCustomers].some(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (emailExists) {
      return c.json({ 
        success: false, 
        message: "Email already registered" 
      }, 400);
    }
    
    // Get customer role ID (role-5)
    const customerRole = await kv.get("role:role-5");
    if (!customerRole) {
      return c.json({ 
        success: false, 
        message: "Customer role not found" 
      }, 500);
    }
    
    // Create customer user
    const customerId = `customer-${Date.now()}`;
    const customer = {
      id: customerId,
      name,
      email,
      mobile: mobile || null,
      password, // In production, this should be hashed
      roleId: "role-5", // Customer role
      status: "active", // Auto-activate for now (changed from "pending")
      emailConfirmed: true, // Auto-confirm for now (changed from false)
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`customer:${customerId}`, customer);
    
    // TODO: Send confirmation email
    // For now, we'll auto-confirm (in production, send email with confirmation link)
    console.log("Customer registered and auto-activated:", { id: customerId, email, name });
    console.log("TODO: Send confirmation email to:", email);
    
    return c.json({ 
      success: true, 
      message: "Registration successful! You can now log in.",
      data: { id: customerId, email, name }
    }, 201);
  } catch (error) {
    console.error("Error registering customer:", error);
    return c.json({ success: false, message: "Registration failed" }, 500);
  }
});

// Confirm customer email
app.post("/make-server-eaaf5c1c/customers/confirm/:token", async (c) => {
  try {
    const token = c.req.param("token");
    
    // In a real implementation, verify the token and update customer status
    // For now, we'll use the customerId as the token
    const customer = await kv.get(`customer:${token}`);
    
    if (!customer) {
      return c.json({ success: false, message: "Invalid confirmation token" }, 400);
    }
    
    if (customer.emailConfirmed) {
      return c.json({ success: true, message: "Email already confirmed" });
    }
    
    const updated = {
      ...customer,
      emailConfirmed: true,
      status: "active",
      confirmedAt: new Date().toISOString(),
    };
    
    await kv.set(`customer:${customer.id}`, updated);
    
    return c.json({ 
      success: true, 
      message: "Email confirmed successfully! You can now log in." 
    });
  } catch (error) {
    console.error("Error confirming email:", error);
    return c.json({ success: false, message: "Email confirmation failed" }, 500);
  }
});

// Get all customers (admin only)
app.get("/make-server-eaaf5c1c/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return c.json({ success: false, error: "Failed to fetch customers" }, 500);
  }
});

// Get customer by ID
app.get("/make-server-eaaf5c1c/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);
    
    if (!customer) {
      return c.json({ success: false, error: "Customer not found" }, 404);
    }
    
    return c.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return c.json({ success: false, error: "Failed to fetch customer" }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);