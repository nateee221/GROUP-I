import { type NextRequest, NextResponse } from "next/server"
import { accountRequestService } from "@/lib/account-request-service"

export async function GET() {
  try {
    const requests = await accountRequestService.getAccountRequests()
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error getting account requests:", error)
    return NextResponse.json({ error: "Failed to get account requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()

    // Validate required fields
    if (
      !requestData.firstName ||
      !requestData.lastName ||
      !requestData.email ||
      !requestData.department ||
      !requestData.jobTitle ||
      !requestData.reason
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already has a pending request
    const existingRequests = await accountRequestService.getAccountRequests()
    const existingRequest = existingRequests.find((req) => req.email === requestData.email && req.status === "pending")

    if (existingRequest) {
      return NextResponse.json({ error: "A pending request already exists for this email" }, { status: 409 })
    }

    const newRequest = await accountRequestService.createAccountRequest(requestData)
    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating account request:", error)
    return NextResponse.json({ error: "Failed to create account request" }, { status: 500 })
  }
}
