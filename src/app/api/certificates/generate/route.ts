import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const courseId = formData.get("courseId") as string

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      )
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
      include: {
        course: {
          include: {
            sections: {
              include: { lectures: true },
            },
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    // Check if course is completed
    const allLectures = enrollment.course.sections.flatMap((s) => s.lectures)
    const completedProgress = await prisma.lectureProgress.count({
      where: {
        userId: session.user.id,
        lectureId: { in: allLectures.map((l) => l.id) },
        isCompleted: true,
      },
    })

    if (completedProgress < allLectures.length) {
      return NextResponse.json(
        { message: "Course not completed yet" },
        { status: 400 }
      )
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: { userId: session.user.id, courseId },
    })

    if (existingCert) {
      return NextResponse.redirect(new URL("/certificates", request.url))
    }

    // Get organization name for certificate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: { select: { name: true } } },
    })

    // Generate certificate
    await prisma.certificate.create({
      data: {
        certificateId: `CERT-${nanoid(10).toUpperCase()}`,
        userId: session.user.id,
        courseId,
        courseName: enrollment.course.title,
        organizationName: user?.organization?.name || "Learnify",
        cpdPoints: enrollment.course.cpdPoints,
      },
    })

    return NextResponse.redirect(new URL("/certificates", request.url))
  } catch (error) {
    console.error("Certificate generation error:", error)
    return NextResponse.json(
      { message: "Failed to generate certificate" },
      { status: 500 }
    )
  }
}
