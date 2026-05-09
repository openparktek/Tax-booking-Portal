import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Star,
  FileText,
  AlertCircle,
} from "lucide-react";

const recentTrips = [
  {
    id: "BK-2847",
    passenger: "John Mitchell",
    pickup: "Airport T2",
    dropoff: "Downtown",
    date: "Nov 29, 10:45 AM",
    fare: "$85.00",
    rating: 5,
  },
  {
    id: "BK-2840",
    passenger: "Sarah Williams",
    pickup: "Hotel Plaza",
    dropoff: "Airport T1",
    date: "Nov 29, 8:30 AM",
    fare: "$92.00",
    rating: 5,
  },
  {
    id: "BK-2832",
    passenger: "Robert Brown",
    pickup: "Business District",
    dropoff: "Airport T2",
    date: "Nov 28, 6:15 PM",
    fare: "$78.00",
    rating: 4,
  },
  {
    id: "BK-2825",
    passenger: "Emily Davis",
    pickup: "Airport T1",
    dropoff: "Suburban Area",
    date: "Nov 28, 2:20 PM",
    fare: "$125.00",
    rating: 5,
  },
];

const documents = [
  {
    id: 1,
    name: "Driver's License",
    number: "DL-123456789",
    expiry: "Dec 15, 2026",
    status: "Valid",
  },
  {
    id: 2,
    name: "Commercial Driver Permit",
    number: "CDP-987654321",
    expiry: "Aug 22, 2025",
    status: "Valid",
  },
  {
    id: 3,
    name: "National ID",
    number: "ID-456789123",
    expiry: "Mar 10, 2028",
    status: "Valid",
  },
  {
    id: 4,
    name: "Medical Certificate",
    number: "MED-789123456",
    expiry: "Jan 5, 2026",
    status: "Valid",
  },
];

const incidents = [
  {
    id: 1,
    date: "Nov 15, 2025",
    type: "Customer Complaint",
    description: "Late arrival at pickup location",
    status: "Resolved",
    severity: "Minor",
  },
  {
    id: 2,
    date: "Oct 28, 2025",
    type: "Positive Feedback",
    description: "Excellent service, very professional",
    status: "Closed",
    severity: "None",
  },
];

const statusColors: Record<string, string> = {
  Valid: "bg-green-100 text-green-700",
  Expiring: "bg-yellow-100 text-yellow-700",
  Expired: "bg-red-100 text-red-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
  Open: "bg-yellow-100 text-yellow-700",
};

export default function DriverProfile() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/drivers"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Drivers
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-gray-900">محمد العلي</h1>
                <Badge className="bg-blue-100 text-blue-700">On Trip</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-900">4.8</span>
                  <span className="text-gray-500">(324 trips)</span>
                </div>
              </div>
              <p className="text-gray-600">Luxury Transport Co.</p>
            </div>
          </div>
          <Button>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Driver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">+1 (555) 234-5678</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">mohammed.alali@email.com</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">License Number</p>
                <p className="text-gray-900">DL-123456789</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">National ID</p>
                <p className="text-gray-900">ID-456789123</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                <p className="text-gray-900">Jan 15, 1985</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Join Date</p>
                <p className="text-gray-900">Mar 10, 2022</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-gray-900">
                    789 Residential Street, Apt 4B, City, ST 12345
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Documents</h3>
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
                  <Badge
                    variant="secondary"
                    className={statusColors[doc.status]}
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Trip History */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Recent Trip History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm text-gray-600">
                      Booking ID
                    </th>
                    <th className="text-left py-3 px-2 text-sm text-gray-600">
                      Passenger
                    </th>
                    <th className="text-left py-3 px-2 text-sm text-gray-600">
                      Route
                    </th>
                    <th className="text-left py-3 px-2 text-sm text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 text-sm text-gray-600">
                      Fare
                    </th>
                    <th className="text-left py-3 px-2 text-sm text-gray-600">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-sm text-gray-900">
                        {trip.id}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-900">
                        {trip.passenger}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {trip.pickup} → {trip.dropoff}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {trip.date}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-900">
                        {trip.fare}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-900">
                            {trip.rating}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Current Assignment */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Current Assignment</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vehicle</p>
                <p className="text-gray-900">أ ب ج -1234</p>
                <p className="text-sm text-gray-600">Toyota Land Cruiser</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Trip</p>
                <p className="text-gray-900">BK-2846</p>
                <p className="text-sm text-gray-600">Passenger: Sarah Williams</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Trip Duration</p>
                <p className="text-gray-900">15 minutes</p>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Trips</p>
                <p className="text-2xl text-gray-900">324</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl text-gray-900">42</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl text-gray-900">4.8</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl text-gray-900">$28,450</p>
              </div>
            </div>
          </Card>

          {/* Incidents & Notes */}
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Incidents & Notes</h3>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900 mb-1">
                          {incident.type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {incident.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">{incident.date}</p>
                    <Badge
                      variant="secondary"
                      className={`${statusColors[incident.status]} text-xs`}
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
