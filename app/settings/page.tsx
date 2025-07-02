"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState("general")
  const [saving, setSaving] = useState(false)

  // General settings
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  // System settings
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("weekly")
  const [dataRetention, setDataRetention] = useState("1year")

  // Appearance settings
  const [selectedTheme, setSelectedTheme] = useState(theme || "dark")
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState("medium")

  const handleSaveSettings = () => {
    setSaving(true)

    // Apply theme change
    setTheme(selectedTheme)

    // Apply language change
    if (selectedLanguage !== language) {
      setLanguage(selectedLanguage as "en" | "fil")
    }

    // Simulate API call
    setTimeout(() => {
      toast({
        title: t("settings.saved"),
        description: "Your settings have been updated successfully.",
      })
      setSaving(false)
    }, 1000)
  }

  return (
    <>
      <style jsx global>{`
        .container {
          scrollbar-gutter: stable;
        }
        
        /* Prevent layout shift from dropdowns */
        [data-radix-popper-content-wrapper] {
          z-index: 50 !important;
          position: fixed !important;
        }
        
        /* Ensure consistent width for select triggers */
        [data-radix-select-trigger] {
          min-width: 200px;
        }
      `}</style>
      <DashboardLayout>
        <div className="container mx-auto py-6 space-y-6 max-w-4xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">{t("settings.general")}</TabsTrigger>
              <TabsTrigger value="system">{t("settings.system")}</TabsTrigger>
              <TabsTrigger value="appearance">{t("settings.appearance")}</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-4">
              <Card className="border-gray-300 dark:border-border/50">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Manage your general preferences and notification settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 min-h-[400px]">
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("settings.language")}</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger
                        id="language"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary w-full"
                      >
                        <SelectValue placeholder={t("settings.language")} />
                      </SelectTrigger>
                      <SelectContent className="z-50" side="bottom" align="start" sideOffset={4}>
                        <SelectItem value="en">{t("english")}</SelectItem>
                        <SelectItem value="fil">{t("filipino")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Select your preferred language for the interface.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{t("settings.notifications")}</h3>
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>{t("settings.emailNotifications")}</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Receive email notifications for important updates.
                        </span>
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
                        <span>{t("settings.smsNotifications")}</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Receive SMS notifications for critical alerts.
                        </span>
                      </Label>
                      <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("settings.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("settings.save")}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-4">
              <Card className="border-gray-300 dark:border-border/50">
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system behavior and data management settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 min-h-[400px]">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-backup" className="flex flex-col space-y-1">
                      <span>{t("settings.autoBackup")}</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Automatically backup your data periodically.
                      </span>
                    </Label>
                    <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">{t("settings.backupFrequency")}</Label>
                    <Select value={backupFrequency} onValueChange={setBackupFrequency} disabled={!autoBackup}>
                      <SelectTrigger
                        id="backup-frequency"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary w-full"
                      >
                        <SelectValue placeholder={t("settings.backupFrequency")} />
                      </SelectTrigger>
                      <SelectContent className="z-50" side="bottom" align="start" sideOffset={4}>
                        <SelectItem value="daily">{t("daily")}</SelectItem>
                        <SelectItem value="weekly">{t("weekly")}</SelectItem>
                        <SelectItem value="monthly">{t("monthly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-retention">{t("settings.dataRetention")}</Label>
                    <Select value={dataRetention} onValueChange={setDataRetention}>
                      <SelectTrigger
                        id="data-retention"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary w-full"
                      >
                        <SelectValue placeholder={t("settings.dataRetention")} />
                      </SelectTrigger>
                      <SelectContent className="z-50" side="bottom" align="start" sideOffset={4}>
                        <SelectItem value="6months">{t("6months")}</SelectItem>
                        <SelectItem value="1year">{t("1year")}</SelectItem>
                        <SelectItem value="3years">{t("3years")}</SelectItem>
                        <SelectItem value="5years">{t("5years")}</SelectItem>
                        <SelectItem value="forever">{t("forever")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("settings.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("settings.save")}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-4">
              <Card className="border-gray-300 dark:border-border/50">
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 min-h-[400px]">
                  <div className="space-y-2">
                    <Label htmlFor="theme">{t("settings.theme")}</Label>
                    <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme} className="flex space-x-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light">{t("light")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark">{t("dark")}</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme.</p>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="high-contrast" className="flex flex-col space-y-1">
                      <span>{t("settings.highContrast")}</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Increase contrast for better visibility.
                      </span>
                    </Label>
                    <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">{t("settings.fontSize")}</Label>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger
                        id="font-size"
                        className="border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary w-full"
                      >
                        <SelectValue placeholder={t("settings.fontSize")} />
                      </SelectTrigger>
                      <SelectContent className="z-50" side="bottom" align="start" sideOffset={4}>
                        <SelectItem value="small">{t("small")}</SelectItem>
                        <SelectItem value="medium">{t("medium")}</SelectItem>
                        <SelectItem value="large">{t("large")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("settings.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t("settings.save")}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  )
}
