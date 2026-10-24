import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, name: "Maharashtra", code: "MH", is_active: true }
  ]);
}
