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

**Request Body:**

```json
{
  "title": "My Course",
  "description": "Course description",
  "categoryId": "...",
  "level": "BEGINNER",
  "price": 29.99
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
