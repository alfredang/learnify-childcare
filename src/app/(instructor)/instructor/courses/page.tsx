import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/stripe"
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
import { EmptyState } from "@/components/shared/empty-state"
import { Plus, BookOpen, MoreHorizontal, Pencil, Eye, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const metadata: Metadata = {
  title: "My Courses",
  description: "Manage your courses",
}

async function getCourses(userId: string) {
  try {
    return await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        category: true,
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
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

export default async function InstructorCoursesPage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  const courses = await getCourses(session.user.id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            Create and manage your courses
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {courses.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-24 rounded overflow-hidden">
                        <Image
                          src={
                            course.thumbnail || "/images/placeholder-course.jpg"
                          }
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/instructor/courses/${course.id}`}
                          className="font-medium hover:underline"
                        >
                          {course.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {course._count.reviews} reviews
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{course.category.name}</TableCell>
                  <TableCell>
                    {course.isFree
                      ? "Free"
                      : formatPrice(Number(course.price))}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/instructor/courses/${course.id}`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {course.status === "PUBLISHED" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/courses/${course.slug}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course and start teaching"
          actionLabel="Create Course"
          actionHref="/instructor/courses/new"
        />
      )}
    </div>
  )
}
