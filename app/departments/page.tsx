"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Plus, MoreHorizontal, Edit, Trash2, Users, MapPin } from "lucide-react"
import { toast } from "sonner"
import DashboardLayout from "@/components/dashboard-layout"
import { useDepartments, type Department } from "@/components/department-provider"

export default function DepartmentsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useDepartments()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    head: "",
    location: "",
    employeeCount: "",
    status: "active" as "active" | "inactive",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      head: "",
      location: "",
      employeeCount: "",
      status: "active",
    })
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.head || !formData.location) {
        toast.error("Please fill in all required fields")
        return
      }

      // Check for duplicate department name
      if (departments.some((dept) => dept.name.toLowerCase() === formData.name.toLowerCase())) {
        toast.error("Department with this name already exists")
        return
      }

      addDepartment({
        name: formData.name,
        description: formData.description,
        head: formData.head,
        location: formData.location,
        employeeCount: Number.parseInt(formData.employeeCount) || 0,
        status: formData.status,
      })

      toast.success("Department added successfully!")
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to add department")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment) return

    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.head || !formData.location) {
        toast.error("Please fill in all required fields")
        return
      }

      // Check for duplicate department name (excluding current department)
      if (
        departments.some(
          (dept) => dept.id !== editingDepartment.id && dept.name.toLowerCase() === formData.name.toLowerCase(),
        )
      ) {
        toast.error("Department with this name already exists")
        return
      }

      updateDepartment(editingDepartment.id, {
        name: formData.name,
        description: formData.description,
        head: formData.head,
        location: formData.location,
        employeeCount: Number.parseInt(formData.employeeCount) || 0,
        status: formData.status,
      })

      toast.success("Department updated successfully!")
      setIsEditDialogOpen(false)
      setEditingDepartment(null)
      resetForm()
    } catch (error) {
      toast.error("Failed to update department")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDepartment = (department: Department) => {
    if (window.confirm(`Are you sure you want to delete ${department.name}?`)) {
      deleteDepartment(department.id)
      toast.success("Department deleted successfully!")
    }
  }

  const openEditDialog = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      description: department.description,
      head: department.head,
      location: department.location,
      employeeCount: department.employeeCount.toString(),
      status: department.status,
    })
    setIsEditDialogOpen(true)
  }

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0)
  const activeDepartments = departments.filter((dept) => dept.status === "active").length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Management</h1>
            <p className="text-muted-foreground">Manage organizational departments and their information</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>Create a new department in the organization</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDepartment}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Department Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Information Technology"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="head">Department Head *</Label>
                      <Input
                        id="head"
                        value={formData.head}
                        onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                        placeholder="e.g., John Smith"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the department's role and responsibilities"
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Building A, Floor 3"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Input
                        id="employeeCount"
                        type="number"
                        value={formData.employeeCount}
                        onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                        placeholder="0"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Department"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-gray-300 dark:border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
              <p className="text-xs text-muted-foreground">{activeDepartments} active departments</p>
            </CardContent>
          </Card>
          <Card className="border-gray-300 dark:border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>
        </div>

        {/* Departments Table */}
        <Card className="border-gray-300 dark:border-border/50">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage all organizational departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-300 dark:border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Head</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{department.name}</div>
                          <div className="text-sm text-muted-foreground">{department.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{department.head}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                          {department.location}
                        </div>
                      </TableCell>
                      <TableCell>{department.employeeCount}</TableCell>
                      <TableCell>
                        <Badge variant={department.status === "active" ? "default" : "secondary"}>
                          {department.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(department)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Department
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteDepartment(department)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Department
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Department Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>Update department information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditDepartment}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Department Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Information Technology"
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-head">Department Head *</Label>
                    <Input
                      id="edit-head"
                      value={formData.head}
                      onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                      placeholder="e.g., John Smith"
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the department's role and responsibilities"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location *</Label>
                    <Input
                      id="edit-location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Building A, Floor 3"
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-employeeCount">Employee Count</Label>
                    <Input
                      id="edit-employeeCount"
                      type="number"
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                      placeholder="0"
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
