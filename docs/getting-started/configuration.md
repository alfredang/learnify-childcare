# Configuration

This guide explains all the environment variables needed to run Learnify.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Database

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**Getting your DATABASE_URL:**

=== "Neon (Recommended)"

    1. Sign up at [neon.tech](https://neon.tech)
    2. Create a new project
    3. Copy the connection string from the dashboard
    4. Add `?sslmode=require` to the end

=== "Local PostgreSQL"

    ```
    DATABASE_URL="postgresql://postgres:password@localhost:5432/learnify"
    ```

### Authentication

```env
AUTH_SECRET="your-super-secret-key-change-in-production"
AUTH_URL="http://localhost:3000"
```

!!! warning "Production Security"
    Generate a strong `AUTH_SECRET` for production:
    ```bash
    openssl rand -base64 32
    ```

### OAuth Providers (Optional)

```env
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

**Setting up Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**Setting up GitHub OAuth:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### Stripe

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Getting Stripe Keys:**

1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers > API Keys
3. Copy the publishable and secret keys (use test keys for development)

**Setting up Webhooks:**

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook signing secret

### Cloudinary

```env
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
```

**Setting up Cloudinary:**

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard to find your cloud name, API key, and secret
3. Create an unsigned upload preset:
   - Go to Settings > Upload
   - Add upload preset
   - Set signing mode to "Unsigned"

### Application

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Change this to your production URL when deploying.

## Complete Example

```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# NextAuth
AUTH_SECRET="generate-a-secure-random-string"
AUTH_URL="http://localhost:3000"

# OAuth Providers
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="xxx"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
