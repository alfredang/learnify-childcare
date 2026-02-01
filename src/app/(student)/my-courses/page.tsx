import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { BookOpen, Play } from "lucide-react"

export const metadata: Metadata = {
  title: "My Learning",
  description: "Your enrolled courses",
}

async function getEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: {
            select: { name: true, image: true },
          },
          sections: {
            include: {
              lectures: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
    orderBy: { lastAccessedAt: "desc" },
  })
}

export default async function MyCoursesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/my-courses")
  }

  const enrollments = await getEnrollments(session.user.id)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Learning</h1>

      {enrollments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const totalLectures = enrollment.course.sections.reduce(
              (acc, section) => acc + section.lectures.length,
              0
            )

            return (
              <Card key={enrollment.id} className="overflow-hidden">
                <Link href={`/my-courses/${enrollment.course.id}`}>
                  <div className="relative aspect-video">
                    <Image
                      src={
                        enrollment.course.thumbnail ||
                        "/images/placeholder-course.jpg"
                      }
                      alt={enrollment.course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <Play className="h-8 w-8 text-slate-900 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/my-courses/${enrollment.course.id}`}>
                    <h3 className="font-semibold line-clamp-2 hover:text-primary mb-2">
                      {enrollment.course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4">
                    {enrollment.course.instructor.name}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{enrollment.progress}% complete</span>
                      <span>
                        {Math.round((enrollment.progress / 100) * totalLectures)}/
                        {totalLectures} lectures
                      </span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                  </div>
                  <Button className="w-full mt-4" asChild>
                    <Link href={`/my-courses/${enrollment.course.id}`}>
                      {enrollment.progress > 0 ? "Continue" : "Start"} Learning
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Start learning by enrolling in your first course"
          actionLabel="Browse Courses"
          actionHref="/courses"
        />
      )}
    </div>
  )
}
