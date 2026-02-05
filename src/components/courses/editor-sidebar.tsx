"use client"

import { useState } from "react"
import { CheckCircle2, Circle, ChevronDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChecklistItem {
  id: string
  label: string
  placeholder?: boolean
}

interface ChecklistSection {
  title: string
  items: ChecklistItem[]
}

const SECTIONS: ChecklistSection[] = [
  {
    title: "Plan your course",
    items: [
      { id: "intended-learners", label: "Intended learners" },
    ],
  },
  {
    title: "Create your content",
    items: [
      { id: "curriculum", label: "Curriculum" },
    ],
  },
  {
    title: "Publish your course",
    items: [
      { id: "landing-page", label: "Course landing page" },
      { id: "pricing", label: "Pricing" },
    ],
  },
]

interface EditorSidebarProps {
  currentSection: string
  onSectionChange: (section: string) => void
  completionStatus: Record<string, boolean>
  onSubmitForReview: () => void
  onUnpublish: () => void
  canSubmit: boolean
  courseStatus: string
  hasEnrollments: boolean
}

export function EditorSidebar({
  currentSection,
  onSectionChange,
  completionStatus,
  onSubmitForReview,
  onUnpublish,
  canSubmit,
  courseStatus,
  hasEnrollments,
}: EditorSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Plan your course": true,
    "Create your content": true,
    "Publish your course": true,
  })

  function toggleSection(title: string) {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <aside className="w-[280px] shrink-0 border-r bg-background overflow-y-auto flex flex-col">
      <nav className="flex-1 py-4">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full px-5 py-2.5 text-sm font-bold text-foreground hover:bg-accent/50 cursor-pointer"
            >
              <span>{section.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  !expandedSections[section.title] && "-rotate-90"
                )}
              />
            </button>

            {/* Section items */}
            {expandedSections[section.title] && (
              <div className="pb-2">
                {section.items.map((item) => {
                  const isActive = currentSection === item.id
                  const isCompleted = completionStatus[item.id]

                  if (item.placeholder) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-5 py-2 text-sm text-muted-foreground/50 cursor-default"
                      >
                        <Circle className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "flex items-center gap-3 w-full px-5 py-2 text-sm transition-colors cursor-pointer",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0" />
                      )}
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Publish / Unpublish */}
      <div className="p-4 border-t space-y-3">
        {courseStatus === "PUBLISHED" && hasEnrollments && (
          <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-2.5 text-xs text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Students are enrolled. This course can no longer be deleted.</span>
          </div>
        )}
        {courseStatus === "PUBLISHED" ? (
          <Button
            onClick={onUnpublish}
            variant="outline"
            className="w-full"
          >
            Unpublish
          </Button>
        ) : (
          <Button
            onClick={onSubmitForReview}
            disabled={!canSubmit}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            Publish
          </Button>
        )}
      </div>
    </aside>
  )
}
