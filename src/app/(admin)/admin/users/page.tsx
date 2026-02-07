import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata: Metadata = {
  title: "User Management - Learnify",
  description: "Manage all platform users",
}

interface SearchParams {
  role?: string
}

async function getUsers(roleFilter?: string) {
  try {
    const where = roleFilter && roleFilter !== "ALL"
      ? { role: roleFilter as "LEARNER" | "CORPORATE_ADMIN" | "SUPER_ADMIN" }
      : {}

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return []
  }
}

const roleConfig: Record<string, { label: string; className: string }> = {
  SUPER_ADMIN: {
    label: "Super Admin",
    className: "bg-purple-100 text-purple-800",
  },
  CORPORATE_ADMIN: {
    label: "Corporate Admin",
    className: "bg-blue-100 text-blue-800",
  },
  LEARNER: {
    label: "Learner",
    className: "bg-green-100 text-green-800",
  },
}

const roleFilterOptions = [
  { value: "ALL", label: "All Roles" },
  { value: "LEARNER", label: "Learners" },
  { value: "CORPORATE_ADMIN", label: "Corporate Admins" },
  { value: "SUPER_ADMIN", label: "Super Admins" },
]

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/users")
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  const params = await searchParams
  const currentRole = params.role || "ALL"
  const users = await getUsers(currentRole)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all platform users
        </p>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Filter by role:
        </span>
        <div className="flex gap-1">
          {roleFilterOptions.map((option) => (
            <a
              key={option.value}
              href={
                option.value === "ALL"
                  ? "/admin/users"
                  : `/admin/users?role=${option.value}`
              }
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                currentRole === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            No users found{currentRole !== "ALL" ? ` with role "${currentRole}"` : ""}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const role = roleConfig[user.role] || {
                  label: user.role,
                  className: "bg-gray-100 text-gray-800",
                }

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback className="text-xs">
                            {user.name
                              ? user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.name || "No name"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={role.className}
                      >
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user.organization?.name || "None"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {user.createdAt.toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* User Count */}
      <div className="text-sm text-muted-foreground">
        Showing {users.length} user{users.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
