"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "All Courses" },
  { href: "/categories", label: "Categories" },
]

const studentItems = [
  { href: "/my-courses", label: "My Learning" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/purchases", label: "Purchases" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated, isInstructor, isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="flex flex-col space-y-4 py-4">
      <Link href="/" className="flex items-center space-x-2 px-4">
        <span className="font-bold text-xl">Learnify</span>
      </Link>

      <form onSubmit={handleSearch} className="px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <nav className="flex flex-col space-y-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}

        {isAuthenticated && (
          <>
            <div className="my-2 border-t" />
            {studentItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </>
        )}

        {isInstructor && (
          <>
            <div className="my-2 border-t" />
            <Link
              href="/instructor"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/instructor")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              Instructor Dashboard
            </Link>
          </>
        )}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/admin")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            Admin Dashboard
          </Link>
        )}
      </nav>

      {!isAuthenticated && (
        <div className="flex flex-col space-y-2 px-4 pt-4 border-t">
          <Button asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
