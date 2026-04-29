"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
        <Sun className="h-[1.2rem] w-[1.2rem] text-slate-400" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full w-9 h-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {!isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500 transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
