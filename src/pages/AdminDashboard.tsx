import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  TrendingUp,
  Car,
  Activity,
  DollarSign,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useBookings } from "../hooks/useBookings";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../contexts/CurrencyContext";
import { useUser } from "../contexts/UserContext";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const kpiData = [
  {
    title: "Total Trips Today",
    value: "127",
    change: "+12%",
    icon: Activity,
    trend: "up",
  },
  {
    title: "Active Trips",
    value: "23",
    change: "Real-time",
    icon: Car,
    trend: "neutral",
  },
  {
    title: "Fleet Utilization",
    value: "68%",
    change: "+5%",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "Revenue Today",
    value: "$12,450",
    change: "+8%",
    icon: DollarSign,
    trend: "up",
  },
];

const recentTrips = [
  {
    id: "BK-2847",
    passenger: "عمر السالم",
    company: "Elite Limo",
    driver: "أحمد الشمري",
    status: "Completed",
    time: "10:45 AM",
  },
  {
    id: "BK-2846",
    passenger: "نورة العتيبي",
    company: "Luxury Transport",
    driver: "محمد العلي",
    status: "In Progress",
    time: "10:30 AM",
  },
  {
    id: "BK-2845",
    passenger: "فيصل الشهري",
    company: "Elite Limo",
    driver: "خالد الدوسري",
    status: "Waiting",
    time: "10:15 AM",
  },
  {
    id: "BK-2844",
    passenger: "منى الغامدي",
    company: "Premier Cars",
    driver: "عبدالله المطيري",
    status: "Completed",
    time: "10:00 AM",
  },
  {
    id: "BK-2843",
    passenger: "سلطان القرني",
    company: "Luxury Transport",
    driver: "سعد القحطاني",
    status: "Completed",
    time: "9:45 AM",
  },
];

const alerts = [
  {
    id: 1,
    severity: "critical",
    message: "Vehicle ث خ ذ -0123 maintenance overdue",
    time: "5 min ago",
  },
  {
    id: 2,
    severity: "major",
    message: "Driver license expiring in 7 days - أحمد الشمري",
    time: "15 min ago",
  },
  {
    id: 3,
    severity: "minor",
    message: "Settlement pending for Elite Limo",
    time: "1 hour ago",
  },
];

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Waiting: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  major: "bg-orange-100 text-orange-700 border-orange-200",
  minor: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { stats, loading: statsLoading } = useDashboard();
  const { bookings } = useBookings();
  const { formatCurrency } = useCurrency();
  const { isCustomer, hasPermission } = useUser();
  const navigate = useNavigate();

  // Redirect customers to bookings page
  useEffect(() => {
    if (isCustomer || !hasPermission('dashboard')) {
      console.log('🔐 Dashboard - Redirecting customer to bookings page');
      navigate("/bookings");
    }
  }, [isCustomer, hasPermission, navigate]);

  const kpiData = [
    {
      title: t('dashboard.totalTripsToday'),
      value: stats?.totalTripsToday || 0,
      change: "+12%",
      icon: Activity,
      trend: "up",
    },
    {
      title: t('dashboard.activeTrips'),
      value: stats?.activeTrips || 0,
      change: "Real-time",
      icon: Car,
      trend: "neutral",
    },
    {
      title: t('dashboard.fleetUtilization'),
      value: `${stats?.fleetUtilization || 0}%`,
      change: "+5%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: t('dashboard.revenueToday'),
      value: formatCurrency(stats?.revenueToday || 0),
      change: "+8%",
      icon: DollarSign,
      trend: "up",
    },
  ];

  // Get recent trips from bookings
  const recentTrips = bookings.slice(0, 5).map((booking: any) => ({
    id: booking.id,
    passenger: booking.passenger,
    company: booking.company,
    driver: booking.driver,
    status: booking.status,
    time: new Date(booking.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1">{t('dashboard.title')}</h1>
        <p className="text-gray-600">
          {t('dashboard.welcome')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <Card className="col-span-4 p-8 text-center text-gray-500">
            Loading dashboard statistics...
          </Card>
        ) : (
          kpiData.map((kpi) => (
          <Card key={kpi.title} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  kpi.trend === "up" ? "bg-green-50" : "bg-blue-50"
                }`}
              >
                <kpi.icon
                  className={`w-5 h-5 ${
                    kpi.trend === "up" ? "text-green-600" : "text-blue-600"
                  }`}
                />
              </div>
              <span
                className={`text-xs ${
                  kpi.trend === "up" ? "text-green-600" : "text-gray-600"
                }`}
              >
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl text-gray-900 mb-1">{kpi.value}</div>
            <div className="text-sm text-gray-600">{kpi.title}</div>
          </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Map Component */}
        <Card className="col-span-2 p-6">
          <h3 className="text-gray-900 mb-4">Active Vehicles</h3>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 300"
                className="text-gray-400"
              >
                <path
                  d="M 50 150 Q 150 80 250 150 T 450 150"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 100 200 Q 200 150 300 200 T 500 200"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            {/* Vehicle markers */}
            <div className="absolute top-12 left-20 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute top-32 left-48 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute top-24 right-32 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-16 left-36 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-24 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-gray-500">
              <Car className="w-8 h-8 mb-2 mx-auto" />
              <p className="text-sm">23 vehicles active</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">On Trip (15)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Waiting (8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">Offline (42)</span>
            </div>
          </div>
        </Card>

        {/* Alerts Panel */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Alerts</h3>
            <Badge variant="destructive" className="text-xs">
              3 New
            </Badge>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${severityColors[alert.severity]}`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm flex-1">{alert.message}</p>
                </div>
                <div className="flex items-center gap-1 text-xs opacity-70 ml-6">
                  <Clock className="w-3 h-3" />
                  {alert.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Trips Table */}
      <Card className="mt-6 p-6">
        <h3 className="text-gray-900 mb-4">{t('dashboard.recentTrips')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Booking ID
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Passenger
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Driver
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No recent trips. Create a booking to get started!
                  </td>
                </tr>
              ) : (
                recentTrips.map((trip: any) => (
                <tr key={trip.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {trip.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {trip.passenger}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {trip.company}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {trip.driver}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="secondary"
                      className={statusColors[trip.status]}
                    >
                      {trip.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {trip.time}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}