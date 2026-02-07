"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { BookPlus, Loader2 } from "lucide-react"
import { DEFAULT_DEADLINE_MONTHS } from "@/lib/constants"

interface Learner {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface AssignCourseFormProps {
  courseId: string
  courseTitle: string
  priceSgd: number
  availableLearners: Learner[]
  billingEnabled: boolean
}

export function AssignCourseForm({
  courseId,
  courseTitle,
  priceSgd,
  availableLearners,
  billingEnabled,
}: AssignCourseFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([])
  const [deadline, setDeadline] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + DEFAULT_DEADLINE_MONTHS)
    return d.toISOString().split("T")[0]
  })
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function toggleLearner(learnerId: string) {
    setSelectedLearnerIds((prev) =>
      prev.includes(learnerId)
        ? prev.filter((id) => id !== learnerId)
        : [...prev, learnerId]
    )
  }

  function toggleAll() {
    if (selectedLearnerIds.length === availableLearners.length) {
      setSelectedLearnerIds([])
    } else {
      setSelectedLearnerIds(availableLearners.map((l) => l.id))
    }
  }

  async function handleSubmit() {
    if (selectedLearnerIds.length === 0) {
      toast.error("Please select at least one learner")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          learnerIds: selectedLearnerIds,
          deadline: deadline || null,
          notes: notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign course")
      }

      // If billing is enabled and a Stripe URL is returned, redirect
      if (billingEnabled && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      toast.success(
        `Successfully assigned "${courseTitle}" to ${selectedLearnerIds.length} learner${selectedLearnerIds.length !== 1 ? "s" : ""}`
      )

      setOpen(false)
      setSelectedLearnerIds([])
      setNotes("")
      router.refresh()
    } catch (error) {
      console.error("Assignment error:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to assign course"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalCost = selectedLearnerIds.length * priceSgd

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <BookPlus className="h-4 w-4" />
          Assign to Learners
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Course</DialogTitle>
          <DialogDescription>
            Assign &quot;{courseTitle}&quot; to learners in your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Learner Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Learners</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={toggleAll}
              >
                {selectedLearnerIds.length === availableLearners.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="rounded-md border max-h-48 overflow-y-auto">
              {availableLearners.map((learner) => (
                <label
                  key={learner.id}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                >
                  <Checkbox
                    checked={selectedLearnerIds.includes(learner.id)}
                    onCheckedChange={() => toggleLearner(learner.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {learner.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {learner.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {selectedLearnerIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedLearnerIds.length} learner
                {selectedLearnerIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor={`deadline-${courseId}`}>
              Completion Deadline
            </Label>
            <Input
              id={`deadline-${courseId}`}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              Learners will be marked overdue if not completed by this date.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor={`notes-${courseId}`}>Notes (optional)</Label>
            <Textarea
              id={`notes-${courseId}`}
              placeholder="Add any notes for the learners..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Cost Summary */}
          {billingEnabled && selectedLearnerIds.length > 0 && (
            <div className="rounded-md border bg-muted/30 p-4 space-y-2">
              <h4 className="text-sm font-semibold">Cost Summary</h4>
              <div className="flex items-center justify-between text-sm">
                <span>
                  {selectedLearnerIds.length} x S${priceSgd.toFixed(2)}
                </span>
                <span className="font-bold">
                  S${totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                You will be redirected to Stripe to complete payment.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedLearnerIds.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {billingEnabled ? "Redirecting..." : "Assigning..."}
              </>
            ) : billingEnabled ? (
              <>
                Proceed to Payment (S${totalCost.toFixed(2)})
              </>
            ) : (
              <>
                Assign to {selectedLearnerIds.length} Learner
                {selectedLearnerIds.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
