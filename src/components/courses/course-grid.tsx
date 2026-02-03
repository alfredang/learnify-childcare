import { CourseCard } from "./course-card"
import type { CourseWithInstructor } from "@/types"

interface CourseGridProps {
  courses: CourseWithInstructor[]
  wishlistedCourseIds?: Set<string>
}

export function CourseGrid({ courses, wishlistedCourseIds }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isWishlisted={wishlistedCourseIds?.has(course.id)}
        />
      ))}
    </div>
  )
}
