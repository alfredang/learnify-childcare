import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Download, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Invoices",
  description: "View and download your invoices",
}

async function getInvoices(userId: string) {
  return prisma.purchase.findMany({
    where: { userId, status: "COMPLETED" },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function InvoicesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/invoices")
  }

  const invoices = await getInvoices(session.user.id)
  const serializedInvoices = JSON.parse(JSON.stringify(invoices))

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Download your purchase invoices</p>
        </div>
      </div>

      {serializedInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">
              Your invoices will appear here after you make a purchase.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {serializedInvoices.map((invoice: {
            id: string
            createdAt: string
            amount: number
            status: string
            course: { title: string }
          }) => {
            const invoiceNumber = `INV-${invoice.id.slice(0, 8).toUpperCase()}`
            return (
              <Card key={invoice.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${(Number(invoice.amount) / 100).toFixed(2)}</p>
                        <Badge variant="secondary" className="text-xs">Paid</Badge>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/api/invoices/${invoice.id}`} target="_blank">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
