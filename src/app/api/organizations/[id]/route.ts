import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { organizationSchema } from "@/lib/validations/organization"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Super admin or corporate admin of this org
    if (
      session.user.role !== "SUPER_ADMIN" &&
      session.user.organizationId !== id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true, name: true, email: true, role: true,
            jobTitle: true, staffId: true, image: true,
          },
        },
        _count: { select: { users: true, assignments: true } },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    return NextResponse.json({ organization })
  } catch (error) {
    console.error("Error fetching organization:", error)
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = organizationSchema.partial().safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: validated.error.issues },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: validated.data,
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error("Error updating organization:", error)
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 })
  }
}
