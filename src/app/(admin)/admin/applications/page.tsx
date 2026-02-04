import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApplicationActions } from "@/components/admin/application-actions"

export const metadata: Metadata = {
  title: "Instructor Applications",
  description: "Review instructor applications",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
}

async function getApplications() {
  try {
    return await prisma.instructorApplication.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    })
  } catch (error) {
    console.error("Failed to fetch applications:", error)
    return []
  }
}

export default async function AdminApplicationsPage() {
  const applications = await getApplications()

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Instructor Applications</h1>
        <p className="text-muted-foreground">
          Review and manage instructor applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No applications yet.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={application.user.image || ""} />
                        <AvatarFallback>
                          {(
                            application.user.name ||
                            application.user.email
                          )[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {application.user.name || "No name"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {application.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-[200px] truncate">
                      {application.headline}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground max-w-[250px] truncate">
                      {application.bio}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={statusColors[application.status] || ""}
                      variant="secondary"
                    >
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {application.createdAt.toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {application.reviewedBy?.name || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {application.status === "PENDING" ? (
                      <ApplicationActions applicationId={application.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {application.status === "APPROVED"
                          ? "Approved"
                          : "Rejected"}
                      </span>
                    )}
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
