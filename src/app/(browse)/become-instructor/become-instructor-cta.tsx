"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle } from "lucide-react"
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

  // Logged out — direct to login
  if (appState.type === "logged-out") {
    return (
      <Button
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8"
        asChild
      >
        <Link href="/login?callbackUrl=/become-instructor">
          Create Your Course
        </Link>
      </Button>
    )
  }

  // Pending — disabled state with note
  if (appState.type === "pending") {
    return (
      <div className="space-y-2">
        <Button size="lg" className="px-8" disabled>
          <Clock className="h-4 w-4 mr-2" />
          Application Under Review
        </Button>
        {variant === "hero" && (
          <p className={variant === "hero" ? "text-sm text-purple-200" : "text-sm text-muted-foreground"}>
            We&apos;ll notify you once a decision has been made.
          </p>
        )}
      </div>
    )
  }

  // Rejected — reapply button with brief feedback
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
            onClick={() => setDialogOpen(true)}
          >
            Create Your Course
          </Button>
        </div>
        <InstructorApplicationForm
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    )
  }

  // Can-apply — primary CTA
  return (
    <>
      <Button
        size="lg"
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8"
        onClick={() => setDialogOpen(true)}
      >
        Create Your Course
      </Button>
      <InstructorApplicationForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
