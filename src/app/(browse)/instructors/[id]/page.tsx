import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getWishlistedCourseIds } from "@/lib/wishlist"
import { getCartItemCourseIds } from "@/lib/cart"
import { CourseGrid } from "@/components/courses/course-grid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Users,
  Star,
  BookOpen,
  Globe,
  Twitter,
  Linkedin,
  Youtube,
  ArrowLeft,
} from "lucide-react"

interface InstructorPageProps {
  params: Promise<{ id: string }>
}

async function getInstructor(id: string) {
  try {
    const instructor = await prisma.user.findUnique({
      where: {
        id,
        role: { in: ["INSTRUCTOR", "ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        headline: true,
        website: true,
        twitter: true,
        linkedin: true,
        youtube: true,
        createdAt: true,
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
          orderBy: { totalStudents: "desc" },
        },
      },
    })

    return instructor ? JSON.parse(JSON.stringify(instructor)) : null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: InstructorPageProps): Promise<Metadata> {
  const { id } = await params
  const instructor = await getInstructor(id)

  if (!instructor) {
    return { title: "Instructor Not Found" }
  }

  return {
    title: `${instructor.name} - Instructor`,
    description:
      instructor.headline ||
      instructor.bio?.slice(0, 160) ||
      `View courses by ${instructor.name} on Learnify`,
  }
}

export default async function InstructorPage({
  params,
}: InstructorPageProps) {
  const { id } = await params
  const [instructor, session] = await Promise.all([
    getInstructor(id),
    auth(),
  ])

  if (!instructor) {
    notFound()
  }

  let wishlistedCourseIds = new Set<string>()
  let cartCourseIds = new Set<string>()
  try {
    ;[wishlistedCourseIds, cartCourseIds] = await Promise.all([
      getWishlistedCourseIds(session?.user?.id),
      getCartItemCourseIds(session?.user?.id),
    ])
  } catch {
    // Gracefully handle database errors
  }

  const totalStudents = instructor.courses.reduce(
    (sum: number, c: { totalStudents: number }) => sum + c.totalStudents,
    0
  )
  const totalReviews = instructor.courses.reduce(
    (sum: number, c: { totalReviews: number }) => sum + c.totalReviews,
    0
  )
  const totalCourses = instructor.courses.length

  const hasSocialLinks =
    instructor.website ||
    instructor.twitter ||
    instructor.linkedin ||
    instructor.youtube

  function ensureUrl(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return `https://${url}`
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Browse Courses
          </Link>
        </Button>

        {/* Instructor Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 shrink-0">
              <AvatarImage
                src={instructor.image || undefined}
                alt={instructor.name || "Instructor"}
              />
              <AvatarFallback className="text-2xl md:text-3xl">
                {instructor.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">
                {instructor.name}
              </h1>
              {instructor.headline && (
                <p className="text-lg text-muted-foreground mb-4">
                  {instructor.headline}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {totalStudents.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {totalReviews.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{totalCourses}</span>
                  <span className="text-muted-foreground">
                    {totalCourses === 1 ? "course" : "courses"}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              {hasSocialLinks && (
                <div className="flex gap-3 mt-4">
                  {instructor.website && (
                    <a
                      href={ensureUrl(instructor.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {instructor.twitter && (
                    <a
                      href={ensureUrl(instructor.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {instructor.linkedin && (
                    <a
                      href={ensureUrl(instructor.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {instructor.youtube && (
                    <a
                      href={ensureUrl(instructor.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        {instructor.bio && (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                About {instructor.name}
              </h2>
              <p className="text-muted-foreground whitespace-pre-line max-w-3xl">
                {instructor.bio}
              </p>
            </div>
            <Separator className="mb-12" />
          </>
        )}

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Courses by {instructor.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {totalCourses} {totalCourses === 1 ? "course" : "courses"}{" "}
            available
          </p>

          {totalCourses > 0 ? (
            <CourseGrid
              courses={instructor.courses}
              wishlistedCourseIds={wishlistedCourseIds}
              cartCourseIds={cartCourseIds}
            />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">
                This instructor hasn&apos;t published any courses yet.
              </p>
              <Button variant="outline" asChild>
                <Link href="/courses">Browse All Courses</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
