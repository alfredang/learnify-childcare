import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature")

  if (!signature) {
    return NextResponse.json(
      { message: "Missing stripe signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json(
      { message: "Webhook signature verification failed" },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}
    const { userId } = metadata

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId in metadata" },
        { status: 400 }
      )
    }

    try {
      // Cart checkout (multiple courses)
      if (metadata.cartCheckout === "true" && metadata.courseIds) {
        await handleCartPurchase(session, userId, metadata.courseIds)
      }
      // Single course checkout
      else if (metadata.courseId) {
        await handleSinglePurchase(session, userId, metadata.courseId)
      } else {
        return NextResponse.json(
          { message: "Missing course info in metadata" },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error("[WEBHOOK_PROCESSING]", error)
      return NextResponse.json(
        { message: "Error processing webhook" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}

async function handleSinglePurchase(
  session: Stripe.Checkout.Session,
  userId: string,
  courseId: string
) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    throw new Error(`Course ${courseId} not found`)
  }

  const amount = session.amount_total || 0
  const platformFee = Math.round(amount * 0.3)
  const instructorEarning = amount - platformFee

  await prisma.$transaction([
    prisma.enrollment.create({
      data: { userId, courseId },
    }),
    prisma.purchase.create({
      data: {
        userId,
        courseId,
        amount,
        platformFee,
        instructorEarning,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        status: "COMPLETED",
        courseName: course.title,
        coursePrice: course.price,
      },
    }),
    prisma.course.update({
      where: { id: courseId },
      data: { totalStudents: { increment: 1 } },
    }),
    // Remove from cart if present
    prisma.cartItem.deleteMany({
      where: { userId, courseId },
    }),
  ])
}

async function handleCartPurchase(
  session: Stripe.Checkout.Session,
  userId: string,
  courseIdsStr: string
) {
  const courseIds = courseIdsStr.split(",").filter(Boolean)

  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
  })

  if (courses.length === 0) {
    throw new Error("No courses found for cart checkout")
  }

  // Create transaction operations for each course
  const operations = []

  for (const course of courses) {
    // Use the course price we charged during checkout
    const coursePrice = course.discountPrice
      ? Number(course.discountPrice)
      : Number(course.price)
    const courseAmount = Math.round(coursePrice * 100)
    const platformFee = Math.round(courseAmount * 0.3)
    const instructorEarning = courseAmount - platformFee

    operations.push(
      prisma.enrollment.create({
        data: { userId, courseId: course.id },
      })
    )

    // Append courseId to make paymentIntentId unique per Purchase row
    const paymentIntentId = session.payment_intent
      ? `${session.payment_intent}_${course.id}`
      : null

    operations.push(
      prisma.purchase.create({
        data: {
          userId,
          courseId: course.id,
          amount: courseAmount,
          platformFee,
          instructorEarning,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          status: "COMPLETED",
          courseName: course.title,
          coursePrice: course.price,
        },
      })
    )

    operations.push(
      prisma.course.update({
        where: { id: course.id },
        data: { totalStudents: { increment: 1 } },
      })
    )
  }

  // Clear cart for user
  operations.push(
    prisma.cartItem.deleteMany({
      where: { userId },
    })
  )

  await prisma.$transaction(operations)
}
