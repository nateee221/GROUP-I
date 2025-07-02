"use client"

import type React from "react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Download, Edit, FileText, MoreHorizontal, Plus, QrCode, Search, Trash2, Upload } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"
import QRCode from "qrcode"
import { useAssets } from "@/components/asset-provider"
import { useLanguage } from "@/components/language-provider"
import type { Asset } from "@/components/asset-provider"

// Asset categories for dropdown
const assetCategories = [
  "Computer Equipment",
  "Office Equipment",
  "Furniture",
  "Audio/Visual Equipment",
  "Mobile Devices",
  "Appliances",
  "Security Equipment",
  "HVAC Equipment",
  "Vehicles",
  "Other",
]

// Departments for dropdown
const departments = [
  "IT Department",
  "Finance Department",
  "Human Resources",
  "Administration",
  "Executive",
  "Records",
  "Facilities",
  "Security",
  "Common Areas",
]

// Asset statuses for dropdown
const assetStatuses = ["In Use", "In Storage", "In Maintenance", "Pending Assignment", "Pending Disposal"]

export default function AssetsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const { assets, addAsset, updateAsset } = useAssets()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("all")
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>("all")
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>("all")
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null)
  const [isViewAssetOpen, setIsViewAssetOpen] = useState(false)
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "",
    serialNumber: "",
    status: "",
    department: "",
    assignedTo: "",
    location: "",
    notes: "",
  })
  const [editAsset, setEditAsset] = useState({
    id: "",
    name: "",
    category: "",
    serialNumber: "",
    status: "",
    department: "",
    assignedTo: "",
    location: "",
    notes: "",
  })

  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [qrCodeData, setQRCodeData] = useState("")

  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
  const [statusUpdateAsset, setStatusUpdateAsset] = useState<any | null>(null)
  const [newStatus, setNewStatus] = useState("")

  // Import related states
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importSuccess, setImportSuccess] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter assets based on search and filters
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus
    const matchesDepartment = selectedDepartment === "all" || asset.department === selectedDepartment

    return matchesSearch && matchesCategory && matchesStatus && matchesDepartment
  })

  const handleViewAsset = (asset: any) => {
    setSelectedAsset(asset)
    setIsViewAssetOpen(true)
  }

  const handleEditAsset = (asset: any) => {
    setSelectedAsset(asset)
    setEditAsset({ ...asset })
    setIsEditAssetOpen(true)
  }

  const handleAddAsset = () => {
    addAsset({
      ...newAsset,
      purchaseDate: "",
      purchasePrice: 0,
      warrantyExpiry: "",
    })
    setIsAddAssetOpen(false)
    toast({
      title: "Asset Added",
      description: `${newAsset.name} has been added successfully.`,
    })

    // Reset the form
    setNewAsset({
      name: "",
      category: "",
      serialNumber: "",
      status: "",
      department: "",
      assignedTo: "",
      location: "",
      notes: "",
    })
  }

  const handleUpdateAsset = () => {
    updateAsset(editAsset.id, editAsset)
    setIsEditAssetOpen(false)
    toast({
      title: "Asset Updated",
      description: `${editAsset.name} has been updated successfully.`,
    })
  }

  const handleUpdateStatus = (asset: any) => {
    setStatusUpdateAsset(asset)
    setNewStatus(asset.status)
    setIsUpdateStatusOpen(true)
  }

  const handleConfirmStatusUpdate = () => {
    if (statusUpdateAsset && newStatus) {
      updateAsset(statusUpdateAsset.id, { ...statusUpdateAsset, status: newStatus })
      setIsUpdateStatusOpen(false)
      toast({
        title: "Status Updated",
        description: `${statusUpdateAsset.name} status changed to ${newStatus}.`,
      })
      setStatusUpdateAsset(null)
      setNewStatus("")
    }
  }

  const handleGenerateQRCode = async (asset: any) => {
    try {
      // Create a direct URL instead of JSON object
      const assetUrl = `${window.location.origin}/assets/${asset.id}`

      const qrCodeDataURL = await QRCode.toDataURL(assetUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      setQRCodeData(qrCodeDataURL)
      setSelectedAsset(asset)
      setIsQRCodeOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    }
  }

  // Export assets to CSV
  const handleExport = () => {
    try {
      // Determine which assets to export (filtered or all)
      const assetsToExport = filteredAssets.length > 0 ? filteredAssets : assets

      // Create CSV header
      const headers = [
        "ID",
        "Name",
        "Category",
        "Status",
        "Department",
        "Assigned To",
        "Serial Number",
        "Location",
        "Notes",
        "Purchase Date",
        "Purchase Price",
      ]

      // Convert assets to CSV rows
      const csvRows = [
        headers.join(","), // Header row
        ...assetsToExport.map((asset) =>
          [
            asset.id,
            `"${asset.name.replace(/"/g, '""')}"`, // Escape quotes in CSV
            `"${asset.category.replace(/"/g, '""')}"`,
            `"${asset.status.replace(/"/g, '""')}"`,
            `"${asset.department.replace(/"/g, '""')}"`,
            `"${asset.assignedTo?.replace(/"/g, '""') || ""}"`,
            `"${asset.serialNumber?.replace(/"/g, '""') || ""}"`,
            `"${asset.location?.replace(/"/g, '""') || ""}"`,
            `"${asset.notes?.replace(/"/g, '""') || ""}"`,
            asset.purchaseDate || "",
            asset.purchasePrice || 0,
          ].join(","),
        ),
      ]

      // Create CSV content
      const csvContent = csvRows.join("\n")

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      // Set up download attributes
      link.setAttribute("href", url)
      link.setAttribute("download", `assets_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      // Append to document, click and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Exported ${assetsToExport.length} assets to CSV file.`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the assets.",
        variant: "destructive",
      })
    }
  }

  // Import assets from CSV
  const handleImport = () => {
    setIsImportDialogOpen(true)
    setImportErrors([])
    setImportSuccess(0)
    setImportFile(null)
    setImportResults(null)
  }

  const downloadTemplate = () => {
    const headers = ["Name", "Category", "Status", "Department", "Assigned To", "Serial Number", "Location", "Notes"]

    const sampleData = [
      "Sample Asset",
      "Computer Equipment",
      "In Use",
      "IT Department",
      "John Doe",
      "SN12345678",
      "Building A, Floor 3",
      "Sample notes about this asset",
    ]

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "assets_import_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to help you format your import file.",
    })
  }

  const processImportFile = () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rows = text.split("\n")

        // Extract headers (first row)
        const headers = rows[0].split(",").map((header) => header.trim())

        // Required fields
        const requiredFields = ["Name", "Category", "Status", "Department"]
        const requiredIndexes = requiredFields.map((field) => {
          const index = headers.findIndex((h) => h.toLowerCase() === field.toLowerCase())
          if (index === -1) {
            throw new Error(`Required column '${field}' not found in CSV file`)
          }
          return index
        })

        // Map header indexes
        const nameIndex = headers.findIndex((h) => h.toLowerCase() === "name")
        const categoryIndex = headers.findIndex((h) => h.toLowerCase() === "category")
        const statusIndex = headers.findIndex((h) => h.toLowerCase() === "status")
        const departmentIndex = headers.findIndex((h) => h.toLowerCase() === "department")
        const assignedToIndex = headers.findIndex((h) => h.toLowerCase() === "assigned to")
        const serialNumberIndex = headers.findIndex((h) => h.toLowerCase() === "serial number")
        const locationIndex = headers.findIndex((h) => h.toLowerCase() === "location")
        const notesIndex = headers.findIndex((h) => h.toLowerCase() === "notes")

        // Process data rows
        const errors: string[] = []
        let successCount = 0

        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue // Skip empty rows

          try {
            // Parse CSV row (handling quoted values)
            const values = parseCSVRow(rows[i])

            // Validate required fields
            if (!values[nameIndex]?.trim()) {
              errors.push(`Row ${i}: Missing name`)
              continue
            }

            if (!values[categoryIndex]?.trim() || !assetCategories.includes(values[categoryIndex].trim())) {
              errors.push(`Row ${i}: Invalid category '${values[categoryIndex] || ""}'`)
              continue
            }

            if (!values[statusIndex]?.trim() || !assetStatuses.includes(values[statusIndex].trim())) {
              errors.push(`Row ${i}: Invalid status '${values[statusIndex] || ""}'`)
              continue
            }

            if (!values[departmentIndex]?.trim() || !departments.includes(values[departmentIndex].trim())) {
              errors.push(`Row ${i}: Invalid department '${values[departmentIndex] || ""}'`)
              continue
            }

            // Create new asset
            const newAsset = {
              name: values[nameIndex].trim(),
              category: values[categoryIndex].trim(),
              status: values[statusIndex].trim() as Asset["status"],
              department: values[departmentIndex].trim(),
              assignedTo: assignedToIndex >= 0 && values[assignedToIndex] ? values[assignedToIndex].trim() : "",
              serialNumber: serialNumberIndex >= 0 && values[serialNumberIndex] ? values[serialNumberIndex].trim() : "",
              location: locationIndex >= 0 && values[locationIndex] ? values[locationIndex].trim() : "",
              notes: notesIndex >= 0 && values[notesIndex] ? values[notesIndex].trim() : "",
              purchaseDate: "",
              purchasePrice: 0,
            }

            // Add asset
            addAsset(newAsset)
            successCount++
          } catch (rowError) {
            errors.push(`Row ${i}: ${(rowError as Error).message || "Invalid data"}`)
          }
        }

        // Update state with results
        setImportResults({ success: successCount, errors })

        // Show toast with results
        if (successCount > 0) {
          toast({
            title: "Import Successful",
            description: `Successfully imported ${successCount} assets${errors.length > 0 ? ` with ${errors.length} errors` : ""}.`,
          })
        } else if (errors.length > 0) {
          toast({
            title: "Import Failed",
            description: `Failed to import assets. ${errors.length} errors found.`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Import error:", error)
        setImportResults({ success: 0, errors: [`File processing error: ${(error as Error).message}`] })
        toast({
          title: "Import Failed",
          description: "There was an error processing the import file.",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      setImportResults({ success: 0, errors: ["Failed to read the file"] })
      toast({
        title: "Import Failed",
        description: "Failed to read the import file.",
        variant: "destructive",
      })
    }

    reader.readAsText(importFile)
  }

  // Helper function to parse CSV row handling quoted values
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = []
    let inQuotes = false
    let currentValue = ""

    for (let i = 0; i < row.length; i++) {
      const char = row[i]

      if (char === '"') {
        // Handle escaped quotes (two double quotes in a row)
        if (i + 1 < row.length && row[i + 1] === '"') {
          currentValue += '"'
          i++ // Skip the next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        result.push(currentValue)
        currentValue = ""
      } else {
        // Add character to current field
        currentValue += char
      }
    }

    // Add the last field
    result.push(currentValue)
    return result
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        processImportFile(file)
      } else {
        setImportErrors(["Please upload a CSV file"])
        toast({
          title: "Invalid File",
          description: "Please upload a CSV file.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Asset Management</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button onClick={() => setIsAddAssetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Asset
            </Button>
          </div>
        </div>

        <Card className="border-gray-300 dark:border-border/50">
          <CardHeader>
            <CardTitle>Asset Inventory</CardTitle>
            <CardDescription>Manage and track all organizational assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search assets..."
                    className="pl-8 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {assetCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {assetStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
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
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No assets found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium">{asset.id}</TableCell>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                asset.status === "In Use"
                                  ? "default"
                                  : asset.status === "In Maintenance"
                                    ? "outline"
                                    : asset.status === "Pending Disposal"
                                      ? "destructive"
                                      : "secondary"
                              }
                            >
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.department}</TableCell>
                          <TableCell>{asset.assignedTo}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleViewAsset(asset)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Asset
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(asset)}>
                                  <Badge className="mr-2 h-4 w-4" />
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGenerateQRCode(asset)}>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  Generate QR Code
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/disposal")}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Request Disposal
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
              Showing {filteredAssets.length} of {assets.length} assets
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Add Asset Dialog */}
      <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Enter the details of the new asset to add it to the inventory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetName">Asset Name</Label>
                <Input
                  id="assetName"
                  placeholder="Enter asset name"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  placeholder="Enter serial number"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setNewAsset({ ...newAsset, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setNewAsset({ ...newAsset, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select onValueChange={(value) => setNewAsset({ ...newAsset, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="Enter person or location"
                  value={newAsset.assignedTo}
                  onChange={(e) => setNewAsset({ ...newAsset, assignedTo: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Building A, Floor 3"
                value={newAsset.location}
                onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information"
                value={newAsset.notes}
                onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddAsset}>
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditAssetOpen} onOpenChange={setIsEditAssetOpen}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update the details of this asset.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editAssetName">Asset Name</Label>
                <Input
                  id="editAssetName"
                  placeholder="Enter asset name"
                  value={editAsset.name}
                  onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSerialNumber">Serial Number</Label>
                <Input
                  id="editSerialNumber"
                  placeholder="Enter serial number"
                  value={editAsset.serialNumber}
                  onChange={(e) => setEditAsset({ ...editAsset, serialNumber: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={editAsset.category}
                  onValueChange={(value) => setEditAsset({ ...editAsset, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editAsset.status}
                  onValueChange={(value) => setEditAsset({ ...editAsset, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDepartment">Department</Label>
                <Select
                  value={editAsset.department}
                  onValueChange={(value) => setEditAsset({ ...editAsset, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAssignedTo">Assigned To</Label>
                <Input
                  id="editAssignedTo"
                  placeholder="Enter person or location"
                  value={editAsset.assignedTo}
                  onChange={(e) => setEditAsset({ ...editAsset, assignedTo: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                placeholder="e.g., Building A, Floor 3"
                value={editAsset.location}
                onChange={(e) => setEditAsset({ ...editAsset, location: e.target.value })}
                className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                placeholder="Additional information"
                value={editAsset.notes}
                onChange={(e) => setEditAsset({ ...editAsset, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAssetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateAsset}>
              Update Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Asset Dialog */}
      {selectedAsset && (
        <Dialog open={isViewAssetOpen} onOpenChange={setIsViewAssetOpen}>
          <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
            <DialogHeader>
              <DialogTitle>Asset Details</DialogTitle>
              <DialogDescription>Detailed information about the selected asset.</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedAsset.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {selectedAsset.id}</p>
                  </div>
                  <Badge
                    variant={
                      selectedAsset.status === "In Use"
                        ? "default"
                        : selectedAsset.status === "In Maintenance"
                          ? "outline"
                          : selectedAsset.status === "Pending Disposal"
                            ? "destructive"
                            : "secondary"
                    }
                  >
                    {selectedAsset.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p>{selectedAsset.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Serial Number</p>
                    <p>{selectedAsset.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p>{selectedAsset.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    <p>{selectedAsset.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p>{selectedAsset.location}</p>
                  </div>
                  {selectedAsset.notes && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Notes</p>
                      <p>{selectedAsset.notes}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Asset History</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <p className="font-medium">Asset Created</p>
                        <p className="text-sm text-muted-foreground">Initial registration in the system</p>
                      </div>
                      <p className="text-sm">
                        {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded-md">
                      <div>
                        <p className="font-medium">Assigned to {selectedAsset.assignedTo}</p>
                        <p className="text-sm text-muted-foreground">Asset assignment</p>
                      </div>
                      <p className="text-sm">
                        {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    {selectedAsset.status === "In Maintenance" && (
                      <div className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <p className="font-medium">Sent for Maintenance</p>
                          <p className="text-sm text-muted-foreground">Regular maintenance check</p>
                        </div>
                        <p className="text-sm">{new Date().toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Asset Documents</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Purchase Receipt</p>
                          <p className="text-sm text-muted-foreground">PDF, 245KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Warranty Document</p>
                          <p className="text-sm text-muted-foreground">PDF, 189KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">User Manual</p>
                          <p className="text-sm text-muted-foreground">PDF, 3.2MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAssetOpen(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={() => handleGenerateQRCode(selectedAsset)}>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Code
              </Button>
              <Button
                onClick={() => {
                  setIsViewAssetOpen(false)
                  handleEditAsset(selectedAsset)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent className="sm:max-w-[400px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Update Asset Status</DialogTitle>
            <DialogDescription>Change the status of {statusUpdateAsset?.name}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <p className="font-medium">{statusUpdateAsset?.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {statusUpdateAsset?.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusSelect">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center">
                          <Badge
                            variant={
                              status === "In Use"
                                ? "default"
                                : status === "In Maintenance"
                                  ? "outline"
                                  : status === "Pending Disposal"
                                    ? "destructive"
                                    : "secondary"
                            }
                            className="mr-2"
                          >
                            {status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusUpdate}
              disabled={!newStatus || newStatus === statusUpdateAsset?.status}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQRCodeOpen} onOpenChange={setIsQRCodeOpen}>
        <DialogContent className="sm:max-w-[400px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Asset QR Code</DialogTitle>
            <DialogDescription>Scan this QR code to quickly access asset information</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            {qrCodeData && (
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCodeData || "/placeholder.svg"} alt="Asset QR Code" className="w-64 h-64" />
              </div>
            )}

            {selectedAsset && (
              <div className="text-center">
                <p className="font-semibold">{selectedAsset.name}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedAsset.id}</p>
                <p className="text-sm text-muted-foreground">Serial: {selectedAsset.serialNumber}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsQRCodeOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                const link = document.createElement("a")
                link.download = `${selectedAsset?.id}-qrcode.png`
                link.href = qrCodeData
                link.click()
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Assets Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Import Assets</DialogTitle>
            <DialogDescription>Upload a CSV file to import multiple assets at once.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">Select CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setImportFile(file || null)
                  setImportResults(null)
                }}
                className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Select a CSV file containing asset data. The file should include columns for Name, Category, Status,
                Department, etc.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <span className="text-sm text-muted-foreground">
                Download a sample CSV file to see the required format
              </span>
            </div>

            {importResults && (
              <div className="space-y-2">
                <div className="rounded-md border border-gray-300 dark:border-border/50 p-4">
                  <h4 className="font-semibold mb-2">Import Results</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ Successfully imported: {importResults.success} assets
                  </p>
                  {importResults.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                        ❌ Errors found: {importResults.errors.length}
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResults.errors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600 dark:text-red-400">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-md border border-gray-300 dark:border-border/50 p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">CSV Format Requirements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Headers: Name, Category, Status, Department, Assigned To, Serial Number, Location, Notes</li>
                <li>• Category must be one of: Computer Equipment, Office Equipment, Furniture, etc.</li>
                <li>• Status must be one of: In Use, In Storage, In Maintenance, Pending Disposal</li>
                <li>• Department must be a valid department name</li>
                <li>• All fields except Serial Number, Assigned To, and Notes are required</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false)
                setImportFile(null)
                setImportResults(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={processImportFile} disabled={!importFile}>
              Import Assets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
