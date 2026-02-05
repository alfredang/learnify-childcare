import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Link href="/" className="mx-auto">
          <span className="font-bold text-2xl">Learnify</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Log in to your Learnify account
        </h1>
      </div>
      <Suspense fallback={<div className="h-[400px]" />}>
        <LoginForm />
      </Suspense>
    </>
  )
}
