"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSelectedFarmer } from "@/context/FarmerContext";
import { useI18n } from "@/i18n/useI18n";
import {
  TrendingUp,
  LayoutDashboard,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Sprout,
  LineChart,
} from "lucide-react";

import { PlanningFilterState } from "@/types/marketIntelligence";
import { MarketIntelligenceHeader } from "./MarketIntelligenceHeader";
import { PlanningControls } from "./PlanningControls";
import { MarketOverviewCards } from "./MarketOverviewCards";
import { Next15DaysSection } from "./Next15DaysSection";
import { SeasonalPlannerSection } from "./SeasonalPlannerSection";
import { FieldSuitabilitySection } from "./FieldSuitabilitySection";
import { CropPlanningComparison } from "./CropPlanningComparison";
import { PriceTrendOutlook } from "./PriceTrendOutlook";
import { FuturePriceOutlook } from "./FuturePriceOutlook";
import { DataSourceReliability } from "./DataSourceReliability";

type NavigationTab = "crop_decision" | "market_analysis" | "price_outlook";

export const MarketIntelligenceView: React.FC = () => {
  const { location, field, farmer } = useAuth();
  const { selectedFarmer } = useSelectedFarmer();
  const { language } = useI18n();
  const isMr = language === "mr";

  // Three-button navigation state (default: Crop Decision)
  const [activeTab, setActiveTab] = useState<NavigationTab>("crop_decision");

  // Active location context from auth
  const activeState = location?.state || "Maharashtra";
  const activeDistrict = location?.district || "Pune";
  const activeTaluka = location?.taluka || "Baramati";
  const activeVillage = location?.village || "Malegaon Kh";
  const activeGat = selectedFarmer?.gat_no || field?.gat_no || "18";
  const activeArea = field?.area ?? 2.48;

  // Local interactive filter state
  const [filters, setFilters] = useState<PlanningFilterState>({
    state: activeState,
    district: activeDistrict,
    taluka: activeTaluka,
    marketApmc: "Baramati APMC",
    horizon: "immediate",
    season: "kharif",
    cropCategory: "all",
    selectedCropId: "",
  });

  const handleFilterChange = (updated: Partial<PlanningFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-text-muted">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 hover:text-soil-primary transition-colors"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-soil-primary" />
          <span>{isMr ? "डॅशबोर्ड" : "Dashboard"}</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-surface-borderStrong" />
        <span className="text-text-main font-bold">
          {isMr ? "बाजार भाव व पीक नियोजन" : "Market Intelligence & Crop Planner"}
        </span>
      </nav>

      {/* SECTION A: Page Header with Location Context & Status */}
      <MarketIntelligenceHeader
        state={filters.state}
        district={filters.district}
        taluka={filters.taluka}
        village={activeVillage}
        gatNo={activeGat}
      />

      {/* SECTION: Three-Button Navigation Row */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-surface-border shadow-xs w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setActiveTab("crop_decision")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "crop_decision"
              ? "bg-soil-primary text-white shadow-xs"
              : "text-text-muted hover:text-text-main hover:bg-surface-muted"
          }`}
          aria-pressed={activeTab === "crop_decision"}
        >
          <Sprout className="w-4 h-4" />
          <span>Crop Decision</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("market_analysis")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "market_analysis"
              ? "bg-soil-primary text-white shadow-xs"
              : "text-text-muted hover:text-text-main hover:bg-surface-muted"
          }`}
          aria-pressed={activeTab === "market_analysis"}
        >
          <LineChart className="w-4 h-4" />
          <span>Market Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("price_outlook")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "price_outlook"
              ? "bg-soil-primary text-white shadow-xs"
              : "text-text-muted hover:text-text-main hover:bg-surface-muted"
          }`}
          aria-pressed={activeTab === "price_outlook"}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Price Outlook</span>
        </button>
      </div>

      {/* 1. CROP DECISION SECTION (Default) */}
      <div className={activeTab === "crop_decision" ? "space-y-6" : "hidden"}>
        {/* SECTION B: Planning Controls & Horizon Switcher (Dedicated to Baramati APMC) */}
        <PlanningControls
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* SECTION C: Market Overview with Explicit Empty State */}
        <MarketOverviewCards
          selectedDistrict={filters.district}
          selectedMarket={filters.marketApmc}
          selectedCommodity={filters.cropCategory !== "all" ? filters.cropCategory : "All Commodities"}
        />

        {/* SECTION E or F: Dedicated Horizon Views */}
        {filters.horizon === "immediate" ? (
          <Next15DaysSection
            currentVillage={activeVillage}
            currentGat={activeGat}
            fieldId={field?.id ?? (selectedFarmer as any)?.field_id}
          />
        ) : (
          <SeasonalPlannerSection
            activeSeason={filters.season}
            onSeasonSelect={(season) => handleFilterChange({ season })}
            gatNo={activeGat}
            fieldAcreage={activeArea}
            fieldId={field?.id ?? (selectedFarmer as any)?.field_id}
          />
        )}

        {/* SECTION J: Field Suitability Assessment Layer (Phase 8) */}
        <FieldSuitabilitySection
          currentGat={activeGat}
          fieldId={field?.id ?? (selectedFarmer as any)?.field_id}
          farmerName={farmer?.name ?? selectedFarmer?.name}
          currentVillage={activeVillage}
          currentTaluka={activeTaluka}
          currentDistrict={activeDistrict}
          activeSeason={filters.season}
        />

        {/* SECTION D: Crop Planning Options Comparison (Cards / Table Layout) */}
        <CropPlanningComparison
          categoryFilter={filters.cropCategory}
          horizon={filters.horizon}
          season={filters.season}
          fieldAcreage={activeArea}
          currentGat={activeGat}
          fieldId={field?.id ?? (selectedFarmer as any)?.field_id}
          farmerName={farmer?.name ?? selectedFarmer?.name}
          currentVillage={activeVillage}
          currentTaluka={activeTaluka}
          currentDistrict={activeDistrict}
        />
      </div>

      {/* 2. MARKET ANALYSIS SECTION */}
      <div className={activeTab === "market_analysis" ? "space-y-6" : "hidden"}>
        {/* SECTION G: Historical Price Analysis & Trend Detection (Phase 5) */}
        <PriceTrendOutlook
          selectedMarket={filters.marketApmc}
          selectedCommodity={isMr ? "निवडलेले पीक" : "Target Crop"}
          activeDistrict={filters.district}
        />

        {/* SECTION I: Data Sources and Reliability Panel */}
        <DataSourceReliability selectedMarket={filters.marketApmc} />
      </div>

      {/* 3. PRICE OUTLOOK SECTION */}
      <div className={activeTab === "price_outlook" ? "space-y-6" : "hidden"}>
        {/* SECTION H: Future Price Outlook & Harvest-Time Forecasting Engine (Phase 6) */}
        <FuturePriceOutlook
          selectedMarket={filters.marketApmc}
          selectedCommodity={isMr ? "निवडलेले पीक" : "Target Crop"}
        />
      </div>
    </div>
  );
};
