import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { AlertCircle, Clock, Eye, CheckCircle } from "lucide-react";

const alerts = [
  {
    id: 1,
    severity: "Critical",
    source: "Fleet",
    message: "Vehicle ث خ ذ -0123 maintenance overdue by 15 days",
    time: "5 min ago",
    status: "Open",
  },
  {
    id: 2,
    severity: "Major",
    source: "Driver",
    message: "Driver license expiring in 7 days - أحمد الشمري",
    time: "15 min ago",
    status: "Open",
  },
  {
    id: 3,
    severity: "Minor",
    source: "Payment",
    message: "Settlement pending for Elite Limo - 3 days overdue",
    time: "1 hour ago",
    status: "Acknowledged",
  },
  {
    id: 4,
    severity: "Critical",
    source: "Kiosk",
    message: "Kiosk Terminal 2-A offline for 30 minutes",
    time: "2 hours ago",
    status: "Open",
  },
  {
    id: 5,
    severity: "Major",
    source: "Driver",
    message: "Multiple customer complaints for driver عمر الزهراني",
    time: "3 hours ago",
    status: "Under Review",
  },
  {
    id: 6,
    severity: "Minor",
    source: "System",
    message: "Database backup completed with warnings",
    time: "4 hours ago",
    status: "Resolved",
  },
];

const incidents = [
  {
    id: 1,
    driver: "عمر الزهراني",
    company: "Luxury Transport",
    type: "Customer Complaint",
    description: "Late arrival at pickup location, passenger missed flight",
    status: "Under Investigation",
    createdAt: "Nov 28, 2025",
    priority: "High",
  },
  {
    id: 2,
    driver: "فهد العتيبي",
    company: "Elite Limo",
    type: "Vehicle Damage",
    description: "Minor collision in parking area, no injuries",
    status: "Resolved",
    createdAt: "Nov 27, 2025",
    priority: "Medium",
  },
  {
    id: 3,
    driver: "سعد القحطاني",
    company: "Luxury Transport",
    type: "Route Deviation",
    description: "Driver took unauthorized detour during trip",
    status: "Under Review",
    createdAt: "Nov 26, 2025",
    priority: "Medium",
  },
  {
    id: 4,
    driver: "محمد العلي",
    company: "Luxury Transport",
    type: "Positive Feedback",
    description: "Passenger praised exceptional service and professionalism",
    status: "Closed",
    createdAt: "Nov 25, 2025",
    priority: "Low",
  },
  {
    id: 5,
    driver: "خالد الدوسري",
    company: "Elite Limo",
    type: "Safety Concern",
    description: "Reported speeding by another driver on highway",
    status: "Under Investigation",
    createdAt: "Nov 24, 2025",
    priority: "High",
  },
];

const severityColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  Major: "bg-orange-100 text-orange-700 border-orange-200",
  Minor: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const statusColors: Record<string, string> = {
  Open: "bg-red-100 text-red-700",
  Acknowledged: "bg-yellow-100 text-yellow-700",
  "Under Review": "bg-blue-100 text-blue-700",
  "Under Investigation": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
};

const priorityColors: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

export default function AlertsIncidents() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Alerts & Incidents</h1>
          <p className="text-gray-600">
            Monitor system alerts and manage incidents
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all-severity">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-severity">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">
            Alerts
            <Badge className="ml-2 bg-red-100 text-red-700">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="incidents">
            Incidents
            <Badge className="ml-2 bg-blue-100 text-blue-700">2</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-gray-900">System Alerts</h3>
              <Button variant="outline" size="sm">
                Mark All as Read
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg border ${severityColors[alert.severity]}`}
                    >
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className={severityColors[alert.severity]}
                            >
                              {alert.severity}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-700"
                            >
                              {alert.source}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-900 mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={statusColors[alert.status]}
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
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
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {incident.driver}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {incident.company}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {incident.type}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                        {incident.description}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={priorityColors[incident.priority]}
                        >
                          {incident.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className={statusColors[incident.status]}
                        >
                          {incident.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {incident.createdAt}
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
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
