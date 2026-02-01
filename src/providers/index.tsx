"use client"

import { AuthProvider } from "./auth-provider"
import { QueryProvider } from "./query-provider"
import { Toaster } from "@/components/ui/sonner"
import type { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </AuthProvider>
  )
}
