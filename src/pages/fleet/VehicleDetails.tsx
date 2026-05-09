import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ArrowLeft, Car, Edit2, FileText, Wrench } from "lucide-react";
import { getBrandName } from "../../data/carDatabase";

const recentTrips = [
  {
    id: "BK-2846",
    driver: "محمد العلي",
    passenger: "Sarah Williams",
    route: "Airport T2 → Downtown",
    date: "Nov 29, 10:30 AM",
    distance: "24.5 km",
    fare: "$120.00",
  },
  {
    id: "BK-2840",
    driver: "محمد العلي",
    passenger: "John Mitchell",
    route: "Hotel Plaza → Airport T1",
    date: "Nov 29, 8:15 AM",
    distance: "18.2 km",
    fare: "$92.00",
  },
  {
    id: "BK-2832",
    driver: "محمد العلي",
    passenger: "Robert Brown",
    route: "Business District → Airport T2",
    date: "Nov 28, 6:30 PM",
    distance: "21.8 km",
    fare: "$105.00",
  },
];

const documents = [
  {
    id: 1,
    name: "Vehicle Registration",
    number: "REG-ABC1234",
    expiry: "Sep 30, 2026",
    status: "Valid",
  },
  {
    id: 2,
    name: "Insurance Certificate",
    number: "INS-789456123",
    expiry: "Dec 31, 2025",
    status: "Valid",
  },
  {
    id: 3,
    name: "Inspection Certificate",
    number: "INSP-2025-1234",
    expiry: "May 15, 2026",
    status: "Valid",
  },
  {
    id: 4,
    name: "Commercial Permit",
    number: "CP-654321",
    expiry: "Jul 20, 2026",
    status: "Valid",
  },
];

const maintenanceHistory = [
  {
    id: 1,
    date: "Nov 15, 2025",
    type: "Routine Inspection",
    description: "Regular 6-month maintenance check",
    cost: "$350",
    status: "Completed",
  },
  {
    id: 2,
    date: "Oct 8, 2025",
    type: "Tire Replacement",
    description: "Replaced all four tires",
    cost: "$800",
    status: "Completed",
  },
  {
    id: 3,
    date: "Aug 22, 2025",
    type: "Oil Change",
    description: "Engine oil and filter replacement",
    cost: "$120",
    status: "Completed",
  },
  {
    id: 4,
    date: "Jul 5, 2025",
    type: "Brake Service",
    description: "Brake pad replacement and fluid change",
    cost: "$450",
    status: "Completed",
  },
];

const statusColors: Record<string, string> = {
  Valid: "bg-green-100 text-green-700",
  Expiring: "bg-yellow-100 text-yellow-700",
  Expired: "bg-red-100 text-red-700",
  Completed: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
};

export default function VehicleDetails() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/fleet"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fleet
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 mb-1">أ ب ج -1234</h1>
              <p className="text-gray-600">{getBrandName("toyota")} Land Cruiser • 2022</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-blue-100 text-blue-700">Busy</Badge>
            <Button>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Vehicle
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="trips">Trip History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Vehicle Image */}
            <Card className="col-span-2 p-6">
              <h3 className="text-gray-900 mb-4">Vehicle</h3>
              <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center mb-6">
                <Car className="w-24 h-24 text-gray-400" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Model</p>
                  <p className="text-gray-900">{getBrandName("toyota")} Land Cruiser</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Year</p>
                  <p className="text-gray-900">2022</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Color</p>
                  <p className="text-gray-900">Black</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">VIN</p>
                  <p className="text-gray-900">1HGBH41JXMN109186</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Capacity</p>
                  <p className="text-gray-900">6 Passengers</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mileage</p>
                  <p className="text-gray-900">45,230 km</p>
                </div>
              </div>
            </Card>

            {/* Details */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Assignment</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Company</p>
                    <p className="text-gray-900">Luxury Transport</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Driver</p>
                    <p className="text-gray-900">محمد العلي</p>
                    <p className="text-sm text-gray-600">ID: DRV-1001</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge className="bg-blue-100 text-blue-700">Busy</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Trips</p>
                    <p className="text-2xl text-gray-900">487</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">This Month</p>
                    <p className="text-2xl text-gray-900">68</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl text-gray-900">$52,340</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Service</p>
                    <p className="text-gray-900">Nov 15, 2025</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Vehicle Documents</h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">{doc.name}</p>
                      <p className="text-xs text-gray-600">
                        {doc.number} • Expires: {doc.expiry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={statusColors[doc.status]}
                    >
                      {doc.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Maintenance History</h3>
              <Button>
                <Wrench className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
            <div className="space-y-3">
              {maintenanceHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 mb-1">{record.type}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        {record.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{record.date}</span>
                        <span>•</span>
                        <span>{record.cost}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusColors[record.status]}
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Booking ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Driver
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Passenger
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Route
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Distance
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Fare
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {trip.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {trip.driver}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {trip.passenger}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {trip.route}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {trip.date}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {trip.distance}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {trip.fare}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
