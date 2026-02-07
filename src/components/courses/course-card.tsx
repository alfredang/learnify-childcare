import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, Clock } from "lucide-react"

interface CourseCardProps {
  course: {
    id: string
    title: string
    thumbnail: string | null
    cpdPoints: number
    estimatedHours: number | string
    category?: { name: string } | null
  }
  progress?: number
  showProgress?: boolean
}

export function CourseCard({
  course,
  progress = 0,
  showProgress = false,
}: CourseCardProps) {
  return (
    <Card className="group relative h-full overflow-hidden transition-shadow hover:shadow-lg flex flex-col py-0">
      <Link href={`/my-courses/${course.id}`}>
        <div className="relative aspect-video">
          <Image
            src={course.thumbnail || "/images/placeholder-course.jpg"}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
          <Link href={`/my-courses/${course.id}`} className="hover:text-primary transition-colors">
            {course.title}
          </Link>
        </h3>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {course.category?.name && (
            <Badge variant="secondary">{course.category.name}</Badge>
          )}
          {course.cpdPoints > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {course.cpdPoints} CPD
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Clock className="h-4 w-4" />
          <span>{course.estimatedHours} hrs</span>
        </div>

        {showProgress && (
          <div className="mt-auto space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
