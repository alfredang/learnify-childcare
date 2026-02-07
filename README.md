<div align="center">

# Learnify Childcare

### Corporate E-Learning Platform for Early Childhood Educators

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-Auth-000000?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Live Demo](https://learnify-corporate-training-platform.netlify.app) | [Documentation](https://alfredang.github.io/learnify-childcare/) | [Getting Started](#-quick-start)

---

*A multi-tenant corporate training platform for Singapore childcare organisations. Centres assign ECDA-aligned courses to educators, track SCORM-compatible progress, and earn CPD points.*

</div>

---

## Overview

Learnify Childcare is a purpose-built e-learning platform for the early childhood education sector in Singapore. Childcare organisations register on the platform, invite their educators as learners, and assign professional development courses with deadlines and CPD (Continuing Professional Development) points.

### Who is it for?

| Role | What they do |
|------|-------------|
| **Super Admin** | Manages the platform: creates courses, manages organisations and users |
| **Corporate Admin** | Manages their organisation: invites learners, assigns courses, tracks progress |
| **Learner** | Completes assigned courses: watches videos, reads materials, takes quizzes, earns certificates |

---

## Features

<table>
<tr>
<td width="50%">

### For Learners
- View assigned courses with deadlines and CPD points
- Watch video lectures with progress tracking
- Read text-based learning materials
- Take quizzes with instant feedback
- Track completion progress per course
- Earn certificates with CPD points on completion
- SCORM-compatible progress tracking

</td>
<td width="50%">

### For Corporate Admins
- Dashboard with organisation stats and completion rates
- Invite and manage learners
- Assign courses with deadlines
- Track learner progress across all assignments
- View overdue and completed assignments
- Organisation-scoped data isolation

</td>
</tr>
<tr>
<td colspan="2">

### For Super Admins
- Create and manage courses (video, text, quiz content)
- Manage organisations and their settings
- Manage all platform users
- Platform-wide analytics and stats
- Course content editor with drag-and-drop reordering

</td>
</tr>
</table>

---

## Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
<br>Next.js 16
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
<br>React 19
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=typescript" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br>Tailwind CSS 4
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=prisma" width="48" height="48" alt="Prisma" />
<br>Prisma
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
<br>PostgreSQL
</td>
</tr>
<tr>
<td align="center" width="96">
<img src="https://avatars.githubusercontent.com/u/139895814?s=200&v=4" width="48" height="48" alt="shadcn/ui" />
<br>shadcn/ui
</td>
<td align="center" width="96">
<img src="https://authjs.dev/img/logo-sm.png" width="48" height="48" alt="NextAuth" />
<br>NextAuth.js v5
</td>
<td align="center" width="96">
<img src="https://res.cloudinary.com/cloudinary-marketing/image/upload/v1599098500/creative_source/Logo/Cloud%20Glyph/cloudinary_cloud_glyph_blue_png.png" width="48" height="48" alt="Cloudinary" />
<br>Cloudinary
</td>
<td align="center" width="96">
<img src="https://neon.tech/favicon/favicon.svg" width="48" height="48" alt="Neon" />
<br>Neon DB
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=vercel" width="48" height="48" alt="Vercel" />
<br>Vercel
</td>
<td align="center" width="96">
</td>
</tr>
</table>

### Key Libraries

| Library | Purpose |
|---------|---------|
| `react-hook-form` + `zod` | Form management with schema validation |
| `@tanstack/react-query` | Server state management |
| `@tiptap/react` | Rich text editor for course descriptions |
| `@dnd-kit` | Drag and drop for section/lecture reordering |
| `sonner` | Toast notifications |
| `lucide-react` | Icon library |
| `bcryptjs` | Password hashing |

---

## Application Routes

### Learner Routes (Protected)
| Route | Description |
|-------|-------------|
| `/dashboard` | Assigned courses, deadlines, CPD summary |
| `/my-courses` | All enrolled courses with progress |
| `/my-courses/[courseId]` | Course overview with sections |
| `/my-courses/[courseId]/lectures/[lectureId]` | Lecture viewer (video/text/quiz) |
| `/certificates` | Earned completion certificates |
| `/account` | Profile and account settings |

### Corporate Admin Routes (Protected)
| Route | Description |
|-------|-------------|
| `/corporate` | Organisation dashboard with stats |
| `/corporate/learners` | Manage and invite learners |
| `/corporate/assign` | Assign courses to learners |
| `/corporate/progress` | Learner progress reports |

### Super Admin Routes (Protected)
| Route | Description |
|-------|-------------|
| `/admin` | Platform-wide dashboard |
| `/admin/courses` | Manage all courses |
| `/admin/organizations` | Manage organisations |
| `/admin/users` | Manage all users |

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page (redirects to dashboard if logged in) |
| `/login` | User login |
| `/register` | User registration |

---

## Database Schema

```mermaid
erDiagram
    Organization ||--o{ User : has
    Organization ||--o{ CourseAssignment : has
    User ||--o{ Enrollment : has
    User ||--o{ CourseAssignment : "assigned to"
    User ||--o{ CourseAssignment : "assigned by"
    User ||--o{ Course : creates
    User ||--o{ Certificate : earns
    Course ||--o{ Section : contains
    Course ||--o{ Enrollment : has
    Course ||--o{ CourseAssignment : has
    Course }o--|| Category : belongs_to
    Section ||--o{ Lecture : contains
    Enrollment ||--o{ LectureProgress : tracks
```

### Key Models

| Model | Description |
|-------|-------------|
| **User** | Roles: LEARNER, CORPORATE_ADMIN, SUPER_ADMIN |
| **Organization** | Multi-tenant childcare centres with ECDA license |
| **Course** | Platform-managed courses with CPD points and SCORM tracking |
| **CourseAssignment** | Links learners to courses with deadlines and status |
| **Enrollment** | Tracks progress with SCORM-compatible fields |
| **LectureProgress** | Per-lecture completion with SCORM session data |
| **Certificate** | Completion certificates with CPD points |
| **Category** | 7 childcare-specific categories |

---

## Quick Start

### Prerequisites

- **Node.js** 20.0 or higher
- **PostgreSQL** database ([Neon](https://neon.tech) recommended)
- **Cloudinary** account for media uploads

### Installation

```bash
# Clone the repository
git clone https://github.com/alfredang/learnify-childcare.git
cd learnify-childcare

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# OAuth (optional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe (optional - for billing-enabled organisations)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Test Accounts

After seeding, use these accounts:

| Role | Email | Password | Organisation |
|------|-------|----------|-------------|
| Super Admin | `admin@learnify.sg` | `password123` | - |
| Corporate Admin | `manager@sunshine.sg` | `password123` | Sunshine Childcare |
| Corporate Admin | `admin@littleexplorers.sg` | `password123` | Little Explorers |
| Learner | `sarah@sunshine.sg` | `password123` | Sunshine Childcare |
| Learner | `priya@sunshine.sg` | `password123` | Sunshine Childcare |
| Learner | `zhang@littleexplorers.sg` | `password123` | Little Explorers |

---

## Project Structure

```
learnify-childcare/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed data (childcare courses)
├── src/
│   ├── app/
│   │   ├── (auth)/                # Login, register, forgot-password
│   │   ├── (learner)/             # Learner pages
│   │   │   ├── dashboard/         # Assigned courses & deadlines
│   │   │   ├── my-courses/        # Course viewer & lecture player
│   │   │   ├── certificates/      # Earned certificates
│   │   │   └── account/           # Profile settings
│   │   ├── (corporate)/           # Corporate admin pages
│   │   │   └── corporate/
│   │   │       ├── learners/      # Manage learners
│   │   │       ├── assign/        # Assign courses
│   │   │       └── progress/      # Progress reports
│   │   ├── (admin)/               # Super admin pages
│   │   │   └── admin/
│   │   │       ├── courses/       # Course management
│   │   │       ├── organizations/ # Organisation management
│   │   │       └── users/         # User management
│   │   └── api/                   # REST API routes
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/                # Header, Footer, Navigation
│   │   ├── courses/               # Course cards, editor, players
│   │   └── shared/                # Shared components
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth v5 config
│   │   ├── scorm.ts               # SCORM tracking utilities
│   │   ├── cloudinary.ts          # Cloudinary helpers
│   │   ├── stripe.ts              # Optional Stripe billing
│   │   ├── constants.ts           # App constants & categories
│   │   └── validations/           # Zod schemas
│   ├── hooks/                     # Custom React hooks
│   ├── providers/                 # Context providers
│   ├── types/                     # TypeScript types
│   └── middleware.ts              # Route protection & role checks
└── package.json
```

---

## Seed Data

The platform comes pre-seeded with realistic childcare training data:

### Organisations (3)
| Name | License | Learners |
|------|---------|----------|
| Sunshine Childcare Centre | SCC-2024-001 | Sarah Ong, Priya Nair |
| Little Explorers Academy | LEA-2024-002 | Zhang Li |
| Bright Beginnings Preschool | BBP-2024-003 | - |

### Courses (8)
| Course | Category | CPD Points | Hours |
|--------|----------|-----------|-------|
| CPR & First Aid for Childcare Workers | Health & Safety | 3 | 2.5 |
| Child Development Milestones: 0-6 Years | Child Development | 4 | 3.0 |
| Early Literacy Strategies | Curriculum Planning | 3 | 2.0 |
| Nutrition & Meal Planning for Children | Nutrition & Wellness | 2 | 2.0 |
| Managing Challenging Behaviours | Special Needs | 3 | 2.5 |
| Effective Parent-Teacher Communication | Parent Communication | 2 | 2.0 |
| ECDA Licensing Requirements & Compliance | Regulatory Compliance | 4 | 3.0 |
| Inclusive Education in Early Childhood | Special Needs | 3 | 2.5 |

Each course contains 3 sections with 3 lectures each (mix of video, text, and quiz content).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/[...nextauth]` | ALL | - | NextAuth handler |
| `/api/auth/register` | POST | No | User registration |
| `/api/courses` | GET/POST | Yes | List/create courses |
| `/api/courses/[id]` | GET/PUT/DELETE | Yes | Course CRUD |
| `/api/courses/[id]/sections` | POST | Admin | Create section |
| `/api/courses/[id]/sections/[sectionId]/lectures` | POST | Admin | Create lecture |
| `/api/organizations` | GET/POST | Admin | Organisation management |
| `/api/organizations/[id]/learners` | GET/POST | Corp Admin | Learner management |
| `/api/assignments` | GET/POST | Corp Admin | Course assignments |
| `/api/lectures/[lectureId]/progress` | POST | Learner | Update progress (SCORM) |
| `/api/certificates/generate` | POST | Learner | Generate certificate |
| `/api/certificates/[id]/download` | GET | Learner | Download certificate PDF |
| `/api/profile` | GET/PUT | Yes | User profile |
| `/api/upload/signature` | GET | Admin | Cloudinary upload signature |

---

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alfredang/learnify-childcare)

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret key |
| `AUTH_URL` | Production URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (public) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |
| `NEXT_PUBLIC_APP_URL` | Production URL |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with care by [Alfred Ang](https://github.com/alfredang)

</div>
