# Quick Start

Get Learnify Childcare running in under 5 minutes with this quick start guide.

## TL;DR

```bash
git clone https://github.com/alfredang/learnify-childcare.git
cd learnify-childcare
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and AUTH_SECRET
npx prisma generate && npm run db:push && npm run db:seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and log in with one of the test accounts below.

## Test Accounts

After seeding, you can log in with these accounts to explore each role:

| Role | Email | Password | Organisation |
|------|-------|----------|--------------|
| :material-shield-account: Super Admin | `admin@learnify.sg` | `password123` | -- |
| :material-domain: Corporate Admin | `manager@sunshine.sg` | `password123` | Sunshine Childcare |
| :material-domain: Corporate Admin | `admin@littleexplorers.sg` | `password123` | Little Explorers |
| :material-account-school: Learner | `sarah@sunshine.sg` | `password123` | Sunshine Childcare |
| :material-account-school: Learner | `priya@sunshine.sg` | `password123` | Sunshine Childcare |
| :material-account-school: Learner | `zhang@littleexplorers.sg` | `password123` | Little Explorers |

## Exploring the Platform

### As a Learner

1. Log in with `sarah@sunshine.sg`
2. View your personalised dashboard at `/dashboard` -- see assigned courses and upcoming deadlines
3. Go to `/my-courses` to see all your enrolled/assigned courses
4. Click into a course to view its overview, sections, and learning outcomes
5. Start a lecture to experience the video player, text content, or quiz
6. Track your progress as you complete lectures
7. View earned certificates at `/certificates`
8. Update your profile at `/account`

### As a Corporate Admin

1. Log in with `manager@sunshine.sg`
2. View the organisation dashboard at `/corporate` -- see learner count, active assignments, and completion rates
3. Go to `/corporate/learners` to see all learners at Sunshine Childcare
4. Navigate to `/corporate/assign` to assign a course to a learner with an optional deadline
5. Check `/corporate/progress` to monitor how learners are progressing through their assigned courses
6. Filter assignments by status (Assigned, In Progress, Completed, Overdue)

### As a Super Admin

1. Log in with `admin@learnify.sg`
2. Access the admin dashboard at `/admin` for a platform-wide overview
3. Go to `/admin/courses` to view, create, and manage training courses
4. Create a new course: enter a title, select a category (e.g., "Health & Safety"), then use the editor to add sections, lectures, CPD points, and learning outcomes
5. Publish the course to make it available for corporate admins to assign
6. Go to `/admin/organizations` to view and manage childcare centres
7. Go to `/admin/users` to manage user accounts, roles, and organisation membership

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at localhost:3000 |
| `npm run build` | Build for production (`prisma generate && next build`) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample organisations, users, courses, and assignments |
| `npm run db:studio` | Open Prisma Studio (browser-based database GUI) |

## Sample Seed Data

The seed script (`prisma/seed.ts`) creates:

- **2 organisations:** Sunshine Childcare Centre and Little Explorers Centre
- **6 users:** 1 Super Admin, 2 Corporate Admins (one per org), 3 Learners (across both orgs)
- **7 categories:** Child Development, Health & Safety, Nutrition & Wellness, Curriculum Planning, Special Needs, Parent Communication, Regulatory Compliance
- **Sample courses:** Published courses across categories with sections, lectures, and CPD points
- **Sample assignments:** Course assignments with various statuses and deadlines
- **Sample enrollments:** Learner progress data at various completion stages
- **Sample certificates:** Completion certificates with CPD points

## What's Next?

- [Configure environment variables](configuration.md) for full functionality (Stripe, Cloudinary, OAuth)
- [Learn about features](../features/overview.md) -- detailed role-based feature documentation
- [Review the API reference](../architecture/api.md) -- REST endpoints and request/response examples
- [Understand the database schema](../architecture/database.md) -- all models, enums, and relationships
- [Deploy to production](../deployment/vercel.md) -- deployment guides for Vercel, Railway, and Docker
