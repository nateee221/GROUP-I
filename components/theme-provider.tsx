"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      themes={["light", "dark"]}
      enableSystem
      attribute="class"
      defaultTheme="dark"
      value={{
        light: "light",
        dark: "dark",
        system: "system",
      }}
    >
      {children}
    </NextThemesProvider>
  )
}
