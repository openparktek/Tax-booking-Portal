import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  Car,
  Users,
  MapPin,
  BarChart3,
  Settings,
  Building2,
  UserCheck,
  Scan,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../contexts/UserContext";
import openparkLogo from "@/assets/df274fdb1f51471ea52d922584c222046a8b4e5c.png";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { hasPermission, isCashier } = useUser();

  // Define all navigation items with their required permissions
  const allNavigation = [
    {
      name: isCashier ? "Cashier Terminal" : t("nav.dashboard"),
      href: "/",
      icon: isCashier ? Scan : LayoutDashboard,
      permission: "dashboard",
    },
    {
      name: t("nav.bookings"),
      href: "/bookings",
      icon: Calendar,
      permission: "bookings",
    },
    {
      name: t("nav.liveTrips"),
      href: "/live-trips",
      icon: MapPin,
      permission: "trips",
    },
    {
      name: t("nav.bookingAssignments"),
      href: "/booking-assignments",
      icon: BarChart3,
      permission: "fleet", // Changed from "bookings" to "fleet" so customers can't see it
    },
    {
      name: t("nav.companies"),
      href: "/companies",
      icon: Building2,
      permission: "companies",
    },
    {
      name: t("nav.drivers"),
      href: "/drivers",
      icon: Users,
      permission: "drivers",
    },
    {
      name: t("nav.fleet"),
      href: "/fleet",
      icon: Car,
      permission: "fleet",
    },
    {
      name: t("nav.faresZones"),
      href: "/fares-zones",
      icon: DollarSign,
      permission: "fares",
    },
    {
      name: t("nav.settlements"),
      href: "/process-settlement",
      icon: BarChart3,
      permission: "settlements",
    },
    {
      name: t("nav.reports"),
      href: "/settlement-reports",
      icon: BarChart3,
      permission: "settlements",
    },
    {
      name: t("nav.alerts"),
      href: "/alerts",
      icon: BarChart3,
      permission: "alerts",
    },
    {
      name: "Audit Log",
      href: "/audit-log",
      icon: BarChart3,
      permission: "audit",
    },
    {
      name: "User Management",
      href: "/user-management",
      icon: UserCheck,
      permission: "users",
    },
    {
      name: t("nav.usersRoles"),
      href: "/users-roles",
      icon: BarChart3,
      permission: "users",
    },
    {
      name: t("nav.settings"),
      href: "/settings",
      icon: Settings,
      permission: "settings",
    },
  ];

  // Filter navigation items based on user permissions
  const navigation = allNavigation.filter(item => hasPermission(item.permission));

  return (
    <div className="w-64 bg-white ltr:border-r rtl:border-l border-gray-200 h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src={openparkLogo} 
            alt="OpenPark Logo" 
            className="w-10 h-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-gray-900 text-lg font-semibold">OpenPark</span>
            <span className="text-gray-500 text-xs italic">Transport Booking System</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}