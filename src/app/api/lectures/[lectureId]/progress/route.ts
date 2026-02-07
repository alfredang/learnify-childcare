import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to track progress", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const { lectureId } = await params
    const body = await request.json()
    const { isCompleted, watchedDuration, lastPosition, scormSessionTime, scormLessonLocation, scormSuspendData } = body

    // Verify lecture exists and user is enrolled in the course
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        section: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId: session.user.id },
                },
                createdBy: {
                  select: { name: true },
                },
                sections: {
                  include: {
                    lectures: {
                      select: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!lecture) {
      return NextResponse.json(
        { error: "Lecture not found", code: "NOT_FOUND" },
        { status: 404 }
      )
    }

    const enrollment = lecture.section.course.enrollments[0]
    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course", code: "FORBIDDEN" },
        { status: 403 }
      )
    }

    // Determine SCORM lesson status
    let scormLessonStatus: string | undefined
    if (isCompleted !== undefined) {
      scormLessonStatus = isCompleted ? "completed" : "incomplete"
    }

    // Upsert lecture progress with SCORM fields
    const progress = await prisma.lectureProgress.upsert({
      where: {
        userId_lectureId: {
          userId: session.user.id,
          lectureId,
        },
      },
      update: {
        ...(isCompleted !== undefined && {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        }),
        ...(watchedDuration !== undefined && { watchedDuration }),
        ...(lastPosition !== undefined && { lastPosition }),
        ...(scormLessonStatus !== undefined && { scormLessonStatus }),
        ...(scormSessionTime !== undefined && { scormSessionTime }),
        ...(scormLessonLocation !== undefined && { scormLessonLocation }),
        ...(scormSuspendData !== undefined && { scormSuspendData }),
      },
      create: {
        userId: session.user.id,
        lectureId,
        isCompleted: isCompleted ?? false,
        watchedDuration: watchedDuration ?? 0,
        lastPosition: lastPosition ?? 0,
        completedAt: isCompleted ? new Date() : null,
        scormLessonStatus: scormLessonStatus ?? "not attempted",
      },
    })

    // Recalculate overall course enrollment progress
    const course = lecture.section.course
    const totalLectures = course.sections.reduce(
      (acc, s) => acc + s.lectures.length,
      0
    )

    const completedCount = await prisma.lectureProgress.count({
      where: {
        userId: session.user.id,
        isCompleted: true,
        lecture: {
          section: {
            courseId: course.id,
          },
        },
      },
    })

    const newProgress = totalLectures > 0
      ? Math.round((completedCount / totalLectures) * 100)
      : 0

    const justCompleted = newProgress === 100 && !enrollment.completedAt

    // Update enrollment with SCORM status
    const scormStatus = newProgress === 0
      ? "not attempted"
      : newProgress === 100
        ? "completed"
        : "incomplete"

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: newProgress,
        lastAccessedAt: new Date(),
        scormStatus,
        ...(justCompleted ? { completedAt: new Date() } : {}),
      },
    })

    // Auto-generate certificate on first completion
    let certificateGenerated = false
    if (justCompleted) {
      const existingCert = await prisma.certificate.findFirst({
        where: { userId: session.user.id, courseId: course.id },
      })
      if (!existingCert) {
        // Get organization name for certificate
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { organization: { select: { name: true } } },
        })

        await prisma.certificate.create({
          data: {
            certificateId: `CERT-${nanoid(10).toUpperCase()}`,
            userId: session.user.id,
            courseId: course.id,
            courseName: course.title,
            organizationName: user?.organization?.name || "Learnify",
            cpdPoints: course.cpdPoints,
          },
        })
        certificateGenerated = true
      }
    }

    return NextResponse.json({
      progress,
      courseProgress: newProgress,
      courseCompleted: justCompleted,
      certificateGenerated,
    })
  } catch (error) {
    console.error("[LECTURE_PROGRESS_UPDATE]", error)
    return NextResponse.json(
      { error: "Failed to update progress", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
