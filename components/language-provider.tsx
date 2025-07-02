"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "fil"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.assets": "Assets",
    "nav.inventory": "Inventory",
    "nav.assignments": "Assignments",
    "nav.maintenance": "Maintenance",
    "nav.disposal": "Disposal",
    "nav.reports": "Reports",
    "nav.users": "Users",
    "nav.settings": "Settings",
    "nav.profile": "Profile",
    "nav.logout": "Logout",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.overview": "Welcome to your asset management dashboard",
    "dashboard.totalAssets": "Total Assets",
    "dashboard.activeAssets": "Active Assets",
    "dashboard.maintenanceDue": "Maintenance Due",
    "dashboard.disposalPending": "Disposal Pending",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.assetDistribution": "Asset Distribution",

    // Settings
    "settings.title": "Settings",
    "settings.general": "General",
    "settings.system": "System",
    "settings.appearance": "Appearance",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.notifications": "Notifications",
    "settings.emailNotifications": "Email Notifications",
    "settings.smsNotifications": "SMS Notifications",
    "settings.autoBackup": "Automatic Backup",
    "settings.backupFrequency": "Backup Frequency",
    "settings.dataRetention": "Data Retention Period",
    "settings.highContrast": "High Contrast",
    "settings.fontSize": "Font Size",
    "settings.save": "Save Changes",
    "settings.saving": "Saving...",
    "settings.saved": "Settings saved successfully!",

    // Profile
    "profile.title": "My Profile",
    "profile.subtitle": "Manage your personal information and account settings",
    "profile.personalInfo": "Personal Information",
    "profile.personalInfoDesc": "Update your personal details and contact information",
    "profile.security": "Security",
    "profile.securityDesc": "Update your password to keep your account secure",
    "profile.fullName": "Full Name",
    "profile.email": "Email",
    "profile.jobTitle": "Job Title",
    "profile.jobTitlePlaceholder": "Enter your job title",
    "profile.phone": "Phone Number",
    "profile.phonePlaceholder": "Enter your phone number",
    "profile.department": "Department",
    "profile.role": "Role",
    "profile.currentPassword": "Current Password",
    "profile.currentPasswordPlaceholder": "Enter your current password",
    "profile.newPassword": "New Password",
    "profile.newPasswordPlaceholder": "Enter your new password",
    "profile.confirmPassword": "Confirm New Password",
    "profile.confirmPasswordPlaceholder": "Confirm your new password",
    "profile.saveChanges": "Save Changes",
    "profile.saving": "Saving...",
    "profile.updating": "Updating...",
    "profile.noJobTitle": "No job title set",
    "profile.notSet": "Not set",

    // Login
    "login.title": "Login",
    "login.subtitle": "Enter your credentials to access your account",
    "login.email": "Email",
    "login.emailPlaceholder": "name@lgu.gov",
    "login.password": "Password",
    "login.forgotPassword": "Forgot password?",
    "login.loginButton": "Login",
    "login.loggingIn": "Logging in...",
    "login.demoAccounts": "Demo Accounts:",
    "login.admin": "Admin: admin@lgu.gov / admin123",
    "login.head": "Department Head: head@lgu.gov / head123",
    "login.staff": "Staff: staff@lgu.gov / staff123",

    // Forgot Password
    "forgotPassword.title": "Reset Password",
    "forgotPassword.subtitle": "Enter your email to receive password reset instructions",
    "forgotPassword.email": "Email",
    "forgotPassword.emailPlaceholder": "name@lgu.gov",
    "forgotPassword.sendButton": "Send Reset Instructions",
    "forgotPassword.sending": "Sending...",
    "forgotPassword.backToLogin": "Back to login",
    "forgotPassword.checkEmail": "Check your email for reset instructions",
    "forgotPassword.emailSent": "We've sent recovery instructions to",

    // Common
    "common.search": "Search...",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",

    // Theme options
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",

    // Language options
    "language.english": "English",
    "language.filipino": "Filipino",

    // Simple keys for dropdowns
    english: "English",
    filipino: "Filipino",
    light: "Light",
    dark: "Dark",
    system: "System",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    "6months": "6 Months",
    "1year": "1 Year",
    "3years": "3 Years",
    "5years": "5 Years",
    forever: "Forever",
    small: "Small",
    medium: "Medium",
    large: "Large",
  },
  fil: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.assets": "Mga Asset",
    "nav.inventory": "Imbentaryo",
    "nav.assignments": "Mga Takda",
    "nav.maintenance": "Pagpapanatili",
    "nav.disposal": "Pagtatapon",
    "nav.reports": "Mga Ulat",
    "nav.users": "Mga User",
    "nav.settings": "Mga Setting",
    "nav.profile": "Profile",
    "nav.logout": "Mag-logout",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.overview": "Maligayang pagdating sa inyong asset management dashboard",
    "dashboard.totalAssets": "Kabuuang Assets",
    "dashboard.activeAssets": "Aktibong Assets",
    "dashboard.maintenanceDue": "Maintenance na Kailangan",
    "dashboard.disposalPending": "Naghihintay na Disposal",
    "dashboard.recentActivity": "Kamakailang Aktibidad",
    "dashboard.assetDistribution": "Pamamahagi ng Asset",

    // Settings
    "settings.title": "Mga Setting",
    "settings.general": "Pangkalahatan",
    "settings.system": "Sistema",
    "settings.appearance": "Hitsura",
    "settings.language": "Wika",
    "settings.theme": "Tema",
    "settings.notifications": "Mga Notification",
    "settings.emailNotifications": "Email Notifications",
    "settings.smsNotifications": "SMS Notifications",
    "settings.autoBackup": "Automatic Backup",
    "settings.backupFrequency": "Backup Frequency",
    "settings.dataRetention": "Data Retention Period",
    "settings.highContrast": "High Contrast",
    "settings.fontSize": "Laki ng Font",
    "settings.save": "I-save ang mga Pagbabago",
    "settings.saving": "Nag-se-save...",
    "settings.saved": "Matagumpay na na-save ang mga setting!",

    // Profile
    "profile.title": "Aking Profile",
    "profile.subtitle": "Pamahalaan ang inyong personal na impormasyon at mga setting ng account",
    "profile.personalInfo": "Personal na Impormasyon",
    "profile.personalInfoDesc": "I-update ang inyong personal na detalye at impormasyon sa pakikipag-ugnayan",
    "profile.security": "Seguridad",
    "profile.securityDesc": "I-update ang inyong password upang mapanatiling secure ang inyong account",
    "profile.fullName": "Buong Pangalan",
    "profile.email": "Email",
    "profile.jobTitle": "Posisyon sa Trabaho",
    "profile.jobTitlePlaceholder": "Ilagay ang inyong posisyon sa trabaho",
    "profile.phone": "Numero ng Telepono",
    "profile.phonePlaceholder": "Ilagay ang inyong numero ng telepono",
    "profile.department": "Departamento",
    "profile.role": "Tungkulin",
    "profile.currentPassword": "Kasalukuyang Password",
    "profile.currentPasswordPlaceholder": "Ilagay ang inyong kasalukuyang password",
    "profile.newPassword": "Bagong Password",
    "profile.newPasswordPlaceholder": "Ilagay ang inyong bagong password",
    "profile.confirmPassword": "Kumpirmahin ang Bagong Password",
    "profile.confirmPasswordPlaceholder": "Kumpirmahin ang inyong bagong password",
    "profile.saveChanges": "I-save ang mga Pagbabago",
    "profile.saving": "Nag-se-save...",
    "profile.updating": "Nag-a-update...",
    "profile.noJobTitle": "Walang nakatakdang posisyon",
    "profile.notSet": "Hindi pa nakatakda",

    // Login
    "login.title": "Mag-login",
    "login.subtitle": "Ilagay ang inyong mga kredensyal para ma-access ang inyong account",
    "login.email": "Email",
    "login.emailPlaceholder": "pangalan@lgu.gov",
    "login.password": "Password",
    "login.forgotPassword": "Nakalimutan ang password?",
    "login.loginButton": "Mag-login",
    "login.loggingIn": "Naglo-login...",
    "login.demoAccounts": "Mga Demo Account:",
    "login.admin": "Admin: admin@lgu.gov / admin123",
    "login.head": "Department Head: head@lgu.gov / head123",
    "login.staff": "Staff: staff@lgu.gov / staff123",

    // Forgot Password
    "forgotPassword.title": "I-reset ang Password",
    "forgotPassword.subtitle": "Ilagay ang inyong email para makatanggap ng mga tagubilin sa pag-reset ng password",
    "forgotPassword.email": "Email",
    "forgotPassword.emailPlaceholder": "pangalan@lgu.gov",
    "forgotPassword.sendButton": "Ipadala ang mga Tagubilin sa Pag-reset",
    "forgotPassword.sending": "Ipinapadala...",
    "forgotPassword.backToLogin": "Bumalik sa login",
    "forgotPassword.checkEmail": "Tingnan ang inyong email para sa mga tagubilin sa pag-reset",
    "forgotPassword.emailSent": "Nagpadala kami ng mga tagubilin sa pag-recover sa",

    // Common
    "common.search": "Maghanap...",
    "common.loading": "Naglo-load...",
    "common.save": "I-save",
    "common.cancel": "Kanselahin",

    // Theme options
    "theme.light": "Maliwanag",
    "theme.dark": "Madilim",
    "theme.system": "Sistema",

    // Language options
    "language.english": "English",
    "language.filipino": "Filipino",

    // Simple keys for dropdowns
    english: "English",
    filipino: "Filipino",
    light: "Maliwanag",
    dark: "Madilim",
    system: "Sistema",
    daily: "Araw-araw",
    weekly: "Lingguhan",
    monthly: "Buwanan",
    "6months": "6 na Buwan",
    "1year": "1 Taon",
    "3years": "3 Taon",
    "5years": "5 Taon",
    forever: "Walang Hanggan",
    small: "Maliit",
    medium: "Katamtaman",
    large: "Malaki",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fil")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: string): string => {
    const translation = translations[language][key]
    if (translation) {
      return translation
    }

    // Fallback: if key not found, return a cleaned version of the key
    if (key.includes(".")) {
      const parts = key.split(".")
      const lastPart = parts[parts.length - 1]
      // Convert camelCase to Title Case
      return lastPart.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    }

    return key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
