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
import { Search, Calendar, Download } from "lucide-react";

const auditLogs = [
  {
    id: 1,
    timestamp: "Nov 29, 2025 11:45:23",
    user: "John Anderson",
    role: "Administrator",
    action: "Updated",
    module: "System Settings",
    ipAddress: "192.168.1.100",
    details: "Changed session timeout to 30 minutes",
  },
  {
    id: 2,
    timestamp: "Nov 29, 2025 11:32:10",
    user: "Sarah Miller",
    role: "Supervisor",
    action: "Created",
    module: "Bookings",
    ipAddress: "192.168.1.102",
    details: "Created manual booking BK-2850",
  },
  {
    id: 3,
    timestamp: "Nov 29, 2025 11:20:45",
    user: "John Anderson",
    role: "Administrator",
    action: "Deleted",
    module: "Users",
    ipAddress: "192.168.1.100",
    details: "Removed user account for Jane Doe",
  },
  {
    id: 4,
    timestamp: "Nov 29, 2025 11:05:18",
    user: "Robert Chen",
    role: "Supervisor",
    action: "Updated",
    module: "Drivers",
    ipAddress: "192.168.1.105",
    details: "Suspended driver Kevin Brown",
  },
  {
    id: 5,
    timestamp: "Nov 29, 2025 10:50:32",
    user: "Sarah Miller",
    role: "Supervisor",
    action: "Updated",
    module: "Bookings",
    ipAddress: "192.168.1.102",
    details: "Reassigned driver for booking BK-2845",
  },
  {
    id: 6,
    timestamp: "Nov 29, 2025 10:35:41",
    user: "John Anderson",
    role: "Administrator",
    action: "Created",
    module: "Companies",
    ipAddress: "192.168.1.100",
    details: "Added new company: Airport Express Ltd",
  },
  {
    id: 7,
    timestamp: "Nov 29, 2025 10:20:15",
    user: "Maria Garcia",
    role: "Viewer",
    action: "Viewed",
    module: "Reports",
    ipAddress: "192.168.1.108",
    details: "Generated settlement report for Nov 2025",
  },
  {
    id: 8,
    timestamp: "Nov 29, 2025 10:05:28",
    user: "Robert Chen",
    role: "Supervisor",
    action: "Updated",
    module: "Fleet",
    ipAddress: "192.168.1.105",
    details: "Set vehicle ABC-1234 to maintenance status",
  },
  {
    id: 9,
    timestamp: "Nov 29, 2025 09:48:52",
    user: "John Anderson",
    role: "Administrator",
    action: "Updated",
    module: "Fares & Zones",
    ipAddress: "192.168.1.100",
    details: "Updated base fare for Airport Zone SUV to $60",
  },
  {
    id: 10,
    timestamp: "Nov 29, 2025 09:30:07",
    user: "Sarah Miller",
    role: "Supervisor",
    action: "Login",
    module: "Authentication",
    ipAddress: "192.168.1.102",
    details: "User logged into the system",
  },
];

const actionColors: Record<string, string> = {
  Created: "bg-green-100 text-green-700",
  Updated: "bg-blue-100 text-blue-700",
  Deleted: "bg-red-100 text-red-700",
  Viewed: "bg-gray-100 text-gray-700",
  Login: "bg-purple-100 text-purple-700",
};

export default function AuditLog() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">Audit Log</h1>
          <p className="text-gray-600">
            System activity tracking and audit trail
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input type="date" className="pl-10" defaultValue="2025-11-29" />
          </div>
          <Select defaultValue="all-users">
            <SelectTrigger>
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-users">All Users</SelectItem>
              <SelectItem value="john">John Anderson</SelectItem>
              <SelectItem value="sarah">Sarah Miller</SelectItem>
              <SelectItem value="robert">Robert Chen</SelectItem>
              <SelectItem value="maria">Maria Garcia</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-actions">
            <SelectTrigger>
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-actions">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="login">Login</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Clear Filters</Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  User
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Module
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  IP Address
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {log.user}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {log.role}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="secondary"
                      className={actionColors[log.action]}
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {log.module}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">Showing 10 of 247 entries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
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
    </div>
  );
}
