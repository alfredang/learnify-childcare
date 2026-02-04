"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import type { ReviewWithUser } from "@/types"
import { Separator } from "@/components/ui/separator"
import { RatingSummary } from "./rating-summary"
import { ReviewForm } from "./review-form"
import { ReviewList } from "./review-list"

interface CourseReviewsSectionProps {
  courseId: string
  isEnrolled: boolean
  isOwner: boolean
  initialReviews: ReviewWithUser[]
  initialTotal: number
  initialTotalPages: number
  initialRatingDistribution: Record<number, number>
  initialAverageRating: number
  initialTotalReviews: number
  userReview?: {
    id: string
    rating: number
    comment: string | null
  } | null
}

export function CourseReviewsSection({
  courseId,
  isEnrolled,
  isOwner,
  initialReviews,
  initialTotal,
  initialTotalPages,
  initialRatingDistribution,
  initialAverageRating,
  initialTotalReviews,
  userReview,
}: CourseReviewsSectionProps) {
  const router = useRouter()
  const [reviewKey, setReviewKey] = useState(0)

  const showReviewForm = isEnrolled && !isOwner

  const handleReviewSubmitted = useCallback(() => {
    setReviewKey((k) => k + 1)
    router.refresh()
  }, [router])

  return (
    <div className="space-y-6">
      <RatingSummary
        averageRating={initialAverageRating}
        totalReviews={initialTotalReviews}
        distribution={initialRatingDistribution}
      />

      {showReviewForm && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {userReview ? "Your Review" : "Write a Review"}
            </h3>
            <ReviewForm
              key={reviewKey}
              courseId={courseId}
              existingReview={userReview}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </div>
        </>
      )}

      <Separator />

      <ReviewList
        key={`list-${reviewKey}`}
        courseId={courseId}
        initialReviews={initialReviews}
        initialTotal={initialTotal}
        initialTotalPages={initialTotalPages}
      />
    </div>
  )
}
