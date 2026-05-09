import { useState } from "react";
import { Link } from "react-router";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import openparkLogo from "@/assets/df274fdb1f51471ea52d922584c222046a8b4e5c.png";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
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
          <h2 className="text-gray-900 mb-2">{t('forgotPassword.title')}</h2>
          <p className="text-gray-600">
            {t('forgotPassword.description')}
          </p>
        </div>

        <Card className="p-6">
          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">{t('login.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@openpark.com"
                    className="mt-1.5"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('forgotPassword.sendResetLink')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">{t('forgotPassword.checkEmail')}</h3>
              <p className="text-gray-600 mb-6">
                {t('forgotPassword.emailSent')}
              </p>
            </div>
          )}
        </Card>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    </div>
  );
}