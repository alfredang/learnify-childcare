import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  }
  return _stripe
}

interface CreateAssignmentCheckoutParams {
  assignments: {
    courseId: string
    courseName: string
    learnerId: string
    learnerName: string
  }[]
  organizationId: string
  organizationName: string
  adminEmail: string
  priceSgdPerCourse: number
}

export async function createAssignmentCheckout({
  assignments,
  organizationId,
  organizationName,
  adminEmail,
  priceSgdPerCourse,
}: CreateAssignmentCheckoutParams) {
  const line_items = assignments.map((a) => ({
    price_data: {
      currency: "sgd",
      product_data: {
        name: a.courseName,
        description: `Assignment for ${a.learnerName}`,
      },
      unit_amount: Math.round(priceSgdPerCourse * 100),
    },
    quantity: 1,
  }))

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: adminEmail,
    line_items,
    metadata: {
      organizationId,
      assignmentData: JSON.stringify(
        assignments.map((a) => ({
          courseId: a.courseId,
          learnerId: a.learnerId,
        }))
      ),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/corporate/assign?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/corporate/assign?canceled=true`,
  })

  return session
}

export function formatPriceSgd(price: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(price)
}
