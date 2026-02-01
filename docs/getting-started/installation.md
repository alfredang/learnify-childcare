# Installation

This guide will walk you through setting up Learnify on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** or **yarn** or **pnpm**
- **Git**

You'll also need accounts for:

- **PostgreSQL Database** - [Neon](https://neon.tech) (recommended) or local PostgreSQL
- **Stripe** - For payment processing
- **Cloudinary** - For media storage

## Step 1: Clone the Repository

```bash
git clone https://github.com/alfredang/Learnify.git
cd Learnify
```

## Step 2: Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

## Step 3: Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials. See the [Configuration](configuration.md) guide for details on each variable.

## Step 4: Set Up the Database

Generate the Prisma client:

```bash
npx prisma generate
```

Push the schema to your database:

```bash
npm run db:push
```

Seed the database with sample data:

```bash
npm run db:seed
```

## Step 5: Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to your database:

1. Verify your `DATABASE_URL` is correct
2. Ensure your database server is running
3. Check that your IP is allowlisted (for cloud databases)

### Prisma Issues

If you encounter Prisma-related errors:

```bash
# Reset the Prisma client
npx prisma generate

# Reset the database (warning: deletes all data)
npx prisma db push --force-reset
```

### Node.js Version

Ensure you're using Node.js 18 or higher:

```bash
node --version
```

If needed, use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
nvm install 18
nvm use 18
```
