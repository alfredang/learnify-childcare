# Quick Start

Get Learnify running in under 5 minutes with this quick start guide.

## TL;DR

```bash
git clone https://github.com/alfredang/Learnify.git
cd Learnify
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma generate && npm run db:push && npm run db:seed
npm run dev
```

## Test Accounts

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| :material-shield-account: Admin | `admin@learnify.com` | `password123` |
| :material-teach: Instructor | `john@learnify.com` | `password123` |
| :material-account-school: Student | `student1@example.com` | `password123` |

## Exploring the Platform

### As a Student

1. Log in with `student1@example.com`
2. Browse courses at `/courses`
3. View your enrolled courses at `/my-courses`
4. Watch lectures and track progress

### As an Instructor

1. Log in with `john@learnify.com`
2. Go to Instructor Dashboard at `/instructor`
3. Create a new course via the 3-step wizard at `/instructor/courses/new`
4. Use the sidebar checklist editor to fill in details (intended learners, curriculum, landing page, pricing)
5. Click **Publish** in the editor sidebar
6. View performance analytics at `/instructor/performance`
7. Manage your profile at `/instructor/profile`

### As an Admin

1. Log in with `admin@learnify.com`
2. Access Admin Panel at `/admin`
3. Manage users and roles
4. Approve/reject courses
5. View platform analytics

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## What's Next?

- [Configure environment variables](configuration.md) for full functionality
- [Learn about features](../features/overview.md)
- [Deploy to production](../deployment/vercel.md)
