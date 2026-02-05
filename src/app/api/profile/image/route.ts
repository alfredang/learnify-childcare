import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const imageSchema = z.object({
  image: z.string().url("Invalid image URL"),
})

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = imageSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: result.data.image },
      select: { id: true, image: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update profile image:", error)
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    )
  }
}
