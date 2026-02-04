"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Clock,
  AlertCircle,
  RefreshCw,
  UserPlus,
} from "lucide-react"
import { InstructorApplicationForm } from "@/components/auth"
import type { ApplicationState } from "./page"

interface BecomeInstructorCTAProps {
  appState: ApplicationState
  variant?: "hero" | "bottom"
}

export function BecomeInstructorCTA({
  appState,
  variant = "hero",
}: BecomeInstructorCTAProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const scrollToWhyTeach = () => {
    document.getElementById("why-teach")?.scrollIntoView({ behavior: "smooth" })
  }

  if (appState.type === "logged-out") {
    if (variant === "bottom") {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register?callbackUrl=/become-instructor">
              Sign Up to Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            asChild
          >
            <Link href="/login?callbackUrl=/become-instructor">
              Already have an account? Log in
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/register?callbackUrl=/become-instructor">
              Sign Up to Get Started
              <UserPlus className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" onClick={scrollToWhyTeach}>
            Learn More
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login?callbackUrl=/become-instructor"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Log in
          </Link>{" "}
          to apply as an instructor.
        </p>
      </div>
    )
  }

  if (appState.type === "pending") {
    if (variant === "bottom") {
      return (
        <Button size="lg" variant="secondary" disabled>
          Application Under Review
        </Button>
      )
    }

    return (
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-400">
              Application Under Review
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
              Your application is being reviewed by our team. We&apos;ll notify
              you once a decision has been made.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (appState.type === "rejected") {
    if (variant === "bottom") {
      return (
        <>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setDialogOpen(true)}
          >
            Reapply
            <RefreshCw className="ml-2 h-5 w-5" />
          </Button>
          <InstructorApplicationForm
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </>
      )
    }

    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-400">
                Application Not Approved
              </p>
              {appState.adminNote && (
                <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                  Feedback: {appState.adminNote}
                </p>
              )}
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                You can update your application and reapply.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={() => setDialogOpen(true)}>
            Reapply
            <RefreshCw className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={scrollToWhyTeach}>
            Learn More
          </Button>
        </div>
        <InstructorApplicationForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    )
  }

  // can-apply state — unmissable Apply Now
  if (variant === "bottom") {
    return (
      <>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center justify-center gap-3 rounded-xl bg-white text-primary font-extrabold text-xl md:text-2xl px-14 md:px-16 py-6 md:py-7 shadow-lg shadow-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/20 active:scale-100"
        >
          Apply Now
          <ArrowRight className="h-6 w-6" />
        </button>
        <InstructorApplicationForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-xl md:text-2xl px-14 md:px-16 py-6 md:py-7 shadow-lg shadow-primary/15 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 active:scale-100"
        >
          Apply Now — Start Teaching Today
          <ArrowRight className="h-6 w-6" />
        </button>
        <div>
          <Button size="lg" variant="outline" onClick={scrollToWhyTeach}>
            Learn More
          </Button>
        </div>
      </div>
      <InstructorApplicationForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
