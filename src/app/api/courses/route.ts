import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { courseSchema } from "@/lib/validations/course"
import slugify from "slugify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    // Fetch single course by slug
    if (slug) {
      const course = await prisma.course.findUnique({
        where: { slug, status: "PUBLISHED" },
        include: {
          instructor: {
            select: { id: true, name: true, image: true, headline: true },
          },
          category: true,
        },
      })

      if (!course) {
        return NextResponse.json(
          { message: "Course not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ course })
    }

    // Fetch multiple courses with pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: {
        instructor: {
          select: { id: true, name: true, image: true, headline: true },
        },
        category: true,
      },
      orderBy: { totalStudents: "desc" },
      skip,
      take: limit,
    })

    const total = await prisma.course.count({ where: { status: "PUBLISHED" } })

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

    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = courseSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedData.error.issues },
        { status: 400 }
      )
    }

    const { title, subtitle, description, categoryId, level, price } =
      validatedData.data

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true })
    const existingSlug = await prisma.course.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        subtitle,
        description,
        categoryId,
        level,
        price: Math.round(price * 100), // Store in cents
        isFree: price === 0,
        instructorId: session.user.id,
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
