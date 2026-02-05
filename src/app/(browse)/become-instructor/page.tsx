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

  // Determine application state
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
            {appState.type === "logged-out" ? (
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
                <Link href="/login?callbackUrl=/become-instructor">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : appState.type === "pending" ? (
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
