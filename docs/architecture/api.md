# API Reference

Learnify Childcare provides RESTful API endpoints for all operations. All API routes are located under `src/app/api/`.

## Authentication

All protected endpoints require authentication via NextAuth.js v5 session. Role-based access control is enforced at the API level.

### Session Check Pattern

```typescript
import { auth } from "@/lib/auth";

const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
if (session.user.role !== "CORPORATE_ADMIN" && session.user.role !== "SUPER_ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Roles

| Role | Description |
|------|-------------|
| `LEARNER` | Childcare workers who complete assigned training |
| `CORPORATE_ADMIN` | Centre managers who assign courses and monitor progress |
| `SUPER_ADMIN` | Platform administrators with full access |

---

## Auth API

### NextAuth Handler

```http
ALL /api/auth/[...nextauth]
```

Handles all NextAuth.js operations (sign in, sign out, session, callbacks).

### Register User

```http
POST /api/auth/register
```

**Auth:** None

**Request Body:**

```json
{
  "email": "learner@example.sg",
  "password": "securepassword",
  "name": "Sarah Tan",
  "role": "LEARNER"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "clx...",
    "email": "learner@example.sg",
    "name": "Sarah Tan",
    "role": "LEARNER"
  }
}
```

---

## Courses API

### List Courses

```http
GET /api/courses
```

**Auth:** None (returns only PUBLISHED courses for unauthenticated users). Super Admins can see all statuses.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category slug |
| `level` | string | Filter by level (BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS) |
| `search` | string | Search term (matches title and description) |
| `status` | string | Filter by status (SUPER_ADMIN only) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |

**Response:**

```json
{
  "courses": [
    {
      "id": "clx...",
      "title": "CPR and First Aid for Childcare Workers",
      "slug": "cpr-first-aid-childcare",
      "priceSgd": 60.00,
      "cpdPoints": 8,
      "estimatedHours": 4.0,
      "level": "ALL_LEVELS",
      "status": "PUBLISHED",
      "category": {
        "id": "...",
        "name": "Health & Safety",
        "slug": "health-safety"
      },
      "createdBy": {
        "id": "...",
        "name": "Admin"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

### Get Course

```http
GET /api/courses/:id
```

**Auth:** None (PUBLISHED courses only) or authenticated user

**Response:**

```json
{
  "id": "clx...",
  "title": "CPR and First Aid for Childcare Workers",
  "slug": "cpr-first-aid-childcare",
  "subtitle": "Essential emergency response skills",
  "description": "<p>Learn life-saving CPR techniques...</p>",
  "priceSgd": 60.00,
  "cpdPoints": 8,
  "estimatedHours": 4.0,
  "scormVersion": "2.0",
  "level": "ALL_LEVELS",
  "language": "English",
  "learningOutcomes": [
    "Perform infant and child CPR",
    "Manage common childhood emergencies"
  ],
  "status": "PUBLISHED",
  "category": { "id": "...", "name": "Health & Safety" },
  "sections": [
    {
      "id": "...",
      "title": "Module 1: Introduction to First Aid",
      "lectures": [
        {
          "id": "...",
          "title": "What is First Aid?",
          "type": "VIDEO",
          "videoDuration": 600
        }
      ]
    }
  ]
}
```

### Create Course

```http
POST /api/courses
```

**Auth:** SUPER_ADMIN

**Request Body:**

```json
{
  "title": "Nutrition Planning for Toddlers",
  "categoryId": "clx..."
}
```

Creates a DRAFT course with default values (priceSgd: 60, scormVersion: "2.0") and returns the course ID for further editing.

### Update Course

```http
PUT /api/courses/:id
```

**Auth:** SUPER_ADMIN (or course creator)

**Request Body:** Any subset of course fields (title, subtitle, description, categoryId, level, language, priceSgd, cpdPoints, estimatedHours, learningOutcomes, status, thumbnail, scormVersion).

### Delete Course

```http
DELETE /api/courses/:id
```

**Auth:** SUPER_ADMIN

Courses with active enrollments or assignments cannot be deleted.

---

## Sections API

### Create Section

```http
POST /api/courses/:id/sections
```

**Auth:** SUPER_ADMIN

**Request Body:**

```json
{
  "title": "Module 1: Introduction",
  "description": "Overview of the course content"
}
```

### Reorder Sections

```http
PUT /api/courses/:id/sections/reorder
```

**Auth:** SUPER_ADMIN

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

**Auth:** SUPER_ADMIN

---

## Lectures API

### Create Lecture

```http
POST /api/courses/:id/sections/:sectionId/lectures
```

**Auth:** SUPER_ADMIN

**Request Body:**

```json
{
  "title": "Introduction to CPR Techniques",
  "type": "VIDEO",
  "videoUrl": "https://res.cloudinary.com/...",
  "videoDuration": 600
}
```

Lecture types: `VIDEO`, `TEXT`, `QUIZ`

### Reorder Lectures

```http
PUT /api/courses/:id/sections/:sectionId/lectures/reorder
```

**Auth:** SUPER_ADMIN

**Request Body:**

```json
{
  "orderedIds": ["lecture1-id", "lecture2-id", "lecture3-id"]
}
```

### Update / Delete Lecture

```http
PUT    /api/courses/:id/sections/:sectionId/lectures/:lectureId
DELETE /api/courses/:id/sections/:sectionId/lectures/:lectureId
```

**Auth:** SUPER_ADMIN

---

## Progress API

### Update Lecture Progress

```http
POST /api/lectures/:lectureId/progress
```

**Auth:** Authenticated user (LEARNER)

**Request Body:**

```json
{
  "videoPosition": 120,
  "completed": true,
  "scormLessonStatus": "completed",
  "scormSessionTime": "PT0H15M30S",
  "scormLessonLocation": "page-5"
}
```

Updates the LectureProgress record for the current user. Also recalculates the overall enrollment progress percentage and updates SCORM fields.

**Response:**

```json
{
  "progress": {
    "id": "...",
    "isCompleted": true,
    "watchedDuration": 600,
    "lastPosition": 120,
    "scormLessonStatus": "completed"
  },
  "enrollmentProgress": 75
}
```

---

## Enrollments API

### List / Create Enrollments

```http
GET  /api/enrollments
POST /api/enrollments
```

**Auth:** Authenticated user

**GET** returns the current user's enrollments with progress and SCORM data.

**POST Request Body:**

```json
{
  "courseId": "clx...",
  "userId": "clx..."
}
```

Enrollments are typically created automatically when a course is assigned, but can also be created directly by Super Admins.

**GET Response:**

```json
{
  "enrollments": [
    {
      "id": "...",
      "progress": 45,
      "scormStatus": "incomplete",
      "scormScore": null,
      "scormTotalTime": "PT1H30M",
      "deadline": "2026-03-15T00:00:00.000Z",
      "course": {
        "id": "...",
        "title": "CPR and First Aid",
        "cpdPoints": 8,
        "category": { "name": "Health & Safety" }
      }
    }
  ]
}
```

---

## Assignments API

### List / Create Course Assignments

```http
GET  /api/assignments
POST /api/assignments
```

**Auth:** CORPORATE_ADMIN or SUPER_ADMIN

**GET** returns assignments scoped to the corporate admin's organisation.

**POST Request Body:**

```json
{
  "learnerId": "clx...",
  "courseId": "clx...",
  "deadline": "2026-03-15T00:00:00.000Z",
  "notes": "Please complete before next month's audit"
}
```

**Response (201):**

```json
{
  "assignment": {
    "id": "clx...",
    "learnerId": "clx...",
    "courseId": "clx...",
    "assignedById": "clx...",
    "organizationId": "clx...",
    "status": "ASSIGNED",
    "deadline": "2026-03-15T00:00:00.000Z",
    "notes": "Please complete before next month's audit"
  }
}
```

If the organisation has billing enabled, the response includes a Stripe checkout URL:

```json
{
  "assignment": { ... },
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

**Assignment Constraints:**

- Each learner can only be assigned a course once (`@@unique([learnerId, courseId])`)
- Only PUBLISHED courses can be assigned
- Learner must belong to the corporate admin's organisation
- The `organizationId` is automatically set from the corporate admin's organisation

---

## Organizations API

### List Organizations

```http
GET /api/organizations
```

**Auth:** SUPER_ADMIN

**Response:**

```json
{
  "organizations": [
    {
      "id": "clx...",
      "name": "Sunshine Childcare Centre",
      "slug": "sunshine-childcare",
      "contactName": "Mary Lim",
      "contactEmail": "manager@sunshine.sg",
      "licenseNumber": "LIC-2024-001",
      "maxLearners": 50,
      "billingEnabled": false,
      "_count": {
        "users": 12,
        "assignments": 45
      }
    }
  ]
}
```

### Get Organization

```http
GET /api/organizations/:id
```

**Auth:** SUPER_ADMIN or CORPORATE_ADMIN (own organisation only)

### Update Organization

```http
PUT /api/organizations/:id
```

**Auth:** SUPER_ADMIN

**Request Body:** Any subset of organisation fields (name, contactName, contactEmail, phone, address, licenseNumber, maxLearners, billingEnabled).

### List Organization Learners

```http
GET /api/organizations/:id/learners
```

**Auth:** CORPORATE_ADMIN (own organisation) or SUPER_ADMIN

Returns all users with role LEARNER belonging to the specified organisation.

**Response:**

```json
{
  "learners": [
    {
      "id": "clx...",
      "name": "Sarah Tan",
      "email": "sarah@sunshine.sg",
      "jobTitle": "Lead Teacher",
      "staffId": "SS-001",
      "assignments": [
        {
          "courseId": "...",
          "status": "IN_PROGRESS",
          "progress": 60,
          "deadline": "2026-03-15T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

---

## Categories API

### List Categories

```http
GET /api/categories
```

**Auth:** None

**Response:**

```json
{
  "categories": [
    {
      "id": "...",
      "name": "Health & Safety",
      "slug": "health-safety",
      "description": "CPR, first aid, workplace safety, infection control",
      "_count": { "courses": 5 }
    }
  ]
}
```

---

## Certificates API

### Generate Certificate

```http
POST /api/certificates/generate
```

**Auth:** Authenticated user with 100% course completion

**Request Body:**

```json
{
  "courseId": "clx..."
}
```

Generates a certificate with a unique ID, the learner's organisation name, and the course's CPD points.

**Response:**

```json
{
  "certificate": {
    "id": "...",
    "certificateId": "CERT-2026-ABC123",
    "courseName": "CPR and First Aid for Childcare Workers",
    "organizationName": "Sunshine Childcare Centre",
    "cpdPoints": 8,
    "issuedAt": "2026-02-07T10:00:00.000Z",
    "expiresAt": "2028-02-07T10:00:00.000Z"
  }
}
```

### Download Certificate

```http
GET /api/certificates/:id/download
```

**Auth:** Certificate owner

Returns the certificate as a downloadable file.

---

## Profile API

### Get / Update Profile

```http
GET /api/profile
PUT /api/profile
```

**Auth:** Authenticated user

**Request Body (PUT):**

```json
{
  "name": "Sarah Tan",
  "jobTitle": "Senior Teacher",
  "bio": "10 years of experience in early childhood education"
}
```

### Upload Profile Image

```http
POST /api/profile/image
```

**Auth:** Authenticated user

Uploads a profile image to Cloudinary and updates the user record.

---

## Upload API

### Get Cloudinary Signature

```http
POST /api/upload/signature
```

**Auth:** Authenticated user

Returns a signed upload URL for client-side Cloudinary uploads. Used for video and image uploads in the course editor.

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate assignment) |
| 500 | Internal Server Error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | User is not authenticated |
| `FORBIDDEN` | User does not have the required role |
| `NOT_FOUND` | Resource does not exist |
| `DUPLICATE_ASSIGNMENT` | Learner is already assigned to this course |
| `COURSE_NOT_PUBLISHED` | Cannot assign a course that is not PUBLISHED |
| `ORG_LEARNER_LIMIT` | Organisation has reached its maximum learner count |
| `VALIDATION_ERROR` | Request body failed Zod validation |

## API Route Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/[...nextauth]` | ALL | -- | NextAuth handler |
| `/api/auth/register` | POST | None | User registration |
| `/api/categories` | GET | None | List course categories |
| `/api/courses` | GET | None | List/search courses |
| `/api/courses` | POST | SUPER_ADMIN | Create course |
| `/api/courses/[id]` | GET | None | Get course details |
| `/api/courses/[id]` | PUT | SUPER_ADMIN | Update course |
| `/api/courses/[id]` | DELETE | SUPER_ADMIN | Delete course |
| `/api/courses/[id]/sections` | POST | SUPER_ADMIN | Create section |
| `/api/courses/[id]/sections/reorder` | PUT | SUPER_ADMIN | Reorder sections |
| `/api/courses/[id]/sections/[sId]` | PUT/DELETE | SUPER_ADMIN | Update/delete section |
| `/api/courses/[id]/sections/[sId]/lectures` | POST | SUPER_ADMIN | Create lecture |
| `/api/courses/[id]/sections/[sId]/lectures/reorder` | PUT | SUPER_ADMIN | Reorder lectures |
| `/api/courses/[id]/sections/[sId]/lectures/[lId]` | PUT/DELETE | SUPER_ADMIN | Update/delete lecture |
| `/api/lectures/[id]/progress` | POST | Authenticated | Update lecture progress |
| `/api/enrollments` | GET/POST | Authenticated | Enrollment management |
| `/api/assignments` | GET/POST | CORPORATE_ADMIN+ | Course assignment management |
| `/api/organizations` | GET | SUPER_ADMIN | List organisations |
| `/api/organizations/[id]` | GET/PUT | SUPER_ADMIN / CORPORATE_ADMIN | Get/update organisation |
| `/api/organizations/[id]/learners` | GET | CORPORATE_ADMIN+ | List organisation learners |
| `/api/certificates/generate` | POST | Authenticated | Generate certificate |
| `/api/certificates/[id]/download` | GET | Certificate owner | Download certificate |
| `/api/profile` | GET/PUT | Authenticated | Profile management |
| `/api/profile/image` | POST | Authenticated | Upload profile image |
| `/api/upload/signature` | POST | Authenticated | Cloudinary upload signature |
