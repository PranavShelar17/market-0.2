"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "@/i18n/useI18n";
import {
  Coins,
  TrendingDown,
  TrendingUp,
  Package,
  Calendar,
  Building2,
  Database,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
} from "lucide-react";
import {
  marketService,
  MarketPriceObservationItem,
  ObservationsListResponse,
} from "@/services/marketService";

interface MarketOverviewCardsProps {
  selectedDistrict?: string;
  selectedMarket: string;
  selectedCommodity?: string;
  commodityId?: number;
}

export const MarketOverviewCards: React.FC<MarketOverviewCardsProps> = ({
  selectedDistrict = "Pune",
  selectedMarket,
  selectedCommodity = "All Commodities",
  commodityId,
}) => {
  const { language } = useI18n();
  const isMr = language === "mr";

  const [loading, setLoading] = useState<boolean>(true);
  const [dataResponse, setDataResponse] = useState<ObservationsListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchObservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await marketService.getObservations({
        district: selectedDistrict,
        commodityId: commodityId,
        limit: 50,
      });
      setDataResponse(resp);
    } catch (err: any) {
      setError(err?.message || "Failed to load observations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [selectedDistrict, selectedMarket, commodityId]);

  const items = dataResponse?.items || [];
  const hasObservations = items.length > 0;
  // If user selected a specific market, prioritize matching items
  const matchedObservation = items.find((o) =>
    selectedMarket && selectedMarket !== "All Mandis"
      ? o.market_name.toLowerCase().includes(selectedMarket.toLowerCase()) ||
        selectedMarket.toLowerCase().includes(o.market_name.toLowerCase())
      : true
  ) || items[0] || null;

  // Compute Freshness Badge Details
  const freshness = dataResponse?.data_freshness_status || "NO_DATA";
  const getFreshnessBadge = () => {
    switch (freshness) {
      case "FRESH":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          labelEn: "Fresh Verified Data",
          labelMr: "अद्ययावत पडताळणीकृत दर",
        };
      case "STALE":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          labelEn: "Stale / Prior Trading Day",
          labelMr: "मागील कामकाजाचा दर (Stale)",
        };
      case "CREDENTIALS_REQUIRED":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          icon: <Info className="w-3.5 h-3.5 text-amber-600" />,
          labelEn: "API Key Pending",
          labelMr: "API की जोडणी प्रलंबित",
        };
      default:
        return {
          bg: "bg-stone-100 text-stone-700 border-stone-300",
          icon: <Info className="w-3.5 h-3.5 text-stone-500" />,
          labelEn: "No Observations Recorded",
          labelMr: "नोंद उपलब्ध नाही",
        };
    }
  };

  const badge = getFreshnessBadge();

  return (
    <div className="space-y-4">
      {/* Section Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-soil-primaryLight border border-soil-secondary/30 text-soil-primary flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-main tracking-tight flex items-center gap-2">
              <span>{isMr ? "बाजार दर आढावा (APMC Mandi Overview)" : "Market Price Overview"}</span>
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-soil-primary" />}
            </h2>
            <p className="text-xs text-text-muted">
              {isMr
                ? `${selectedDistrict} जिल्हा व ${selectedMarket} मधील अधिकृत बाजार समितीचे दर आणि आवक`
                : `Verified wholesale rates and physical market arrivals for ${selectedMarket} (${selectedDistrict} District)`}
            </p>
          </div>
        </div>

        {/* Observation Provenance & Freshness Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${badge.bg}`}>
            {badge.icon}
            <span>{isMr ? badge.labelMr : badge.labelEn}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-subtle border border-surface-border text-xs text-text-muted">
            <Database className="w-3.5 h-3.5 text-soil-primary" />
            <span>{dataResponse?.source_name || "AGMARKNET / OGD India"}</span>
          </div>
        </div>
      </div>

      {/* Honest Empty State Notice when 0 observations exist */}
      {!loading && !hasObservations && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                {isMr
                  ? "या निवडीसाठी सध्या कोणतेही पडताळणीकृत बाजार दर उपलब्ध नाहीत."
                  : "No verified market observations are available for this selection yet."}
              </p>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                {isMr
                  ? "कृपया दुसरा बाजार किंवा तारीख निवडून तपासा, किंवा थेट स्त्रोत उपलब्ध झाल्यावर पुन्हा प्रयत्न करा. सॉईलपायलट कोणत्याही परिस्थितीत बनावट किंवा कृत्रिम आकडे दाखवत नाही."
                  : "Check another market or date range, or try again when the source is available. SoilPilot never displays fabricated prices or synthetic numbers."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchObservations}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white/90 border border-amber-300 text-xs font-bold text-amber-900 hover:bg-white transition-colors shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isMr ? "पुन्हा तपासा" : "Retry Sync"}</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-surface-border shadow-2xs space-y-3 animate-pulse"
            >
              <div className="h-4 bg-surface-muted rounded w-2/3" />
              <div className="h-8 bg-surface-muted rounded w-1/2" />
              <div className="h-3 bg-surface-muted rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Structured Metric Indicator Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Modal Price */}
          <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-2xs space-y-3 relative overflow-hidden group hover:border-soil-secondary/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-text-muted">
                {isMr ? "अद्ययावत सरासरी भाव (Modal Rate)" : "Latest Verified Modal Price"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  matchedObservation?.modal_price
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-surface-muted text-text-muted border border-surface-border"
                }`}
              >
                {matchedObservation?.modal_price
                  ? isMr
                    ? "सत्यापित"
                    : "Verified"
                  : isMr
                  ? "अनुपलब्ध"
                  : "Unavailable"}
              </span>
            </div>

            <div className="py-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-text-main tracking-tight">
                  {matchedObservation?.modal_price != null
                    ? `₹${matchedObservation.modal_price.toLocaleString("en-IN")}`
                    : "— —"}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  {matchedObservation ? "₹ / क्विंटल" : "₹ / क्विंटल"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-border/60 text-[11px] text-text-muted">
              {matchedObservation
                ? `${matchedObservation.commodity_name} (${matchedObservation.market_name})`
                : isMr
                ? "बाजार लिलावात नोंदवला गेलेला बहुतांश व्यवहार दर"
                : "Most frequent wholesale transaction rate recorded in auction"}
            </div>
          </div>

          {/* Card 2: Minimum Price */}
          <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-2xl space-y-3 relative overflow-hidden group hover:border-soil-secondary/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-text-muted">
                {isMr ? "किमान भाव (Min Rate)" : "Minimum Price"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  matchedObservation?.min_price
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-surface-muted text-text-muted border border-surface-border"
                }`}
              >
                {matchedObservation?.min_price
                  ? isMr
                    ? "किमान"
                    : "Floor"
                  : isMr
                  ? "अनुपलब्ध"
                  : "Unavailable"}
              </span>
            </div>

            <div className="py-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-text-main tracking-tight">
                  {matchedObservation?.min_price != null
                    ? `₹${matchedObservation.min_price.toLocaleString("en-IN")}`
                    : "— —"}
                </span>
                <span className="text-xs font-semibold text-text-muted">₹ / क्विंटल</span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-border/60 text-[11px] text-text-muted">
              {isMr
                ? "शेवटच्या कामकाजाच्या दिवशी नोंदवला गेलेला नीचांकी दर"
                : "Lowest wholesale rate observed on latest trading day"}
            </div>
          </div>

          {/* Card 3: Maximum Price */}
          <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-2xs space-y-3 relative overflow-hidden group hover:border-soil-secondary/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-text-muted">
                {isMr ? "कमाल भाव (Max Rate)" : "Maximum Price"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  matchedObservation?.max_price
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-surface-muted text-text-muted border border-surface-border"
                }`}
              >
                {matchedObservation?.max_price
                  ? isMr
                    ? "कमाल"
                    : "Ceiling"
                  : isMr
                  ? "अनुपलब्ध"
                  : "Unavailable"}
              </span>
            </div>

            <div className="py-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-text-main tracking-tight">
                  {matchedObservation?.max_price != null
                    ? `₹${matchedObservation.max_price.toLocaleString("en-IN")}`
                    : "— —"}
                </span>
                <span className="text-xs font-semibold text-text-muted">₹ / क्विंटल</span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-border/60 text-[11px] text-text-muted">
              {isMr
                ? "सत्रादरम्यान नोंदवला गेलेला उच्चांकी घाऊक दर"
                : "Peak wholesale rate recorded during trading session"}
            </div>
          </div>

          {/* Card 4: Market Arrivals */}
          <div className="p-4 rounded-2xl bg-white border border-surface-border shadow-2xs space-y-3 relative overflow-hidden group hover:border-soil-secondary/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-text-muted">
                {isMr ? "दैनंदिन आवक (Arrival Volume)" : "Market Arrivals"}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  matchedObservation?.arrival_quantity
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : "bg-surface-muted text-text-muted border border-surface-border"
                }`}
              >
                {matchedObservation?.arrival_quantity
                  ? isMr
                    ? "नोंदणीकृत"
                    : "Recorded"
                  : isMr
                  ? "अनुपलब्ध"
                  : "Unavailable"}
              </span>
            </div>

            <div className="py-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-text-main tracking-tight">
                  {matchedObservation?.arrival_quantity != null
                    ? matchedObservation.arrival_quantity.toLocaleString("en-IN")
                    : "— —"}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  {matchedObservation?.arrival_unit === "TONNE" ? (isMr ? "टन" : "Tonnes") : (isMr ? "क्विंटल" : "Quintals")}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-border/60 text-[11px] text-text-muted">
              {isMr
                ? "बाजार समितीत प्रत्यक्षात दाखल झालेली कृषी मालाची आवक"
                : "Physical produce volume unloaded in APMC mandi yards"}
            </div>
          </div>
        </div>
      )}

      {/* Metadata Provenance Footprint */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-2.5 text-xs">
          <Calendar className="w-4 h-4 text-soil-primary shrink-0" />
          <div className="truncate">
            <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider">
              {isMr ? "निरीक्षण तारीख (Observation Date)" : "Observation Date"}
            </span>
            <span className="font-semibold text-text-main">
              {matchedObservation?.observation_date || (isMr ? "थेट स्त्रोत प्रलंबित" : "Awaiting Daily Mandi Bulletin")}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-2.5 text-xs">
          <Building2 className="w-4 h-4 text-soil-primary shrink-0" />
          <div className="truncate">
            <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider">
              {isMr ? "बाजार समिती (Target APMC)" : "Target Market Yard"}
            </span>
            <span className="font-semibold text-text-main">
              {matchedObservation?.market_name || selectedMarket}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-2.5 text-xs">
          <Clock className="w-4 h-4 text-soil-primary shrink-0" />
          <div className="truncate">
            <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider">
              {isMr ? "संकलन वेळ (Retrieval Timestamp)" : "System Retrieval Timestamp"}
            </span>
            <span className="font-semibold text-text-main text-[11px]">
              {matchedObservation?.retrieval_timestamp
                ? new Date(matchedObservation.retrieval_timestamp).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : isMr
                ? "माहिती संकलन प्रतिक्षेत"
                : "Awaiting Ingestion Run"}
            </span>
          </div>
        </div>
      </div>

      {/* Real Verified Observations Data Table (when multiple observations are present) */}
      {!loading && items.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl border border-surface-border overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-surface-subtle/70 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-soil-primary" />
              <h3 className="text-xs font-bold text-text-main">
                {isMr
                  ? `पडताळणीकृत बाजार दर नोंदी (${items.length} नोंदी प्राप्त)`
                  : `Verified Market Observations (${items.length} record${items.length === 1 ? "" : "s"} loaded)`}
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-text-muted">
              {isMr ? "स्त्रोत: अधिकृत AGMARKNET बुलेटिन" : "Source: Official AGMARKNET Bulletin"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted text-[10px] uppercase font-bold tracking-wider border-b border-surface-border">
                <tr>
                  <th className="py-2.5 px-3.5">{isMr ? "पीक (Commodity)" : "Commodity"}</th>
                  <th className="py-2.5 px-3.5">{isMr ? "बाजार समिती (APMC)" : "Market / APMC"}</th>
                  <th className="py-2.5 px-3.5">{isMr ? "तारीख" : "Observation Date"}</th>
                  <th className="py-2.5 px-3.5 text-right">{isMr ? "किमान भाव" : "Min Rate (₹)"}</th>
                  <th className="py-2.5 px-3.5 text-right font-bold text-text-main">{isMr ? "सरासरी भाव" : "Modal Rate (₹)"}</th>
                  <th className="py-2.5 px-3.5 text-right">{isMr ? "कमाल भाव" : "Max Rate (₹)"}</th>
                  <th className="py-2.5 px-3.5 text-right">{isMr ? "आवक" : "Arrivals"}</th>
                  <th className="py-2.5 px-3.5 text-center">{isMr ? "पडताळणी" : "Validation"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {items.map((obs) => (
                  <tr key={obs.id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-text-main">
                      {isMr ? obs.commodity_name_mr || obs.commodity_name : obs.commodity_name}
                      <span className="block text-[10px] font-normal text-text-muted">{obs.commodity_category}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-text-main font-medium">
                      {isMr ? obs.market_name_mr || obs.market_name : obs.market_name}
                      {obs.district_name && (
                        <span className="block text-[10px] text-text-muted">Dist: {obs.district_name}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-text-muted whitespace-nowrap">
                      {obs.observation_date}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-text-muted">
                      {obs.min_price != null ? `₹${obs.min_price.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-black text-soil-primary text-sm">
                      {obs.modal_price != null ? `₹${obs.modal_price.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-text-muted">
                      {obs.max_price != null ? `₹${obs.max_price.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-text-muted whitespace-nowrap">
                      {obs.arrival_quantity != null ? `${obs.arrival_quantity} ${obs.arrival_unit || "T"}` : "—"}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{obs.validation_status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
