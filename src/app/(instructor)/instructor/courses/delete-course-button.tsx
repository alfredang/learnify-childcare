"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

interface DeleteCourseButtonProps {
  courseId: string
  courseTitle: string
  hasEnrollments: boolean
}

export function DeleteCourseButton({
  courseId,
  courseTitle,
  hasEnrollments,
}: DeleteCourseButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete course")
      }

      setOpen(false)
      toast.success("Course deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete course"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (hasEnrollments) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="Cannot delete a course with enrolled students"
      >
        <Trash className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Delete</span>
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash className="h-4 w-4 text-red-600" />
          <span className="sr-only">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete course?</DialogTitle>
          <DialogDescription>
            This will permanently delete &ldquo;{courseTitle}&rdquo;. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
