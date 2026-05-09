import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Search, Plus, Eye, Edit2, User, Star } from "lucide-react";
import EditDriverDialog from "../../components/EditDriverDialog";
import AddDriverDialog from "../../components/AddDriverDialog";
import { useDrivers } from "../../hooks/useDrivers";
import { vehiclesApi, companiesApi } from "../../lib/api";
import { useUser } from "../../contexts/UserContext";

const statusColors: Record<string, string> = {
  Online: "bg-green-100 text-green-700",
  "On Trip": "bg-blue-100 text-blue-700",
  Offline: "bg-gray-100 text-gray-700",
  Suspended: "bg-red-100 text-red-700",
};

const documentColors: Record<string, string> = {
  Valid: "bg-green-100 text-green-700",
  Expiring: "bg-yellow-100 text-yellow-700",
  Expired: "bg-red-100 text-red-700",
};

export default function DriversList() {
  const { drivers, loading, refresh } = useDrivers();
  const { isCompanyRestricted, userCompanyName } = useUser();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all-companies");
  const [statusFilter, setStatusFilter] = useState("all-status");

  // Set company filter based on user restriction
  useEffect(() => {
    if (isCompanyRestricted && userCompanyName) {
      setCompanyFilter(userCompanyName);
    }
  }, [isCompanyRestricted, userCompanyName]);

  // Load vehicles and companies for enriching driver data
  useEffect(() => {
    loadVehiclesAndCompanies();
  }, []);

  const loadVehiclesAndCompanies = async () => {
    try {
      const [vehiclesRes, companiesRes] = await Promise.all([
        vehiclesApi.getAll(),
        companiesApi.getAll(),
      ]);
      
      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data || []);
      }
      
      if (companiesRes.success) {
        setCompanies(companiesRes.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleEdit = (driver: any) => {
    console.log("Edit button clicked, driver data:", driver);
    setEditingDriver(driver);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setTimeout(() => setEditingDriver(null), 100);
    }
  };

  const handleSuccess = () => {
    // Refresh the drivers list from the backend
    refresh();
  };

  // Enrich drivers with vehicle information
  const enrichedDrivers = drivers.map((driver) => {
    const vehicle = vehicles.find(v => v.id === driver.vehicleId);
    return {
      ...driver,
      vehicle: vehicle ? (vehicle.plate || vehicle.plateNumber || "Not assigned") : "Not assigned",
      documents: "Valid", // Default for now
      lastTrip: "N/A",
    };
  });

  // Filter drivers based on all filters
  const filteredDrivers = enrichedDrivers.filter((driver) => {
    // Search filter (by name or vehicle)
    const matchesSearch = searchQuery === "" || 
      driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle?.toLowerCase().includes(searchQuery.toLowerCase());

    // Company filter
    const matchesCompany = companyFilter === "all-companies" || 
      driver.company?.toLowerCase().includes(companyFilter.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all-status" || 
      driver.status?.toLowerCase().replace(" ", "-") === statusFilter.toLowerCase();

    return matchesSearch && matchesCompany && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setCompanyFilter("all-companies");
    setStatusFilter("all-status");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Drivers</h1>
          <p className="text-gray-600">Manage all limousine drivers</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search drivers..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={companyFilter} onValueChange={setCompanyFilter} disabled={isCompanyRestricted}>
            <SelectTrigger>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-companies">All Companies</SelectItem>
              <SelectItem value="elite">Elite Limo</SelectItem>
              <SelectItem value="luxury">Luxury Transport</SelectItem>
              <SelectItem value="premier">Premier Cars</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="on-trip">On Trip</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Driver
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Vehicle
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Rating
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Last Trip
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Documents
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Loading drivers...
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    {drivers.length === 0 
                      ? "No drivers in the system. Click 'Add Driver' to add one."
                      : "No drivers found matching your filters"}
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                <tr key={driver.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-500">
                          {driver.trips} trips
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {driver.company}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {driver.vehicle}
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="secondary"
                      className={statusColors[driver.status]}
                    >
                      {driver.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-900">
                        {driver.rating}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {driver.lastTrip}
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="secondary"
                      className={documentColors[driver.documents]}
                    >
                      {driver.documents}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/drivers/${driver.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(driver)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredDrivers.length} of {drivers.length} drivers
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Driver Dialog */}
      <AddDriverDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Edit Driver Dialog */}
      <EditDriverDialog
        driver={editingDriver}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}