# API Reference

Learnify provides RESTful API endpoints for all operations.

## Authentication

All protected endpoints require authentication via NextAuth.js session.

### Session Check

```typescript
import { auth } from "@/lib/auth";

const session = await auth();
if (!session) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Courses API

### List Courses

```http
GET /api/courses
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category slug |
| `level` | string | Filter by level |
| `search` | string | Search term |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**

```json
{
  "courses": [
    {
      "id": "clx...",
      "title": "Web Development Bootcamp",
      "slug": "web-development-bootcamp",
      "price": 49.99,
      "instructor": {
        "id": "...",
        "name": "John Doe"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### Get Course

```http
GET /api/courses/:id
```

**Response:**

```json
{
  "id": "clx...",
  "title": "Web Development Bootcamp",
  "description": "...",
  "price": 49.99,
  "level": "BEGINNER",
  "status": "PUBLISHED",
  "instructor": { ... },
  "category": { ... },
  "sections": [
    {
      "id": "...",
      "title": "Introduction",
      "lectures": [ ... ]
    }
  ]
}
```

### Create Course

```http
POST /api/courses
```

**Requires:** Instructor or Admin role

**Request Body (minimal — used by the 3-step creation wizard):**

```json
{
  "title": "My Course",
  "categoryId": "..."
}
```

### Update Course

```http
PUT /api/courses/:id
```

**Requires:** Course owner or Admin

### Delete Course

```http
DELETE /api/courses/:id
```

**Requires:** Course owner or Admin

## Categories API

### List Categories

```http
GET /api/categories
```

**Response:**

```json
{
  "categories": [
    {
      "id": "...",
      "name": "Web Development",
      "slug": "web-development",
      "_count": { "courses": 25 }
    }
  ]
}
```

## Checkout API

### Create Checkout Session

```http
POST /api/checkout
```

**Request Body:**

```json
{
  "courseId": "clx..."
}
```

**Response:**

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Verify Checkout Session

```http
POST /api/checkout/verify
```

**Requires:** Authenticated user

Verifies a Stripe checkout session after redirect. Creates enrollments and clears cart items on success.

## Sections API

### Create Section

```http
POST /api/courses/:id/sections
```

**Requires:** Course owner or Admin

**Request Body:**

```json
{
  "title": "Getting Started",
  "description": "Introduction to the course"
}
```

### Reorder Sections

```http
PUT /api/courses/:id/sections/reorder
```

**Requires:** Course owner or Admin

**Request Body:**

```json
{
  "orderedIds": ["section1-id", "section2-id", "section3-id"]
}
```

### Update / Delete Section

```http
PUT    /api/courses/:id/sections/:sectionId
DELETE /api/courses/:id/sections/:sectionId
```

**Requires:** Course owner or Admin

## Lectures API

### Create Lecture

```http
POST /api/courses/:id/sections/:sectionId/lectures
```

**Requires:** Course owner or Admin

**Request Body:**

```json
{
  "title": "Introduction Video",
  "type": "VIDEO",
  "videoUrl": "https://res.cloudinary.com/...",
  "videoDuration": 360,
  "isFreePreview": true
}
```

Lecture types: `VIDEO`, `TEXT`, `QUIZ`

### Reorder Lectures

```http
PUT /api/courses/:id/sections/:sectionId/lectures/reorder
```

### Update / Delete Lecture

```http
PUT    /api/courses/:id/sections/:sectionId/lectures/:lectureId
DELETE /api/courses/:id/sections/:sectionId/lectures/:lectureId
```

## Progress API

### Update Lecture Progress

```http
POST /api/lectures/:lectureId/progress
```

**Requires:** Authenticated user

**Request Body:**

```json
{
  "videoPosition": 120,
  "completed": true
}
```

Recalculates overall enrollment progress percentage.

## Upload API

### Get Cloudinary Signature

```http
POST /api/upload/signature
```

**Requires:** Authenticated user

Returns a signed upload URL for client-side Cloudinary uploads.

## Favourites API

### Add / Remove from Favourites

```http
POST   /api/favourites   # Add course to favourites
DELETE /api/favourites   # Remove course from favourites
```

**Requires:** Authenticated user

**Request Body:**

```json
{
  "courseId": "clx..."
}
```

> **Note:** The legacy `/api/wishlist` endpoint still exists but `/api/favourites` is the active endpoint.

## Cart API

### Cart Management

```http
GET    /api/cart   # List cart items
POST   /api/cart   # Add course to cart
DELETE /api/cart   # Remove course from cart
```

**Requires:** Authenticated user

**Request Body (POST/DELETE):**

```json
{
  "courseId": "clx..."
}
```

**Response (GET):**

```json
{
  "items": [
    {
      "id": "...",
      "course": {
        "id": "...",
        "title": "Web Development Bootcamp",
        "price": 49.99,
        "instructor": { ... }
      }
    }
  ]
}
```

## Reviews API

### List Course Reviews

```http
GET /api/courses/:id/reviews
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |

### Create Review

```http
POST /api/courses/:id/reviews
```

**Requires:** Authenticated user with enrollment

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Great course!"
}
```

### Update / Delete Review

```http
PUT    /api/courses/:id/reviews/:reviewId
DELETE /api/courses/:id/reviews/:reviewId
```

**Requires:** Review owner

## Enrollments API

### List / Create Enrollments

```http
GET  /api/enrollments   # List user's enrollments
POST /api/enrollments   # Create enrollment (free courses)
```

**Requires:** Authenticated user

**Request Body (POST):**

```json
{
  "courseId": "clx..."
}
```

## Become Instructor API

### Promote Student to Instructor

```http
POST /api/become-instructor
```

**Requires:** Authenticated student

Promotes the logged-in student to the INSTRUCTOR role and updates the JWT cookie so the middleware sees the new role immediately.

**Response:**

```json
{
  "success": true
}
```

**Error Codes:**

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `ROLE_FORBIDDEN` | 403 | User is not a student |
| `PROMOTION_FAILED` | 500 | Database error |

## Profile API

### Get / Update Profile

```http
GET /api/profile
PUT /api/profile
```

**Requires:** Authenticated user

**Request Body (PUT):**

```json
{
  "name": "John Doe",
  "headline": "Full-Stack Developer",
  "bio": "10 years of experience...",
  "website": "https://example.com",
  "twitter": "@johndoe",
  "linkedin": "johndoe"
}
```

### Upload Profile Image

```http
POST /api/profile/image
```

**Requires:** Authenticated user

Uploads a profile image to Cloudinary and updates the user record.

## Instructor Applications API (Legacy)

> **Note:** The primary path to becoming an instructor is now via `POST /api/become-instructor` (auto-promote) or direct signup with `role: "INSTRUCTOR"` at registration. The application workflow below is retained for backward compatibility.

### Student Endpoints

```http
GET  /api/instructor-applications   # Get current user's application status
POST /api/instructor-applications   # Submit application
```

**Request Body (POST):**

```json
{
  "headline": "Full-Stack Developer",
  "bio": "10 years of experience..."
}
```

### Admin Endpoints

```http
GET   /api/admin/instructor-applications       # List all applications
PATCH /api/admin/instructor-applications/:id   # Approve or reject
```

**Request Body (PATCH):**

```json
{
  "status": "APPROVED",
  "adminNote": "Welcome aboard!"
}
```

## Certificates API

### Generate Certificate

```http
POST /api/certificates/generate
```

**Requires:** Authenticated user with 100% course completion

### Download Certificate

```http
GET /api/certificates/:id/download
```

## Invoices API

### Get Invoice

```http
GET /api/invoices/:id
```

**Requires:** Authenticated user (own invoice)

## Webhooks

### Stripe Webhook

```http
POST /api/webhooks/stripe
```

Handles Stripe events:

- `checkout.session.completed` - Creates enrollment after successful payment
- `payment_intent.succeeded` - Updates purchase status

## Server Actions

In addition to REST APIs, Learnify uses Server Actions for mutations:

```typescript
// Enroll in a free course
"use server"
export async function enrollInCourse(courseId: string) {
  // ... implementation
}

// Update course progress
"use server"
export async function updateProgress(lectureId: string) {
  // ... implementation
}

// Submit review
"use server"
export async function submitReview(courseId: string, rating: number, comment: string) {
  // ... implementation
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
