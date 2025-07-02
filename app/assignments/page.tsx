"use client"

import { useState } from "react"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Download, FileText, MoreHorizontal, Plus, Search, UserCheck, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { useAssets } from "@/components/asset-provider"
import type { Asset } from "@/types"

// Departments for dropdown
const departments = [
  "All Departments",
  "IT Department",
  "Finance Department",
  "Human Resources",
  "Administration",
  "Executive",
  "Security",
]

// Mock data for employees
const mockEmployees = [
  { id: "E001", name: "John Doe", department: "IT Department", position: "IT Specialist" },
  { id: "E002", name: "Jane Smith", department: "Executive", position: "CEO" },
  { id: "E003", name: "Mike Johnson", department: "Finance Department", position: "Accountant" },
  { id: "E004", name: "Sarah Williams", department: "Human Resources", position: "HR Manager" },
  { id: "E005", name: "David Brown", department: "IT Department", position: "System Administrator" },
  { id: "E006", name: "Lisa Taylor", department: "Finance Department", position: "Financial Analyst" },
  { id: "E007", name: "Robert Wilson", department: "Administration", position: "Admin Assistant" },
  { id: "E008", name: "Emily Davis", department: "Security", position: "Security Officer" },
]

// Assignment status options
const assignmentStatuses = ["All", "Active", "Pending", "In Maintenance", "Overdue"]

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Departments")
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [isAssignAssetOpen, setIsAssignAssetOpen] = useState(false)
  const [isTransferAssetOpen, setIsTransferAssetOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null)
  const [isViewAssignmentOpen, setIsViewAssignmentOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("current")

  const [selectedAssetId, setSelectedAssetId] = useState<string>("")
  const [assignType, setAssignType] = useState<string>("")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [assignmentDate, setAssignmentDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState<string>("")
  const [assignmentNotes, setAssignmentNotes] = useState<string>("")

  // Add transfer form state variables after the existing state
  const [transferType, setTransferType] = useState<string>("")
  const [transferEmployeeId, setTransferEmployeeId] = useState<string>("")
  const [transferNotes, setTransferNotes] = useState<string>("")

  const { assignments, transfers, getAvailableAssets, addAssignment, updateAsset, addTransfer, updateAssignment } =
    useAssets()

  // Get fresh available assets
  const availableAssets = getAvailableAssets()

  // Add a new state variable to track the pre-selected asset
  const [preSelectedAsset, setPreSelectedAsset] = useState<Asset | null>(null)

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter((assignment) => {
    // Add null checks for all string properties before calling toLowerCase()
    const matchesSearch =
      (assignment.assetName?.toLowerCase() || "").includes(searchTerm?.toLowerCase() || "") ||
      (assignment.assignedTo?.toLowerCase() || "").includes(searchTerm?.toLowerCase() || "") ||
      (assignment.assetId?.toLowerCase() || "").includes(searchTerm?.toLowerCase() || "") ||
      (assignment.id?.toLowerCase() || "").includes(searchTerm?.toLowerCase() || "")

    const matchesDepartment = selectedDepartment === "All Departments" || assignment.department === selectedDepartment
    const matchesStatus = selectedStatus === "All" || assignment.status === selectedStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleViewAssignment = (assignment: any) => {
    setSelectedAssignment(assignment)
    setIsViewAssignmentOpen(true)
  }

  const handleTransferAsset = (assignment: any) => {
    setSelectedAssignment(assignment)
    setIsTransferAssetOpen(true)
  }

  // Update the handleSubmitTransfer function to actually process the transfer
  const handleSubmitTransfer = () => {
    // Validation
    if (!transferType) {
      toast({
        title: "Validation Error",
        description: "Please select transfer type.",
        variant: "destructive",
      })
      return
    }

    if (transferType === "employee" && !transferEmployeeId) {
      toast({
        title: "Validation Error",
        description: "Please select an employee.",
        variant: "destructive",
      })
      return
    }

    if (!selectedAssignment) return

    // Get selected employee details
    const selectedEmployee = mockEmployees.find((emp) => emp.id === transferEmployeeId)

    // Create transfer record
    const newTransfer = {
      assetId: selectedAssignment.assetId,
      assetName: selectedAssignment.assetName,
      fromUser: selectedAssignment.assignedTo || "Unknown",
      toUser: transferType === "employee" ? selectedEmployee?.name || "Unknown" : transferType,
      fromDepartment: selectedAssignment.department || "Unknown",
      toDepartment: transferType === "employee" ? selectedEmployee?.department || "Unknown" : transferType,
      transferDate: new Date().toISOString().split("T")[0],
      approvedBy: user?.name || "System",
      status: "Completed" as const,
    }

    // Add transfer record
    addTransfer(newTransfer)

    // Update the assignment
    updateAssignment(selectedAssignment.id, {
      assignedTo: newTransfer.toUser,
      department: newTransfer.toDepartment,
      notes: transferNotes || selectedAssignment.notes,
    })

    // Update the asset
    updateAsset(selectedAssignment.assetId, {
      assignedTo: newTransfer.toUser,
      department: newTransfer.toDepartment,
    })

    // Reset form
    setTransferType("")
    setTransferEmployeeId("")
    setTransferNotes("")

    toast({
      title: "Transfer Completed",
      description: `${selectedAssignment.assetName} has been transferred to ${newTransfer.toUser}.`,
    })

    setIsTransferAssetOpen(false)
    setSelectedAssignment(null)
  }

  // Update the dialog close handler to reset form
  const handleTransferDialogClose = (open: boolean) => {
    setIsTransferAssetOpen(open)
    if (!open) {
      setTransferType("")
      setTransferEmployeeId("")
      setTransferNotes("")
      setSelectedAssignment(null)
    }
  }

  const handleSubmitAssignment = () => {
    // Validation
    if (!selectedAssetId) {
      toast({
        title: "Validation Error",
        description: "Please select an asset to assign.",
        variant: "destructive",
      })
      return
    }

    if (!assignType) {
      toast({
        title: "Validation Error",
        description: "Please select assignment type.",
        variant: "destructive",
      })
      return
    }

    if (
      (assignType === "employee" && !selectedEmployeeId) ||
      (assignType === "department" && !selectedEmployeeId) ||
      (assignType === "location" && !selectedEmployeeId)
    ) {
      toast({
        title: "Validation Error",
        description: `Please select ${assignType === "employee" ? "an employee" : assignType === "department" ? "a department" : "a location"}.`,
        variant: "destructive",
      })
      return
    }

    if (!assignmentDate) {
      toast({
        title: "Validation Error",
        description: "Please select assignment date.",
        variant: "destructive",
      })
      return
    }

    // Get selected asset and employee details
    const selectedAsset = availableAssets.find((asset) => asset.id === selectedAssetId)
    const selectedEmployee = mockEmployees.find((emp) => emp.id === selectedEmployeeId)

    if (!selectedAsset) {
      toast({
        title: "Error",
        description: "Selected asset not found.",
        variant: "destructive",
      })
      return
    }

    // Determine assignment details
    const assignedTo =
      assignType === "employee"
        ? selectedEmployee?.name || "Unknown"
        : assignType === "department"
          ? selectedEmployeeId // This will be the department name
          : selectedEmployeeId // This will be the location name

    const assignedDepartment =
      assignType === "employee"
        ? selectedEmployee?.department || "Unknown"
        : assignType === "department"
          ? selectedEmployeeId // Department name
          : "Facilities" // Default department for locations

    // Create new assignment
    const newAssignment = {
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      assignedTo: assignedTo,
      department: assignedDepartment,
      assignedDate: assignmentDate,
      dueDate: dueDate || null,
      status: "Active" as const,
      notes: assignmentNotes || "",
    }

    // Add assignment
    addAssignment(newAssignment)

    // Create transfer record for the assignment
    const newTransfer = {
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      fromUser: selectedAsset.assignedTo || "Storage",
      toUser: assignedTo,
      fromDepartment: selectedAsset.department || "Unknown",
      toDepartment: assignedDepartment,
      transferDate: assignmentDate,
      approvedBy: user?.name || "System",
      status: "Completed" as const,
    }

    // Add transfer record
    addTransfer(newTransfer)

    // Update asset status to "In Use" and assign to user
    updateAsset(selectedAsset.id, {
      status: "In Use",
      assignedTo: assignedTo,
      department: assignedDepartment,
    })

    // Reset form
    setSelectedAssetId("")
    setAssignType("")
    setSelectedEmployeeId("")
    setAssignmentDate(new Date().toISOString().split("T")[0])
    setDueDate("")
    setAssignmentNotes("")
    setPreSelectedAsset(null)

    toast({
      title: "Asset Assigned Successfully",
      description: `${selectedAsset.name} has been assigned to ${assignedTo} and transfer record created.`,
    })

    setIsAssignAssetOpen(false)
  }

  // Update the handleAssignAsset function in the Available Assets tab to pre-select the asset
  const handleAssignAsset = (asset: Asset) => {
    setPreSelectedAsset(asset)
    setSelectedAssetId(asset.id)
    setIsAssignAssetOpen(true)
  }

  // Update the dialog close handler to reset the pre-selected asset
  const handleAssignDialogClose = (open: boolean) => {
    setIsAssignAssetOpen(open)
    if (!open) {
      setSelectedAssetId("")
      setAssignType("")
      setSelectedEmployeeId("")
      setAssignmentDate(new Date().toISOString().split("T")[0])
      setDueDate("")
      setAssignmentNotes("")
      setPreSelectedAsset(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Asset Assignments & Transfers</h1>
          <Button
            onClick={() => {
              setPreSelectedAsset(null)
              setIsAssignAssetOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Assign Asset
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Current Assignments</TabsTrigger>
            <TabsTrigger value="history">Transfer History</TabsTrigger>
            <TabsTrigger value="available">Available Assets ({availableAssets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Current Asset Assignments</CardTitle>
                <CardDescription>View and manage all asset assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search assignments..."
                        className="pl-8 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignmentStatuses.map((status) => (
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
                          <TableHead className="w-[100px]">Asset ID</TableHead>
                          <TableHead>Asset Name</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssignments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No assignments found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                <Checkbox />
                              </TableCell>
                              <TableCell className="font-medium">{assignment.assetId}</TableCell>
                              <TableCell>{assignment.assetName}</TableCell>
                              <TableCell>{assignment.assignedTo}</TableCell>
                              <TableCell>{assignment.department}</TableCell>
                              <TableCell>
                                {assignment.assignedDate
                                  ? new Date(assignment.assignedDate).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    assignment.status === "Active"
                                      ? "default"
                                      : assignment.status === "In Maintenance"
                                        ? "secondary"
                                        : assignment.status === "Overdue"
                                          ? "destructive"
                                          : "secondary"
                                  }
                                >
                                  {assignment.status}
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
                                    <DropdownMenuItem onClick={() => handleViewAssignment(assignment)}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleTransferAsset(assignment)}>
                                      <Users className="mr-2 h-4 w-4" />
                                      Transfer Asset
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Mark as Returned
                                    </DropdownMenuItem>
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
                  Showing {filteredAssignments.length} of {assignments.length} assignments
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

          <TabsContent value="history" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
                <CardDescription>History of all asset transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Asset ID</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transfers && transfers.length > 0 ? (
                        transfers
                          .sort(
                            (a, b) =>
                              new Date(b.transferDate || "").getTime() - new Date(a.transferDate || "").getTime(),
                          )
                          .map((transfer) => (
                            <TableRow key={transfer.id}>
                              <TableCell className="font-medium">{transfer.assetId}</TableCell>
                              <TableCell>{transfer.assetName}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{transfer.fromUser}</span>
                                  <span className="text-xs text-muted-foreground">{transfer.fromDepartment}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{transfer.toUser}</span>
                                  <span className="text-xs text-muted-foreground">{transfer.toDepartment}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>{transfer.approvedBy}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{transfer.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View Details</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No transfer history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {transfers ? transfers.length : 0} transfers
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

          <TabsContent value="available" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Available Assets</CardTitle>
                <CardDescription>Assets available for assignment ({availableAssets.length} available)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Asset Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableAssets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No available assets found. All assets are currently assigned or in maintenance.
                          </TableCell>
                        </TableRow>
                      ) : (
                        availableAssets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.id}</TableCell>
                            <TableCell>{asset.name}</TableCell>
                            <TableCell>{asset.category}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{asset.status}</Badge>
                            </TableCell>
                            <TableCell>{asset.location}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => handleAssignAsset(asset)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Assign
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

      {/* Assign Asset Dialog */}
      <Dialog open={isAssignAssetOpen} onOpenChange={handleAssignDialogClose}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
            <DialogDescription>Assign an asset to an employee or location.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assetSelect">Select Asset</Label>
              {preSelectedAsset ? (
                <div className="rounded-md border border-gray-300 dark:border-border/50 p-3 bg-gray-100 dark:bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{preSelectedAsset.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({preSelectedAsset.id})</span>
                    </div>
                    <Badge variant="secondary">{preSelectedAsset.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {preSelectedAsset.category} • {preSelectedAsset.location}
                  </div>
                </div>
              ) : (
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.id}) - {asset.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignType">Assign To</Label>
              <Select value={assignType} onValueChange={setAssignType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignTo">
                {assignType === "employee"
                  ? "Select Employee"
                  : assignType === "department"
                    ? "Select Department"
                    : "Select Location"}
              </Label>
              <Select
                value={
                  assignType === "employee"
                    ? selectedEmployeeId
                    : assignType === "department"
                      ? selectedEmployeeId
                      : selectedEmployeeId
                }
                onValueChange={setSelectedEmployeeId}
                disabled={!assignType}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !assignType
                        ? "Select assignment type first"
                        : assignType === "employee"
                          ? "Select employee"
                          : assignType === "department"
                            ? "Select department"
                            : "Select location"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {assignType === "employee" &&
                    mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </SelectItem>
                    ))}
                  {assignType === "department" &&
                    [
                      "IT Department",
                      "Finance Department",
                      "Human Resources",
                      "Administration",
                      "Executive",
                      "Security",
                    ].map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  {assignType === "location" &&
                    [
                      "Meeting Room A",
                      "Meeting Room B",
                      "Conference Room",
                      "Reception Area",
                      "Storage Room A",
                      "Storage Room B",
                      "Pantry",
                      "Server Room",
                    ].map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignDate">Assignment Date</Label>
                <Input
                  id="assignDate"
                  type="date"
                  value={assignmentDate}
                  onChange={(e) => setAssignmentDate(e.target.value)}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignmentNotes">Notes</Label>
              <Textarea
                id="assignmentNotes"
                placeholder="Additional information about this assignment"
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleAssignDialogClose(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmitAssignment}>
              Assign Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Asset Dialog */}
      {selectedAssignment && (
        <Dialog open={isTransferAssetOpen} onOpenChange={handleTransferDialogClose}>
          <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
            <DialogHeader>
              <DialogTitle>Transfer Asset</DialogTitle>
              <DialogDescription>
                Transfer {selectedAssignment.assetName} to another user or location.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Current Assignment</Label>
                <div className="rounded-md border border-gray-300 dark:border-border/50 p-3 bg-gray-100 dark:bg-muted/50">
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{selectedAssignment.assetName}</span>
                      <Badge variant="outline">{selectedAssignment.status}</Badge>
                    </div>
                    <div className="text-sm">
                      Currently assigned to: <span className="font-medium">{selectedAssignment.assignedTo}</span>
                    </div>
                    <div className="text-sm">
                      Department: <span className="font-medium">{selectedAssignment.department}</span>
                    </div>
                    <div className="text-sm">
                      Since:{" "}
                      <span className="font-medium">
                        {selectedAssignment.assignedDate
                          ? new Date(selectedAssignment.assignedDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferType">Transfer To</Label>
                <Select value={transferType} onValueChange={setTransferType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferTo">Select Employee</Label>
                <Select
                  value={transferEmployeeId}
                  onValueChange={setTransferEmployeeId}
                  disabled={transferType !== "employee"}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={transferType === "employee" ? "Select employee" : "Select transfer type first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferNotes">Notes</Label>
                <Textarea
                  id="transferNotes"
                  placeholder="Additional notes about this transfer"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleTransferDialogClose(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleSubmitTransfer}>
                Request Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Assignment Dialog */}
      {selectedAssignment && (
        <Dialog open={isViewAssignmentOpen} onOpenChange={setIsViewAssignmentOpen}>
          <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
            <DialogHeader>
              <DialogTitle>Assignment Details</DialogTitle>
              <DialogDescription>View details of the selected asset assignment.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Asset Information</Label>
                <div className="rounded-md border border-gray-300 dark:border-border/50 p-3 bg-gray-100 dark:bg-muted/50">
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{selectedAssignment.assetName}</span>
                      <Badge variant="outline">{selectedAssignment.status}</Badge>
                    </div>
                    <div className="text-sm">
                      Asset ID: <span className="font-medium">{selectedAssignment.assetId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assignment Details</Label>
                <div className="rounded-md border border-gray-300 dark:border-border/50 p-3 bg-gray-100 dark:bg-muted/50">
                  <div className="flex flex-col space-y-1">
                    <div className="text-sm">
                      Assigned To: <span className="font-medium">{selectedAssignment.assignedTo}</span>
                    </div>
                    <div className="text-sm">
                      Department: <span className="font-medium">{selectedAssignment.department}</span>
                    </div>
                    <div className="text-sm">
                      Assigned Date:{" "}
                      <span className="font-medium">
                        {selectedAssignment.assignedDate
                          ? new Date(selectedAssignment.assignedDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    {selectedAssignment.dueDate && (
                      <div className="text-sm">
                        Due Date:{" "}
                        <span className="font-medium">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      Notes: <span className="font-medium">{selectedAssignment.notes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAssignmentOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  )
}
