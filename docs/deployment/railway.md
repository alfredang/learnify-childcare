# Deploy to Railway

Railway provides easy deployment with built-in PostgreSQL.

## Quick Deploy

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository

## Using Railway CLI

### Install CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

### Initialize Project

```bash
railway init
```

### Deploy

```bash
railway up
```

## Add PostgreSQL

1. In your Railway project, click "New"
2. Select "Database" > "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

## Environment Variables

Add environment variables in the Railway dashboard:

1. Go to your service
2. Click "Variables"
3. Add each required variable:

```
AUTH_SECRET=your-secret
AUTH_URL=https://your-app.railway.app
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

!!! tip "Reference DATABASE_URL"
    Railway automatically connects `DATABASE_URL` when you add PostgreSQL.

## Build Configuration

Railway will automatically detect Next.js. You can customize in `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Custom Domain

1. Go to Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

## Database Commands

Run database commands via Railway CLI:

```bash
# Push schema
railway run npx prisma db push

# Seed database
railway run npm run db:seed

# Open Prisma Studio (local)
railway run npx prisma studio
```

## Monitoring

Railway provides:

- Deployment logs
- Build logs
- Usage metrics
- Health monitoring

Access via the Railway dashboard or CLI:

```bash
railway logs
```
