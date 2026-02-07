import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookPlus, Clock, Award, Tag } from "lucide-react"
import { FIXED_PRICE_SGD } from "@/lib/constants"
import { AssignCourseForm } from "./assign-course-form"

export const metadata: Metadata = {
  title: "Assign Courses",
  description: "Assign courses to learners in your organization",
}

async function getCoursesAndLearners(organizationId: string) {
  try {
    const [courses, learners, existingAssignments] = await Promise.all([
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          cpdPoints: true,
          estimatedHours: true,
          priceSgd: true,
          level: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.user.findMany({
        where: {
          organizationId,
          role: "LEARNER",
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      }),
      prisma.courseAssignment.findMany({
        where: { organizationId },
        select: {
          learnerId: true,
          courseId: true,
          status: true,
        },
      }),
    ])

    // Build a map of courseId -> list of assigned learner IDs
    const assignmentMap: Record<string, { learnerId: string; status: string }[]> = {}
    for (const a of existingAssignments) {
      if (!assignmentMap[a.courseId]) {
        assignmentMap[a.courseId] = []
      }
      assignmentMap[a.courseId].push({
        learnerId: a.learnerId,
        status: a.status,
      })
    }

    const serializedCourses = courses.map((course) => ({
      ...course,
      priceSgd: Number(course.priceSgd),
      estimatedHours: Number(course.estimatedHours),
      assignedLearners: assignmentMap[course.id] || [],
    }))

    return {
      courses: serializedCourses,
      learners,
      existingAssignments: assignmentMap,
    }
  } catch (error) {
    console.error("Failed to fetch courses and learners:", error)
    return {
      courses: [] as {
        id: string
        title: string
        slug: string
        thumbnail: string | null
        cpdPoints: number
        estimatedHours: number
        priceSgd: number
        level: string
        category: { id: string; name: string; slug: string }
        assignedLearners: { learnerId: string; status: string }[]
      }[],
      learners: [] as { id: string; name: string | null; email: string; image: string | null }[],
      existingAssignments: {} as Record<string, { learnerId: string; status: string }[]>,
    }
  }
}

async function getOrganization(organizationId: string) {
  try {
    return await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, billingEnabled: true },
    })
  } catch (error) {
    console.error("Failed to fetch organization:", error)
    return null
  }
}

export default async function AssignCoursesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/corporate/assign")
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

  const [{ courses, learners }, organization] = await Promise.all([
    getCoursesAndLearners(session.user.organizationId),
    getOrganization(session.user.organizationId),
  ])

  const billingEnabled = organization?.billingEnabled ?? false

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Assign Courses</h1>
        <p className="text-muted-foreground">
          Browse available courses and assign them to your learners
        </p>
      </div>

      {/* Course Catalog */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <BookPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No courses available</h3>
              <p className="text-sm text-muted-foreground mt-1">
                There are no published courses available for assignment yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const assignedLearnerIds = course.assignedLearners.map(
              (a) => a.learnerId
            )
            const availableLearners = learners.filter(
              (l) => !assignedLearnerIds.includes(l.id)
            )

            return (
              <Card key={course.id} className="flex flex-col">
                {/* Course Thumbnail */}
                {course.thumbnail && (
                  <div className="relative aspect-video overflow-hidden rounded-t-xl">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {course.title}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {course.level.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      {course.category.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {course.cpdPoints} CPD pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.estimatedHours}h
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      S${course.priceSgd.toFixed(2)}
                    </span>
                    {course.assignedLearners.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {course.assignedLearners.length} already assigned
                      </span>
                    )}
                  </div>

                  {/* Already Assigned Learners */}
                  {course.assignedLearners.length > 0 && (
                    <div className="rounded-md border p-3 bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Assigned to:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {course.assignedLearners.map((assignment) => {
                          const learner = learners.find(
                            (l) => l.id === assignment.learnerId
                          )
                          if (!learner) return null
                          return (
                            <Badge
                              key={assignment.learnerId}
                              variant="outline"
                              className="text-xs"
                            >
                              {learner.name || learner.email}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assign Form */}
                  {availableLearners.length > 0 ? (
                    <AssignCourseForm
                      courseId={course.id}
                      courseTitle={course.title}
                      priceSgd={course.priceSgd}
                      availableLearners={JSON.parse(
                        JSON.stringify(availableLearners)
                      )}
                      billingEnabled={billingEnabled}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      All learners have been assigned
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
