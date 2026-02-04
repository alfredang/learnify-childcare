import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { User, Mail, Calendar, Shield, CreditCard, FileText, Receipt } from "lucide-react"

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings",
}

async function getUserProfile(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            enrollments: true,
            purchases: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return null
  }
}

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/account")
  }

  const user = await getUserProfile(session.user.id)

  if (!user) {
    redirect("/login")
  }

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabel = {
    STUDENT: "Learner",
    INSTRUCTOR: "Instructor",
    ADMIN: "Administrator",
  }[user.role]

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {/* Profile Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-2xl">{initials || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="secondary">{roleLabel}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {user.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{user.emailVerified ? "Email verified" : "Email not verified"}</span>
                </div>
              </div>
              <Button asChild>
                <Link href="/account/edit">Edit Profile</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{user._count.enrollments}</div>
            <p className="text-muted-foreground">Courses Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{user._count.purchases}</div>
            <p className="text-muted-foreground">Purchases Made</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground">Certificates Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/account/billing">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">Manage your payment options</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/purchases">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <Receipt className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Purchase History</h3>
                <p className="text-sm text-muted-foreground">View your past purchases</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/invoices">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Invoices</h3>
                <p className="text-sm text-muted-foreground">Download your invoices</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/certificates">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <User className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Certificates</h3>
                <p className="text-sm text-muted-foreground">View and download certificates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
