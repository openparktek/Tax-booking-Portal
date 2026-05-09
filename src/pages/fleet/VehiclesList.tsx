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
import { Search, Plus, Edit2, Car, Trash2 } from "lucide-react";
import CreateVehicleDialog from "../../components/CreateVehicleDialog";
import EditVehicleDialog from "../../components/EditVehicleDialog";
import { vehiclesApi, companiesApi } from "../../lib/api";
import { toast } from "sonner";
import { useUser } from "../../contexts/UserContext";
import { VEHICLE_TYPES, VEHICLE_STATUSES } from "../../utils/constants";

// Helper function to get brand display name
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

const statusColors: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  Busy: "bg-blue-100 text-blue-700",
  Maintenance: "bg-yellow-100 text-yellow-700",
  "Out of Service": "bg-red-100 text-red-700",
};

export default function VehiclesList() {
  const { isCompanyRestricted, userCompanyName } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all-companies");
  const [typeFilter, setTypeFilter] = useState("all-types");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);

  // Set company filter based on user restriction
  useEffect(() => {
    if (isCompanyRestricted && userCompanyName) {
      setCompanyFilter(userCompanyName);
    }
  }, [isCompanyRestricted, userCompanyName]);

  // Load companies from API
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await companiesApi.getAll();
        const companiesData = Array.isArray(response?.data) ? response.data : [];
        console.log("VehiclesList - Companies loaded from API:", companiesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error("VehiclesList - Error loading companies:", error);
        toast.error("Failed to load companies");
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    loadCompanies();
  }, []);

  // Load vehicles from API
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        const response = await vehiclesApi.getAll();
        const vehiclesData = Array.isArray(response?.data) ? response.data : [];
        console.log("VehiclesList - Vehicles loaded from API:", vehiclesData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("VehiclesList - Error loading vehicles:", error);
        toast.error("Failed to load vehicles");
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };
    
    loadVehicles();
  }, []);

  // Filter vehicles based on all filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Search filter (by plate, brand, or model)
    const brandName = vehicle.brand ? getBrandName(vehicle.brand) : "";
    const matchesSearch = searchQuery === "" || 
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brandName.toLowerCase().includes(searchQuery.toLowerCase());

    // Company filter
    const matchesCompany = companyFilter === "all-companies" || 
      vehicle.company === companyFilter;

    // Type filter
    const matchesType = typeFilter === "all-types" || 
      vehicle.type.toLowerCase().replace(/\s+/g, "-") === typeFilter.toLowerCase();

    // Status filter
    const matchesStatus = statusFilter === "all-status" || 
      vehicle.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCompany && matchesType && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setCompanyFilter("all-companies");
    setTypeFilter("all-types");
    setStatusFilter("all-status");
  };

  const handleEdit = (vehicle: any) => {
    console.log("Edit button clicked, vehicle data:", vehicle);
    setIsAddMode(false);
    setEditingVehicle(vehicle);
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    console.log("Add vehicle button clicked");
    setIsAddMode(true);
    setEditingVehicle(null);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setEditingVehicle(null);
        setIsAddMode(false);
      }, 100);
    }
  };

  const handleSuccess = async () => {
    // Reload vehicles from API after edit/add
    try {
      const response = await vehiclesApi.getAll();
      const vehiclesData = Array.isArray(response?.data) ? response.data : [];
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error reloading vehicles:", error);
    }
  };

  const handleDelete = async (vehicle: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete vehicle ${vehicle.plate}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeletingVehicleId(vehicle.id);
    
    try {
      await vehiclesApi.delete(vehicle.id);
      toast.success("Vehicle deleted successfully!");
      
      // Reload vehicles after deletion
      const response = await vehiclesApi.getAll();
      const vehiclesData = Array.isArray(response?.data) ? response.data : [];
      setVehicles(vehiclesData);
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error(error?.message || "Failed to delete vehicle");
    } finally {
      setDeletingVehicleId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Fleet Management</h1>
          <p className="text-gray-600">Manage all vehicles in the fleet</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by plate..."
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
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.name}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              {VEHICLE_TYPES.map((type) => (
                <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                  {type}
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
              {VEHICLE_STATUSES.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
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
                  Vehicle
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Capacity
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Last Inspection
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingVehicles ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Loading vehicles...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No vehicles found matching your filters
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{vehicle.plate}</p>
                        <p className="text-xs text-gray-500">
                          {vehicle.brand ? getBrandName(vehicle.brand) : ""} {vehicle.model}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {vehicle.type}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {vehicle.capacity} seats
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {vehicle.company}
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="secondary"
                      className={statusColors[vehicle.status]}
                    >
                      {vehicle.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {vehicle.lastInspection}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/fleet/${vehicle.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(vehicle)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(vehicle)}
                        disabled={deletingVehicleId === vehicle.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
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

      {/* Edit/Add Vehicle Dialog */}
      <EditVehicleDialog
        vehicle={editingVehicle}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        onSuccess={handleSuccess}
        isAddMode={isAddMode}
      />
    </div>
  );
}