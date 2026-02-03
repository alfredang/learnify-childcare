"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { CourseGrid } from "@/components/courses/course-grid"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

async function searchCourses(query: string) {
  if (!query) return { courses: [], total: 0 }
  const response = await fetch(`/api/courses?search=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error("Failed to search courses")
  return response.json()
}

async function fetchWishlistedIds(): Promise<Set<string>> {
  try {
    const res = await fetch("/api/wishlist")
    if (!res.ok) return new Set()
    const data = await res.json()
    return new Set(
      data.wishlist?.map((item: { course: { id: string } }) => item.course.id) ?? []
    )
  } catch {
    return new Set()
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchCourses(query),
    enabled: !!query,
  })

  const { data: wishlistedCourseIds } = useQuery({
    queryKey: ["wishlist-ids"],
    queryFn: fetchWishlistedIds,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Search Courses
          </h1>
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for courses..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </div>
          </form>
        </div>

        {query && (
          <div className="mb-8">
            <p className="text-muted-foreground">
              {isLoading ? (
                "Searching..."
              ) : data?.courses?.length > 0 ? (
                <>
                  Found <strong>{data.courses.length}</strong> results for{" "}
                  <strong>&ldquo;{query}&rdquo;</strong>
                </>
              ) : (
                <>
                  No results found for <strong>&ldquo;{query}&rdquo;</strong>
                </>
              )}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data?.courses?.length > 0 ? (
          <CourseGrid courses={data.courses} wishlistedCourseIds={wishlistedCourseIds} />
        ) : query ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No courses found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse our categories.
            </p>
            <Button variant="outline" asChild>
              <a href="/categories">Browse Categories</a>
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Start your search
            </h2>
            <p className="text-muted-foreground">
              Enter a keyword to find courses
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 md:py-16">
          <div className="container">
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
