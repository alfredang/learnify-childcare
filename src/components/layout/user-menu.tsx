"use client"

import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { serverSignOut } from "@/app/actions/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  BookOpen,
  LogOut,
  LayoutDashboard,
  Award,
  Building2,
} from "lucide-react"
import type { UserRole } from "@prisma/client"

interface UserMenuProps {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queryClient = useQueryClient()

  if (!user) return null

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current)
      closeTimeout.current = null
    }
    setOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setOpen(false)
    }, 300)
  }

  const handleSignOut = async () => {
    queryClient.clear()
    await serverSignOut()
    window.location.href = "/"
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabel = {
    LEARNER: "Learner",
    CORPORATE_ADMIN: "Corporate Admin",
    SUPER_ADMIN: "Super Admin",
  }[user.role]

  return (
    <DropdownMenu open={open} modal={false}>
      <DropdownMenuTrigger asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72"
        align="end"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="text-lg">{initials || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="w-fit text-xs">
              {roleLabel}
            </Badge>
          </div>
        </div>

        {/* Learning Section */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="cursor-pointer py-3">
              <LayoutDashboard className="mr-3 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-courses" className="cursor-pointer py-3">
              <BookOpen className="mr-3 h-4 w-4" />
              <span>My Courses</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/certificates" className="cursor-pointer py-3">
              <Award className="mr-3 h-4 w-4" />
              <span>My Certificates</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* Corporate Admin Section */}
        {(user.role === "CORPORATE_ADMIN" || user.role === "SUPER_ADMIN") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/corporate" className="cursor-pointer py-3">
                  <Building2 className="mr-3 h-4 w-4" />
                  <span>Corporate Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        {/* Super Admin Section */}
        {user.role === "SUPER_ADMIN" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer py-3">
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Account Section */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account" className="cursor-pointer py-3">
              <User className="mr-3 h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer py-3 text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
