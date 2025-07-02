import { unifiedDb } from "@/lib/unified-database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = unifiedDb
  try {
    const assignment = await db.assignment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: true,
        submissions: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json({ message: "Error fetching assignment" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const db = unifiedDb
  try {
    const body = await req.json()
    const updatedAssignment = await db.assignment.update({
      where: {
        id: params.id,
      },
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate,
        courseId: body.courseId,
      },
    })

    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json({ message: "Error updating assignment" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const db = unifiedDb
  try {
    await db.assignment.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Assignment deleted" })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ message: "Error deleting assignment" }, { status: 500 })
  }
}
