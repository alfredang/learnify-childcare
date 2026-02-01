"use client"

import dynamic from "next/dynamic"

const CourseFilters = dynamic(
  () => import("./course-filters").then((mod) => mod.CourseFilters),
  {
    ssr: false,
    loading: () => <div className="h-10 animate-pulse bg-muted rounded" />,
  }
)

interface CourseFiltersWrapperProps {
  categories?: { id: string; name: string; slug: string }[]
}

export function CourseFiltersWrapper({ categories }: CourseFiltersWrapperProps) {
  return <CourseFilters categories={categories} />
}
