import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { lectureSchema } from "@/lib/validations/course"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id: courseId, sectionId } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can add lectures", code: "ROLE_FORBIDDEN" },
        { status: 403 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Verify section belongs to this course
    const section = await prisma.section.findUnique({
      where: { id: sectionId, courseId },
    })

    if (!section) {
      return NextResponse.json(
        { error: "Section not found", code: "SECTION_NOT_FOUND" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = lectureSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", issues: validated.error.issues },
        { status: 400 }
      )
    }

    // Get next position
    const lastLecture = await prisma.lecture.findFirst({
      where: { sectionId },
      orderBy: { position: "desc" },
      select: { position: true },
    })

    const lecture = await prisma.lecture.create({
      data: {
        title: validated.data.title,
        description: validated.data.description,
        type: validated.data.type,
        content: validated.data.content,
        videoUrl: validated.data.videoUrl || null,
        videoDuration: validated.data.videoDuration || null,
        videoPublicId: validated.data.videoPublicId || null,
        sectionId,
        position: (lastLecture?.position ?? -1) + 1,
      },
    })

    // Update course totalLectures count
    const totalLectures = await prisma.lecture.count({
      where: { section: { courseId } },
    })
    await prisma.course.update({
      where: { id: courseId },
      data: { totalLectures },
    })

    return NextResponse.json({ lecture }, { status: 201 })
  } catch (error) {
    console.error("[LECTURES_POST]", error)
    return NextResponse.json(
      { error: "Failed to create lecture", code: "LECTURE_CREATE_FAILED" },
      { status: 500 }
    )
  }
}
