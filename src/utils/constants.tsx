// Centralized constants for the OpenPark application

/**
 * Vehicle Types - Used across booking and fleet management
 * IMPORTANT: Keep this list synchronized across all components
 */
export const VEHICLE_TYPES = [
  "Sedan",
  "Luxury Sedan",
  "SUV",
  "Luxury SUV",
  "Van",
  "Minibus"
] as const;

export type VehicleType = typeof VEHICLE_TYPES[number];

/**
 * Vehicle Statuses - Used in fleet management
 */
export const VEHICLE_STATUSES = [
  "Available",
  "Busy",
  "Maintenance",
  "Suspended"
] as const;

export type VehicleStatus = typeof VEHICLE_STATUSES[number];

/**
 * Booking Statuses - Used in booking management
 */
export const BOOKING_STATUSES = [
  "Pending",
  "Pending Assignment",
  "Confirmed at Airport",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled"
] as const;

export type BookingStatus = typeof BOOKING_STATUSES[number];