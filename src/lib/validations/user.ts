import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  headline: z.string().max(100, "Headline must be less than 100 characters").optional(),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  website: z.string().url().optional().or(z.literal("")),
  twitter: z.string().max(50).optional(),
  linkedin: z.string().max(100).optional(),
  youtube: z.string().max(100).optional(),
})

export const becomeInstructorSchema = z.object({
  headline: z
    .string()
    .min(10, "Headline must be at least 10 characters")
    .max(100, "Headline must be less than 100 characters"),
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .max(1000, "Bio must be less than 1000 characters"),
})

export type ProfileInput = z.infer<typeof profileSchema>
export type BecomeInstructorInput = z.infer<typeof becomeInstructorSchema>
