"use client"

import type React from "react"

import type { SVGProps } from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Building2,
  ClipboardList,
  Cog,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Repeat,
  Search,
  Settings,
  Truck,
  Users,
  Wrench,
  Building,
  Shield,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes" // Import useTheme hook directly from next-themes

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const { theme, resolvedTheme } = useTheme() // Get both theme and resolvedTheme

  // Always call useEffect hooks
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  // Early return after all hooks
  if (!isMounted) {
    return null
  }

  if (!user) {
    return null
  }

  const navigation = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("nav.assets"), href: "/assets", icon: Package },
    { name: t("nav.inventory"), href: "/inventory", icon: ClipboardList },
    { name: t("nav.assignments"), href: "/assignments", icon: Repeat },
    { name: t("nav.maintenance"), href: "/maintenance", icon: Wrench },
    { name: t("nav.disposal"), href: "/disposal", icon: Truck },
    { name: t("nav.reports"), href: "/reports", icon: FileText },
    ...(user.role === "admin"
      ? [
          { name: t("nav.users"), href: "/users", icon: Users },
          { name: "Departments", href: "/departments", icon: Building },
        ]
      : []),
    ...(user.role === "admin" || user.role === "department_head"
      ? [{ name: "Audit Trail", href: "/audit", icon: Shield }]
      : []),
    { name: t("nav.settings"), href: "/settings", icon: Cog },
  ]

  // Search data - in a real app, this would come from your API/database
  const searchData = [
    // Navigation items
    ...navigation.map((item) => ({
      type: "navigation" as const,
      title: item.name,
      href: item.href,
      icon: item.icon,
    })),
    // Sample assets
    {
      type: "asset" as const,
      title: "Dell XPS 15 Laptop",
      href: "/assets",
      description: "ID: A001 - IT Department",
      icon: Package,
    },
    {
      type: "asset" as const,
      title: "HP LaserJet Pro Printer",
      href: "/assets",
      description: "ID: A002 - Finance Department",
      icon: Package,
    },
    {
      type: "asset" as const,
      title: "Conference Room Table",
      href: "/assets",
      description: "ID: A003 - Administration",
      icon: Package,
    },
    // Sample inventory items
    {
      type: "inventory" as const,
      title: "Printer Paper (A4)",
      href: "/inventory",
      description: "450 Reams in stock",
      icon: ClipboardList,
    },
    {
      type: "inventory" as const,
      title: "Ink Cartridges (Black)",
      href: "/inventory",
      description: "25 Cartridges in stock",
      icon: ClipboardList,
    },
    // Quick actions
    {
      type: "action" as const,
      title: "Add New Asset",
      href: "/assets",
      description: "Create a new asset record",
      icon: Package,
    },
    {
      type: "action" as const,
      title: "Request Inventory",
      href: "/inventory",
      description: "Submit an inventory request",
      icon: ClipboardList,
    },
    {
      type: "action" as const,
      title: "Generate Report",
      href: "/reports",
      description: "Create a new report",
      icon: FileText,
    },
  ]

  const userInitials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
        <div className="flex flex-col flex-grow border-r border-gray-300 dark:border-border bg-card">
          <div className="flex items-center flex-shrink-0 px-4 h-16">
            <Building2 className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold">LGU Asset Manager</span>
          </div>
          <div className="flex-grow flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet>
        <div className="flex h-16 bg-card border-b border-gray-300 dark:border-border md:hidden">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="px-4">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <Building2 className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-semibold">LGU Asset Manager</span>
            </div>
            <div className="flex items-center">
              <ModeToggle />
            </div>
          </div>
        </div>
        <SheetContent side="left" className="w-[240px] sm:w-[280px]">
          <div className="flex items-center mb-6">
            <Building2 className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold">LGU Asset Manager</span>
          </div>
          <nav className="flex flex-col space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Header */}
        <div className={cn("flex h-16 border-b border-gray-300 dark:border-border", "bg-white dark:bg-card")}>
          <div className={cn("flex-1 flex justify-between px-4")}>
            <div className="flex-1 flex items-center">
              <div className="max-w-xs w-full hidden md:block">
                <Button
                  variant="outline"
                  className="relative w-full justify-start text-sm text-muted-foreground border-gray-300 focus:border-primary dark:border-input dark:focus:border-primary"
                  onClick={() => setOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search...
                </Button>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-3 flex-shrink-0">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
              <ModeToggle />
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full flex-shrink-0">
                    <Avatar>
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[200px]"
                  sideOffset={5}
                  avoidCollisions={true}
                  collisionPadding={10}
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.role.replace("_", " ")}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{t("nav.profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("nav.settings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="bg-muted/40 min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>
        </main>
      </div>

      {/* Command Dialog for Search */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {searchData
              .filter((item) => item.type === "navigation")
              .map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => {
                    runCommand(() => router.push(item.href))
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Assets">
            {searchData
              .filter((item) => item.type === "asset")
              .map((item, index) => (
                <CommandItem
                  key={`asset-${index}`}
                  value={item.title}
                  onSelect={() => {
                    runCommand(() => router.push(item.href))
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Inventory">
            {searchData
              .filter((item) => item.type === "inventory")
              .map((item, index) => (
                <CommandItem
                  key={`inventory-${index}`}
                  value={item.title}
                  onSelect={() => {
                    runCommand(() => router.push(item.href))
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            {searchData
              .filter((item) => item.type === "action")
              .map((item, index) => (
                <CommandItem
                  key={`action-${index}`}
                  value={item.title}
                  onSelect={() => {
                    runCommand(() => router.push(item.href))
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

function User(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
