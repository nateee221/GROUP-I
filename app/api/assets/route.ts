import { NextResponse } from "next/server"

import { unifiedDb } from "@/lib/unified-database"

export async function GET() {
  const db = unifiedDb

  try {
    const assets = await db.getAllAssets()
    return NextResponse.json(assets)
  } catch (e: any) {
    console.error("Error fetching assets:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
