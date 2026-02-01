import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
})

interface CreateCheckoutSessionParams {
  courseId: string
  courseName: string
  coursePrice: number
  courseImage?: string
  userId: string
  userEmail: string
}

export async function createCheckoutSession({
  courseId,
  courseName,
  coursePrice,
  courseImage,
  userId,
  userEmail,
}: CreateCheckoutSessionParams) {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: courseName,
            images: courseImage ? [courseImage] : [],
          },
          unit_amount: coursePrice,
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId,
      userId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/enroll?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?canceled=true`,
  })

  return session
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100)
}

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * 0.3)
}

export function calculateInstructorEarning(amount: number): number {
  return Math.round(amount * 0.7)
}
