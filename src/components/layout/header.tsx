"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Menu, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { UserMenu } from "./user-menu"
import { MobileNav } from "./mobile-nav"
import { CartDropdown } from "./cart-dropdown"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"

const mainNav = [
  { href: "/courses", label: "Courses" },
  { href: "/categories", label: "Categories" },
]

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, isInstructor, isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Hide on instructor/admin routes (they have their own layout)
  if (pathname.startsWith("/instructor") || pathname.startsWith("/admin")) {
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

        {/* Main nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 items-center px-6"
        >
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for courses..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {isInstructor && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex"
                >
                  <Link href="/instructor">Go to Instructor Dashboard</Link>
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex"
                >
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/favourites">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favourites</span>
                </Link>
              </Button>
              <CartDropdown />
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
