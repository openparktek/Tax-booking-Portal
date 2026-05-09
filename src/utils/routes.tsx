import { createBrowserRouter } from "react-router";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import AdminDashboard from "../pages/AdminDashboard";
import BookingsList from "../pages/bookings/BookingsList";
import BookingDetails from "../pages/bookings/BookingDetails";
import LiveTrips from "../pages/trips/LiveTrips";
import CompaniesList from "../pages/companies/CompaniesList";
import CompanyDetails from "../pages/companies/CompanyDetails";
import DriversList from "../pages/drivers/DriversList";
import DriverProfile from "../pages/drivers/DriverProfile";
import VehiclesList from "../pages/fleet/VehiclesList";
import VehicleDetails from "../pages/fleet/VehicleDetails";
import BookingAssignments from "../pages/fleet/BookingAssignments";
import FaresZones from "../pages/fares/FaresZones";
import SettlementDashboard from "../pages/settlements/SettlementDashboard";
import SettlementReports from "../pages/settlements/SettlementReports";
import ProcessSettlement from "../pages/settlements/ProcessSettlement";
import SystemSettings from "../pages/settings/SystemSettings";
import UsersRoles from "../pages/settings/UsersRoles";
import UserManagement from "../pages/settings/UserManagement";
import AuditLog from "../pages/audit/AuditLog";
import AlertsIncidents from "../pages/alerts/AlertsIncidents";
import KioskInterface from "../pages/kiosk/KioskInterface";
import CashierInterface from "../pages/cashier/CashierInterface";
import CashierDashboard from "../pages/cashier/CashierDashboard";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/kiosk",
    Component: KioskInterface,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: CashierDashboard }, // This will show either cashier terminal or admin dashboard
      { path: "bookings", Component: BookingsList },
      { path: "bookings/:id", Component: BookingDetails },
      { path: "live-trips", Component: LiveTrips },
      { path: "companies", Component: CompaniesList },
      { path: "companies/:id", Component: CompanyDetails },
      { path: "drivers", Component: DriversList },
      { path: "drivers/:id", Component: DriverProfile },
      { path: "fleet", Component: VehiclesList },
      { path: "fleet/:id", Component: VehicleDetails },
      { path: "booking-assignments", Component: BookingAssignments },
      { path: "fares-zones", Component: FaresZones },
      { path: "settlement-dashboard", Component: SettlementDashboard },
      { path: "process-settlement", Component: ProcessSettlement },
      { path: "settlement-reports", Component: SettlementReports },
      { path: "settings", Component: SystemSettings },
      { path: "users-roles", Component: UsersRoles },
      { path: "user-management", Component: UserManagement },
      { path: "audit-log", Component: AuditLog },
      { path: "alerts", Component: AlertsIncidents },
    ],
  },
], { basename: '/booking' });
