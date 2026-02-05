import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, BarChart3, Ticket } from "lucide-react"

export const metadata: Metadata = {
  title: "Instructor Tools",
  description: "Tools to help you create and manage your courses",
}

const tools = [
  {
    icon: Video,
    title: "Test Video",
    description:
      "Get free feedback from Learnify video experts on your audio, video, and delivery.",
  },
  {
    icon: BarChart3,
    title: "Marketplace Insights",
    description:
      "Get Learnify-wide market data to understand topic demand and competition.",
  },
  {
    icon: Ticket,
    title: "Bulk Coupon Creation",
    description:
      "Create multiple coupons at once to promote your courses efficiently.",
  },
]

export default function ToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tools</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <tool.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-base">{tool.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
