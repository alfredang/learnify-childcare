import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DollarSign,
  Users,
  Clock,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Shield,
  Headphones,
} from "lucide-react"
import { BecomeInstructorCTA } from "./become-instructor-cta"

export const metadata: Metadata = {
  title: "Become an Instructor",
  description: "Share your knowledge and earn money by teaching on Learnify",
}

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Money",
    description:
      "Set your own prices and earn up to 70% revenue share on every sale.",
  },
  {
    icon: Users,
    title: "Reach Millions",
    description:
      "Access our global community of eager learners ready to take your courses.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description:
      "Create courses on your own time. Once published, your courses earn 24/7.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "Make a difference by sharing your expertise with students worldwide.",
  },
]

const features = [
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description:
      "Track your course performance, student engagement, and earnings in real-time.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description:
      "Get paid reliably every month through our secure payment system.",
  },
  {
    icon: Headphones,
    title: "Instructor Support",
    description:
      "Access our dedicated instructor support team whenever you need help.",
  },
]

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up for free and complete your instructor profile.",
  },
  {
    step: "02",
    title: "Plan Your Course",
    description:
      "Choose a topic you're passionate about and outline your curriculum.",
  },
  {
    step: "03",
    title: "Create Content",
    description:
      "Record videos, create resources, and build engaging course materials.",
  },
  {
    step: "04",
    title: "Publish & Earn",
    description:
      "Submit your course for review and start earning when students enroll.",
  },
]

const testimonials = [
  {
    name: "Dr. James Wilson",
    role: "Data Science Instructor",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    quote:
      "Teaching on Learnify has been incredibly rewarding. I've reached over 50,000 students and built a sustainable income doing what I love.",
    students: "52,000+",
    courses: 12,
  },
  {
    name: "Maria Garcia",
    role: "UI/UX Design Instructor",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    quote:
      "The platform makes it so easy to create and manage courses. The analytics help me understand what my students need.",
    students: "35,000+",
    courses: 8,
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
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Share Your Knowledge,{" "}
                <span className="text-primary">Transform Lives</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of instructors who are earning money and making
                an impact by teaching on Learnify.
              </p>
              <BecomeInstructorCTA
                appState={JSON.parse(JSON.stringify(appState))}
              />
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-muted border-2 border-background"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Join <strong>5,000+</strong> instructors teaching on Learnify
                </p>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800"
                  alt="Instructor teaching"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="why-teach" className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Teach on Learnify?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, publish, and sell your courses
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in four simple steps
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
                )}
                <div className="relative bg-background rounded-lg p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Tools to Help You Succeed
              </h2>
              <div className="space-y-6">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"
                alt="Instructor dashboard"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Hear from Our Instructors
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join successful instructors who are already teaching on Learnify
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{testimonial.students} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{testimonial.courses} courses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What You Need</h2>
              <p className="text-muted-foreground">
                Here&apos;s what you need to get started as an instructor
              </p>
            </div>
            <div className="space-y-4">
              {[
                "Expertise in your subject area",
                "A computer with a microphone (webcam optional)",
                "Passion for teaching and helping others",
                "Basic video recording equipment (smartphone works!)",
                "Time to create quality content",
              ].map((requirement) => (
                <div
                  key={requirement}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Teaching?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join our community of instructors and start making an impact
              today.
            </p>
            {appState.type === "logged-out" ? (
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login?callbackUrl=/become-instructor">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : appState.type === "pending" ? (
              <Button size="lg" variant="secondary" disabled>
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
