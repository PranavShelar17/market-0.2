"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/useI18n";
import { useAuth } from "@/context/AuthContext";
import { useSelectedFarmer } from "@/context/FarmerContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { reportService } from "@/services/reportService";
import { marketService, FieldCropDecisionResponse, CropDecisionItem } from "@/services/marketService";
import { SoilHealthReport } from "@/types/soilHealth";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Clock,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  QrCode,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  TrendingUp,
  Sprout,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Home,
} from "lucide-react";
import {
  getCleanReferenceRange,
  getCleanReferenceRangeMr,
} from "@/lib/soilRecommendations";
import { translateGeoName, translateFarmerName, translateStatus } from "@/i18n/marathiHelper";
import { getLiveDateStr, getLiveSampleDateStr } from "@/lib/dateUtils";

type ButtonState = "idle" | "loading" | "success" | "error";

export default function ReportsPage() {
  const { t, locale, language } = useI18n();
  const { field, farmer, location, loading: authLoading } = useAuth();
  const { selectedFarmer } = useSelectedFarmer();

  const [report, setReport] = useState<SoilHealthReport | null>(null);
  const [decisionPlan, setDecisionPlan] = useState<FieldCropDecisionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state (matches screenshot)
  const [selectedGatFilter, setSelectedGatFilter] = useState<string>("Gat No. 22");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All Reports");

  // Detailed report preview expanded state
  const [showDetailedPreview, setShowDetailedPreview] = useState<boolean>(false);

  // Download state tracker for Detailed Soil Report PDF
  const [detailedDownloadState, setDetailedDownloadState] = useState<ButtonState>("idle");

  const activeGat =
    selectedGatFilter.replace(/[^0-9]/g, "") ||
    field?.gat_no ||
    (typeof window !== "undefined" ? localStorage.getItem("soilpilot_selected_gat") : null) ||
    "22";
  const activeFieldId =
    field?.id ||
    `demo-field-gat-${activeGat}`;

  const activeFarmerName =
    selectedFarmer && String(selectedFarmer.gat_no) === String(activeGat)
      ? selectedFarmer.name
      : null;

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reportRes, decisionRes] = await Promise.allSettled([
        reportService.getFieldReport(activeFieldId),
        marketService.getFieldCropDecisionPlan({ fieldIdentifier: String(activeFieldId) }),
      ]);

      if (reportRes.status === "fulfilled") {
        setReport(reportRes.value);
      } else {
        throw reportRes.reason;
      }

      if (decisionRes.status === "fulfilled") {
        setDecisionPlan(decisionRes.value);
      }
    } catch (err: any) {
      console.error("Failed to load reports page data:", err);
      setError(err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadReportData();
    }
  }, [activeFieldId, authLoading]);

  // Handler: Download Detailed Soil Report PDF
  const handleDownloadDetailed = async () => {
    if (detailedDownloadState === "loading") return;
    try {
      setDetailedDownloadState("loading");
      await reportService.downloadDetailedReportPdf(
        activeFieldId,
        locale,
        activeFarmerName || undefined
      );
      setDetailedDownloadState("success");
      setTimeout(() => setDetailedDownloadState("idle"), 3500);
    } catch (err) {
      console.error("Failed to download Detailed Report PDF:", err);
      setDetailedDownloadState("error");
      setTimeout(() => setDetailedDownloadState("idle"), 4000);
    }
  };

  const isMr = locale === "mr";
  const rawFarmerName =
    activeFarmerName ||
    report?.farmer?.name ||
    farmer?.name ||
    "Pradip Bhauso Shelar";
  const farmerName = isMr ? translateFarmerName(rawFarmerName) : rawFarmerName;
  const gatNo = activeGat;
  const rawVillageName = report?.field?.village || location?.village || "Malegaon Kh";
  const villageName = isMr ? translateGeoName(rawVillageName) : rawVillageName;
  const rawTalukaName = report?.field?.taluka || location?.taluka || "Baramati";
  const talukaName = isMr ? translateGeoName(rawTalukaName) : rawTalukaName;
  const rawDistrictName = report?.field?.district || location?.district || "Pune";
  const districtName = isMr ? translateGeoName(rawDistrictName) : rawDistrictName;
  const rawAreaNum =
    report?.field?.area != null
      ? report.field.area
      : field?.area != null
      ? field.area
      : 1.96;
  const isAcre =
    report?.field?.area_unit?.toLowerCase().includes("acre") ||
    field?.area_unit?.toLowerCase().includes("acre");
  const areaInAcres = isAcre ? rawAreaNum : Number((rawAreaNum * 2.47105).toFixed(2));
  const fieldArea = `${areaInAcres} ${isMr ? "एकर" : "acres"}`;
  const reportDate = getLiveDateStr(report?.report?.report_date);
  const sampleDate = report?.report?.sample_date
    ? getLiveDateStr(report.report.sample_date)
    : getLiveSampleDateStr(5);
  const reportNo = report?.report?.report_no || "SPL/2026/SL-0104";

  const qualifyingCrops: CropDecisionItem[] = decisionPlan?.crops
    ? decisionPlan.crops.filter((c) =>
        ["RECOMMENDED", "CONDITIONALLY_SUITABLE", "OFF_SEASON"].includes(c.decision_tier)
      )
    : [];
  const displayCrops: CropDecisionItem[] =
    qualifyingCrops.length > 0
      ? qualifyingCrops.slice(0, 3)
      : decisionPlan?.crops
      ? decisionPlan.crops.slice(0, 3)
      : [];
  const topCrop: CropDecisionItem | null = displayCrops.length > 0 ? displayCrops[0] : null;

  // Recent Reports table data matching the screenshot
  const recentReports = [
    {
      id: "rep-1",
      name: isMr ? "मृदा आरोग्य पत्रिका" : "Soil Health Card",
      icon: "sprout",
      field: isMr ? "गट क्र. २२" : "Gat No. 22",
      updated: "26 Oct 2026, 10:24 AM",
      status: "Ready",
      statusColor: "emerald",
      canDownload: true,
      href: "/soil-health-card",
    },
    {
      id: "rep-2",
      name: isMr ? "सविस्तर माती अहवाल" : "Detailed Soil Report",
      icon: "document",
      field: isMr ? "गट क्र. २२" : "Gat No. 22",
      updated: "24 Oct 2026, 04:12 PM",
      status: "Ready",
      statusColor: "emerald",
      canDownload: true,
      onAction: () => {
        setShowDetailedPreview(true);
        const el = document.getElementById("detailed-report-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "rep-3",
      name: isMr ? "मृदा आरोग्य पत्रिका" : "Soil Health Card",
      icon: "sprout",
      field: isMr ? "गट क्र. १८" : "Gat No. 18",
      updated: "20 Oct 2026, 11:36 AM",
      status: "Ready",
      statusColor: "emerald",
      canDownload: true,
      href: "/soil-health-card",
    },
    {
      id: "rep-4",
      name: isMr ? "सविस्तर माती अहवाल" : "Detailed Soil Report",
      icon: "document",
      field: isMr ? "गट क्र. १५" : "Gat No. 15",
      updated: "16 Oct 2026, 03:20 PM",
      status: "Processing",
      statusColor: "amber",
      canDownload: false,
    },
    {
      id: "rep-5",
      name: isMr ? "मृदा आरोग्य पत्रिका" : "Soil Health Card",
      icon: "sprout",
      field: isMr ? "गट क्र. १२" : "Gat No. 12",
      updated: "12 Oct 2026, 09:17 AM",
      status: "Completed",
      statusColor: "emerald",
      canDownload: true,
      href: "/soil-health-card",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6 pb-20 select-none">
        {/* ============================================================== */}
        {/* 1. BREADCRUMBS                                                 */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 text-xs text-[#5C6E61]">
          <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-[#163828] transition-colors">
            <Home className="w-3.5 h-3.5 text-[#5C6E61]" />
            <span className="font-medium">SoilPilot</span>
          </Link>
          <span className="text-[#A3BEB0]">/</span>
          <span className="font-semibold text-[#163828]">{isMr ? "अहवाल" : "Reports"}</span>
        </div>

        {/* ============================================================== */}
        {/* 2. PAGE HEADER WITH SCENIC LANDSCAPE ILLUSTRATION              */}
        {/* ============================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF7F2] via-[#F4EFE6] to-[#EBE4D5] border border-[#E8E2D8] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          {/* Left Text */}
          <div className="z-10 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#163828] tracking-tight font-normal">
              {isMr ? "तुमचे माती अहवाल" : "Your Soil Reports"}
            </h1>
            <p className="text-sm text-[#5C6E61] mt-2 font-normal">
              {isMr
                ? "तुमच्या शेताचे माती दस्तऐवज आणि शेत विश्लेषण पहा."
                : "Access your soil documents and field analysis."}
            </p>
          </div>

          {/* Right: Scenic Watercolor Landscape Artwork */}
          <div className="w-full md:w-80 h-32 md:h-28 relative shrink-0 overflow-hidden rounded-2xl">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 360 120"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft sky and sun */}
              <circle cx="290" cy="35" r="28" fill="#FCEBC9" opacity="0.85" />
              <path d="M0 0 L360 0 L360 120 L0 120 Z" fill="#F4EDE0" opacity="0.3" />

              {/* Contour topographic lines */}
              <path d="M-20 65 Q90 40 220 70 T400 45" stroke="#D8CEBD" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
              <path d="M-20 80 Q100 55 240 85 T400 60" stroke="#D8CEBD" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.5" />
              <path d="M-20 95 Q110 70 260 100 T400 75" stroke="#D8CEBD" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.4" />

              {/* Distant rolling blue-green mountains */}
              <path d="M120 120 L120 60 Q170 30 230 55 Q290 35 360 70 L360 120 Z" fill="#8EA898" opacity="0.6" />
              <path d="M180 120 L180 50 Q230 25 300 45 Q330 35 360 50 L360 120 Z" fill="#759381" opacity="0.7" />

              {/* Foreground rolling green terraced hills */}
              <path d="M100 120 Q180 65 290 85 Q340 75 360 90 L360 120 Z" fill="#5F8367" />
              <path d="M0 120 L0 105 Q120 70 250 100 Q320 85 360 105 L360 120 Z" fill="#4B6E52" />

              {/* Cypress and pine trees */}
              <path d="M305 75 Q310 60 310 50 Q310 60 315 75 Z" fill="#2E4D35" />
              <path d="M312 80 Q316 68 316 58 Q316 68 320 80 Z" fill="#26412D" />
              <path d="M322 85 Q327 68 327 55 Q327 68 332 85 Z" fill="#1F3624" />
              <path d="M333 80 Q338 65 338 52 Q338 65 343 80 Z" fill="#2E4D35" />
              <path d="M344 88 Q348 74 348 62 Q348 74 352 88 Z" fill="#26412D" />

              {/* Terraced field texture strokes */}
              <path d="M220 115 Q260 95 310 105" stroke="#84A78A" strokeWidth="1.5" fill="none" />
              <path d="M250 118 Q285 102 330 110" stroke="#84A78A" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. FILTER CARD (GAT NO. & REPORT TYPE)                         */}
        {/* ============================================================== */}
        <div className="bg-[#FAF7F2] border border-[#E8E2D8] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gat No. Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#5C6E61] mb-1.5">
                {isMr ? "गट क्रमांक" : "Gat No."}
              </label>
              <div className="relative">
                <select
                  value={selectedGatFilter}
                  onChange={(e) => setSelectedGatFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E8E2D8] rounded-xl px-4 py-2.5 text-xs font-medium text-[#163828] focus:outline-none focus:ring-1 focus:ring-[#153928] cursor-pointer shadow-2xs"
                >
                  <option value="Gat No. 22">{isMr ? "गट क्र. २२ (प्रदीप शेळके / शेळके फार्म)" : "Gat No. 22"}</option>
                  <option value="Gat No. 18">{isMr ? "गट क्र. १८ (मालगाव खुर्द)" : "Gat No. 18"}</option>
                  <option value="Gat No. 15">{isMr ? "गट क्र. १५ (मालगाव खुर्द)" : "Gat No. 15"}</option>
                  <option value="Gat No. 12">{isMr ? "गट क्र. १२ (मालगाव खुर्द)" : "Gat No. 12"}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#5C6E61] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Report Type Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#5C6E61] mb-1.5">
                {isMr ? "अहवाल प्रकार" : "Report Type"}
              </label>
              <div className="relative">
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E8E2D8] rounded-xl px-4 py-2.5 text-xs font-medium text-[#163828] focus:outline-none focus:ring-1 focus:ring-[#153928] cursor-pointer shadow-2xs"
                >
                  <option value="All Reports">{isMr ? "सर्व अहवाल" : "All Reports"}</option>
                  <option value="Soil Health Card">{isMr ? "मृदा आरोग्य पत्रिका" : "Soil Health Card"}</option>
                  <option value="Detailed Soil Report">{isMr ? "सविस्तर माती अहवाल" : "Detailed Soil Report"}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#5C6E61] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. TWO FEATURED ACTION CARDS                                   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Soil Health Card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            {/* Decorative botanical branch on bottom-right */}
            <svg
              className="absolute -bottom-2 -right-2 w-28 h-28 text-[#7CA888] pointer-events-none opacity-25"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M90 90 C70 60 50 40 10 20 C20 40 40 60 70 85 Z" />
              <path d="M75 55 C65 40 45 35 30 30 C40 45 55 55 70 60 Z" />
              <path d="M55 75 C45 60 30 55 15 50 C25 65 40 75 50 80 Z" />
            </svg>

            <div className="flex items-start gap-4 z-10">
              {/* Circular Emblem with Sprout & Laurel */}
              <div className="w-16 h-16 rounded-full bg-[#E5ECE4] border border-[#CCD8CB] flex items-center justify-center shrink-0 shadow-2xs">
                <div className="w-11 h-11 rounded-full bg-[#D7E3D5] flex items-center justify-center text-[#153928]">
                  <Sprout className="w-6 h-6 text-[#153928]" />
                </div>
              </div>

              {/* Text & Button */}
              <div className="space-y-1.5 flex-1">
                <h2 className="text-xl font-serif font-bold text-[#163828]">
                  {isMr ? "मृदा आरोग्य पत्रिका" : "Soil Health Card"}
                </h2>
                <p className="text-xs text-[#5C6E61] leading-relaxed">
                  {isMr
                    ? "तुमच्या शेताचा शेतकरी-अनुकूल माती आरोग्य सारांश."
                    : "Farmer-friendly soil health summary of your field."}
                </p>
                <div className="pt-3">
                  <Link
                    href="/soil-health-card"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#153928] text-white text-xs font-semibold hover:bg-[#1f4a36] transition-all shadow-xs"
                  >
                    <span>{isMr ? "आरोग्य पत्रिका उघडा" : "Open Health Card"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Detailed Soil Report */}
          <div className="relative overflow-hidden rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            {/* Decorative botanical branch on bottom-right */}
            <svg
              className="absolute -bottom-2 -right-2 w-28 h-28 text-[#7CA888] pointer-events-none opacity-25"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M90 90 C70 60 50 40 10 20 C20 40 40 60 70 85 Z" />
              <path d="M75 55 C65 40 45 35 30 30 C40 45 55 55 70 60 Z" />
              <path d="M55 75 C45 60 30 55 15 50 C25 65 40 75 50 80 Z" />
            </svg>

            <div className="flex items-start gap-4 z-10">
              {/* Circular Emblem with Document & Sprout */}
              <div className="w-16 h-16 rounded-full bg-[#EFE9DC] border border-[#DED4C2] flex items-center justify-center shrink-0 shadow-2xs">
                <div className="w-11 h-11 rounded-full bg-[#E5DCCB] flex items-center justify-center text-[#153928]">
                  <FileText className="w-6 h-6 text-[#153928]" />
                </div>
              </div>

              {/* Text & Button */}
              <div className="space-y-1.5 flex-1">
                <h2 className="text-xl font-serif font-bold text-[#163828]">
                  {isMr ? "सविस्तर माती अहवाल" : "Detailed Soil Report"}
                </h2>
                <p className="text-xs text-[#5C6E61] leading-relaxed">
                  {isMr
                    ? "माती विश्लेषण, उपलब्ध पीक अनुकूलता आणि बाजार माहिती."
                    : "Soil analysis, available crop suitability and market insights."}
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailedPreview(!showDetailedPreview);
                      if (!showDetailedPreview) {
                        setTimeout(() => {
                          const el = document.getElementById("detailed-report-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#153928] text-white text-xs font-semibold hover:bg-[#1f4a36] transition-all shadow-xs"
                  >
                    <span>
                      {showDetailedPreview
                        ? isMr ? "सविस्तर अहवाल लपवा" : "Hide Detailed Report"
                        : isMr ? "सविस्तर अहवाल पहा" : "View Detailed Report"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. RECENT REPORTS TABLE (EXACT MATCH TO SCREENSHOT)            */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-normal text-[#163828]">
              {isMr ? "अलीकडील अहवाल" : "Recent Reports"}
            </h3>
            <button
              type="button"
              onClick={() => setShowDetailedPreview(true)}
              className="text-xs font-semibold text-[#163828] hover:text-[#2d6344] flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#5C6E61]" />
              <span>{isMr ? "सर्व अहवाल पहा" : "View All Reports"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E8E2D8] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F3EFE7] text-[#5C6E61] border-b border-[#E8E2D8] font-semibold">
                    <th className="py-3.5 px-5">{isMr ? "अहवाल" : "Report"}</th>
                    <th className="py-3.5 px-4">{isMr ? "शेत / गट" : "Field"}</th>
                    <th className="py-3.5 px-4">{isMr ? "अद्यतनित" : "Updated"}</th>
                    <th className="py-3.5 px-4">{isMr ? "स्थिती" : "Status"}</th>
                    <th className="py-3.5 px-5 text-right">{isMr ? "कृती" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D8] text-[#163828]">
                  {recentReports.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F4EFE6]/70 transition-colors">
                      {/* Report Name & Icon */}
                      <td className="py-3.5 px-5 font-medium">
                        <div className="flex items-center gap-2.5">
                          {item.icon === "sprout" ? (
                            <Sprout className="w-4 h-4 text-[#356B48] shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#356B48] shrink-0" />
                          )}
                          <span className="font-semibold text-[#163828]">{item.name}</span>
                        </div>
                      </td>

                      {/* Field / Gat */}
                      <td className="py-3.5 px-4 text-[#5C6E61]">
                        {item.field}
                      </td>

                      {/* Updated Timestamp */}
                      <td className="py-3.5 px-4 text-[#5C6E61]">
                        {item.updated}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {item.statusColor === "emerald" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E5F2E7] text-[#246A38] border border-[#CDE5D1]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#246A38]" />
                            <span>{item.status === "Ready" ? (isMr ? "तयार" : "Ready") : (isMr ? "पूर्ण" : "Completed")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FFF6E5] text-[#A66E14] border border-[#FDE5BD]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A66E14]" />
                            <span>{isMr ? "प्रक्रिया सुरू" : "Processing"}</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        {item.canDownload ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (item.onAction) {
                                item.onAction();
                              } else {
                                handleDownloadDetailed();
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D5CDC0] bg-white text-[#163828] hover:bg-[#FAF7F2] text-xs font-medium transition-all shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5 text-[#5C6E61]" />
                            <span>{isMr ? "डाऊनलोड" : "Download"}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E8E2D8] bg-[#F4EFE6] text-[#8C7E6A] text-xs font-medium cursor-not-allowed">
                            <Clock className="w-3.5 h-3.5 text-[#8C7E6A]" />
                            <span>{isMr ? "प्रक्रियेत" : "Processing"}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 6. FULL INTERACTIVE DETAILED SOIL REPORT SECTION               */}
        {/* ============================================================== */}
        {showDetailedPreview && (
          <div id="detailed-report-section" className="pt-4 space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-[#E8E2D8] p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header inside detailed report */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D8] pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#153928] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#163828]">
                      {isMr ? "सविस्तर माती चाचणी व निर्णय अहवाल" : "Detailed Soil & Crop Decision Report"}
                    </h3>
                    <p className="text-xs text-[#5C6E61] mt-0.5">
                      {isMr
                        ? "माती रासायनिक निदान, बहु-निकष पीक शिफारसी आणि बारामती बाजार भाव."
                        : "Soil chemistry diagnostics, multi-criteria crop decisions, and Baramati market economics."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadDetailed}
                    disabled={detailedDownloadState === "loading"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#153928] text-white text-xs font-semibold hover:bg-[#1f4a36] transition-all shadow-xs"
                  >
                    {detailedDownloadState === "loading" ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isMr ? "PDF तयार होत आहे..." : "Generating PDF..."}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{isMr ? "सविस्तर अहवाल PDF डाऊनलोड" : "Download Detailed Report PDF"}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDetailedPreview(false)}
                    className="p-2 rounded-full hover:bg-[#FAF7F2] text-[#5C6E61] border border-[#E8E2D8]"
                    title="Close"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Verified Cadastral Subgrid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs">
                <div>
                  <span className="text-[#5C6E61] text-[11px] block">{isMr ? "शेतकऱ्याचे नाव:" : "Farmer Name:"}</span>
                  <span className="font-bold text-[#163828]">{farmerName}</span>
                </div>
                <div>
                  <span className="text-[#5C6E61] text-[11px] block">{isMr ? "गट क्रमांक:" : "Gat Number:"}</span>
                  <span className="font-bold text-[#153928]">{isMr ? `गट क्र. ${gatNo}` : `Gat No. ${gatNo}`}</span>
                </div>
                <div>
                  <span className="text-[#5C6E61] text-[11px] block">{isMr ? "गाव व तालुका:" : "Village & Taluka:"}</span>
                  <span className="font-semibold text-[#163828]">{villageName}, {talukaName}</span>
                </div>
                <div>
                  <span className="text-[#5C6E61] text-[11px] block">{isMr ? "अहवाल क्रमांक:" : "Report Number:"}</span>
                  <span className="font-bold font-mono text-[#163828]">{reportNo}</span>
                </div>
              </div>

              {/* Section B: Complete Parameter Table with Source */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#163828] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#153928]" />
                    <span>{isMr ? "माती रासायनिक व पोषणद्रव्य विश्लेषण" : "Soil Nutrient & Diagnostic Analysis"}</span>
                  </h4>
                  <span className="text-[11px] text-[#5C6E61]">
                    {isMr ? "स्रोत: प्रयोगशाळा चाचणी व डिजिटल मॅपिंग (DSM)" : "Source: Laboratory & DSM Predictions"}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#E8E2D8]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#153928] text-white font-bold">
                      <tr>
                        <th className="p-3 w-10 text-center">{isMr ? "अ.क्र." : "Sr."}</th>
                        <th className="p-3">{isMr ? "माती घटक व माहिती स्रोत" : "Soil Parameter & Source"}</th>
                        <th className="p-3 text-right">{isMr ? "मूल्य" : "Observed Value"}</th>
                        <th className="p-3 text-center">{isMr ? "एकक" : "Unit"}</th>
                        <th className="p-3">{isMr ? "स्थिती / विश्लेषण" : "Status"}</th>
                        <th className="p-3">{isMr ? "संदर्भ श्रेणी" : "Reference Range"}</th>
                        <th className="p-3">{isMr ? "शिफारस" : "Recommendation"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E2D8] bg-white">
                      {report?.parameters && report.parameters.length > 0 ? (
                        report.parameters.map((p, idx) => {
                          const pName = isMr ? p.name_mr || p.name : p.name;
                          const interp = isMr ? p.interpretation_mr || p.interpretation : p.interpretation;
                          const valStr =
                            p.value !== null && p.value !== undefined
                              ? Number(p.value).toFixed(2)
                              : isMr ? "उपलब्ध नाही" : "Not Available";
                          const rec = isMr
                            ? p.recommendation_mr || p.recommendation || "संतुलित पोषण व्यवस्थापन ठेवा."
                            : p.recommendation || "Maintain balanced nutrient management.";
                          const isLab = idx <= 6;

                          return (
                            <tr key={p.key || idx} className="hover:bg-[#FAF7F2]">
                              <td className="p-3 text-center text-[#5C6E61] font-mono">{idx + 1}</td>
                              <td className="p-3 font-bold text-[#163828]">
                                <div>{pName}</div>
                                <span className="text-[9.5px] font-normal px-1.5 py-0.5 rounded border mt-0.5 inline-block bg-[#FAF7F2] text-[#5C6E61] border-[#E8E2D8]">
                                  {isLab
                                    ? isMr ? "प्रयोगशाळा चाचणी (0-15 cm)" : "Lab Observation (0-15 cm)"
                                    : isMr ? "डिजिटल मॅपिंग (DSM 0-30 cm)" : "DSM Prediction (0-30 cm)"}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-[#163828]">{valStr}</td>
                              <td className="p-3 text-center text-[#5C6E61]">{p.unit || "-"}</td>
                              <td className="p-3">
                                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E5F2E7] text-[#246A38] border border-[#CDE5D1]">
                                  {isMr ? translateStatus(interp, true) : interp}
                                </span>
                              </td>
                              <td className="p-3 text-[#5C6E61] text-[11px] whitespace-pre-line leading-tight">
                                {isMr
                                  ? getCleanReferenceRangeMr(p.key, p.reference_range)
                                  : getCleanReferenceRange(p.key, p.reference_range)}
                              </td>
                              <td className="p-3 text-[#163828] text-[11px] font-medium leading-relaxed max-w-[240px]">
                                {rec}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-[#5C6E61]">
                            {isMr ? "माती माहिती लोड होत आहे..." : "Loading soil report parameters..."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section C: Top-ranked Crop Recommendation & Decision Guidance */}
              {topCrop && (
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#153928] text-white">
                      {isMr ? "सर्वोत्तम शिफारस पीक" : "Top-Ranked Recommendation"}
                    </span>
                    <h5 className="text-base font-serif font-bold text-[#163828]">
                      {isMr ? topCrop.crop_name_mr || topCrop.crop_name : topCrop.crop_name}
                    </h5>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-[#E8E2D8] text-xs">
                    <div>
                      <span className="text-[#5C6E61] block text-[11px]">{isMr ? "पेरणी काळ:" : "Planting Window:"}</span>
                      <span className="font-bold text-[#163828]">{topCrop.planting_window_text}</span>
                    </div>
                    <div>
                      <span className="text-[#5C6E61] block text-[11px]">{isMr ? "काढणी काळ:" : "Harvest Window:"}</span>
                      <span className="font-bold text-[#163828]">{topCrop.expected_harvest_period_text}</span>
                    </div>
                    <div>
                      <span className="text-[#5C6E61] block text-[11px]">{isMr ? "पाण्याची गरज:" : "Water Need:"}</span>
                      <span className="font-bold text-[#163828]">{topCrop.water_requirement}</span>
                    </div>
                    <div>
                      <span className="text-[#5C6E61] block text-[11px]">{isMr ? "माती अनुकूलता:" : "Soil Fit:"}</span>
                      <span className="font-bold text-[#246A38]">{topCrop.suitability_status_label || topCrop.suitability_status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5C6E61] leading-relaxed">
                    <b>{isMr ? "कृषी सल्ला:" : "Agronomic Rationale:"}</b> {topCrop.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
