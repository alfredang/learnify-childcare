import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { CourseGrid } from "@/components/courses/course-grid"
import { CourseFiltersWrapper } from "@/components/courses/course-filters-wrapper"
import { EmptyState } from "@/components/shared/empty-state"
import { BookOpen } from "lucide-react"
import { ITEMS_PER_PAGE } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Browse Courses",
  description: "Explore our wide range of courses and start learning today",
}

interface CoursesPageProps {
  searchParams: Promise<{
    category?: string
    level?: string
    price?: string
    rating?: string
    sort?: string
    page?: string
    q?: string
  }>
}

async function getCourses(searchParams: CoursesPageProps["searchParams"]) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
  }

  if (params.category) {
    where.category = { slug: params.category }
  }

  if (params.level && params.level !== "all") {
    where.level = params.level
  }

  if (params.price) {
    switch (params.price) {
      case "free":
        where.isFree = true
        break
      case "paid":
        where.isFree = false
        break
      case "under-20":
        where.price = { lt: 20 }
        break
      case "20-50":
        where.price = { gte: 20, lte: 50 }
        break
      case "50-100":
        where.price = { gte: 50, lte: 100 }
        break
      case "over-100":
        where.price = { gt: 100 }
        break
    }
  }

  if (params.rating && params.rating !== "all") {
    where.averageRating = { gte: parseFloat(params.rating) }
  }

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { subtitle: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ]
  }

  let orderBy: Record<string, unknown> = { totalStudents: "desc" }

  switch (params.sort) {
    case "rating":
      orderBy = { averageRating: "desc" }
      break
    case "newest":
      orderBy = { publishedAt: "desc" }
      break
    case "price-low":
      orderBy = { price: "asc" }
      break
    case "price-high":
      orderBy = { price: "desc" }
      break
  }

  const [coursesRaw, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
        category: true,
      },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.course.count({ where }),
  ])

  // Serialize to convert Prisma Decimal/Date to plain JSON types
  const courses = JSON.parse(JSON.stringify(coursesRaw))

  return {
    courses,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
  }
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  })
  return JSON.parse(JSON.stringify(categories))
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const [{ courses, total, totalPages, currentPage }, categories] =
    await Promise.all([getCourses(searchParams), getCategories()])

  const params = await searchParams

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Courses</h1>
        <p className="text-muted-foreground">
          {total} courses available
        </p>
      </div>

      <div className="mb-8">
        <CourseFiltersWrapper categories={categories} />
      </div>

      {courses.length > 0 ? (
        <>
          <CourseGrid courses={courses} />

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {currentPage > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={{
                      pathname: "/courses",
                      query: { ...params, page: currentPage - 1 },
                    }}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              <div className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </div>
              {currentPage < totalPages && (
                <Button variant="outline" asChild>
                  <Link
                    href={{
                      pathname: "/courses",
                      query: { ...params, page: currentPage + 1 },
                    }}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your filters or search query"
          actionLabel="Clear filters"
          actionHref="/courses"
        />
      )}
    </div>
  )
}
