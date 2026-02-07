"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Film,
  FileText,
  HelpCircle,
  Video,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
// Select imports preserved — re-enable if TEXT/QUIZ lecture types are restored
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { VideoUpload } from "@/components/courses/video-upload"
import { QuizBuilder } from "@/components/courses/quiz-builder"
import { quizDataSchema } from "@/lib/validations/course"
import { cn, formatDuration } from "@/lib/utils"

interface Section {
  id: string
  title: string
  description: string | null
  position: number
  lectures: Lecture[]
}

interface Lecture {
  id: string
  title: string
  description: string | null
  type: "VIDEO" | "TEXT" | "QUIZ"
  position: number
  videoUrl: string | null
  videoDuration: number | null
  videoPublicId: string | null
  content: string | null
}

interface CourseContentEditorProps {
  courseId: string
  sections: Section[]
}

const lectureTypeIcons = {
  VIDEO: Film,
  TEXT: FileText,
  QUIZ: HelpCircle,
}

function SortableSectionItem({
  id,
  children,
}: {
  id: string
  children: (handleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"]
    listeners: ReturnType<typeof useSortable>["listeners"]
  }) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg overflow-hidden",
        isDragging && "opacity-50 ring-2 ring-primary/20 z-10"
      )}
    >
      {children({ attributes, listeners })}
    </div>
  )
}

function SortableLectureItem({
  id,
  children,
}: {
  id: string
  children: (handleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"]
    listeners: ReturnType<typeof useSortable>["listeners"]
  }) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-muted/20 transition-colors group",
        isDragging && "opacity-50 bg-muted/30 ring-1 ring-primary/20"
      )}
    >
      {children({ attributes, listeners })}
    </div>
  )
}

export function CourseContentEditor({
  courseId,
  sections: initialSections,
}: CourseContentEditorProps) {
  const queryClient = useQueryClient()

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(initialSections.map((s) => s.id))
  )

  // Section dialogs
  const [showAddSection, setShowAddSection] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [deletingSection, setDeletingSection] = useState<Section | null>(null)
  const [sectionTitle, setSectionTitle] = useState("")
  const [sectionDesc, setSectionDesc] = useState("")
  const [sectionLoading, setSectionLoading] = useState(false)

  // Lecture dialogs
  const [addLectureToSection, setAddLectureToSection] = useState<string | null>(null)
  const [editingLecture, setEditingLecture] = useState<{
    lecture: Lecture
    sectionId: string
  } | null>(null)
  const [deletingLecture, setDeletingLecture] = useState<{
    lecture: Lecture
    sectionId: string
  } | null>(null)
  const [lectureTitle, setLectureTitle] = useState("")
  const [lectureDesc, setLectureDesc] = useState("")
  const [lectureType, setLectureType] = useState<"VIDEO" | "TEXT" | "QUIZ">("VIDEO")
  const [lectureContent, setLectureContent] = useState("")
  const [lectureLoading, setLectureLoading] = useState(false)
  const [isVideoUploading, setIsVideoUploading] = useState(false)

  // Video data for lecture create/edit
  const [videoData, setVideoData] = useState<{
    videoUrl: string
    videoPublicId: string
    videoDuration: number
  } | null>(null)

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function refreshCourse() {
    await queryClient.invalidateQueries({ queryKey: ["course", courseId] })
  }

  // ─── Drag-and-Drop ────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = initialSections.findIndex((s) => s.id === active.id)
    const newIndex = initialSections.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(initialSections, oldIndex, newIndex)
    const orderedIds = reordered.map((s) => s.id)

    // Optimistic update
    queryClient.setQueryData(
      ["course", courseId],
      (old: { course: { sections: Section[] } } | undefined) => {
        if (!old) return old
        return {
          ...old,
          course: {
            ...old.course,
            sections: reordered.map((s, i) => ({ ...s, position: i })),
          },
        }
      }
    )

    try {
      const res = await fetch(`/api/courses/${courseId}/sections/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      })
      if (!res.ok) throw new Error("Failed to reorder sections")
    } catch {
      toast.error("Failed to reorder sections")
      await refreshCourse()
    }
  }

  async function handleLectureDragEnd(sectionId: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const section = initialSections.find((s) => s.id === sectionId)
    if (!section) return

    const oldIndex = section.lectures.findIndex((l) => l.id === active.id)
    const newIndex = section.lectures.findIndex((l) => l.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(section.lectures, oldIndex, newIndex)
    const orderedIds = reordered.map((l) => l.id)

    // Optimistic update
    queryClient.setQueryData(
      ["course", courseId],
      (old: { course: { sections: Section[] } } | undefined) => {
        if (!old) return old
        return {
          ...old,
          course: {
            ...old.course,
            sections: old.course.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    lectures: reordered.map((l, i) => ({
                      ...l,
                      position: i,
                    })),
                  }
                : s
            ),
          },
        }
      }
    )

    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${sectionId}/lectures/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        }
      )
      if (!res.ok) throw new Error("Failed to reorder lectures")
    } catch {
      toast.error("Failed to reorder lectures")
      await refreshCourse()
    }
  }

  // ─── Section CRUD ────────────────────────────────────────

  function openAddSection() {
    setSectionTitle("")
    setSectionDesc("")
    setShowAddSection(true)
  }

  function openEditSection(section: Section) {
    setSectionTitle(section.title)
    setSectionDesc(section.description || "")
    setEditingSection(section)
  }

  async function handleAddSection() {
    if (!sectionTitle.trim()) return
    setSectionLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sectionTitle.trim(),
          description: sectionDesc.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create section")
      }
      toast.success("Section added")
      setShowAddSection(false)
      await refreshCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create section")
    } finally {
      setSectionLoading(false)
    }
  }

  async function handleEditSection() {
    if (!editingSection || !sectionTitle.trim()) return
    setSectionLoading(true)
    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${editingSection.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sectionTitle.trim(),
            description: sectionDesc.trim() || null,
          }),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update section")
      }
      toast.success("Section updated")
      setEditingSection(null)
      await refreshCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update section")
    } finally {
      setSectionLoading(false)
    }
  }

  async function handleDeleteSection() {
    if (!deletingSection) return
    setSectionLoading(true)
    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${deletingSection.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete section")
      }
      toast.success("Section deleted")
      setDeletingSection(null)
      await refreshCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete section")
    } finally {
      setSectionLoading(false)
    }
  }

  // ─── Lecture CRUD ────────────────────────────────────────

  function openAddLecture(sectionId: string) {
    setLectureTitle("")
    setLectureDesc("")
    setLectureType("VIDEO")
    setLectureContent("")
    setVideoData(null)
    setIsVideoUploading(false)
    setAddLectureToSection(sectionId)
  }

  function openEditLecture(lecture: Lecture, sectionId: string) {
    setLectureTitle(lecture.title)
    setLectureDesc(lecture.description || "")
    setLectureType(lecture.type)
    setLectureContent(lecture.content || "")
    setIsVideoUploading(false)
    setVideoData(
      lecture.videoUrl
        ? {
            videoUrl: lecture.videoUrl,
            videoPublicId: lecture.videoPublicId || "",
            videoDuration: lecture.videoDuration || 0,
          }
        : null
    )
    setEditingLecture({ lecture, sectionId })
  }

  async function handleAddLecture() {
    if (!addLectureToSection || !lectureTitle.trim()) return
    if (lectureType === "QUIZ" && lectureContent) {
      try {
        const parsed = JSON.parse(lectureContent)
        const result = quizDataSchema.safeParse(parsed)
        if (!result.success) {
          toast.error(result.error.issues[0]?.message || "Invalid quiz data")
          return
        }
      } catch {
        toast.error("Invalid quiz data format")
        return
      }
    }
    setLectureLoading(true)
    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${addLectureToSection}/lectures`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: lectureTitle.trim(),
            description: lectureDesc.trim() || undefined,
            type: lectureType,
            ...(lectureType === "VIDEO"
              ? {
                  videoUrl: videoData?.videoUrl || "",
                  videoDuration: videoData?.videoDuration || 0,
                  videoPublicId: videoData?.videoPublicId || undefined,
                }
              : {
                  content: lectureContent.trim() || undefined,
                }),
          }),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        const msg = err.issues
          ? err.issues.map((i: { message: string }) => i.message).join(", ")
          : err.error || "Failed to create lecture"
        throw new Error(msg)
      }
      toast.success("Lecture added")
      setAddLectureToSection(null)
      await refreshCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create lecture")
    } finally {
      setLectureLoading(false)
    }
  }

  async function handleEditLecture() {
    if (!editingLecture || !lectureTitle.trim()) return
    if (lectureType === "QUIZ" && lectureContent) {
      try {
        const parsed = JSON.parse(lectureContent)
        const result = quizDataSchema.safeParse(parsed)
        if (!result.success) {
          toast.error(result.error.issues[0]?.message || "Invalid quiz data")
          return
        }
      } catch {
        toast.error("Invalid quiz data format")
        return
      }
    }
    setLectureLoading(true)
    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${editingLecture.sectionId}/lectures/${editingLecture.lecture.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: lectureTitle.trim(),
            description: lectureDesc.trim() || null,
            type: lectureType,
            ...(lectureType === "VIDEO"
              ? {
                  videoUrl: videoData?.videoUrl || "",
                  videoDuration: videoData?.videoDuration || 0,
                  videoPublicId: videoData?.videoPublicId || undefined,
                }
              : {
                  content: lectureContent.trim() || null,
                }),
          }),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        const msg = err.issues
          ? err.issues.map((i: { message: string }) => i.message).join(", ")
          : err.error || "Failed to update lecture"
        throw new Error(msg)
      }
      toast.success("Lecture updated")
      setEditingLecture(null)
      await refreshCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update lecture")
    } finally {
      setLectureLoading(false)
    }
  }

  async function handleDeleteLecture() {
    if (!deletingLecture) return
    setLectureLoading(true)
    try {
      const res = await fetch(
        `/api/courses/${courseId}/sections/${deletingLecture.sectionId}/lectures/${deletingLecture.lecture.id}`,
        { method: "DELETE" }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete lecture")
      }
      toast.success("Lecture deleted")
      setDeletingLecture(null)
      await refreshCourse()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete lecture")
    } finally {
      setLectureLoading(false)
    }
  }

  // ─── Cloudinary thumbnail helper (client-side) ──────────
  function getThumbnailUrl(publicId: string | null): string | null {
    if (!publicId) return null
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    return `https://res.cloudinary.com/${cloudName}/video/upload/w_640,h_360,c_fill,so_0/${publicId}.jpg`
  }

  // ─── Render ──────────────────────────────────────────────

  const totalLectures = initialSections.reduce(
    (acc, s) => acc + s.lectures.length,
    0
  )

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Course Content</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {initialSections.length} section{initialSections.length !== 1 ? "s" : ""} &middot;{" "}
              {totalLectures} lecture{totalLectures !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={openAddSection} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {initialSections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No sections yet. Add your first section to get started.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={initialSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {initialSections.map((section) => {
                  const isExpanded = expandedSections.has(section.id)
                  return (
                    <SortableSectionItem key={section.id} id={section.id}>
                      {({ attributes, listeners }) => (
                        <>
                          {/* Section header */}
                          <div
                            className="flex items-center gap-2 px-4 py-3 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
                            onClick={() => toggleSection(section.id)}
                          >
                            <button
                              type="button"
                              className="cursor-grab active:cursor-grabbing touch-none shrink-0"
                              onClick={(e) => e.stopPropagation()}
                              {...attributes}
                              {...listeners}
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm">
                                Section {section.position + 1}: {section.title}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {section.lectures.length} lecture
                                {section.lectures.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditSection(section)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => setDeletingSection(section)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Lectures list */}
                          {isExpanded && (
                            <div className="divide-y">
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(e) =>
                                  handleLectureDragEnd(section.id, e)
                                }
                              >
                                <SortableContext
                                  items={section.lectures.map((l) => l.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {section.lectures.map((lecture) => {
                                    const Icon = lectureTypeIcons[lecture.type]
                                    return (
                                      <SortableLectureItem
                                        key={lecture.id}
                                        id={lecture.id}
                                      >
                                        {({ attributes: lectureAttrs, listeners: lectureListeners }) => (
                                          <>
                                            <button
                                              type="button"
                                              className="cursor-grab active:cursor-grabbing touch-none shrink-0"
                                              {...lectureAttrs}
                                              {...lectureListeners}
                                            >
                                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <span className="text-sm">
                                                {lecture.title}
                                              </span>
                                            </div>
                                            {lecture.type === "VIDEO" &&
                                              lecture.videoDuration && (
                                                <span className="text-xs text-muted-foreground">
                                                  {formatDuration(
                                                    lecture.videoDuration
                                                  )}
                                                </span>
                                              )}
                                            {lecture.type === "VIDEO" && (
                                              <div className="shrink-0">
                                                {lecture.videoUrl ? (
                                                  <Video className="h-3.5 w-3.5 text-green-600" />
                                                ) : (
                                                  <Video className="h-3.5 w-3.5 text-muted-foreground/40" />
                                                )}
                                              </div>
                                            )}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() =>
                                                  openEditLecture(
                                                    lecture,
                                                    section.id
                                                  )
                                                }
                                              >
                                                <Pencil className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                  setDeletingLecture({
                                                    lecture,
                                                    sectionId: section.id,
                                                  })
                                                }
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                          </>
                                        )}
                                      </SortableLectureItem>
                                    )
                                  })}
                                </SortableContext>
                              </DndContext>

                              {/* Add lecture button */}
                              <div className="px-4 py-2 pl-12">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground"
                                  onClick={() => openAddLecture(section.id)}
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                                  Add Lecture
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </SortableSectionItem>
                  )
                })}
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* ─── Add Section Dialog ────────────────────────────── */}
      <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Getting Started"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection()
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of this section"
                value={sectionDesc}
                onChange={(e) => setSectionDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={sectionLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddSection}
              disabled={sectionLoading || !sectionTitle.trim()}
            >
              {sectionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Section Dialog ───────────────────────────── */}
      <Dialog
        open={!!editingSection}
        onOpenChange={(open) => !open && setEditingSection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSection()
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={sectionDesc}
                onChange={(e) => setSectionDesc(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingSection(null)}
              disabled={sectionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSection}
              disabled={sectionLoading || !sectionTitle.trim()}
            >
              {sectionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Section Dialog ─────────────────────────── */}
      <Dialog
        open={!!deletingSection}
        onOpenChange={(open) => !open && setDeletingSection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{deletingSection?.title}&rdquo;?
            This will also delete all {deletingSection?.lectures.length ?? 0}{" "}
            lecture{(deletingSection?.lectures.length ?? 0) !== 1 ? "s" : ""} in
            this section. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingSection(null)}
              disabled={sectionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSection}
              disabled={sectionLoading}
            >
              {sectionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Lecture Dialog ─────────────────────────────── */}
      <Dialog
        open={!!addLectureToSection}
        onOpenChange={(open) => {
          if (!open) {
            setIsVideoUploading(false)
            setAddLectureToSection(null)
          }
        }}
      >
        <DialogContent className={cn("max-w-lg", lectureType === "QUIZ" && "max-w-2xl")}>
          <DialogHeader>
            <DialogTitle>Add Lecture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Introduction to React"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What will students learn in this lecture?"
                value={lectureDesc}
                onChange={(e) => setLectureDesc(e.target.value)}
                rows={2}
              />
            </div>
            {lectureType === "VIDEO" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Video</Label>
                  <VideoUpload
                    onUploadComplete={(data) => {
                      setVideoData(data)
                      setIsVideoUploading(false)
                    }}
                    onUploadStart={() => setIsVideoUploading(true)}
                    onUploadCancel={() => setIsVideoUploading(false)}
                    disabled={lectureLoading}
                  />
                </div>
              </>
            )}
            {lectureType === "TEXT" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Write the lecture content here..."
                    value={lectureContent}
                    onChange={(e) => setLectureContent(e.target.value)}
                    rows={8}
                    className="min-h-[200px]"
                  />
                </div>
              </>
            )}
            {lectureType === "QUIZ" && (
              <>
                <Separator />
                <QuizBuilder
                  value={lectureContent}
                  onChange={setLectureContent}
                  disabled={lectureLoading}
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddLectureToSection(null)}
              disabled={lectureLoading || isVideoUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLecture}
              disabled={lectureLoading || !lectureTitle.trim() || isVideoUploading}
            >
              {lectureLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Lecture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Lecture Dialog ────────────────────────────── */}
      <Dialog
        open={!!editingLecture}
        onOpenChange={(open) => {
          if (!open) {
            setIsVideoUploading(false)
            setEditingLecture(null)
          }
        }}
      >
        <DialogContent className={cn("max-w-lg", lectureType === "QUIZ" && "max-w-2xl")}>
          <DialogHeader>
            <DialogTitle>Edit Lecture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={lectureDesc}
                onChange={(e) => setLectureDesc(e.target.value)}
                rows={2}
              />
            </div>
            {lectureType === "VIDEO" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Video</Label>
                  <VideoUpload
                    onUploadComplete={(data) => {
                      setVideoData(data)
                      setIsVideoUploading(false)
                    }}
                    onUploadStart={() => setIsVideoUploading(true)}
                    onUploadCancel={() => setIsVideoUploading(false)}
                    existingVideoUrl={editingLecture?.lecture.videoUrl}
                    existingThumbnail={getThumbnailUrl(
                      editingLecture?.lecture.videoPublicId ?? null
                    )}
                    disabled={lectureLoading}
                  />
                </div>
              </>
            )}
            {lectureType === "TEXT" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Write the lecture content here..."
                    value={lectureContent}
                    onChange={(e) => setLectureContent(e.target.value)}
                    rows={8}
                    className="min-h-[200px]"
                  />
                </div>
              </>
            )}
            {lectureType === "QUIZ" && (
              <>
                <Separator />
                <QuizBuilder
                  value={lectureContent}
                  onChange={setLectureContent}
                  disabled={lectureLoading}
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingLecture(null)}
              disabled={lectureLoading || isVideoUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditLecture}
              disabled={lectureLoading || !lectureTitle.trim() || isVideoUploading}
            >
              {lectureLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Lecture Dialog ──────────────────────────── */}
      <Dialog
        open={!!deletingLecture}
        onOpenChange={(open) => !open && setDeletingLecture(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lecture</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{deletingLecture?.lecture.title}
            &rdquo;? {deletingLecture?.lecture.videoUrl &&
              "The associated video will also be removed from storage. "}
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingLecture(null)}
              disabled={lectureLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLecture}
              disabled={lectureLoading}
            >
              {lectureLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Lecture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
