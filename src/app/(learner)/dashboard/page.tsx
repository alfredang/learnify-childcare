import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  CalendarClock,
  AlertTriangle,
} from "lucide-react"

export const metadata = {
  title: "Dashboard",
}

function getDeadlineBadge(deadline: Date) {
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Overdue
      </Badge>
    )
  }

  if (diffDays <= 7) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
        {diffDays} day{diffDays !== 1 ? "s" : ""} left
      </Badge>
    )
  }

  if (diffDays <= 14) {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
        {diffDays} days left
      </Badge>
    )
  }

  return (
    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
      {diffDays} days left
    </Badge>
  )
}

function getStatusBadge(status: string, progress: number) {
  if (status === "COMPLETED" || progress === 100) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
        Completed
      </Badge>
    )
  }
  if (status === "IN_PROGRESS" || progress > 0) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
        In Progress
      </Badge>
    )
  }
  if (status === "OVERDUE") {
    return (
      <Badge variant="destructive" className="text-xs">
        Overdue
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-xs">
      Not Started
    </Badge>
  )
}

export default async function LearnerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userId = session.user.id

  // Fetch all course assignments for this learner with enrollment data
  const assignments = await prisma.courseAssignment.findMany({
    where: { learnerId: userId },
    include: {
      course: {
        include: {
          category: true,
          createdBy: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  })

  // Fetch enrollments for these courses
  const courseIds = assignments.map((a) => a.courseId)
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
    },
  })

  const enrollmentMap = new Map(
    enrollments.map((e) => [e.courseId, e])
  )

  // Calculate stats
  const totalAssigned = assignments.length
  const completedAssignments = assignments.filter((a) => {
    const enrollment = enrollmentMap.get(a.courseId)
    return a.status === "COMPLETED" || (enrollment && enrollment.progress === 100)
  })
  const inProgressAssignments = assignments.filter((a) => {
    const enrollment = enrollmentMap.get(a.courseId)
    return (
      !completedAssignments.some((c) => c.id === a.id) &&
      (a.status === "IN_PROGRESS" || (enrollment && enrollment.progress > 0))
    )
  })

  const cpdPointsEarned = completedAssignments.reduce(
    (sum, a) => sum + a.course.cpdPoints,
    0
  )

  // Due soon: assignments with deadlines within the next 30 days
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const dueSoonAssignments = assignments.filter((a) => {
    if (!a.deadline) return false
    const enrollment = enrollmentMap.get(a.courseId)
    const isComplete =
      a.status === "COMPLETED" || (enrollment && enrollment.progress === 100)
    if (isComplete) return false
    return a.deadline <= thirtyDaysFromNow
  })

  // Serialize data for rendering (convert Prisma Decimal/Date types)
  const serializedAssignments = JSON.parse(JSON.stringify(assignments))
  const serializedEnrollmentMap = Object.fromEntries(
    enrollments.map((e) => [e.courseId, JSON.parse(JSON.stringify(e))])
  )

  return (
    <div className="container py-8 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, {session.user.name || "Learner"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your professional development progress below.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAssigned}</p>
                <p className="text-xs text-muted-foreground">
                  Courses Assigned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {inProgressAssignments.length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {completedAssignments.length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cpdPointsEarned}</p>
                <p className="text-xs text-muted-foreground">
                  CPD Points Earned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Soon Section */}
      {dueSoonAssignments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Due Soon</h2>
          </div>
          <div className="grid gap-3">
            {dueSoonAssignments.map((assignment) => {
              const enrollment = enrollmentMap.get(assignment.courseId)
              const progress = enrollment?.progress ?? 0

              return (
                <Link key={assignment.id} href="/my-courses">
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="font-medium truncate">
                            {assignment.course.title}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="h-3.5 w-3.5" />
                              {assignment.course.cpdPoints} CPD
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {Number(assignment.course.estimatedHours)}h
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {progress}%
                            </div>
                          </div>
                          {assignment.deadline &&
                            getDeadlineBadge(new Date(assignment.deadline))}
                        </div>
                      </div>
                      <Progress value={progress} className="mt-3 h-1.5" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* My Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">My Courses</h2>
        </div>

        {serializedAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses assigned</h3>
              <p className="text-sm text-muted-foreground">
                You have not been assigned any courses yet. Contact your
                organisation administrator to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serializedAssignments.map(
              (assignment: (typeof serializedAssignments)[number]) => {
                const enrollment =
                  serializedEnrollmentMap[assignment.courseId] || null
                const progress = enrollment?.progress ?? 0
                const course = assignment.course

                return (
                  <Link key={assignment.id} href="/my-courses">
                    <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                      {/* Thumbnail */}
                      {course.thumbnail && (
                        <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base line-clamp-2">
                            {course.title}
                          </CardTitle>
                        </div>
                        {course.category && (
                          <p className="text-xs text-muted-foreground">
                            {course.category.name}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Course Meta */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />
                            {course.cpdPoints} CPD
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {Number(course.estimatedHours)}h
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>

                        {/* Deadline + Status */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          {assignment.deadline ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarClock className="h-3.5 w-3.5" />
                              <span>
                                Due{" "}
                                {new Date(
                                  assignment.deadline
                                ).toLocaleDateString("en-SG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No deadline
                            </span>
                          )}
                          {getStatusBadge(assignment.status, progress)}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              }
            )}
          </div>
        )}
      </div>
    </div>
  )
}
