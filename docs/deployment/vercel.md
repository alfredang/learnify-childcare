# Deploy to Vercel

Vercel is the recommended platform for deploying Learnify.

## One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alfredang/Learnify)

## Manual Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts to:

1. Set up and deploy
2. Link to existing project or create new
3. Configure project settings

### Step 4: Configure Environment Variables

In the Vercel dashboard:

1. Go to your project
2. Navigate to Settings > Environment Variables
3. Add all required variables:

```
DATABASE_URL
AUTH_SECRET
AUTH_URL
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
NEXT_PUBLIC_APP_URL
```

!!! warning "Update AUTH_URL"
    Set `AUTH_URL` to your production URL (e.g., `https://learnify.vercel.app`)

### Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## Production Checklist

Before going live:

- [ ] Generate strong `AUTH_SECRET`
- [ ] Set `AUTH_URL` to production URL
- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Configure production Stripe keys
- [ ] Set up Stripe webhook for production
- [ ] Verify database connection
- [ ] Test OAuth callbacks

## Custom Domain

1. Go to Settings > Domains
2. Add your domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatic)

## Automatic Deployments

Vercel automatically deploys:

- **Production** - Pushes to `main` branch
- **Preview** - Pull requests

Configure branch settings in Settings > Git.
