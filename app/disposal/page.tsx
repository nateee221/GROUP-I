"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Download, Edit, FileText, MoreHorizontal, Plus, Search, ThumbsDown, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { useAssets } from "@/components/asset-provider"

// Disposal reasons
const disposalReasons = [
  "Obsolete",
  "Damaged beyond repair",
  "No longer needed",
  "End of life cycle",
  "Upgrade replacement",
  "Safety concern",
  "Other",
]

// Disposal methods
const disposalMethods = ["Recycle", "Donate", "Sell", "Trash", "Return to vendor", "Other"]

// Disposal statuses
const disposalStatuses = ["All", "Pending Approval", "Approved", "Rejected", "Completed"]

// Disposal request interface
interface DisposalRequest {
  id: string
  assetId: string
  assetName: string
  requestDate: string
  requestedBy: string
  department: string
  reason: string
  status: "Pending Approval" | "Approved" | "Rejected" | "Completed"
  approvedBy?: string
  approvalDate?: string
  disposalMethod?: string
  disposalDate?: string
  notes?: string
  rejectionReason?: string
  suggestedMethod?: string
}

// Default mock data
const defaultDisposalRequests: DisposalRequest[] = [
  {
    id: "D001",
    assetId: "10009",
    assetName: "Shredder",
    requestDate: "2023-05-15",
    requestedBy: "System Administrator",
    department: "Administration",
    reason: "Damaged beyond repair",
    status: "Pending Approval",
    notes: "Equipment is damaged beyond repair, potential safety hazard",
    suggestedMethod: "Recycle",
  },
]

// LocalStorage key
const STORAGE_KEY = "disposal_requests_data"

export default function DisposalPage() {
  const { user } = useAuth()
  const { assets, updateAsset, deleteAsset } = useAssets()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [isCreateDisposalOpen, setIsCreateDisposalOpen] = useState(false)
  const [selectedDisposal, setSelectedDisposal] = useState<DisposalRequest | null>(null)
  const [isViewDisposalOpen, setIsViewDisposalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [approvalNotes, setApprovalNotes] = useState("")
  const [isApproveDisposalOpen, setIsApproveDisposalOpen] = useState(false)
  const [isApprovalConfirmOpen, setIsApprovalConfirmOpen] = useState(false)
  const [pendingApprovalRequest, setPendingApprovalRequest] = useState<DisposalRequest | null>(null)

  // Form states for asset selection
  const [assetSearchTerm, setAssetSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedAssetStatus, setSelectedAssetStatus] = useState("all")

  // Form states for creating disposal request
  const [selectedAssetId, setSelectedAssetId] = useState("")
  const [disposalReason, setDisposalReason] = useState("")
  const [disposalNotes, setDisposalNotes] = useState("")
  const [suggestedMethod, setSuggestedMethod] = useState("")

  // Load disposal requests from localStorage on component mount
  const [disposalRequests, setDisposalRequests] = useState<DisposalRequest[]>(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY)
        return savedData ? JSON.parse(savedData) : defaultDisposalRequests
      } catch (error) {
        console.error("Error loading disposal requests from localStorage:", error)
        return defaultDisposalRequests
      }
    }
    return defaultDisposalRequests
  })

  // Save disposal requests to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(disposalRequests))
    }
  }, [disposalRequests])

  // Get assets that are eligible for disposal (Pending Disposal status or poor condition)
  const eligibleAssets = assets.filter(
    (asset) =>
      asset.status === "Pending Disposal" ||
      (asset.status === "In Storage" && asset.notes?.toLowerCase().includes("damaged")) ||
      (asset.status === "In Storage" && asset.notes?.toLowerCase().includes("old")) ||
      (asset.status === "In Storage" && asset.notes?.toLowerCase().includes("broken")),
  )

  // Filter disposal requests based on search and filters
  const filteredRequests = disposalRequests.filter((request) => {
    const matchesSearch =
      request.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "All" || request.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleViewDisposal = (request: DisposalRequest) => {
    setSelectedDisposal(request)
    setIsViewDisposalOpen(true)
  }

  // Add step state management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Add step navigation functions
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setSelectedAssetId("")
    setDisposalReason("")
    setDisposalNotes("")
    setSuggestedMethod("")
    setAssetSearchTerm("")
    setSelectedCategory("all")
    setSelectedDepartment("all")
    setSelectedAssetStatus("all")
    setCurrentStep(1)
  }

  const handleCreateDisposal = () => {
    if (!selectedAssetId || !disposalReason) {
      toast({
        title: "Validation Error",
        description: "Please select an asset and provide a reason for disposal.",
        variant: "destructive",
      })
      return
    }

    const selectedAsset = assets.find((asset) => asset.id === selectedAssetId)
    if (!selectedAsset) {
      toast({
        title: "Error",
        description: "Selected asset not found.",
        variant: "destructive",
      })
      return
    }

    const newDisposalRequest: DisposalRequest = {
      id: `D${String(disposalRequests.length + 1).padStart(3, "0")}`,
      assetId: selectedAssetId,
      assetName: selectedAsset.name,
      requestDate: new Date().toISOString().split("T")[0],
      requestedBy: user?.name || "Current User",
      department: selectedAsset.department,
      reason: disposalReason,
      status: "Pending Approval",
      notes: disposalNotes || undefined,
      suggestedMethod: suggestedMethod || undefined,
    }

    setDisposalRequests((prev) => [...prev, newDisposalRequest])

    // Update asset status to Pending Disposal
    updateAsset(selectedAssetId, {
      status: "Pending Disposal",
      notes: `${selectedAsset.notes || ""} - Disposal requested: ${disposalReason}`.trim(),
    })

    toast({
      title: "Disposal Request Submitted",
      description: "Your disposal request has been submitted for approval.",
    })

    setIsCreateDisposalOpen(false)
    resetForm()
  }

  const handleDirectApproval = (request: DisposalRequest) => {
    setPendingApprovalRequest(request)
    setIsApprovalConfirmOpen(true)
  }

  const confirmApproval = () => {
    if (!pendingApprovalRequest) return

    const updatedRequest: DisposalRequest = {
      ...pendingApprovalRequest,
      status: "Approved",
      approvedBy: user?.name || "Admin User",
      approvalDate: new Date().toISOString().split("T")[0],
      disposalMethod: pendingApprovalRequest.suggestedMethod || "Recycle", // Use suggested method or default
      notes: pendingApprovalRequest.notes || "Approved by admin",
    }

    setDisposalRequests((prev) => prev.map((req) => (req.id === pendingApprovalRequest.id ? updatedRequest : req)))

    toast({
      title: "Disposal Request Approved",
      description: `${pendingApprovalRequest.assetName} disposal request has been approved.`,
    })

    setIsApprovalConfirmOpen(false)
    setPendingApprovalRequest(null)
  }

  const handleRejectDisposalRequest = () => {
    if (!selectedDisposal) return

    const updatedRequest: DisposalRequest = {
      ...selectedDisposal,
      status: "Rejected",
      approvedBy: user?.name || "Admin User",
      approvalDate: new Date().toISOString().split("T")[0],
      rejectionReason: approvalNotes || "Request declined",
    }

    setDisposalRequests((prev) => prev.map((req) => (req.id === selectedDisposal.id ? updatedRequest : req)))

    // Update asset status back to its previous state
    updateAsset(selectedDisposal.assetId, {
      status: "In Storage",
      notes:
        assets
          .find((a) => a.id === selectedDisposal.assetId)
          ?.notes?.replace(` - Disposal requested: ${selectedDisposal.reason}`, "") || "",
    })

    toast({
      title: "Disposal Request Declined",
      description: "The disposal request has been declined.",
    })
    setIsApproveDisposalOpen(false)
    setSelectedDisposal(null)
  }

  const handleMarkAsDisposed = (request: DisposalRequest) => {
    const updatedRequest: DisposalRequest = {
      ...request,
      status: "Completed",
      disposalDate: new Date().toISOString().split("T")[0],
    }

    setDisposalRequests((prev) => prev.map((req) => (req.id === request.id ? updatedRequest : req)))

    // Remove the asset from the system
    deleteAsset(request.assetId)

    toast({
      title: "Asset Disposed",
      description: `${request.assetName} has been marked as disposed and removed from the system.`,
    })
  }

  const handleDirectDecline = (request: DisposalRequest) => {
    setSelectedDisposal(request)
    setApprovalNotes("Request declined by admin")

    const updatedRequest: DisposalRequest = {
      ...request,
      status: "Rejected",
      approvedBy: user?.name || "Admin User",
      approvalDate: new Date().toISOString().split("T")[0],
      rejectionReason: "Request declined by admin",
    }

    setDisposalRequests((prev) => prev.map((req) => (req.id === request.id ? updatedRequest : req)))

    // Update asset status back to its previous state
    updateAsset(request.assetId, {
      status: "In Storage",
      notes:
        assets.find((a) => a.id === request.assetId)?.notes?.replace(` - Disposal requested: ${request.reason}`, "") ||
        "",
    })

    toast({
      title: "Disposal Request Declined",
      description: `Disposal request for ${request.assetName} has been declined.`,
    })
    setSelectedDisposal(null)
  }

  // Filter assets for disposal request creation
  const filteredAssetsForDisposal = assets.filter((asset) => {
    // Exclude assets that already have pending disposal requests
    const hasPendingRequest = disposalRequests.some(
      (req) => req.assetId === asset.id && req.status === "Pending Approval",
    )
    if (hasPendingRequest) return false

    // Search filter
    const matchesSearch =
      assetSearchTerm === "" ||
      asset.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(assetSearchTerm.toLowerCase())

    // Category filter
    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory

    // Department filter
    const matchesDepartment = selectedDepartment === "all" || asset.department === selectedDepartment

    // Status filter
    const matchesStatus = selectedAssetStatus === "all" || asset.status === selectedAssetStatus

    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Disposal Management</h1>
          <Button onClick={() => setIsCreateDisposalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Disposal Request
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Requests ({disposalRequests.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval ({disposalRequests.filter((r) => r.status === "Pending Approval").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({disposalRequests.filter((r) => r.status === "Approved").length})
            </TabsTrigger>
            <TabsTrigger value="eligible">Eligible Assets ({eligibleAssets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Disposal Requests</CardTitle>
                <CardDescription>View and manage all asset disposal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search disposal requests..."
                        className="pl-8 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {disposalStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-md border border-gray-300 dark:border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox />
                          </TableHead>
                          <TableHead className="w-[80px]">Asset ID</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Requested By</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Request Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No disposal requests found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>
                                <Checkbox />
                              </TableCell>
                              <TableCell className="font-medium">{request.assetId}</TableCell>
                              <TableCell>{request.assetName}</TableCell>
                              <TableCell>{request.requestedBy}</TableCell>
                              <TableCell>{request.department}</TableCell>
                              <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    request.status === "Approved"
                                      ? "default"
                                      : request.status === "Pending Approval"
                                        ? "outline"
                                        : request.status === "Rejected"
                                          ? "destructive"
                                          : "secondary"
                                  }
                                >
                                  {request.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleViewDisposal(request)}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    {request.status === "Pending Approval" && (
                                      <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Request
                                      </DropdownMenuItem>
                                    )}
                                    {request.status === "Approved" && !request.disposalDate && (
                                      <DropdownMenuItem onClick={() => handleMarkAsDisposed(request)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Mark as Disposed
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredRequests.length} of {disposalRequests.length} requests
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>Disposal requests awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Asset ID</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disposalRequests
                        .filter((request) => request.status === "Pending Approval")
                        .map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.assetId}</TableCell>
                            <TableCell>{request.assetName}</TableCell>
                            <TableCell>{request.requestedBy}</TableCell>
                            <TableCell>{request.department}</TableCell>
                            <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                            <TableCell>{request.reason}</TableCell>
                            <TableCell className="text-right">
                              {user?.role === "admin" ? (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDirectApproval(request)}
                                    className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-950"
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDirectDecline(request)}
                                    className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-950"
                                  >
                                    <ThumbsDown className="mr-1 h-3 w-3" />
                                    Decline
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => handleViewDisposal(request)}>
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      {disposalRequests.filter((request) => request.status === "Pending Approval").length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No pending disposal requests.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Approved Disposals</CardTitle>
                <CardDescription>Disposal requests that have been approved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Asset ID</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Approval Date</TableHead>
                        <TableHead>Disposal Method</TableHead>
                        <TableHead>Disposal Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disposalRequests
                        .filter((request) => request.status === "Approved" || request.status === "Completed")
                        .map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.assetId}</TableCell>
                            <TableCell>{request.assetName}</TableCell>
                            <TableCell>{request.approvedBy}</TableCell>
                            <TableCell>
                              {request.approvalDate ? new Date(request.approvalDate).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>{request.disposalMethod || "Not specified"}</TableCell>
                            <TableCell>
                              {request.disposalDate ? new Date(request.disposalDate).toLocaleDateString() : "Pending"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleViewDisposal(request)}>
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                                {!request.disposalDate && request.status === "Approved" && (
                                  <Button variant="outline" size="sm" onClick={() => handleMarkAsDisposed(request)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Mark as Disposed
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      {!disposalRequests.some(
                        (request) => request.status === "Approved" || request.status === "Completed",
                      ) && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No approved disposal requests.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligible" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Eligible for Disposal</CardTitle>
                <CardDescription>
                  Assets that may be eligible for disposal ({eligibleAssets.length} available)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Asset ID</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Purchase Date</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eligibleAssets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No assets eligible for disposal found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        eligibleAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.id}</TableCell>
                            <TableCell>{asset.name}</TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>
                              {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>{asset.department}</TableCell>
                            <TableCell>
                              <Badge variant={asset.status === "Pending Disposal" ? "destructive" : "secondary"}>
                                {asset.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAssetId(asset.id)
                                  setIsCreateDisposalOpen(true)
                                }}
                                disabled={disposalRequests.some(
                                  (req) => req.assetId === asset.id && req.status === "Pending Approval",
                                )}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {disposalRequests.some(
                                  (req) => req.assetId === asset.id && req.status === "Pending Approval",
                                )
                                  ? "Request Pending"
                                  : "Request Disposal"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Disposal Request Dialog - Multi-Step */}
      <Dialog open={isCreateDisposalOpen} onOpenChange={setIsCreateDisposalOpen}>
        <DialogContent className="sm:max-w-[450px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Create Disposal Request</DialogTitle>
            <DialogDescription>
              Step {currentStep} of {totalSteps}:{" "}
              {currentStep === 1 ? "Select Asset" : currentStep === 2 ? "Disposal Details" : "Review & Submit"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && <div className={`w-8 h-0.5 ${step < currentStep ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <div className="py-4">
            {/* Step 1: Asset Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Assets</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by name, ID, or serial number..."
                      className="pl-8 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      value={assetSearchTerm}
                      onChange={(e) => setAssetSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(new Set(assets.map((asset) => asset.category))).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {Array.from(new Set(assets.map((asset) => asset.department))).map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedAssetStatus} onValueChange={setSelectedAssetStatus}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="In Use">In Use</SelectItem>
                      <SelectItem value="In Storage">In Storage</SelectItem>
                      <SelectItem value="In Maintenance">In Maintenance</SelectItem>
                      <SelectItem value="Pending Disposal">Pending Disposal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border border-gray-300 dark:border-border/50 rounded-md max-h-48 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredAssetsForDisposal.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No assets found matching your criteria.
                      </div>
                    ) : (
                      filteredAssetsForDisposal.slice(0, 15).map((asset) => (
                        <div
                          key={asset.id}
                          className={`flex items-center space-x-3 p-2 rounded cursor-pointer hover:bg-muted/50 ${
                            selectedAssetId === asset.id
                              ? "bg-muted border border-primary"
                              : "border border-transparent"
                          }`}
                          onClick={() => setSelectedAssetId(asset.id)}
                        >
                          <input
                            type="radio"
                            name="selectedAsset"
                            checked={selectedAssetId === asset.id}
                            onChange={() => setSelectedAssetId(asset.id)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{asset.name}</p>
                              <Badge
                                variant={
                                  asset.status === "In Use"
                                    ? "default"
                                    : asset.status === "In Storage"
                                      ? "secondary"
                                      : asset.status === "In Maintenance"
                                        ? "outline"
                                        : "destructive"
                                }
                                className="text-xs"
                              >
                                {asset.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ID: {asset.id} | {asset.department}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {filteredAssetsForDisposal.length > 15 && (
                  <p className="text-xs text-muted-foreground">
                    Showing first 15 of {filteredAssetsForDisposal.length} assets. Use filters to narrow down results.
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Disposal Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {selectedAssetId && (
                  <div className="p-3 bg-muted/50 rounded-md border border-gray-300 dark:border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{assets.find((a) => a.id === selectedAssetId)?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {selectedAssetId} | {assets.find((a) => a.id === selectedAssetId)?.department}
                        </p>
                      </div>
                      <Badge variant="outline">Selected</Badge>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="disposalReason">Reason for Disposal *</Label>
                  <Select value={disposalReason} onValueChange={setDisposalReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {disposalReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disposalNotes">Additional Details</Label>
                  <Textarea
                    id="disposalNotes"
                    placeholder="Provide more information about why this asset should be disposed"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary resize-none"
                    rows={3}
                    value={disposalNotes}
                    onChange={(e) => setDisposalNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestedMethod">Suggested Disposal Method (Optional)</Label>
                  <Select value={suggestedMethod} onValueChange={setSuggestedMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {disposalMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Review Disposal Request</h3>

                  <div className="p-3 bg-muted/50 rounded-md border border-gray-300 dark:border-border/50">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Asset:</span>
                        <span className="text-sm">{assets.find((a) => a.id === selectedAssetId)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Asset ID:</span>
                        <span className="text-sm">{selectedAssetId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Department:</span>
                        <span className="text-sm">{assets.find((a) => a.id === selectedAssetId)?.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Reason:</span>
                        <span className="text-sm">{disposalReason}</span>
                      </div>
                      {suggestedMethod && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Suggested Method:</span>
                          <span className="text-sm">{suggestedMethod}</span>
                        </div>
                      )}
                      {disposalNotes && (
                        <div>
                          <span className="text-sm font-medium">Notes:</span>
                          <p className="text-sm mt-1">{disposalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>• This request will be submitted for admin approval</p>
                    <p>• The asset status will be updated to "Pending Disposal"</p>
                    <p>• You will be notified once the request is reviewed</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDisposalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevStep}>
                  Previous
                </Button>
              )}
            </div>

            <div>
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNextStep}
                  disabled={(currentStep === 1 && !selectedAssetId) || (currentStep === 2 && !disposalReason)}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleCreateDisposal} disabled={!selectedAssetId || !disposalReason}>
                  Submit Request
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Disposal Dialog */}
      {selectedDisposal && (
        <Dialog open={isViewDisposalOpen} onOpenChange={setIsViewDisposalOpen}>
          <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
            <DialogHeader>
              <DialogTitle>Disposal Request Details</DialogTitle>
              <DialogDescription>Detailed information about the disposal request.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedDisposal.assetName}</h3>
                  <p className="text-sm text-muted-foreground">Asset ID: {selectedDisposal.assetId}</p>
                  <p className="text-sm text-muted-foreground">Request ID: {selectedDisposal.id}</p>
                </div>
                <Badge
                  variant={
                    selectedDisposal.status === "Approved"
                      ? "default"
                      : selectedDisposal.status === "Pending Approval"
                        ? "outline"
                        : selectedDisposal.status === "Rejected"
                          ? "destructive"
                          : "secondary"
                  }
                >
                  {selectedDisposal.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Asset ID</p>
                  <p>{selectedDisposal.assetId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p>{selectedDisposal.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Requested By</p>
                  <p>{selectedDisposal.requestedBy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Request Date</p>
                  <p>{new Date(selectedDisposal.requestDate).toLocaleDateString()}</p>
                </div>
                {selectedDisposal.approvedBy && (
                  <>
                    <div>
                      <p className="text-sm font-medium">Approved By</p>
                      <p>{selectedDisposal.approvedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Approval Date</p>
                      <p>
                        {selectedDisposal.approvalDate
                          ? new Date(selectedDisposal.approvalDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </>
                )}
                {selectedDisposal.disposalMethod && (
                  <>
                    <div>
                      <p className="text-sm font-medium">Disposal Method</p>
                      <p>{selectedDisposal.disposalMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Disposal Date</p>
                      <p>
                        {selectedDisposal.disposalDate
                          ? new Date(selectedDisposal.disposalDate).toLocaleDateString()
                          : "Pending"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="text-sm font-medium">Reason for Disposal</p>
                <p>{selectedDisposal.reason}</p>
              </div>

              {selectedDisposal.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p>{selectedDisposal.notes}</p>
                </div>
              )}

              {selectedDisposal.rejectionReason && (
                <div>
                  <p className="text-sm font-medium">Rejection Reason</p>
                  <p className="text-destructive">{selectedDisposal.rejectionReason}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDisposalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Approval Confirmation Dialog */}
      <Dialog open={isApprovalConfirmOpen} onOpenChange={setIsApprovalConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Confirm Disposal Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this disposal request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {pendingApprovalRequest && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-md border border-gray-300 dark:border-border/50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Asset:</span>
                      <span className="text-sm">{pendingApprovalRequest.assetName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Asset ID:</span>
                      <span className="text-sm">{pendingApprovalRequest.assetId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Requested By:</span>
                      <span className="text-sm">{pendingApprovalRequest.requestedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Reason:</span>
                      <span className="text-sm">{pendingApprovalRequest.reason}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Disposal Method:</span>
                      <span className="text-sm">{pendingApprovalRequest.suggestedMethod || "Recycle (Default)"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• The asset will be marked as approved for disposal</p>
                  <p>• The asset can then be marked as disposed when physically removed</p>
                  <p>• This approval will be logged in the audit trail</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApprovalConfirmOpen(false)
                setPendingApprovalRequest(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmApproval} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
