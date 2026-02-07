import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  BookOpen,
  Users,
  ClipboardList,
  Plus,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard - Learnify",
  description: "Super admin platform overview",
}

async function getDashboardStats() {
  try {
    const [
      totalOrganizations,
      totalCourses,
      totalLearners,
      totalAssignments,
      recentOrganizations,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.course.count(),
      prisma.user.count({ where: { role: "LEARNER" } }),
      prisma.courseAssignment.count(),
      prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: {
            select: {
              users: true,
              assignments: true,
            },
          },
        },
      }),
    ])

    return {
      totalOrganizations,
      totalCourses,
      totalLearners,
      totalAssignments,
      recentOrganizations,
    }
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return {
      totalOrganizations: 0,
      totalCourses: 0,
      totalLearners: 0,
      totalAssignments: 0,
      recentOrganizations: [] as Awaited<
        ReturnType<typeof prisma.organization.findMany<{
          include: { _count: { select: { users: true; assignments: true } } }
        }>>
      >,
    }
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  const stats = await getDashboardStats()

  const statCards = [
    {
      title: "Total Organizations",
      value: stats.totalOrganizations,
      icon: Building2,
      description: "Registered childcare centers",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      description: "Available training courses",
    },
    {
      title: "Total Learners",
      value: stats.totalLearners,
      icon: Users,
      description: "Active learners on platform",
    },
    {
      title: "Total Assignments",
      value: stats.totalAssignments,
      icon: ClipboardList,
      description: "Course assignments issued",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Organizations</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/organizations">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentOrganizations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No organizations yet
            </p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Learners</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrganizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{org.name}</p>
                          {org.contactEmail && (
                            <p className="text-xs text-muted-foreground">
                              {org.contactEmail}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {org.licenseNumber || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>{org._count.users}</TableCell>
                      <TableCell>{org._count.assignments}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            org.billingEnabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {org.billingEnabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {org.createdAt.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/courses/new">
                <Plus className="h-4 w-4" />
                Create Course
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/organizations/new">
                <Plus className="h-4 w-4" />
                Create Organization
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
