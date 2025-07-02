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
import {
  Download,
  Edit,
  Eye,
  EyeOff,
  Key,
  MoreHorizontal,
  Search,
  Shield,
  UserPlus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useUser } from "@/components/user-provider"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useAccountRequests } from "@/components/account-request-provider"
import type { AccountRequest } from "@/types/account-request"
import { EmailService } from "@/lib/email"

// Mock data for roles and permissions
const mockRoles = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access",
    userCount: 1,
    permissions: [
      "manage_users",
      "manage_assets",
      "manage_inventory",
      "approve_requests",
      "generate_reports",
      "system_settings",
    ],
  },
  {
    id: "department_head",
    name: "Department Head",
    description: "Department-level management",
    userCount: 3,
    permissions: [
      "view_assets",
      "manage_department_assets",
      "request_inventory",
      "approve_department_requests",
      "view_reports",
    ],
  },
  {
    id: "staff",
    name: "Staff",
    description: "Basic system access",
    userCount: 3,
    permissions: ["view_assets", "request_inventory", "view_assigned_assets"],
  },
]

// Mock permissions
const mockPermissions = [
  { id: "manage_users", name: "Manage Users", category: "Administration" },
  { id: "manage_assets", name: "Manage Assets", category: "Assets" },
  { id: "manage_inventory", name: "Manage Inventory", category: "Inventory" },
  { id: "approve_requests", name: "Approve Requests", category: "Workflow" },
  { id: "generate_reports", name: "Generate Reports", category: "Reports" },
  { id: "system_settings", name: "System Settings", category: "Administration" },
  { id: "view_assets", name: "View Assets", category: "Assets" },
  { id: "manage_department_assets", name: "Manage Department Assets", category: "Assets" },
  { id: "request_inventory", name: "Request Inventory", category: "Inventory" },
  { id: "approve_department_requests", name: "Approve Department Requests", category: "Workflow" },
  { id: "view_reports", name: "View Reports", category: "Reports" },
  { id: "view_assigned_assets", name: "View Assigned Assets", category: "Assets" },
]

// Departments
const departments = [
  "All Departments",
  "IT Department",
  "Finance Department",
  "Human Resources",
  "Administration",
  "Executive",
  "Records",
  "Facilities",
  "Security",
]

// User roles
const userRoles = ["All Roles", "admin", "department_head", "staff"]

// User statuses
const userStatuses = ["All", "active", "inactive"]

export default function UsersPage() {
  const { user } = useAuth()
  const { users, addUser, updateUser, deleteUser } = useUser()
  const {
    requests: accountRequests,
    pendingCount,
    approveRequest,
    rejectRequest,
    deleteRequest,
    refreshRequests,
    isLoading: requestsLoading,
  } = useAccountRequests()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All Departments")
  const [selectedUserRole, setSelectedUserRole] = useState<string>("All Roles")
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null)
  const [isViewUserOpen, setIsViewUserOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<(typeof mockRoles)[0] | null>(null)
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<(typeof users)[0] | null>(null)
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null)
  const [isProcessingRequest, setIsProcessingRequest] = useState(false)

  // Form state for adding user
  const [newUserForm, setNewUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    sendInvite: true,
  })

  // Form state for editing user
  const [editUserForm, setEditUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
    status: "active" as "active" | "inactive",
  })

  // Form state for resetting password
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    // Add safety checks to prevent undefined errors
    const userName = user?.name || ""
    const userEmail = user?.email || ""
    const userId = user?.id || ""
    const userDepartment = user?.department || ""
    const userRole = user?.role || ""
    const userStatus = user?.status || ""

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = selectedDepartment === "All Departments" || userDepartment === selectedDepartment
    const matchesRole = selectedUserRole === "All Roles" || userRole === selectedUserRole
    const matchesStatus = selectedStatus === "All" || userStatus === selectedStatus

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus
  })

  const handleViewUser = (user: (typeof users)[0]) => {
    setSelectedUser(user)
    setIsViewUserOpen(true)
  }

  const handleEditUser = (user: (typeof users)[0]) => {
    setSelectedUser(user)
    // Split the name into first and last name
    const nameParts = user.name.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(" ")

    // Set the edit form values
    setEditUserForm({
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
    })

    setIsEditUserOpen(true)
  }

  const handleResetPassword = (user: (typeof users)[0]) => {
    setSelectedUser(user)
    setResetPasswordForm({
      newPassword: "",
      confirmPassword: "",
    })
    setIsResetPasswordOpen(true)
  }

  const handleAddUser = () => {
    // Validate form
    if (
      !newUserForm.firstName ||
      !newUserForm.lastName ||
      !newUserForm.email ||
      !newUserForm.password ||
      !newUserForm.confirmPassword || // Add this line
      !newUserForm.role ||
      !newUserForm.department
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Check if passwords match
    if (newUserForm.password !== newUserForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Password and confirm password do not match.",
      })
      return
    }

    // Check if email already exists
    const existingUser = users.find((u) => u.email === newUserForm.email)
    if (existingUser) {
      toast({
        variant: "destructive",
        title: "Email Already Exists",
        description: "A user with this email already exists.",
      })
      return
    }

    // Add the user
    addUser({
      name: `${newUserForm.firstName} ${newUserForm.lastName}`,
      email: newUserForm.email,
      password: newUserForm.password,
      role: newUserForm.role as "admin" | "department_head" | "staff",
      department: newUserForm.department,
      status: "active",
    })

    toast({
      title: "User Added Successfully",
      description: `${newUserForm.firstName} ${newUserForm.lastName} has been added to the system.`,
    })

    // Reset form and close dialog
    setNewUserForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "", // Add this line
      role: "",
      department: "",
      sendInvite: true,
    })
    setIsAddUserOpen(false)
  }

  const handleUpdateUser = () => {
    if (!selectedUser) return

    // Validate form
    if (
      !editUserForm.firstName ||
      !editUserForm.lastName ||
      !editUserForm.email ||
      !editUserForm.role ||
      !editUserForm.department
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Check if email already exists (but not for the current user)
    const existingUser = users.find((u) => u.email === editUserForm.email && u.id !== selectedUser.id)
    if (existingUser) {
      toast({
        variant: "destructive",
        title: "Email Already Exists",
        description: "Another user with this email already exists.",
      })
      return
    }

    // Update the user
    updateUser(selectedUser.id, {
      name: `${editUserForm.firstName} ${editUserForm.lastName}`,
      email: editUserForm.email,
      role: editUserForm.role as "admin" | "department_head" | "staff",
      department: editUserForm.department,
      status: editUserForm.status,
    })

    toast({
      title: "User Updated",
      description: "The user has been updated successfully.",
    })
    setIsEditUserOpen(false)
  }

  const handleResetUserPassword = () => {
    if (!selectedUser) return

    // Validate passwords
    if (!resetPasswordForm.newPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a new password.",
      })
      return
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "The new password and confirmation password do not match.",
      })
      return
    }

    // Update the user's password
    updateUser(selectedUser.id, {
      password: resetPasswordForm.newPassword,
    })

    toast({
      title: "Password Reset",
      description: "The user's password has been reset successfully.",
    })
    setIsResetPasswordOpen(false)
  }

  const handleDeleteUser = (user: (typeof users)[0]) => {
    setUserToDelete(user)
    setIsDeleteUserOpen(true)
  }

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete || !user) return

    try {
      // Use the user provider's deleteUser method
      const success = await deleteUser(userToDelete.id)

      if (success) {
        toast({
          title: "User Deleted",
          description: `${userToDelete.name} has been deleted successfully.`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: "Failed to delete the user. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "An error occurred while deleting the user.",
      })
    } finally {
      setIsDeleteUserOpen(false)
      setUserToDelete(null)
    }
  }

  const handleToggleUserStatus = (user: (typeof users)[0]) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    updateUser(user.id, { status: newStatus })

    toast({
      title: `User ${newStatus === "active" ? "Activated" : "Deactivated"}`,
      description: `${user.name} has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
    })
  }

  const handleEditRole = (role: (typeof mockRoles)[0]) => {
    setSelectedRoleForEdit(role)
    setIsEditRoleOpen(true)
  }

  const handleUpdateRole = () => {
    toast({
      title: "Role Updated",
      description: "The role permissions have been updated successfully.",
    })
    setIsEditRoleOpen(false)
  }

  const handleViewRequest = (request: AccountRequest) => {
    setSelectedRequest(request)
    setIsViewRequestOpen(true)
  }

  const handleApproveRequest = async (request: AccountRequest) => {
    if (!user) return

    setIsProcessingRequest(true)
    try {
      const success = await approveRequest(request.id, user.name, "Request approved by admin")

      if (success) {
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + "Temp1!"

        // Create the user account with temporary password
        const newUser = await addUser({
          name: `${request.firstName} ${request.lastName}`,
          email: request.email,
          password: tempPassword,
          role: "staff", // Default role
          department: request.department,
          status: "active",
          jobTitle: request.jobTitle,
          accountSetup: false, // Mark as needing setup
        })

        if (newUser) {
          // Send account setup email
          try {
            await EmailService.sendAccountSetupEmail(
              {
                name: `${request.firstName} ${request.lastName}`,
                email: request.email,
                id: newUser.id,
              },
              tempPassword,
            )

            toast({
              title: "Request Approved",
              description: `Account created for ${request.firstName} ${request.lastName}. They will receive setup instructions via email.`,
            })
          } catch (emailError) {
            console.error("Failed to send setup email:", emailError)
            toast({
              title: "Account Created",
              description: `Account created for ${request.firstName} ${request.lastName}, but failed to send setup email. Please contact them directly.`,
              variant: "destructive",
            })
          }
        }

        setIsViewRequestOpen(false)
      }
    } catch (error) {
      console.error("Approval error:", error)
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: "Failed to approve the request. Please try again.",
      })
    } finally {
      setIsProcessingRequest(false)
    }
  }

  const handleRejectRequest = async (request: AccountRequest) => {
    if (!user) return

    setIsProcessingRequest(true)
    try {
      const success = await rejectRequest(request.id, user.name, "Request rejected by admin")

      if (success) {
        toast({
          title: "Request Rejected",
          description: `Account request from ${request.firstName} ${request.lastName} has been rejected.`,
        })
        setIsViewRequestOpen(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: "Failed to reject the request. Please try again.",
      })
    } finally {
      setIsProcessingRequest(false)
    }
  }

  const handleRefreshRequests = async () => {
    console.log("Manual refresh triggered")
    await refreshRequests()
    toast({
      title: "Refreshed",
      description: "Account requests have been refreshed.",
    })
  }

  // Check if current user is admin
  const isAdmin = user?.role === "admin"

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center text-center max-w-md">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the user management section. Please contact your administrator for
              assistance.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Account Requests
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search users..."
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

                      <Select value={selectedUserRole} onValueChange={setSelectedUserRole}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role === "admin"
                                ? "Administrator"
                                : role === "department_head"
                                  ? "Department Head"
                                  : role === "staff"
                                    ? "Staff"
                                    : role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {userStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === "active" ? "Active" : status === "inactive" ? "Inactive" : status}
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
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <Checkbox />
                              </TableCell>
                              <TableCell className="font-medium">{user.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                    {user.accountSetup === false && (
                                      <Badge variant="outline" className="text-xs w-fit mt-1">
                                        Setup Pending
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.role === "admin"
                                      ? "default"
                                      : user.role === "department_head"
                                        ? "outline"
                                        : "secondary"
                                  }
                                >
                                  {user.role === "admin"
                                    ? "Administrator"
                                    : user.role === "department_head"
                                      ? "Department Head"
                                      : "Staff"}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.department}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.status === "active" ? "default" : "secondary"}
                                  className={
                                    user.status === "active"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800"
                                  }
                                >
                                  {user.status === "active" ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.lastLogin).toLocaleDateString()}{" "}
                                {new Date(user.lastLogin).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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
                                    <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                      <Key className="mr-2 h-4 w-4" />
                                      Reset Password
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                      {user.status === "active" ? (
                                        <>
                                          <EyeOff className="mr-2 h-4 w-4" />
                                          Deactivate User
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="mr-2 h-4 w-4" />
                                          Activate User
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteUser(user)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete User
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
                  Showing {filteredUsers.length} of {users.length} users
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

          <TabsContent value="roles" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>Manage user roles and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            {role.id === "admin"
                              ? "Administrator"
                              : role.id === "department_head"
                                ? "Department Head"
                                : "Staff"}
                          </TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell>{role.userCount} users</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 3).map((permission) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {mockPermissions.find((p) => p.id === permission)?.name || permission}
                                </Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Account Requests
                      {pendingCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                          {pendingCount}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Review and manage account access requests</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefreshRequests} disabled={requestsLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${requestsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading requests...</span>
                  </div>
                ) : accountRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Account Requests</h3>
                    <p className="text-muted-foreground">There are currently no pending account requests.</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-gray-300 dark:border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requester</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {request.firstName} {request.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">{request.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>{request.department}</TableCell>
                            <TableCell>{request.jobTitle}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  request.status === "pending"
                                    ? "outline"
                                    : request.status === "approved"
                                      ? "default"
                                      : "destructive"
                                }
                                className={
                                  request.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
                                    : request.status === "approved"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                                      : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
                                }
                              >
                                {request.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                                {request.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                                {request.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewRequest(request)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApproveRequest(request)}
                                      disabled={isProcessingRequest}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleRejectRequest(request)}
                                      disabled={isProcessingRequest}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add User Dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account for the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newUserForm.confirmPassword}
                  onChange={(e) => setNewUserForm({ ...newUserForm, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUserForm.role}
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="department_head">Department Head</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newUserForm.department}
                  onValueChange={(value) => setNewUserForm({ ...newUserForm, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.slice(1).map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendInvite"
                  checked={newUserForm.sendInvite}
                  onCheckedChange={(checked) => setNewUserForm({ ...newUserForm, sendInvite: checked as boolean })}
                />
                <Label htmlFor="sendInvite" className="text-sm">
                  Send welcome email to user
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddUser}>
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and settings.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editUserForm.firstName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, firstName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editUserForm.lastName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editRole">Role</Label>
                <Select
                  value={editUserForm.role}
                  onValueChange={(value) => setEditUserForm({ ...editUserForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="department_head">Department Head</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDepartment">Department</Label>
                <Select
                  value={editUserForm.department}
                  onValueChange={(value) => setEditUserForm({ ...editUserForm, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.slice(1).map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="editStatus">Account Status</Label>
                <Switch
                  id="editStatus"
                  checked={editUserForm.status === "active"}
                  onCheckedChange={(checked) =>
                    setEditUserForm({ ...editUserForm, status: checked ? "active" : "inactive" })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateUser}>
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Reset the password for {selectedUser?.name}. The user will need to use the new password to log in.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={resetPasswordForm.newPassword}
                  onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={resetPasswordForm.confirmPassword}
                  onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleResetUserPassword}>
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View User Dialog */}
        <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>View detailed information about the user.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <Badge
                      variant={selectedUser.status === "active" ? "default" : "secondary"}
                      className={
                        selectedUser.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800"
                      }
                    >
                      {selectedUser.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                    <p className="text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <p className="text-sm">
                      {selectedUser.role === "admin"
                        ? "Administrator"
                        : selectedUser.role === "department_head"
                          ? "Department Head"
                          : "Staff"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="text-sm">{selectedUser.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                    <p className="text-sm">
                      {new Date(selectedUser.lastLogin).toLocaleDateString()}{" "}
                      {new Date(selectedUser.lastLogin).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Updated</Label>
                    <p className="text-sm">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Role Permissions</DialogTitle>
              <DialogDescription>
                Modify permissions for the{" "}
                {selectedRoleForEdit?.id === "admin"
                  ? "Administrator"
                  : selectedRoleForEdit?.id === "department_head"
                    ? "Department Head"
                    : "Staff"}{" "}
                role.
              </DialogDescription>
            </DialogHeader>
            {selectedRoleForEdit && (
              <div className="grid gap-4 py-4">
                <div className="space-y-4">
                  {Object.entries(
                    mockPermissions.reduce(
                      (acc, permission) => {
                        if (!acc[permission.category]) {
                          acc[permission.category] = []
                        }
                        acc[permission.category].push(permission)
                        return acc
                      },
                      {} as Record<string, typeof mockPermissions>,
                    ),
                  ).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm">{category}</h4>
                      <div className="space-y-2 pl-4">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedRoleForEdit.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedRoleForEdit({
                                    ...selectedRoleForEdit,
                                    permissions: [...selectedRoleForEdit.permissions, permission.id],
                                  })
                                } else {
                                  setSelectedRoleForEdit({
                                    ...selectedRoleForEdit,
                                    permissions: selectedRoleForEdit.permissions.filter((p) => p !== permission.id),
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" onClick={handleUpdateRole}>
                Update Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {userToDelete?.name}? This action cannot be undone and will permanently
                remove the user from the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDeleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Request Dialog */}
        <Dialog open={isViewRequestOpen} onOpenChange={setIsViewRequestOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Account Request Details</DialogTitle>
              <DialogDescription>Review the account request information.</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                    <p className="text-sm">{selectedRequest.firstName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                    <p className="text-sm">{selectedRequest.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="text-sm">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                    <p className="text-sm">{selectedRequest.jobTitle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge
                      variant={
                        selectedRequest.status === "pending"
                          ? "outline"
                          : selectedRequest.status === "approved"
                            ? "default"
                            : "destructive"
                      }
                      className={
                        selectedRequest.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
                          : selectedRequest.status === "approved"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                            : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
                      }
                    >
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reason for Request</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRequest.reason}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                    <p className="text-sm">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedRequest.processedAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Processed</Label>
                      <p className="text-sm">{new Date(selectedRequest.processedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {selectedRequest.processedBy && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Processed By</Label>
                    <p className="text-sm">{selectedRequest.processedBy}</p>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Admin Notes</Label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedRequest?.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => selectedRequest && handleRejectRequest(selectedRequest)}
                    disabled={isProcessingRequest}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => selectedRequest && handleApproveRequest(selectedRequest)}
                    disabled={isProcessingRequest}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
