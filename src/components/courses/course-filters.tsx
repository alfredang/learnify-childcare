"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import {
  COURSE_LEVELS,
  PRICE_FILTERS,
  RATING_FILTERS,
  SORT_OPTIONS,
} from "@/lib/constants"

interface CourseFiltersProps {
  categories?: { id: string; name: string; slug: string }[]
}

export function CourseFilters({ categories }: CourseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || "all"
  const currentLevel = searchParams.get("level") || "all"
  const currentPrice = searchParams.get("price") || "all"
  const currentRating = searchParams.get("rating") || "all"
  const currentSort = searchParams.get("sort") || "popular"

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push(window.location.pathname)
  }

  const hasFilters =
    (currentCategory && currentCategory !== "all") ||
    (currentLevel && currentLevel !== "all") ||
    (currentPrice && currentPrice !== "all") ||
    (currentRating && currentRating !== "all")

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {categories && (
        <Select
          value={currentCategory}
          onValueChange={(value) => updateFilter("category", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={currentLevel}
        onValueChange={(value) => updateFilter("level", value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {COURSE_LEVELS.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              {level.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentPrice}
        onValueChange={(value) => updateFilter("price", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
          {PRICE_FILTERS.map((filter) => (
            <SelectItem key={filter.value} value={filter.value}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentRating}
        onValueChange={(value) => updateFilter("rating", value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          {RATING_FILTERS.map((filter) => (
            <SelectItem key={filter.value} value={filter.value}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentSort}
        onValueChange={(value) => updateFilter("sort", value)}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
