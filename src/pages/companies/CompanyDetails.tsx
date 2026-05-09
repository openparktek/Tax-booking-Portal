import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import { useCurrency } from "../../contexts/CurrencyContext";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit2,
  TrendingUp,
  Users,
  Car,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getBrandName } from "../../data/carDatabase";

const tripData = [
  { month: "Jun", trips: 245 },
  { month: "Jul", trips: 312 },
  { month: "Aug", trips: 289 },
  { month: "Sep", trips: 356 },
  { month: "Oct", trips: 398 },
  { month: "Nov", trips: 421 },
];

const fleet = [
  {
    id: 1,
    plate: "أ ب ج -1234",
    brand: "toyota",
    model: "Land Cruiser",
    type: "SUV",
    status: "Available",
  },
  {
    id: 2,
    plate: "ه و ز -5678",
    brand: "mercedes",
    model: "S-Class",
    type: "Luxury Sedan",
    status: "On Trip",
  },
  {
    id: 3,
    plate: "ح ط ي -9012",
    brand: "chevrolet",
    model: "Suburban",
    type: "Van",
    status: "Available",
  },
];

const drivers = [
  {
    id: 1,
    name: "محمد العلي",
    vehicle: "أ ب ج -1234",
    status: "On Trip",
    rating: 4.8,
  },
  {
    id: 2,
    name: "أحمد الشمري",
    vehicle: "ه و ز -5678",
    status: "Online",
    rating: 4.9,
  },
  {
    id: 3,
    name: "خالد الدوسري",
    vehicle: "ح ط ي -9012",
    status: "Offline",
    rating: 4.7,
  },
];

const settlements = [
  {
    id: 1,
    period: "Nov 18-24, 2025",
    trips: 147,
    gross: "$18,450",
    airportShare: "$3,690",
    companyShare: "$14,760",
    status: "Paid",
  },
  {
    id: 2,
    period: "Nov 11-17, 2025",
    trips: 132,
    gross: "$16,280",
    airportShare: "$3,256",
    companyShare: "$13,024",
    status: "Paid",
  },
  {
    id: 3,
    period: "Nov 4-10, 2025",
    trips: 128,
    gross: "$15,920",
    airportShare: "$3,184",
    companyShare: "$12,736",
    status: "Paid",
  },
];

const statusColors: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  "On Trip": "bg-blue-100 text-blue-700",
  Offline: "bg-gray-100 text-gray-700",
  Online: "bg-green-100 text-green-700",
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

export default function CompanyDetails() {
  const { formatCurrency } = useCurrency();
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/companies"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 mb-1">Elite Limo Service</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  +1 (555) 100-2000
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  contact@elitelimo.com
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-green-100 text-green-700">Active</Badge>
            <Button>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Company
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs text-green-600">+12%</span>
              </div>
              <div className="text-2xl text-gray-900 mb-1">421</div>
              <div className="text-sm text-gray-600">Trips This Month</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs text-green-600">38 of 42</span>
              </div>
              <div className="text-2xl text-gray-900 mb-1">38</div>
              <div className="text-sm text-gray-600">Active Drivers</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs text-green-600">72%</span>
              </div>
              <div className="text-2xl text-gray-900 mb-1">72%</div>
              <div className="text-sm text-gray-600">Fleet Utilization</div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs text-green-600">+8%</span>
              </div>
              <div className="text-2xl text-gray-900 mb-1">
                {formatCurrency(14760)}
              </div>
              <div className="text-sm text-gray-600">Revenue Share</div>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Chart */}
            <Card className="col-span-2 p-6">
              <h3 className="text-gray-900 mb-4">Trip Volume (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tripData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Company Info */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact Person</p>
                  <p className="text-gray-900">John Anderson</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-gray-900">
                      123 Business Park Drive,
                      <br />
                      Suite 200, City, ST 12345
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Settlement Cycle</p>
                  <p className="text-gray-900">Weekly</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Revenue Share</p>
                  <p className="text-gray-900">80% (Airport: 20%)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">License Number</p>
                  <p className="text-gray-900">LIC-2024-1234</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fleet">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Plate Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Model
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fleet.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {vehicle.plate}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {vehicle.brand ? getBrandName(vehicle.brand) : ""} {vehicle.model}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {vehicle.type}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={statusColors[vehicle.status]}
                        >
                          {vehicle.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Driver Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Vehicle
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Rating
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {driver.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {driver.vehicle}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        ⭐ {driver.rating}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={statusColors[driver.status]}
                        >
                          {driver.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Period
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Trips
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Gross Fare
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Airport Share
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Company Share
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((settlement) => (
                    <tr key={settlement.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {settlement.period}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {settlement.trips}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {settlement.gross}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {settlement.airportShare}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {settlement.companyShare}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={statusColors[settlement.status]}
                        >
                          {settlement.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Compliance Documents</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900 mb-1">Business License</p>
                  <p className="text-xs text-gray-600">
                    Expires: Dec 31, 2025
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">Valid</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900 mb-1">Insurance Certificate</p>
                  <p className="text-xs text-gray-600">
                    Expires: Jun 30, 2026
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">Valid</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900 mb-1">
                    Airport Permit
                  </p>
                  <p className="text-xs text-gray-600">
                    Expires: Mar 15, 2026
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">Valid</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
