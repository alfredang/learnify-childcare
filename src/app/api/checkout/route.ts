import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCheckoutSession } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId, status: "PUBLISHED" },
    })

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { message: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    // For free courses, create enrollment directly
    if (course.isFree) {
      await prisma.enrollment.create({
        data: {
          userId: session.user.id,
          courseId,
        },
      })

      await prisma.course.update({
        where: { id: courseId },
        data: { totalStudents: { increment: 1 } },
      })

      return NextResponse.json({
        url: `/my-courses/${courseId}`,
        free: true,
      })
    }

    // Create Stripe checkout session for paid courses
    const checkoutSession = await createCheckoutSession({
      courseId,
      courseSlug: course.slug,
      courseName: course.title,
      coursePrice: Number(course.price),
      courseImage: course.thumbnail || undefined,
      userId: session.user.id,
      userEmail: session.user.email!,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
