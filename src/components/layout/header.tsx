"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { UserMenu } from "./user-menu"
import { MobileNav } from "./mobile-nav"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, isCorporateAdmin, isSuperAdmin } = useAuth()

  // Hide on corporate/admin routes (they have their own layout)
  if (pathname.startsWith("/corporate") || pathname.startsWith("/admin")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto pr-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <MobileNav />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <circle cx="14" cy="14" r="14" className="fill-foreground" />
            <path d="M8.5 19L14 7.5L19.5 19H8.5Z" className="fill-background" />
          </svg>
          <span className="font-bold text-xl">Learnify</span>
        </Link>

        {/* Nav links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/my-courses"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname.startsWith("/my-courses") ? "text-foreground" : "text-foreground/60"
              )}
            >
              My Courses
            </Link>
            <Link
              href="/certificates"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/certificates" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Certificates
            </Link>
          </nav>
        )}

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {isCorporateAdmin && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/corporate">Corporate Dashboard</Link>
                </Button>
              )}
              {isSuperAdmin && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
