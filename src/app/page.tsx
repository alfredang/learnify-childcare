import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Code,
  Briefcase,
  Palette,
  Megaphone,
  Server,
  User,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Award,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getFavouritedCourseIds } from "@/lib/favourites"
import { getCartItemCourseIds } from "@/lib/cart"
import { getEnrolledCourseMap } from "@/lib/enrollment"
import { CourseGrid } from "@/components/courses/course-grid"

const iconMap: Record<string, React.ElementType> = {
  Code,
  Briefcase,
  Palette,
  Megaphone,
  Server,
  User,
}

async function getFeaturedCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        isFeatured: true,
      },
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
        featuredOrder: "asc",
      },
      take: 8,
    })
    // Serialize to convert Prisma Decimal/Date to plain JSON types
    return JSON.parse(JSON.stringify(courses))
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: {
        courses: {
          _count: "desc",
        },
      },
      take: 6,
    })
    return categories
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const [totalCourses, totalStudents, totalInstructors] = await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    ])
    return { totalCourses, totalStudents, totalInstructors }
  } catch {
    return { totalCourses: 0, totalStudents: 0, totalInstructors: 0 }
  }
}

export default async function HomePage() {
  const [featuredCourses, categories, stats, session] = await Promise.all([
    getFeaturedCourses(),
    getCategories(),
    getStats(),
    auth(),
  ])
  const isInstructor = session?.user?.role === "INSTRUCTOR" || session?.user?.role === "ADMIN"
  let favouritedCourseIds = new Set<string>()
  let cartCourseIds = new Set<string>()
  let enrolledCourseMap = new Map<string, number>()
  try {
    ;[favouritedCourseIds, cartCourseIds, enrolledCourseMap] = await Promise.all([
      getFavouritedCourseIds(session?.user?.id),
      getCartItemCourseIds(session?.user?.id),
      getEnrolledCourseMap(session?.user?.id),
    ])
  } catch {
    // Gracefully handle database errors (e.g., Neon cold start)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <Badge variant="secondary" className="px-4 py-1">
                Learn from industry experts
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Unlock Your Potential with{" "}
                <span className="text-primary">World&#8209;Class e&#8209;Learning</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Join millions of learners worldwide. Master new skills, advance
                your career, and explore your passions with our expert-led
                courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link href="/courses">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground" asChild>
                  <Link href={isInstructor ? "/instructor" : "/become-instructor"}>
                    {isInstructor ? "Go to Instructor Dashboard" : "Become an Instructor"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">30-day guarantee</span>
                </div>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                  alt="Students learning"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold">
                {stats.totalCourses > 0
                  ? `${stats.totalCourses.toLocaleString()}+`
                  : "1000+"}
              </div>
              <div className="text-muted-foreground">Courses</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold">
                {stats.totalStudents > 0
                  ? `${stats.totalStudents.toLocaleString()}+`
                  : "50K+"}
              </div>
              <div className="text-muted-foreground">Students</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold">
                {stats.totalInstructors > 0
                  ? `${stats.totalInstructors.toLocaleString()}+`
                  : "200+"}
              </div>
              <div className="text-muted-foreground">Instructors</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 md:py-16 lg:py-24">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse Categories</h2>
                <p className="text-muted-foreground">
                  Explore our wide range of course categories
                </p>
              </div>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/categories">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon || "Code"] || Code
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group"
                  >
                    <Card className="h-full transition-colors hover:bg-muted/50">
                      <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category._count.courses} courses
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-12 md:py-16 lg:py-24 bg-muted/30">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Courses</h2>
                <p className="text-muted-foreground">
                  Hand-picked courses by our team
                </p>
              </div>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/courses">View All</Link>
              </Button>
            </div>
            <CourseGrid courses={featuredCourses} favouritedCourseIds={favouritedCourseIds} cartCourseIds={cartCourseIds} enrolledCourseMap={enrolledCourseMap} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 md:px-16 md:py-24">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Share Your Knowledge with the World
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Become an instructor and reach millions of students. Create
                engaging courses and earn money doing what you love.
              </p>
              <button className="inline-flex items-center justify-center gap-3 rounded-xl bg-white text-primary font-extrabold text-lg md:text-xl px-10 md:px-14 py-5 md:py-6 shadow-lg shadow-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20 active:scale-100">
                <Link href={isInstructor ? "/instructor" : "/become-instructor"} className="flex items-center gap-3">
                  {isInstructor ? "Go to Instructor Dashboard" : "Start Teaching Today"}
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </button>
            </div>
            <div className="absolute right-0 top-0 -z-0 h-full w-1/2 opacity-10">
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                <path
                  fill="currentColor"
                  d="M45.3,-52.7C59.1,-42.2,71.2,-28.4,74.8,-12.6C78.3,3.2,73.3,21,63.4,35.1C53.5,49.2,38.7,59.6,22.2,65.4C5.7,71.2,-12.5,72.4,-28.9,66.4C-45.3,60.4,-59.9,47.2,-68.1,30.8C-76.3,14.4,-78.1,-5.2,-72.2,-22.2C-66.3,-39.2,-52.7,-53.6,-37.6,-63.8C-22.5,-74,-5.6,-80,8.4,-77.8C22.4,-75.5,31.5,-63.2,45.3,-52.7Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
