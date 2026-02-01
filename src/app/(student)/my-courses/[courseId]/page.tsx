import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Play,
  FileText,
  CheckCircle,
  Circle,
  ChevronRight,
  Clock,
} from "lucide-react"

interface CoursePageProps {
  params: Promise<{ courseId: string }>
}

async function getEnrollment(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    include: {
      course: {
        include: {
          instructor: {
            select: { name: true },
          },
          sections: {
            orderBy: { position: "asc" },
            include: {
              lectures: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  })

  return enrollment
}

async function getLectureProgress(userId: string, courseId: string) {
  const progress = await prisma.lectureProgress.findMany({
    where: {
      userId,
      lecture: {
        section: {
          courseId,
        },
      },
    },
    select: {
      lectureId: true,
      isCompleted: true,
      lastPosition: true,
    },
  })

  return progress.reduce(
    (acc, p) => {
      acc[p.lectureId] = { isCompleted: p.isCompleted, lastPosition: p.lastPosition }
      return acc
    },
    {} as Record<string, { isCompleted: boolean; lastPosition: number }>
  )
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseId } = await params
  const session = await auth()

  if (!session?.user) {
    return { title: "My Learning" }
  }

  const enrollment = await getEnrollment(courseId, session.user.id)

  return {
    title: enrollment?.course.title || "Course Not Found",
  }
}

export default async function CourseLearningPage({ params }: CoursePageProps) {
  const { courseId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/my-courses")
  }

  const enrollment = await getEnrollment(courseId, session.user.id)

  if (!enrollment) {
    notFound()
  }

  const lectureProgress = await getLectureProgress(session.user.id, courseId)

  const { course } = enrollment
  const totalLectures = course.sections.reduce(
    (acc, section) => acc + section.lectures.length,
    0
  )
  const completedLectures = Object.values(lectureProgress).filter(
    (p) => p.isCompleted
  ).length

  // Find the next lecture to continue
  let nextLecture: { sectionId: string; lectureId: string } | null = null
  for (const section of course.sections) {
    for (const lecture of section.lectures) {
      if (!lectureProgress[lecture.id]?.isCompleted) {
        nextLecture = { sectionId: section.id, lectureId: lecture.id }
        break
      }
    }
    if (nextLecture) break
  }

  const totalDuration = course.sections.reduce(
    (acc, section) =>
      acc +
      section.lectures.reduce(
        (lecAcc, lec) => lecAcc + (lec.videoDuration || 0),
        0
      ),
    0
  )
  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-muted-foreground">by {course.instructor.name}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {enrollment.progress}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedLectures} of {totalLectures} lectures completed
                </p>
              </div>
              <Progress value={enrollment.progress} className="h-3" />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} total
                </span>
              </div>

              {nextLecture && (
                <Button className="w-full" asChild>
                  <Link
                    href={`/my-courses/${courseId}/lectures/${nextLecture.lectureId}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {completedLectures > 0 ? "Continue" : "Start"} Learning
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Course Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {course.sections.map((section, sectionIndex) => {
                  const sectionLectures = section.lectures.length
                  const sectionCompleted = section.lectures.filter(
                    (l) => lectureProgress[l.id]?.isCompleted
                  ).length

                  return (
                    <div key={section.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">
                          Section {sectionIndex + 1}: {section.title}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {sectionCompleted}/{sectionLectures}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {section.lectures.map((lecture) => {
                          const progress = lectureProgress[lecture.id]
                          const isCompleted = progress?.isCompleted

                          return (
                            <Link
                              key={lecture.id}
                              href={`/my-courses/${courseId}/lectures/${lecture.id}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {lecture.type === "VIDEO" ? (
                                    <Play className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="truncate">{lecture.title}</span>
                                </div>
                              </div>
                              {lecture.videoDuration && (
                                <span className="text-sm text-muted-foreground">
                                  {Math.floor(lecture.videoDuration / 60)}:
                                  {(lecture.videoDuration % 60)
                                    .toString()
                                    .padStart(2, "0")}
                                </span>
                              )}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
