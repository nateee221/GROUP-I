import { NextResponse } from "next/server"
import { unifiedDb } from "@/lib/unified-database"

type Params = { params: { id: string } }

export async function GET(request: Request, { params }: Params) {
  const id = params.id
  const db = unifiedDb

  const user = await db.user.findUnique({
    where: {
      id: id,
    },
  })

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const id = params.id
    const db = unifiedDb

    const { name, email } = await request.json()

    const updatedUser = await db.user.update({
      where: {
        id: id,
      },
      data: {
        name,
        email,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Error updating user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const id = params.id
    const db = unifiedDb

    await db.user.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 })
  }
}
