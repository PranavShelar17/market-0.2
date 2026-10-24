import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const stateId = request.nextUrl.searchParams.get("state_id") || "1";
  return NextResponse.json([
    { id: 1, state_id: parseInt(stateId, 10) || 1, name: "Pune", code: "PN", is_active: true }
  ]);
}
