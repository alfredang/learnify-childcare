import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Course Management - Learnify",
  description: "Manage all courses on the platform",
}

async function getCourses() {
  try {
    return await prisma.course.findMany({
      include: {
        category: {
          select: { name: true },
        },
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    })
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    return []
  }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-green-100 text-green-800",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-yellow-100 text-yellow-800",
  },
}

export default async function AdminCoursesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/courses")
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  const courses = await getCourses()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">
            Manage all courses on the platform
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Courses Table */}
      {courses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No courses found</p>
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="h-4 w-4" />
              Create Your First Course
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">CPD Points</TableHead>
                <TableHead className="text-center">Est. Hours</TableHead>
                <TableHead className="text-center">Assignments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const status = statusConfig[course.status] || {
                  label: course.status,
                  className: "bg-gray-100 text-gray-800",
                }

                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <div className="relative h-10 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-16 rounded bg-muted flex-shrink-0" />
                        )}
                        <span className="font-medium line-clamp-1">
                          {course.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{course.category.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={status.className}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {course.cpdPoints}
                    </TableCell>
                    <TableCell className="text-center">
                      {Number(course.estimatedHours)}
                    </TableCell>
                    <TableCell className="text-center">
                      {course._count.assignments}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          asChild
                          title="Edit course"
                        >
                          <Link href={`/admin/courses/${course.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete course"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
