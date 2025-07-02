import { NextResponse } from "next/server"
import { unifiedDb } from "@/lib/unified-database"

export async function GET() {
  const db = unifiedDb

  try {
    const users = await db.query("SELECT * FROM users")
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const db = unifiedDb

  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    await db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email])

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
