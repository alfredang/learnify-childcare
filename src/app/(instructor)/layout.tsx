import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Bell } from "lucide-react"
import { InstructorSidebar } from "@/components/layout/instructor-sidebar"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/instructor")
  }

  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    redirect("/become-instructor")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <InstructorSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-end gap-4 px-6 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-courses">Go to Student Dashboard</Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <UserMenu user={JSON.parse(JSON.stringify(session.user))} />
        </div>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
