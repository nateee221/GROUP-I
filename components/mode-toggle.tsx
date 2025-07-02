"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "./language-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative flex-shrink-0">
          <div className="relative w-[1.2rem] h-[1.2rem] flex items-center justify-center">
            <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[120px]"
        sideOffset={5}
        avoidCollisions={true}
        collisionPadding={10}
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>{t("light")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{t("dark")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
