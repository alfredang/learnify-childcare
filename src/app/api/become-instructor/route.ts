import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { encode, decode } from "next-auth/jwt"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can become instructors", code: "ROLE_FORBIDDEN" },
        { status: 403 }
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "INSTRUCTOR" },
    })

    // Update the JWT cookie with the new role so the middleware
    // sees INSTRUCTOR immediately on the next request
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(COOKIE_NAME)?.value

    if (sessionToken) {
      const token = await decode({
        token: sessionToken,
        secret: process.env.AUTH_SECRET!,
        salt: COOKIE_NAME,
      })

      if (token) {
        token.role = "INSTRUCTOR"
        const newToken = await encode({
          token,
          secret: process.env.AUTH_SECRET!,
          salt: COOKIE_NAME,
        })

        const response = NextResponse.json({ success: true })
        response.cookies.set(COOKIE_NAME, newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        })
        return response
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[BECOME_INSTRUCTOR_POST]", error)
    return NextResponse.json(
      { error: "Failed to become instructor", code: "PROMOTION_FAILED" },
      { status: 500 }
    )
  }
}
