import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { courseCreateSchema } from "@/lib/validations/course"
import slugify from "slugify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "PUBLISHED"

    const where: Record<string, unknown> = { status }
    if (category) {
      where.category = { slug: category }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          category: true,
          _count: { select: { enrollments: true, assignments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ])

    return NextResponse.json({
      courses,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { message: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = courseCreateSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { title, categoryId } = validatedData.data

    let slug = slugify(title, { lower: true, strict: true })
    const existingSlug = await prisma.course.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        categoryId,
        createdById: session.user.id,
        level: "ALL_LEVELS",
        language: "English",
        priceSgd: 60,
        cpdPoints: 0,
        estimatedHours: 2,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json(
      { message: "Failed to create course" },
      { status: 500 }
    )
  }
}
