"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  BookPlus,
  BarChart3,
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const sidebarItems = [
  { href: "/corporate", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/corporate/learners", icon: Users, label: "Learners" },
  { href: "/corporate/assign", icon: BookPlus, label: "Assign Courses" },
  { href: "/corporate/progress", icon: BarChart3, label: "Progress Reports" },
]

export default function CorporateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CA"

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-muted/30 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm truncate">
                  Corporate Portal
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.name || "Admin"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/corporate" &&
                pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b px-6 py-3 bg-background">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {session?.user?.email}
            </span>
            <Avatar size="sm">
              <AvatarImage
                src={session?.user?.image || undefined}
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto border-b px-4 py-2 bg-background">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/corporate" &&
                pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
