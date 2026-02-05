"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 3

async function fetchCategories() {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

export default function CreateCourseWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [timeCommitment, setTimeCommitment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  function canContinue() {
    switch (step) {
      case 1:
        return title.trim().length >= 5 && title.trim().length <= 60
      case 2:
        return !!categoryId
      case 3:
        return true
      default:
        return false
    }
  }

  async function handleCreate() {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), categoryId }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to create course")
      }

      const course = await res.json()
      toast.success("Course created!")
      router.push(`/instructor/courses/${course.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create course"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      handleCreate()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/instructor"
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
      <Progress value={(step / TOTAL_STEPS) * 100} className="h-1 rounded-none" />

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-xl px-6 py-12">
          {step === 1 && (
            <StepTitle value={title} onChange={setTitle} />
          )}
          {step === 2 && (
            <StepCategory
              value={categoryId}
              onChange={setCategoryId}
              categories={categories}
            />
          )}
          {step === 3 && (
            <StepTimeCommitment value={timeCommitment} onChange={setTimeCommitment} />
          )}
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
            step === TOTAL_STEPS && "bg-purple-600 hover:bg-purple-700 text-white"
          )}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {step === TOTAL_STEPS ? "Create Course" : "Continue"}
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step Components                                                    */
/* ------------------------------------------------------------------ */

function StepTitle({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const charCount = value.length

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">How about a working title?</h1>
        <p className="text-muted-foreground">
          It&apos;s ok if you can&apos;t think of a good title now. You can change it
          later.
        </p>
      </div>

      <div className="mt-8 space-y-2">
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= 60) {
                onChange(e.target.value)
              }
            }}
            placeholder="e.g. Learn Photoshop CS6 from Scratch"
            className="pr-16 text-base py-6"
            autoFocus
          />
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-sm",
              charCount > 55
                ? "text-orange-500"
                : "text-muted-foreground"
            )}
          >
            {charCount}/60
          </span>
        </div>
        {charCount > 0 && charCount < 5 && (
          <p className="text-sm text-destructive">
            Title must be at least 5 characters
          </p>
        )}
      </div>
    </div>
  )
}

function StepCategory({
  value,
  onChange,
  categories,
}: {
  value: string
  onChange: (v: string) => void
  categories: { id: string; name: string }[]
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          What category best fits the knowledge you&apos;ll share?
        </h1>
        <p className="text-muted-foreground">
          If you&apos;re not sure about the right category, you can change it later.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full max-w-sm py-6 text-base">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function StepTimeCommitment({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const options = [
    {
      id: "0-2",
      label: "I'm very busy right now (0-2 hours)",
    },
    {
      id: "2-4",
      label: "I'll work on this on the side (2-4 hours)",
    },
    {
      id: "4+",
      label: "I have lots of flexibility (4+ hours)",
    },
    {
      id: "undecided",
      label: "I haven't decided if I have time",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          How much time can you spend creating your course per week?
        </h1>
        <p className="text-muted-foreground">
          There&apos;s no wrong answer. We can help you achieve your goals.
        </p>
      </div>

      <div className="mt-8 space-y-3 max-w-md mx-auto">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "w-full text-left rounded-lg border-2 px-5 py-4 transition-colors cursor-pointer",
              value === opt.id
                ? "border-purple-600 bg-purple-50 dark:bg-purple-950/20"
                : "border-border hover:border-muted-foreground/50"
            )}
          >
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
