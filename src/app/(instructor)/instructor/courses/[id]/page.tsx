"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { toast } from "sonner"
import {
  Loader2,
  ArrowLeft,
  Eye,
  Globe,
  EyeOff,
  Check,
  MoreVertical,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditorSidebar } from "@/components/courses/editor-sidebar"
import { CourseContentEditor } from "@/components/courses/course-content-editor"
import { IntendedLearnersSection } from "@/components/courses/editor-sections/intended-learners"
import { LandingPageSection } from "@/components/courses/editor-sections/landing-page"
import { PricingSection } from "@/components/courses/editor-sections/pricing"

async function fetchCourse(id: string) {
  const res = await fetch(`/api/courses/${id}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to fetch course")
  }
  return res.json()
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
}

export default function CourseEditorPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = params.id as string

  const [currentSection, setCurrentSection] = useState("landing-page")
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    data: courseData,
    isLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourse(courseId),
  })

  const course = courseData?.course

  const totalLectures = useMemo(() => {
    if (!course?.sections) return 0
    return course.sections.reduce(
      (acc: number, s: { lectures: unknown[] }) => acc + s.lectures.length,
      0
    )
  }, [course?.sections])

  const completionStatus: Record<string, boolean> = useMemo(() => {
    if (!course) return {} as Record<string, boolean>
    return {
      "intended-learners": (course.learningOutcomes?.length || 0) > 0,
      curriculum:
        (course.sections?.length || 0) > 0 && totalLectures > 0,
      "landing-page":
        !!course.title &&
        !!course.description &&
        !!course.thumbnail &&
        !!course.categoryId,
      pricing: true,
    }
  }, [course, totalLectures])

  const canSubmitForReview =
    course?.status === "DRAFT" &&
    completionStatus["intended-learners"] &&
    completionStatus["curriculum"] &&
    completionStatus["landing-page"]

  const canDelete = (course?._count?.enrollments ?? 0) === 0

  async function handleSaved() {
    await queryClient.invalidateQueries({ queryKey: ["course", courseId] })
  }

  async function toggleStatus(newStatus: string) {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update status")
      }
      await queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      toast.success(
        newStatus === "PUBLISHED"
          ? "Course published successfully"
          : newStatus === "PENDING_REVIEW"
            ? "Course submitted for review"
            : "Course unpublished"
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      )
    } finally {
      setIsSaving(false)
    }
  }

  function handleSubmitForReview() {
    toggleStatus("PENDING_REVIEW")
  }

  async function handleDeleteCourse() {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete course")
      }
      toast.success("Course deleted successfully")
      router.push("/instructor")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete course"
      )
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">
            {courseError instanceof Error
              ? courseError.message
              : "This course doesn't exist or you don't have access to it."}
          </p>
          <Button asChild>
            <Link href="/instructor">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)]">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b bg-background flex items-center justify-between px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/instructor">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to courses
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium truncate max-w-[300px]">
            {course.title}
          </span>
          <Badge variant="secondary" className={statusColors[course.status]}>
            {course.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/instructor")}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/courses/${course.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              {course.status === "PUBLISHED" ? "View Live" : "Preview"}
            </Link>
          </Button>
          {course.status === "PUBLISHED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleStatus("DRAFT")}
              disabled={isSaving}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowPublishDialog(true)}
              disabled={isSaving}
            >
              <Globe className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar checklist */}
        <EditorSidebar
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          completionStatus={completionStatus}
          onSubmitForReview={handleSubmitForReview}
          canSubmit={!!canSubmitForReview}
          courseStatus={course.status}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentSection === "intended-learners" && (
            <IntendedLearnersSection
              courseId={courseId}
              learningOutcomes={course.learningOutcomes || []}
              requirements={course.requirements || []}
              targetAudience={course.targetAudience || []}
              onSaved={handleSaved}
            />
          )}

          {currentSection === "curriculum" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Curriculum</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Start building your course by creating sections and lectures.
                </p>
              </div>
              <CourseContentEditor
                courseId={courseId}
                sections={course.sections || []}
              />
            </div>
          )}

          {currentSection === "landing-page" && (
            <LandingPageSection
              courseId={courseId}
              course={course}
              onSaved={handleSaved}
            />
          )}

          {currentSection === "pricing" && (
            <PricingSection
              courseId={courseId}
              price={Number(course.price)}
              onSaved={handleSaved}
            />
          )}

        </main>
      </div>

      {/* Publish confirmation dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish your course?</DialogTitle>
            <DialogDescription>
              Your course will be publicly visible and available for students to
              enroll.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
            <p>
              <strong>Warning:</strong> Once your course gains even 1 enrolled
              student, it can no longer be deleted. You will only be able to
              unpublish or archive it.
            </p>
            <p>
              Make sure your course content, pricing, and landing page are ready
              before publishing.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPublishDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowPublishDialog(false)
                toggleStatus("PUBLISHED")
              }}
              disabled={isSaving}
            >
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Globe className="h-4 w-4 mr-2" />
              Publish Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete course?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{course.title}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
            <strong>Important:</strong> Once a course has even 1 enrolled
            student, it can no longer be deleted. You will only be able to
            archive it.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
