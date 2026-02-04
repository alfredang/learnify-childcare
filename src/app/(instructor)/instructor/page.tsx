import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  Plus,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Instructor Dashboard",
  description: "Manage your courses and track your performance",
}

async function getInstructorStats(userId: string) {
  try {
    const [courses, totalStudents, totalEarnings, avgRating] = await Promise.all([
      prisma.course.count({
        where: { instructorId: userId },
      }),
      prisma.enrollment.count({
        where: {
          course: { instructorId: userId },
        },
      }),
      prisma.purchase.aggregate({
        where: {
          course: { instructorId: userId },
          status: "COMPLETED",
        },
        _sum: { instructorEarning: true },
      }),
      prisma.course.aggregate({
        where: {
          instructorId: userId,
          status: "PUBLISHED",
        },
        _avg: { averageRating: true },
      }),
    ])

    return {
      totalCourses: courses,
      totalStudents,
      totalEarnings: totalEarnings._sum.instructorEarning || 0,
      averageRating: avgRating._avg.averageRating || 0,
    }
  } catch (error) {
    console.error("Failed to fetch instructor stats:", error)
    return {
      totalCourses: 0,
      totalStudents: 0,
      totalEarnings: 0,
      averageRating: 0,
    }
  }
}

async function getRecentCourses(userId: string) {
  try {
    return await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        category: true,
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    })
  } catch (error) {
    console.error("Failed to fetch recent courses:", error)
    return []
  }
}

export default async function InstructorDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  const [stats, recentCourses] = await Promise.all([
    getInstructorStats(session.user.id),
    getRecentCourses(session.user.id),
  ])

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalStudents.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalEarnings / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.averageRating).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Courses</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/instructor/courses">
              View all
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentCourses.length > 0 ? (
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/instructor/courses/${course.id}`}
                      className="font-medium hover:underline"
                    >
                      {course.title}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.category.name}</span>
                      <span>{course._count.enrollments} students</span>
                      <span>{course.status}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/instructor/courses/${course.id}`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any courses yet
              </p>
              <Button asChild>
                <Link href="/instructor/courses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
