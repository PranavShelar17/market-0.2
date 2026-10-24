import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const talukaId = parseInt(request.nextUrl.searchParams.get("taluka_id") || "6", 10) || 6;
  return NextResponse.json([
    { id: 87, taluka_id: talukaId, name: "Malegaon Kh", code: null, is_active: true },
    { id: 88, taluka_id: talukaId, name: "Malegaon Bk", code: null, is_active: true },
    { id: 89, taluka_id: talukaId, name: "Baramati Rural", code: null, is_active: true },
  ]);
}
