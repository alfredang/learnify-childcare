import type {
  User,
  Course,
  Section,
  Lecture,
  Enrollment,
  Review,
  Category,
  Purchase,
} from "@prisma/client"

export type CourseWithInstructor = Course & {
  instructor: Pick<User, "id" | "name" | "image" | "headline">
  category: Category
}

export type CourseWithDetails = Course & {
  instructor: Pick<User, "id" | "name" | "image" | "headline" | "bio">
  category: Category
  sections: (Section & {
    lectures: Lecture[]
  })[]
  reviews: (Review & {
    user: Pick<User, "id" | "name" | "image">
  })[]
  _count: {
    enrollments: number
    reviews: number
  }
}

export type EnrolledCourse = Enrollment & {
  course: CourseWithInstructor & {
    sections: (Section & {
      lectures: Lecture[]
    })[]
  }
}

export type CourseForLearning = Course & {
  instructor: Pick<User, "id" | "name" | "image">
  sections: (Section & {
    lectures: (Lecture & {
      progress?: {
        isCompleted: boolean
        lastPosition: number
      }[]
    })[]
  })[]
}

export type InstructorCourse = Course & {
  category: Category
  _count: {
    enrollments: number
    reviews: number
  }
}

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">
}

export type PurchaseWithCourse = Purchase & {
  course: Pick<Course, "id" | "title" | "slug" | "thumbnail">
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface CourseFilters {
  search?: string
  category?: string
  level?: string
  price?: string
  rating?: string
  sort?: string
  page?: number
}

export type WishlistCourse = {
  id: string
  createdAt: Date
  course: CourseWithInstructor
}

export interface ApiError {
  message: string
  code?: string
}

// Quiz Builder Types
export type QuizQuestionType = "multiple_choice" | "multiple_select" | "open_ended"

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  type: QuizQuestionType
  text: string
  options: QuizOption[]
  explanation?: string
  points: number
}

export interface QuizData {
  version: 1
  passingScore?: number
  questions: QuizQuestion[]
}
