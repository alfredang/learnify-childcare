"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ImageIcon,
  Film,
  Upload,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RichTextEditor } from "@/components/shared/rich-text-editor"
import { COURSE_LEVELS, LANGUAGES, SUBTITLE_MAX_LENGTH } from "@/lib/constants"
import { cn } from "@/lib/utils"

const landingPageSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .max(120, "Subtitle must be less than 120 characters")
    .optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]),
  language: z.string().optional(),
})

type LandingPageInput = z.infer<typeof landingPageSchema>

interface LandingPageProps {
  courseId: string
  course: {
    title: string
    subtitle?: string | null
    description?: string | null
    categoryId: string
    level: string
    language: string
    thumbnail?: string | null
    previewVideoUrl?: string | null
  }
  onSaved: () => void
}

async function fetchCategories() {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

type UploadState = "idle" | "uploading" | "success" | "error"

function useCloudinaryUpload(resourceType: "image" | "video") {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setUploadState("idle")
    setProgress(0)
    setErrorMessage("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const cancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
    reset()
  }, [reset])

  const upload = useCallback(
    async (file: File): Promise<{ url: string; publicId: string; duration?: number } | null> => {
      setUploadState("uploading")
      setProgress(0)
      setErrorMessage("")

      try {
        const sigRes = await fetch("/api/upload/signature")
        if (!sigRes.ok) throw new Error("Signature request failed")
        const { timestamp, signature, cloudName, apiKey } = await sigRes.json()

        const formData = new FormData()
        formData.append("file", file)
        formData.append("timestamp", String(timestamp))
        formData.append("signature", signature)
        formData.append("api_key", apiKey)
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        )
        if (resourceType === "video") {
          formData.append("resource_type", "video")
        }

        const result = await new Promise<{
          secure_url: string
          public_id: string
          duration?: number
        }>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhrRef.current = xhr

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100))
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              try {
                const errBody = JSON.parse(xhr.responseText)
                reject(new Error(errBody?.error?.message || `Upload failed (${xhr.status})`))
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`))
              }
            }
          })

          xhr.addEventListener("error", () => reject(new Error("Network error")))
          xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")))

          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
          )
          xhr.send(formData)
        })

        xhrRef.current = null
        setUploadState("success")
        return {
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration ? Math.round(result.duration) : undefined,
        }
      } catch (err) {
        xhrRef.current = null
        if (err instanceof Error && err.message === "Upload cancelled") return null
        setErrorMessage(err instanceof Error ? err.message : "Upload failed")
        setUploadState("error")
        return null
      }
    },
    [resourceType]
  )

  return { uploadState, progress, errorMessage, fileInputRef, upload, reset, cancel }
}

export function LandingPageSection({
  courseId,
  course,
  onSaved,
}: LandingPageProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    course.thumbnail || null
  )
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(
    course.previewVideoUrl || null
  )
  const [formResetKey, setFormResetKey] = useState(0)

  const imageUpload = useCloudinaryUpload("image")
  const videoUpload = useCloudinaryUpload("video")

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  const form = useForm<LandingPageInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(landingPageSchema) as any,
    defaultValues: {
      title: course.title || "",
      subtitle: course.subtitle || "",
      description: course.description || "",
      categoryId: course.categoryId || "",
      level: (course.level as LandingPageInput["level"]) || "ALL_LEVELS",
      language: course.language || "",
    },
  })

  const hasInitialized = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onSavedRef = useRef(onSaved)
  onSavedRef.current = onSaved

  // Debounced auto-save on form field changes
  const watchedValues = form.watch()
  const formValuesKey = JSON.stringify(watchedValues)

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      return
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(async () => {
      const values = form.getValues()
      setIsSaving(true)
      try {
        const res = await fetch(`/api/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            thumbnail: thumbnailUrl,
            previewVideoUrl: previewVideoUrl,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to save")
        }
        onSavedRef.current()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save")
      } finally {
        setIsSaving(false)
      }
    }, 1500)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValuesKey, thumbnailUrl, previewVideoUrl, courseId])

  useEffect(() => {
    if (categories.length > 0) {
      setFormResetKey((k) => k + 1)
    }
  }, [categories.length])

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB")
      return
    }
    const result = await imageUpload.upload(file)
    if (result) {
      setThumbnailUrl(result.url)
    }
  }

  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be under 50MB")
      return
    }
    const result = await videoUpload.upload(file)
    if (result) {
      setPreviewVideoUrl(result.url)
    }
  }

  const titleValue = watchedValues.title || ""
  const subtitleValue = watchedValues.subtitle || ""

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-bold">Course landing page</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your course landing page is crucial to your success. If it&apos;s done
          right, it can also help you gain visibility in search engines like
          Google. As you complete this section, think about creating a compelling
          Course Landing Page that demonstrates why someone would want to enroll
          in your course.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Title with char count */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course title</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="e.g., Complete Web Development Bootcamp"
                      disabled={isSaving}
                      className="pr-14"
                      {...field}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
                      {titleValue.length}
                    </span>
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Your title should be a mix of attention-grabbing, informative, and optimized for search
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subtitle with remaining char count */}
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course subtitle</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="e.g., Learn to build modern web applications from scratch"
                      disabled={isSaving}
                      className="pr-14"
                      {...field}
                    />
                    <span
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums",
                        (subtitleValue?.length || 0) > SUBTITLE_MAX_LENGTH - 10
                          ? "text-orange-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {SUBTITLE_MAX_LENGTH - (subtitleValue?.length || 0)}
                    </span>
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Use 1 or 2 related keywords, and mention 3-4 of the most important areas that you&apos;ve covered during your course.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course description</FormLabel>
                <FormControl>
                  <RichTextEditor
                    content={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Insert your course description."
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Basic info — 3-col grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Basic info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Language */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      key={formResetKey}
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Level */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      key={formResetKey}
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Select Level --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COURSE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      key={formResetKey}
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSaving}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Select Category --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(
                          (cat: { id: string; name: string }) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Course image — Udemy side-by-side layout */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Course image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Image preview */}
              <div className="aspect-video bg-muted border rounded-lg overflow-hidden flex items-center justify-center relative">
                {imageUpload.uploadState === "uploading" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80">
                    <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                    <Progress value={imageUpload.progress} className="w-3/4 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {imageUpload.progress}% uploaded
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={imageUpload.cancel}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
              </div>

              {/* Right: Instructions + upload */}
              <div className="space-y-3 flex flex-col justify-center">
                <p className="text-sm text-muted-foreground">
                  Upload your course image here. It must meet our course image
                  quality standards to be accepted. Important guidelines:
                  750x422 pixels; .jpg, .jpeg, .gif, or .png. No text on the
                  image.
                </p>
                {imageUpload.uploadState === "error" && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{imageUpload.errorMessage}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {thumbnailUrl ? "Image uploaded" : "No file selected"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageUpload.fileInputRef.current?.click()}
                    disabled={isSaving || imageUpload.uploadState === "uploading"}
                  >
                    Upload File
                  </Button>
                  <input
                    ref={imageUpload.fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Promotional video — Udemy side-by-side layout */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Promotional video</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Video preview */}
              <div className="aspect-video bg-muted border rounded-lg overflow-hidden flex items-center justify-center relative">
                {videoUpload.uploadState === "uploading" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80">
                    <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                    <Progress value={videoUpload.progress} className="w-3/4 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {videoUpload.progress}% uploaded
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={videoUpload.cancel}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : previewVideoUrl ? (
                  <video
                    src={previewVideoUrl}
                    className="w-full h-full object-contain bg-black"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Film className="h-12 w-12" />
                  </div>
                )}
              </div>

              {/* Right: Instructions + upload */}
              <div className="space-y-3 flex flex-col justify-center">
                <p className="text-sm text-muted-foreground">
                  Your promo video is a quick and compelling way for students to
                  preview what they&apos;ll learn in your course. Students
                  considering your course are more likely to enroll if your promo
                  video is well-made.
                </p>
                {videoUpload.uploadState === "error" && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{videoUpload.errorMessage}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {previewVideoUrl ? "Video uploaded" : "No file selected"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => videoUpload.fileInputRef.current?.click()}
                    disabled={isSaving || videoUpload.uploadState === "uploading"}
                  >
                    Upload File
                  </Button>
                  <input
                    ref={videoUpload.fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                </div>
              </div>
            </div>
          </div>

        </form>
      </Form>
    </div>
  )
}
