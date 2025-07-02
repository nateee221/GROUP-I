"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save, Camera } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("personal")
  const [saving, setSaving] = useState(false)

  // Personal information
  const [name, setName] = useState(user?.name || "")
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password change
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    setSaving(true)

    // Simulate API call
    setTimeout(() => {
      updateUserProfile({
        name,
        jobTitle,
        phone,
        avatar: avatarPreview || undefined,
      })
      setSaving(false)
    }, 1000)
  }

  const handleChangePassword = () => {
    setSaving(true)

    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
      })
      setSaving(false)
      return
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
      })
      setSaving(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSaving(false)
    }, 1000)
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
            <p className="text-muted-foreground">{t("profile.subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Profile Summary Card */}
          <Card className="border-gray-300 dark:border-border/50">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.jobTitle || t("profile.noJobTitle")}</p>
              <div className="w-full border-t border-gray-300 dark:border-border my-4" />
              <div className="w-full text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("profile.email")}:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("profile.role")}:</span>
                  <span className="text-sm capitalize">{user.role.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("profile.department")}:</span>
                  <span className="text-sm">{user.department || t("profile.notSet")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("profile.phone")}:</span>
                  <span className="text-sm">{user.phone || t("profile.notSet")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Edit Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">{t("profile.personalInfo")}</TabsTrigger>
              <TabsTrigger value="security">{t("profile.security")}</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card className="border-gray-300 dark:border-border/50">
                <CardHeader>
                  <CardTitle>{t("profile.personalInfo")}</CardTitle>
                  <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("profile.fullName")}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("profile.email")}</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-muted border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-title">{t("profile.jobTitle")}</Label>
                      <Input
                        id="job-title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder={t("profile.jobTitlePlaceholder")}
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("profile.phone")}</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("profile.phonePlaceholder")}
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">{t("profile.department")}</Label>
                      <Input
                        id="department"
                        value={user.department || ""}
                        disabled
                        className="bg-muted border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">{t("profile.role")}</Label>
                      <Input
                        id="role"
                        value={user.role.replace("_", " ")}
                        className="capitalize bg-muted border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                        disabled
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("profile.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("profile.saveChanges")}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card className="border-gray-300 dark:border-border/50">
                <CardHeader>
                  <CardTitle>{t("profile.security")}</CardTitle>
                  <CardDescription>{t("profile.securityDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t("profile.currentPassword")}</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t("profile.currentPasswordPlaceholder")}
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t("profile.newPassword")}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("profile.newPasswordPlaceholder")}
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("profile.confirmPassword")}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("profile.confirmPasswordPlaceholder")}
                      className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleChangePassword}
                    disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("profile.updating")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("profile.saveChanges")}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
