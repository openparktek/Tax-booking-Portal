import { useState, useEffect } from "react";
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
import { Calendar, FileText, Download, AlertCircle } from "lucide-react";
import { companiesApi } from "../../lib/api";
import { toast } from "sonner";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import { useUser } from "../../contexts/UserContext";

const statusColors: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function SettlementReports() {
  const { isCompanyRestricted, userCompany, userCompanyName } = useUser();
  const [settlements, setSettlements] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState("all-companies");
  const [methodFilter, setMethodFilter] = useState("all-methods");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load settlements from localStorage (where ProcessSettlement stores them)
      const storedSettlements = localStorage.getItem('openpark_settlements');
      if (storedSettlements) {
        let parsedSettlements = JSON.parse(storedSettlements);
        
        // Filter settlements if user is company-restricted
        if (isCompanyRestricted && userCompanyName) {
          parsedSettlements = parsedSettlements.filter((s: any) => s.companyName === userCompanyName);
        }
        
        setSettlements(parsedSettlements);
      }
      
      // Load companies for filter
      const companiesResponse = await companiesApi.getAll();
      if (companiesResponse.success) {
        let companiesList = companiesResponse.data || [];
        
        // Filter companies if user is company-restricted
        if (isCompanyRestricted && userCompany) {
          companiesList = companiesList.filter((c: any) => c.id === userCompany);
        }
        
        setCompanies(companiesList);
        
        // Auto-select company filter for restricted users
        if (isCompanyRestricted && userCompanyName) {
          setCompanyFilter(userCompanyName);
        }
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    // Don't clear company filter for restricted users
    if (!isCompanyRestricted) {
      setCompanyFilter("all-companies");
    }
    setMethodFilter("all-methods");
  };

  // Calculate summary statistics
  const totalTrips = settlements.reduce((sum, s) => sum + (s.tripCount || 0), 0);
  const totalGross = settlements.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalAirportShare = totalGross * 0.2; // Assuming 20% airport share

  // Filter settlements
  const filteredSettlements = settlements.filter(settlement => {
    const matchesCompany = companyFilter === "all-companies" || settlement.companyName === companyFilter;
    const matchesMethod = methodFilter === "all-methods" || settlement.paymentMethod === methodFilter;
    return matchesCompany && matchesMethod;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Settlement Reports</h1>
          <p className="text-gray-600">
            Detailed settlement history and reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" disabled>
            <FileText className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" disabled>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input type="date" className="pl-10" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input type="date" className="pl-10" />
          </div>
          <div>
            <Select 
              value={companyFilter} 
              onValueChange={setCompanyFilter}
              disabled={isCompanyRestricted}
            >
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
            {isCompanyRestricted && userCompanyName && (
              <p className="text-xs text-gray-500 mt-1">
                Restricted to: {userCompanyName}
              </p>
            )}
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-methods">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-sm text-gray-600 mb-2">Total Settlements</p>
          <p className="text-2xl text-gray-900">{filteredSettlements.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-600 mb-2">Total Trips</p>
          <p className="text-2xl text-gray-900">{totalTrips}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-600 mb-2">Total Paid</p>
          <p className="text-2xl text-gray-900">
            <CurrencyDisplay amount={totalGross} />
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-600 mb-2">Airport Share</p>
          <p className="text-2xl text-gray-900">
            <CurrencyDisplay amount={totalAirportShare} />
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Payment Method
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Reference
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading settlements...
                  </td>
                </tr>
              ) : filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-900 mb-1">No Settlements Found</p>
                      <p className="text-sm text-gray-500">
                        Process settlements to see them appear here
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {settlement.companyName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(settlement.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      <CurrencyDisplay amount={settlement.amount} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {settlement.paymentMethod === "cash" && "Cash"}
                      {settlement.paymentMethod === "bank_transfer" && "Bank Transfer"}
                      {settlement.paymentMethod === "credit_card" && "Credit Card"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {settlement.referenceNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={statusColors[settlement.status] || statusColors.Paid}
                      >
                        {settlement.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredSettlements.length} of {settlements.length} settlements
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
    </div>
  );
}