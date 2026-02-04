import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Download, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Purchase History",
  description: "View your purchase history",
}

async function getPurchases(userId: string) {
  try {
    return await prisma.purchase.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            instructor: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch purchases:", error)
    return []
  }
}

export default async function PurchasesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/purchases")
  }

  const purchases = await getPurchases(session.user.id)
  const serializedPurchases = JSON.parse(JSON.stringify(purchases))

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground">View all your course purchases</p>
        </div>
      </div>

      {serializedPurchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t made any purchases yet.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {serializedPurchases.map((purchase: {
            id: string
            createdAt: string
            amount: number
            status: string
            stripePaymentId: string | null
            course: {
              id: string
              title: string
              slug: string
              thumbnail: string | null
              instructor: { name: string | null }
            }
          }) => (
            <Card key={purchase.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative w-32 aspect-video flex-shrink-0">
                    <Image
                      src={purchase.course.thumbnail || "/images/placeholder-course.jpg"}
                      alt={purchase.course.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/courses/${purchase.course.slug}`}
                          className="font-semibold hover:underline"
                        >
                          {purchase.course.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          By {purchase.course.instructor.name}
                        </p>
                      </div>
                      <Badge
                        variant={purchase.status === "COMPLETED" ? "default" : "secondary"}
                      >
                        {purchase.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>Purchased on {new Date(purchase.createdAt).toLocaleDateString()}</p>
                        <p className="font-semibold text-foreground">${(Number(purchase.amount) / 100).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/my-courses/${purchase.course.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Go to Course
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/api/invoices/${purchase.id}`} target="_blank">
                            <Download className="h-4 w-4 mr-2" />
                            Invoice
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
