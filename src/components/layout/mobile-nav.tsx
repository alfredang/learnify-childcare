"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Building2,
  Shield,
} from "lucide-react"

const authenticatedItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-courses", label: "My Courses", icon: BookOpen },
  { href: "/certificates", label: "Certificates", icon: Award },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated, isCorporateAdmin, isSuperAdmin } = useAuth()

  return (
    <div className="flex flex-col space-y-4 py-4">
      <Link href="/" className="flex items-center gap-2 px-4">
        <span className="font-bold text-xl">Learnify</span>
      </Link>

      <nav className="flex flex-col space-y-1 px-2">
        {isAuthenticated && (
          <>
            {authenticatedItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {(isCorporateAdmin || isSuperAdmin) && (
              <>
                <div className="my-2 border-t" />
                <Link
                  href="/corporate"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname.startsWith("/corporate")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  Corporate Dashboard
                </Link>
              </>
            )}

            {isSuperAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname.startsWith("/admin")
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </>
        )}
      </nav>

      {!isAuthenticated && (
        <div className="flex flex-col space-y-2 px-4 pt-4 border-t">
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
