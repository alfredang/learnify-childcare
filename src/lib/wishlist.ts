import { prisma } from "@/lib/prisma"

export async function getWishlistedCourseIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set()

  const items = await prisma.wishlist.findMany({
    where: { userId },
    select: { courseId: true },
  })

  return new Set(items.map((item) => item.courseId))
}
