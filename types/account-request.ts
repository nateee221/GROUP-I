export interface AccountRequest {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  jobTitle: string
  reason: string
  requestDate: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedDate?: string
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

export interface AccountRequestFormData {
  firstName: string
  lastName: string
  email: string
  department: string
  jobTitle: string
  reason: string
}
