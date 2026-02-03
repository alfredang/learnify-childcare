import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/stripe"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/shared/star-rating"
import {
  ArrowLeft,
  CheckCircle,
  Video,
  FileText,
  Award,
  Smartphone,
  ShieldCheck,
  PartyPopper,
  Users,
} from "lucide-react"
import { EnrollButton } from "./enroll-button"

interface EnrollPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ success?: string }>
}

async function getCourse(slug: string) {
  return prisma.course.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      instructor: {
        select: { id: true, name: true, image: true },
      },
      sections: {
        include: {
          lectures: {
            select: { id: true, videoDuration: true },
          },
        },
      },
      _count: {
        select: { enrollments: true, reviews: true },
      },
    },
  })
}

export default async function EnrollPage({ params, searchParams }: EnrollPageProps) {
  const [{ slug }, { success }] = await Promise.all([params, searchParams])

  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/courses/${slug}/enroll`)
  }

  const course = await getCourse(slug)
  if (!course) {
    notFound()
  }

  const price = Number(course.price)
  const discountPrice = course.discountPrice ? Number(course.discountPrice) : null
  const rating = Number(course.averageRating)

  const totalLectures = course.sections.reduce(
    (acc, s) => acc + s.lectures.length,
    0
  )
  const totalDuration = course.sections.reduce(
    (acc, s) =>
      acc + s.lectures.reduce((la, l) => la + (l.videoDuration || 0), 0),
    0
  )
  const hours = Math.floor(totalDuration / 3600)
  const minutes = Math.floor((totalDuration % 3600) / 60)
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  // Check enrollment status
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId: course.id },
    },
  })

  // Success state — shown after Stripe redirect or if already enrolled
  if (success === "true" || enrollment) {
    return (
      <div className="container py-12">
        <div className="max-w-lg mx-auto text-center">
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">You&apos;re enrolled!</h1>
                <p className="text-muted-foreground">
                  You now have full access to <strong>{course.title}</strong>. Start learning at your own pace.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href={`/my-courses/${course.id}`}>
                  Start Learning
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to course
        </Link>

        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Order summary</h2>
              <div className="flex gap-4">
                <div className="relative w-44 aspect-video flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={course.thumbnail || "/images/placeholder-course.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    By {course.instructor.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={rating} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      ({course._count.reviews.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {durationText}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {totalLectures} lectures
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course._count.enrollments.toLocaleString()} students
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold">
                  {course.isFree ? "Free" : formatPrice(discountPrice ?? price)}
                </span>
              </div>
              {discountPrice && (
                <p className="text-sm text-muted-foreground text-right">
                  <span className="line-through">{formatPrice(price)}</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">What&apos;s included</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Access on mobile and desktop</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Certificate of completion</span>
                </div>
                {!course.isFree && (
                  <div className="flex items-center gap-3 text-sm">
                    <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>30-day money-back guarantee</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checkout Button */}
          <EnrollButton courseId={course.id} isFree={course.isFree} />

          <p className="text-xs text-center text-muted-foreground">
            {course.isFree
              ? "Start learning immediately after enrollment"
              : "You will be redirected to our secure payment page"}
          </p>
        </div>
      </div>
    </div>
  )
}
