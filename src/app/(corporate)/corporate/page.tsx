import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  BookPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Corporate Dashboard",
  description: "Manage your organization's learning programs",
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default"
    case "IN_PROGRESS":
      return "secondary"
    case "OVERDUE":
      return "destructive"
    case "ASSIGNED":
      return "outline"
    default:
      return "outline"
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "ASSIGNED":
      return "Assigned"
    case "IN_PROGRESS":
      return "In Progress"
    case "COMPLETED":
      return "Completed"
    case "OVERDUE":
      return "Overdue"
    default:
      return status
  }
}

async function getDashboardData(organizationId: string) {
  try {
    const [
      organization,
      totalLearners,
      totalAssignments,
      completedAssignments,
      overdueAssignments,
      recentAssignments,
    ] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, name: true, slug: true, maxLearners: true, billingEnabled: true },
      }),
      prisma.user.count({
        where: { organizationId, role: "LEARNER" },
      }),
      prisma.courseAssignment.count({
        where: { organizationId },
      }),
      prisma.courseAssignment.count({
        where: { organizationId, status: "COMPLETED" },
      }),
      prisma.courseAssignment.count({
        where: { organizationId, status: "OVERDUE" },
      }),
      prisma.courseAssignment.findMany({
        where: { organizationId },
        orderBy: { assignedAt: "desc" },
        take: 10,
        include: {
          learner: {
            select: { id: true, name: true, email: true, image: true },
          },
          course: {
            select: { id: true, title: true, slug: true },
          },
          assignedBy: {
            select: { id: true, name: true },
          },
        },
      }),
    ])

    const completionRate =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0

    return {
      organization,
      totalLearners,
      totalAssignments,
      completedAssignments,
      overdueAssignments,
      completionRate,
      recentAssignments,
    }
  } catch (error) {
    console.error("Failed to fetch corporate dashboard data:", error)
    return {
      organization: null,
      totalLearners: 0,
      totalAssignments: 0,
      completedAssignments: 0,
      overdueAssignments: 0,
      completionRate: 0,
      recentAssignments: [] as Awaited<ReturnType<typeof prisma.courseAssignment.findMany<{
        include: {
          learner: { select: { id: true; name: true; email: true; image: true } };
          course: { select: { id: true; title: true; slug: true } };
          assignedBy: { select: { id: true; name: true } };
        }
      }>>>,
    }
  }
}

export default async function CorporateDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/corporate")
  }

  if (
    session.user.role !== "CORPORATE_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/dashboard")
  }

  if (!session.user.organizationId) {
    redirect("/dashboard")
  }

  const data = await getDashboardData(session.user.organizationId)

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {data.organization?.name || "Corporate"} Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your organization&apos;s learning programs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/corporate/learners">
              <UserPlus className="h-4 w-4" />
              Invite Learner
            </Link>
          </Button>
          <Button asChild>
            <Link href="/corporate/assign">
              <BookPlus className="h-4 w-4" />
              Assign Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Learners
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLearners}</div>
            <p className="text-xs text-muted-foreground">
              of {data.organization?.maxLearners || 50} max capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Assigned
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {data.completedAssignments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              across all assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", data.overdueAssignments > 0 && "text-destructive")}>
              {data.overdueAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              assignments past deadline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Assignments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/corporate/progress">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No assignments yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start by assigning courses to your learners.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/corporate/assign">Assign a Course</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {assignment.learner.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.learner.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {assignment.course.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      {assignment.deadline ? (
                        <span
                          className={cn(
                            "text-sm",
                            assignment.status === "OVERDUE" &&
                              "text-destructive font-medium"
                          )}
                        >
                          {new Date(assignment.deadline).toLocaleDateString(
                            "en-SG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No deadline
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(assignment.status)}
                      >
                        {formatStatusLabel(assignment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(assignment.assignedAt).toLocaleDateString(
                        "en-SG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
