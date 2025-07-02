"use client"

import { useState, useMemo, useCallback } from "react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  AlertTriangle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { useAssets } from "@/components/asset-provider"

// Maintenance types
const maintenanceTypes = ["All", "Preventive", "Corrective", "Inspection", "Emergency"]

// Maintenance statuses
const maintenanceStatuses = ["All", "Scheduled", "In Progress", "Completed", "Overdue", "Cancelled"]

export default function MaintenancePage() {
  const { user } = useAuth()
  const {
    assets,
    assignments,
    maintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getOverdueMaintenanceRecords,
    getUpcomingMaintenanceRecords,
    updateAsset,
  } = useAssets()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("All")
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [isScheduleMaintenanceOpen, setIsScheduleMaintenanceOpen] = useState(false)
  const [isUpdateMaintenanceOpen, setIsUpdateMaintenanceOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any | null>(null)
  const [isViewMaintenanceOpen, setIsViewMaintenanceOpen] = useState(false)
  const [isRescheduleMaintenanceOpen, setIsRescheduleMaintenanceOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [assetSearchTerm, setAssetSearchTerm] = useState("")
  const [assetCategoryFilter, setAssetCategoryFilter] = useState("All")
  const [assetStatusFilter, setAssetStatusFilter] = useState("All")
  const [maintenanceType, setMaintenanceType] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [maintenanceDescription, setMaintenanceDescription] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [maintenanceNotes, setMaintenanceNotes] = useState("")
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(new Date())
  const [forceUpdate, setForceUpdate] = useState(0) // Add force update state

  // Filter assets for maintenance scheduling
  const filteredAssetsForMaintenance = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(assetSearchTerm.toLowerCase()))

    const matchesCategory = assetCategoryFilter === "All" || asset.category === assetCategoryFilter
    const matchesStatus = assetStatusFilter === "All" || asset.status === assetStatusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Use actual maintenance records instead of generating mock data
  const filteredRecords = useMemo(() => {
    console.log("🔄 Recalculating filtered records, total records:", maintenanceRecords.length)
    const filtered = maintenanceRecords.filter((record) => {
      const matchesSearch =
        record.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.description && record.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = selectedType === "All" || record.maintenanceType === selectedType
      const matchesStatus = selectedStatus === "All" || record.status === selectedStatus

      return matchesSearch && matchesType && matchesStatus
    })
    console.log(
      "✅ Filtered records:",
      filtered.length,
      filtered.map((r) => `${r.assetId}: ${r.status}`),
    )
    return filtered
  }, [maintenanceRecords, searchTerm, selectedType, selectedStatus, forceUpdate])

  // Get upcoming and overdue maintenance
  const upcomingMaintenance = getUpcomingMaintenanceRecords()
  const overdueMaintenance = getOverdueMaintenanceRecords()

  // Check if an asset already has scheduled maintenance
  const hasScheduledMaintenance = (assetId: string) => {
    return maintenanceRecords.some(
      (record) => record.assetId === assetId && (record.status === "Scheduled" || record.status === "In Progress"),
    )
  }

  const handleViewMaintenance = (record: (typeof maintenanceRecords)[0]) => {
    setSelectedMaintenance(record)
    setIsViewMaintenanceOpen(true)
  }

  const handleUpdateMaintenance = (record: (typeof maintenanceRecords)[0]) => {
    setSelectedMaintenance(record)
    setIsUpdateMaintenanceOpen(true)
  }

  const handleRescheduleMaintenance = (record: (typeof maintenanceRecords)[0]) => {
    setSelectedMaintenance(record)
    setRescheduleDate(new Date(record.scheduledDate))
    setIsRescheduleMaintenanceOpen(true)
  }

  const handleMarkAsCompleted = useCallback(
    (record: (typeof maintenanceRecords)[0]) => {
      console.log("🔄 Marking as completed:", record.id, record.assetName, "Current status:", record.status)

      // Update maintenance record
      updateMaintenanceRecord(record.id, {
        status: "Completed",
        completedDate: new Date().toISOString().split("T")[0],
      })

      // Update asset status to "In Use" when maintenance is completed
      updateAsset(record.assetId, {
        status: "In Use",
      })

      // Force a re-render
      setForceUpdate((prev) => prev + 1)

      toast({
        title: "Maintenance Completed",
        description: `Maintenance for ${record.assetName} has been marked as completed.`,
      })

      console.log("✅ Completed marking as completed for:", record.id)
    },
    [updateMaintenanceRecord, updateAsset],
  )

  const handleScheduleMaintenance = () => {
    if (!selectedAsset) return

    // Check if the asset already has scheduled maintenance
    if (hasScheduledMaintenance(selectedAsset.id)) {
      toast({
        title: "Maintenance Already Scheduled",
        description:
          "This asset already has scheduled or in-progress maintenance. Please complete or cancel the existing maintenance first.",
        variant: "destructive",
      })
      return
    }

    const newMaintenanceRecord = {
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      maintenanceType: maintenanceType as "Preventive" | "Corrective" | "Inspection" | "Emergency",
      status: "Scheduled" as const,
      scheduledDate: date ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      assignedTo: assignedTo,
      description: maintenanceDescription,
      cost: estimatedCost ? Number.parseFloat(estimatedCost) : undefined,
      notes: maintenanceNotes || undefined,
    }

    addMaintenanceRecord(newMaintenanceRecord)

    // Update asset status to "In Maintenance" when scheduling maintenance
    updateAsset(selectedAsset.id, {
      status: "In Maintenance",
    })

    // Reset form
    setSelectedAsset(null)
    setAssetSearchTerm("")
    setAssetCategoryFilter("All")
    setAssetStatusFilter("All")
    setMaintenanceType("")
    setAssignedTo("")
    setMaintenanceDescription("")
    setEstimatedCost("")
    setMaintenanceNotes("")
    setCurrentStep(0)

    toast({
      title: "Maintenance Scheduled",
      description: "The maintenance task has been scheduled successfully.",
    })
    setIsScheduleMaintenanceOpen(false)
  }

  const handleUpdateMaintenanceStatus = () => {
    if (selectedMaintenance) {
      updateMaintenanceRecord(selectedMaintenance.id, {
        status: selectedMaintenance.status,
        notes: selectedMaintenance.notes,
      })

      // Update asset status based on maintenance status
      const newStatus =
        selectedMaintenance.status === "Completed"
          ? "In Use"
          : selectedMaintenance.status === "In Progress"
            ? "In Maintenance"
            : selectedMaintenance.status === "Cancelled"
              ? "In Use"
              : "In Maintenance"

      updateAsset(selectedMaintenance.assetId, {
        status: newStatus,
      })

      // Force a re-render
      setForceUpdate((prev) => prev + 1)

      toast({
        title: "Maintenance Updated",
        description: "The maintenance record has been updated successfully.",
      })
      setIsUpdateMaintenanceOpen(false)
    }
  }

  const handleSaveReschedule = () => {
    if (selectedMaintenance && rescheduleDate) {
      updateMaintenanceRecord(selectedMaintenance.id, {
        scheduledDate: rescheduleDate.toISOString().split("T")[0],
      })

      toast({
        title: "Maintenance Rescheduled",
        description: `Maintenance for ${selectedMaintenance.assetName} has been rescheduled to ${format(rescheduleDate, "PPP")}.`,
      })
      setIsRescheduleMaintenanceOpen(false)
    }
  }

  const handleCloseMaintenanceDialog = () => {
    setIsScheduleMaintenanceOpen(false)
    setCurrentStep(0)
    setSelectedAsset(null)
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  // Wizard steps validation
  const canProceedToStep2 = selectedAsset !== null
  const canProceedToStep3 = maintenanceType !== "" && assignedTo !== "" && date !== undefined
  const canFinish = maintenanceDescription !== ""

  // Wizard step titles
  const stepTitles = ["Select Asset", "Maintenance Details", "Additional Information"]

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Management</h1>
          <Button onClick={() => setIsScheduleMaintenanceOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Maintenance
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Maintenance</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Maintenance Records</CardTitle>
                <CardDescription>View and manage all maintenance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search maintenance records..."
                        className="pl-8 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {maintenanceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {maintenanceStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-md border border-gray-300 dark:border-border/50">
                    <Table key={forceUpdate}>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox />
                          </TableHead>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Scheduled Date</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No maintenance records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRecords.map((record) => (
                            <TableRow key={`${record.id}-${record.status}-${forceUpdate}`}>
                              <TableCell>
                                <Checkbox />
                              </TableCell>
                              <TableCell className="font-medium">{record.assetId}</TableCell>
                              <TableCell>{record.assetName}</TableCell>
                              <TableCell>{record.maintenanceType}</TableCell>
                              <TableCell>{new Date(record.scheduledDate).toLocaleDateString()}</TableCell>
                              <TableCell>{record.assignedTo}</TableCell>
                              <TableCell>
                                <Badge
                                  key={`badge-${record.id}-${record.status}-${forceUpdate}`}
                                  variant={
                                    record.status === "Completed"
                                      ? "default"
                                      : record.status === "In Progress"
                                        ? "outline"
                                        : record.status === "Overdue"
                                          ? "destructive"
                                          : "secondary"
                                  }
                                >
                                  {record.status}
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
                                    <DropdownMenuItem onClick={() => handleViewMaintenance(record)}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateMaintenance(record)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Update Status
                                    </DropdownMenuItem>
                                    {record.status !== "Completed" && record.status !== "Cancelled" && (
                                      <DropdownMenuItem onClick={() => handleRescheduleMaintenance(record)}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Reschedule
                                      </DropdownMenuItem>
                                    )}
                                    {record.status !== "Completed" && record.status !== "Cancelled" && (
                                      <DropdownMenuItem onClick={() => handleMarkAsCompleted(record)}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Mark as Completed
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
                  Showing {filteredRecords.length} of {maintenanceRecords.length} records
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

          {/* Rest of the tabs content remains the same */}
          <TabsContent value="upcoming" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>Scheduled maintenance tasks for the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingMaintenance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No upcoming maintenance tasks found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        upcomingMaintenance.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.assetId}</TableCell>
                            <TableCell>{record.assetName}</TableCell>
                            <TableCell>{record.maintenanceType}</TableCell>
                            <TableCell>{new Date(record.scheduledDate).toLocaleDateString()}</TableCell>
                            <TableCell>{record.assignedTo}</TableCell>
                            <TableCell>{record.description}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => handleRescheduleMaintenance(record)}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Reschedule
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

          <TabsContent value="overdue" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Overdue Maintenance</CardTitle>
                <CardDescription>Maintenance tasks that are past their scheduled date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Scheduled Date</TableHead>
                        <TableHead>Days Overdue</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueMaintenance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No overdue maintenance tasks.
                          </TableCell>
                        </TableRow>
                      ) : (
                        overdueMaintenance.map((record) => {
                          const scheduledDate = new Date(record.scheduledDate)
                          const today = new Date()
                          const diffTime = Math.abs(today.getTime() - scheduledDate.getTime())
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">{record.assetId}</TableCell>
                              <TableCell>{record.assetName}</TableCell>
                              <TableCell>{record.maintenanceType}</TableCell>
                              <TableCell>{scheduledDate.toLocaleDateString()}</TableCell>
                              <TableCell className="text-destructive font-medium">{diffDays} days</TableCell>
                              <TableCell>{record.assignedTo}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRescheduleMaintenance(record)}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Reschedule
                                  </Button>
                                  <Button size="sm" onClick={() => handleMarkAsCompleted(record)}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Complete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Maintenance Calendar</CardTitle>
                <CardDescription>View scheduled maintenance by date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border border-gray-300 dark:border-border/50"
                    />
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="text-lg font-medium mb-4">
                      Maintenance on {date ? format(date, "MMMM d, yyyy") : "Selected Date"}
                    </h3>
                    <div className="space-y-4">
                      {date &&
                        maintenanceRecords
                          .filter((record) => new Date(record.scheduledDate).toDateString() === date.toDateString())
                          .map((record, index) => (
                            <div
                              key={index}
                              className="rounded-md border border-gray-300 dark:border-border/50 p-4 flex items-start space-x-4"
                            >
                              <div className="mt-0.5">
                                {record.status === "Completed" ? (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : record.status === "Overdue" ? (
                                  <AlertCircle className="h-5 w-5 text-destructive" />
                                ) : (
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-medium leading-none">{record.assetName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {record.maintenanceType} - {record.assignedTo}
                                </p>
                                <p className="text-sm text-muted-foreground">{record.description}</p>
                              </div>
                              <Badge
                                variant={
                                  record.status === "Completed"
                                    ? "default"
                                    : record.status === "In Progress"
                                      ? "outline"
                                      : record.status === "Overdue"
                                        ? "destructive"
                                        : "secondary"
                                }
                              >
                                {record.status}
                              </Badge>
                            </div>
                          ))}
                      {date &&
                        maintenanceRecords.filter(
                          (record) => new Date(record.scheduledDate).toDateString() === date.toDateString(),
                        ).length === 0 && (
                          <p className="text-sm text-muted-foreground">No maintenance scheduled for this date.</p>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* All dialogs remain the same */}
        {/* Multi-step Schedule Maintenance Dialog */}
        <Dialog open={isScheduleMaintenanceOpen} onOpenChange={handleCloseMaintenanceDialog}>
          <DialogContent className="sm:max-w-[550px] border-gray-300 dark:border-border/50">
            <DialogHeader>
              <DialogTitle>
                Schedule Maintenance - Step {currentStep + 1}: {stepTitles[currentStep]}
              </DialogTitle>
              <DialogDescription>
                {currentStep === 0
                  ? "Select an asset for maintenance"
                  : currentStep === 1
                    ? "Enter maintenance details"
                    : "Add additional information"}
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Asset Selection */}
            {currentStep === 0 && (
              <div className="py-4 space-y-4">
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search assets by name, ID, or serial number..."
                      className="pl-8"
                      value={assetSearchTerm}
                      onChange={(e) => setAssetSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Select value={assetCategoryFilter} onValueChange={setAssetCategoryFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="Computer Equipment">Computer</SelectItem>
                        <SelectItem value="Office Equipment">Office</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Mobile Devices">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Asset List */}
                <div className="border border-gray-300 dark:border-border/50 rounded-md max-h-[300px] overflow-y-auto">
                  {filteredAssetsForMaintenance.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No assets found matching your criteria</div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-border/50">
                      {filteredAssetsForMaintenance.map((asset) => {
                        const alreadyHasMaintenance = hasScheduledMaintenance(asset.id)

                        return (
                          <div
                            key={asset.id}
                            className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                              selectedAsset?.id === asset.id ? "bg-muted" : ""
                            } ${alreadyHasMaintenance ? "opacity-60" : ""}`}
                            onClick={() => !alreadyHasMaintenance && setSelectedAsset(asset)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{asset.name}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {asset.id}
                                  </Badge>
                                  {alreadyHasMaintenance && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-amber-100 text-amber-800 border-amber-300"
                                    >
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Maintenance Scheduled
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {asset.category} • {asset.location || asset.department}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    variant={
                                      asset.status === "In Use"
                                        ? "default"
                                        : asset.status === "In Storage"
                                          ? "secondary"
                                          : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {asset.status}
                                  </Badge>
                                  {asset.assignedTo && (
                                    <span className="text-xs text-muted-foreground">
                                      Assigned to: {asset.assignedTo}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant={selectedAsset?.id === asset.id ? "default" : "ghost"}
                                size="sm"
                                onClick={() => !alreadyHasMaintenance && setSelectedAsset(asset)}
                                disabled={alreadyHasMaintenance}
                              >
                                {alreadyHasMaintenance
                                  ? "Unavailable"
                                  : selectedAsset?.id === asset.id
                                    ? "Selected"
                                    : "Select"}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAssetsForMaintenance.length} of {assets.length} assets
                </div>
              </div>
            )}

            {/* Step 2: Maintenance Details */}
            {currentStep === 1 && (
              <div className="py-4 space-y-4">
                {/* Selected Asset Summary */}
                {selectedAsset && (
                  <div className="rounded-md border border-gray-300 dark:border-border/50 p-3 bg-muted/50 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedAsset.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {selectedAsset.id} • {selectedAsset.category} • {selectedAsset.location}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(0)}>
                        Change
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceType">Maintenance Type</Label>
                    <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventive">Preventive</SelectItem>
                        <SelectItem value="Corrective">Corrective</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="rounded-md border border-gray-300 dark:border-border/50"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT Support">IT Support</SelectItem>
                      <SelectItem value="Facilities Team">Facilities Team</SelectItem>
                      <SelectItem value="External Vendor">External Vendor</SelectItem>
                      <SelectItem value="Security Team">Security Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 2 && (
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the maintenance task"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={maintenanceDescription}
                    onChange={(e) => setMaintenanceDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost (Optional)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    placeholder="0.00"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-between mt-4">
              <div>
                {currentStep > 0 && (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCloseMaintenanceDialog}>
                  Cancel
                </Button>
                {currentStep < 2 ? (
                  <Button
                    onClick={nextStep}
                    disabled={(currentStep === 0 && !canProceedToStep2) || (currentStep === 1 && !canProceedToStep3)}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleScheduleMaintenance} disabled={!canFinish}>
                    Schedule Maintenance
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Maintenance Dialog */}
        <Dialog open={isUpdateMaintenanceOpen} onOpenChange={setIsUpdateMaintenanceOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Maintenance</DialogTitle>
              <DialogDescription>Update the status and details of the maintenance task.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={selectedMaintenance?.status}
                  onValueChange={(value) => setSelectedMaintenance({ ...selectedMaintenance, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={selectedMaintenance?.notes || ""}
                  onChange={(e) => setSelectedMaintenance({ ...selectedMaintenance, notes: e.target.value })}
                  className="col-span-3"
                  placeholder="Add notes about the maintenance..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateMaintenanceStatus}>
                Update Maintenance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Maintenance Dialog */}
        <Dialog open={isRescheduleMaintenanceOpen} onOpenChange={setIsRescheduleMaintenanceOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reschedule Maintenance</DialogTitle>
              <DialogDescription>Select a new date for this maintenance task.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {selectedMaintenance && (
                <div className="rounded-md border border-gray-300 dark:border-border/50 p-3 bg-muted/50 mb-4">
                  <div>
                    <p className="font-medium">{selectedMaintenance.assetName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMaintenance.maintenanceType} • Currently scheduled for:{" "}
                      {new Date(selectedMaintenance.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newDate">New Scheduled Date</Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    initialFocus
                    className="rounded-md border border-gray-300 dark:border-border/50"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRescheduleMaintenanceOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveReschedule} disabled={!rescheduleDate}>
                Save New Date
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Maintenance Dialog */}
        <Dialog open={isViewMaintenanceOpen} onOpenChange={setIsViewMaintenanceOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Maintenance Details</DialogTitle>
              <DialogDescription>View detailed information about this maintenance task.</DialogDescription>
            </DialogHeader>
            {selectedMaintenance && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="font-medium">ID:</Label>
                  <span className="col-span-2">{selectedMaintenance.id}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="font-medium">Asset ID:</Label>
                  <span className="col-span-2">{selectedMaintenance.assetId}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="font-medium">Asset:</Label>
                  <span className="col-span-2">{selectedMaintenance.assetName}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="font-medium">Type:</Label>
                  <span className="col-span-2">{selectedMaintenance.maintenanceType}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="font-medium">Status:</Label>
                  <Badge
                    variant={
                      selectedMaintenance.status === "Completed"
                        ? "default"
                        : selectedMaintenance.status === "In Progress"
                          ? "outline"
                          : selectedMaintenance.status === "Overdue"
                            ? "destructive"
                            : "secondary"
                    }
                  >
                    {selectedMaintenance.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="font-medium">Scheduled Date:</Label>
                  <span className="col-span-2">{new Date(selectedMaintenance.scheduledDate).toLocaleDateString()}</span>
                </div>
                {selectedMaintenance.completedDate && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="font-medium">Completed Date:</Label>
                    <span className="col-span-2">
                      {new Date(selectedMaintenance.completedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label className="font-medium">Assigned To:</Label>
                  <span className="col-span-2">{selectedMaintenance.assignedTo}</span>
                </div>
                {selectedMaintenance.cost && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="font-medium">Cost:</Label>
                    <span className="col-span-2">${selectedMaintenance.cost.toFixed(2)}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="font-medium">Description:</Label>
                  <span className="col-span-2">{selectedMaintenance.description}</span>
                </div>
                {selectedMaintenance.notes && (
                  <div className="grid grid-cols-3 items-start gap-4">
                    <Label className="font-medium">Notes:</Label>
                    <span className="col-span-2">{selectedMaintenance.notes}</span>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewMaintenanceOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
