import { RouterProvider } from "react-router";
import { router } from "./utils/routes";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./lib/errorBoundary";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { UserProvider } from "./contexts/UserContext";
import { checkAndResetData } from "./utils/initializeData";
import "./lib/i18n";

// Initialize data versioning on app load
checkAndResetData();

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <CurrencyProvider>
          <RouterProvider router={router} />
          <Toaster />
        </CurrencyProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}
