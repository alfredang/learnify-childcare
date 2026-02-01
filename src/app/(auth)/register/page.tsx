import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new account",
}

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Link href="/" className="mx-auto">
          <span className="font-bold text-2xl">Learnify</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>
      <RegisterForm />
    </>
  )
}
