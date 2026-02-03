---
name: task-chunking
description: Break large features into small, revertable commits. Activated when planning multi-step implementations.
---

# Task Chunking

When given a large feature or multi-file change, break it into small, independently revertable chunks before writing any code.

## Step 1: Assess Scope

Ask yourself:
- How many files will this touch?
- Are there database schema changes?
- Are there new routes, components, or API endpoints?

If the answer to any is "more than 2", chunk it.

## Step 2: Chunk Strategy

Break the work into commits that each:
1. Leave the app in a working state (no broken imports, no missing deps)
2. Can be reverted without breaking other chunks
3. Are small enough to review in under 5 minutes

### Chunking Order (follow this sequence)

1. **Schema first** - Prisma schema changes + `db:push` (if needed)
2. **Data layer** - New lib/ utilities, Zod validations, types
3. **API routes** - New or modified `/api/` endpoints
4. **Server components** - Pages and layouts
5. **Client components** - Interactive UI, forms
6. **Wiring** - Connect everything, update imports, barrel exports

## Step 3: Before Each Chunk

- State what you're about to do and which files you'll touch
- Confirm the chunk won't break existing functionality
- After completing a chunk, verify no TypeScript errors were introduced

## Rules

- NEVER combine schema changes with UI changes in one chunk
- NEVER combine new feature code with refactoring in one chunk
- If a chunk grows beyond 3 files, split it further
- Each chunk should have a clear, descriptive commit message
