import { NextResponse } from "next/server"

import { unifiedDb } from "@/lib/unified-database"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return new NextResponse("Asset ID is required", { status: 400 })
    }

    const db = unifiedDb

    const asset = await db.asset.findUnique({
      where: {
        id: id,
      },
    })

    if (!asset) {
      return new NextResponse("Asset not found", { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.log("[ASSET_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()

    const { name, imageUrl } = body

    if (!id) {
      return new NextResponse("Asset ID is required", { status: 400 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    const db = unifiedDb

    const asset = await db.asset.update({
      where: {
        id: id,
      },
      data: {
        name,
        imageUrl,
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.log("[ASSET_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return new NextResponse("Asset ID is required", { status: 400 })
    }

    const db = unifiedDb

    await db.asset.delete({
      where: {
        id: id,
      },
    })

    return new NextResponse("Asset deleted", { status: 200 })
  } catch (error) {
    console.log("[ASSET_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
