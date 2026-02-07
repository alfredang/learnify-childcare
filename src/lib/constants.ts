export const COURSE_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All Levels" },
] as const

export const COURSE_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
] as const

export const LECTURE_TYPES = [
  { value: "VIDEO", label: "Video" },
  { value: "TEXT", label: "Text" },
  { value: "QUIZ", label: "Quiz" },
] as const

export const CATEGORIES = [
  { name: "Child Development", slug: "child-development", icon: "Baby" },
  { name: "Health & Safety", slug: "health-safety", icon: "ShieldCheck" },
  { name: "Nutrition & Wellness", slug: "nutrition-wellness", icon: "Apple" },
  { name: "Curriculum Planning", slug: "curriculum-planning", icon: "BookOpen" },
  { name: "Special Needs", slug: "special-needs", icon: "Heart" },
  { name: "Parent Communication", slug: "parent-communication", icon: "MessageSquare" },
  { name: "Regulatory Compliance", slug: "regulatory-compliance", icon: "ClipboardCheck" },
] as const

export const ASSIGNMENT_STATUSES = [
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "OVERDUE", label: "Overdue" },
] as const

export const LANGUAGES = ["English"] as const

export const SUBTITLE_MAX_LENGTH = 120
export const LEARNING_OUTCOME_MAX_LENGTH = 160

export const FIXED_PRICE_SGD = 60
export const DEFAULT_DEADLINE_MONTHS = 6
export const DEFAULT_BILLING_ENABLED = false

export const ITEMS_PER_PAGE = 12

export const QUIZ_QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "multiple_select", label: "Multiple Select" },
  { value: "open_ended", label: "Open Ended" },
] as const

export const MAX_QUIZ_OPTIONS = 6
export const MIN_QUIZ_OPTIONS = 2
export const MAX_QUIZ_QUESTIONS = 50
