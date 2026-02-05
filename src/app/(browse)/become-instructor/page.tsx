import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Lightbulb,
  Video,
  Users,
  ArrowRight,
} from "lucide-react"
import { BecomeInstructorCTA } from "./become-instructor-cta"
import { InstructorSignupForm } from "./instructor-signup-form"

export const metadata: Metadata = {
  title: "Become an Instructor",
  description: "Share your knowledge and earn money by teaching on Learnify",
}

const resources = [
  {
    icon: Lightbulb,
    title: "Create an Engaging Course",
    description:
      "Whether you've been teaching for years or are teaching for the first time, you can make an engaging course. We've compiled resources and best practices to help you get to the next level, no matter where you're starting.",
    linkText: "Get Started",
    size: "large" as const,
  },
  {
    icon: Video,
    title: "Get Started with Video",
    description:
      "Quality video lectures can set your course apart. Use our resources to learn the basics.",
    linkText: "Get Started",
    size: "small" as const,
  },
  {
    icon: Users,
    title: "Build Your Audience",
    description:
      "Set your course up for success by building your audience.",
    linkText: "Get Started",
    size: "small" as const,
  },
]

export type ApplicationState =
  | { type: "logged-out" }
  | { type: "can-apply" }
  | { type: "pending" }
  | { type: "rejected"; adminNote: string | null }

export default async function BecomeInstructorPage() {
  const session = await auth()

  // Instructors/admins shouldn't see this page
  if (
    session?.user?.role === "INSTRUCTOR" ||
    session?.user?.role === "ADMIN"
  ) {
    redirect("/instructor")
  }

  const isLoggedIn = !!session?.user

  // Determine application state for logged-in students
  let appState: ApplicationState = { type: "logged-out" }

  if (session?.user) {
    try {
      const application = await prisma.instructorApplication.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })

      if (!application || application.status === "REJECTED") {
        appState =
          application?.status === "REJECTED"
            ? { type: "rejected", adminNote: application.adminNote }
            : { type: "can-apply" }
      } else if (application.status === "PENDING") {
        appState = { type: "pending" }
      } else if (application.status === "APPROVED") {
        redirect("/instructor")
      }
    } catch (error) {
      console.error("Failed to fetch application status:", error)
      appState = { type: "can-apply" }
    }
  }

  // Logged-out users: show Udemy-style signup form
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <div className="flex-1 flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Illustration area */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="bg-purple-100 dark:bg-purple-950/30 rounded-2xl p-8 flex items-center justify-center aspect-square">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full text-purple-600 dark:text-purple-400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Simplified instructor illustration */}
                    <circle cx="100" cy="60" r="30" fill="currentColor" opacity="0.2" />
                    <circle cx="100" cy="55" r="20" fill="currentColor" opacity="0.3" />
                    <rect x="70" y="90" width="60" height="70" rx="10" fill="currentColor" opacity="0.2" />
                    {/* Laptop */}
                    <rect x="40" y="130" width="120" height="8" rx="2" fill="currentColor" opacity="0.4" />
                    <rect x="55" y="95" width="90" height="35" rx="4" fill="currentColor" opacity="0.15" />
                    {/* Play button */}
                    <polygon points="90,105 90,120 110,112" fill="currentColor" opacity="0.5" />
                    {/* Decorative elements */}
                    <circle cx="160" cy="40" r="8" fill="currentColor" opacity="0.15" />
                    <circle cx="40" cy="50" r="6" fill="currentColor" opacity="0.15" />
                    <rect x="150" cy="80" width="12" height="12" rx="2" fill="currentColor" opacity="0.15" transform="rotate(15 156 86)" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right: Signup form */}
            <div className="w-full max-w-md mx-auto md:mx-0">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Become a Learnify Instructor
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Discover a supportive community of online instructors. Get
                    instant access to all course creation resources.
                  </p>
                </div>

                <InstructorSignupForm />

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login?callbackUrl=/become-instructor"
                    className="text-primary font-medium hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Logged-in students: show marketing page with "Create Your Course" CTA
  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="container py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              Jump Into Course Creation
            </h1>
            <p className="text-lg text-purple-100">
              Share your knowledge with millions of students around the world.
              Join our community of instructors today.
            </p>
            <BecomeInstructorCTA
              appState={JSON.parse(JSON.stringify(appState))}
            />
          </div>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="py-12 md:py-16">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-8">
            Based on your experience, we think these resources will be helpful.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Large card */}
            {resources
              .filter((r) => r.size === "large")
              .map((resource) => (
                <Card key={resource.title} className="md:row-span-2">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="rounded-lg bg-purple-100 w-16 h-16 flex items-center justify-center mb-6 dark:bg-purple-900/30">
                      <resource.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm flex-1">
                      {resource.description}
                    </p>
                    <Button variant="link" className="p-0 mt-4 self-start text-purple-600">
                      {resource.linkText}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}

            {/* Small cards */}
            {resources
              .filter((r) => r.size === "small")
              .map((resource) => (
                <Card key={resource.title}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="rounded-lg bg-purple-100 w-12 h-12 flex items-center justify-center mb-4 dark:bg-purple-900/30">
                      <resource.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm flex-1">
                      {resource.description}
                    </p>
                    <Button variant="link" className="p-0 mt-3 self-start text-purple-600">
                      {resource.linkText}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 md:py-16 border-t">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">Ready to begin?</h2>
            {appState.type === "pending" ? (
              <Button size="lg" disabled>
                Application Under Review
              </Button>
            ) : (
              <BecomeInstructorCTA
                appState={JSON.parse(JSON.stringify(appState))}
                variant="bottom"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
