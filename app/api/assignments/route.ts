import { NextResponse } from "next/server"
import { unifiedDb } from "@/lib/unified-database"

export async function GET(request: Request) {
  const db = unifiedDb

  try {
    const assignments = await db.assignment.findMany()
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ message: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const db = unifiedDb

  try {
    const json = await request.json()
    const assignment = await db.assignment.create({
      data: json,
    })
    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ message: "Failed to create assignment" }, { status: 500 })
  }
}
