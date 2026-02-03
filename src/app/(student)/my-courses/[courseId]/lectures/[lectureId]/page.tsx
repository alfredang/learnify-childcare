import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LectureViewer } from "./lecture-viewer"

interface LecturePageProps {
  params: Promise<{ courseId: string; lectureId: string }>
}

async function getLectureData(courseId: string, lectureId: string, userId: string) {
  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    include: {
      course: {
        include: {
          instructor: {
            select: { id: true, name: true, image: true },
          },
          sections: {
            orderBy: { position: "asc" },
            include: {
              lectures: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  })

  if (!enrollment) return null

  // Get current lecture
  const lecture = enrollment.course.sections
    .flatMap((s) => s.lectures)
    .find((l) => l.id === lectureId)

  if (!lecture) return null

  // Get all lecture progress for this course
  const progressRecords = await prisma.lectureProgress.findMany({
    where: {
      userId,
      lecture: {
        section: { courseId },
      },
    },
    select: {
      lectureId: true,
      isCompleted: true,
      lastPosition: true,
    },
  })

  const lectureProgress = progressRecords.reduce(
    (acc, p) => {
      acc[p.lectureId] = { isCompleted: p.isCompleted, lastPosition: p.lastPosition }
      return acc
    },
    {} as Record<string, { isCompleted: boolean; lastPosition: number }>
  )

  // Build flat lecture list for prev/next navigation
  const allLectures = enrollment.course.sections.flatMap((s) =>
    s.lectures.map((l) => ({ id: l.id, title: l.title }))
  )
  const currentIndex = allLectures.findIndex((l) => l.id === lectureId)
  const prevLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null
  const nextLecture =
    currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : null

  return {
    enrollment,
    course: enrollment.course,
    lecture,
    lectureProgress,
    prevLecture,
    nextLecture,
  }
}

export async function generateMetadata({
  params,
}: LecturePageProps): Promise<Metadata> {
  const { courseId, lectureId } = await params
  const session = await auth()

  if (!session?.user) return { title: "Lecture" }

  const data = await getLectureData(courseId, lectureId, session.user.id)

  return {
    title: data ? `${data.lecture.title} - ${data.course.title}` : "Lecture Not Found",
  }
}

export default async function LecturePage({ params }: LecturePageProps) {
  const { courseId, lectureId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/login?callbackUrl=/my-courses/${courseId}/lectures/${lectureId}`)
  }

  const data = await getLectureData(courseId, lectureId, session.user.id)

  if (!data) {
    notFound()
  }

  return (
    <LectureViewer
      courseId={courseId}
      courseTitle={data.course.title}
      courseProgress={data.enrollment.progress}
      lecture={JSON.parse(JSON.stringify(data.lecture))}
      sections={JSON.parse(JSON.stringify(data.course.sections))}
      lectureProgress={data.lectureProgress}
      prevLecture={data.prevLecture}
      nextLecture={data.nextLecture}
    />
  )
}
