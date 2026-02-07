import type {
  User,
  Course,
  Section,
  Lecture,
  Enrollment,
  Category,
  Organization,
  CourseAssignment,
} from "@prisma/client"

export type CourseWithCategory = Course & {
  category: Category
  createdBy: Pick<User, "id" | "name">
}

export type CourseWithDetails = Course & {
  category: Category
  createdBy: Pick<User, "id" | "name">
  sections: (Section & {
    lectures: Lecture[]
  })[]
  _count: {
    enrollments: number
  }
}

export type EnrolledCourse = Enrollment & {
  course: CourseWithCategory & {
    sections: (Section & {
      lectures: Lecture[]
    })[]
  }
}

export type CourseForLearning = Course & {
  createdBy: Pick<User, "id" | "name">
  sections: (Section & {
    lectures: (Lecture & {
      progress?: {
        isCompleted: boolean
        lastPosition: number
      }[]
    })[]
  })[]
}

export type LearnerDashboardCourse = CourseAssignment & {
  course: CourseWithCategory
  enrollment?: Enrollment | null
}

export type CourseAssignmentWithDetails = CourseAssignment & {
  learner: Pick<User, "id" | "name" | "email" | "image" | "jobTitle" | "staffId">
  course: Pick<Course, "id" | "title" | "slug" | "thumbnail" | "cpdPoints" | "estimatedHours">
  assignedBy: Pick<User, "id" | "name">
}

export type OrganizationWithUsers = Organization & {
  users: Pick<User, "id" | "name" | "email" | "role" | "jobTitle" | "staffId">[]
  _count: {
    users: number
    assignments: number
  }
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
