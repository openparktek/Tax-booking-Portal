import { useUser } from "../../contexts/UserContext";
import AdminDashboard from "../AdminDashboard";
import CashierTerminal from "./CashierTerminal";
import { useEffect } from "react";

export default function CashierDashboard() {
  const { isCashier, currentUser, currentRole } = useUser();

  useEffect(() => {
    console.log("🎯 CashierDashboard - Debug Info:", {
      isCashier,
      currentUser,
      currentRole,
      roleId: currentUser?.roleId,
      roleName: currentRole?.name,
    });
  }, [isCashier, currentUser, currentRole]);

  // If user is a cashier, show the cashier terminal
  // Otherwise, show the regular admin dashboard
  if (isCashier) {
    console.log("✅ Showing Cashier Terminal");
    return <CashierTerminal />;
  }

  console.log("❌ Showing Admin Dashboard");
  return <AdminDashboard />;
}