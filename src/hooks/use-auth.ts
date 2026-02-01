"use client"

import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isStudent: session?.user?.role === "STUDENT",
    isInstructor: session?.user?.role === "INSTRUCTOR",
    isAdmin: session?.user?.role === "ADMIN",
  }
}
