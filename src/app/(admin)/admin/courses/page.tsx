import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
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
import { Check, X, Eye } from "lucide-react"

export const metadata: Metadata = {
  title: "Course Management",
  description: "Manage and approve courses",
}

async function getCourses() {
  try {
    return await prisma.course.findMany({
      include: {
        instructor: {
          select: { name: true, email: true },
        },
        category: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    })
  } catch (error) {
    console.error("Failed to fetch courses:", error)
    return []
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
}

export default async function AdminCoursesPage() {
  const courses = await getCourses()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">
          Review and manage all courses on the platform
        </p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-20 rounded overflow-hidden">
                      <Image
                        src={
                          course.thumbnail || "/images/placeholder-course.jpg"
                        }
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium line-clamp-1">
                      {course.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{course.instructor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.instructor.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{course.category.name}</TableCell>
                <TableCell>
                  {course.isFree
                    ? "Free"
                    : `$${Number(course.price).toFixed(2)}`}
                </TableCell>
                <TableCell>{course._count.enrollments}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[course.status]}
                  >
                    {course.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {course.status === "PENDING_REVIEW" && (
                      <>
                        <Button size="icon" variant="ghost" title="Approve">
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Reject">
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    {course.status === "PUBLISHED" && (
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/courses/${course.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
