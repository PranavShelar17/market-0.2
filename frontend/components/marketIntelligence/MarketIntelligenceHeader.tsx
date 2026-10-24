"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/useI18n";
import { TrendingUp, MapPin, Radio, ShieldAlert } from "lucide-react";
import { translateGeoName, formatGatLabel } from "@/i18n/marathiHelper";

interface MarketIntelligenceHeaderProps {
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  gatNo?: string;
}

export const MarketIntelligenceHeader: React.FC<MarketIntelligenceHeaderProps> = ({
  state = "Maharashtra",
  district = "Pune",
  taluka = "Baramati",
  village = "Malegaon Kh",
  gatNo = "",
}) => {
  const { t, language } = useI18n();
  const isMr = language === "mr";

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-soil-primaryLight border border-soil-secondary/30 text-soil-primary flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                {isMr ? "बाजार भाव व पीक नियोजन" : "Market Intelligence & Crop Planner"}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-soil-beige/70 text-amber-900 border border-amber-300 rounded-full flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-amber-700 animate-pulse" />
                {isMr ? "टप्पा २: इंटरफेस संरचना" : "Phase 2: UI Structure"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              {isMr
                ? "पडताळणी केलेली बाजार माहिती तपासा आणि शास्त्रोक्त पीक नियोजन पर्यायांचा अभ्यास करा."
                : "Compare verified market information and explore crop-planning options."}
            </p>
          </div>
        </div>
      </div>

      {/* Location Context & Live Feed Status */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Geographic Context Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs font-semibold text-text-main shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-soil-primary shrink-0" />
          <span>{translateGeoName(village, isMr)}</span>
          <span className="text-surface-borderStrong">•</span>
          <span className="text-text-muted">{translateGeoName(taluka, isMr)}</span>
          {gatNo && (
            <>
              <span className="text-surface-borderStrong">•</span>
              <span className="px-1.5 py-0.5 rounded bg-soil-primaryLight text-soil-primary font-bold text-[11px]">
                {formatGatLabel(gatNo, isMr)}
              </span>
            </>
          )}
        </div>

        {/* Data Status Indicator */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-medium text-amber-800"
          title={
            isMr
              ? "बाजार माहिती स्त्रोत टप्पा ३ मध्ये जोडला जाईल"
              : "Market source feeds will be integrated in Phase 3"
          }
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            {isMr ? "माहिती जोडणी: प्रलंबित" : "Data Feed: Pending Integration"}
          </span>
        </div>
      </div>
    </div>
  );
};
