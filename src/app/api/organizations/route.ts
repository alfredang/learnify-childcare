import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { organizationSchema } from "@/lib/validations/organization"
import slugify from "slugify"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: { select: { users: true, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = organizationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: validated.error.issues },
        { status: 400 }
      )
    }

    let slug = slugify(validated.data.name, { lower: true, strict: true })
    const existing = await prisma.organization.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const organization = await prisma.organization.create({
      data: {
        ...validated.data,
        slug,
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    console.error("Error creating organization:", error)
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })
  }
}
