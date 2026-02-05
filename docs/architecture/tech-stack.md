# Tech Stack

Learnify is built with modern, production-ready technologies.

## Frontend

### Next.js 16

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

Beautiful, accessible components (23 in `src/components/ui/`):

- Built on Radix UI
- Fully customizable
- Copy-paste components

### TipTap

Rich text editor for course descriptions:

- `@tiptap/react` + `@tiptap/starter-kit`
- Bold, italic, headings, lists, horizontal rules
- Placeholder extension for empty states

### dnd-kit

Drag-and-drop for content reordering:

- `@dnd-kit/core` + `@dnd-kit/sortable`
- Used in `CourseContentEditor` for section/lecture reordering
- Persisted via dedicated `/reorder` API endpoints

### Recharts

Data visualization for instructor analytics:

- `LineChart` for revenue trends over time
- Date range filtering for performance data
- Used in `RevenueChart` component on the instructor Performance page

### Form & Validation

- **React Hook Form** (7.71.1) - Form state management with `zodResolver`
- **Zod** (4.3.6) - Runtime schema validation for API inputs and forms
- **TanStack React Query** (5.90.20) - Server state caching (staleTime: 60s)

## Backend

### API Routes

RESTful API endpoints:

```
GET    /api/courses                          # List courses
POST   /api/courses                          # Create course
GET    /api/courses/:id                      # Get course
PUT    /api/courses/:id                      # Update course
DELETE /api/courses/:id                      # Delete course
POST   /api/courses/:id/sections             # Create section
PUT    /api/courses/:id/sections/reorder     # Reorder sections
PUT    /api/courses/:id/sections/:sId        # Update section
DELETE /api/courses/:id/sections/:sId        # Delete section
POST   /api/courses/:id/sections/:sId/lectures          # Create lecture
PUT    /api/courses/:id/sections/:sId/lectures/reorder   # Reorder lectures
PUT    /api/courses/:id/sections/:sId/lectures/:lId      # Update lecture
DELETE /api/courses/:id/sections/:sId/lectures/:lId      # Delete lecture
POST   /api/lectures/:id/progress            # Update lecture progress
GET    /api/categories                       # List categories
GET    /api/courses/:id/reviews               # List reviews
POST   /api/courses/:id/reviews              # Create review
PUT    /api/courses/:id/reviews/:rId         # Update review
DELETE /api/courses/:id/reviews/:rId         # Delete review
GET    /api/enrollments                      # List enrollments
POST   /api/enrollments                      # Create enrollment
GET    /api/cart                             # List cart items
POST   /api/cart                             # Add to cart
DELETE /api/cart                             # Remove from cart
POST   /api/favourites                       # Add to favourites
DELETE /api/favourites                       # Remove from favourites
POST   /api/checkout                         # Stripe checkout
POST   /api/checkout/verify                  # Verify checkout session
POST   /api/webhooks/stripe                  # Stripe webhooks
POST   /api/upload/signature                 # Cloudinary upload signature
POST   /api/certificates/generate            # Generate certificate
GET    /api/certificates/:id/download        # Download certificate
GET    /api/invoices/:id                     # Get invoice
GET    /api/instructor-applications          # Application status
POST   /api/instructor-applications          # Submit application
GET    /api/admin/instructor-applications    # List applications (admin)
PATCH  /api/admin/instructor-applications/:id # Approve/reject (admin)
POST   /api/become-instructor                # Promote student to instructor
GET    /api/profile                          # Get user profile
PUT    /api/profile                          # Update user profile
POST   /api/profile/image                    # Upload profile image
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

- Video and image upload via signed uploads
- Automatic transcoding
- Adaptive streaming
- Global CDN delivery
- `next-cloudinary` (6.17.5) for React components

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prisma Studio | Database GUI |
| TypeScript | Type checking |
| tsx | TypeScript execution (seed scripts) |
