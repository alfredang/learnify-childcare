"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/instructor/performance", label: "Overview" },
  { href: "/instructor/performance/students", label: "Students" },
  { href: "/instructor/performance/reviews", label: "Reviews" },
  { href: "/instructor/performance/engagement", label: "Course engagement" },
  { href: "/instructor/performance/traffic", label: "Traffic & conversion" },
]

export default function PerformanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Performance</h1>
        <p className="text-sm text-muted-foreground">
          Get top insights about your performance
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <nav className="flex gap-6 border-b">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const isDisabled = tab.href !== "/instructor/performance"

          if (isDisabled) {
            return (
              <span
                key={tab.href}
                className="pb-3 text-sm text-muted-foreground/50 cursor-not-allowed"
              >
                {tab.label}
              </span>
            )
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {children}
    </div>
  )
}
