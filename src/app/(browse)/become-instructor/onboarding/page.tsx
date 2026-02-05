"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 3

const STEPS = [
  {
    title: "Share your knowledge",
    description:
      "Learnify courses are video-based experiences that give students the chance to learn actionable skills. Whether you have experience teaching, or it's your first time, we'll help you package your knowledge into an online course that improves student lives.",
    question: "What kind of teaching have you done before?",
    field: "teachingExperience" as const,
    options: [
      { id: "informal", label: "In person, informally" },
      { id: "professional", label: "In person, professionally" },
      { id: "online", label: "Online" },
      { id: "other", label: "Other" },
    ],
  },
  {
    title: "Create a course",
    description:
      "Over the years we've helped thousands of instructors learn how to record at home. No matter your experience level, you can become a video pro too. We'll equip you with the latest resources, tips, and support to help you succeed.",
    question: 'How much of a video "pro" are you?',
    field: "videoExperience" as const,
    options: [
      { id: "beginner", label: "I'm a beginner" },
      { id: "some-knowledge", label: "I have some knowledge" },
      { id: "experienced", label: "I'm experienced" },
      { id: "videos-ready", label: "I have videos ready to upload" },
    ],
  },
  {
    title: "Expand your reach",
    description:
      "Once you publish your course, you can grow your student audience and make an impact with the support of Learnify's marketplace promotions and also through your own marketing efforts. Together, we'll help the right students discover your course.",
    question: "Do you have an audience to share your course with?",
    field: "audienceSize" as const,
    options: [
      { id: "none", label: "Not at the moment" },
      { id: "small", label: "I have a small following" },
      { id: "sizeable", label: "I have a sizeable following" },
    ],
  },
]

type Answers = {
  teachingExperience: string
  videoExperience: string
  audienceSize: string
}

export default function OnboardingWizardPage() {
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    teachingExperience: "",
    videoExperience: "",
    audienceSize: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already an instructor
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "STUDENT") {
      window.location.href = "/instructor"
    }
  }, [status, session])

  const currentStep = STEPS[step - 1]
  const currentValue = answers[currentStep.field]

  function canContinue() {
    return currentValue !== ""
  }

  function handleSelect(optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.field]: optionId,
    }))
  }

  async function handleComplete() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/become-instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to complete onboarding")
      }

      // The API response sets the updated JWT cookie directly,
      // so a hard redirect will pick up the new INSTRUCTOR role
      toast.success("Welcome to Learnify as an instructor!")
      window.location.href = "/instructor"
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete onboarding"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/become-instructor"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Exit
          </Link>
        </div>
        <span className="text-sm font-medium">
          Step {step} of {TOTAL_STEPS}
        </span>
        <div className="w-16" />
      </div>

      {/* Progress bar */}
      <Progress
        value={(step / TOTAL_STEPS) * 100}
        className="h-1 rounded-none"
      />

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-2xl px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: Content */}
            <div className="space-y-6">
              <h1 className="text-2xl md:text-3xl font-bold">
                {currentStep.title}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Right: Question + Options */}
            <div className="space-y-4">
              <h2 className="font-semibold">{currentStep.question}</h2>
              <div className="space-y-3">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={cn(
                      "w-full text-left rounded-lg border-2 px-5 py-4 transition-colors cursor-pointer",
                      currentValue === opt.id
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/20"
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-4 border-t">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={isSubmitting}
          >
            Previous
          </Button>
        ) : (
          <div />
        )}
        <Button
          onClick={handleNext}
          disabled={!canContinue() || isSubmitting}
          className={cn(
            step === TOTAL_STEPS &&
              "bg-purple-600 hover:bg-purple-700 text-white"
          )}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {step === TOTAL_STEPS ? "Continue" : "Continue"}
        </Button>
      </div>
    </div>
  )
}
