import { z } from "zod"

export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  maxLearners: z.coerce.number().min(1).default(50),
  billingEnabled: z.boolean().default(false),
})

export const courseAssignmentSchema = z.object({
  learnerId: z.string().min(1, "Please select a learner"),
  courseId: z.string().min(1, "Please select a course"),
  deadline: z.coerce.date().optional(),
  notes: z.string().optional(),
})

export const bulkAssignmentSchema = z.object({
  learnerIds: z.array(z.string().min(1)).min(1, "Select at least one learner"),
  courseId: z.string().min(1, "Please select a course"),
  deadline: z.coerce.date().optional(),
})

export const inviteLearnerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  jobTitle: z.string().optional(),
  staffId: z.string().optional(),
})

export type OrganizationInput = z.infer<typeof organizationSchema>
export type CourseAssignmentInput = z.infer<typeof courseAssignmentSchema>
export type BulkAssignmentInput = z.infer<typeof bulkAssignmentSchema>
export type InviteLearnerInput = z.infer<typeof inviteLearnerSchema>
