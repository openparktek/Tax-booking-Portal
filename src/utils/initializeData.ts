/**
 * Data versioning utility for OpenPark
 * This ensures that when sample data is updated (like Arabic names),
 * all users get the fresh data on their next visit
 */

const DATA_VERSION = '3.1'; // Fixed vehicle ID consistency for proper updates
const VERSION_KEY = 'openpark_data_version';

export function checkAndResetData() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  
  if (storedVersion !== DATA_VERSION) {
    console.log('Data version mismatch. Clearing old cached data...');
    
    // Clear all OpenPark data from localStorage
    const keysToRemove = [
      'openpark_drivers',
      'openpark_vehicles',
      'openpark_companies',
      'openpark_bookings',
      'openpark_settlements'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Set new version
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    
    console.log('Data reset complete. Fresh data will be loaded.');
  }
}
