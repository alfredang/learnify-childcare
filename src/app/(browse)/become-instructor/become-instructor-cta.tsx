"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle } from "lucide-react"
import type { ApplicationState } from "./page"

interface BecomeInstructorCTAProps {
  appState: ApplicationState
  variant?: "hero" | "bottom"
}

export function BecomeInstructorCTA({
  appState,
  variant = "hero",
}: BecomeInstructorCTAProps) {
  // Pending — disabled state with note (backward compat for existing applications)
  if (appState.type === "pending") {
    return (
      <div className="space-y-2">
        <Button size="lg" className="px-8" disabled>
          <Clock className="h-4 w-4 mr-2" />
          Application Under Review
        </Button>
        {variant === "hero" && (
          <p className="text-sm text-purple-200">
            We&apos;ll notify you once a decision has been made.
          </p>
        )}
      </div>
    )
  }

  // Rejected — show feedback then link to wizard
  if (appState.type === "rejected") {
    return (
      <div className="space-y-3">
        {variant === "hero" && appState.adminNote && (
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm text-purple-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{appState.adminNote}</span>
          </div>
        )}
        <div>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8"
            asChild
          >
            <Link href="/become-instructor/onboarding">
              Create Your Course
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Can-apply — link to onboarding wizard
  return (
    <Button
      size="lg"
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8"
      asChild
    >
      <Link href="/become-instructor/onboarding">
        Create Your Course
      </Link>
    </Button>
  )
}
