import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getWishlistedCourseIds } from "@/lib/wishlist"
import { CourseGrid } from "@/components/courses/course-grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        courses: {
          where: { status: "PUBLISHED" },
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
          orderBy: {
            totalStudents: "desc",
          },
        },
      },
    })
    // Serialize to convert Prisma Decimal/Date to plain JSON types
    return category ? JSON.parse(JSON.stringify(category)) : null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} Courses`,
    description:
      category.description ||
      `Browse ${category.name} courses on Learnify`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const [category, session] = await Promise.all([getCategory(slug), auth()])

  if (!category) {
    notFound()
  }

  const wishlistedCourseIds = await getWishlistedCourseIds(session?.user?.id)

  return (
    <div className="py-12 md:py-16">
      <div className="container">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Categories
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-muted-foreground max-w-2xl">
              {category.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {category.courses.length}{" "}
            {category.courses.length === 1 ? "course" : "courses"} available
          </p>
        </div>

        {category.courses.length > 0 ? (
          <CourseGrid courses={category.courses} wishlistedCourseIds={wishlistedCourseIds} />
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
            <p className="text-muted-foreground mb-6">
              There are no published courses in this category yet.
            </p>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
