import { z } from "zod"

export const courseSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .max(200, "Subtitle must be less than 200 characters")
    .optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]),
  language: z.string().default("English"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  isFree: z.boolean().default(false),
  learningOutcomes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
})

export const sectionSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
})

export const lectureSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ"]),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  videoDuration: z.number().optional(),
  isFreePreview: z.boolean().default(false),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000, "Review must be less than 1000 characters").optional(),
})

export type CourseInput = z.infer<typeof courseSchema>
export type SectionInput = z.infer<typeof sectionSchema>
export type LectureInput = z.infer<typeof lectureSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
