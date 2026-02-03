import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    // Check if a specific course is in wishlist
    if (courseId) {
      const item = await prisma.wishlist.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId },
        },
      })

      return NextResponse.json({ isWishlisted: !!item })
    }

    // List all wishlist items
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
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

    return NextResponse.json({ wishlist })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist", code: "FETCH_FAILED" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        { error: "Course ID is required", code: "INVALID_INPUT" },
        { status: 400 }
      )
    }

    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId, status: "PUBLISHED" },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Check if already wishlisted - toggle behavior
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
    })

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      })

      return NextResponse.json({ wishlisted: false })
    }

    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    })

    return NextResponse.json({ wishlisted: true }, { status: 201 })
  } catch (error) {
    console.error("Error toggling wishlist:", error)
    return NextResponse.json(
      { error: "Failed to update wishlist", code: "UPDATE_FAILED" },
      { status: 500 }
    )
  }
}
