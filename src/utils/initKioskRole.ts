// Kiosk role initialization is now handled by database seed script.
// This file is kept for backward compatibility but is a no-op.

export async function initKioskRole() {
  console.log("Kiosk role initialization handled by database seed");
  return true;
}
