"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  MonitorPlay,
  MessageSquare,
  BarChart3,
  Wrench,
  HelpCircle,
  UserCircle,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { href: "/instructor/profile", icon: UserCircle, label: "Profile" },
  { href: "/instructor", icon: MonitorPlay, label: "Courses" },
  { href: "/instructor/communication", icon: MessageSquare, label: "Communication" },
  { href: "/instructor/performance", icon: BarChart3, label: "Performance" },
  { href: "/instructor/tools", icon: Wrench, label: "Tools" },
  { href: "/instructor/resources", icon: HelpCircle, label: "Resources" },
]

function isActive(pathname: string, href: string) {
  if (href === "/instructor") {
    return pathname === "/instructor" || pathname.startsWith("/instructor/courses")
  }
  return pathname.startsWith(href)
}

export function InstructorSidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-200 ease-in-out",
          expanded ? "w-[220px]" : "w-[68px]"
        )}
      >
        {/* Brand mark */}
        <div className="flex items-center h-14 px-4 border-b">
          <Link href="/instructor" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <circle cx="14" cy="14" r="14" className="fill-foreground" />
              <path d="M8.5 19L14 7.5L19.5 19H8.5Z" className="fill-background" />
            </svg>
            {expanded && (
              <span className="text-sm font-bold whitespace-nowrap overflow-hidden">
                Learnify
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const active = isActive(pathname, item.href)
            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 mx-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {expanded && (
                  <span className="whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </Link>
            )

            if (expanded) {
              return <div key={item.href}>{linkContent}</div>
            }

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
