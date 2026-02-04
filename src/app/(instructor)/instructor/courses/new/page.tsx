"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Separator } from "@/components/ui/separator"
import { RichTextEditor } from "@/components/shared/rich-text-editor"
import { ArrayFieldEditor } from "@/components/shared/array-field-editor"
import { ImageUpload } from "@/components/courses/image-upload"
import { courseSchema, type CourseInput } from "@/lib/validations/course"
import { COURSE_LEVELS } from "@/lib/constants"
import { useQuery } from "@tanstack/react-query"

async function getCategories() {
  const response = await fetch("/api/categories")
  if (!response.ok) throw new Error("Failed to fetch categories")
  return response.json()
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

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

  async function onSubmit(data: CourseInput) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          thumbnail: thumbnailUrl,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create course")
      }

      const course = await response.json()
      toast.success("Course created successfully!")
      router.push(`/instructor/courses/${course.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create course"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">
          Fill in the details to create your course
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Complete Web Development Bootcamp"
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(
                            (category: { id: string; name: string }) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
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
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Describe your course in detail. What will students learn? What makes this course unique?"
                        disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Thumbnail */}
              <FormItem>
                <FormLabel>Course Thumbnail</FormLabel>
                <FormDescription>
                  Upload an eye-catching image. Recommended: 750x422px (16:9
                  ratio)
                </FormDescription>
                <ImageUpload
                  onUploadComplete={({ imageUrl }) => setThumbnailUrl(imageUrl)}
                  existingImageUrl={thumbnailUrl}
                  disabled={isLoading}
                />
              </FormItem>

              <Separator />

              {/* Learning Outcomes */}
              <ArrayFieldEditor
                form={form}
                name="learningOutcomes"
                label="What students will learn"
                placeholder="e.g., Build full-stack web applications"
                disabled={isLoading}
              />

              {/* Requirements */}
              <ArrayFieldEditor
                form={form}
                name="requirements"
                label="Requirements"
                placeholder="e.g., Basic knowledge of HTML and CSS"
                disabled={isLoading}
              />

              {/* Target Audience */}
              <ArrayFieldEditor
                form={form}
                name="targetAudience"
                label="Who this course is for"
                placeholder="e.g., Beginner web developers"
                disabled={isLoading}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Course
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
