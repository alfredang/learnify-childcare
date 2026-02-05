# Learnify - CLAUDE.md

## Project Overview

Learnify is a Udemy-clone online learning marketplace where instructors create and sell courses, students browse and learn, and admins manage the platform. The UI should closely mirror Udemy's design and UX patterns. Three user roles: Student, Instructor, Admin. Revenue model: 70% instructor / 30% platform.

**Live demo:** https://learnify-corporate-training-platform.netlify.app
**Repo:** https://github.com/alfredang/Learnify

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | React framework, App Router, Server Components, Server Actions |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety (strict mode) |
| Tailwind CSS | 4.x | Utility-first CSS (via `@tailwindcss/postcss`, no tailwind.config) |
| Prisma | 5.22.0 | ORM for PostgreSQL |
| PostgreSQL | via Neon | Relational database |
| NextAuth.js | 5.0.0-beta.30 | Auth (Credentials, Google, GitHub OAuth) |
| Stripe | 20.3.0 | Payments (Checkout Sessions, Webhooks) |
| Cloudinary | 2.9.0 | Video/image upload and CDN |
| shadcn/ui | Radix-based | UI component library (23 components in `src/components/ui/`) |
| React Hook Form | 7.71.1 | Form management |
| Zod | 4.3.6 | Schema validation |
| TanStack React Query | 5.90.20 | Server state / data fetching |
| Zustand | 5.0.10 | Client state management (installed, not yet actively used) |
| TipTap | 3.18.0 | Rich text editor (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`) |
| dnd-kit | 6.3.1 / 10.0.0 | Drag & drop for section/lecture reordering (`@dnd-kit/core`, `@dnd-kit/sortable`) |
| next-cloudinary | 6.17.5 | Cloudinary React components |
| next-themes | 0.4.6 | Theme support |
| Lucide React | 0.563.0 | Icons |
| Sonner | 2.0.7 | Toast notifications |
| date-fns | 4.1.0 | Date formatting |
| slugify | 1.6.6 | URL slug generation |
| Recharts | 3.7.0 | Charts for instructor performance dashboard |

---

## Setup & Commands

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon recommended) or local instance
- Stripe, Cloudinary, and optionally Google/GitHub OAuth accounts

### Install & Run

```bash
npm install                          # Install deps (runs prisma generate via postinstall)
cp .env.example .env                 # Copy and fill in env vars
npx prisma generate                  # Generate Prisma client
npm run db:push                      # Push schema to database
npm run db:seed                      # Seed with sample data (tsx prisma/seed.ts)
npm run dev                          # Start dev server at localhost:3000
```

### All Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to DB |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database (`tsx prisma/seed.ts`) |
| `npm run db:studio` | Open Prisma Studio GUI |

### Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@learnify.com | password123 |
| Instructor | john@learnify.com | password123 |
| Instructor | sarah@learnify.com | password123 |
| Student | student1@example.com | password123 |

### Environment Variables

Required in `.env` (see `docs/getting-started/configuration.md` for full details):

```
DATABASE_URL, AUTH_SECRET, AUTH_URL,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
NEXT_PUBLIC_APP_URL
```

Optional: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

---

## Project Structure

```
learnify/
├── prisma/
│   ├── schema.prisma              # Database schema (all models, enums, relations)
│   └── seed.ts                    # Seed script (tsx)
├── docs/                          # Project documentation (MkDocs format)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (Providers, Header, Footer)
│   │   ├── page.tsx               # Homepage (server component, fetches featured courses)
│   │   ├── globals.css            # Tailwind directives
│   │   ├── error.tsx              # Error boundary
│   │   ├── global-error.tsx       # Root error boundary
│   │   ├── (auth)/                # Auth pages: login, register, forgot-password
│   │   ├── (browse)/              # Public pages: courses, categories, instructors, search, about
│   │   ├── (student)/             # Student pages: my-courses, lecture viewer, cart, favourites, account, certificates
│   │   ├── (instructor)/          # Instructor pages: dashboard, course editor, creation wizard, performance, tools, profile
│   │   ├── (admin)/               # Admin pages: dashboard, users, courses, applications
│   │   └── api/                   # API routes (REST endpoints)
│   ├── components/
│   │   ├── auth/                  # LoginForm, RegisterForm, SocialButtons, InstructorApplicationForm
│   │   ├── admin/                 # ApplicationActions (approve/reject instructor applications)
│   │   ├── courses/               # CourseCard, CourseGrid, CourseFilters, CourseContentEditor, VideoPlayer, VideoUpload, ImageUpload, LectureSidebar, MobileBottomBar, QuizPlayer, QuizBuilder, FavouriteButton, AddToCartButton, BuyNowButton, RatingSummary, ReviewForm, ReviewList, CourseReviewsSection, EditorSidebar, InstructorCourseList, RevenueChart, editor-sections/ (IntendedLearnersSection, LandingPageSection, PricingSection)
│   │   ├── layout/                # Header, Footer, MobileNav, UserMenu, CartDropdown, InstructorSidebar, InstructorProfileForm, InstructorProfileTabs
│   │   ├── shared/                # EmptyState, LoadingSpinner, PageLoader, StarRating, RichTextEditor, ArrayFieldEditor, EditableListField
│   │   └── ui/                    # 23 shadcn/ui components (Radix-based)
│   ├── hooks/                     # use-auth.ts, use-debounce.ts
│   ├── lib/
│   │   ├── auth.ts                # NextAuth config (Google, GitHub, Credentials)
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── stripe.ts              # Stripe helpers (checkout, fees, formatting)
│   │   ├── cloudinary.ts          # Cloudinary helpers (upload, delete, thumbnails)
│   │   ├── utils.ts               # cn() - Tailwind class merger
│   │   ├── constants.ts           # App constants (categories, filters, ITEMS_PER_PAGE)
│   │   ├── cart.ts                # Cart management helpers
│   │   ├── enrollment.ts          # Enrollment helpers
│   │   ├── favourites.ts          # Favourites helper (replaces wishlist in UI)
│   │   ├── reviews.ts             # Review helpers
│   │   ├── wishlist.ts            # Wishlist DB helper (legacy, backs favourites)
│   │   └── validations/           # Zod schemas: auth.ts, course.ts, user.ts
│   ├── providers/                 # AuthProvider, QueryProvider, composite Providers
│   ├── types/                     # TypeScript types (index.ts)
│   └── middleware.ts              # Route protection & role-based access control
├── public/                        # Static assets
├── package.json
├── tsconfig.json                  # Path alias: @/* -> ./src/*
├── next.config.ts                 # Image domains config
├── postcss.config.mjs             # Tailwind v4 via @tailwindcss/postcss
└── eslint.config.mjs              # ESLint v9 + Next.js + TypeScript
```

---

## Architecture

### Data Flow

```
Browser -> Next.js App Router -> Server Components (data fetching via Prisma)
                              -> API Routes (REST, auth-protected)
                              -> Server Actions (mutations)
                              -> Middleware (route protection)

External Services:
  Auth     -> NextAuth.js v5 (JWT sessions, Credentials + OAuth)
  Payments -> Stripe (Checkout Sessions, Webhooks at /api/webhooks/stripe)
  Media    -> Cloudinary (video/image upload, CDN delivery)
  Database -> PostgreSQL via Prisma ORM (Neon in production)
```

### Route Groups

| Group | Path Prefix | Layout | Auth Required |
|---|---|---|---|
| `(auth)` | `/login`, `/register`, `/forgot-password` | Centered fullscreen | No (redirects away if logged in) |
| `(browse)` | `/courses`, `/categories`, `/instructors`, `/search`, `/about`, `/become-instructor` | Default (Header + Footer) | No |
| `(student)` | `/my-courses`, `/cart`, `/favourites`, `/account`, `/account/purchases`, `/account/invoices`, `/certificates`, `/messages`, `/notifications` | Default | Yes (any role) |
| `(instructor)` | `/instructor/*` | Sidebar layout | Yes (INSTRUCTOR or ADMIN) |
| `(admin)` | `/admin/*` | Sidebar layout | Yes (ADMIN only) |

### API Routes

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/[...nextauth]` | ALL | - | NextAuth handler |
| `/api/auth/register` | POST | No | User registration (bcrypt) |
| `/api/categories` | GET | No | List categories |
| `/api/courses` | GET | No | List/search courses with filters |
| `/api/courses` | POST | Instructor/Admin | Create course |
| `/api/courses/[id]` | GET | No | Get course details |
| `/api/courses/[id]` | PUT | Instructor/Admin | Update course |
| `/api/courses/[id]` | DELETE | Instructor/Admin | Delete course |
| `/api/courses/[id]/sections` | POST | Instructor/Admin | Create section |
| `/api/courses/[id]/sections/reorder` | PUT | Instructor/Admin | Reorder sections (drag & drop) |
| `/api/courses/[id]/sections/[sectionId]` | PUT/DELETE | Instructor/Admin | Update or delete section |
| `/api/courses/[id]/sections/[sectionId]/lectures` | POST | Instructor/Admin | Create lecture |
| `/api/courses/[id]/sections/[sectionId]/lectures/reorder` | PUT | Instructor/Admin | Reorder lectures (drag & drop) |
| `/api/courses/[id]/sections/[sectionId]/lectures/[lectureId]` | PUT/DELETE | Instructor/Admin | Update or delete lecture |
| `/api/lectures/[lectureId]/progress` | POST | Yes | Update lecture progress (position, completion) |
| `/api/courses/[id]/reviews` | GET | No | List course reviews |
| `/api/courses/[id]/reviews` | POST | Yes | Create review |
| `/api/courses/[id]/reviews/[reviewId]` | PUT/DELETE | Yes | Update or delete review |
| `/api/enrollments` | GET/POST | Yes | List or create enrollments |
| `/api/cart` | GET/POST/DELETE | Yes | Cart management (list, add, remove) |
| `/api/favourites` | POST/DELETE | Yes | Add/remove course from favourites |
| `/api/checkout` | POST | Yes | Create Stripe checkout session |
| `/api/checkout/verify` | POST | Yes | Verify checkout session |
| `/api/webhooks/stripe` | POST | Stripe signature | Handle payment events |
| `/api/upload/signature` | POST | Yes | Get Cloudinary upload signature |
| `/api/certificates/generate` | POST | Yes | Generate completion certificate |
| `/api/certificates/[id]/download` | GET | Yes | Download certificate |
| `/api/invoices/[id]` | GET | Yes | Get invoice details |
| `/api/wishlist` | POST/DELETE | Yes | Legacy wishlist endpoint (use `/api/favourites` instead) |
| `/api/instructor-applications` | GET | Yes | Get current user's application status |
| `/api/instructor-applications` | POST | Student | Submit instructor application (headline + bio) |
| `/api/admin/instructor-applications` | GET | Admin | List all instructor applications |
| `/api/admin/instructor-applications/[id]` | PATCH | Admin | Approve or reject application (updates user role on approval) |
| `/api/become-instructor` | POST | Student | Promote logged-in student to instructor role |
| `/api/profile` | GET/PUT | Yes | Get or update user profile |
| `/api/profile/image` | POST | Yes | Upload profile image to Cloudinary |

### Database Models

Key models in `prisma/schema.prisma`:

- **User** - roles: STUDENT, INSTRUCTOR, ADMIN. Has Stripe fields, `onboardingData Json?` for instructor onboarding.
- **Course** - status: DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, ARCHIVED. Has pricing, stats, featured flags.
- **Category** - slug-based, with icon field.
- **Section** / **Lecture** - Course content hierarchy. Lectures have type: VIDEO, TEXT, QUIZ.
- **Enrollment** / **LectureProgress** - Student progress tracking per lecture.
- **Purchase** / **Earning** - Payment records with 70/30 split calculated.
- **Review** - 1-5 rating with approval workflow. One review per user per course (unique constraint). Supports instructor response.
- **CartItem** - Shopping cart items. One per user per course (unique constraint). Cleared after checkout.
- **InstructorApplication** - status: PENDING, APPROVED, REJECTED. Tracks headline, bio, admin review notes. On approval, user role changes to INSTRUCTOR.
- **Wishlist** - Backs the favourites feature. DB model is named `Wishlist` but UI uses "favourites" terminology.
- **Certificate**, **Resource** - Supporting features.
- **PlatformSettings** - Configurable platform fee (default 30%).
- **Enums** - `UserRole`, `CourseStatus`, `CourseLevel`, `LectureType`, `ApplicationStatus`, `PurchaseStatus`, `PayoutStatus`.

---

## Coding Conventions

### File & Naming

- **Path alias:** Always use `@/` imports (maps to `src/`). Example: `import { auth } from "@/lib/auth"`
- **Component files:** kebab-case (`course-card.tsx`, `login-form.tsx`)
- **Barrel exports:** Each component folder has an `index.ts` re-exporting all components
- **Pages:** `page.tsx` inside route folders per Next.js App Router convention
- **API routes:** `route.ts` inside `api/` folders

### Components

- **Server Components by default** - pages, layouts, and display components are server components
- **"use client" only when needed** - forms, interactive UI, hooks usage
- **shadcn/ui components** live in `src/components/ui/` - these are copy-paste Radix-based components, modify them directly
- **Custom components** go in `src/components/{domain}/` (auth, courses, layout, shared)
- **Props interfaces** defined inline above the component in the same file

### Styling

- **Tailwind CSS v4** - no tailwind.config file; configured via `@tailwindcss/postcss`
- **Class merging:** Always use `cn()` from `@/lib/utils` when combining conditional classes
- **Responsive:** Mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- **UI should closely mirror Udemy** - replicate Udemy's layout patterns, card designs, navigation, and overall UX

### Data & State

- **Server-side data fetching:** Async functions directly in server components using Prisma
- **Prisma Decimal conversion:** Always convert Prisma Decimal fields to Number: `const price = Number(course.price)`
- **Prisma serialization:** Use `JSON.parse(JSON.stringify(data))` when passing Prisma objects to client components (strips non-serializable types)
- **Client state:** Zustand for global client state, React Query for server state caching (staleTime: 60s)
- **Form state:** React Hook Form + Zod resolver for all forms

### Auth & Security

- **Auth check pattern:**
  ```typescript
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  ```
- **Session strategy:** JWT (not database sessions)
- **Password hashing:** bcryptjs
- **Route protection:** Middleware at `src/middleware.ts` handles redirects based on role

### Validation

- **Zod schemas** in `src/lib/validations/` for all input validation
- **API routes:** Use `schema.safeParse(body)` and return 400 with `error.issues` on failure
- **Forms:** Use `zodResolver(schema)` with React Hook Form

### Error Handling

- **API routes:** try/catch with `console.error()` and JSON error responses
- **Error format:** `{ error: "message", code: "ERROR_CODE" }`
- **Status codes:** 200, 201, 400, 401, 403, 404, 500
- **UI errors:** Error boundaries at `src/app/error.tsx` and `src/app/global-error.tsx`
- **Toast notifications:** Sonner for user-facing success/error messages

---

## Key Gotchas

1. **NextAuth v5 is beta** (`5.0.0-beta.30`) - API may differ from v4 docs. Auth config is in `src/lib/auth.ts`, NOT in an API route file.
2. **Tailwind CSS v4** uses `@tailwindcss/postcss` - there is NO `tailwind.config.ts`. Do not create one.
3. **Prisma Decimal fields** (price, averageRating, etc.) must be converted with `Number()` before rendering or comparing.
4. **Prisma objects are not serializable** - use `JSON.parse(JSON.stringify())` when passing to client components.
5. **Slug uniqueness** - when creating courses, generate slug with `slugify()` and append timestamp if duplicate exists.
6. **Image domains** must be allowlisted in `next.config.ts` under `images.remotePatterns`. Currently: unsplash, cloudinary, randomuser, google, github.
7. **Stripe webhooks** require raw body parsing - the webhook route at `/api/webhooks/stripe/route.ts` handles signature verification.
8. **Route groups** `(auth)`, `(browse)`, `(student)`, `(instructor)`, `(admin)` have their own layouts. The parentheses mean they don't affect the URL path.
9. **ITEMS_PER_PAGE** is `12` (defined in `src/lib/constants.ts`). Use this constant for all pagination.
10. **Cloudinary public IDs** are stored in `videoPublicId` on Lecture model for deletion/management.
11. **Lecture viewer** at `/my-courses/[courseId]/lectures/[lectureId]` uses a server page (`page.tsx`) that fetches data and passes serialized props to a client `LectureViewer` component. Progress is saved via `POST /api/lectures/[lectureId]/progress` which also recalculates enrollment percentage.
12. **Quiz data** is stored as JSON in `Lecture.content` using the `QuizData` type (version 1). The `QuizPlayer` component parses, renders, grades, and supports retries. Open-ended questions are not auto-graded.
13. **TipTap rich text editor** is used for course descriptions via `src/components/shared/rich-text-editor.tsx`. It uses `@tiptap/starter-kit` with placeholder extension. Output is HTML stored in the course `description` field.
14. **dnd-kit** is used for drag-and-drop reordering of sections and lectures in `CourseContentEditor`. Uses `@dnd-kit/core` + `@dnd-kit/sortable`. Reorder is persisted via dedicated `/reorder` API endpoints.
15. **Favourites** (renamed from Wishlist) uses `/api/favourites` and `src/lib/favourites.ts`. The `FavouriteButton` component handles optimistic UI toggling. The DB model is still named `Wishlist` but all UI and new code uses "favourites" terminology. Legacy `/api/wishlist` endpoint and `src/lib/wishlist.ts` still exist but are superseded.
16. **Become Instructor** has two paths (matching Udemy): (1) New users can register directly as instructor via a signup form on `/become-instructor` — the register API accepts an optional `role: "INSTRUCTOR"`. (2) Existing students click "Create Your Course" CTA on `/become-instructor` which calls `POST /api/become-instructor` to auto-promote STUDENT → INSTRUCTOR, then refreshes the session via `useSession().update()`. The old admin approval flow (`InstructorApplication` model, `/api/instructor-applications`) is still in the codebase for backward compatibility but is no longer the primary path.
17. **Shopping cart** uses `/api/cart` with `CartItem` model. `AddToCartButton` and `BuyNowButton` in course components. `CartDropdown` in the header provides a cart preview. Supports multi-course checkout via Stripe. Cart items are cleared after successful purchase. Cart page at `/cart` with `cart-grid.tsx`.
18. **Reviews** API at `/api/courses/[id]/reviews`. `CourseReviewsSection` combines `RatingSummary`, `ReviewForm`, and `ReviewList`. One review per user per course (enforced by `@@unique([userId, courseId])`). Reviews support instructor responses.
19. **Certificates auto-generate** on course completion when enrollment progress reaches 100%.
20. **ImageUpload** component (`src/components/courses/image-upload.tsx`) handles course thumbnail uploads to Cloudinary, separate from `VideoUpload` which handles lecture videos.
21. **Instructor Dashboard** uses a collapsible sidebar (`InstructorSidebar`) that expands on hover. Pages: Courses (list with search/sort via `InstructorCourseList`), Performance (Recharts `LineChart` with date range filter via `RevenueChart`), Tools (placeholder), Profile. Layout at `src/app/(instructor)/layout.tsx`.
22. **Course Editor** at `/instructor/courses/[id]` uses a left sidebar checklist (`EditorSidebar`) with sections: Plan (Intended Learners), Create (Curriculum), Publish (Landing Page, Pricing). Completion checkmarks are computed from course data. Editor section components live in `src/components/courses/editor-sections/`. Each section calls `onSaved` to invalidate the React Query cache after saving.
23. **Course Creation Wizard** at `/instructor/courses/new` is a 3-step overlay (title → category → time commitment). Uses `courseCreateSchema` (title + categoryId only) from `src/lib/validations/course.ts`. Creates a DRAFT course and redirects to the editor.
24. **Publish Flow** is currently simplified for testing: DRAFT → PUBLISHED directly via sidebar "Publish" button (with confirmation dialog warning about enrollment preventing deletion). No review step. Unpublish sets status back to DRAFT. Courses with enrollments cannot be deleted.
25. **LANGUAGES array** in `src/lib/constants.ts` must match the Prisma schema default (`@default("English")`). The Radix Select component requires `value={field.value || undefined}` (not `""`) to show the placeholder text.

---

## Rules for AI Agents

### ALWAYS

- Read relevant files before making changes - never guess at existing code
- Use `@/` path alias for all imports
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Use TypeScript with proper types - check `src/types/index.ts` for existing types
- Use Zod schemas from `src/lib/validations/` for input validation
- Convert Prisma Decimal fields to `Number()` before use
- Follow the existing component patterns (server by default, "use client" only when needed)
- Check `src/lib/constants.ts` before hardcoding values
- Use Sonner `toast` for user-facing notifications
- Use `auth()` from `@/lib/auth` for session checks in server code
- Validate role access: check `session.user.role` against `"STUDENT"`, `"INSTRUCTOR"`, `"ADMIN"`
- Match Udemy's UI patterns when building new pages or components
- Use shadcn/ui components from `src/components/ui/` for standard UI elements
- Use React Hook Form + Zod for any new forms
- Place new pages in the correct route group based on auth requirements
- Use `prisma` from `@/lib/prisma` (singleton) for all database operations

### NEVER

- Create a `tailwind.config.ts` file - Tailwind v4 is configured via PostCSS
- Use NextAuth v4 patterns - this project uses v5 beta (import from `@/lib/auth`, not from `next-auth`)
- Skip `JSON.parse(JSON.stringify())` when passing Prisma data to client components
- Hardcode pagination values - use `ITEMS_PER_PAGE` from constants
- Install alternative UI libraries - use existing shadcn/ui + Radix components
- Add `"use client"` to components that don't need interactivity
- Modify `src/components/ui/` files unless specifically updating shadcn components
- Commit `.env` files or hardcode secrets
- Use database sessions - this project uses JWT strategy
- Skip role checks on protected API routes or server actions
- Use `fetch()` for internal API calls in server components - use Prisma directly instead

---

## Documentation

Full project documentation is in the `docs/` folder (MkDocs format):

- `docs/index.md` - Project overview, routes, env vars, test accounts
- `docs/architecture/tech-stack.md` - Full tech stack details
- `docs/architecture/api.md` - API reference with request/response examples
- `docs/architecture/database.md` - Database schema with Prisma models
- `docs/getting-started/installation.md` - Setup guide
- `docs/getting-started/configuration.md` - Environment variable reference
- `docs/getting-started/quick-start.md` - Quick start + available scripts
- `docs/features/overview.md` - Feature overview with architecture diagram
- `docs/features/students.md` - Student features
- `docs/features/instructors.md` - Instructor features
- `docs/features/administrators.md` - Admin features
- `docs/contributing.md` - Contributing guidelines and code style
- `docs/deployment/` - Vercel, Docker, Railway deployment guides
