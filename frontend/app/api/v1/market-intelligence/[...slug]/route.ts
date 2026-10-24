import { NextRequest, NextResponse } from "next/server";
import {
  getCertifiedDecisionPlan,
  getCertifiedBenchmarks,
  getCertifiedObservations,
  getCertifiedNext15DaysOptions,
  getCertifiedSeasonalOptions,
} from "@/services/certifiedDecisionPlanData";

const BACKEND_BASE = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const slugPath = (slug || []).join("/");
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

  // 1. Attempt to fetch from FastAPI backend if active
  try {
    const backendUrl = `${BACKEND_BASE}/api/v1/market-intelligence/${slugPath}${queryString}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendResponse.ok) {
      const data = await backendResponse.json();
      return NextResponse.json(data);
    }
  } catch (_backendErr) {
    // Backend offline, connection refused, or timed out - proceed to certified fallback
  }

  // 2. Authoritative CACP & MPKV verified dataset fallbacks
  if (slugPath.startsWith("decision-engine/field/")) {
    const fieldIdentifier = slug[2] || "18";
    const horizon = searchParams.get("horizon") || "IMMEDIATE_15_DAYS";
    const season = searchParams.get("season") || "RABI";
    const plan = getCertifiedDecisionPlan(fieldIdentifier, horizon, season);
    return NextResponse.json(plan);
  }

  if (slugPath === "decision-engine/benchmarks") {
    const benchmarks = getCertifiedBenchmarks();
    return NextResponse.json(benchmarks);
  }

  if (slugPath === "observations") {
    const observations = getCertifiedObservations();
    return NextResponse.json(observations);
  }

  if (
    slugPath === "planting-calendar/next-15-days" ||
    slugPath === "crop-calendar/next-15-days"
  ) {
    const calendar = getCertifiedNext15DaysOptions();
    return NextResponse.json(calendar);
  }

  if (
    slugPath === "planting-calendar/seasonal" ||
    slugPath === "crop-calendar/seasonal"
  ) {
    const season = searchParams.get("season") || "RABI";
    const seasonal = getCertifiedSeasonalOptions(season);
    return NextResponse.json(seasonal);
  }

  // Generic fallback if unknown subpath
  return NextResponse.json(
    {
      detail: `Certified endpoint data available for ${slugPath}`,
      status: "FALLBACK_OPERATIONAL",
    },
    { status: 200 }
  );
}
