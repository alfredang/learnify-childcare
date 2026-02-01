import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Messages",
  description: "View your messages",
}

// Sample conversations for demo
const sampleConversations = [
  {
    id: "1",
    participant: {
      name: "John Smith",
      image: null,
      role: "Instructor",
    },
    lastMessage: "Great question! Let me explain...",
    time: "10 min ago",
    unread: 2,
  },
  {
    id: "2",
    participant: {
      name: "Support Team",
      image: null,
      role: "Support",
    },
    lastMessage: "Your issue has been resolved.",
    time: "2 hours ago",
    unread: 0,
  },
  {
    id: "3",
    participant: {
      name: "Sarah Wilson",
      image: null,
      role: "Instructor",
    },
    lastMessage: "Thanks for enrolling in my course!",
    time: "1 day ago",
    unread: 0,
  },
]

export default async function MessagesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/messages")
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with instructors and support</p>
        </div>
      </div>

      <div className="space-y-2">
        {sampleConversations.map((conversation) => (
          <Card
            key={conversation.id}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.participant.image || ""} />
                  <AvatarFallback>
                    {conversation.participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{conversation.participant.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {conversation.participant.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {conversation.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Showing sample messages. Full messaging system coming soon!
      </p>
    </div>
  )
}
