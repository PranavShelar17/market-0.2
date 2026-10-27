"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/useI18n";
import { useAuth } from "@/context/AuthContext";
import { useSelectedFarmer } from "@/context/FarmerContext";
import { Sprout, Globe, User, ChevronDown, LogOut } from "lucide-react";
import { translateFarmerName } from "@/i18n/marathiHelper";

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  const { isAuthenticated, farmer, logout } = useAuth();
  const { selectedFarmer } = useSelectedFarmer();
  const [profileOpen, setProfileOpen] = useState(false);

  // Active display name
  const currentFarmerName = selectedFarmer?.name || farmer?.name || "Pradip Bhauso Shelar";
  const displayName = language === "mr" ? translateFarmerName(currentFarmerName) : currentFarmerName;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2] border-b border-[#E8E2D8] shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        {/* LEFT: SoilPilot Brand Identity */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3.5 group shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#153928] text-white flex items-center justify-center shadow-xs group-hover:bg-[#1b4632] transition-colors">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#163828] font-serif group-hover:text-[#2d6344] transition-colors">
                SoilPilot
              </span>
            </div>
            <p className="text-[11px] text-[#5C6E61] font-normal leading-tight hidden sm:block">
              {language === "mr"
                ? "डिजिटल मृदा नकाशा व आरोग्य पोर्टल"
                : "Digital Soil Mapping & Soil Health Portal"}
            </p>
          </div>
        </Link>

        {/* RIGHT: Language Switcher Pill & Farmer Profile Badge */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Language Toggle Pill (Exact match to screenshot) */}
          <div className="flex items-center bg-[#EFECE4] p-1 rounded-full border border-[#DFDAD0] shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-[#5C6E61] ml-2 mr-1.5" />
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                language === "en"
                  ? "bg-[#153928] text-white shadow-xs"
                  : "text-[#3D4F42] hover:text-[#163828]"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("mr")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                language === "mr"
                  ? "bg-[#153928] text-white shadow-xs"
                  : "text-[#3D4F42] hover:text-[#163828]"
              }`}
            >
              मराठी
            </button>
          </div>

          {/* Farmer Profile Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-[#EFECE4] transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-[#153928] text-white flex items-center justify-center font-bold shadow-xs">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[#163828] leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#5C6E61] font-medium leading-tight">
                  {language === "mr" ? "शेतकरी" : "Farmer"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#5C6E61] hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E2D8] rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-3 py-2 border-b border-[#E8E2D8]">
                  <p className="text-xs font-bold text-[#163828]">{displayName}</p>
                  <p className="text-[10px] text-[#5C6E61]">{language === "mr" ? "शेतकरी" : "Farmer"}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-xs font-medium text-[#163828] hover:bg-[#FAF7F2]"
                >
                  {language === "mr" ? "डॅशबोर्ड वर जा" : "Go to Dashboard"}
                </Link>
                <Link
                  href="/reports"
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2 text-xs font-medium text-[#163828] hover:bg-[#FAF7F2]"
                >
                  {language === "mr" ? "माझे अहवाल" : "My Reports"}
                </Link>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t("auth.logout") || "Logout"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
