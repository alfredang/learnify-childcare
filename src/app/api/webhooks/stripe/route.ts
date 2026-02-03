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

    const { courseId, userId } = session.metadata || {}

    if (!courseId || !userId) {
      return NextResponse.json(
        { message: "Missing metadata" },
        { status: 400 }
      )
    }

    try {
      // Get course details
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      })

      if (!course) {
        return NextResponse.json(
          { message: "Course not found" },
          { status: 404 }
        )
      }

      const amount = session.amount_total || 0
      const platformFee = Math.round(amount * 0.3)
      const instructorEarning = amount - platformFee

      // Create enrollment and purchase in a transaction
      await prisma.$transaction([
        prisma.enrollment.create({
          data: {
            userId,
            courseId,
          },
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
      ])

      console.log(`Enrollment created for user ${userId} in course ${courseId}`)
    } catch (error) {
      console.error("Error processing webhook:", error)
      return NextResponse.json(
        { message: "Error processing webhook" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
