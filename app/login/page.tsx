"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Lock, Mail } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useLanguage } from "@/components/language-provider"
import { useTheme } from "next-themes"
import { unifiedDb } from "@/lib/unified-database"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { UserPlus } from "lucide-react"
import type { AccountRequestFormData } from "@/types/account-request"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading } = useAuth()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const isLightMode = theme === "light"

  const [isRequestAccountOpen, setIsRequestAccountOpen] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestForm, setRequestForm] = useState<AccountRequestFormData>({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    jobTitle: "",
    reason: "",
  })

  const departments = [
    "IT Department",
    "Finance Department",
    "Human Resources",
    "Administration",
    "Executive",
    "Records",
    "Facilities",
    "Security",
    "General Services",
  ]

  // Initialize database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      // This will trigger the initialization
      await unifiedDb.getUsers()
    }
    initializeDatabase()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  const handleRequestAccount = async () => {
    // Validate form
    if (
      !requestForm.firstName ||
      !requestForm.lastName ||
      !requestForm.email ||
      !requestForm.department ||
      !requestForm.jobTitle ||
      !requestForm.reason
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSubmittingRequest(true)

    try {
      const response = await fetch("/api/account-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestForm),
      })

      if (response.ok) {
        toast({
          title: "Request Submitted",
          description: "Your account request has been submitted successfully. An administrator will review it shortly.",
        })

        // Reset form and close dialog
        setRequestForm({
          firstName: "",
          lastName: "",
          email: "",
          department: "",
          jobTitle: "",
          reason: "",
        })
        setIsRequestAccountOpen(false)
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: error.error || "Failed to submit account request.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "An error occurred while submitting your request.",
      })
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative bg-white dark:bg-muted/40">
      {/* Header with logo and mode toggle for mobile */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 md:hidden">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">LGU Asset Manager</h1>
        </div>
        <ModeToggle />
      </div>

      {/* Mode Toggle in top-right corner for desktop */}
      <div className="absolute top-4 right-4 hidden md:block">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo for desktop */}
        <div className="hidden md:flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">LGU Asset Manager</h1>
          </div>
        </div>

        <Card className="border-2 border-gray-300 shadow-lg dark:border-border/50">
          <CardHeader className="pb-4">
            <CardTitle>{t("login.title")}</CardTitle>
            <CardDescription>{t("login.subtitle")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("login.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    className="pl-10 border-2 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("login.password")}</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10 border-2 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? t("login.loggingIn") : t("login.loginButton")}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm">
          <p className="font-medium mb-2 text-muted-foreground">{t("login.demoAccounts")}</p>
          <div className="space-y-2 bg-gray-100 dark:bg-muted/50 p-4 rounded-md border-2 border-gray-300 dark:border-border/50">
            <button
              type="button"
              onClick={() => handleDemoLogin("admin@lgu.gov", "admin123")}
              className="block w-full text-left hover:bg-gray-200 dark:hover:bg-muted/70 p-2 rounded transition-colors"
            >
              <strong>Admin:</strong> admin@lgu.gov / admin123
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("head@lgu.gov", "head123")}
              className="block w-full text-left hover:bg-gray-200 dark:hover:bg-muted/70 p-2 rounded transition-colors"
            >
              <strong>Department Head:</strong> head@lgu.gov / head123
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("staff@lgu.gov", "staff123")}
              className="block w-full text-left hover:bg-gray-200 dark:hover:bg-muted/70 p-2 rounded transition-colors"
            >
              <strong>Staff:</strong> staff@lgu.gov / staff123
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setIsRequestAccountOpen(true)} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Request New Account
          </Button>
        </div>

        {/* Account Request Dialog */}
        <Dialog open={isRequestAccountOpen} onOpenChange={setIsRequestAccountOpen}>
          <DialogContent className="sm:max-w-[600px] border-gray-300 dark:border-border/50">
            <DialogHeader>
              <DialogTitle>Request New Account</DialogTitle>
              <DialogDescription>
                Fill out this form to request access to the Asset Tracking System. An administrator will review your
                request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestFirstName">First Name *</Label>
                  <Input
                    id="requestFirstName"
                    placeholder="Enter first name"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={requestForm.firstName}
                    onChange={(e) => setRequestForm({ ...requestForm, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestLastName">Last Name *</Label>
                  <Input
                    id="requestLastName"
                    placeholder="Enter last name"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={requestForm.lastName}
                    onChange={(e) => setRequestForm({ ...requestForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestEmail">Email Address *</Label>
                <Input
                  id="requestEmail"
                  type="email"
                  placeholder="Enter your email address"
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                  value={requestForm.email}
                  onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestDepartment">Department *</Label>
                  <Select
                    value={requestForm.department}
                    onValueChange={(value) => setRequestForm({ ...requestForm, department: value })}
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
                  <Label htmlFor="requestJobTitle">Job Title *</Label>
                  <Input
                    id="requestJobTitle"
                    placeholder="Enter your job title"
                    className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    value={requestForm.jobTitle}
                    onChange={(e) => setRequestForm({ ...requestForm, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestReason">Reason for Access *</Label>
                <Textarea
                  id="requestReason"
                  placeholder="Please explain why you need access to the Asset Tracking System"
                  className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary min-h-[100px]"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestAccountOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestAccount} disabled={isSubmittingRequest}>
                {isSubmittingRequest ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
