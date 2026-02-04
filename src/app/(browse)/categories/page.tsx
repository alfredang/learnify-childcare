import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import {
  Code,
  Briefcase,
  Palette,
  Megaphone,
  Server,
  User,
  BookOpen,
  Camera,
  Music,
  Heart,
  Lightbulb,
  TrendingUp,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all course categories on Learnify",
}

const iconMap: Record<string, React.ElementType> = {
  Code,
  Briefcase,
  Palette,
  Megaphone,
  Server,
  User,
  BookOpen,
  Camera,
  Music,
  Heart,
  Lightbulb,
  TrendingUp,
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: { where: { status: "PUBLISHED" } } },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
    return categories
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="py-12 md:py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Browse Categories
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of course categories and find the perfect
            course to advance your skills and career.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon || "Code"] || Code
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {category._count.courses}{" "}
                            {category._count.courses === 1
                              ? "course"
                              : "courses"}
                          </p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No categories yet</h2>
            <p className="text-muted-foreground">
              Categories will appear here once they are added.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
