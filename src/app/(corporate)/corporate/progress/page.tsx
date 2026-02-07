import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BarChart3, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { ASSIGNMENT_STATUSES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Progress Reports",
  description: "Track learner progress across all course assignments",
}

interface ProgressPageProps {
  searchParams: Promise<{
    status?: string
    sort?: string
  }>
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

function getStatusBadgeClassName(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-600 text-white hover:bg-emerald-600/90"
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100/90"
    case "OVERDUE":
      return "bg-red-100 text-red-800 hover:bg-red-100/90"
    case "ASSIGNED":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/90"
    default:
      return ""
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

async function getAssignments(
  organizationId: string,
  statusFilter?: string,
  sortBy?: string
) {
  try {
    const where: {
      organizationId: string
      status?: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE"
    } = {
      organizationId,
    }

    if (
      statusFilter &&
      ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE"].includes(statusFilter)
    ) {
      where.status = statusFilter as "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE"
    }

    const orderBy =
      sortBy === "deadline"
        ? ({ deadline: "asc" as const })
        : ({ assignedAt: "desc" as const })

    const assignments = await prisma.courseAssignment.findMany({
      where,
      orderBy,
      include: {
        learner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            jobTitle: true,
            staffId: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            cpdPoints: true,
            estimatedHours: true,
            totalLectures: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // For each assignment, get enrollment progress if it exists
    const assignmentsWithProgress = await Promise.all(
      assignments.map(async (assignment) => {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: assignment.learnerId,
              courseId: assignment.courseId,
            },
          },
          select: {
            progress: true,
            completedAt: true,
            lastAccessedAt: true,
          },
        })

        return {
          ...assignment,
          enrollmentProgress: enrollment?.progress ?? 0,
          completedAt: enrollment?.completedAt,
          lastAccessedAt: enrollment?.lastAccessedAt,
        }
      })
    )

    return assignmentsWithProgress
  } catch (error) {
    console.error("Failed to fetch assignments:", error)
    return []
  }
}

async function getStatusCounts(organizationId: string) {
  try {
    const [all, assigned, inProgress, completed, overdue] = await Promise.all([
      prisma.courseAssignment.count({ where: { organizationId } }),
      prisma.courseAssignment.count({
        where: { organizationId, status: "ASSIGNED" },
      }),
      prisma.courseAssignment.count({
        where: { organizationId, status: "IN_PROGRESS" },
      }),
      prisma.courseAssignment.count({
        where: { organizationId, status: "COMPLETED" },
      }),
      prisma.courseAssignment.count({
        where: { organizationId, status: "OVERDUE" },
      }),
    ])

    return { all, assigned, inProgress, completed, overdue }
  } catch (error) {
    console.error("Failed to fetch status counts:", error)
    return { all: 0, assigned: 0, inProgress: 0, completed: 0, overdue: 0 }
  }
}

export default async function ProgressReportsPage({
  searchParams,
}: ProgressPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/corporate/progress")
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

  const resolvedSearchParams = await searchParams
  const statusFilter = resolvedSearchParams.status || ""
  const sortBy = resolvedSearchParams.sort || "assigned"

  const [assignments, statusCounts] = await Promise.all([
    getAssignments(session.user.organizationId, statusFilter, sortBy),
    getStatusCounts(session.user.organizationId),
  ])

  const statusFilters = [
    { value: "", label: "All", count: statusCounts.all },
    { value: "ASSIGNED", label: "Assigned", count: statusCounts.assigned },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      count: statusCounts.inProgress,
    },
    { value: "COMPLETED", label: "Completed", count: statusCounts.completed },
    { value: "OVERDUE", label: "Overdue", count: statusCounts.overdue },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Progress Reports</h1>
        <p className="text-muted-foreground">
          Track learner progress across all course assignments
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {statusFilters.map((filter) => {
          const isActive = statusFilter === filter.value

          const href = new URLSearchParams()
          if (filter.value) href.set("status", filter.value)
          if (sortBy && sortBy !== "assigned") href.set("sort", sortBy)
          const hrefString = href.toString()

          return (
            <Button
              key={filter.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link
                href={`/corporate/progress${hrefString ? `?${hrefString}` : ""}`}
              >
                {filter.label}
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="ml-1.5"
                >
                  {filter.count}
                </Badge>
              </Link>
            </Button>
          )
        })}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        {[
          { value: "assigned", label: "Assigned Date" },
          { value: "deadline", label: "Deadline" },
        ].map((option) => {
          const isActive =
            sortBy === option.value ||
            (!sortBy && option.value === "assigned")

          const href = new URLSearchParams()
          if (statusFilter) href.set("status", statusFilter)
          if (option.value !== "assigned") href.set("sort", option.value)
          const hrefString = href.toString()

          return (
            <Button
              key={option.value}
              variant={isActive ? "secondary" : "ghost"}
              size="xs"
              asChild
            >
              <Link
                href={`/corporate/progress${hrefString ? `?${hrefString}` : ""}`}
              >
                {option.label}
              </Link>
            </Button>
          )
        })}
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {assignments.length} Assignment{assignments.length !== 1 ? "s" : ""}
            {statusFilter && (
              <span className="text-sm font-normal text-muted-foreground">
                -- {formatStatusLabel(statusFilter)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No assignments found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter
                  ? `No assignments with status "${formatStatusLabel(statusFilter)}".`
                  : "Start by assigning courses to your learners."}
              </p>
              {!statusFilter && (
                <Button className="mt-4" asChild>
                  <Link href="/corporate/assign">Assign a Course</Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Learner</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    {/* Learner */}
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

                    {/* Course */}
                    <TableCell>
                      <div>
                        <p className="font-medium">{assignment.course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.course.cpdPoints} CPD pts
                          {" / "}
                          {Number(assignment.course.estimatedHours)}h est.
                        </p>
                      </div>
                    </TableCell>

                    {/* Progress */}
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress
                          value={assignment.enrollmentProgress}
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-medium w-10 text-right">
                          {assignment.enrollmentProgress}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        className={cn(
                          getStatusBadgeClassName(assignment.status)
                        )}
                      >
                        {formatStatusLabel(assignment.status)}
                      </Badge>
                    </TableCell>

                    {/* Deadline */}
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

                    {/* Assigned Date */}
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
