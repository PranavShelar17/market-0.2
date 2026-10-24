"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/i18n/useI18n";
import {
  Sprout,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Droplets,
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  Scale,
  RefreshCw,
  FileText,
  ExternalLink,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Award,
} from "lucide-react";
import {
  marketService,
  FieldCropDecisionResponse,
  CropDecisionItem,
  DecisionPlanningContext,
  FinancialScenarioResult,
  DecisionBenchmarksResponse,
  CostBenchmarkSummaryItem,
} from "@/services/marketService";
import { CropCategory } from "@/types/marketIntelligence";

interface CropPlanningComparisonProps {
  categoryFilter: CropCategory;
  horizon: "immediate" | "seasonal";
  season?: string;
  fieldAcreage?: number | null;
  currentGat?: string;
  fieldId?: number | null;
  farmerName?: string | null;
  currentVillage?: string;
  currentTaluka?: string;
  currentDistrict?: string;
}

export const CropPlanningComparison: React.FC<CropPlanningComparisonProps> = ({
  categoryFilter,
  horizon,
  season = "rabi",
  fieldAcreage,
  currentGat = "18",
  fieldId,
  farmerName,
  currentVillage = "Malegaon Kh.",
  currentTaluka = "Baramati",
  currentDistrict = "Pune",
}) => {
  const { language } = useI18n();
  const isMr = language === "mr";

  // Data State
  const [decisionPlan, setDecisionPlan] = useState<FieldCropDecisionResponse | null>(null);
  const [benchmarksData, setBenchmarksData] = useState<DecisionBenchmarksResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Display State
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>("ALL");
  const [areaUnitView, setAreaUnitView] = useState<"acre" | "ha" | "field">("acre");
  const [scenarioView, setScenarioView] = useState<"central" | "conservative" | "optimistic">("central");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [expandedCropCode, setExpandedCropCode] = useState<string | null>(null);
  const [showBenchmarksModal, setShowBenchmarksModal] = useState<boolean>(false);

  // Fetch Decision Plan from Phase 9 Backend
  const fetchDecisionPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fieldIdentifier = currentGat || (fieldId ? String(fieldId) : "18");
      const normHorizon = horizon === "immediate" ? "IMMEDIATE_15_DAYS" : "SEASONAL";
      const normSeason = (season || "RABI").toUpperCase();

      const [plan, benchmarks] = await Promise.all([
        marketService.getFieldCropDecisionPlan({
          fieldIdentifier,
          horizon: normHorizon,
          season: normSeason,
        }),
        marketService.getDecisionCostBenchmarks().catch(() => null),
      ]);

      setDecisionPlan(plan);
      if (benchmarks) setBenchmarksData(benchmarks);
    } catch (err: any) {
      console.error("Failed to load crop decision plan:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          (isMr ? "पीक तुलना व निर्णय योजना लोड करण्यात त्रुटी आली." : "Failed to load crop comparison & decision plan.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisionPlan();
  }, [currentGat, fieldId, horizon, season]);

  // Filter crops based on category and tier
  const filteredCrops = useMemo(() => {
    if (!decisionPlan || !decisionPlan.crops) return [];

    return decisionPlan.crops.filter((c) => {
      // Category filter
      if (categoryFilter !== "all") {
        const cat = (c.category || "").toLowerCase();
        const filterKey = categoryFilter.toLowerCase();
        if (filterKey === "cash_crops" && !cat.includes("cash")) return false;
        if (filterKey === "pulses" && !cat.includes("pulse")) return false;
        if (filterKey === "cereals" && !cat.includes("cereal")) return false;
        if (filterKey === "oilseeds" && !cat.includes("oilseed")) return false;
        if (filterKey === "vegetables" && !cat.includes("vegetable")) return false;
      }

      // Tier filter
      if (selectedTierFilter !== "ALL" && c.decision_tier !== selectedTierFilter) {
        return false;
      }

      return true;
    });
  }, [decisionPlan, categoryFilter, selectedTierFilter]);

  // Tier helper colors & badges
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "RECOMMENDED":
        return {
          bg: "bg-[#2A7C13]/15 text-[#2A7C13] border-[#2A7C13]/30",
          icon: <Award className="w-3.5 h-3.5" />,
          labelEn: "Recommended Option",
          labelMr: "शिफारस केलेला पर्याय",
          descEn: "Edaphically optimal & in active sowing window",
          descMr: "जमिनीस अनुकूल व पेरणीच्या योग्य वेळेत",
        };
      case "CONDITIONALLY_SUITABLE":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-300",
          icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
          labelEn: "Conditionally Suitable",
          labelMr: "सशर्त अनुकूल (व्यवस्थापन आवश्यक)",
          descEn: "Requires assured irrigation or soil amendment",
          descMr: "खात्रीशीर पाणी किंवा भूसुधारकाची गरज",
        };
      case "OFF_SEASON":
        return {
          bg: "bg-slate-100 text-slate-750 border-slate-300",
          icon: <Clock className="w-3.5 h-3.5" />,
          labelEn: "Off-Season for Immediate Window",
          labelMr: "सध्या पेरणीचा हंगाम नाही",
          descEn: "Soil compatible; await official sowing window",
          descMr: "जमीन योग्य; आगामी पेरणी वेळेची प्रतीक्षा करा",
        };
      case "CONSTRAINED":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-300",
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          labelEn: "Agronomic Constraint Identified",
          labelMr: "गंभीर मर्यादा आढळली",
          descEn: "Biological soil barrier; not recommended",
          descMr: "जमिनीची मर्यादा; लागवड शिफारस नाही",
        };
      case "INSUFFICIENT_DATA":
      default:
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-300",
          icon: <HelpCircle className="w-3.5 h-3.5" />,
          labelEn: "Insufficient Field Evidence",
          labelMr: "अपुऱ्या नोंदी",
          descEn: "Soil test unrecorded; get certified lab report",
          descMr: "माती चाचणी उपलब्ध नाही; अधिकृत प्रयोगशाळेची तपासणी करा",
        };
    }
  };

  // Helper to extract scenario financials
  const getScenario = (item: CropDecisionItem): FinancialScenarioResult | null => {
    if (!item.financials || !item.financials.is_available) return null;
    if (scenarioView === "conservative") return item.financials.conservative_scenario ?? item.financials.central_scenario ?? null;
    if (scenarioView === "optimistic") return item.financials.optimistic_scenario ?? item.financials.central_scenario ?? null;
    return item.financials.central_scenario ?? null;
  };

  const formatCurrency = (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return "—";
    return `₹${Math.round(val).toLocaleString("en-IN")}`;
  };

  const getAreaLabel = (areaAcres: number) => {
    if (areaUnitView === "ha") return isMr ? "प्रति हेक्टर" : "Per Hectare";
    if (areaUnitView === "field") return isMr ? `पूर्ण शेत (${areaAcres} एकर)` : `Full Field (${areaAcres} ac)`;
    return isMr ? "प्रति एकर" : "Per Acre";
  };

  return (
    <div className="bg-white rounded-2xl border border-border/80 shadow-sm overflow-hidden mb-8 transition-all">
      {/* ------------------------------------------------------------- */}
      {/* HEADER SECTION: Title, Context, and Live Indicators */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-[#FFF8CF]/60 via-[#FBE6C2]/40 to-white border-b border-[#FBE6C2]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2A7C13] text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                {isMr ? "निर्णय व तुलना इंजिन (फेज ९)" : "Crop Decision & Ranking Engine"}
              </span>
              <span className="text-xs font-medium text-text-muted bg-white/80 px-2 py-0.5 rounded-md border border-border/50">
                {isMr ? "एमपीकेव्ही राहुरी व सीएसीपी मानके" : "MPKV Rahuri & CACP Verified"}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
              {isMr ? "पारदर्शक पीक तुलना व नियोजन निर्णय प्रणाली" : "Transparent Crop Comparison & Planning Decision Engine"}
            </h2>
            <p className="text-sm text-text-muted mt-1 max-w-3xl">
              {isMr
                ? "प्रत्यक्ष शेताची माती, पेरणीची योग्य वेळ, बाजारभाव अंदाज, उत्पादन खर्च आणि पाण्याच्या उपलब्धतेवर आधारित तुलना. नफा किंवा उत्पादनाची कोणतीही हमी दिली जात नाही."
                : "Multi-criteria comparison evaluating edaphic soil suitability, active planting calendars, harvest-period price forecasts, official cultivation costs, and risk uncertainty. No guaranteed returns."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => setShowBenchmarksModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-[#2A7C13] border border-[#2A7C13]/30 hover:bg-[#FFF8CF]/40 rounded-lg shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {isMr ? "सीएसीपी खर्च मानके पहा" : "View Cost Benchmarks"}
            </button>
            <button
              onClick={fetchDecisionPlan}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#2A7C13] text-white hover:bg-[#2A7C13]/90 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              {isMr ? "पुन्हा तपासा" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Planning Context Banner */}
        {decisionPlan && (
          <div className="mt-4 pt-4 border-t border-[#FBE6C2]/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-white/80 p-2.5 rounded-lg border border-border/50">
              <span className="text-text-muted block text-[11px] font-medium">{isMr ? "शेत / गट क्रमांक" : "Gat / Parcel"}</span>
              <span className="font-bold text-text-primary text-sm">Gat {decisionPlan.planning_context.gat_no}</span>
              <span className="block text-[10px] text-text-muted">{decisionPlan.planning_context.village_name}</span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-border/50">
              <span className="text-text-muted block text-[11px] font-medium">{isMr ? "मूल्यांकन क्षेत्र" : "Evaluated Area"}</span>
              <span className="font-bold text-text-primary text-sm">
                {decisionPlan.planning_context.area_evaluated_acres} {isMr ? "एकर" : "Acres"}
              </span>
              <span className="block text-[10px] text-text-muted">({decisionPlan.planning_context.area_evaluated_ha} ha)</span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-border/50">
              <span className="text-text-muted block text-[11px] font-medium">{isMr ? "नियोजन दिनांक" : "Planning Date"}</span>
              <span className="font-bold text-text-primary text-sm">{decisionPlan.planning_context.planning_date}</span>
              <span className="block text-[10px] text-text-muted">
                {decisionPlan.planning_context.planning_season} (
                {decisionPlan.planning_context.planning_horizon === "IMMEDIATE_15_DAYS" ? "Next 15d" : "Seasonal"}
                )
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-border/50">
              <span className="text-text-muted block text-[11px] font-medium">{isMr ? "माती चाचणी स्थिती" : "Soil Evidence"}</span>
              <span
                className={`font-semibold text-xs inline-flex items-center gap-1 ${
                  decisionPlan.planning_context.soil_data_readiness === "DATA_AVAILABLE"
                    ? "text-[#2A7C13]"
                    : decisionPlan.planning_context.soil_data_readiness === "PARTIAL_DATA"
                    ? "text-amber-700"
                    : "text-rose-700"
                }`}
              >
                {decisionPlan.planning_context.has_lab_report ? "✓ Lab Certified" : decisionPlan.planning_context.has_dsm_data ? "≈ DSM Predicted" : "✗ Unrecorded"}
              </span>
              <span className="block text-[10px] text-text-muted truncate">
                {decisionPlan.planning_context.soil_data_readiness.replace("_", " ")}
              </span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-border/50">
              <span className="text-text-muted block text-[11px] font-medium">{isMr ? "पाणी उपलब्धता" : "Irrigation Status"}</span>
              <span className="font-semibold text-xs text-amber-800 truncate block">
                {decisionPlan.planning_context.irrigation_status.includes("UNKNOWN")
                  ? isMr
                    ? "शेतकरी पडताळणी प्रलंबित"
                    : "Unverified on Farm"
                  : decisionPlan.planning_context.irrigation_status}
              </span>
              <span className="block text-[10px] text-text-muted">{isMr ? "खात्री आवश्यक" : "Verification Required"}</span>
            </div>

            <div className="bg-white/80 p-2.5 rounded-lg border border-border/50">
              <span className="text-text-muted block text-[11px] font-medium">{isMr ? "मूल्यांकित पिके" : "Crops Evaluated"}</span>
              <span className="font-bold text-[#2A7C13] text-sm">{decisionPlan.total_crops_evaluated} Crops</span>
              <span className="block text-[10px] text-text-muted">v{decisionPlan.engine_version}</span>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION B: Tier Summaries & Interactive Control Ribbons */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 md:px-6 bg-[#FFF8CF]/25 border-b border-border/60 flex flex-wrap items-center justify-between gap-4">
        {/* Tier Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-text-muted font-medium mr-1 hidden sm:inline">{isMr ? "दर्जा निवडा:" : "Filter Tier:"}</span>

          <button
            onClick={() => setSelectedTierFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedTierFilter === "ALL"
                ? "bg-[#2A7C13] text-white shadow-xs font-semibold"
                : "bg-white text-text-muted hover:bg-slate-100 border border-border/60"
            }`}
          >
            {isMr ? "सर्व पिके" : "All Crops"} ({decisionPlan?.total_crops_evaluated ?? 0})
          </button>

          <button
            onClick={() => setSelectedTierFilter("RECOMMENDED")}
            className={`px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1 transition-all ${
              selectedTierFilter === "RECOMMENDED"
                ? "bg-[#2A7C13] text-white shadow-xs font-semibold"
                : "bg-white text-[#2A7C13] hover:bg-[#2A7C13]/10 border border-[#2A7C13]/30"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            {isMr ? "शिफारस केलेली" : "Recommended"} ({decisionPlan?.decision_tier_summary?.["RECOMMENDED"] ?? 0})
          </button>

          <button
            onClick={() => setSelectedTierFilter("CONDITIONALLY_SUITABLE")}
            className={`px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1 transition-all ${
              selectedTierFilter === "CONDITIONALLY_SUITABLE"
                ? "bg-amber-600 text-white shadow-xs font-semibold"
                : "bg-white text-amber-800 hover:bg-amber-50 border border-amber-300"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isMr ? "सशर्त" : "Conditional"} ({decisionPlan?.decision_tier_summary?.["CONDITIONALLY_SUITABLE"] ?? 0})
          </button>

          <button
            onClick={() => setSelectedTierFilter("OFF_SEASON")}
            className={`px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1 transition-all ${
              selectedTierFilter === "OFF_SEASON"
                ? "bg-slate-700 text-white shadow-xs font-semibold"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {isMr ? "हंगाम नसलेली" : "Off-Season"} ({decisionPlan?.decision_tier_summary?.["OFF_SEASON"] ?? 0})
          </button>

          <button
            onClick={() => setSelectedTierFilter("CONSTRAINED")}
            className={`px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1 transition-all ${
              selectedTierFilter === "CONSTRAINED"
                ? "bg-rose-700 text-white shadow-xs font-semibold"
                : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-300"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {isMr ? "मर्यादा असलेली" : "Constrained"} ({decisionPlan?.decision_tier_summary?.["CONSTRAINED"] ?? 0})
          </button>
        </div>

        {/* View Switchers & Financial Scaling */}
        <div className="flex flex-wrap items-center gap-3 text-xs ml-auto">
          {/* Financial Area Scope Toggle */}
          <div className="inline-flex items-center bg-white border border-border/80 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setAreaUnitView("acre")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                areaUnitView === "acre" ? "bg-[#2A7C13] text-white font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {isMr ? "प्रति एकर" : "Per Acre"}
            </button>
            <button
              onClick={() => setAreaUnitView("ha")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                areaUnitView === "ha" ? "bg-[#2A7C13] text-white font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {isMr ? "प्रति हेक्टर" : "Per Hectare"}
            </button>
            {decisionPlan && (
              <button
                onClick={() => setAreaUnitView("field")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  areaUnitView === "field" ? "bg-[#2A7C13] text-white font-semibold" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {isMr ? `शेत (${decisionPlan.planning_context.area_evaluated_acres} एकर)` : `Parcel (${decisionPlan.planning_context.area_evaluated_acres} ac)`}
              </button>
            )}
          </div>

          {/* Scenario Sensitivity Toggle */}
          <div className="inline-flex items-center bg-white border border-border/80 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setScenarioView("conservative")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                scenarioView === "conservative" ? "bg-amber-600 text-white font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
              title="Low market price scenario (-12%)"
            >
              {isMr ? "कमी भाव (संभाव्य)" : "Conservative"}
            </button>
            <button
              onClick={() => setScenarioView("central")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                scenarioView === "central" ? "bg-[#2A7C13] text-white font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
              title="Central modal forecast price"
            >
              {isMr ? "मध्यम अंदाज" : "Central"}
            </button>
            <button
              onClick={() => setScenarioView("optimistic")}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                scenarioView === "optimistic" ? "bg-[#76C457] text-white font-semibold" : "text-text-muted hover:text-text-primary"
              }`}
              title="High market price scenario (+12%)"
            >
              {isMr ? "उच्च भाव" : "Optimistic"}
            </button>
          </div>

          {/* Table vs Cards layout toggle */}
          <div className="inline-flex items-center bg-white border border-border/80 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-slate-800 text-white" : "text-text-muted hover:text-text-primary"}`}
              title="Table view"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md ${viewMode === "cards" ? "bg-slate-800 text-white" : "text-text-muted hover:text-text-primary"}`}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION C: Loading, Error, and Empty States */}
      {/* ------------------------------------------------------------- */}
      {isLoading && (
        <div className="p-16 text-center">
          <div className="w-12 h-12 border-3 border-[#2A7C13] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-semibold text-text-primary text-base">
            {isMr ? "पारदर्शक पीक निर्णय गणना सुरू आहे..." : "Evaluating Field Agronomics & Market Intelligence..."}
          </h3>
          <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
            {isMr
              ? "जमिनीची माती चाचणी, पेरणीची मुदत, एमपीकेव्ही लागवड खर्च आणि काढणी वेळेचे बाजारभाव अंदाज एकत्र केले जात आहेत."
              : "Integrating field soil properties, MPKV sowing calendars, time-series modal price forecasts, and CACP cultivation budgets."}
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-8 m-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h3 className="font-bold text-rose-900 text-base">{isMr ? "निर्णय प्रणाली त्रुटी" : "Decision Engine Notice"}</h3>
          <p className="text-xs text-rose-700 mt-1 max-w-lg mx-auto">{error}</p>
          <button
            onClick={fetchDecisionPlan}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            {isMr ? "पुन्हा प्रयत्न करा" : "Try Again"}
          </button>
        </div>
      )}

      {/* Zero Soil Data Notice */}
      {!isLoading && !error && decisionPlan?.planning_context.soil_data_readiness === "INSUFFICIENT_DATA" && (
        <div className="m-5 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <h4 className="font-bold text-sm mb-0.5">
              {isMr ? "या गटासाठी अधिकृत माती चाचणी उपलब्ध नाही" : "Certified Soil Laboratory Report Not Recorded for this Parcel"}
            </h4>
            <p>
              {isMr
                ? "प्राथमिक माती चाचणी (उदा. सामू / pH, क्षारता / EC) उपलब्ध नसल्यामुळे कोणतीही खोटी शिफारस केली जात नाही. सर्व पिके 'अपुऱ्या नोंदी' (Insufficient Evidence) वर्गात ठेवण्यात आली आहेत. कृषी तज्ज्ञांकडून प्रमाणित माती परीक्षण करून घ्यावे."
                : "Because baseline diagnostic soil test parameters (pH, EC) are unrecorded for this parcel, no artificial recommendation is generated. All candidate crops are placed strictly in the 'Insufficient Evidence' tier until verified lab test results are added."}
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION D: Main Comparison Content (Table vs Cards View) */}
      {/* ------------------------------------------------------------- */}
      {!isLoading && !error && (
        <>
          {filteredCrops.length === 0 ? (
            <div className="p-16 text-center text-text-muted">
              <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">{isMr ? "निवडलेल्या निकषांनुसार कोणतेही पीक आढळले नाही" : "No crops match the selected category or tier filter."}</p>
              <button
                onClick={() => {
                  setSelectedTierFilter("ALL");
                }}
                className="mt-3 text-xs text-[#2A7C13] hover:underline font-medium"
              >
                {isMr ? "सर्व पिके पहा" : "Reset Filter to All Crops"}
              </button>
            </div>
          ) : viewMode === "table" ? (
            /* TABLE VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-border/80 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                    <th className="py-3 px-4">{isMr ? "पीक व वर्ग" : "Crop & Category"}</th>
                    <th className="py-3 px-3">{isMr ? "निर्णय दर्जा व उपयुक्तता" : "Decision Tier & Suitability"}</th>
                    <th className="py-3 px-3">{isMr ? "पेरणीची मुदत" : "Sowing Window"}</th>
                    <th className="py-3 px-3">{isMr ? "काढणी बाजारभाव अंदाज" : "Harvest Price Forecast"}</th>
                    <th className="py-3 px-3">{isMr ? `अंदाजे उत्पन्न (${getAreaLabel(decisionPlan?.planning_context.area_evaluated_acres ?? 1)})` : `Est. Gross Revenue (${getAreaLabel(decisionPlan?.planning_context.area_evaluated_acres ?? 1)})`}</th>
                    <th className="py-3 px-3">{isMr ? `लागवड खर्च (A2+FL)` : `Cultivation Cost (A2+FL)`}</th>
                    <th className="py-3 px-3">{isMr ? `अंदाजे नफा (Net Return)` : `Est. Net Return (A2+FL)`}</th>
                    <th className="py-3 px-3">{isMr ? "पाणी व मजूर" : "Water & Labor"}</th>
                    <th className="py-3 px-3 text-center">{isMr ? "तपशील" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredCrops.map((crop) => {
                    const badge = getTierBadge(crop.decision_tier);
                    const sc = getScenario(crop);
                    const isExpanded = expandedCropCode === crop.crop_code;

                    // Compute area-scaled values
                    let revenue = sc?.gross_revenue_per_acre;
                    let cost = sc?.operational_cost_per_acre;
                    let net = sc?.net_return_operational_per_acre;

                    if (areaUnitView === "ha") {
                      revenue = sc?.gross_revenue_per_ha;
                      cost = sc?.operational_cost_per_ha;
                      net = sc?.net_return_operational_per_ha;
                    } else if (areaUnitView === "field") {
                      revenue = sc?.gross_revenue_field_total;
                      cost = sc?.operational_cost_field_total;
                      net = sc?.net_return_operational_field_total;
                    }

                    return (
                      <React.Fragment key={crop.crop_code}>
                        <tr
                          className={`hover:bg-[#FFF8CF]/20 transition-colors ${
                            crop.decision_tier === "RECOMMENDED"
                              ? "bg-[#2A7C13]/[0.02]"
                              : crop.decision_tier === "CONSTRAINED"
                              ? "bg-rose-50/[0.15]"
                              : ""
                          }`}
                        >
                          {/* 1. Crop Name */}
                          <td className="py-3.5 px-4 font-medium text-text-primary">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  crop.decision_tier === "RECOMMENDED"
                                    ? "bg-[#2A7C13]"
                                    : crop.decision_tier === "CONDITIONALLY_SUITABLE"
                                    ? "bg-amber-500"
                                    : crop.decision_tier === "OFF_SEASON"
                                    ? "bg-slate-400"
                                    : crop.decision_tier === "CONSTRAINED"
                                    ? "bg-rose-600"
                                    : "bg-gray-400"
                                }`}
                              />
                              <div>
                                <span className="font-bold text-sm block">{isMr ? crop.crop_name_mr : crop.crop_name}</span>
                                <span className="text-[10px] text-text-muted">
                                  {crop.category} • <span className="italic">{crop.scientific_name || crop.crop_code}</span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Tier & Suitability */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg}`}
                            >
                              {badge.icon}
                              {isMr ? badge.labelMr : badge.labelEn}
                            </span>
                            <span className="block text-[10px] text-text-muted mt-1">
                              {crop.suitability_status === "POTENTIAL_CONSTRAINT" ? (
                                <span className="text-rose-700 font-semibold">✗ Constraint Found</span>
                              ) : crop.suitability_status === "PRELIMINARY_SUITABLE" ? (
                                <span className="text-[#2A7C13] font-semibold">✓ Soil Suitable</span>
                              ) : (
                                crop.suitability_status.replace("_", " ")
                              )}
                            </span>
                          </td>

                          {/* 3. Sowing Window */}
                          <td className="py-3.5 px-3">
                            <span className="font-medium text-text-primary block">{crop.planting_window_text}</span>
                            <span
                              className={`text-[10px] font-semibold inline-block mt-0.5 px-1.5 py-0.2 rounded ${
                                crop.planting_window_status === "OPTIMAL_NOW"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : crop.planting_window_status === "OPENING_SOON"
                                  ? "bg-blue-100 text-blue-800"
                                  : crop.planting_window_status === "CLOSING_SOON"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {crop.planting_window_status.replace("_", " ")}
                            </span>
                          </td>

                          {/* 4. Forecast Price */}
                          <td className="py-3.5 px-3">
                            {crop.financials?.assumed_price_modal ? (
                              <div>
                                <span className="font-bold text-sm text-[#2A7C13] block">
                                  ₹{Math.round(crop.financials.assumed_price_modal).toLocaleString("en-IN")}/q
                                </span>
                                <span className="text-[10px] text-text-muted block">
                                  {crop.financials.price_source_type === "FORECAST_MODAL" ? "≈ Harvest Forecast" : "Recent Market"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-text-muted italic bg-slate-100 px-2 py-0.5 rounded">
                                {isMr ? "अंदाज अनुपलब्ध" : "Forecast Unavailable"}
                              </span>
                            )}
                          </td>

                          {/* 5. Gross Revenue */}
                          <td className="py-3.5 px-3 font-semibold text-text-primary">
                            {revenue ? (
                              <div>
                                <span className="text-sm">{formatCurrency(revenue)}</span>
                                <span className="block text-[10px] text-text-muted font-normal">
                                  Yield: {sc?.assumed_yield_per_acre} q/ac
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-text-muted italic">{isMr ? "अंदाज नाही" : "Not Estimated"}</span>
                            )}
                          </td>

                          {/* 6. Cultivation Cost */}
                          <td className="py-3.5 px-3 text-text-secondary">
                            {cost ? (
                              <div>
                                <span className="text-sm font-medium">{formatCurrency(cost)}</span>
                                <span className="block text-[10px] text-text-muted">CACP A2+FL</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-text-muted italic">{isMr ? "खर्च उपलब्ध नाही" : "Cost Missing"}</span>
                            )}
                          </td>

                          {/* 7. Net Return */}
                          <td className="py-3.5 px-3">
                            {net !== undefined && net !== null ? (
                              <div>
                                <span
                                  className={`font-bold text-sm ${
                                    net > 0 ? "text-[#2A7C13]" : "text-rose-600"
                                  }`}
                                >
                                  {formatCurrency(net)}
                                </span>
                                <span className="block text-[10px] text-text-muted">
                                  B:C Ratio: {sc?.benefit_cost_ratio_operational ?? "—"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-text-muted italic">{isMr ? "अंदाज नाही" : "Not Estimated"}</span>
                            )}
                          </td>

                          {/* 8. Water & Labor */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                  crop.water_requirement === "LOW"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : crop.water_requirement === "MEDIUM"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-amber-50 text-amber-800"
                                }`}
                                title="Water Requirement"
                              >
                                {crop.water_requirement}
                              </span>
                              <span className="text-[10px] text-text-muted">{crop.labor_requirement} Labor</span>
                            </div>
                          </td>

                          {/* 9. Action Expand */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => setExpandedCropCode(isExpanded ? null : crop.crop_code)}
                              className="p-1.5 hover:bg-slate-100 rounded-md text-text-muted hover:text-text-primary transition-colors"
                              title="Toggle breakdown"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED ACCORDION ROW */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 border-b border-border/80">
                            <td colSpan={9} className="p-4 md:p-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Left: Tier Rationale & Constraints */}
                                <div className="space-y-3">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                                    <Info className="w-4 h-4 text-[#2A7C13]" />
                                    {isMr ? "दर्जा व निवडीचे कारण" : "Decision Rationale & Constraints"}
                                  </h4>
                                  <p className="text-xs text-text-secondary leading-relaxed bg-white p-3 rounded-lg border border-border/60">
                                    {crop.explanation}
                                  </p>

                                  {crop.identified_constraints.length > 0 && (
                                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-900">
                                      <span className="font-bold block mb-1">
                                        {isMr ? "गंभीर मर्यादा (Agronomic Constraints):" : "Severe Soil Constraints:"}
                                      </span>
                                      <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                                        {crop.identified_constraints.map((c, i) => (
                                          <li key={i}>{c}</li>
                                        ))}
                                      </ul>
                                      <span className="block mt-1 text-[11px] text-rose-700 italic">
                                        {isMr
                                          ? "उच्च नफ्याचा अंदाज या जैविक मर्यादेला मागे टाकू शकत नाही."
                                          : "High economic projections cannot override this biological soil barrier."}
                                      </span>
                                    </div>
                                  )}

                                  {crop.contributing_criteria.length > 0 && (
                                    <div className="bg-[#2A7C13]/10 border border-[#2A7C13]/30 p-3 rounded-lg text-xs text-[#2A7C13]">
                                      <span className="font-bold block mb-1">
                                        {isMr ? "अनुकूल निकष (Supporting Criteria):" : "Favorable Evaluation Factors:"}
                                      </span>
                                      <ul className="list-disc list-inside space-y-0.5">
                                        {crop.contributing_criteria.map((f, i) => (
                                          <li key={i}>{f}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  <div className="bg-white p-3 rounded-lg border border-border/60 text-xs">
                                    <span className="font-semibold block text-text-primary mb-1">
                                      {isMr ? "कृषी सल्ला (Actionable Guidance):" : "Agronomic Advisory:"}
                                    </span>
                                    <p className="text-text-muted">{crop.actionable_guidance}</p>
                                  </div>
                                </div>

                                {/* Center: Cultivation Cost Breakdown */}
                                <div className="space-y-3">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4 text-[#2A7C13]" />
                                    {isMr ? "सीएसीपी अधिकृत लागवड खर्च" : "CACP Cultivation Cost Breakdown"}
                                  </h4>

                                  {crop.financials?.cost_breakdown ? (
                                    <div className="bg-white rounded-lg border border-border/60 overflow-hidden text-xs">
                                      <div className="p-2.5 bg-slate-100 border-b border-border/60 flex justify-between font-semibold">
                                        <span>{isMr ? "घटक" : "Cost Component"}</span>
                                        <span>₹ / {areaUnitView === "ha" ? "ha" : "acre"}</span>
                                      </div>
                                      <div className="divide-y divide-border/40 max-h-52 overflow-y-auto">
                                        {crop.financials.cost_breakdown.components.map((comp) => (
                                          <div key={comp.component_key} className="p-2 flex justify-between items-center text-[11px]">
                                            <span className="text-text-secondary">
                                              {isMr ? comp.component_name_mr : comp.component_name_en} ({comp.percentage_of_total}%)
                                            </span>
                                            <span className="font-medium text-text-primary">
                                              ₹
                                              {Math.round(
                                                areaUnitView === "ha" ? comp.cost_per_ha : comp.cost_per_acre
                                              ).toLocaleString("en-IN")}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="p-2.5 bg-[#FFF8CF]/40 border-t border-border/60 flex justify-between font-bold text-text-primary">
                                        <span>{isMr ? "एकूण प्रत्यक्ष खर्च (A2+FL)" : "Total Operational Cost (A2+FL)"}</span>
                                        <span>
                                          ₹
                                          {Math.round(
                                            areaUnitView === "ha"
                                              ? crop.financials.cost_breakdown.operational_cost_per_ha
                                              : crop.financials.cost_breakdown.operational_cost_per_acre
                                          ).toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-white p-4 rounded-lg border border-border/60 text-xs text-text-muted italic">
                                      {crop.financials?.unavailability_reason || "No verified cost data available."}
                                    </div>
                                  )}

                                  <div className="text-[11px] text-text-muted">
                                    <span className="font-medium text-text-primary">Reference: </span>
                                    {crop.financials?.cost_breakdown?.source_reference || "CACP Comprehensive Scheme (Vertisols)"}
                                  </div>
                                </div>

                                {/* Right: Sensitivity Scenarios & Expected Yield */}
                                <div className="space-y-3">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                                    <Scale className="w-4 h-4 text-[#2A7C13]" />
                                    {isMr ? "उत्पादन व बाजारभाव संवेदनशीलता" : "Yield Benchmark & Scenarios"}
                                  </h4>

                                  {crop.financials?.yield_benchmark && (
                                    <div className="bg-white p-3 rounded-lg border border-border/60 text-xs space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">{isMr ? "किमान अपेक्षित उत्पादन:" : "Min Expected Yield:"}</span>
                                        <span className="font-medium">
                                          {areaUnitView === "ha"
                                            ? crop.financials.yield_benchmark.yield_min_per_ha
                                            : crop.financials.yield_benchmark.yield_min_per_acre}{" "}
                                          q/{areaUnitView === "ha" ? "ha" : "ac"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between font-semibold text-[#2A7C13]">
                                        <span>{isMr ? "सरासरी उत्पादन (Expected):" : "Central Expected Yield:"}</span>
                                        <span>
                                          {areaUnitView === "ha"
                                            ? crop.financials.yield_benchmark.yield_expected_per_ha
                                            : crop.financials.yield_benchmark.yield_expected_per_acre}{" "}
                                          q/{areaUnitView === "ha" ? "ha" : "ac"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">{isMr ? "कमाल उत्पादन (Optimal):" : "Max Optimal Yield:"}</span>
                                        <span className="font-medium">
                                          {areaUnitView === "ha"
                                            ? crop.financials.yield_benchmark.yield_max_per_ha
                                            : crop.financials.yield_benchmark.yield_max_per_acre}{" "}
                                          q/{areaUnitView === "ha" ? "ha" : "ac"}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Scenarios Comparison Card */}
                                  {crop.financials?.central_scenario && (
                                    <div className="bg-white p-3 rounded-lg border border-border/60 text-xs space-y-2">
                                      <span className="font-bold block text-text-primary text-[11px]">
                                        {isMr ? "बाजारभाव संवेदनशीलता तुलना:" : "Market Price Sensitivity Analysis:"}
                                      </span>
                                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                        <div className="p-2 rounded bg-amber-50 border border-amber-200">
                                          <span className="text-amber-800 block font-semibold">{isMr ? "कमी भाव" : "Conservative"}</span>
                                          <span className="font-bold block text-xs mt-0.5">
                                            ₹{crop.financials.conservative_scenario?.assumed_price_per_unit}/q
                                          </span>
                                          <span className="text-text-muted block mt-1">
                                            Net: ₹
                                            {Math.round(
                                              crop.financials.conservative_scenario?.net_return_operational_per_acre ?? 0
                                            ).toLocaleString("en-IN")}
                                            /ac
                                          </span>
                                        </div>

                                        <div className="p-2 rounded bg-[#2A7C13]/10 border border-[#2A7C13]/30">
                                          <span className="text-[#2A7C13] block font-semibold">{isMr ? "मध्यम भाव" : "Central Modal"}</span>
                                          <span className="font-bold block text-xs mt-0.5 text-[#2A7C13]">
                                            ₹{crop.financials.central_scenario.assumed_price_per_unit}/q
                                          </span>
                                          <span className="text-[#2A7C13] block mt-1 font-semibold">
                                            Net: ₹
                                            {Math.round(crop.financials.central_scenario.net_return_operational_per_acre).toLocaleString("en-IN")}
                                            /ac
                                          </span>
                                        </div>

                                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                                          <span className="text-emerald-800 block font-semibold">{isMr ? "उच्च भाव" : "Optimistic"}</span>
                                          <span className="font-bold block text-xs mt-0.5">
                                            ₹{crop.financials.optimistic_scenario?.assumed_price_per_unit}/q
                                          </span>
                                          <span className="text-text-muted block mt-1">
                                            Net: ₹
                                            {Math.round(
                                              crop.financials.optimistic_scenario?.net_return_operational_per_acre ?? 0
                                            ).toLocaleString("en-IN")}
                                            /ac
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="text-[10px] text-text-muted italic">
                                    {isMr
                                      ? "* ही केवळ गणितीय शक्यतांची तुलना आहे, कोणताही नफा निश्चित मानला जाऊ नये."
                                      : "* Mathematical sensitivity ranges based on past price standard deviations. Not guaranteed."}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARDS VIEW */
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCrops.map((crop) => {
                const badge = getTierBadge(crop.decision_tier);
                const sc = getScenario(crop);
                const isExpanded = expandedCropCode === crop.crop_code;

                let revenue = sc?.gross_revenue_per_acre;
                let cost = sc?.operational_cost_per_acre;
                let net = sc?.net_return_operational_per_acre;

                if (areaUnitView === "ha") {
                  revenue = sc?.gross_revenue_per_ha;
                  cost = sc?.operational_cost_per_ha;
                  net = sc?.net_return_operational_per_ha;
                } else if (areaUnitView === "field") {
                  revenue = sc?.gross_revenue_field_total;
                  cost = sc?.operational_cost_field_total;
                  net = sc?.net_return_operational_field_total;
                }

                return (
                  <div
                    key={crop.crop_code}
                    className={`bg-white rounded-xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                      crop.decision_tier === "RECOMMENDED"
                        ? "border-[#2A7C13]/50 ring-1 ring-[#2A7C13]/20"
                        : crop.decision_tier === "CONSTRAINED"
                        ? "border-rose-200"
                        : "border-border/80"
                    }`}
                  >
                    <div className="p-4 md:p-5">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-base text-text-primary tracking-tight">
                            {isMr ? crop.crop_name_mr : crop.crop_name}
                          </h3>
                          <span className="text-[11px] text-text-muted italic block">
                            {crop.scientific_name || crop.crop_code} • {crop.category}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                        >
                          {badge.icon}
                          {isMr ? badge.labelMr : badge.labelEn}
                        </span>
                      </div>

                      {/* Sowing & Harvest Window */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-border/50 text-xs mb-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-text-muted">{isMr ? "पेरणीची मुदत:" : "Sowing Window:"}</span>
                          <span className="font-semibold text-text-primary">{crop.planting_window_text}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-text-muted">{isMr ? "काढणी काळ:" : "Harvest:"}</span>
                          <span className="text-text-secondary">{crop.expected_harvest_period_text}</span>
                        </div>
                      </div>

                      {/* Economics Snapshot */}
                      <div className="bg-[#FFF8CF]/30 border border-[#FBE6C2] p-3 rounded-lg text-xs space-y-2 mb-3">
                        <div className="flex justify-between items-baseline">
                          <span className="text-text-muted">{isMr ? "काढणी बाजारभाव अंदाज:" : "Harvest Price Forecast:"}</span>
                          <span className="font-bold text-[#2A7C13] text-sm">
                            {crop.financials?.assumed_price_modal
                              ? `₹${Math.round(crop.financials.assumed_price_modal).toLocaleString("en-IN")}/q`
                              : isMr
                              ? "अंदाज उपलब्ध नाही"
                              : "Unavailable"}
                          </span>
                        </div>

                        {net !== null && net !== undefined ? (
                          <div className="pt-2 border-t border-[#FBE6C2]/80 flex justify-between items-baseline">
                            <div>
                              <span className="text-text-muted text-[11px] block">
                                {isMr ? `अंदाजे निव्वळ नफा (${getAreaLabel(decisionPlan?.planning_context.area_evaluated_acres ?? 1)}):` : `Est. Net Return (${getAreaLabel(decisionPlan?.planning_context.area_evaluated_acres ?? 1)}):`}
                              </span>
                              <span className="text-[10px] text-text-muted font-normal">
                                Rev: {formatCurrency(revenue)} • Cost: {formatCurrency(cost)}
                              </span>
                            </div>
                            <span className={`text-base font-bold ${net > 0 ? "text-[#2A7C13]" : "text-rose-600"}`}>
                              {formatCurrency(net)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-text-muted italic pt-1">
                            {crop.financials?.unavailability_reason || (isMr ? "लागवड खर्च किंवा अंदाज उपलब्ध नाही" : "Economics incomplete")}
                          </div>
                        )}
                      </div>

                      {/* Agronomic Constraints / Notes */}
                      {crop.identified_constraints.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 mb-3">
                          <span className="font-semibold block mb-0.5">{isMr ? "गंभीर अडचण:" : "Identified Constraint:"}</span>
                          <p className="text-[11px] leading-snug">{crop.identified_constraints[0]}</p>
                        </div>
                      )}

                      {/* Resource Badges */}
                      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-blue-600" />
                          Water: {crop.water_requirement}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-600" />
                          Labor: {crop.labor_requirement}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-text-muted truncate max-w-[200px]">
                        {crop.agronomic_sources[0] || "MPKV Rahuri"}
                      </span>
                      <button
                        onClick={() => setExpandedCropCode(isExpanded ? null : crop.crop_code)}
                        className="font-medium text-[#2A7C13] hover:underline inline-flex items-center gap-1"
                      >
                        {isExpanded ? (isMr ? "कमी करा" : "Less") : isMr ? "तपशील" : "Deep Analysis"}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Card Expanded View */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-100 border-t border-border/60 text-xs space-y-3">
                        <div>
                          <span className="font-bold block text-text-primary mb-1">
                            {isMr ? "निर्णय विश्लेषण:" : "Decision Analysis:"}
                          </span>
                          <p className="text-text-secondary leading-relaxed bg-white p-2.5 rounded border border-border/60">
                            {crop.explanation}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold block text-text-primary mb-1">
                            {isMr ? "कृषी सल्ला:" : "Management Guidance:"}
                          </span>
                          <p className="text-text-muted bg-white p-2.5 rounded border border-border/60">
                            {crop.actionable_guidance}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION E: Data Transparency & Non-Guarantee Legal Disclaimer */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 md:px-6 bg-slate-50 border-t border-border/80 text-[11px] text-text-muted leading-relaxed">
        <div className="flex items-start gap-2.5 max-w-5xl">
          <Info className="w-4 h-4 text-[#2A7C13] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-primary block mb-0.5">
              {isMr ? "माहिती पारदर्शकता व वैज्ञानिक मर्यादा (Disclaimer):" : "Data Provenance, Economic Assumptions & Agronomic Disclaimer:"}
            </span>
            <p>
              {decisionPlan?.evidence_and_decision_disclaimer ||
                "This engine provides decision support based on certified soil laboratory tests, MPKV Rahuri planting calendars, empirical market price forecasts, and CACP cultivation cost benchmarks. It does not guarantee future yields, market prices, or economic returns. All projected figures represent indicative scenarios for comparative planning only."}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Authoritative Cost & Yield Benchmarks Reference */}
      {/* ------------------------------------------------------------- */}
      {showBenchmarksModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-border/80 bg-gradient-to-r from-[#FFF8CF]/60 to-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-text-primary">
                  {isMr ? "सीएसीपी व एमपीकेव्ही अधिकृत लागवड खर्च मानके" : "Verified CACP & MPKV Rahuri Cultivation Benchmarks"}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {isMr
                    ? "महाराष्ट्र काळ्या कसदार जमिनींसाठी (Vertisols) अधिकृत कृषी अर्थशास्त्र सर्वेक्षण मानके"
                    : "Official agricultural economics production cost standards for Maharashtra Vertisols"}
                </p>
              </div>
              <button
                onClick={() => setShowBenchmarksModal(false)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-slate-100 rounded-lg text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="bg-[#2A7C13]/10 border border-[#2A7C13]/30 p-3.5 rounded-xl text-[#2A7C13]">
                <h4 className="font-bold text-sm mb-1">{isMr ? "खर्च पद्धतीची व्याख्या (CACP Definitions):" : "CACP Cost Concepts:"}</h4>
                <p className="leading-relaxed">
                  <strong>A2 + FL (Operational Cost):</strong> Covers all direct paid-out expenses (certified seed, fertilizers, manure, plant protection chemicals, diesel/machine rental, irrigation charges, hired human labour) plus the imputed value of family labour. This is the primary benchmark used for operational crop planning.
                  <br />
                  <strong>C2 (Comprehensive Cost):</strong> Includes A2 + FL plus rental value of owned land, interest on owned fixed capital, and depreciation on farm assets.
                </p>
              </div>

              {benchmarksData && (
                <div className="overflow-x-auto border border-border/80 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-border/80 font-semibold text-[11px] text-text-muted uppercase">
                        <th className="p-3">Crop</th>
                        <th className="p-3">Season</th>
                        <th className="p-3">Cost A2+FL (₹/ac)</th>
                        <th className="p-3">Cost C2 (₹/ac)</th>
                        <th className="p-3">Expected Yield (q/ac)</th>
                        <th className="p-3">Source & Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {benchmarksData.benchmarks.map((b) => (
                        <tr key={b.crop_code} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-text-primary">{b.crop_name}</td>
                          <td className="p-3 text-text-muted">{b.season}</td>
                          <td className="p-3 font-semibold text-[#2A7C13]">₹{b.operational_cost_per_acre.toLocaleString("en-IN")}</td>
                          <td className="p-3 text-text-secondary">₹{b.total_cost_per_acre.toLocaleString("en-IN")}</td>
                          <td className="p-3 font-medium">
                            {round(b.yield_expected_ha * 0.404685642, 1)} {b.yield_unit}/ac
                          </td>
                          <td className="p-3 text-[11px] text-text-muted">
                            <span className="font-medium text-text-primary block">{b.source_organization}</span>
                            <span>{b.source_reference}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border/80 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowBenchmarksModal(false)}
                className="px-4 py-2 bg-[#2A7C13] text-white rounded-lg text-xs font-semibold hover:bg-[#2A7C13]/90 transition-colors"
              >
                {isMr ? "बंद करा" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function round(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
