import { CourseCard } from "./course-card"

interface CourseGridProps {
  courses: {
    id: string
    title: string
    thumbnail: string | null
    cpdPoints: number
    estimatedHours: number | string
    category?: { name: string } | null
  }[]
  enrolledCourseMap?: Map<string, number>
}

export function CourseGrid({ courses, enrolledCourseMap }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          progress={enrolledCourseMap?.get(course.id)}
          showProgress={enrolledCourseMap?.has(course.id)}
        />
      ))}
    </div>
  )
}
