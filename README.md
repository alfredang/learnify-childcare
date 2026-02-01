<div align="center">

# 🎓 Learnify

### Modern Online Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-Auth-000000?style=for-the-badge&logo=auth0&logoColor=white)](https://authjs.dev/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)
[![Netlify Status](https://api.netlify.com/api/v1/badges/learnify-corporate-training-platform/deploy-status)](https://app.netlify.com/sites/learnify-corporate-training-platform/deploys)

[📖 Documentation](https://alfredang.github.io/Learnify/) • [🚀 Live Demo](https://learnify-corporate-training-platform.netlify.app) • [💻 Getting Started](#-quick-start) • [🤝 Contributing](#-contributing)

---

<img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" alt="Learnify Platform" width="600" style="border-radius: 10px; margin: 20px 0;" />

*A full-featured online learning marketplace where instructors create courses and students learn.*

</div>

---

## 🚀 Live Demo

**[https://learnify-corporate-training-platform.netlify.app](https://learnify-corporate-training-platform.netlify.app)**

> Try it out with the test accounts listed below!

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👨‍🎓 For Students
- 🔍 Browse & search courses with smart filters
- 📚 Enroll in free or paid courses
- 📊 Track learning progress
- 🎥 Watch video lectures seamlessly
- ⭐ Leave reviews and ratings
- 💝 Manage wishlist
- 📜 Earn completion certificates

</td>
<td width="50%">

### 👨‍🏫 For Instructors
- 📝 Create rich multimedia courses
- 🎬 Upload videos via Cloudinary
- 💰 Set flexible pricing
- 📈 Analytics dashboard
- 💵 Track earnings & payouts
- 📊 Monitor student engagement

</td>
</tr>
<tr>
<td colspan="2">

### 🔐 For Administrators
- 📊 Platform-wide analytics & metrics
- 👥 User management & role control
- ✅ Course approval workflow
- 📂 Category management
- 💳 Revenue & payout tracking

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=nextjs" width="48" height="48" alt="Next.js" />
<br>Next.js 15
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=typescript" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" width="96">
<img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
<br>Tailwind CSS
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
<br>NextAuth.js
</td>
<td align="center" width="96">
<img src="https://assets.vercel.com/image/upload/v1662130559/front/favicon/vercel/180x180.png" width="48" height="48" alt="Vercel" />
<br>Vercel
</td>
<td align="center" width="96">
<img src="https://cdn.worldvectorlogo.com/logos/stripe-4.svg" width="48" height="48" alt="Stripe" />
<br>Stripe
</td>
<td align="center" width="96">
<img src="https://res.cloudinary.com/cloudinary-marketing/image/upload/v1599098500/creative_source/Logo/Cloud%20Glyph/cloudinary_cloud_glyph_blue_png.png" width="48" height="48" alt="Cloudinary" />
<br>Cloudinary
</td>
</tr>
</table>

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │  React 19   │  │  Tailwind + shadcn/ui   │  │
│  │  App Router │  │   Client    │  │      Components         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  API Routes │  │  NextAuth   │  │   Server Actions        │  │
│  │   (REST)    │  │    v5       │  │   (Mutations)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Prisma    │  │ PostgreSQL  │  │      Cloudinary         │  │
│  │     ORM     │  │   (Neon)    │  │   (Media Storage)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Stripe    │  │   Google    │  │        GitHub           │  │
│  │  Payments   │  │    OAuth    │  │         OAuth           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.0 or higher
- **PostgreSQL** database ([Neon](https://neon.tech) recommended)
- **Stripe** account for payments
- **Cloudinary** account for media

### Installation

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

### 🔑 Environment Variables

Create a `.env` file with the following:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"

# OAuth (optional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 🧪 Test Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | `admin@learnify.com` | `password123` |
| 👨‍🏫 Instructor | `john@learnify.com` | `password123` |
| 👨‍🎓 Student | `student1@example.com` | `password123` |

---

## 📁 Project Structure

```
learnify/
├── 📂 prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data script
├── 📂 docs/                   # MkDocs documentation
├── 📂 src/
│   ├── 📂 app/                # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (browse)/          # Public course browsing
│   │   ├── (student)/         # Student dashboard
│   │   ├── (instructor)/      # Instructor dashboard
│   │   ├── (admin)/           # Admin panel
│   │   └── api/               # API routes
│   ├── 📂 components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── auth/              # Auth components
│   │   ├── courses/           # Course components
│   │   └── shared/            # Shared components
│   ├── 📂 lib/                # Utilities & configs
│   ├── 📂 hooks/              # Custom React hooks
│   ├── 📂 providers/          # Context providers
│   ├── 📂 types/              # TypeScript types
│   └── middleware.ts          # Route protection
├── .env.example               # Environment template
├── mkdocs.yml                 # Documentation config
└── package.json
```

---

## 🖥️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

---

## 🚢 Deployment

### Deploy to Netlify (Current)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alfredang/Learnify)

This project is currently deployed on Netlify: **[Live Demo](https://learnify-corporate-training-platform.netlify.app)**

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alfredang/Learnify)

1. Click the button above or import from GitHub
2. Add environment variables in Vercel dashboard
3. Deploy!

### Deploy to Other Platforms

<details>
<summary>Railway</summary>

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```
</details>

<details>
<summary>Docker</summary>

```dockerfile
# Build
docker build -t learnify .

# Run
docker run -p 3000:3000 --env-file .env learnify
```
</details>

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Course : creates
    User ||--o{ Enrollment : has
    User ||--o{ Review : writes
    Course ||--o{ Section : contains
    Section ||--o{ Lecture : contains
    Course ||--o{ Enrollment : has
    Course ||--o{ Review : receives
    Course }o--|| Category : belongs_to
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repo if you find it useful!

Made with ❤️ by [Alfred Ang](https://github.com/alfredang)

[⬆ Back to Top](#-learnify)

</div>
