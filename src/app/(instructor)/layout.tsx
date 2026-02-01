import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  DollarSign,
  Star,
  Settings,
} from "lucide-react"

const sidebarItems = [
  { href: "/instructor", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/instructor/courses", icon: BookOpen, label: "My Courses" },
  { href: "/instructor/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/instructor/earnings", icon: DollarSign, label: "Earnings" },
  { href: "/instructor/reviews", icon: Star, label: "Reviews" },
  { href: "/profile/settings", icon: Settings, label: "Settings" },
]

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
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30">
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
