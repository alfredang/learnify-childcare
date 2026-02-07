import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { lectureSchema } from "@/lib/validations/course"
import { deleteAsset } from "@/lib/cloudinary"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lectureId: string }> }
) {
  try {
    const { id: courseId, sectionId, lectureId } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update lectures", code: "ROLE_FORBIDDEN" },
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

    const existingLecture = await prisma.lecture.findUnique({
      where: { id: lectureId, sectionId },
    })

    if (!existingLecture) {
      return NextResponse.json(
        { error: "Lecture not found", code: "LECTURE_NOT_FOUND" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = lectureSchema.partial().safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", code: "VALIDATION_ERROR", issues: validated.error.issues },
        { status: 400 }
      )
    }

    // If video is being replaced, delete the old one from Cloudinary
    if (
      validated.data.videoPublicId &&
      existingLecture.videoPublicId &&
      validated.data.videoPublicId !== existingLecture.videoPublicId
    ) {
      try {
        await deleteAsset(existingLecture.videoPublicId, "video")
      } catch (err) {
        console.error("[LECTURE_PUT] Failed to delete old video:", err)
      }
    }

    const lecture = await prisma.lecture.update({
      where: { id: lectureId },
      data: {
        ...(validated.data.title && { title: validated.data.title }),
        ...(validated.data.description !== undefined && {
          description: validated.data.description,
        }),
        ...(validated.data.type && { type: validated.data.type }),
        ...(validated.data.content !== undefined && { content: validated.data.content }),
        ...(validated.data.videoUrl !== undefined && {
          videoUrl: validated.data.videoUrl || null,
        }),
        ...(validated.data.videoDuration !== undefined && {
          videoDuration: validated.data.videoDuration || null,
        }),
        ...(validated.data.videoPublicId !== undefined && {
          videoPublicId: validated.data.videoPublicId || null,
        }),
      },
    })

    return NextResponse.json({ lecture })
  } catch (error) {
    console.error("[LECTURE_PUT]", error)
    return NextResponse.json(
      { error: "Failed to update lecture", code: "LECTURE_UPDATE_FAILED" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lectureId: string }> }
) {
  try {
    const { id: courseId, sectionId, lectureId } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete lectures", code: "ROLE_FORBIDDEN" },
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

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId, sectionId },
      select: { position: true, videoPublicId: true },
    })

    if (!lecture) {
      return NextResponse.json(
        { error: "Lecture not found", code: "LECTURE_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Delete video from Cloudinary if it exists
    if (lecture.videoPublicId) {
      try {
        await deleteAsset(lecture.videoPublicId, "video")
      } catch (err) {
        console.error("[LECTURE_DELETE] Failed to delete video:", err)
      }
    }

    await prisma.lecture.delete({ where: { id: lectureId } })

    // Reposition remaining lectures
    await prisma.lecture.updateMany({
      where: { sectionId, position: { gt: lecture.position } },
      data: { position: { decrement: 1 } },
    })

    // Update course totalLectures count
    const totalLectures = await prisma.lecture.count({
      where: { section: { courseId } },
    })
    await prisma.course.update({
      where: { id: courseId },
      data: { totalLectures },
    })

    return NextResponse.json({ message: "Lecture deleted successfully" })
  } catch (error) {
    console.error("[LECTURE_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to delete lecture", code: "LECTURE_DELETE_FAILED" },
      { status: 500 }
    )
  }
}
