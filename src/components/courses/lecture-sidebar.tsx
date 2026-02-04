"use client"

import { useState } from "react"
import Link from "next/link"
import { cn, formatDuration } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  FileText,
  HelpCircle,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import type { Section, Lecture } from "@prisma/client"

interface LectureSidebarProps {
  courseId: string
  courseTitle: string
  currentLectureId: string
  courseProgress: number
  sections: (Section & {
    lectures: Lecture[]
  })[]
  lectureProgress: Record<string, { isCompleted: boolean; lastPosition: number }>
}

const lectureIcon = {
  VIDEO: Play,
  TEXT: FileText,
  QUIZ: HelpCircle,
} as const

export function LectureSidebar({
  courseId,
  courseTitle,
  currentLectureId,
  courseProgress,
  sections,
  lectureProgress,
}: LectureSidebarProps) {
  // Find which section contains the current lecture, and expand it by default
  const currentSectionIndex = sections.findIndex((s) =>
    s.lectures.some((l) => l.id === currentLectureId)
  )

  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => {
    const initial = new Set<number>()
    if (currentSectionIndex >= 0) initial.add(currentSectionIndex)
    return initial
  })

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const totalLectures = sections.reduce((acc, s) => acc + s.lectures.length, 0)
  const completedLectures = Object.values(lectureProgress).filter(
    (p) => p.isCompleted
  ).length

  return (
    <div className="flex flex-col h-full border-l bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-bold text-sm line-clamp-1">{courseTitle}</h2>
        <div className="flex items-center gap-2 mt-2">
          <Progress value={courseProgress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {completedLectures}/{totalLectures}
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section, sectionIndex) => {
          const isExpanded = expandedSections.has(sectionIndex)
          const sectionCompleted = section.lectures.filter(
            (l) => lectureProgress[l.id]?.isCompleted
          ).length

          return (
            <div key={section.id}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full flex items-center gap-2 p-3 bg-muted/50 border-b text-left hover:bg-muted transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-1">
                    Section {sectionIndex + 1}: {section.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {sectionCompleted}/{section.lectures.length} completed
                  </div>
                </div>
              </button>

              {/* Lectures */}
              {isExpanded && (
                <div>
                  {section.lectures.map((lecture) => {
                    const progress = lectureProgress[lecture.id]
                    const isCompleted = progress?.isCompleted
                    const isCurrent = lecture.id === currentLectureId
                    const Icon = lectureIcon[lecture.type] || FileText

                    return (
                      <Link
                        key={lecture.id}
                        href={`/my-courses/${courseId}/lectures/${lecture.id}`}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm border-b transition-colors",
                          isCurrent
                            ? "bg-primary/10 border-l-2 border-l-primary"
                            : "hover:bg-muted/50"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className={cn("line-clamp-1", isCurrent && "font-medium")}>
                              {lecture.title}
                            </span>
                          </div>
                          {lecture.videoDuration && (
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(lecture.videoDuration)}
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
