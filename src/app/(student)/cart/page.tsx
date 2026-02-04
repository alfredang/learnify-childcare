import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CartGrid } from "./cart-grid"

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review and checkout your selected courses",
}

async function getCartItems(userId: string) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, image: true, headline: true },
            },
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return JSON.parse(JSON.stringify(items))
  } catch (error) {
    console.error("Failed to fetch cart items:", error)
    return []
  }
}

async function getEnrolledCourseIds(userId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    })

    return enrollments.map((e) => e.courseId)
  } catch {
    return []
  }
}

export default async function CartPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/cart")
  }

  const [cartItems, enrolledCourseIds] = await Promise.all([
    getCartItems(session.user.id),
    getEnrolledCourseIds(session.user.id),
  ])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartGrid initialItems={cartItems} enrolledCourseIds={enrolledCourseIds} />
    </div>
  )
}
