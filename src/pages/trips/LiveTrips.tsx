import { useState, useEffect, useMemo } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Car, Navigation, Clock, User } from "lucide-react";
import { useBookings } from "../../hooks/useBookings";
import { getBrandName } from "../../data/carDatabase";

const activeTrips = [
  {
    id: "BK-2846",
    driver: "محمد العلي",
    vehicle: "أ ب ج -1234",
    company: "Luxury Transport",
    status: "On Trip",
    duration: "15 min",
    passenger: "نورة العتيبي",
    destination: "Downtown",
  },
  {
    id: "BK-2850",
    driver: "أحمد الشمري",
    vehicle: "ه و ز -5678",
    company: "Elite Limo",
    status: "Waiting",
    duration: "8 min",
    passenger: "يوسف الأحمدي",
    destination: "Airport T2",
  },
  {
    id: "BK-2851",
    driver: "خالد الدوسري",
    vehicle: "ح ط ي -9012",
    company: "Elite Limo",
    status: "On Trip",
    duration: "22 min",
    passenger: "فيصل الشهري",
    destination: "Hotel Plaza",
  },
  {
    id: "BK-2852",
    driver: "عبدالله المطيري",
    vehicle: "ك ل م -3456",
    company: "Premier Cars",
    status: "On Trip",
    duration: "12 min",
    passenger: "منى الغامدي",
    destination: "Business District",
  },
  {
    id: "BK-2853",
    driver: "سعد القحطاني",
    vehicle: "ن س ع -7890",
    company: "Luxury Transport",
    status: "Waiting",
    duration: "3 min",
    passenger: "سلطان القرني",
    destination: "Convention Center",
  },
];

const statusColors: Record<string, string> = {
  "On Trip": "bg-green-100 text-green-700",
  Waiting: "bg-yellow-100 text-yellow-700",
  Offline: "bg-gray-100 text-gray-700",
};

export default function LiveTrips() {
  const { bookings, loading } = useBookings();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Load drivers and vehicles from localStorage
  useEffect(() => {
    const loadData = () => {
      const storedDrivers = localStorage.getItem('openpark_drivers');
      const storedVehicles = localStorage.getItem('openpark_vehicles');
      
      if (storedDrivers) {
        try {
          setDrivers(JSON.parse(storedDrivers));
        } catch (e) {
          console.error('Error parsing drivers:', e);
        }
      }
      
      if (storedVehicles) {
        try {
          setVehicles(JSON.parse(storedVehicles));
        } catch (e) {
          console.error('Error parsing vehicles:', e);
        }
      }
    };

    loadData();

    // Listen for localStorage updates
    const handleStorageUpdate = () => {
      loadData();
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('localStorageUpdate', handleStorageUpdate);
  }, []);

  // Filter active trips (In Progress or Waiting)
  const activeTrips = useMemo(() => {
    const active = bookings.filter((b: any) => 
      b.status === "In Progress" || b.status === "Waiting"
    );

    // Enrich with driver and vehicle details
    return active.map((booking: any) => {
      const driver = drivers.find(d => d.id === booking.driverId || d.name === booking.driver);
      const vehicle = vehicles.find(v => v.id === booking.vehicleId || v.plate === booking.vehiclePlate);
      
      return {
        ...booking,
        driverName: driver?.name || booking.driver || "Unassigned",
        vehiclePlate: vehicle?.plate || booking.vehiclePlate || "",
        vehicleFullName: vehicle ? `${vehicle.brand ? getBrandName(vehicle.brand) : ""} ${vehicle.model}` : booking.vehicleType || "",
      };
    });
  }, [bookings, drivers, vehicles]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1">Live Trips</h1>
        <p className="text-gray-600">Real-time tracking of active trips ({activeTrips.length} active)</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trips</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-companies">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-companies">All Companies</SelectItem>
              <SelectItem value="elite">Elite Limo</SelectItem>
              <SelectItem value="luxury">Luxury Transport</SelectItem>
              <SelectItem value="premier">Premier Cars</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">On Trip ({activeTrips.filter(t => t.status === "In Progress").length})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Waiting ({activeTrips.filter(t => t.status === "Waiting").length})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">Offline ({drivers.filter(d => d.status === "Offline").length})</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-6">
        {/* Map */}
        <Card className="col-span-3 p-6">
          <div className="bg-gray-100 rounded-lg h-[600px] relative overflow-hidden">
            {/* Map background with roads */}
            <div className="absolute inset-0 opacity-30">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 600"
                className="text-gray-400"
              >
                {/* Road paths */}
                <path
                  d="M 0 200 L 800 200"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M 0 400 L 800 400"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M 200 0 L 200 600"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M 400 0 L 400 600"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M 600 0 L 600 600"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Curved roads */}
                <path
                  d="M 100 100 Q 300 150 500 100 T 700 100"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M 100 500 Q 300 450 500 500 T 700 500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* Vehicle markers on map - show first 5 active trips */}
            {activeTrips.slice(0, 5).map((trip, index) => {
              const positions = [
                { top: 'top-24', left: 'left-32' },
                { top: 'top-48', left: 'left-56' },
                { top: 'top-36', right: 'right-40' },
                { bottom: 'bottom-32', left: 'left-48' },
                { bottom: 'bottom-40', right: 'right-32' },
              ];
              const pos = positions[index] || positions[0];
              const colorClass = trip.status === "In Progress" ? "bg-green-500" : "bg-yellow-500";
              
              return (
                <div key={trip.id} className={`absolute ${pos.top || ''} ${pos.bottom || ''} ${pos.left || ''} ${pos.right || ''}`}>
                  <div className="relative">
                    <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md whitespace-nowrap text-xs z-10">
                      {trip.driverName}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Airport marker */}
            <div className="absolute top-12 right-12">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                <span className="text-sm">Airport</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Trips List */}
        <Card className="p-4">
          <h3 className="text-gray-900 mb-4">Active Trips ({activeTrips.length})</h3>
          <div className="space-y-3 overflow-y-auto max-h-[560px]">
            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Loading trips...
              </div>
            ) : activeTrips.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No active trips at the moment
              </div>
            ) : (
              activeTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{trip.driverName}</p>
                        <p className="text-xs text-gray-500">{trip.vehiclePlate || trip.vehicleFullName}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${statusColors[trip.status] || 'bg-gray-100 text-gray-700'} text-xs`}
                    >
                      {trip.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-600">{trip.company}</p>
                    <p className="text-gray-900">{trip.passenger}</p>
                    <p className="text-gray-600">→ {trip.dropoffLocation || trip.destination || "Destination"}</p>
                    <div className="flex items-center gap-1 text-gray-500 pt-1">
                      <Clock className="w-3 h-3" />
                      {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : trip.duration || "N/A"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
