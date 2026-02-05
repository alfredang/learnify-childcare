"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import {
  Search,
  Star,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils"

interface InstructorCourse {
  id: string
  title: string
  status: string
  price: number
  thumbnail: string | null
  averageRating: number
  totalEarnings: number
  monthlyEarnings: number
  totalStudents: number
  monthlyEnrollments: number
  updatedAt: string
}

interface InstructorCourseListProps {
  courses: InstructorCourse[]
}

const statusStyles: Record<string, { label: string; className: string }> = {
  PUBLISHED: {
    label: "LIVE",
    className: "bg-green-600 text-white border-green-600 hover:bg-green-600",
  },
  DRAFT: {
    label: "DRAFT",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
  },
  PENDING_REVIEW: {
    label: "PENDING",
    className:
      "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  },
  REJECTED: {
    label: "REJECTED",
    className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  },
  ARCHIVED: {
    label: "ARCHIVED",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100",
  },
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => {
        const value = i + 1
        const filled = rating >= value
        const halfFilled = rating >= value - 0.5 && rating < value
        return (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              filled
                ? "fill-yellow-400 text-yellow-400"
                : halfFilled
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
            )}
          />
        )
      })}
    </div>
  )
}

export function InstructorCourseList({ courses }: InstructorCourseListProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [deleteTarget, setDeleteTarget] = useState<InstructorCourse | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [hoveredColumn, setHoveredColumn] = useState<{
    courseId: string
    column: string
  } | null>(null)

  const filtered = useMemo(() => {
    const result = courses.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    )

    switch (sort) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        break
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )
        break
      case "a-z":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "z-a":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
    }

    return result
  }, [courses, search, sort])

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/courses/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete course")
      }
      toast.success("Course deleted successfully")
      setDeleteTarget(null)
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete course"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Input
            placeholder="Search your courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
          <div className="absolute right-0 top-0 h-full flex items-center">
            <Button
              size="icon"
              variant="default"
              className="h-full rounded-l-none"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="a-z">A-Z</SelectItem>
            <SelectItem value="z-a">Z-A</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            asChild
          >
            <Link href="/instructor/courses/new">New course</Link>
          </Button>
        </div>
      </div>

      {/* Course list */}
      {filtered.length > 0 ? (
        <div className="divide-y">
          {filtered.map((course) => {
            const status =
              statusStyles[course.status] || statusStyles.DRAFT
            const canDelete = course.totalStudents === 0

            return (
              <div
                key={course.id}
                className="flex items-center py-5 pl-8 pr-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() =>
                  router.push(`/instructor/courses/${course.id}`)
                }
              >
                {/* Thumbnail */}
                <div className="w-[240px] h-[135px] bg-muted rounded overflow-hidden shrink-0">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      width={240}
                      height={135}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Title + Status */}
                <div className="flex-1 min-w-0 max-w-[600px] ml-5 space-y-1.5">
                  <h3 className="font-bold text-base line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-[10px] px-1.5 py-0 rounded-sm font-bold uppercase",
                        status.className
                      )}
                    >
                      {status.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ${course.price.toFixed(2)} -{" "}
                      {course.status === "PUBLISHED" ? "Public" : "Private"}
                    </span>
                  </div>
                </div>

                {/* Earnings */}
                <div
                  className="w-[140px] shrink-0 hidden lg:block"
                  onMouseEnter={() =>
                    setHoveredColumn({
                      courseId: course.id,
                      column: "earnings",
                    })
                  }
                  onMouseLeave={() => setHoveredColumn(null)}
                >
                  {hoveredColumn?.courseId === course.id &&
                  hoveredColumn?.column === "earnings" ? (
                    <span className="text-sm font-medium text-purple-600">
                      See performance
                    </span>
                  ) : (
                    <>
                      <p className="text-base font-bold">
                        ${(course.monthlyEarnings / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Earned this month
                      </p>
                      <p className="text-base font-bold mt-1.5">
                        ${(course.totalEarnings / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total earned
                      </p>
                    </>
                  )}
                </div>

                {/* Enrollments */}
                <div
                  className="w-[140px] shrink-0 hidden lg:block"
                  onMouseEnter={() =>
                    setHoveredColumn({
                      courseId: course.id,
                      column: "students",
                    })
                  }
                  onMouseLeave={() => setHoveredColumn(null)}
                >
                  {hoveredColumn?.courseId === course.id &&
                  hoveredColumn?.column === "students" ? (
                    <span className="text-sm font-medium text-purple-600">
                      See students
                    </span>
                  ) : (
                    <>
                      <p className="text-base font-bold">
                        {course.monthlyEnrollments}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enrollments this month
                      </p>
                      <p className="text-base font-bold mt-1.5">
                        {course.totalStudents}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total students
                      </p>
                    </>
                  )}
                </div>

                {/* Rating */}
                <div
                  className="w-[120px] shrink-0 hidden lg:block"
                  onMouseEnter={() =>
                    setHoveredColumn({
                      courseId: course.id,
                      column: "rating",
                    })
                  }
                  onMouseLeave={() => setHoveredColumn(null)}
                >
                  {hoveredColumn?.courseId === course.id &&
                  hoveredColumn?.column === "rating" ? (
                    <span className="text-sm font-medium text-purple-600">
                      See reviews
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold">
                          {Number(course.averageRating).toFixed(2)}
                        </span>
                        <StarDisplay
                          rating={Number(course.averageRating)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Course rating
                      </p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div
                  className="shrink-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/instructor/courses/${course.id}`
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(course)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No courses found matching your search.</p>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete course?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}
              &quot;? This action cannot be undone.
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
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
