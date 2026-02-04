import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/stripe"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/shared/star-rating"
import { MobileBottomBar } from "@/components/courses/mobile-bottom-bar"
import { FavouriteButton } from "@/components/courses/favourite-button"
import { AddToCartButton } from "@/components/courses/add-to-cart-button"
import { BuyNowButton } from "@/components/courses/buy-now-button"
import { CourseReviewsSection } from "@/components/courses/course-reviews-section"
import { ITEMS_PER_PAGE } from "@/lib/constants"
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
  HelpCircle,
  Smartphone,
  Infinity,
  Eye,
} from "lucide-react"

interface CoursePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ canceled?: string }>
}

async function getCourse(slug: string, userId?: string) {
  try {
    // First try published course (public access)
    let course = await prisma.course.findUnique({
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
        _count: {
          select: {
            enrollments: true,
            reviews: { where: { isApproved: true } },
          },
        },
      },
    })

    // If not published, allow the course owner to preview
    if (!course && userId) {
      course = await prisma.course.findUnique({
        where: { slug, instructorId: userId },
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
          _count: {
            select: {
              enrollments: true,
              reviews: { where: { isApproved: true } },
            },
          },
        },
      })
    }

    return course
  } catch (error) {
    console.error("Failed to fetch course:", error)
    return null
  }
}

async function checkEnrollment(courseId: string, userId?: string) {
  if (!userId) return false
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    })
    return !!enrollment
  } catch {
    return false
  }
}

async function checkFavourite(courseId: string, userId?: string) {
  if (!userId) return false
  try {
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    })
    return !!item
  } catch {
    return false
  }
}

async function checkCart(courseId: string, userId?: string) {
  if (!userId) return false
  try {
    const item = await prisma.cartItem.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    })
    return !!item
  } catch {
    return false
  }
}

async function getCourseReviews(courseId: string) {
  const [reviews, distribution, total] = await Promise.all([
    prisma.review.findMany({
      where: { courseId, isApproved: true },
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { courseId, isApproved: true },
      _count: true,
    }),
    prisma.review.count({
      where: { courseId, isApproved: true },
    }),
  ])

  const ratingDistribution: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  }
  for (const item of distribution) {
    ratingDistribution[item.rating] = item._count
  }

  return {
    reviews,
    total,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    ratingDistribution,
  }
}

async function getUserReview(courseId: string, userId?: string) {
  if (!userId) return null
  try {
    return await prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true, rating: true, comment: true },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const session = await auth()
  const course = await getCourse(slug, session?.user?.id)

  if (!course) {
    return { title: "Course Not Found" }
  }

  return {
    title: course.title,
    description: course.subtitle || course.description?.slice(0, 160),
  }
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const [{ slug }, { canceled }] = await Promise.all([params, searchParams])
  const session = await auth()
  const course = await getCourse(slug, session?.user?.id)

  if (!course) {
    notFound()
  }

  const isOwnerPreview = course.status !== "PUBLISHED" && course.instructorId === session?.user?.id

  const [isEnrolled, isFavourited, isInCart, reviewData, userReview] =
    await Promise.all([
      checkEnrollment(course.id, session?.user?.id),
      checkFavourite(course.id, session?.user?.id),
      checkCart(course.id, session?.user?.id),
      getCourseReviews(course.id),
      getUserReview(course.id, session?.user?.id),
    ])
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
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  // Shared purchase card content
  const purchaseCardContent = (
    <>
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
          {isEnrolled ? (
            <Badge variant="secondary" className="font-semibold text-sm px-3 py-1">Owned</Badge>
          ) : course.isFree ? (
            <span className="text-3xl font-bold">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold">
                {formatPrice(discountPrice ?? price)}
              </span>
              {discountPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(price)}
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
        ) : course.isFree ? (
          <BuyNowButton courseId={course.id} isFree={true} />
        ) : (
          <>
            <AddToCartButton
              courseId={course.id}
              initialInCart={isInCart}
              variant="full"
            />
            <BuyNowButton courseId={course.id} isFree={false} expectedPrice={discountPrice ?? price} />
          </>
        )}

        {!isEnrolled && !isOwner && (
          <FavouriteButton
            courseId={course.id}
            initialFavourited={isFavourited}
            variant="full"
          />
        )}

        {!isEnrolled && !isOwner && !course.isFree && (
          <p className="text-xs text-center text-muted-foreground">
            30-Day Money-Back Guarantee
          </p>
        )}

        <Separator />

        <div className="space-y-3 text-sm">
          <h4 className="font-semibold">This course includes:</h4>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <span>{durationText} of video</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{totalLectures} lectures</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span>Access on mobile and desktop</span>
          </div>
          <div className="flex items-center gap-2">
            <Infinity className="h-4 w-4 text-muted-foreground" />
            <span>Full lifetime access</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span>Certificate of completion</span>
          </div>
        </div>
      </CardContent>
    </>
  )

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {/* Owner preview banner */}
      {isOwnerPreview && (
        <div className="bg-blue-50 border-b border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <div className="container py-3 flex items-center justify-center gap-2 text-sm text-blue-800 dark:text-blue-200">
            <Eye className="h-4 w-4" />
            <span>
              You are previewing this course. It is currently{" "}
              <strong>{course.status.replace("_", " ").toLowerCase()}</strong> and not visible to students.
            </span>
            <Button variant="outline" size="sm" className="ml-2 h-7 text-xs" asChild>
              <Link href={`/instructor/courses/${course.id}`}>
                Back to Editor
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Canceled payment banner */}
      {canceled === "true" && (
        <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <div className="container py-3 text-center text-sm text-amber-800 dark:text-amber-200">
            Payment was canceled. You can try again when you&apos;re ready.
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-8 lg:py-12">
        <div className="container">
          <div className="lg:max-w-[63%] space-y-6">
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
        </div>
      </section>

      {/* Mobile Purchase Card */}
      <div className="lg:hidden border-b">
        <div className="container py-6">
          <Card>{purchaseCardContent}</Card>
        </div>
      </div>

      {/* Main Content + Desktop Sidebar */}
      <section className="py-8 lg:py-12">
        <div className="container">
          <div className="lg:grid lg:grid-cols-[1fr_340px] gap-12">
            {/* Left column - course content */}
            <div className="space-y-12">
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
                  lectures &bull; {durationText} total length
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
                              ) : lecture.type === "QUIZ" ? (
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
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
                            {lecture.videoDuration ? (
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(lecture.videoDuration / 60)}:
                                {(lecture.videoDuration % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            ) : lecture.type === "QUIZ" ? (
                              <span className="text-sm text-muted-foreground">
                                Quiz
                              </span>
                            ) : null}
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
              <div>
                <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>
                <CourseReviewsSection
                  courseId={course.id}
                  isEnrolled={isEnrolled}
                  isOwner={isOwner}
                  initialReviews={JSON.parse(JSON.stringify(reviewData.reviews))}
                  initialTotal={reviewData.total}
                  initialTotalPages={reviewData.totalPages}
                  initialRatingDistribution={reviewData.ratingDistribution}
                  initialAverageRating={rating}
                  initialTotalReviews={course._count.reviews}
                  userReview={userReview ? JSON.parse(JSON.stringify(userReview)) : null}
                />
              </div>
            </div>

            {/* Desktop Sidebar - sticky, pulled up into hero */}
            <div className="hidden lg:block">
              <div className="sticky top-20 -mt-96">
                <Card className="shadow-lg overflow-hidden">
                  {purchaseCardContent}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Fixed Bottom Bar */}
      {!isEnrolled && !isOwner && (
        <MobileBottomBar
          courseId={course.id}
          price={price}
          discountPrice={discountPrice}
          isFree={course.isFree}
          isInCart={isInCart}
        />
      )}
    </div>
  )
}
