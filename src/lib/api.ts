const API_BASE_URL = import.meta.env.DEV ? '/api' : '/booking/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('openpark_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid — clear auth and redirect
      localStorage.removeItem('openpark_token');
      localStorage.removeItem('openpark_current_user');
      const loginPath = '/booking/login';
      if (window.location.pathname !== loginPath && window.location.pathname !== '/login') {
        window.location.href = window.location.origin + loginPath;
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Network error occurred');
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { name: string; email: string; mobile?: string; password: string }) =>
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiCall('/auth/me'),
  forgotPassword: (email: string) =>
    apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
};

// Bookings API
export const bookingsApi = {
  getAll: () => apiCall('/bookings'),
  getById: (id: string) => apiCall(`/bookings/${id}`),
  create: (data: any) => apiCall('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/bookings/${id}`, { method: 'DELETE' }),
};

// Drivers API
export const driversApi = {
  getAll: () => apiCall('/drivers'),
  getById: (id: string) => apiCall(`/drivers/${id}`),
  create: (data: any) => apiCall('/drivers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/drivers/${id}`, { method: 'DELETE' }),
  clearAll: () => apiCall('/drivers', { method: 'DELETE' }),
};

// Companies API
export const companiesApi = {
  getAll: () => apiCall('/companies'),
  getById: (id: string) => apiCall(`/companies/${id}`),
  create: (data: any) => apiCall('/companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/companies/${id}`, { method: 'DELETE' }),
};

// Vehicles API
export const vehiclesApi = {
  getAll: () => apiCall('/vehicles'),
  getById: (id: string) => apiCall(`/vehicles/${id}`),
  create: (data: any) => apiCall('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/vehicles/${id}`, { method: 'DELETE' }),
  cleanupOrphaned: () => apiCall('/vehicles/cleanup-orphaned', { method: 'POST' }),
};

// Analytics API
export const analyticsApi = {
  getDashboardStats: () => apiCall('/analytics/dashboard'),
};

// Live Trips API
export const tripsApi = {
  getLive: () => apiCall('/trips/live'),
  getAll: () => apiCall('/trips'),
  create: (data: any) => apiCall('/trips', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Zones & Fares API
export const zonesApi = {
  getAll: () => apiCall('/zones'),
  create: (data: any) => apiCall('/zones', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/zones/${id}`, { method: 'DELETE' }),
  clearAll: () => apiCall('/zones', { method: 'DELETE' }),
};

// Roles API
export const rolesApi = {
  getAll: () => apiCall('/roles'),
  getById: (id: string) => apiCall(`/roles/${id}`),
  create: (data: any) => apiCall('/roles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/roles/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersApi = {
  getAll: () => apiCall('/users'),
  getById: (id: string) => apiCall(`/users/${id}`),
  create: (data: any) => apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/users/${id}`, { method: 'DELETE' }),
};

// Alerts API
export const alertsApi = {
  getAll: () => apiCall('/alerts'),
  create: (data: any) => apiCall('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  resolve: (id: string) => apiCall(`/alerts/${id}/resolve`, { method: 'PUT' }),
};

// Audit API
export const auditApi = {
  getAll: (page?: number) => apiCall(`/audit${page ? `?page=${page}` : ''}`),
  create: (data: any) => apiCall('/audit', { method: 'POST', body: JSON.stringify(data) }),
};

// Pickup Locations API
export const pickupLocationsApi = {
  getAll: () => apiCall('/pickup-locations'),
  create: (data: any) => apiCall('/pickup-locations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/pickup-locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/pickup-locations/${id}`, { method: 'DELETE' }),
};

// Settlements API
export const settlementsApi = {
  getAll: () => apiCall('/settlements'),
  getById: (id: string) => apiCall(`/settlements/${id}`),
  create: (data: any) => apiCall('/settlements', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/settlements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Customers API
export const customersApi = {
  getAll: () => apiCall('/customers'),
  getById: (id: string) => apiCall(`/customers/${id}`),
};

// Kiosk API (Public)
export const kioskApi = {
  createBooking: (data: any) => apiCall('/kiosk/booking', { method: 'POST', body: JSON.stringify(data) }),
  getBookingStatus: (id: string) => apiCall(`/kiosk/booking/${id}`),
};