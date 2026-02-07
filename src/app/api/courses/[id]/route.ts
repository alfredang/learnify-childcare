import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { courseSchema } from "@/lib/validations/course"
import slugify from "slugify"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        category: true,
        sections: {
          orderBy: { position: "asc" },
          include: {
            lectures: { orderBy: { position: "asc" } },
          },
        },
        _count: { select: { enrollments: true, assignments: true } },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Only super admin can access course management
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden", code: "ROLE_FORBIDDEN" },
        { status: 403 }
      )
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("[COURSE_ID_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch course", code: "COURSE_FETCH_FAILED" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update courses", code: "ROLE_FORBIDDEN" },
        { status: 403 }
      )
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: { slug: true },
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = courseSchema.partial().safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", issues: validatedData.error.issues },
        { status: 400 }
      )
    }

    const data = validatedData.data

    let slug: string | undefined
    if (data.title) {
      slug = slugify(data.title, { lower: true, strict: true })
      if (slug !== existingCourse.slug) {
        const duplicateSlug = await prisma.course.findFirst({
          where: { slug, id: { not: id } },
        })
        if (duplicateSlug) {
          slug = `${slug}-${Date.now()}`
        }
      } else {
        slug = undefined
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(slug && { slug }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.level && { level: data.level }),
        ...(data.language && { language: data.language }),
        ...(data.cpdPoints !== undefined && { cpdPoints: data.cpdPoints }),
        ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours }),
        ...(data.learningOutcomes && { learningOutcomes: data.learningOutcomes }),
        ...(body.thumbnail !== undefined && { thumbnail: body.thumbnail }),
        ...(body.status && {
          status: body.status,
          ...(body.status === "PUBLISHED" && { publishedAt: new Date() }),
        }),
      },
      include: {
        category: true,
        sections: {
          orderBy: { position: "asc" },
          include: { lectures: { orderBy: { position: "asc" } } },
        },
      },
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error("[COURSE_ID_PUT]", error)
    return NextResponse.json(
      { error: "Failed to update course", code: "COURSE_UPDATE_FAILED" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete courses", code: "ROLE_FORBIDDEN" },
        { status: 403 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id },
      select: { _count: { select: { enrollments: true } } },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      )
    }

    if (course._count.enrollments > 0) {
      return NextResponse.json(
        { error: "Cannot delete a course with enrollments. Archive it instead.", code: "HAS_ENROLLMENTS" },
        { status: 400 }
      )
    }

    await prisma.course.delete({ where: { id } })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("[COURSE_ID_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete course", code: "COURSE_DELETE_FAILED" },
      { status: 500 }
    )
  }
}
