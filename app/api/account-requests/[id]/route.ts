import { type NextRequest, NextResponse } from "next/server"
import { accountRequestService } from "@/lib/account-request-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const accountRequest = await accountRequestService.getAccountRequestById(params.id)

    if (!accountRequest) {
      return NextResponse.json({ error: "Account request not found" }, { status: 404 })
    }

    return NextResponse.json(accountRequest)
  } catch (error) {
    console.error("Error getting account request:", error)
    return NextResponse.json({ error: "Failed to get account request" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const success = await accountRequestService.updateAccountRequest(params.id, updates)

    if (!success) {
      return NextResponse.json({ error: "Account request not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Account request updated successfully" })
  } catch (error) {
    console.error("Error updating account request:", error)
    return NextResponse.json({ error: "Failed to update account request" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await accountRequestService.deleteAccountRequest(params.id)

    if (!success) {
      return NextResponse.json({ error: "Account request not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Account request deleted successfully" })
  } catch (error) {
    console.error("Error deleting account request:", error)
    return NextResponse.json({ error: "Failed to delete account request" }, { status: 500 })
  }
}
