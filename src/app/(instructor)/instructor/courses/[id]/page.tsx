"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
  Loader2,
  ArrowLeft,
  Save,
  Eye,
  Settings,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { courseSchema, type CourseInput } from "@/lib/validations/course"
import { COURSE_LEVELS } from "@/lib/constants"

async function fetchCourse(id: string) {
  const res = await fetch(`/api/courses/${id}`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to fetch course")
  }
  return res.json()
}

async function fetchCategories() {
  const res = await fetch("/api/categories")
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
}

export default function CourseEditorPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = params.id as string

  const [isSaving, setIsSaving] = useState(false)

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourse(courseId),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  const course = courseData?.course

  const form = useForm<CourseInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      categoryId: "",
      level: "BEGINNER",
      language: "English",
      price: 0,
      isFree: false,
      learningOutcomes: [],
      requirements: [],
      targetAudience: [],
    },
  })

  // Populate form when course data loads
  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title || "",
        subtitle: course.subtitle || "",
        description: course.description || "",
        categoryId: course.categoryId || "",
        level: course.level || "BEGINNER",
        language: course.language || "English",
        price: Number(course.price) || 0,
        isFree: course.isFree || false,
        learningOutcomes: course.learningOutcomes || [],
        requirements: course.requirements || [],
        targetAudience: course.targetAudience || [],
      })
    }
  }, [course, form])

  async function onSubmit(data: CourseInput) {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update course")
      }

      await queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      toast.success("Course updated successfully")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update course"
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">
            {courseError instanceof Error
              ? courseError.message
              : "This course doesn't exist or you don't have access to it."}
          </p>
          <Button asChild>
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalLectures = course.sections?.reduce(
    (acc: number, s: { lectures: unknown[] }) => acc + s.lectures.length,
    0
  ) ?? 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge
                variant="secondary"
                className={statusColors[course.status]}
              >
                {course.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {course.sections?.length ?? 0} sections &middot; {totalLectures}{" "}
              lectures &middot; {course._count?.enrollments ?? 0} students
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {course.status === "PUBLISHED" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/courses/${course.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Live
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="gap-2">
            <Settings className="h-4 w-4" />
            Course Details
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Complete Web Development Bootcamp"
                            disabled={isSaving}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title (5-100 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Learn to build modern web applications from scratch"
                            disabled={isSaving}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief summary shown below the title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSaving}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
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

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSaving}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COURSE_LEVELS.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your course in detail. What will students learn? What makes this course unique?"
                            className="min-h-[180px]"
                            disabled={isSaving}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              disabled={isSaving}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Set to 0 for a free course
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="English"
                              disabled={isSaving}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Learning Outcomes */}
                  <ArrayFieldEditor
                    form={form}
                    name="learningOutcomes"
                    label="What students will learn"
                    placeholder="e.g., Build full-stack web applications"
                    disabled={isSaving}
                  />

                  {/* Requirements */}
                  <ArrayFieldEditor
                    form={form}
                    name="requirements"
                    label="Requirements"
                    placeholder="e.g., Basic knowledge of HTML and CSS"
                    disabled={isSaving}
                  />

                  {/* Target Audience */}
                  <ArrayFieldEditor
                    form={form}
                    name="targetAudience"
                    label="Who this course is for"
                    placeholder="e.g., Beginner web developers"
                    disabled={isSaving}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/instructor/courses")}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab — placeholder for Chunk 5 */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Section & lecture management coming soon
                </p>
                <p className="text-sm mt-1">
                  You&apos;ll be able to add sections, lectures, and upload
                  videos here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Array field editor — reusable for outcomes, requirements, audience */
/* ------------------------------------------------------------------ */

function ArrayFieldEditor({
  form,
  name,
  label,
  placeholder,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  name: "learningOutcomes" | "requirements" | "targetAudience"
  label: string
  placeholder: string
  disabled: boolean
}) {
  const values: string[] = form.watch(name) || []
  const [inputValue, setInputValue] = useState("")

  function addItem() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    form.setValue(name, [...values, trimmed])
    setInputValue("")
  }

  function removeItem(index: number) {
    form.setValue(
      name,
      values.filter((_: string, i: number) => i !== index)
    )
  }

  return (
    <div className="space-y-3">
      <FormLabel>{label}</FormLabel>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addItem()
            }
          }}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          disabled={disabled || !inputValue.trim()}
        >
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <ul className="space-y-2">
          {values.map((item: string, index: number) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(index)}
                disabled={disabled}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
