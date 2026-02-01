import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, Download, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "My Certificates",
  description: "View and download your course completion certificates",
}

async function getCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
  })
}

async function getCompletedCourses(userId: string) {
  // Get courses where all lectures are completed
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          sections: {
            include: {
              lectures: true,
            },
          },
          instructor: {
            select: { name: true },
          },
        },
      },
    },
  })

  const progress = await prisma.lectureProgress.findMany({
    where: { userId, isCompleted: true },
    select: { lectureId: true },
  })

  const completedLectureIds = new Set(progress.map((p) => p.lectureId))

  return enrollments
    .filter((enrollment) => {
      const allLectures = enrollment.course.sections.flatMap((s) => s.lectures)
      if (allLectures.length === 0) return false
      return allLectures.every((lecture) => completedLectureIds.has(lecture.id))
    })
    .map((e) => ({
      courseId: e.course.id,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      instructorName: e.course.instructor.name,
      completedAt: e.updatedAt,
    }))
}

export default async function CertificatesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/certificates")
  }

  const [certificates, completedCourses] = await Promise.all([
    getCertificates(session.user.id),
    getCompletedCourses(session.user.id),
  ])

  const serializedCertificates = JSON.parse(JSON.stringify(certificates))
  const serializedCompleted = JSON.parse(JSON.stringify(completedCourses))

  // Find completed courses without certificates
  const certificateCourseIds = new Set(certificates.map((c) => c.courseId))
  const coursesNeedingCerts = serializedCompleted.filter(
    (c: { courseId: string }) => !certificateCourseIds.has(c.courseId)
  )

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Award className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            View and download your course completion certificates
          </p>
        </div>
      </div>

      {/* Earned Certificates */}
      {serializedCertificates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Earned Certificates</h2>
          <div className="space-y-4">
            {serializedCertificates.map((cert: {
              id: string
              certificateId: string
              courseName: string
              instructorName: string
              issuedAt: string
              courseId: string
            }) => (
              <Card key={cert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Award className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cert.courseName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Instructor: {cert.instructorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued: {new Date(cert.issuedAt).toLocaleDateString()} •
                          ID: {cert.certificateId}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/certificates/${cert.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/api/certificates/${cert.id}/download`} target="_blank">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Courses Ready for Certificate */}
      {coursesNeedingCerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ready to Claim</h2>
          <p className="text-muted-foreground mb-4">
            You&apos;ve completed these courses! Claim your certificates below.
          </p>
          <div className="space-y-4">
            {coursesNeedingCerts.map((course: {
              courseId: string
              courseTitle: string
              courseSlug: string
              instructorName: string | null
              completedAt: string
            }) => (
              <Card key={course.courseId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Instructor: {course.instructorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed: {new Date(course.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <form action={`/api/certificates/generate`} method="POST">
                      <input type="hidden" name="courseId" value={course.courseId} />
                      <Button type="submit">
                        <Award className="h-4 w-4 mr-2" />
                        Claim Certificate
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {serializedCertificates.length === 0 && coursesNeedingCerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete a course to earn your first certificate!
            </p>
            <Button asChild>
              <Link href="/my-courses">Go to My Learning</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
