import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { RevenueChart } from "@/components/courses/revenue-chart"

export const metadata: Metadata = {
  title: "Performance Overview",
  description: "Track your instructor performance",
}

async function getPerformanceData(userId: string) {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalRevenue,
      monthlyRevenue,
      totalEnrollments,
      monthlyEnrollments,
      avgRating,
      monthlyReviewCount,
      revenueTimeline,
    ] = await Promise.all([
      // Total revenue
      prisma.purchase.aggregate({
        where: {
          course: { instructorId: userId },
          status: "COMPLETED",
        },
        _sum: { instructorEarning: true },
      }),

      // This month's revenue
      prisma.purchase.aggregate({
        where: {
          course: { instructorId: userId },
          status: "COMPLETED",
          createdAt: { gte: monthStart },
        },
        _sum: { instructorEarning: true },
      }),

      // Total enrollments
      prisma.enrollment.count({
        where: { course: { instructorId: userId } },
      }),

      // This month's enrollments
      prisma.enrollment.count({
        where: {
          course: { instructorId: userId },
          createdAt: { gte: monthStart },
        },
      }),

      // Average rating across all published courses
      prisma.course.aggregate({
        where: {
          instructorId: userId,
          status: "PUBLISHED",
        },
        _avg: { averageRating: true },
      }),

      // Reviews received this month
      prisma.review.count({
        where: {
          course: { instructorId: userId },
          createdAt: { gte: monthStart },
        },
      }),

      // Revenue per day for chart (last 12 months of data)
      prisma.purchase.findMany({
        where: {
          course: { instructorId: userId },
          status: "COMPLETED",
          createdAt: {
            gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
          },
        },
        select: {
          instructorEarning: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ])

    // Aggregate revenue by date for the chart
    const revenueByDate = new Map<string, number>()
    for (const purchase of revenueTimeline) {
      const dateKey = purchase.createdAt.toISOString().split("T")[0]
      revenueByDate.set(
        dateKey,
        (revenueByDate.get(dateKey) || 0) + purchase.instructorEarning
      )
    }

    const chartData = Array.from(revenueByDate.entries()).map(
      ([date, revenue]) => ({ date, revenue })
    )

    return {
      totalRevenue: totalRevenue._sum.instructorEarning || 0,
      monthlyRevenue: monthlyRevenue._sum.instructorEarning || 0,
      totalEnrollments,
      monthlyEnrollments,
      averageRating: Number(avgRating._avg.averageRating || 0),
      monthlyReviewCount,
      chartData,
    }
  } catch (error) {
    console.error("Failed to fetch performance data:", error)
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalEnrollments: 0,
      monthlyEnrollments: 0,
      averageRating: 0,
      monthlyReviewCount: 0,
      chartData: [],
    }
  }
}

export default async function PerformanceOverviewPage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  const data = await getPerformanceData(session.user.id)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">All courses</p>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total revenue</p>
            <p className="text-2xl font-bold">
              ${(data.totalRevenue / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ${(data.monthlyRevenue / 100).toFixed(2)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total enrollments</p>
            <p className="text-2xl font-bold">
              {data.totalEnrollments.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.monthlyEnrollments} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Instructor rating</p>
            <p className="text-2xl font-bold">
              {data.averageRating.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.monthlyReviewCount} rating{data.monthlyReviewCount !== 1 ? "s" : ""} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardContent className="pt-6">
          <RevenueChart data={data.chartData} />
        </CardContent>
      </Card>
    </div>
  )
}
