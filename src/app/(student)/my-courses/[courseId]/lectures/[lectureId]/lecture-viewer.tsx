"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { VideoPlayer } from "@/components/courses/video-player"
import { LectureSidebar } from "@/components/courses/lecture-sidebar"
import { QuizPlayer } from "@/components/courses/quiz-player"
import { toast } from "sonner"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  PanelRightClose,
  PanelRightOpen,
  FileText,
  ArrowLeft,
} from "lucide-react"
import type { Section, Lecture } from "@prisma/client"

interface LectureViewerProps {
  courseId: string
  courseTitle: string
  courseProgress: number
  lecture: Lecture
  sections: (Section & { lectures: Lecture[] })[]
  lectureProgress: Record<string, { isCompleted: boolean; lastPosition: number }>
  prevLecture: { id: string; title: string } | null
  nextLecture: { id: string; title: string } | null
}

export function LectureViewer({
  courseId,
  courseTitle,
  courseProgress: initialCourseProgress,
  lecture,
  sections,
  lectureProgress: initialProgress,
  prevLecture,
  nextLecture,
}: LectureViewerProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lectureProgress, setLectureProgress] = useState(initialProgress)
  const [courseProgress, setCourseProgress] = useState(initialCourseProgress)
  const savingRef = useRef(false)

  const isCompleted = lectureProgress[lecture.id]?.isCompleted ?? false

  const saveProgress = useCallback(
    async (data: {
      isCompleted?: boolean
      watchedDuration?: number
      lastPosition?: number
    }) => {
      if (savingRef.current) return
      savingRef.current = true

      try {
        const res = await fetch(`/api/lectures/${lecture.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (res.ok) {
          const result = await res.json()

          if (data.isCompleted !== undefined) {
            setLectureProgress((prev) => ({
              ...prev,
              [lecture.id]: {
                isCompleted: data.isCompleted!,
                lastPosition: data.lastPosition ?? prev[lecture.id]?.lastPosition ?? 0,
              },
            }))
          }

          if (result.courseProgress !== undefined) {
            setCourseProgress(result.courseProgress)
          }
        }
      } catch {
        // Silent fail for background saves
      } finally {
        savingRef.current = false
      }
    },
    [lecture.id]
  )

  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      saveProgress({
        watchedDuration: Math.floor(currentTime),
        lastPosition: Math.floor(currentTime),
      })
    },
    [saveProgress]
  )

  const handleVideoEnded = useCallback(() => {
    if (!isCompleted) {
      saveProgress({ isCompleted: true, lastPosition: 0 })
      toast.success("Lecture completed!")
    }
  }, [isCompleted, saveProgress])

  const toggleComplete = useCallback(async () => {
    const newValue = !isCompleted
    await saveProgress({ isCompleted: newValue })
    toast.success(newValue ? "Marked as complete" : "Marked as incomplete")
  }, [isCompleted, saveProgress])

  const navigateToLecture = (lectureId: string) => {
    router.push(`/my-courses/${courseId}/lectures/${lectureId}`)
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/my-courses/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground truncate hidden sm:inline">
              {courseTitle}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Video / Text / Quiz content */}
          {lecture.type === "VIDEO" && lecture.videoUrl ? (
            <VideoPlayer
              videoUrl={lecture.videoUrl}
              lastPosition={lectureProgress[lecture.id]?.lastPosition ?? 0}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          ) : lecture.type === "TEXT" ? (
            <div className="p-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Text Lecture</span>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {lecture.content || "No content available for this lecture."}
              </div>
            </div>
          ) : lecture.type === "QUIZ" ? (
            <QuizPlayer
              content={lecture.content}
              onComplete={() => {
                if (!isCompleted) {
                  saveProgress({ isCompleted: true })
                  toast.success("Quiz completed!")
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No content available for this lecture.
            </div>
          )}

          {/* Lecture info + controls */}
          <div className="p-6 border-t">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold">{lecture.title}</h1>
                <Button
                  variant={isCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={toggleComplete}
                  className="flex-shrink-0"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-1.5" />
                      Mark Complete
                    </>
                  )}
                </Button>
              </div>

              {lecture.description && (
                <p className="mt-3 text-muted-foreground text-sm">
                  {lecture.description}
                </p>
              )}

              {/* Prev / Next navigation */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                {prevLecture ? (
                  <Button
                    variant="outline"
                    onClick={() => navigateToLecture(prevLecture.id)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline truncate max-w-[200px]">
                      {prevLecture.title}
                    </span>
                    <span className="sm:hidden">Previous</span>
                  </Button>
                ) : (
                  <div />
                )}
                {nextLecture ? (
                  <Button onClick={() => navigateToLecture(nextLecture.id)}>
                    <span className="hidden sm:inline truncate max-w-[200px]">
                      {nextLecture.title}
                    </span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href={`/my-courses/${courseId}`}>
                      Back to Course
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="hidden lg:block w-80 flex-shrink-0">
          <LectureSidebar
            courseId={courseId}
            courseTitle={courseTitle}
            currentLectureId={lecture.id}
            courseProgress={courseProgress}
            sections={sections}
            lectureProgress={lectureProgress}
          />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw]">
            <LectureSidebar
              courseId={courseId}
              courseTitle={courseTitle}
              currentLectureId={lecture.id}
              courseProgress={courseProgress}
              sections={sections}
              lectureProgress={lectureProgress}
            />
          </div>
        </div>
      )}
    </div>
  )
}
