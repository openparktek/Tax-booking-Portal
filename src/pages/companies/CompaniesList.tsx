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
import { Search, Plus, Eye, Edit2, Building2 } from "lucide-react";
import EditCompanyDialog from "../../components/EditCompanyDialog";
import { companiesApi, vehiclesApi, driversApi } from "../../lib/api";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Suspended: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

export default function CompaniesList() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load companies from API
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getAll();
      const companiesData = Array.isArray(response?.data) ? response.data : [];
      
      console.log("Companies loaded from API:", companiesData);
      
      // Calculate fleet size and active drivers for each company
      const [vehiclesResponse, driversResponse] = await Promise.all([
        vehiclesApi.getAll(),
        driversApi.getAll()
      ]);
      
      const vehicles = Array.isArray(vehiclesResponse?.data) ? vehiclesResponse.data : [];
      const drivers = Array.isArray(driversResponse?.data) ? driversResponse.data : [];
      
      const enrichedCompanies = companiesData.map((company: any) => {
        const companyVehicles = vehicles.filter((v: any) => v.company === company.name);
        const companyDrivers = drivers.filter((d: any) => d.company === company.name && d.status === "Available");
        
        return {
          ...company,
          fleetSize: companyVehicles.length,
          activeDrivers: companyDrivers.length,
        };
      });
      
      setCompanies(enrichedCompanies);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast.error("Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: any) => {
    console.log("Edit button clicked, company data:", company);
    setEditingCompany(company);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setTimeout(() => setEditingCompany(null), 100);
    }
  };

  const handleSuccess = () => {
    // Reload companies after edit
    loadCompanies();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all-status");
  };

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = searchQuery === "" ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all-status" ||
      company.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Companies</h1>
          <p className="text-gray-600">
            Manage limousine companies and partners
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search companies..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
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
                  Company Name
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Contact Person
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Fleet Size
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Active Drivers
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Settlement Cycle
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Loading companies...
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No companies found
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-900">
                          {company.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {company.contactPerson || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {company.fleetSize}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {company.activeDrivers}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="secondary"
                        className={statusColors[company.status] || "bg-gray-100 text-gray-700"}
                      >
                        {company.status || "Active"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {company.settlementCycle || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/companies/${company.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(company)}
                        >
                          <Edit2 className="w-4 h-4" />
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
            Showing {filteredCompanies.length} of {companies.length} companies
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

      {/* Edit Company Dialog */}
      <EditCompanyDialog
        company={editingCompany}
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
