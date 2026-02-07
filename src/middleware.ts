import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicRoutes = ["/", "/login", "/register", "/forgot-password"]

const authRoutes = ["/login", "/register", "/forgot-password"]

const learnerRoutes = ["/dashboard", "/my-courses", "/certificates", "/account"]
const corporateRoutes = ["/corporate"]
const adminRoutes = ["/admin"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const pathname = nextUrl.pathname

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const isLearnerRoute = learnerRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isCorporateRoute = corporateRoutes.some(
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
    if (userRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl))
    }
    if (userRole === "CORPORATE_ADMIN") {
      return NextResponse.redirect(new URL("/corporate", nextUrl))
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Allow public routes
  if (isPublicRoute && !isLearnerRoute && !isCorporateRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  // Require authentication for protected routes
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  // Check corporate routes
  if (isCorporateRoute) {
    if (userRole !== "CORPORATE_ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  // Check admin routes
  if (isAdminRoute) {
    if (userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
