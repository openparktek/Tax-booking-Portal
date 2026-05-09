import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useEffect } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
  { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
  { code: "it", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Set document direction for RTL/LTR (only Arabic is RTL)
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
    // Store preference in localStorage
    localStorage.setItem("openpark_language", lng);
  };

  useEffect(() => {
    // Load saved language preference or default to English
    const savedLang = localStorage.getItem("openpark_language") || "en";
    if (savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
    // Set initial direction based on current language
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const currentLang = i18n.language;
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="w-5 h-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs text-gray-500">
          Select Language
        </div>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem 
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="cursor-pointer"
          >
            <span className="flex items-center justify-between w-full gap-2">
              <span className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.nativeName}</span>
              </span>
              {currentLang === language.code && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}