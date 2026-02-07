import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inviteLearnerSchema } from "@/lib/validations/organization"
import bcrypt from "bcryptjs"

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

    if (
      session.user.role !== "SUPER_ADMIN" &&
      session.user.organizationId !== id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const learners = await prisma.user.findMany({
      where: { organizationId: id, role: "LEARNER" },
      select: {
        id: true, name: true, email: true, image: true,
        jobTitle: true, staffId: true, createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ learners })
  } catch (error) {
    console.error("Error fetching learners:", error)
    return NextResponse.json({ error: "Failed to fetch learners" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (
      session.user.role !== "SUPER_ADMIN" &&
      (session.user.role !== "CORPORATE_ADMIN" || session.user.organizationId !== id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = inviteLearnerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: validated.error.issues },
        { status: 400 }
      )
    }

    const { name, email, jobTitle, staffId } = validated.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      // If user exists but not in this org, add them
      if (!existingUser.organizationId) {
        const user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { organizationId: id, jobTitle, staffId },
          select: { id: true, name: true, email: true, role: true },
        })
        return NextResponse.json({ user, message: "Existing user added to organization" })
      }
      return NextResponse.json(
        { error: "User already belongs to an organization" },
        { status: 409 }
      )
    }

    // Check org learner limit
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { maxLearners: true, _count: { select: { users: true } } },
    })

    if (org && org._count.users >= org.maxLearners) {
      return NextResponse.json(
        { error: "Organization has reached its learner limit" },
        { status: 400 }
      )
    }

    // Create new learner with default password
    const defaultPassword = "Welcome123!"
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "LEARNER",
        organizationId: id,
        jobTitle,
        staffId,
      },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json(
      { user, message: "Learner invited successfully", temporaryPassword: defaultPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error inviting learner:", error)
    return NextResponse.json({ error: "Failed to invite learner" }, { status: 500 })
  }
}
