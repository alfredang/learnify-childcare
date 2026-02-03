---
name: prisma-v5
description: Prisma ORM v5 patterns for this project's PostgreSQL database. Activated when writing queries, modifying schema, or working with database operations.
---

# Prisma v5 Patterns

This project uses Prisma Client v5.22 with PostgreSQL (Neon). Schema is at `prisma/schema.prisma`. Client singleton is at `src/lib/prisma.ts`.

## Import

Always import from the singleton:

```typescript
import { prisma } from "@/lib/prisma"
```

Never create a new `PrismaClient()` instance elsewhere.

## Common Query Patterns

### Fetch with relations

```typescript
const course = await prisma.course.findUnique({
  where: { slug, status: "PUBLISHED" },
  include: {
    instructor: { select: { id: true, name: true, image: true } },
    category: true,
    sections: {
      include: { lectures: true },
      orderBy: { position: "asc" }
    }
  }
})
```

Use `select` on User to avoid leaking password hashes. Never include `password` in queries returned to the client.

### Filtered list with pagination

```typescript
const where: Prisma.CourseWhereInput = { status: "PUBLISHED" }

if (category) where.category = { slug: category }
if (level) where.level = level as CourseLevel
if (search) {
  where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { description: { contains: search, mode: "insensitive" } }
  ]
}

const [courses, total] = await Promise.all([
  prisma.course.findMany({
    where,
    include: { instructor: { select: { id: true, name: true, image: true } }, category: true },
    orderBy: { totalStudents: "desc" },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE
  }),
  prisma.course.count({ where })
])
```

Always use `Promise.all` for independent count + data queries.

### Create with slug

```typescript
import slugify from "slugify"

let slug = slugify(title, { lower: true, strict: true })
const existing = await prisma.course.findUnique({ where: { slug } })
if (existing) slug = `${slug}-${Date.now()}`

const course = await prisma.course.create({
  data: { ...validatedData, slug, instructorId: session.user.id }
})
```

### Upsert pattern

```typescript
await prisma.lectureProgress.upsert({
  where: {
    enrollmentId_lectureId: { enrollmentId, lectureId }
  },
  update: { isCompleted: true, watchedDuration },
  create: { enrollmentId, lectureId, isCompleted: true, watchedDuration }
})
```

### Unique compound constraints

The schema uses `@@unique` for compound keys:
- `Enrollment`: `@@unique([userId, courseId])`
- `Review`: `@@unique([userId, courseId])`
- `Wishlist`: `@@unique([userId, courseId])`
- `LectureProgress`: `@@unique([enrollmentId, lectureId])`

Reference these with the auto-generated compound key name: `userId_courseId`, `enrollmentId_lectureId`.

## Decimal Field Handling

Prisma returns `Decimal` objects for `Float` fields (price, averageRating, etc.). These are NOT plain numbers.

### Converting for client components

```typescript
// Before passing to client components:
const courses = JSON.parse(JSON.stringify(coursesRaw))

// Or convert individually:
const price = Number(course.price)
const rating = Number(course.averageRating)
```

### Comparing Decimals

```typescript
// Wrong - comparing Decimal object to number
if (course.price > 0) // may not work as expected

// Correct
if (Number(course.price) > 0)
```

## Schema Changes

When modifying `prisma/schema.prisma`:

1. Make the schema change
2. Run `npx prisma generate` to update the client types
3. Run `npm run db:push` to apply to the database
4. If the change is destructive (removing fields/models), warn about data loss

### Adding a field

```prisma
model Course {
  // ... existing fields
  subtitle  String?   // nullable = safe to add without migration
}
```

### Adding a relation

Always add both sides of the relation:

```prisma
model Course {
  // ...
  resources Resource[]
}

model Resource {
  // ...
  course   Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  courseId  String
}
```

Use `onDelete: Cascade` when child records should be deleted with the parent.

## Enums

Defined in schema, imported from `@prisma/client`:

```typescript
import { UserRole, CourseStatus, CourseLevel } from "@prisma/client"
```

Key enums:
- `UserRole`: STUDENT, INSTRUCTOR, ADMIN
- `CourseStatus`: DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, ARCHIVED
- `CourseLevel`: BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS
- `LectureType`: VIDEO, TEXT, QUIZ
- `PurchaseStatus`: PENDING, COMPLETED, REFUNDED, FAILED

## Rules

- NEVER include `password` in select/include when returning user data
- ALWAYS use `JSON.parse(JSON.stringify())` when passing Prisma results to client components
- ALWAYS convert Decimal fields with `Number()` before math or display
- ALWAYS use the singleton from `@/lib/prisma`, never instantiate `new PrismaClient()`
- Use `mode: "insensitive"` for search queries on PostgreSQL
- Use `orderBy: { position: "asc" }` for sections and lectures (they have a position field)
- Use `ITEMS_PER_PAGE` from `@/lib/constants` for pagination, never hardcode
- Prefer `findUnique` over `findFirst` when querying by unique fields
- Use transactions (`prisma.$transaction`) for operations that must be atomic (e.g., purchase + enrollment creation)
