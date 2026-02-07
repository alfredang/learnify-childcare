import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Award,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle,
  Shield,
} from "lucide-react"
import { auth } from "@/lib/auth"

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    switch (session.user.role) {
      case "CORPORATE_ADMIN":
        redirect("/corporate")
      case "SUPER_ADMIN":
        redirect("/admin")
      default:
        redirect("/dashboard")
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-background overflow-hidden">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              ECDA-Aligned Professional Development
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Professional Development for{" "}
              <span className="text-primary">
                Early Childhood Educators
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              SCORM-compliant CPD courses designed for childcare professionals
              in Singapore. Track progress, earn CPD points, and stay compliant
              with industry standards -- all on one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/login">
                  Log In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">
                  Register
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 justify-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  SCORM 2.0 Compliant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  CPD Points Tracking
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Corporate Management
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Built for Childcare Professionals
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything your organisation needs to manage professional
              development for early childhood educators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* CPD Points */}
            <Card className="text-center">
              <CardContent className="pt-6 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mx-auto">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">CPD Points</h3>
                <p className="text-sm text-muted-foreground">
                  Earn Continuing Professional Development points with every
                  completed course. Stay compliant with ECDA requirements and
                  advance your career in early childhood education.
                </p>
              </CardContent>
            </Card>

            {/* SCORM Tracking */}
            <Card className="text-center">
              <CardContent className="pt-6 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mx-auto">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">SCORM Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-standard SCORM 2.0 compliance ensures accurate
                  progress tracking. Pick up right where you left off with
                  reliable session data and completion records.
                </p>
              </CardContent>
            </Card>

            {/* Self-Paced Learning */}
            <Card className="text-center">
              <CardContent className="pt-6 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mx-auto">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold">Self-Paced Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Learn at your own pace with flexible deadlines. Access courses
                  anytime, anywhere -- perfect for busy childcare professionals
                  balancing work and development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
