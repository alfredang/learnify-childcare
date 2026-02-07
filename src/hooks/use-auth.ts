"use client"

import { useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isLearner: session?.user?.role === "LEARNER",
    isCorporateAdmin: session?.user?.role === "CORPORATE_ADMIN",
    isSuperAdmin: session?.user?.role === "SUPER_ADMIN",
    organizationId: session?.user?.organizationId,
  }
}
