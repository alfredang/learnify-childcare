import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sectionSchema } from "@/lib/validations/course"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only instructors can add sections", code: "ROLE_FORBIDDEN" },
        { status: 403 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      )
    }

    if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not own this course", code: "NOT_COURSE_OWNER" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = sectionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", issues: validated.error.issues },
        { status: 400 }
      )
    }

    // Get next position
    const lastSection = await prisma.section.findFirst({
      where: { courseId },
      orderBy: { position: "desc" },
      select: { position: true },
    })

    const section = await prisma.section.create({
      data: {
        ...validated.data,
        courseId,
        position: (lastSection?.position ?? -1) + 1,
      },
      include: { lectures: true },
    })

    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    console.error("[SECTIONS_POST]", error)
    return NextResponse.json(
      { error: "Failed to create section", code: "SECTION_CREATE_FAILED" },
      { status: 500 }
    )
  }
}
