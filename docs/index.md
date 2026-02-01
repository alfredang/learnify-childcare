# Welcome to Learnify

<div align="center">
  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" alt="Learnify Platform" style="border-radius: 10px; margin: 20px 0;" />

  <p><strong>🚀 Live Demo:</strong> <a href="https://learnify-corporate-training-platform.netlify.app">https://learnify-corporate-training-platform.netlify.app</a></p>

  <p>
    <a href="https://github.com/alfredang/Learnify"><img src="https://img.shields.io/badge/GitHub-Repository-181717?logo=github" alt="GitHub"></a>
    <a href="https://learnify-corporate-training-platform.netlify.app"><img src="https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify" alt="Netlify"></a>
  </p>
</div>

**Learnify** is a modern, full-featured online learning marketplace where instructors create courses and students learn. Built with cutting-edge technologies for optimal performance and developer experience.

## Live Demo Links

| Page | Description |
|------|-------------|
| [🏠 Homepage](https://learnify-corporate-training-platform.netlify.app/) | Landing page with featured courses |
| [📚 All Courses](https://learnify-corporate-training-platform.netlify.app/courses) | Browse published courses |
| [📂 Categories](https://learnify-corporate-training-platform.netlify.app/categories) | Browse course categories |
| [🔍 Search](https://learnify-corporate-training-platform.netlify.app/search) | Search for courses |
| [ℹ️ About](https://learnify-corporate-training-platform.netlify.app/about) | About the platform |
| [👨‍🏫 Become Instructor](https://learnify-corporate-training-platform.netlify.app/become-instructor) | Instructor signup |
| [🔐 Login](https://learnify-corporate-training-platform.netlify.app/login) | User login |
| [📝 Register](https://learnify-corporate-training-platform.netlify.app/register) | New user signup |

## Key Features

<div class="grid cards" markdown>

-   :material-account-school:{ .lg .middle } **For Students**

    ---

    Browse courses, track progress, earn certificates, and manage your learning journey.

    - 🔍 Browse & search courses with filters
    - 📚 Enroll in free or paid courses
    - 📊 Track learning progress
    - 🎥 Watch video lectures
    - ⭐ Leave reviews and ratings
    - 📜 Earn completion certificates

-   :material-teach:{ .lg .middle } **For Instructors**

    ---

    Create courses, upload videos, set pricing, and monitor student engagement.

    - 📝 Create multimedia courses
    - 🎬 Upload videos via Cloudinary
    - 💰 Set flexible pricing
    - 📈 Analytics dashboard
    - 💵 Track earnings (70% revenue)
    - 📊 Monitor engagement

-   :material-shield-account:{ .lg .middle } **For Administrators**

    ---

    Manage users, approve courses, track revenue, and oversee the platform.

    - 👥 User management
    - ✅ Course approval workflow
    - 📂 Category management
    - 💳 Revenue tracking
    - ⚙️ Platform settings

</div>

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first CSS |
| **Prisma** | Type-safe ORM |
| **PostgreSQL (Neon)** | Relational database |
| **NextAuth.js v5** | Authentication |
| **Stripe** | Payment processing |
| **Cloudinary** | Media storage |
| **shadcn/ui** | UI components |

## Application Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured courses |
| `/courses` | Browse all courses |
| `/courses/[slug]` | Course details page |
| `/categories` | All categories |
| `/categories/[slug]` | Category courses |
| `/search` | Search courses |
| `/about` | About page |
| `/become-instructor` | Instructor info |
| `/login` | Login page |
| `/register` | Registration |

### Protected Routes

| Route | Role | Description |
|-------|------|-------------|
| `/my-courses` | Student | Enrolled courses |
| `/my-courses/[id]` | Student | Course player |
| `/instructor` | Instructor | Dashboard |
| `/instructor/courses` | Instructor | Manage courses |
| `/instructor/courses/new` | Instructor | Create course |
| `/admin` | Admin | Admin dashboard |
| `/admin/users` | Admin | User management |
| `/admin/courses` | Admin | Course management |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | ALL | Authentication |
| `/api/auth/register` | POST | User registration |
| `/api/courses` | GET | List courses |
| `/api/courses` | POST | Create course |
| `/api/categories` | GET | List categories |
| `/api/checkout` | POST | Create checkout |
| `/api/webhooks/stripe` | POST | Stripe webhooks |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/alfredang/Learnify.git
cd Learnify

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

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
AUTH_SECRET="your-secret"
AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Test Accounts

After seeding the database, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@learnify.com` | `password123` |
| 👨‍🏫 Instructor | `john@learnify.com` | `password123` |
| 👨‍🏫 Instructor | `sarah@learnify.com` | `password123` |
| 👨‍🎓 Student | `student1@example.com` | `password123` |

## Database Models

| Model | Description |
|-------|-------------|
| **User** | Users with roles (STUDENT, INSTRUCTOR, ADMIN) |
| **Course** | Courses with title, description, price |
| **Category** | Course categories |
| **Section** | Course sections/modules |
| **Lecture** | Video lectures |
| **Enrollment** | Student enrollments |
| **Review** | Course reviews |
| **Purchase** | Payment records |
| **Certificate** | Completion certificates |
| **Wishlist** | Saved courses |

## Project Structure

```
learnify/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── docs/                # Documentation
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # Auth pages
│   │   ├── (browse)/    # Public pages
│   │   ├── (student)/   # Student pages
│   │   ├── (instructor)/ # Instructor pages
│   │   ├── (admin)/     # Admin pages
│   │   └── api/         # API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   └── middleware.ts    # Route protection
└── package.json
```

## Deployment

The application is deployed on **Netlify**:

- **Live URL:** [learnify-corporate-training-platform.netlify.app](https://learnify-corporate-training-platform.netlify.app)
- **Database:** Neon PostgreSQL
- **Media:** Cloudinary
- **Payments:** Stripe

## Support

- [Live Demo](https://learnify-corporate-training-platform.netlify.app) - Try the platform
- [GitHub Repository](https://github.com/alfredang/Learnify) - Source code
- [GitHub Issues](https://github.com/alfredang/Learnify/issues) - Report bugs

---

Made with :heart: by [Alfred Ang](https://github.com/alfredang)
