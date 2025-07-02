import { NextResponse } from "next/server"

import { unifiedDb } from "@/lib/unified-database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return new NextResponse("Transfer ID is required", { status: 400 })
    }

    const db = unifiedDb

    const transfer = await db.transfer.findUnique({
      where: {
        id: id,
      },
    })

    if (!transfer) {
      return new NextResponse("Transfer not found", { status: 404 })
    }

    return NextResponse.json(transfer)
  } catch (error) {
    console.log("[TRANSFER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return new NextResponse("Transfer ID is required", { status: 400 })
    }

    const db = unifiedDb

    const transfer = await db.transfer.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json(transfer)
  } catch (error) {
    console.log("[TRANSFER_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const { amount, senderAccountId, receiverAccountId, description, status } = body

    if (!id) {
      return new NextResponse("Transfer ID is required", { status: 400 })
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 })
    }

    if (!senderAccountId) {
      return new NextResponse("Sender account ID is required", { status: 400 })
    }

    if (!receiverAccountId) {
      return new NextResponse("Receiver account ID is required", { status: 400 })
    }

    const db = unifiedDb

    const transfer = await db.transfer.update({
      where: {
        id: id,
      },
      data: {
        amount,
        senderAccountId,
        receiverAccountId,
        description,
        status,
      },
    })

    return NextResponse.json(transfer)
  } catch (error) {
    console.log("[TRANSFER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
