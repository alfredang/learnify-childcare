---
name: error-message-helper
description: Write consistent, debuggable error messages for API routes and server actions. Activated when writing error handling code.
---

# Error Message Helper

Write error messages that help developers debug quickly and give users clear feedback.

## API Route Errors

Follow the existing format in this codebase:

```typescript
return NextResponse.json(
  { error: "Human-readable message", code: "SCREAMING_SNAKE_CODE" },
  { status: 400 }
)
```

### Rules for API Error Messages

1. **`error` field** - One sentence, starts with a verb, no period. Describes what went wrong from the user's perspective.
   - Good: `"Course not found"`
   - Good: `"Email already registered"`
   - Bad: `"An error occurred."` (vague)
   - Bad: `"Error 404"` (use status code for that)

2. **`code` field** - SCREAMING_SNAKE_CASE, machine-readable, unique per error case.
   - Good: `"COURSE_NOT_FOUND"`, `"EMAIL_ALREADY_EXISTS"`, `"INSUFFICIENT_PERMISSIONS"`
   - Bad: `"ERROR"`, `"BAD_REQUEST"` (too generic)

3. **Status codes** - Use the correct HTTP status:
   - `400` - Bad input (validation failed, missing fields)
   - `401` - Not authenticated (no session)
   - `403` - Not authorized (wrong role)
   - `404` - Resource not found
   - `409` - Conflict (duplicate slug, already enrolled)
   - `500` - Unexpected server error

### console.error Pattern

Always log the full error server-side for debugging:

```typescript
try {
  // operation
} catch (error) {
  console.error("[COURSES_POST]", error)
  return NextResponse.json(
    { error: "Failed to create course", code: "COURSE_CREATE_FAILED" },
    { status: 500 }
  )
}
```

The bracket prefix `[ROUTE_METHOD]` identifies which endpoint failed in logs.

## Server Action Errors

For server actions, throw or return errors that the UI can display:

```typescript
"use server"
export async function enrollInCourse(courseId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("You must be logged in to enroll")
  // ...
}
```

## Validation Errors

Use Zod's built-in error messages. Return the issues array directly:

```typescript
const result = schema.safeParse(body)
if (!result.success) {
  return NextResponse.json(
    { error: "Validation failed", code: "VALIDATION_ERROR", issues: result.error.issues },
    { status: 400 }
  )
}
```

## Never

- Never expose stack traces, database errors, or internal paths to the client
- Never use generic "Something went wrong" without a specific `code` for tracking
- Never skip the `console.error` in catch blocks
