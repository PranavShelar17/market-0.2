"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Tractor,
  Map,
  Sprout,
  FileText,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Globe,
  LogOut,
} from "lucide-react";

interface SidebarItem {
  key: string;
  label: string;
  labelMr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: SidebarItem[] = [
  { key: "dashboard", label: "Dashboard", labelMr: "डॅशबोर्ड", href: "/dashboard", icon: Home },
  { key: "myFarm", label: "My Farm", labelMr: "माझे शेत", href: "/my-farm", icon: Tractor },
  { key: "soilMap", label: "Soil Map", labelMr: "माती नकाशा", href: "/soil-map", icon: Map },
  { key: "soilHealthCard", label: "Soil Health Card", labelMr: "मृदा आरोग्य पत्रिका", href: "/soil-health-card", icon: Sprout },
  { key: "detailedSoilReport", label: "Detailed Soil Report", labelMr: "सविस्तर माती अहवाल", href: "/reports?tab=detailed", icon: FileText },
  { key: "marketIntelligence", label: "Market Intelligence & Crop Planner", labelMr: "बाजार भाव व पीक नियोजन", href: "/market-intelligence", icon: TrendingUp },
  { key: "reports", label: "Reports", labelMr: "अहवाल", href: "/reports", icon: FileSpreadsheet },
  { key: "historicalRecords", label: "Historical Records", labelMr: "ऐतिहासिक नोंदी", href: "/reports#history", icon: Clock },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage } = useI18n();
  const { isAuthenticated, logout } = useAuth();
  const isMr = language === "mr";

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#153928] text-white min-h-[calc(100vh-4.5rem)] shrink-0 relative overflow-hidden select-none">
      {/* Decorative Botanical Watermark in Bottom Corner */}
      <svg
        className="absolute -bottom-8 -left-8 w-44 h-44 text-[#1C4633] pointer-events-none opacity-40"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 C55 25 75 45 100 50 C75 55 55 75 50 100 C45 75 25 55 0 50 C25 45 45 25 50 0 Z" opacity="0.3" />
        <path d="M20,90 Q40,60 80,40 Q60,70 30,95 Z" opacity="0.6" />
        <path d="M10,80 Q35,50 65,30 Q50,65 15,85 Z" opacity="0.5" />
      </svg>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 z-10">
        {navItems.map((item) => {
          // Check if active (handle query params for detailed soil report / history)
          const isActive =
            pathname === item.href ||
            (item.key === "reports" && pathname === "/reports" && !pathname.includes("tab=detailed")) ||
            (item.key === "detailedSoilReport" && pathname === "/reports" && typeof window !== "undefined" && window.location.search.includes("tab=detailed"));

          const Icon = item.icon;
          const displayLabel = isMr ? item.labelMr : item.label;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#557e63] text-white font-semibold shadow-xs"
                  : "text-[#A3BEB0] hover:bg-[#1E4A35] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#8CAE9A]"}`} />
              <span className="truncate leading-snug">{displayLabel}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Controls: Language Toggle & Logout */}
      <div className="p-4 border-t border-[#1F4A36] space-y-2 z-10 bg-[#153928]/90 backdrop-blur-xs">
        {/* Language Row */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#A3BEB0] hover:text-white transition-colors">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-[#8CAE9A]" />
            <span className="font-medium">{isMr ? "भाषा" : "Language"}</span>
          </div>
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "mr" : "en")}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#214F3A] text-white hover:bg-[#2B6148] transition-colors border border-[#2D664C]"
          >
            {language === "en" ? "English" : "मराठी"}
          </button>
        </div>

        {/* Logout Row */}
        <button
          type="button"
          onClick={() => {
            if (isAuthenticated) {
              logout();
            } else {
              window.location.href = "/";
            }
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#A3BEB0] hover:bg-[#1E4A35] hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#8CAE9A]" />
          <span>{isMr ? "बाहेर पडा" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};
