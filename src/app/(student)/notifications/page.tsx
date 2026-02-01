import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, BookOpen, Award, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your notifications",
}

// Sample notifications for demo
const sampleNotifications = [
  {
    id: "1",
    type: "course",
    title: "New course available",
    message: "Check out our latest course on Advanced React Patterns",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "achievement",
    title: "Certificate earned!",
    message: "You've completed Introduction to Web Development",
    time: "1 day ago",
    read: false,
  },
  {
    id: "3",
    type: "message",
    title: "New message from instructor",
    message: "Your instructor replied to your question",
    time: "2 days ago",
    read: true,
  },
]

const iconMap = {
  course: BookOpen,
  achievement: Award,
  message: MessageSquare,
}

export default async function NotificationsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/notifications")
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your learning</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {sampleNotifications.map((notification) => {
          const Icon = iconMap[notification.type as keyof typeof iconMap] || Bell
          return (
            <Card
              key={notification.id}
              className={notification.read ? "opacity-60" : ""}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    notification.read ? "bg-muted" : "bg-primary/10"
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      notification.read ? "text-muted-foreground" : "text-primary"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Showing sample notifications. Real-time notifications coming soon!
      </p>
    </div>
  )
}
