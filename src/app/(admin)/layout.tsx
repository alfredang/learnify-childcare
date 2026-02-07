"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Users,
  ArrowLeft,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses" },
  { href: "/admin/organizations", icon: Building2, label: "Organizations" },
  { href: "/admin/users", icon: Users, label: "Users" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Learnify Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground">
            Learnify Childcare Platform
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Admin</span>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
