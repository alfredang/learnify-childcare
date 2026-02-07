import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  jobTitle: z.string().max(100, "Job title must be less than 100 characters").optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
