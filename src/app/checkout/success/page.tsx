"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type VerifyState = "loading" | "success" | "error"

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Processing your payment...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your purchase.</p>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [state, setState] = useState<VerifyState>(() => sessionId ? "loading" : "error")
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    async function verifyPayment() {
      try {
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })

        if (!res.ok) {
          setState("error")
          return
        }

        const data = await res.json()

        if (data.success) {
          setState("success")
          // Single course: redirect to the course
          if (data.courseId) {
            setCourseId(data.courseId)
          }
        } else {
          setState("error")
        }
      } catch {
        setState("error")
      }
    }

    verifyPayment()
  }, [sessionId, router])

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold">Processing your payment...</h1>
        <p className="text-muted-foreground">Please wait while we confirm your purchase.</p>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t verify your payment. If you were charged, your enrollment will be
          processed shortly.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/my-courses">Go to My Courses</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <CheckCircle className="h-12 w-12 text-green-500" />
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <p className="text-muted-foreground">
        You have been enrolled in your course{courseId ? "" : "s"}. Start learning now!
      </p>
      <div className="flex gap-3">
        {courseId ? (
          <Button asChild>
            <Link href={`/my-courses/${courseId}`}>Start Learning</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/my-courses">Go to My Courses</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/courses">Browse More Courses</Link>
        </Button>
      </div>
    </div>
  )
}
