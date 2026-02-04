"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
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
  Heart,
  Receipt,
  Settings,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Bell,
  MessageSquare,
  CreditCard,
  Award,
  FileText,
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
  const queryClient = useQueryClient()

  if (!user) return null

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    queryClient.clear()
    window.location.href = "/"
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabel = {
    STUDENT: "Learner",
    INSTRUCTOR: "Instructor",
    ADMIN: "Administrator",
  }[user.role]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
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
            <Link href="/my-courses" className="cursor-pointer py-3">
              <BookOpen className="mr-3 h-4 w-4" />
              <span>My Learning</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wishlist" className="cursor-pointer py-3">
              <Heart className="mr-3 h-4 w-4" />
              <span>Wishlist</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/certificates" className="cursor-pointer py-3">
              <Award className="mr-3 h-4 w-4" />
              <span>My Certificates</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Instructor Section */}
        {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/instructor" className="cursor-pointer py-3">
                  <GraduationCap className="mr-3 h-4 w-4" />
                  <span>Instructor Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Admin Section */}
        {user.role === "ADMIN" && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer py-3">
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Notifications & Messages */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/notifications" className="cursor-pointer py-3">
              <Bell className="mr-3 h-4 w-4" />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages" className="cursor-pointer py-3">
              <MessageSquare className="mr-3 h-4 w-4" />
              <span>Messages</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Account Section */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account" className="cursor-pointer py-3">
              <User className="mr-3 h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/billing" className="cursor-pointer py-3">
              <CreditCard className="mr-3 h-4 w-4" />
              <span>Payment Methods</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/purchases" className="cursor-pointer py-3">
              <Receipt className="mr-3 h-4 w-4" />
              <span>Purchase History</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/invoices" className="cursor-pointer py-3">
              <FileText className="mr-3 h-4 w-4" />
              <span>Invoices</span>
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
