import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { ClipboardList, Calendar, MapPin, Car, User, Building2 } from "lucide-react";
import { bookingsApi, companiesApi } from "../../lib/api";
import AssignVehicleDriverDialog from "../../components/AssignVehicleDriverDialog";
import { useUser } from "../../contexts/UserContext";

export default function BookingAssignments() {
  const { isCompanyRestricted, userCompanyName } = useUser();
  const [bookings, setBookings] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const loadCompanies = async () => {
    try {
      const response = await companiesApi.getAll();
      const companiesData = Array.isArray(response?.data) ? response.data : [];
      console.log("Companies loaded:", companiesData);
      setCompanies(companiesData);
      
      // Auto-select "All Companies" for admin if none selected
      if (!isCompanyRestricted && !selectedCompany) {
        console.log("Auto-selecting: All Companies");
        setSelectedCompany("ALL_COMPANIES");
      }
    } catch (error) {
      console.error("Error loading companies:", error);
      setCompanies([]);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getAll();
      
      // Handle response structure: { success: true, data: [...] }
      const bookingsData = Array.isArray(response?.data) ? response.data : [];
      
      console.log("All bookings loaded:", bookingsData);
      console.log("Selected company:", selectedCompany);
      console.log("User role:", isCompanyRestricted ? "fleet_manager" : "admin");
      
      // Filter bookings based on user role
      let filteredBookings = bookingsData;
      
      if (isCompanyRestricted) {
        // Fleet managers see only their company's bookings
        filteredBookings = bookingsData.filter(
          (booking: any) => booking.company === userCompanyName
        );
        console.log("Fleet manager filtered bookings:", filteredBookings);
      } else if (!isCompanyRestricted && selectedCompany && selectedCompany !== "ALL_COMPANIES") {
        // Admins see selected company's bookings (unless "All Companies" is selected)
        console.log("Filtering for company:", selectedCompany);
        console.log("Available bookings:", bookingsData.map(b => ({ id: b.id, company: b.company, status: b.status })));
        
        filteredBookings = bookingsData.filter(
          (booking: any) => booking.company === selectedCompany
        );
        console.log("Filtered bookings:", filteredBookings.length, "bookings for", selectedCompany);
      } else if (selectedCompany === "ALL_COMPANIES") {
        // Show all bookings when "All Companies" is selected
        console.log("Showing all bookings:", filteredBookings.length, "total bookings");
      }
      
      setBookings(filteredBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]); // Ensure bookings is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCompanyRestricted) {
      loadCompanies();
    } else if (isCompanyRestricted) {
      // Fleet managers load their bookings immediately
      loadBookings();
    }
  }, []);

  useEffect(() => {
    // Reload bookings when admin changes company selection
    if (!isCompanyRestricted && selectedCompany) {
      loadBookings();
    }
  }, [selectedCompany]);

  const handleAssignClick = (booking: any) => {
    setSelectedBooking(booking);
    setAssignDialogOpen(true);
  };

  const pendingBookings = bookings.filter(
    (b) => b.status === "Pending Assignment"
  );
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Assignment":
        return "bg-orange-100 text-orange-700";
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Booking Assignments</h1>
          <p className="text-gray-600">
            {isCompanyRestricted 
              ? "Assign vehicles and drivers to bookings" 
              : `Assign vehicles and drivers to bookings for ${userCompanyName}`}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            if (!isCompanyRestricted) loadCompanies();
            loadBookings();
          }}
        >
          Refresh Data
        </Button>
      </div>

      {/* Company Selector - Only for Admins */}
      {!isCompanyRestricted && (
        <>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="w-5 h-5" />
                <span>Select Company:</span>
              </div>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Choose a company..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_COMPANIES">
                    🔍 All Companies
                  </SelectItem>
                  {companies.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No companies found. Please add companies first.
                    </div>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedCompany && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Viewing: {selectedCompany === "ALL_COMPANIES" ? "All Companies" : selectedCompany}
                </Badge>
              )}
            </div>
          </Card>
          
          {/* Debug Info */}
          <Card className="p-4 bg-gray-50 border-dashed">
            <p className="text-xs text-gray-600">
              <strong>Debug Info:</strong> {companies.length} companies available
              {companies.length > 0 && ` (${companies.map(c => c.name).join(', ')})`}
              {selectedCompany && ` | Filtering for: "${selectedCompany}"`}
              {!loading && ` | Total bookings loaded: ${bookings.length}`}
            </p>
          </Card>
        </>
      )}

      {/* Show message if admin hasn't selected company */}
      {!isCompanyRestricted && !selectedCompany ? (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Please select a company to view bookings</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Assignment</p>
              <p className="text-2xl text-gray-900 mt-1">
                {pendingBookings.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl text-gray-900 mt-1">
                {confirmedBookings.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl text-gray-900 mt-1">{bookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Assignments Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Pending Assignments</h2>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {pendingBookings.length} Waiting
          </Badge>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading bookings...
          </div>
        ) : pendingBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending assignments at the moment
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Passenger</TableHead>
                {selectedCompany === "ALL_COMPANIES" && <TableHead>Company</TableHead>}
                <TableHead>Flight</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Pickup Location</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="text-gray-900">
                    #{booking.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-gray-900">{booking.passenger}</p>
                      <p className="text-xs text-gray-500">{booking.phone}</p>
                    </div>
                  </TableCell>
                  {selectedCompany === "ALL_COMPANIES" && (
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {booking.company}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-gray-900">
                    {booking.flightNumber || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking.vehicleType}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {booking.pickupLocation}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {booking.scheduledTime
                      ? new Date(booking.scheduledTime).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(booking.status)}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleAssignClick(booking)}
                    >
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Confirmed Bookings Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Confirmed Bookings</h2>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {confirmedBookings.length} Assigned
          </Badge>
        </div>

        {confirmedBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No confirmed bookings yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Passenger</TableHead>
                {selectedCompany === "ALL_COMPANIES" && <TableHead>Company</TableHead>}
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Pickup Location</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {confirmedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="text-gray-900">
                    #{booking.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-gray-900">{booking.passenger}</p>
                      <p className="text-xs text-gray-500">{booking.phone}</p>
                    </div>
                  </TableCell>
                  {selectedCompany === "ALL_COMPANIES" && (
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {booking.company}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-900 text-sm">
                          {booking.vehiclePlate}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.vehicleFullName || booking.vehicleType}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 text-sm">
                        {booking.driver}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {booking.pickupLocation}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {booking.scheduledTime
                      ? new Date(booking.scheduledTime).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(booking.status)}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignClick(booking)}
                    >
                      Reassign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Assignment Dialog */}
      <AssignVehicleDriverDialog
        booking={selectedBooking}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSuccess={loadBookings}
      />
        </>
      )}
    </div>
  );
}