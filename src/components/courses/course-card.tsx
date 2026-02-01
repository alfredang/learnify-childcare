import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/shared/star-rating"
import { Users } from "lucide-react"
import type { CourseWithInstructor } from "@/types"

interface CourseCardProps {
  course: CourseWithInstructor
}

export function CourseCard({ course }: CourseCardProps) {
  const price = Number(course.price)
  const discountPrice = course.discountPrice ? Number(course.discountPrice) : null
  const rating = Number(course.averageRating)

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video">
          <Image
            src={course.thumbnail || "/images/placeholder-course.jpg"}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {course.isFree && (
            <Badge className="absolute top-2 left-2 bg-green-500">Free</Badge>
          )}
          {course.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500">
              Bestseller
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {course.instructor.name}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={rating} size="sm" showValue />
            <span className="text-sm text-muted-foreground">
              ({course.totalReviews.toLocaleString()})
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{course.totalStudents.toLocaleString()} students</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2">
            {course.isFree ? (
              <span className="font-bold text-lg">Free</span>
            ) : (
              <>
                <span className="font-bold text-lg">
                  ${discountPrice ?? price}
                </span>
                {discountPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${price}
                  </span>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
