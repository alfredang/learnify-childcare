import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WishlistGrid } from "./wishlist-grid"

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Courses you've saved for later",
}

async function getWishlist(userId: string) {
  const items = await prisma.wishlist.findMany({
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
}

async function getEnrolledCourseIds(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  })

  return enrollments.map((e) => e.courseId)
}

export default async function WishlistPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/wishlist")
  }

  const [wishlist, enrolledCourseIds] = await Promise.all([
    getWishlist(session.user.id),
    getEnrolledCourseIds(session.user.id),
  ])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <WishlistGrid initialItems={wishlist} enrolledCourseIds={enrolledCourseIds} />
    </div>
  )
}
