import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const districtId = parseInt(request.nextUrl.searchParams.get("district_id") || "1", 10) || 1;
  const talukas = [
    { id: 1, district_id: districtId, name: "Haveli", code: null, is_active: true },
    { id: 2, district_id: districtId, name: "Pune City", code: null, is_active: true },
    { id: 3, district_id: districtId, name: "Maval", code: null, is_active: true },
    { id: 4, district_id: districtId, name: "Mulshi", code: null, is_active: true },
    { id: 5, district_id: districtId, name: "Shirur", code: null, is_active: true },
    { id: 6, district_id: districtId, name: "Baramati", code: null, is_active: true },
    { id: 7, district_id: districtId, name: "Daund", code: null, is_active: true },
    { id: 8, district_id: districtId, name: "Indapur", code: null, is_active: true },
    { id: 9, district_id: districtId, name: "Bhor", code: null, is_active: true },
    { id: 10, district_id: districtId, name: "Velha", code: null, is_active: true },
    { id: 11, district_id: districtId, name: "Purandar", code: null, is_active: true },
    { id: 12, district_id: districtId, name: "Khed", code: null, is_active: true },
    { id: 13, district_id: districtId, name: "Junnar", code: null, is_active: true },
    { id: 14, district_id: districtId, name: "Ambegaon", code: null, is_active: true },
  ];
  return NextResponse.json(talukas);
}
