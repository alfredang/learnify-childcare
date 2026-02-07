import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil } from "lucide-react"

export const metadata: Metadata = {
  title: "Organization Management - Learnify",
  description: "Manage all organizations on the platform",
}

async function getOrganizations() {
  try {
    return await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to fetch organizations:", error)
    return []
  }
}

export default async function AdminOrganizationsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/organizations")
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/")
  }

  const organizations = await getOrganizations()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Management</h1>
          <p className="text-muted-foreground">
            Manage childcare centers and their configurations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/organizations/new">
            <Plus className="h-4 w-4" />
            Create Organization
          </Link>
        </Button>
      </div>

      {/* Organizations Table */}
      {organizations.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            No organizations found
          </p>
          <Button asChild>
            <Link href="/admin/organizations/new">
              <Plus className="h-4 w-4" />
              Add Your First Organization
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Learners</TableHead>
                <TableHead>Billing Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {org.licenseNumber || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      {org.contactName && (
                        <p className="text-sm font-medium">
                          {org.contactName}
                        </p>
                      )}
                      {org.contactEmail && (
                        <p className="text-xs text-muted-foreground">
                          {org.contactEmail}
                        </p>
                      )}
                      {org.phone && (
                        <p className="text-xs text-muted-foreground">
                          {org.phone}
                        </p>
                      )}
                      {!org.contactName && !org.contactEmail && !org.phone && (
                        <span className="text-xs text-muted-foreground">
                          No contact info
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div>
                      <span className="font-medium">
                        {org._count.users}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        / {org.maxLearners}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        org.billingEnabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {org.billingEnabled ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      asChild
                      title="Edit organization"
                    >
                      <Link href={`/admin/organizations/${org.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
