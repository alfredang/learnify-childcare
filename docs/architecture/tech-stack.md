# Tech Stack

Learnify is built with modern, production-ready technologies.

## Frontend

### Next.js 15

The React framework for production:

- **App Router** - File-based routing with layouts
- **Server Components** - Reduced client-side JavaScript
- **Server Actions** - Simplified data mutations
- **Image Optimization** - Automatic image optimization
- **Edge Runtime** - Fast global delivery

### React 19

Modern React features:

- Server Components
- Streaming and Suspense
- Transitions
- Hooks

### TypeScript

Full type safety across the codebase:

```typescript
interface Course {
  id: string;
  title: string;
  price: number;
  instructor: User;
  sections: Section[];
}
```

### Tailwind CSS

Utility-first CSS framework:

- Responsive design out of the box
- Dark mode support
- Custom design system

### shadcn/ui

Beautiful, accessible components:

- Built on Radix UI
- Fully customizable
- Copy-paste components

## Backend

### API Routes

RESTful API endpoints:

```
GET    /api/courses         # List courses
GET    /api/courses/:id     # Get course
POST   /api/courses         # Create course
PUT    /api/courses/:id     # Update course
DELETE /api/courses/:id     # Delete course
```

### Server Actions

Type-safe server mutations:

```typescript
"use server"

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  // ... enrollment logic
}
```

### NextAuth.js v5

Authentication features:

- Credentials authentication
- OAuth providers (Google, GitHub)
- JWT sessions
- Role-based access

## Data Layer

### Prisma ORM

Type-safe database access:

```typescript
const courses = await prisma.course.findMany({
  where: { status: "PUBLISHED" },
  include: { instructor: true },
});
```

### PostgreSQL

Robust relational database:

- ACID compliance
- Full-text search
- JSON support
- Scalable

## External Services

### Stripe

Payment processing:

- Checkout Sessions
- Webhooks
- Payment intents
- Subscription support (future)

### Cloudinary

Media management:

- Video upload and storage
- Automatic transcoding
- Adaptive streaming
- Global CDN

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Prisma Studio | Database GUI |
| TypeScript | Type checking |
