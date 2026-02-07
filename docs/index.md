# Welcome to Learnify Childcare

<div align="center">

  **Corporate E-Learning Platform for Early Childhood Educators in Singapore**

  <p><strong>Live Demo:</strong> <a href="https://learnify-corporate-training-platform.netlify.app">https://learnify-corporate-training-platform.netlify.app</a></p>

  <p>
    <a href="https://github.com/alfredang/learnify-childcare"><img src="https://img.shields.io/badge/GitHub-Repository-181717?logo=github" alt="GitHub"></a>
    <a href="https://learnify-corporate-training-platform.netlify.app"><img src="https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify" alt="Netlify"></a>
  </p>
</div>

**Learnify Childcare** is a corporate e-learning platform purpose-built for early childhood education centres in Singapore. It enables childcare organisations to assign, track, and manage professional development courses for their staff, with built-in CPD (Continuing Professional Development) points tracking, SCORM-compatible progress, and optional Stripe billing.

## Key Features

<div class="grid cards" markdown>

-   :material-account-school:{ .lg .middle } **For Learners**

    ---

    Childcare workers complete assigned courses, track CPD points, and earn certificates.

    - View assigned courses with deadlines
    - Track learning progress with SCORM support
    - Earn CPD points upon completion
    - Download completion certificates
    - Resume courses from where you left off
    - View personal dashboard with upcoming deadlines

-   :material-domain:{ .lg .middle } **For Corporate Admins**

    ---

    Centre managers assign courses to staff, monitor progress, and manage their organisation.

    - Assign courses to learners with deadlines
    - Monitor learner progress across the organisation
    - Manage learner accounts within the centre
    - View organisation-level completion reports
    - Optional Stripe billing per assignment (SGD 60)
    - Track assignment statuses (Assigned, In Progress, Completed, Overdue)

-   :material-shield-account:{ .lg .middle } **For Super Admins**

    ---

    Platform administrators manage courses, organisations, and users across the system.

    - Create and publish courses with CPD points
    - Manage organisations (childcare centres)
    - Manage all users and role assignments
    - Configure course content (sections, lectures, quizzes)
    - Platform-wide reporting and oversight

</div>

## Course Categories

All courses are tailored for the early childhood education sector in Singapore:

| Category | Description |
|----------|-------------|
| **Child Development** | Understanding developmental milestones and learning stages |
| **Health & Safety** | CPR, first aid, workplace safety, infection control |
| **Nutrition & Wellness** | Meal planning, dietary needs, health promotion |
| **Curriculum Planning** | Lesson planning, activity design, ECDA frameworks |
| **Special Needs** | Inclusive education, early intervention strategies |
| **Parent Communication** | Effective communication, parent engagement, reporting |
| **Regulatory Compliance** | ECDA licensing, child protection, legal requirements |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router and Server Components |
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first CSS |
| **Prisma 5** | Type-safe ORM for PostgreSQL |
| **PostgreSQL (Neon)** | Relational database |
| **NextAuth.js v5** | Authentication (Credentials + OAuth) |
| **Stripe** | Optional payment processing for course assignments |
| **Cloudinary** | Video and image upload and CDN |
| **shadcn/ui** | Radix-based UI component library |
| **React Hook Form + Zod** | Form management and validation |
| **TanStack React Query** | Server state and data fetching |

## Application Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | User login |
| `/register` | New user registration |
| `/forgot-password` | Password recovery |

### Learner Routes (Authenticated)

| Route | Description |
|-------|-------------|
| `/dashboard` | Learner dashboard with assigned courses and deadlines |
| `/my-courses` | All enrolled/assigned courses |
| `/my-courses/[courseId]` | Course overview |
| `/my-courses/[courseId]/lectures/[lectureId]` | Lecture viewer (video, text, quiz) |
| `/certificates` | Earned completion certificates |
| `/account` | Account settings |

### Corporate Admin Routes (Authenticated)

| Route | Description |
|-------|-------------|
| `/corporate` | Organisation dashboard with stats |
| `/corporate/learners` | Manage learners in the organisation |
| `/corporate/assign` | Assign courses to learners |
| `/corporate/progress` | Monitor learner progress |

### Super Admin Routes (Authenticated)

| Route | Description |
|-------|-------------|
| `/admin` | Platform dashboard |
| `/admin/courses` | Course management (create, edit, publish) |
| `/admin/organizations` | Organisation management |
| `/admin/users` | User management |

## Test Accounts

After seeding the database, use these accounts to explore the platform:

| Role | Email | Password | Organisation |
|------|-------|----------|--------------|
| Super Admin | `admin@learnify.sg` | `password123` | -- |
| Corporate Admin | `manager@sunshine.sg` | `password123` | Sunshine Childcare |
| Corporate Admin | `admin@littleexplorers.sg` | `password123` | Little Explorers |
| Learner | `sarah@sunshine.sg` | `password123` | Sunshine Childcare |
| Learner | `priya@sunshine.sg` | `password123` | Sunshine Childcare |
| Learner | `zhang@littleexplorers.sg` | `password123` | Little Explorers |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/alfredang/learnify-childcare.git
cd learnify-childcare

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (DATABASE_URL, AUTH_SECRET, etc.)

# Set up database
npx prisma generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
AUTH_SECRET="your-secret"
AUTH_URL="http://localhost:3000"

# Stripe (optional - only needed for billing-enabled organisations)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project Structure

```
learnify-childcare/
├── prisma/
│   ├── schema.prisma        # Database schema (all models, enums, relations)
│   └── seed.ts              # Seed script with sample data
├── docs/                    # Project documentation
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Auth pages: login, register, forgot-password
│   │   ├── (learner)/       # Learner pages: dashboard, my-courses, certificates, account
│   │   ├── (corporate)/     # Corporate admin pages: dashboard, learners, assign, progress
│   │   ├── (admin)/         # Super admin pages: dashboard, courses, organizations, users
│   │   └── api/             # REST API endpoints
│   ├── components/          # React components (auth, courses, layout, shared, ui)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, auth config, Prisma client, validations
│   ├── providers/           # Context providers (Auth, Query, Theme)
│   ├── types/               # TypeScript type definitions
│   └── middleware.ts        # Route protection and role-based access control
├── public/                  # Static assets
└── package.json
```

## Database Models

| Model | Description |
|-------|-------------|
| **User** | Users with roles (LEARNER, CORPORATE_ADMIN, SUPER_ADMIN) and organisation membership |
| **Organization** | Childcare centres with license numbers, billing settings, and learner limits |
| **Course** | Training courses with CPD points, SCORM version, and SGD pricing |
| **Category** | Course categories (Child Development, Health & Safety, etc.) |
| **Section** | Course sections/modules |
| **Lecture** | Lectures (VIDEO, TEXT, QUIZ types) |
| **CourseAssignment** | Corporate admin assigns courses to learners with deadlines |
| **Enrollment** | Learner enrollment with SCORM progress tracking |
| **LectureProgress** | Per-lecture progress with SCORM session data |
| **Certificate** | Completion certificates with CPD points and expiry dates |

## Deployment

The application is deployed on **Netlify**:

- **Live URL:** [learnify-corporate-training-platform.netlify.app](https://learnify-corporate-training-platform.netlify.app)
- **Database:** Neon PostgreSQL
- **Media:** Cloudinary CDN
- **Payments:** Stripe (optional per-organisation)

## Support

- [Live Demo](https://learnify-corporate-training-platform.netlify.app) - Try the platform
- [GitHub Repository](https://github.com/alfredang/learnify-childcare) - Source code
- [GitHub Issues](https://github.com/alfredang/learnify-childcare/issues) - Report bugs

---

Made with care by [Alfred Ang](https://github.com/alfredang)
