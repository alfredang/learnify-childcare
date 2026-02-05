import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign up and start learning",
}

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Link href="/" className="mx-auto">
          <span className="font-bold text-2xl">Learnify</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign up and start learning
        </h1>
      </div>
      <Suspense fallback={<div className="h-[400px]" />}>
        <RegisterForm />
      </Suspense>
    </>
  )
}
