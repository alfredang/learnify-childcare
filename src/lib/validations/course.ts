import { z } from "zod"

export const courseCreateSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(60, "Title must be less than 60 characters"),
  categoryId: z.string().min(1, "Please select a category"),
})

export type CourseCreateInput = z.infer<typeof courseCreateSchema>

export const courseSchema = z.object({
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
  language: z.string().default("English"),
  cpdPoints: z.coerce.number().min(0, "CPD points must be 0 or greater").default(0),
  estimatedHours: z.coerce.number().min(0, "Estimated hours must be 0 or greater").default(2),
  learningOutcomes: z.array(z.string()).optional(),
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
  description: z.string().nullish(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ"]),
  content: z.string().nullish(),
  videoUrl: z.string().nullish(),
  videoPublicId: z.string().nullish(),
  videoDuration: z.coerce.number().nullish(),
})

export const quizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
})

export const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(["multiple_choice", "multiple_select", "open_ended"]),
    text: z.string().min(1, "Question text is required"),
    options: z.array(quizOptionSchema),
    explanation: z.string().optional(),
    points: z.number().min(1).default(1),
  })
  .superRefine((question, ctx) => {
    if (question.type === "multiple_choice") {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple choice must have at least 2 options",
          path: ["options"],
        })
      }
      const correctCount = question.options.filter((o) => o.isCorrect).length
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple choice must have exactly 1 correct answer",
          path: ["options"],
        })
      }
    }
    if (question.type === "multiple_select") {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple select must have at least 2 options",
          path: ["options"],
        })
      }
      if (!question.options.some((o) => o.isCorrect)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Multiple select must have at least 1 correct answer",
          path: ["options"],
        })
      }
    }
  })

export const quizDataSchema = z.object({
  version: z.literal(1),
  passingScore: z.number().min(0).max(100).optional(),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "Quiz must have at least 1 question"),
})

export type CourseInput = z.infer<typeof courseSchema>
export type SectionInput = z.infer<typeof sectionSchema>
export type LectureInput = z.infer<typeof lectureSchema>
export type QuizDataInput = z.infer<typeof quizDataSchema>
