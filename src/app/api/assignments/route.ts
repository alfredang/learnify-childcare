import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { courseAssignmentSchema, bulkAssignmentSchema } from "@/lib/validations/organization"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Learners see their own assignments
    if (session.user.role === "LEARNER") {
      const where: Record<string, unknown> = { learnerId: session.user.id }
      if (status) where.status = status

      const assignments = await prisma.courseAssignment.findMany({
        where,
        include: {
          course: {
            include: { category: true, createdBy: { select: { id: true, name: true } } },
          },
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: { assignedAt: "desc" },
      })

      return NextResponse.json({ assignments })
    }

    // Corporate admins see their org's assignments
    if (session.user.role === "CORPORATE_ADMIN") {
      if (!session.user.organizationId) {
        return NextResponse.json({ error: "No organization assigned" }, { status: 400 })
      }

      const where: Record<string, unknown> = { organizationId: session.user.organizationId }
      if (status) where.status = status

      const assignments = await prisma.courseAssignment.findMany({
        where,
        include: {
          learner: { select: { id: true, name: true, email: true, image: true } },
          course: { select: { id: true, title: true, slug: true, thumbnail: true, cpdPoints: true, estimatedHours: true } },
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: { assignedAt: "desc" },
      })

      return NextResponse.json({ assignments })
    }

    // Super admin sees all
    if (session.user.role === "SUPER_ADMIN") {
      const assignments = await prisma.courseAssignment.findMany({
        include: {
          learner: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true, cpdPoints: true } },
          organization: { select: { id: true, name: true } },
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: { assignedAt: "desc" },
        take: 100,
      })

      return NextResponse.json({ assignments })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "CORPORATE_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const organizationId = session.user.organizationId
    if (!organizationId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No organization assigned" }, { status: 400 })
    }

    const body = await request.json()

    // Handle bulk assignments
    if (body.learnerIds) {
      const validated = bulkAssignmentSchema.safeParse(body)
      if (!validated.success) {
        return NextResponse.json(
          { error: "Invalid input", issues: validated.error.issues },
          { status: 400 }
        )
      }

      const { learnerIds, courseId, deadline } = validated.data
      const orgId = body.organizationId || organizationId

      // Check org billing
      const org = await prisma.organization.findUnique({
        where: { id: orgId! },
        select: { billingEnabled: true },
      })

      if (org?.billingEnabled) {
        // TODO: Trigger Stripe checkout for bulk assignments
        return NextResponse.json(
          { error: "Stripe billing for bulk assignments not yet implemented" },
          { status: 501 }
        )
      }

      // Create assignments and enrollments directly (no billing)
      const results = await Promise.allSettled(
        learnerIds.map(async (learnerId) => {
          const assignment = await prisma.courseAssignment.create({
            data: {
              learnerId,
              courseId,
              assignedById: session.user.id,
              organizationId: orgId!,
              deadline: deadline || null,
            },
          })

          await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: learnerId, courseId } },
            create: {
              userId: learnerId,
              courseId,
              assignedById: session.user.id,
              assignedAt: new Date(),
              deadline: deadline || null,
            },
            update: {
              assignedById: session.user.id,
              assignedAt: new Date(),
              deadline: deadline || null,
            },
          })

          return assignment
        })
      )

      const successful = results.filter((r) => r.status === "fulfilled").length
      const failed = results.filter((r) => r.status === "rejected").length

      return NextResponse.json(
        { message: `${successful} assignments created, ${failed} failed` },
        { status: 201 }
      )
    }

    // Single assignment
    const validated = courseAssignmentSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: validated.error.issues },
        { status: 400 }
      )
    }

    const { learnerId, courseId, deadline, notes } = validated.data
    const orgId = body.organizationId || organizationId

    // Check if already assigned
    const existing = await prisma.courseAssignment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Course already assigned to this learner" },
        { status: 409 }
      )
    }

    // Check org billing
    const org = await prisma.organization.findUnique({
      where: { id: orgId! },
      select: { billingEnabled: true },
    })

    if (org?.billingEnabled) {
      // TODO: Trigger Stripe checkout
      return NextResponse.json(
        { error: "Stripe billing not yet implemented" },
        { status: 501 }
      )
    }

    // Create assignment and enrollment directly
    const assignment = await prisma.courseAssignment.create({
      data: {
        learnerId,
        courseId,
        assignedById: session.user.id,
        organizationId: orgId!,
        deadline: deadline || null,
        notes,
      },
    })

    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: learnerId, courseId } },
      create: {
        userId: learnerId,
        courseId,
        assignedById: session.user.id,
        assignedAt: new Date(),
        deadline: deadline || null,
      },
      update: {
        assignedById: session.user.id,
        assignedAt: new Date(),
        deadline: deadline || null,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}
