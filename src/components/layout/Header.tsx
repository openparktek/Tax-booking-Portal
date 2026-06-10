import { Search, Bell, User, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import LanguageSwitcher from "../LanguageSwitcher";
import CurrencySelector from "../CurrencySelector";
import { useUser } from "../../contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";

export default function Header() {
  const { t } = useTranslation();
  const { currentUser, currentRole, logout } = useUser();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    window.location.href = "/booking/login";
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder={t('common.search')}
            className="ltr:pl-10 rtl:pr-10 bg-gray-50"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <CurrencySelector />
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 ltr:right-1 rtl:left-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
        
        {/* Profile Dropdown */}
        <div className="ltr:pl-3 ltr:border-l rtl:pr-3 rtl:border-r border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="ltr:text-right rtl:text-left">
                  <div className="text-sm text-gray-900">{currentUser?.name || "User"}</div>
                  <div className="text-xs text-gray-500">{currentRole?.name || "Loading..."}</div>
                </div>
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/user-management")}>
                <UserCircle className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
