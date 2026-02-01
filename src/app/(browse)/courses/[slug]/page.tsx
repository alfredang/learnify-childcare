import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/shared/star-rating"
import {
  Play,
  Clock,
  Users,
  BarChart,
  Globe,
  Award,
  CheckCircle,
  ChevronDown,
  FileText,
  Video,
} from "lucide-react"

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          image: true,
          headline: true,
          bio: true,
          _count: {
            select: {
              courses: { where: { status: "PUBLISHED" } },
            },
          },
        },
      },
      category: true,
      sections: {
        orderBy: { position: "asc" },
        include: {
          lectures: {
            orderBy: { position: "asc" },
          },
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      _count: {
        select: { enrollments: true, reviews: true },
      },
    },
  })

  return course
}

async function checkEnrollment(courseId: string, userId?: string) {
  if (!userId) return false

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  })

  return !!enrollment
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    return { title: "Course Not Found" }
  }

  return {
    title: course.title,
    description: course.subtitle || course.description?.slice(0, 160),
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    notFound()
  }

  const session = await auth()
  const isEnrolled = await checkEnrollment(course.id, session?.user?.id)
  const isOwner = session?.user?.id === course.instructorId

  const price = Number(course.price)
  const discountPrice = course.discountPrice
    ? Number(course.discountPrice)
    : null
  const rating = Number(course.averageRating)

  const totalLectures = course.sections.reduce(
    (acc, section) => acc + section.lectures.length,
    0
  )
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-12">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Link
                  href={`/categories/${course.category.slug}`}
                  className="text-primary hover:underline"
                >
                  {course.category.name}
                </Link>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>

              {course.subtitle && (
                <p className="text-xl text-slate-300">{course.subtitle}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <StarRating rating={rating} size="sm" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span className="text-slate-400">
                    ({course._count.reviews.toLocaleString()} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <Users className="h-4 w-4" />
                  <span>
                    {course._count.enrollments.toLocaleString()} students
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={course.instructor.image || ""} />
                  <AvatarFallback>
                    {course.instructor.name?.[0] || "I"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-slate-400">Created by</p>
                  <Link
                    href={`/instructors/${course.instructor.id}`}
                    className="hover:underline"
                  >
                    {course.instructor.name}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Last updated {course.updatedAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>{course.level.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Card */}
            <div className="lg:row-start-1">
              <Card className="sticky top-24">
                <div className="relative aspect-video">
                  <Image
                    src={course.thumbnail || "/images/placeholder-course.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  {course.previewVideoUrl && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors group">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-slate-900 ml-1" />
                      </div>
                    </button>
                  )}
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    {course.isFree ? (
                      <span className="text-3xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">
                          ${discountPrice ?? price}
                        </span>
                        {discountPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            ${price}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button className="w-full" size="lg" asChild>
                      <Link href={`/my-courses/${course.id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  ) : isOwner ? (
                    <Button className="w-full" size="lg" asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        Edit Course
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" asChild>
                      <Link href={`/courses/${course.slug}/enroll`}>
                        {course.isFree ? "Enroll for Free" : "Buy Now"}
                      </Link>
                    </Button>
                  )}

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <h4 className="font-semibold">This course includes:</h4>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} of
                        video
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{totalLectures} lectures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              {course.learningOutcomes.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    What you&apos;ll learn
                  </h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-3">
                        {course.learningOutcomes.map((outcome, index) => (
                          <div key={index} className="flex gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Course Content */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Course content</h2>
                <div className="text-sm text-muted-foreground mb-4">
                  {course.sections.length} sections &bull; {totalLectures}{" "}
                  lectures &bull;{" "}
                  {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} total
                  length
                </div>
                <div className="border rounded-lg divide-y">
                  {course.sections.map((section) => (
                    <details key={section.id} className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-2 font-medium">
                          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                          {section.title}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {section.lectures.length} lectures
                        </span>
                      </summary>
                      <div className="bg-muted/30">
                        {section.lectures.map((lecture) => (
                          <div
                            key={lecture.id}
                            className="flex items-center justify-between px-4 py-3 pl-10 border-t"
                          >
                            <div className="flex items-center gap-2">
                              {lecture.type === "VIDEO" ? (
                                <Play className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">{lecture.title}</span>
                              {lecture.isFreePreview && (
                                <Badge variant="secondary" className="text-xs">
                                  Preview
                                </Badge>
                              )}
                            </div>
                            {lecture.videoDuration && (
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(lecture.videoDuration / 60)}:
                                {(lecture.videoDuration % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {course.requirements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                  <ul className="list-disc list-inside space-y-2">
                    {course.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              {course.description && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Description</h2>
                  <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </div>
              )}

              {/* Instructor */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Instructor</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={course.instructor.image || ""} />
                        <AvatarFallback className="text-2xl">
                          {course.instructor.name?.[0] || "I"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Link
                          href={`/instructors/${course.instructor.id}`}
                          className="text-xl font-semibold hover:underline"
                        >
                          {course.instructor.name}
                        </Link>
                        {course.instructor.headline && (
                          <p className="text-muted-foreground">
                            {course.instructor.headline}
                          </p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>
                            {course.instructor._count.courses} courses
                          </span>
                        </div>
                      </div>
                    </div>
                    {course.instructor.bio && (
                      <p className="mt-4 text-muted-foreground">
                        {course.instructor.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reviews */}
              {course.reviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                  <div className="space-y-4">
                    {course.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.user.image || ""} />
                              <AvatarFallback>
                                {review.user.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {review.user.name}
                                </span>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {review.createdAt.toLocaleDateString()}
                              </p>
                              {review.comment && <p>{review.comment}</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
