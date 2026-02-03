---
name: toast-message-helper
description: Write consistent toast notifications using Sonner. Activated when adding user-facing feedback messages.
---

# Toast Message Helper

This project uses Sonner (`sonner` package) for toast notifications. All toasts should follow Udemy's UX tone: concise, helpful, action-oriented.

## Import

```typescript
import { toast } from "sonner"
```

## Toast Types & When to Use

### Success - Confirming a completed action
```typescript
toast.success("Course published")
toast.success("Review submitted")
toast.success("Enrolled successfully")
```

### Error - Something failed, user needs to know
```typescript
toast.error("Failed to enroll in course")
toast.error("Invalid email or password")
toast.error("Payment could not be processed")
```

### Loading/Promise - Async operations with feedback
```typescript
toast.promise(enrollInCourse(courseId), {
  loading: "Enrolling...",
  success: "Enrolled successfully",
  error: "Failed to enroll"
})
```

## Writing Rules

1. **Keep it short** - Max 6-8 words. Users glance, not read.
   - Good: `"Course published"`
   - Bad: `"Your course has been successfully published to the platform"`

2. **Start with the outcome or object, not "Successfully"**
   - Good: `"Course saved"`, `"Review submitted"`
   - Bad: `"Successfully saved the course"`

3. **Error toasts should say what failed, not why**
   - Good: `"Failed to save course"`
   - Bad: `"Database connection timeout error"`
   - The "why" belongs in console.error, not the toast

4. **Use sentence case, no periods**
   - Good: `"Profile updated"`
   - Bad: `"Profile Updated."`, `"PROFILE UPDATED"`

5. **Match the user's action**
   - If they clicked "Publish" -> `"Course published"`
   - If they clicked "Delete" -> `"Course deleted"`
   - If they clicked "Save" -> `"Changes saved"`

6. **Loading messages end with "..."**
   - `"Saving..."`, `"Publishing..."`, `"Uploading video..."`

## Common Patterns for This Project

| Action | Success | Error | Loading |
|---|---|---|---|
| Enroll | `"Enrolled successfully"` | `"Failed to enroll"` | `"Enrolling..."` |
| Create course | `"Course created"` | `"Failed to create course"` | `"Creating course..."` |
| Publish course | `"Course published"` | `"Failed to publish course"` | `"Publishing..."` |
| Upload video | `"Video uploaded"` | `"Failed to upload video"` | `"Uploading video..."` |
| Submit review | `"Review submitted"` | `"Failed to submit review"` | `"Submitting..."` |
| Login | (redirect, no toast) | `"Invalid email or password"` | - |
| Register | (redirect, no toast) | `"Email already registered"` | - |
| Delete | `"Course deleted"` | `"Failed to delete course"` | `"Deleting..."` |
| Payment | (redirect to Stripe) | `"Payment could not be processed"` | - |

## Never

- Never use `alert()` or `window.confirm()` - always use Sonner toasts or shadcn Dialog
- Never show technical errors in toasts (SQL errors, stack traces)
- Never show toasts for navigation or page loads
- Never stack multiple toasts for the same action
