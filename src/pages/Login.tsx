import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MapPin } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { authApi } from "../lib/api";
import openparkLogo from "@/assets/df274fdb1f51471ea52d922584c222046a8b4e5c.png";
import loginBackground from "@/assets/login-background.png";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  // Admin initialization is handled by database seed script

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success("Login successful!");
        
        // Check if user is kiosk user and redirect to kiosk page
        const userData = JSON.parse(localStorage.getItem('openpark_current_user') || '{}');
        if (userData.roleId === 'role-6') {
          navigate("/kiosk");
        } else {
          navigate("/");
        }
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await authApi.register({
        name: registerData.name,
        email: registerData.email,
        mobile: registerData.mobile || undefined,
        password: registerData.password,
      });
      
      if (data.success) {
        toast.success("Registration successful! Please check your email for confirmation.");
        // Reset form
        setRegisterData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login/Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Language Switcher */}
          <div className="flex ltr:justify-end rtl:justify-start mb-4">
            <LanguageSwitcher />
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img 
              src={openparkLogo} 
              alt="OpenPark Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-gray-900 text-xl font-semibold">OpenPark</span>
          </div>

          <div className="mb-8">
            <h2 className="text-gray-900 mb-2">{t('login.welcomeBack')}</h2>
            <p className="text-gray-600">{t('login.signInAccount')}</p>
          </div>

          <Card className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">{t('login.email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="admin@openpark.com"
                        className="mt-1.5"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">{t('login.password')}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t('login.password')}
                        className="mt-1.5"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 inline-block"
                    >
                      {t('login.forgotPassword')}
                    </Link>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : t('login.signIn')}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">Full Name *</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        className="mt-1.5"
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email *</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="mt-1.5"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-mobile">Mobile Number (Optional)</Label>
                      <Input
                        id="register-mobile"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="mt-1.5"
                        value={registerData.mobile}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, mobile: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password *</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        className="mt-1.5"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-confirm-password">Confirm Password *</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Re-enter your password"
                        className="mt-1.5"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Default: admin@openpark.hu / 123456</p>
              <p>• Or create users via User Management</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('login.copyright')}
          </p>
        </div>
      </div>

      {/* Right side - Airport Image */}
      <div className="hidden lg:block flex-1 relative">
        <img
          src={loginBackground}
          alt="Airport"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
        <div className="absolute bottom-8 ltr:left-8 rtl:right-8 ltr:right-8 rtl:left-8 text-white">
          <h3 className="text-white mb-2">{t('login.subtitle')}</h3>
          <p className="text-blue-100">
            {t('login.description')}
          </p>
        </div>
      </div>
    </div>
  );
}