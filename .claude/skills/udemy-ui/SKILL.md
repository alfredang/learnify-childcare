---
name: udemy-ui
description: Udemy UI reference patterns for building a faithful Udemy clone. Activated when creating pages, components, or layouts.
---

# Udemy UI Reference

This project aims to closely mirror Udemy's design where possible. Use this as a reference when building or modifying UI. Adapt patterns to fit Learnify's own theme — don't copy Udemy pixel-for-pixel, but match its layout logic and UX patterns.

## Design Quality

Follow Udemy's patterns, but never produce generic or "AI-looking" output. Every design choice should be intentional:

- **Be purposeful** - Every color, spacing, and font choice should serve the UX. No decorative filler.
- **Avoid AI-slop aesthetics** - No gratuitous gradients, no generic hero images with stock text, no overuse of rounded corners on everything, no emoji in UI elements.
- **Attention to detail** - Consistent alignment, proper visual hierarchy, correct spacing between elements. If something looks "off", fix it.
- **Cohesive theming** - All components should feel like they belong to the same product. Use the CSS variable tokens consistently.
- **Motion with purpose** - Only add animations/transitions when they improve UX (hover feedback, page transitions, loading states). No motion for decoration.
- **Typography hierarchy** - Clear size/weight difference between headings, subheadings, body text, and metadata. Don't make everything the same size.

## Color System

Learnify uses shadcn/ui CSS variables defined in `src/app/globals.css`. Always use these semantic tokens, never hardcoded hex values:

| Token | Usage |
|---|---|
| `primary` / `primary-foreground` | Main CTA buttons, key actions, active states |
| `secondary` / `secondary-foreground` | Secondary buttons, subtle backgrounds |
| `muted` / `muted-foreground` | Subdued text (instructor names, metadata, timestamps) |
| `destructive` | Delete actions, error states |
| `accent` / `accent-foreground` | Hover states, highlighted elements |
| `card` / `card-foreground` | Card surfaces |
| `background` / `foreground` | Page background and default text |
| `border` | Card borders, dividers |

### Semantic Color Usage (Udemy-inspired)

- **Headings:** `text-foreground` (dark, high contrast)
- **Body/meta text:** `text-muted-foreground`
- **Star ratings:** Use a yellow/amber shade (e.g., `text-yellow-500`)
- **Bestseller badge:** `bg-yellow-100 text-yellow-800`
- **Highest Rated badge:** `bg-orange-100 text-orange-800`
- **Free badge:** `bg-green-100 text-green-800`
- **Role badges:** `bg-blue-100 text-blue-800` (Instructor), `bg-purple-100 text-purple-800` (Admin)
- **Price text:** `text-foreground font-bold`
- **Discount original price:** `text-muted-foreground line-through`
- **Gradients:** Use `from-primary/10 via-background to-background` (existing pattern in hero sections)

### Rules

- Always use CSS variable tokens (`bg-primary`, `text-muted-foreground`) not raw colors
- If dark mode support is needed, the tokens in `globals.css` already handle light/dark
- For one-off accent colors (badges, ratings), Tailwind's built-in palette (`yellow-500`, `green-100`, etc.) is fine

## Typography

- **Headings:** Bold, tight line-height, `text-foreground`
- **Body:** Regular weight, `text-muted-foreground`
- **Course titles on cards:** 14-16px, bold, max 2 lines with line-clamp
- **Instructor name:** Small, `text-muted-foreground`
- **Prices:** Bold, 16-18px for current price; smaller strikethrough for original

## Navigation Header

Udemy's header pattern to follow:
1. **Optional banner** - Promotional/sale banner (full-width, dismissable)
2. **Main nav bar** - `bg-card` background, subtle bottom border
   - Logo (left)
   - "Categories" dropdown (mega menu with subcategories)
   - Search bar (expanding, centered, takes most space)
   - "Teach on Udemy" link
   - Cart icon with badge count
   - User avatar / Login + Sign up buttons

Implement with `src/components/layout/header.tsx`. Keep search prominent.

## Course Card

The core UI element. Follow Udemy's general structure:

```
┌─────────────────────────┐
│  [Thumbnail 16:9]       │  <- aspect-video, object-cover
│  [Bestseller] [Free]    │  <- badges overlay bottom-left
├─────────────────────────┤
│  Course Title Here      │  <- bold, max 2 lines, line-clamp-2
│  That Can Wrap          │
│  Instructor Name        │  <- text-sm, text-muted-foreground
│  4.5 ★★★★☆ (1,234)     │  <- star rating + count
│  $49.99  $199.99        │  <- bold price, strikethrough original
└─────────────────────────┘
```

Key details:
- **Thumbnail:** 16:9 aspect ratio, `object-cover`, rounded top corners
- **Title:** `font-bold`, `line-clamp-2`, `text-foreground`
- **Instructor:** `text-sm`, `text-muted-foreground`
- **Rating:** Yellow stars inline with numeric rating and review count
- **Price:** Current price bold and large; original price smaller with `line-through`
- **Badges:** "Bestseller" (yellow), "Highest Rated" (orange), "Free" (green)
- **Hover:** Subtle scale or shadow increase on hover
- **Grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with gap-4

## Course Detail Page

Follow Udemy's split layout pattern:
- **Left column (65-70%):** Course title, subtitle, badges, instructor info, rating summary, "What you'll learn" box, course content accordion, reviews
- **Right column (30-35%):** Sticky purchase card with:
  - Preview video/thumbnail
  - Price (large, bold)
  - "Add to cart" button (`bg-primary`, full-width)
  - "Buy now" button (outlined)
  - 30-day guarantee text
  - "This course includes" list (icons + text)

On mobile, the purchase card moves below the header as a fixed bottom bar.

## Category Browsing

- **Homepage:** Horizontal scrollable row of category cards/pills
- **Categories page:** Grid of category cards with icon + name + course count
- Category cards: Clean, minimal, icon-focused

## Instructor Dashboard

- **Sidebar navigation** (left, fixed)
- **Content area** (right, scrollable)
- Cards for stats (enrollments, revenue, ratings)
- Table layouts for course management

## Common Patterns

### Buttons
- **Primary:** `bg-primary text-primary-foreground` - used for main CTAs
- **Secondary:** `bg-secondary text-secondary-foreground` - outlined/subtle actions
- **Ghost:** Text-only, underline on hover
- **Destructive:** `bg-destructive` - delete/remove actions
- **Full-width** for CTAs in purchase cards

### Empty States
- Centered icon + heading + description + CTA button
- Use `src/components/shared/empty-state.tsx`

### Loading
- Skeleton cards matching course card dimensions
- Use shadcn Skeleton component

### Lists & Tables
- Clean borders, alternating row colors optional
- Pagination at bottom, matching `ITEMS_PER_PAGE` (12)

## Spacing

Udemy uses generous whitespace — follow the same feel:
- Page padding: `px-4 md:px-8 lg:px-16`
- Section gaps: `py-8 md:py-12`
- Card grid gaps: `gap-4`
- Content max-width: container utility defined in `globals.css` (max 1400px)

## Responsive Breakpoints

Follow Udemy's mobile-first approach:
- **Mobile (<640px):** Single column, stacked layout, hamburger menu
- **Tablet (640-1024px):** 2-column grids, condensed nav
- **Desktop (>1024px):** Full layout, sidebar navigation for dashboards
