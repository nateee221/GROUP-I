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
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Download,
  Edit,
  FileText,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"

// Mock data for inventory items
const initialInventoryItems = [
  {
    id: "I001",
    name: "Printer Paper (A4)",
    category: "Office Supplies",
    currentStock: 450,
    minStock: 100,
    maxStock: 1000,
    unit: "Reams",
    location: "Storage Room A",
    lastRestocked: "2023-04-15",
    status: "In Stock",
  },
  {
    id: "I002",
    name: "Ink Cartridges (Black)",
    category: "Printer Supplies",
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    unit: "Cartridges",
    location: "IT Storage",
    lastRestocked: "2023-05-02",
    status: "In Stock",
  },
  {
    id: "I003",
    name: "Ballpoint Pens (Blue)",
    category: "Office Supplies",
    currentStock: 120,
    minStock: 50,
    maxStock: 300,
    unit: "Pens",
    location: "Supply Cabinet B",
    lastRestocked: "2023-03-20",
    status: "In Stock",
  },
  {
    id: "I004",
    name: "Staples (Standard)",
    category: "Office Supplies",
    currentStock: 15,
    minStock: 20,
    maxStock: 100,
    unit: "Boxes",
    location: "Supply Cabinet A",
    lastRestocked: "2023-02-10",
    status: "Low Stock",
  },
  {
    id: "I005",
    name: "Sticky Notes (3x3)",
    category: "Office Supplies",
    currentStock: 75,
    minStock: 30,
    maxStock: 200,
    unit: "Packs",
    location: "Supply Cabinet C",
    lastRestocked: "2023-04-05",
    status: "In Stock",
  },
  {
    id: "I006",
    name: "Hand Sanitizer (500ml)",
    category: "Health Supplies",
    currentStock: 12,
    minStock: 15,
    maxStock: 50,
    unit: "Bottles",
    location: "Health Cabinet",
    lastRestocked: "2023-01-15",
    status: "Low Stock",
  },
  {
    id: "I007",
    name: "Printer Toner (HP LaserJet)",
    category: "Printer Supplies",
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    unit: "Cartridges",
    location: "IT Storage",
    lastRestocked: "2023-03-01",
    status: "In Stock",
  },
  {
    id: "I008",
    name: "File Folders (Letter Size)",
    category: "Filing Supplies",
    currentStock: 200,
    minStock: 100,
    maxStock: 500,
    unit: "Folders",
    location: "Records Room",
    lastRestocked: "2023-02-20",
    status: "In Stock",
  },
  {
    id: "I009",
    name: "Whiteboard Markers",
    category: "Office Supplies",
    currentStock: 30,
    minStock: 20,
    maxStock: 100,
    unit: "Markers",
    location: "Conference Room Supply",
    lastRestocked: "2023-04-10",
    status: "In Stock",
  },
  {
    id: "I010",
    name: "Coffee (Ground)",
    category: "Kitchen Supplies",
    currentStock: 5,
    minStock: 10,
    maxStock: 30,
    unit: "Bags",
    location: "Kitchen",
    lastRestocked: "2023-03-15",
    status: "Low Stock",
  },
]

// Mock data for inventory transactions
const initialTransactions = [
  {
    id: "T001",
    itemId: "I001",
    itemName: "Printer Paper (A4)",
    type: "Restock",
    quantity: 100,
    date: "2023-04-15",
    requestedBy: "John Smith",
    approvedBy: "Jane Doe",
    notes: "Regular monthly restock",
  },
  {
    id: "T002",
    itemId: "I002",
    itemName: "Ink Cartridges (Black)",
    type: "Withdrawal",
    quantity: 5,
    date: "2023-05-05",
    requestedBy: "Mike Johnson",
    approvedBy: "Jane Doe",
    notes: "For Finance Department printers",
  },
  {
    id: "T003",
    itemId: "I003",
    itemName: "Ballpoint Pens (Blue)",
    type: "Withdrawal",
    quantity: 30,
    date: "2023-04-20",
    requestedBy: "Sarah Williams",
    approvedBy: "Jane Doe",
    notes: "For HR Department",
  },
  {
    id: "T004",
    itemId: "I004",
    itemName: "Staples (Standard)",
    type: "Restock",
    quantity: 20,
    date: "2023-02-10",
    requestedBy: "John Smith",
    approvedBy: "Jane Doe",
    notes: "Regular restock",
  },
  {
    id: "T005",
    itemId: "I007",
    itemName: "Printer Toner (HP LaserJet)",
    type: "Restock",
    quantity: 10,
    date: "2023-03-01",
    requestedBy: "John Smith",
    approvedBy: "Jane Doe",
    notes: "Quarterly restock",
  },
]

// Inventory categories for dropdown
const inventoryCategories = [
  "Office Supplies",
  "Printer Supplies",
  "Filing Supplies",
  "Health Supplies",
  "Kitchen Supplies",
  "Cleaning Supplies",
  "IT Supplies",
  "Other",
]

// Inventory status options
const inventoryStatuses = ["All", "In Stock", "Low Stock", "Out of Stock"]

export default function InventoryPage() {
  const { user } = useAuth()
  const [inventoryItems, setInventoryItems] = useState([...initialInventoryItems])
  const [transactions, setTransactions] = useState([...initialTransactions])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("all")
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>("all")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [isManageStockOpen, setIsManageStockOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<(typeof initialInventoryItems)[0] | null>(null)
  const [isViewItemOpen, setIsViewItemOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("inventory")
  const [newItem, setNewItem] = useState({
    id: "",
    name: "",
    category: "",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: "",
    location: "",
    lastRestocked: new Date().toISOString().split("T")[0],
    status: "In Stock",
  })
  const [editItem, setEditItem] = useState({
    id: "",
    name: "",
    category: "",
    unit: "",
    location: "",
    lastRestocked: "",
    status: "",
  })
  const [stockManagement, setStockManagement] = useState({
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    adjustmentType: "restock", // "restock" or "withdrawal"
    adjustmentQuantity: 0,
    reason: "",
  })
  const [requestDetails, setRequestDetails] = useState({
    itemId: "",
    quantity: 1,
    reason: "",
    department: user?.department || "",
  })

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "R001",
      itemId: "I001", // Printer Paper (A4) - has 450 current stock
      itemName: "Printer Paper (A4)",
      quantity: 50,
      unit: "Reams",
      requestedBy: "Mike Johnson",
      department: "Finance Department",
      date: new Date().toISOString().split("T")[0],
      reason: "Monthly office supplies restocking for Finance Department",
      status: "Pending",
    },
    {
      id: "R002",
      itemId: "I006", // Hand Sanitizer - has 12 current stock, min 15 (Low Stock)
      itemName: "Hand Sanitizer (500ml)",
      quantity: 8,
      unit: "Bottles",
      requestedBy: "Sarah Williams",
      department: "Human Resources",
      date: new Date().toISOString().split("T")[0],
      reason: "Health and safety requirements for HR department and common areas",
      status: "Pending",
    },
    {
      id: "R003",
      itemId: "I010", // Coffee - has 5 current stock, min 10 (Low Stock)
      itemName: "Coffee (Ground)",
      quantity: 3,
      unit: "Bags",
      requestedBy: "John Smith",
      department: "Administration",
      date: new Date().toISOString().split("T")[0],
      reason: "Kitchen supplies for staff break room - running low",
      status: "Pending",
    },
  ])

  // Check if user is admin
  const isAdmin = user?.role === "admin"

  // Filter inventory items based on search and filters
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item.status.toLowerCase() === selectedStatus.toLowerCase()

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleViewItem = (item: (typeof initialInventoryItems)[0]) => {
    setSelectedItem(item)
    setIsViewItemOpen(true)
  }

  const handleEditItem = (item: (typeof initialInventoryItems)[0]) => {
    setSelectedItem(item)
    setEditItem({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      location: item.location,
      lastRestocked: item.lastRestocked,
      status: item.status,
    })
    setIsEditItemOpen(true)
  }

  const handleManageStock = (item: (typeof initialInventoryItems)[0]) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can manage stock levels.",
        variant: "destructive",
      })
      return
    }
    setSelectedItem(item)
    setStockManagement({
      currentStock: item.currentStock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      adjustmentType: "restock",
      adjustmentQuantity: 0,
      reason: "",
    })
    setIsManageStockOpen(true)
  }

  const handleDeleteItem = (item: (typeof initialInventoryItems)[0]) => {
    setSelectedItem(item)
    setIsDeleteConfirmOpen(true)
  }

  const handleRequestItem = (item: (typeof initialInventoryItems)[0]) => {
    setSelectedItem(item)
    setRequestDetails({
      ...requestDetails,
      itemId: item.id,
    })
    setIsRequestOpen(true)
  }

  const confirmDeleteItem = () => {
    if (selectedItem) {
      const updatedItems = inventoryItems.filter((item) => item.id !== selectedItem.id)
      setInventoryItems(updatedItems)
      setIsDeleteConfirmOpen(false)
      setSelectedItem(null)
      toast({
        title: "Item Deleted",
        description: `${selectedItem.name} has been deleted from inventory.`,
      })
    }
  }

  const handleAddItem = () => {
    // Generate a new ID
    const newId = `I${String(inventoryItems.length + 1).padStart(3, "0")}`
    const itemToAdd = {
      ...newItem,
      id: newId,
      status: newItem.currentStock < newItem.minStock ? "Low Stock" : "In Stock",
    }

    setInventoryItems([...inventoryItems, itemToAdd])
    setIsAddItemOpen(false)
    toast({
      title: "Item Added",
      description: `${itemToAdd.name} has been added to inventory.`,
    })

    // Reset the form
    setNewItem({
      id: "",
      name: "",
      category: "",
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unit: "",
      location: "",
      lastRestocked: new Date().toISOString().split("T")[0],
      status: "In Stock",
    })
  }

  const handleUpdateItem = () => {
    if (!selectedItem) return

    const updatedItems = inventoryItems.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          name: editItem.name,
          category: editItem.category,
          unit: editItem.unit,
          location: editItem.location,
          // Keep existing stock values
          currentStock: item.currentStock,
          minStock: item.minStock,
          maxStock: item.maxStock,
        }
      }
      return item
    })

    setInventoryItems(updatedItems)
    setIsEditItemOpen(false)
    toast({
      title: "Item Updated",
      description: `${editItem.name} has been updated successfully.`,
    })
  }

  const handleUpdateStock = () => {
    if (!selectedItem) return

    let newCurrentStock = stockManagement.currentStock
    let transactionType = "Stock Update"
    let transactionNotes = stockManagement.reason

    // Handle stock adjustments
    if (stockManagement.adjustmentQuantity > 0) {
      if (stockManagement.adjustmentType === "restock") {
        newCurrentStock = stockManagement.currentStock + stockManagement.adjustmentQuantity
        transactionType = "Restock"
        transactionNotes = `Stock adjustment: +${stockManagement.adjustmentQuantity}. ${stockManagement.reason}`
      } else {
        newCurrentStock = Math.max(0, stockManagement.currentStock - stockManagement.adjustmentQuantity)
        transactionType = "Withdrawal"
        transactionNotes = `Stock adjustment: -${stockManagement.adjustmentQuantity}. ${stockManagement.reason}`
      }
    }

    // Create transaction record
    const stockTransaction = {
      id: `T${String(transactions.length + 1).padStart(3, "0")}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: transactionType as const,
      quantity: stockManagement.adjustmentQuantity || 0,
      date: new Date().toISOString().split("T")[0],
      requestedBy: user?.name || "System",
      approvedBy: user?.name || "Admin",
      notes: transactionNotes,
    }

    setTransactions([stockTransaction, ...transactions])

    // Update inventory item
    const updatedItems = inventoryItems.map((item) => {
      if (item.id === selectedItem.id) {
        const updatedItem = {
          ...item,
          currentStock: newCurrentStock,
          minStock: stockManagement.minStock,
          maxStock: stockManagement.maxStock,
          lastRestocked:
            stockManagement.adjustmentType === "restock" ? new Date().toISOString().split("T")[0] : item.lastRestocked,
        }

        // Update status based on new stock levels
        updatedItem.status =
          updatedItem.currentStock === 0
            ? "Out of Stock"
            : updatedItem.currentStock < updatedItem.minStock
              ? "Low Stock"
              : "In Stock"

        return updatedItem
      }
      return item
    })

    setInventoryItems(updatedItems)
    setIsManageStockOpen(false)

    toast({
      title: "Stock Updated",
      description: `Stock levels for ${selectedItem.name} have been updated successfully.`,
    })
  }

  const handleApproveRequest = (request: any) => {
    // Find the inventory item
    const inventoryItem = inventoryItems.find((item) => item.id === request.itemId)

    if (!inventoryItem) {
      toast({
        title: "Error",
        description: "Inventory item not found.",
        variant: "destructive",
      })
      return
    }

    // Check if there's enough stock
    if (inventoryItem.currentStock < request.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Cannot approve request. Only ${inventoryItem.currentStock} ${inventoryItem.unit} available, but ${request.quantity} ${request.unit} requested.`,
        variant: "destructive",
      })
      return
    }

    // Create approval transaction
    const approvalTransaction = {
      id: `T${String(transactions.length + 1).padStart(3, "0")}`,
      itemId: request.itemId,
      itemName: request.itemName,
      type: "Withdrawal" as const,
      quantity: request.quantity,
      date: new Date().toISOString().split("T")[0],
      requestedBy: request.requestedBy,
      approvedBy: user?.name || "Current User",
      notes: `Approved request: ${request.reason}`,
    }

    // Update transactions
    setTransactions([approvalTransaction, ...transactions])

    // Update inventory stock (reduce current stock)
    const updatedItems = inventoryItems.map((item) => {
      if (item.id === request.itemId) {
        const newStock = item.currentStock - request.quantity
        return {
          ...item,
          currentStock: newStock,
          status: newStock === 0 ? "Out of Stock" : newStock < item.minStock ? "Low Stock" : "In Stock",
        }
      }
      return item
    })
    setInventoryItems(updatedItems)

    // Remove from pending requests
    setPendingRequests(pendingRequests.filter((req) => req.id !== request.id))

    toast({
      title: "Request Approved",
      description: `Request for ${request.quantity} ${request.unit} of ${request.itemName} has been approved. Stock updated from ${inventoryItem.currentStock} to ${inventoryItem.currentStock - request.quantity}.`,
    })
  }

  const handleRejectRequest = (request: any) => {
    // Create rejection transaction
    const rejectionTransaction = {
      id: `T${String(transactions.length + 1).padStart(3, "0")}`,
      itemId: request.itemId,
      itemName: request.itemName,
      type: "Rejected" as const,
      quantity: request.quantity,
      date: new Date().toISOString().split("T")[0],
      requestedBy: request.requestedBy,
      approvedBy: user?.name || "Current User",
      notes: `Rejected request: ${request.reason}`,
    }

    // Update transactions
    setTransactions([rejectionTransaction, ...transactions])

    // Remove from pending requests
    setPendingRequests(pendingRequests.filter((req) => req.id !== request.id))

    toast({
      title: "Request Rejected",
      description: `Request for ${request.quantity} ${request.unit} of ${request.itemName} has been rejected.`,
      variant: "destructive",
    })
  }

  const handleSubmitRequest = () => {
    // Validate required fields
    if (!requestDetails.quantity || requestDetails.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    if (!requestDetails.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for the request.",
        variant: "destructive",
      })
      return
    }

    if (!requestDetails.department) {
      toast({
        title: "Validation Error",
        description: "Please select a department.",
        variant: "destructive",
      })
      return
    }

    // Get the selected item (either from selectedItem or from dropdown)
    const itemToRequest = selectedItem || inventoryItems.find((item) => item.id === requestDetails.itemId)

    if (!itemToRequest) {
      toast({
        title: "Validation Error",
        description: "Please select an item to request.",
        variant: "destructive",
      })
      return
    }

    // Create a new pending request
    const newRequest = {
      id: `R${String(pendingRequests.length + 1).padStart(3, "0")}`,
      itemId: itemToRequest.id,
      itemName: itemToRequest.name,
      quantity: requestDetails.quantity,
      unit: itemToRequest.unit,
      requestedBy: user?.name || "Current User",
      department: requestDetails.department,
      date: new Date().toISOString().split("T")[0],
      reason: requestDetails.reason,
      status: "Pending",
    }

    setPendingRequests([newRequest, ...pendingRequests])

    toast({
      title: "Request Submitted Successfully",
      description: `Your request for ${requestDetails.quantity} ${itemToRequest.unit} of ${itemToRequest.name} has been submitted for approval.`,
    })

    setIsRequestOpen(false)

    // Reset request details
    setRequestDetails({
      itemId: "",
      quantity: 1,
      reason: "",
      department: user?.department || "",
    })
    setSelectedItem(null)
  }

  const handleExportInventory = () => {
    try {
      // Use filtered items if there are filters applied, otherwise use all items
      const itemsToExport = filteredItems.length < inventoryItems.length ? filteredItems : inventoryItems

      // Define CSV headers
      const headers = [
        "ID",
        "Name",
        "Category",
        "Current Stock",
        "Min Stock",
        "Max Stock",
        "Unit",
        "Location",
        "Status",
        "Last Restocked",
      ]

      // Convert items to CSV format
      const csvContent = [
        headers.join(","),
        ...itemsToExport.map((item) =>
          [
            item.id,
            `"${item.name.replace(/"/g, '""')}"`,
            `"${item.category.replace(/"/g, '""')}"`,
            item.currentStock,
            item.minStock,
            item.maxStock,
            `"${item.unit.replace(/"/g, '""')}"`,
            `"${item.location.replace(/"/g, '""')}"`,
            `"${item.status.replace(/"/g, '""')}"`,
            item.lastRestocked,
          ].join(","),
        ),
      ].join("\n")

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `inventory_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Exported ${itemsToExport.length} inventory items to CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the inventory data.",
        variant: "destructive",
      })
    }
  }

  const handleExportTransactions = () => {
    try {
      // Define CSV headers for transactions
      const headers = [
        "Transaction ID",
        "Item ID",
        "Item Name",
        "Transaction Type",
        "Quantity",
        "Date",
        "Requested By",
        "Approved By",
        "Notes",
      ]

      // Convert transactions to CSV format
      const csvContent = [
        headers.join(","),
        ...transactions.map((transaction) =>
          [
            transaction.id,
            transaction.itemId,
            `"${transaction.itemName.replace(/"/g, '""')}"`,
            `"${transaction.type.replace(/"/g, '""')}"`,
            transaction.quantity,
            transaction.date,
            `"${transaction.requestedBy.replace(/"/g, '""')}"`,
            `"${transaction.approvedBy.replace(/"/g, '""')}"`,
            `"${(transaction.notes || "").replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ].join("\n")

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `inventory_transactions_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Exported ${transactions.length} transaction records to CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the transaction data.",
        variant: "destructive",
      })
    }
  }

  const handleImportInventory = () => {
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
        const csv = e.target?.result as string
        const lines = csv.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          toast({
            title: "Invalid File",
            description: "The CSV file appears to be empty or invalid.",
            variant: "destructive",
          })
          return
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
        const dataLines = lines.slice(1)

        const errors: string[] = []
        const newItems: typeof inventoryItems = []
        let successCount = 0

        dataLines.forEach((line, index) => {
          try {
            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

            if (values.length < headers.length) {
              errors.push(`Row ${index + 2}: Insufficient data columns`)
              return
            }

            const [id, name, category, currentStock, minStock, maxStock, unit, location, status, lastRestocked] = values

            // Validation
            if (!name || !category || !unit || !location) {
              errors.push(`Row ${index + 2}: Missing required fields (name, category, unit, or location)`)
              return
            }

            if (!inventoryCategories.includes(category)) {
              errors.push(`Row ${index + 2}: Invalid category "${category}"`)
              return
            }

            const currentStockNum = Number.parseInt(currentStock) || 0
            const minStockNum = Number.parseInt(minStock) || 0
            const maxStockNum = Number.parseInt(maxStock) || 0

            if (currentStockNum < 0 || minStockNum < 0 || maxStockNum < 0) {
              errors.push(`Row ${index + 2}: Stock values cannot be negative`)
              return
            }

            if (maxStockNum < minStockNum) {
              errors.push(`Row ${index + 2}: Maximum stock cannot be less than minimum stock`)
              return
            }

            // Check if ID already exists
            const existingItem = inventoryItems.find((item) => item.id === id)
            if (existingItem) {
              errors.push(`Row ${index + 2}: Item with ID "${id}" already exists`)
              return
            }

            // Create new item
            const newItem = {
              id: id || `I${String(inventoryItems.length + newItems.length + 1).padStart(3, "0")}`,
              name,
              category,
              currentStock: currentStockNum,
              minStock: minStockNum,
              maxStock: maxStockNum,
              unit,
              location,
              status: currentStockNum === 0 ? "Out of Stock" : currentStockNum < minStockNum ? "Low Stock" : "In Stock",
              lastRestocked: lastRestocked || new Date().toISOString().split("T")[0],
            }

            newItems.push(newItem)
            successCount++
          } catch (error) {
            errors.push(`Row ${index + 2}: Error processing data - ${error}`)
          }
        })

        // Update inventory with new items
        if (newItems.length > 0) {
          setInventoryItems([...inventoryItems, ...newItems])
        }

        setImportResults({ success: successCount, errors })

        if (successCount > 0) {
          toast({
            title: "Import Completed",
            description: `Successfully imported ${successCount} items${errors.length > 0 ? ` with ${errors.length} errors` : ""}.`,
          })
        } else if (errors.length > 0) {
          toast({
            title: "Import Failed",
            description: `No items were imported. ${errors.length} errors found.`,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Import Error",
          description: "There was an error processing the CSV file.",
          variant: "destructive",
        })
      }
    }

    reader.readAsText(importFile)
  }

  const downloadTemplate = () => {
    const headers = [
      "ID",
      "Name",
      "Category",
      "Current Stock",
      "Min Stock",
      "Max Stock",
      "Unit",
      "Location",
      "Status",
      "Last Restocked",
    ]

    const sampleData = [
      "I999",
      "Sample Item",
      "Office Supplies",
      "100",
      "20",
      "500",
      "Pieces",
      "Storage Room A",
      "In Stock",
      "2023-12-01",
    ]

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "inventory_import_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to help you format your import file.",
    })
  }

  // Add these new state variables at the top of the component (around line 100):
  const [currentRequestStep, setCurrentRequestStep] = useState(0)
  const [itemSearchTerm, setItemSearchTerm] = useState("")
  const [itemCategoryFilter, setItemCategoryFilter] = useState("All")
  const [itemStatusFilter, setItemStatusFilter] = useState("All")

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)

  // Request step titles
  const requestStepTitles = ["Select Item", "Request Details"]

  // Filter items for request
  const filteredItemsForRequest = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(itemSearchTerm.toLowerCase())

    const matchesCategory = itemCategoryFilter === "All" || item.category === itemCategoryFilter
    const matchesStatus = itemStatusFilter === "All" || item.status === itemStatusFilter

    return matchesSearch && matchesCategory && matchesStatus && item.currentStock > 0
  })

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsRequestOpen(true)}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Request Items
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Download className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button onClick={() => setIsAddItemOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>Manage and track all consumable inventory items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search inventory..."
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
                          {inventoryCategories.map((category) => (
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
                          {inventoryStatuses.map((status) => (
                            <SelectItem key={status} value={status.toLowerCase()}>
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
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No inventory items found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Checkbox />
                              </TableCell>
                              <TableCell className="font-medium">{item.id}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>
                                      {item.currentStock} / {item.maxStock} {item.unit}
                                    </span>
                                  </div>
                                  <Progress
                                    value={(item.currentStock / item.maxStock) * 100}
                                    className="h-2"
                                    indicatorClassName={
                                      item.currentStock < item.minStock
                                        ? "bg-destructive"
                                        : item.currentStock < item.minStock * 1.5
                                          ? "bg-warning"
                                          : "bg-primary"
                                    }
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.status === "In Stock"
                                      ? "default"
                                      : item.status === "Low Stock"
                                        ? "outline"
                                        : "destructive"
                                  }
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.location}</TableCell>
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
                                    <DropdownMenuItem onClick={() => handleViewItem(item)}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRequestItem(item)}>
                                      <ShoppingCart className="mr-2 h-4 w-4" />
                                      Request Item
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Item
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleManageStock(item)}>
                                          <Package className="mr-2 h-4 w-4" />
                                          Manage Stock
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDeleteItem(item)}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Item
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
                  Showing {filteredItems.length} of {inventoryItems.length} items
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleExportInventory}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Transactions</CardTitle>
                <CardDescription>History of all inventory movements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>{transaction.itemName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "Restock"
                                  ? "default"
                                  : transaction.type === "Rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="flex items-center gap-1"
                            >
                              {transaction.type === "Restock" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : transaction.type === "Rejected" ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : (
                                <ArrowUp className="h-3 w-3" />
                              )}
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.requestedBy}</TableCell>
                          <TableCell>{transaction.approvedBy}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">Showing {transactions.length} transactions</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>Inventory requests awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Request ID</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No pending requests found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.id}</TableCell>
                            <TableCell>{request.itemName}</TableCell>
                            <TableCell>
                              {request.quantity} {request.unit}
                            </TableCell>
                            <TableCell>{request.requestedBy}</TableCell>
                            <TableCell>{request.department}</TableCell>
                            <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{request.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleApproveRequest(request)}>
                                  Approve
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleRejectRequest(request)}>
                                  Reject
                                </Button>
                              </div>
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

      {/* Add Inventory Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Enter the details of the new inventory item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  placeholder="0"
                  value={newItem.currentStock || ""}
                  onChange={(e) => setNewItem({ ...newItem, currentStock: Number.parseInt(e.target.value) || 0 })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  placeholder="0"
                  value={newItem.minStock || ""}
                  onChange={(e) => setNewItem({ ...newItem, minStock: Number.parseInt(e.target.value) || 0 })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock">Maximum Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  placeholder="0"
                  value={newItem.maxStock || ""}
                  onChange={(e) => setNewItem({ ...newItem, maxStock: Number.parseInt(e.target.value) || 0 })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measure</Label>
                <Input
                  id="unit"
                  placeholder="e.g., Boxes, Reams, Pieces"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional information" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog (No Stock Fields) */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the basic details of this inventory item. Use "Manage Stock" to adjust stock levels.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editItemName">Item Name</Label>
                <Input
                  id="editItemName"
                  placeholder="Enter item name"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={editItem.category}
                  onValueChange={(value) => setEditItem({ ...editItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editUnit">Unit of Measure</Label>
                <Input
                  id="editUnit"
                  placeholder="e.g., Boxes, Reams, Pieces"
                  value={editItem.unit}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLocation">Storage Location</Label>
                <Input
                  id="editLocation"
                  placeholder="Enter location"
                  value={editItem.location}
                  onChange={(e) => setEditItem({ ...editItem, location: e.target.value })}
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditItemOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateItem}>
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Stock Dialog (Admin Only) */}
      <Dialog open={isManageStockOpen} onOpenChange={setIsManageStockOpen}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Manage Stock - {selectedItem?.name}</DialogTitle>
            <DialogDescription>Update stock levels and thresholds for this inventory item.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockCurrent">Current Stock</Label>
                <Input
                  id="stockCurrent"
                  type="number"
                  value={stockManagement.currentStock || ""}
                  onChange={(e) =>
                    setStockManagement({ ...stockManagement, currentStock: Number.parseInt(e.target.value) || 0 })
                  }
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockMin">Minimum Stock</Label>
                <Input
                  id="stockMin"
                  type="number"
                  value={stockManagement.minStock || ""}
                  onChange={(e) =>
                    setStockManagement({ ...stockManagement, minStock: Number.parseInt(e.target.value) || 0 })
                  }
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockMax">Maximum Stock</Label>
                <Input
                  id="stockMax"
                  type="number"
                  value={stockManagement.maxStock || ""}
                  onChange={(e) =>
                    setStockManagement({ ...stockManagement, maxStock: Number.parseInt(e.target.value) || 0 })
                  }
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label className="text-base font-semibold">Stock Adjustment</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adjustmentType">Adjustment Type</Label>
                  <Select
                    value={stockManagement.adjustmentType}
                    onValueChange={(value) =>
                      setStockManagement({ ...stockManagement, adjustmentType: value as "restock" | "withdrawal" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restock">Restock (Add)</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal (Remove)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjustmentQuantity">Quantity</Label>
                  <Input
                    id="adjustmentQuantity"
                    type="number"
                    placeholder="0"
                    value={stockManagement.adjustmentQuantity || ""}
                    onChange={(e) =>
                      setStockManagement({
                        ...stockManagement,
                        adjustmentQuantity: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjustmentReason">Reason for Adjustment</Label>
                <Textarea
                  id="adjustmentReason"
                  placeholder="Explain the reason for this stock adjustment"
                  value={stockManagement.reason}
                  onChange={(e) => setStockManagement({ ...stockManagement, reason: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageStockOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateStock}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Delete Item</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Are you sure you want to delete this item?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4">
              <p className="text-sm">
                This action cannot be undone. This will permanently delete the inventory item{" "}
                <span className="font-semibold">"{selectedItem?.name}"</span> and remove it from the system.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false)
                setSelectedItem(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteItem}>
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      {selectedItem && (
        <Dialog open={isViewItemOpen} onOpenChange={setIsViewItemOpen}>
          <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
            <DialogHeader>
              <DialogTitle>Inventory Item Details</DialogTitle>
              <DialogDescription>Detailed information about the selected inventory item.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedItem.id}</p>
                </div>
                <Badge
                  variant={
                    selectedItem.status === "In Stock"
                      ? "default"
                      : selectedItem.status === "Low Stock"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {selectedItem.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Stock Level</Label>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      Current: {selectedItem.currentStock} {selectedItem.unit}
                    </span>
                    <span>
                      Min: {selectedItem.minStock} | Max: {selectedItem.maxStock}
                    </span>
                  </div>
                  <Progress
                    value={(selectedItem.currentStock / selectedItem.maxStock) * 100}
                    className="h-2"
                    indicatorClassName={
                      selectedItem.currentStock < selectedItem.minStock
                        ? "bg-destructive"
                        : selectedItem.currentStock < selectedItem.minStock * 1.5
                          ? "bg-warning"
                          : "bg-primary"
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p>{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p>{selectedItem.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Restocked</p>
                  <p>{new Date(selectedItem.lastRestocked).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Unit of Measure</p>
                  <p>{selectedItem.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recent Transactions</Label>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions
                        .filter((t) => t.itemId === selectedItem.id)
                        .map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge
                                variant={transaction.type === "Restock" ? "default" : "secondary"}
                                className="flex items-center gap-1"
                              >
                                {transaction.type === "Restock" ? (
                                  <ArrowDown className="h-3 w-3" />
                                ) : (
                                  <ArrowUp className="h-3 w-3" />
                                )}
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{transaction.quantity}</TableCell>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell>{transaction.requestedBy}</TableCell>
                          </TableRow>
                        ))}
                      {!transactions.some((t) => t.itemId === selectedItem.id) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No recent transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewItemOpen(false)}>
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewItemOpen(false)
                  handleRequestItem(selectedItem)
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Request Item
              </Button>
              <Button
                onClick={() => {
                  setIsViewItemOpen(false)
                  handleEditItem(selectedItem)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Multi-step Request Item Dialog */}
      <Dialog
        open={isRequestOpen}
        onOpenChange={() => {
          setIsRequestOpen(false)
          setCurrentRequestStep(0)
          setSelectedItem(null)
          setRequestDetails({
            itemId: "",
            quantity: 1,
            reason: "",
            department: user?.department || "",
          })
        }}
      >
        <DialogContent className="sm:max-w-[550px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>
              Request Inventory Item - Step {currentRequestStep + 1}: {requestStepTitles[currentRequestStep]}
            </DialogTitle>
            <DialogDescription>
              {currentRequestStep === 0
                ? "Select an item to request from inventory"
                : "Enter request details and submit"}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Item Selection */}
          {currentRequestStep === 0 && (
            <div className="py-4 space-y-4">
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search items by name or ID..."
                    className="pl-8"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Select value={itemCategoryFilter} onValueChange={setItemCategoryFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {inventoryCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={itemStatusFilter} onValueChange={setItemStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Item List */}
              <div className="border border-gray-300 dark:border-border/50 rounded-md max-h-[300px] overflow-y-auto">
                {filteredItemsForRequest.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No items found matching your criteria</div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-border/50">
                    {filteredItemsForRequest.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                          selectedItem?.id === item.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{item.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {item.id}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.category} • {item.location}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant={
                                  item.status === "In Stock"
                                    ? "default"
                                    : item.status === "Low Stock"
                                      ? "outline"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Stock: {item.currentStock} {item.unit}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant={selectedItem?.id === item.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                          >
                            {selectedItem?.id === item.id ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredItemsForRequest.length} of {inventoryItems.length} items
              </div>
            </div>
          )}

          {/* Step 2: Request Details */}
          {currentRequestStep === 1 && (
            <div className="py-4 space-y-4">
              {/* Selected Item Summary */}
              {selectedItem && (
                <div className="rounded-md border border-gray-300 dark:border-border/50 p-3 bg-muted/50 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {selectedItem.id} • {selectedItem.category} • Stock: {selectedItem.currentStock}{" "}
                        {selectedItem.unit}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentRequestStep(0)}>
                      Change
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="requestQuantity">Quantity</Label>
                <Input
                  id="requestQuantity"
                  type="number"
                  placeholder="Enter quantity"
                  min="1"
                  max={selectedItem?.currentStock || 999}
                  value={requestDetails.quantity || ""}
                  onChange={(e) =>
                    setRequestDetails({ ...requestDetails, quantity: Number.parseInt(e.target.value) || 1 })
                  }
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                />
                {selectedItem && requestDetails.quantity > selectedItem.currentStock && (
                  <p className="text-sm text-destructive">
                    Requested quantity exceeds available stock ({selectedItem.currentStock} {selectedItem.unit})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestReason">Reason for Request</Label>
                <Textarea
                  id="requestReason"
                  placeholder="Explain why you need this item"
                  value={requestDetails.reason}
                  onChange={(e) => setRequestDetails({ ...requestDetails, reason: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestDepartment">Department</Label>
                <Select
                  value={requestDetails.department}
                  onValueChange={(value) => setRequestDetails({ ...requestDetails, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT Department">IT Department</SelectItem>
                    <SelectItem value="Finance Department">Finance Department</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && selectedItem.status === "Low Stock" && (
                <div className="flex items-center space-x-2 rounded-md border border-gray-300 dark:border-border/50 p-3 bg-muted/50">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <p className="text-sm text-muted-foreground">
                    This item is currently low in stock. Your request may be prioritized based on need.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between mt-4">
            <div>
              {currentRequestStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentRequestStep((prev) => prev - 1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRequestOpen(false)
                  setCurrentRequestStep(0)
                  setSelectedItem(null)
                }}
              >
                Cancel
              </Button>
              {currentRequestStep < 1 ? (
                <Button onClick={() => setCurrentRequestStep((prev) => prev + 1)} disabled={!selectedItem}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitRequest}
                  disabled={!requestDetails.quantity || !requestDetails.reason.trim() || !requestDetails.department}
                >
                  Submit Request
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Inventory Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Import Inventory Items</DialogTitle>
            <DialogDescription>Upload a CSV file to import multiple inventory items at once.</DialogDescription>
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
                Select a CSV file containing inventory data. The file should include columns for ID, Name, Category,
                Current Stock, Min Stock, Max Stock, Unit, Location, Status, and Last Restocked.
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
                    ✅ Successfully imported: {importResults.success} items
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
                <li>
                  • Headers: ID, Name, Category, Current Stock, Min Stock, Max Stock, Unit, Location, Status, Last
                  Restocked
                </li>
                <li>• Category must be one of: {inventoryCategories.join(", ")}</li>
                <li>• Stock values must be non-negative numbers</li>
                <li>• Maximum stock must be greater than or equal to minimum stock</li>
                <li>• Date format: YYYY-MM-DD</li>
                <li>• IDs must be unique</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportOpen(false)
                setImportFile(null)
                setImportResults(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImportInventory} disabled={!importFile}>
              Import Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
