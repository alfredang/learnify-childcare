import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/courses",
  "/categories",
  "/instructors",
  "/search",
  "/about",
  "/contact",
  "/become-instructor",
]

const authRoutes = ["/login", "/register", "/forgot-password"]

const studentRoutes = ["/my-courses", "/favourites", "/purchases", "/profile"]
const instructorRoutes = ["/instructor"]
const adminRoutes = ["/admin"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const pathname = nextUrl.pathname

  // Check if it's a public route (exact match or starts with public path)
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if it's an auth route (login, register, etc.)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check route types
  const isStudentRoute = studentRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isInstructorRoute = instructorRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Allow API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  // Require auth for onboarding wizard (must be before public route check)
  if (pathname === "/become-instructor/onboarding") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/become-instructor/onboarding", nextUrl))
    }
    if (userRole === "INSTRUCTOR" || userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/instructor", nextUrl))
    }
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute && !isStudentRoute && !isInstructorRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  // Require authentication for protected routes
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  // Check instructor routes
  if (isInstructorRoute) {
    if (userRole !== "INSTRUCTOR" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/become-instructor", nextUrl))
    }
  }

  // Check admin routes
  if (isAdminRoute) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
