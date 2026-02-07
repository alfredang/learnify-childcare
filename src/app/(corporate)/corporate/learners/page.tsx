import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, Search, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Learner Management",
  description: "Manage learners in your organization",
}

interface LearnersPageProps {
  searchParams: Promise<{
    search?: string
  }>
}

async function getLearners(organizationId: string, search?: string) {
  try {
    const learners = await prisma.user.findMany({
      where: {
        organizationId,
        role: "LEARNER",
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        jobTitle: true,
        staffId: true,
        createdAt: true,
        _count: {
          select: {
            assignments: true,
          },
        },
        assignments: {
          select: {
            status: true,
          },
        },
      },
    })

    return learners.map((learner) => {
      const totalAssignments = learner._count.assignments
      const completedAssignments = learner.assignments.filter(
        (a) => a.status === "COMPLETED"
      ).length
      const completionRate =
        totalAssignments > 0
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0

      return {
        id: learner.id,
        name: learner.name,
        email: learner.email,
        image: learner.image,
        jobTitle: learner.jobTitle,
        staffId: learner.staffId,
        createdAt: learner.createdAt,
        coursesAssigned: totalAssignments,
        completionRate,
      }
    })
  } catch (error) {
    console.error("Failed to fetch learners:", error)
    return []
  }
}

export default async function LearnersPage({ searchParams }: LearnersPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/corporate/learners")
  }

  if (
    session.user.role !== "CORPORATE_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/dashboard")
  }

  if (!session.user.organizationId) {
    redirect("/dashboard")
  }

  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams.search || ""
  const learners = await getLearners(session.user.organizationId, search)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learners</h1>
          <p className="text-muted-foreground">
            Manage learners in your organization
          </p>
        </div>
        <Button asChild>
          <Link href="/corporate/learners/invite">
            <UserPlus className="h-4 w-4" />
            Invite Learner
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by name or email..."
                defaultValue={search}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            {search && (
              <Button variant="ghost" asChild>
                <Link href="/corporate/learners">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Learners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {learners.length} Learner{learners.length !== 1 ? "s" : ""}
            {search && (
              <span className="text-sm font-normal text-muted-foreground">
                matching &quot;{search}&quot;
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {learners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">
                {search ? "No learners found" : "No learners yet"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {search
                  ? "Try a different search term."
                  : "Invite learners to get started."}
              </p>
              {!search && (
                <Button className="mt-4" asChild>
                  <Link href="/corporate/learners/invite">
                    Invite Learner
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead className="text-center">Courses Assigned</TableHead>
                  <TableHead className="text-center">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learners.map((learner) => {
                  const initials = learner.name
                    ? learner.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?"

                  return (
                    <TableRow key={learner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarImage
                              src={learner.image || undefined}
                              alt={learner.name || "Learner"}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {learner.name || "Unnamed"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {learner.email}
                      </TableCell>
                      <TableCell>
                        {learner.jobTitle || (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {learner.staffId || (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {learner.coursesAssigned}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${learner.completionRate}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {learner.completionRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
