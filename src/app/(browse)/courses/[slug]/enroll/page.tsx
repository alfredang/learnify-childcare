"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  price: number
  isFree: boolean
  instructor: {
    name: string
  }
}

export default function EnrollPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [slug, setSlug] = useState<string>("")

  useEffect(() => {
    params.then((p) => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (!slug) return

    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses?slug=${slug}`)
        if (!response.ok) throw new Error("Course not found")
        const data = await response.json()
        setCourse(data.course)
      } catch {
        toast.error("Course not found")
        router.push("/courses")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [slug, router])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/courses/${slug}/enroll`)
    }
  }, [status, slug, router])

  async function handleEnroll() {
    if (!course) return

    setIsEnrolling(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to enroll")
      }

      if (data.free) {
        toast.success("Successfully enrolled!")
        router.push(data.url)
      } else {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enroll")
      setIsEnrolling(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to course
        </Link>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="relative w-40 aspect-video flex-shrink-0">
                <Image
                  src={course.thumbnail || "/images/placeholder-course.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold mb-1">{course.title}</h1>
                <p className="text-sm text-muted-foreground mb-4">
                  By {course.instructor.name}
                </p>
                <p className="text-2xl font-bold">
                  {course.isFree ? "Free" : `$${course.price}`}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Full lifetime access</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Access on mobile and desktop</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Certificate of completion</span>
              </div>
            </div>

            <Button
              className="w-full mt-8"
              size="lg"
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {course.isFree ? "Enroll for Free" : "Proceed to Payment"}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {course.isFree
                ? "Start learning immediately after enrollment"
                : "You will be redirected to our secure payment page"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
