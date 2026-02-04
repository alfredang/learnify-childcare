import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCheckoutSession, createCartCheckoutSession } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Cart checkout (multiple courses)
    if (body.cartCheckout && body.courseIds) {
      return handleCartCheckout(
        body.courseIds,
        session.user.id,
        session.user.email!,
        body.expectedPrices
      )
    }

    // Single course checkout (existing flow)
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      )
    }

    // Validate price hasn't changed since the student loaded the page
    if (body.expectedPrice !== undefined && !course.isFree) {
      const currentPrice = course.discountPrice
        ? Number(course.discountPrice)
        : Number(course.price)
      if (Math.abs(currentPrice - body.expectedPrice) > 0.01) {
        return NextResponse.json(
          {
            message: "The price has changed since you loaded this page",
            code: "PRICE_CHANGED",
          },
          { status: 409 }
        )
      }
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

      // Remove from cart if it was there
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, courseId },
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
    console.error("[CHECKOUT_POST]", error)
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

async function handleCartCheckout(
  courseIds: string[],
  userId: string,
  userEmail: string,
  expectedPrices?: Record<string, number>
) {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return NextResponse.json(
      { message: "No courses provided" },
      { status: 400 }
    )
  }

  // Fetch all courses (allow unpublished — student may have added before it was unpublished)
  const courses = await prisma.course.findMany({
    where: {
      id: { in: courseIds },
    },
  })

  if (courses.length === 0) {
    return NextResponse.json(
      { message: "No valid courses found" },
      { status: 404 }
    )
  }

  // Validate prices haven't changed since the student loaded their cart
  if (expectedPrices && Object.keys(expectedPrices).length > 0) {
    for (const course of courses) {
      if (course.isFree) continue
      const expected = expectedPrices[course.id]
      if (expected === undefined) continue
      const currentPrice = course.discountPrice
        ? Number(course.discountPrice)
        : Number(course.price)
      if (Math.abs(currentPrice - expected) > 0.01) {
        return NextResponse.json(
          {
            message: "Course prices have changed since you loaded your cart",
            code: "PRICE_CHANGED",
          },
          { status: 409 }
        )
      }
    }
  }

  // Check for existing enrollments
  const existingEnrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      courseId: { in: courseIds },
    },
    select: { courseId: true },
  })

  const enrolledIds = new Set(existingEnrollments.map((e) => e.courseId))
  const unenrolledCourses = courses.filter((c) => !enrolledIds.has(c.id))

  if (unenrolledCourses.length === 0) {
    return NextResponse.json(
      { message: "Already enrolled in all selected courses" },
      { status: 400 }
    )
  }

  // Separate free and paid courses
  const freeCourses = unenrolledCourses.filter((c) => c.isFree)
  const paidCourses = unenrolledCourses.filter((c) => !c.isFree)

  // Enroll in free courses immediately
  if (freeCourses.length > 0) {
    await prisma.$transaction([
      ...freeCourses.map((course) =>
        prisma.enrollment.create({
          data: { userId, courseId: course.id },
        })
      ),
      ...freeCourses.map((course) =>
        prisma.course.update({
          where: { id: course.id },
          data: { totalStudents: { increment: 1 } },
        })
      ),
      // Remove free courses from cart
      prisma.cartItem.deleteMany({
        where: {
          userId,
          courseId: { in: freeCourses.map((c) => c.id) },
        },
      }),
    ])
  }

  // If only free courses, no need for Stripe
  if (paidCourses.length === 0) {
    // Clear remaining cart items
    await prisma.cartItem.deleteMany({
      where: { userId },
    })
    return NextResponse.json({ free: true, url: "/my-courses" })
  }

  // Create Stripe checkout for paid courses
  const items = paidCourses.map((course) => ({
    courseId: course.id,
    courseName: course.title,
    coursePrice: course.discountPrice
      ? Number(course.discountPrice)
      : Number(course.price),
    courseImage: course.thumbnail || undefined,
  }))

  const checkoutSession = await createCartCheckoutSession({
    items,
    userId,
    userEmail,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
