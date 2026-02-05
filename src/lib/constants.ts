export const COURSE_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All Levels" },
] as const

export const COURSE_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ARCHIVED", label: "Archived" },
] as const

export const LECTURE_TYPES = [
  { value: "VIDEO", label: "Video" },
  { value: "TEXT", label: "Text" },
  { value: "QUIZ", label: "Quiz" },
] as const

export const CATEGORIES = [
  { name: "Development", slug: "development", icon: "Code" },
  { name: "Business", slug: "business", icon: "Briefcase" },
  { name: "Design", slug: "design", icon: "Palette" },
  { name: "Marketing", slug: "marketing", icon: "Megaphone" },
  { name: "IT & Software", slug: "it-software", icon: "Server" },
  { name: "Personal Development", slug: "personal-development", icon: "User" },
  { name: "Photography", slug: "photography", icon: "Camera" },
  { name: "Music", slug: "music", icon: "Music" },
  { name: "Health & Fitness", slug: "health-fitness", icon: "Heart" },
  { name: "Finance", slug: "finance", icon: "DollarSign" },
] as const

export const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
] as const

export const PRICE_FILTERS = [
  { value: "all", label: "All Prices" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "under-20", label: "Under $20" },
  { value: "20-50", label: "$20 - $50" },
  { value: "50-100", label: "$50 - $100" },
  { value: "over-100", label: "Over $100" },
] as const

export const RATING_FILTERS = [
  { value: "all", label: "All Ratings" },
  { value: "4.5", label: "4.5 & up" },
  { value: "4.0", label: "4.0 & up" },
  { value: "3.5", label: "3.5 & up" },
  { value: "3.0", label: "3.0 & up" },
] as const

export const APPLICATION_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const

export const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Japanese",
  "Korean",
  "Chinese",
  "Arabic",
  "Hindi",
  "Italian",
  "Dutch",
  "Russian",
  "Turkish",
  "Polish",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Swedish",
] as const

export const SUBTITLE_MAX_LENGTH = 120
export const LEARNING_OUTCOME_MAX_LENGTH = 160

export const PLATFORM_FEE_PERCENT = 30
export const MIN_COURSE_PRICE = 0
export const MAX_COURSE_PRICE = 99999

export const ITEMS_PER_PAGE = 12

export const QUIZ_QUESTION_TYPES = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "multiple_select", label: "Multiple Select" },
  { value: "open_ended", label: "Open Ended" },
] as const

export const MAX_QUIZ_OPTIONS = 6
export const MIN_QUIZ_OPTIONS = 2
export const MAX_QUIZ_QUESTIONS = 50
