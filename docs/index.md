# Welcome to Learnify

<div align="center">
  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" alt="Learnify Platform" style="border-radius: 10px; margin: 20px 0;" />
</div>

**Learnify** is a modern, full-featured online learning marketplace where instructors create courses and students learn. Built with cutting-edge technologies for optimal performance and developer experience.

## Key Features

<div class="grid cards" markdown>

-   :material-account-school:{ .lg .middle } **For Students**

    ---

    Browse courses, track progress, earn certificates, and manage your learning journey.

    [:octicons-arrow-right-24: Student Features](features/students.md)

-   :material-teach:{ .lg .middle } **For Instructors**

    ---

    Create courses, upload videos, set pricing, and monitor student engagement.

    [:octicons-arrow-right-24: Instructor Features](features/instructors.md)

-   :material-shield-account:{ .lg .middle } **For Administrators**

    ---

    Manage users, approve courses, track revenue, and oversee the platform.

    [:octicons-arrow-right-24: Admin Features](features/administrators.md)

</div>

## Quick Start

```bash
# Clone the repository
git clone https://github.com/alfredang/Learnify.git
cd Learnify

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Set up database
npx prisma generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Prisma** | Type-safe ORM |
| **PostgreSQL** | Relational database |
| **NextAuth.js** | Authentication |
| **Stripe** | Payment processing |
| **Cloudinary** | Media storage |

## Test Accounts

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@learnify.com` | `password123` |
| Instructor | `john@learnify.com` | `password123` |
| Student | `student1@example.com` | `password123` |

## Support

- [GitHub Issues](https://github.com/alfredang/Learnify/issues) - Report bugs or request features
- [Documentation](https://alfredang.github.io/Learnify/) - Full documentation

---

Made with :heart: by [Alfred Ang](https://github.com/alfredang)
