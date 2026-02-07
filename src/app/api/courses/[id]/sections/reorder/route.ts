import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
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

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can reorder sections", code: "ROLE_FORBIDDEN" },
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

    const body = await request.json()
    const { orderedIds } = body as { orderedIds: string[] }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty array", code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    // Update positions in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.section.update({
          where: { id },
          data: { position: index },
        })
      )
    )

    return NextResponse.json({ message: "Sections reordered successfully" })
  } catch (error) {
    console.error("[SECTIONS_REORDER]", error)
    return NextResponse.json(
      { error: "Failed to reorder sections", code: "SECTIONS_REORDER_FAILED" },
      { status: 500 }
    )
  }
}
