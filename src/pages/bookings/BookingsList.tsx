import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { Plus, Search, Filter, Calendar, X, Eye, Pencil, Trash2, Edit2, UserCog } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { bookingsApi, companiesApi } from "../../lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUser } from "../../contexts/UserContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import CreateBookingDialog from "../../components/CreateBookingDialog";
import EditBookingDialog from "../../components/EditBookingDialog";

// Helper function to get brand name
const getBrandName = (brandId: string): string => {
  const brandMap: Record<string, string> = {
    "mercedes": "Mercedes-Benz",
    "bmw": "BMW",
    "audi": "Audi",
    "lexus": "Lexus",
    "tesla": "Tesla",
    "cadillac": "Cadillac",
  };
  return brandMap[brandId] || brandId;
};

// Currency display component
const CurrencyDisplay = ({ amount }: { amount: number }) => {
  const { formatCurrency } = useCurrency();
  return <span>{formatCurrency(amount)}</span>;
};

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Waiting: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
  "Pending Assignment": "bg-orange-100 text-orange-700",
  Confirmed: "bg-green-100 text-green-700",
};

export default function BookingsList() {
  const { isCompanyRestricted, userCompany, userCompanyName, currentUser, isCustomer, hasPermission, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State management
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all-companies");
  const [statusFilter, setStatusFilter] = useState("all-status");

  // Load bookings from API
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsApi.getAll();
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadBookings();
  };

  const deleteBooking = async (id: string) => {
    try {
      const response = await bookingsApi.delete(id);
      if (response.success) {
        await loadBookings(); // Refresh the list
        return response;
      }
      throw new Error(response.error || "Failed to delete booking");
    } catch (error: any) {
      throw error;
    }
  };

  // Set company filter based on user restriction
  useEffect(() => {
    if (isCompanyRestricted && userCompanyName) {
      setCompanyFilter(userCompanyName);
    }
  }, [isCompanyRestricted, userCompanyName]);

  // Load companies from API (same as BookingAssignments)
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await companiesApi.getAll();
        const companiesData = Array.isArray(response?.data) ? response.data : [];
        console.log("BookingsList - Companies loaded from API:", companiesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error("BookingsList - Error loading companies:", error);
        setCompanies([]);
      }
    };
    
    loadCompanies();
  }, []);

  // Load drivers and vehicles from localStorage
  useEffect(() => {
    const loadDriversAndVehicles = () => {
      const storedDrivers = localStorage.getItem('openpark_drivers');
      const storedVehicles = localStorage.getItem('openpark_vehicles');
      
      if (storedDrivers) {
        try {
          setDrivers(JSON.parse(storedDrivers));
        } catch (e) {
          console.error('Error parsing drivers:', e);
        }
      }
      
      if (storedVehicles) {
        try {
          setVehicles(JSON.parse(storedVehicles));
        } catch (e) {
          console.error('Error parsing vehicles:', e);
        }
      }
    };

    loadDriversAndVehicles();

    // Listen for localStorage updates
    const handleStorageUpdate = () => {
      loadDriversAndVehicles();
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('localStorageUpdate', handleStorageUpdate);
  }, []);

  // Enrich bookings with driver and vehicle details
  const enrichedBookings = useMemo(() => {
    return bookings.map((booking: any) => {
      const driver = drivers.find(d => d.id === booking.driverId || d.name === booking.driver);
      const vehicle = vehicles.find(v => v.id === booking.vehicleId || v.plate === booking.vehiclePlate);
      
      return {
        ...booking,
        driverName: driver?.name || booking.driver || "Unassigned",
        driverPhone: driver?.phone || "",
        vehiclePlate: vehicle?.plate || booking.vehiclePlate || "",
        vehicleBrand: vehicle?.brand || "",
        vehicleModel: vehicle?.model || booking.vehicleType || "",
        vehicleFullName: vehicle ? `${vehicle.brand ? getBrandName(vehicle.brand) : ""} ${vehicle.model}` : booking.vehicleType || "",
      };
    });
  }, [bookings, drivers, vehicles]);

  // Filter bookings based on all filters
  const filteredBookings = useMemo(() => {
    console.log('🔍 BookingsList Filter Debug:', {
      isCustomer,
      userLoading,
      currentUser: currentUser ? { id: currentUser.id, email: currentUser.email, roleId: currentUser.roleId } : null,
      totalBookings: enrichedBookings.length
    });
    
    // Don't filter if user context is still loading
    if (userLoading) {
      console.log('⏳ User context still loading, showing empty list');
      return [];
    }
    
    return enrichedBookings.filter((booking: any) => {
      // Customer filter - customers can only see their own bookings
      if (isCustomer && currentUser) {
        // Match by customer ID or email
        const matchesId = booking.customerId === currentUser.id;
        const matchesEmail = booking.customerEmail === currentUser.email;
        
        console.log('🔍 Checking booking:', {
          bookingId: booking.id,
          bookingCustomerId: booking.customerId,
          bookingCustomerEmail: booking.customerEmail,
          currentUserId: currentUser.id,
          currentUserEmail: currentUser.email,
          matchesId,
          matchesEmail,
          willShow: matchesId || matchesEmail
        });
        
        if (!matchesId && !matchesEmail) {
          return false;
        }
      }

      // Search filter (ID or passenger name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = booking.id.toLowerCase().includes(query);
        const matchesPassenger = booking.passenger.toLowerCase().includes(query);
        if (!matchesId && !matchesPassenger) return false;
      }

      // Date filter
      if (dateFilter) {
        const bookingDate = booking.scheduledTime || booking.pickupTime || booking.createdAt;
        if (bookingDate) {
          const bookingDateStr = new Date(bookingDate).toISOString().split('T')[0];
          if (bookingDateStr !== dateFilter) return false;
        }
      }

      // Company filter
      if (companyFilter !== "all-companies") {
        if (booking.company !== companyFilter) return false;
      }

      // Status filter
      if (statusFilter !== "all-status") {
        const statusMap: Record<string, string> = {
          "completed": "Completed",
          "in-progress": "In Progress",
          "waiting": "Waiting",
          "cancelled": "Cancelled",
          "pending-assignment": "Pending Assignment",
          "confirmed": "Confirmed"
        };
        if (booking.status !== statusMap[statusFilter]) return false;
      }

      return true;
    });
  }, [enrichedBookings, searchQuery, dateFilter, companyFilter, statusFilter, isCustomer, currentUser, userLoading]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (dateFilter) count++;
    if (companyFilter !== "all-companies") count++;
    if (statusFilter !== "all-status") count++;
    return count;
  }, [searchQuery, dateFilter, companyFilter, statusFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setCompanyFilter("all-companies");
    setStatusFilter("all-status");
  };

  const handleEdit = (booking: any) => {
    console.log("BookingsList - Edit button clicked, full booking data:", booking);
    console.log("BookingsList - Booking keys:", Object.keys(booking));
    
    setEditingBooking(booking);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    // Don't clear editingBooking immediately to prevent flash
    if (!open) {
      // Clear after a small delay to prevent issues
      setTimeout(() => setEditingBooking(null), 100);
    }
  };

  const handleDeleteClick = (booking: any) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    try {
      await deleteBooking(bookingToDelete.id);
      toast.success("Booking deleted successfully");
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete booking");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Bookings</h1>
          <p className="text-gray-600">Manage all airport limousine bookings</p>
        </div>
        <div className="flex gap-3">
          <CreateBookingDialog onSuccess={refresh} />
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by ID or passenger..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              type="date" 
              className="pl-10" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <Select value={companyFilter} onValueChange={setCompanyFilter} disabled={isCompanyRestricted}>
            <SelectTrigger>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-companies">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.name}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="pending-assignment">Pending Assignment</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Booking ID
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Passenger
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Vehicle Type
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Driver
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Pickup Time
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Fare
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    {enrichedBookings.length === 0 ? "No bookings found. Create your first booking!" : "No bookings match your filters."}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {booking.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {booking.passenger}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {booking.vehicleFullName || booking.vehicleType}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {booking.company}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {booking.driverName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {booking.pickupTime}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="secondary"
                      className={statusColors[booking.status]}
                    >
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <CurrencyDisplay amount={booking.fare} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {booking.status === "Pending Assignment" && hasPermission('fleet') && (
                        <Link to="/booking-assignments">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 text-xs bg-orange-600 hover:bg-orange-700"
                          >
                            <UserCog className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        </Link>
                      )}
                      <Link to={`/bookings/${booking.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {!isCustomer && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEdit(booking)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(booking)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {enrichedBookings.length} {enrichedBookings.length === 1 ? 'booking' : 'bookings'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Booking Dialog */}
      <EditBookingDialog
        booking={editingBooking}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        onSuccess={refresh}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete booking{" "}
              <strong>{bookingToDelete?.id}</strong> for{" "}
              <strong>{bookingToDelete?.passenger}</strong>?
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}