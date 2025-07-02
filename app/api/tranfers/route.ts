import { NextResponse } from "next/server"

import { unifiedDb } from "@/lib/unified-database"

export async function GET() {
  try {
    const db = unifiedDb
    const transfers = await db.getAllTransfers()

    return NextResponse.json(transfers)
  } catch (error) {
    console.error("[TRANSFERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const db = unifiedDb
    const body = await req.json()

    const { fromAccountId, toAccountId, amount } = body

    if (!fromAccountId) {
      return new NextResponse("From account ID is required", { status: 400 })
    }

    if (!toAccountId) {
      return new NextResponse("To account ID is required", { status: 400 })
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 })
    }

    const transfer = await db.createTransfer({
      fromAccountId,
      toAccountId,
      amount,
    })

    return NextResponse.json(transfer)
  } catch (error) {
    console.error("[TRANSFERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
