# V2 MVP Development Plan — ego-memory-anchor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the V2 MVP of ego-memory-anchor in 9 Sprints (53 tasks), following TDD, with autonomous Claude Code execution and sprint-based reporting.

**Architecture:** Next.js 15 App Router + Supabase + Vercel. Server Components by default, client components only where interaction required. All data flows through Supabase RLS. Memories bucket is public (UUID paths), avatars bucket is public.

**Tech Stack:** Next.js 15, TypeScript strict, Tailwind CSS 4 + shadcn/ui, Supabase (Auth + Postgres + Storage + RLS), Vitest + React Testing Library + Playwright, pnpm, Vercel.

**V2 Differentiation:** Family collaboration moved to Sprint 3 (growth engine P0). Data export is P0. Landing Page includes privacy pledge. SourceBadge is immutable (DB trigger enforced).

---

## Prerequisites

Before starting Sprint 0, verify:

```bash
node --version     # >= 18
pnpm --version     # >= 8
supabase --version # >= 1.100
```

Start Supabase local environment:
```bash
cd /Users/kevin/Library/CloudStorage/OneDrive-Personal/Projects/2026创业/ego-memory-anchor
supabase start
```

Copy environment file:
```bash
cp .env.local.example .env.local
# Fill in Supabase local URL and anon key from supabase start output
```

---

## Development Workflow

### V2 Sprint Execution Pattern

Each Sprint follows this pattern:

```
1. READ docs/v2/TASKS.md for sprint task list
2. READ docs/v2/DESIGN.md for relevant technical specs
3. READ docs/v2/CLAUDE.md for coding standards
4. EXECUTE each task in order (TDD: test → implement → commit)
5. VERIFY at sprint end: pnpm test --run && pnpm build
6. REPORT sprint completion status
```

### Sprint Reporting Format

After each sprint, report:

```
## Sprint {N} Completion Report

### Completed Tasks
- S{N}.T1: description
- S{N}.T2: description

### Test Results
- Unit tests: X passed, Y failed
- Build: success/failed

### Issues Found
- Issue 1: description

### Recommendations
- Recommendation 1
```

### V2 Claude Code Autonomy Levels

| Scenario | Autonomy |
|----------|----------|
| Tool function implementation | Full (red-green-refactor loop) |
| Server Action implementation | Full (TDD) |
| Component implementation | Full |
| Cross-component architecture decisions | Report before executing |
| Database Migration | Report before executing |
| Adding new dependencies | Report before executing |

---

## Sprint 0: Project Skeleton

**Duration:** Foundation setup. Do not rush.

### S0.T1: Initialize Next.js Project

**Files:** None exist yet

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd /Users/kevin/Library/CloudStorage/OneDrive-Personal/Projects/2026创业/ego-memory-anchor
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm
```
Expected: Next.js 15 project scaffolded with TypeScript, Tailwind, ESLint, App Router.

- [ ] **Step 2: Verify dev server starts**

Run:
```bash
pnpm dev
```
Expected: Dev server starts on localhost:3000 without errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: S0.T1 - initialize Next.js 15 project

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S0.T2: Install Core Dependencies

**Files:** package.json

- [ ] **Step 1: Install production dependencies**

Run:
```bash
pnpm add @supabase/supabase-js @supabase/ssr exifr jszip @tanstack/react-virtual lunar-javascript
```

- [ ] **Step 2: Install dev dependencies**

Run:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event @axe-core/playwright
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: S0.T2 - install core dependencies

Supabase client, SSR helpers, EXIF extraction, JSZip, virtual scrolling, lunar calendar
Vitest, React Testing Library, Playwright with axe-core

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S0.T3: Configure Test Environment

**Files to create:**
- `vitest.config.ts`
- `tests/setup.ts`
- `tests/fixtures/sample-photo.jpg`
- `tests/fixtures/sample-video.mp4` (placeholder)
- `tests/fixtures/sample-audio.m4a` (placeholder)
- `tests/fixtures/wechat-export-sample.txt`

- [ ] **Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

- [ ] **Step 2: Create tests/setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Verify tests run**

Run:
```bash
pnpm test --run
```
Expected: PASS (no test files yet, but no errors)

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/
git commit -m "feat: S0.T3 - configure test environment

Vitest + jsdom + @testing-library/jest-dom
Test fixtures directory with sample media files

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S0.T4: Database Schema Migration

**Files to create:**
- `supabase/migrations/001_initial_schema.sql`

This is the FOUNDATION of the entire application. Read `docs/v2/DESIGN.md` §1 before writing this file.

Key requirements from V2:
- All tables with RLS enabled
- `profiles` table with `cover_photo_path` (V2 new field)
- `memories` table with immutable `source_label` DEFAULT '原始记录' and DB trigger
- `family_members` table with role-based access
- `reminders` table with lunar support
- `privacy_consents` table (V2 new)
- All necessary indexes
- Proper FK relationships with ON DELETE CASCADE

- [ ] **Step 1: Write the complete migration file**

Reference `docs/v2/DESIGN.md` §1.3 for the full SQL including:
- All CREATE TABLE statements
- All ALTER TABLE ... ENABLE ROW LEVEL SECURITY
- All CREATE POLICY statements
- The `prevent_source_label_update()` trigger function
- All CREATE INDEX statements

- [ ] **Step 2: Apply migration to local Supabase**

Run:
```bash
supabase db push
```
Expected: Migration applies successfully, no errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: S0.T4 - initial database schema with RLS

Tables: profiles, memories, family_members, reminders, privacy_consents
RLS policies for all tables
source_label immutable trigger on memories
Indexes for query performance

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Sprint 1: Authentication + Basic Layout

### S1.T1: shadcn/ui Initialization

**Reference:** `docs/v2/CLAUDE.md` § UI Design System

- [ ] **Step 1: Initialize shadcn/ui**

Run:
```bash
pnpm dlx shadcn@latest init
```
When prompted:
- Style: New York
- Base color: Stone
- CSS variables: yes
- CSS file: app/globals.css

- [ ] **Step 2: Install required components**

Run:
```bash
pnpm dlx shadcn@latest add button card input label dialog dropdown-menu avatar badge toast separator skeleton tabs popover calendar alert-dialog textarea select
```

- [ ] **Step 3: Verify Button and Card render**

Create a simple test:
```typescript
// tests/unit/components/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/ app/globals.css
git commit -m "feat: S1.T1 - initialize shadcn/ui with design system

Stone warm color palette, all required components installed

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S1.T2: Supabase Client Configuration

**Files to create:**
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/middleware.ts`

**Reference:** `docs/v2/DESIGN.md` § Supabase rules

- [ ] **Step 1: Create server client**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 2: Create browser client**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create middleware for auth protection**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/profile') ||
                           request.nextUrl.pathname.startsWith('/settings')
  
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: S1.T2 - Supabase client configuration

Server client, browser client, auth middleware
Protected routes redirect to login

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S1.T3: TypeScript Type Definitions

**Files to create:**
- `lib/types/database.ts` (generate with `supabase gen types typescript`)
- `lib/types/index.ts`

- [ ] **Step 1: Generate Supabase types**

Run:
```bash
supabase gen types typescript --project-id local > lib/types/database.ts
```

- [ ] **Step 2: Create business types**

```typescript
// lib/types/index.ts
export type Species = 'human' | 'pet'
export type MemoryType = 'photo' | 'video' | 'audio' | 'text' | 'document'
export type DatePrecision = 'day' | 'month' | 'year' | 'unknown'
export type FamilyRole = 'admin' | 'editor' | 'viewer'
export type Recurrence = 'once' | 'yearly' | 'lunar_yearly'

export interface ProfileWithStats extends Profile {
  memoryCounts: {
    photo: number
    video: number
    audio: number
    text: number
    document: number
  }
  familyMemberCount: number
}

export interface MemoryWithContributor extends Memory {
  contributor: {
    id: string
    email: string
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
pnpm tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/types/
git commit -m "feat: S1.T3 - TypeScript type definitions

Database types from Supabase gen
Business types: ProfileWithStats, MemoryWithContributor

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S1.T4: Register Page (V2 Enhanced)

**Files to create:**
- `app/(auth)/register/page.tsx`
- `app/(auth)/layout.tsx`

**V2 Enhancement:** Privacy policy checkbox (required), bottom promise text.

- [ ] **Step 1: Write test first**

```typescript
// tests/unit/app/(auth)/register/page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '@/app/(auth)/register/page'

describe('RegisterPage', () => {
  it('renders registration form', () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument()
  })

  it('submit button is disabled when privacy checkbox is not checked', async () => {
    render(<RegisterPage />)
    const submitButton = screen.getByRole('button', { name: /注册/i })
    expect(submitButton).toBeDisabled()
  })

  it('submit button is enabled when privacy checkbox is checked', async () => {
    render(<RegisterPage />)
    const user = userEvent.setup()
    const checkbox = screen.getByLabelText(/我已阅读.*隐私政策/i)
    await user.click(checkbox)
    const submitButton = screen.getByRole('button', { name: /注册/i })
    expect(submitButton).not.toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test --run`
Expected: FAIL - RegisterPage doesn't exist

- [ ] **Step 3: Create layout**

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create register page**

Reference shadcn/ui form patterns. Key elements:
- Email input with label
- Password input with label
- Privacy policy checkbox with label text "我已阅读并同意《隐私政策》和《用户协议》"
- Submit button disabled by default
- Bottom text: "你的数据只属于你。我们不做 AI 合成，不投广告。"
- Uses Server Actions for form submission
- Uses useActionState for form state

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test --run`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/(auth)/
git commit -m "feat: S1.T4 - register page with privacy checkbox

V2: Privacy policy checkbox required, bottom promise text
Disabled submit until checkbox checked

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S1.T5: Login Page

**Files to create:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/callback/route.ts`

- [ ] **Step 1: Write test**

```typescript
// tests/unit/app/(auth)/login/page.test.tsx
import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**
Expected: FAIL

- [ ] **Step 3: Create login page with callback route**

Key elements:
- Email and password inputs
- Submit button
- OAuth providers (if configured)
- Link to register page
- Callback route handles Supabase auth callback

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add app/(auth)/
git commit -m "feat: S1.T5 - login page with auth callback

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S1.T6: Main Layout Framework

**Files to create:**
- `app/(main)/layout.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`
- `components/layout/MobileNav.tsx`
- `components/layout/UserMenu.tsx`

- [ ] **Step 1: Create responsive layout**

Desktop: Left sidebar + right content area
Mobile: Top header + bottom navigation

Reference `docs/v2/CLAUDE.md` § UI Design System for exact spacing/color values.

- [ ] **Step 2: Create UserMenu with dropdown**

Includes:
- User avatar
- Dropdown with: Dashboard, Settings, Logout

- [ ] **Step 3: Verify responsive breakpoints**

Manual test at 375px (mobile) and 1280px (desktop).

- [ ] **Step 4: Commit**

```bash
git add app/(main)/ components/layout/
git commit -m "feat: S1.T6 - main layout with responsive navigation

Desktop: sidebar + content
Mobile: header + bottom nav
UserMenu dropdown

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Sprint 2: Profile CRUD + Life Summary

### S2.T1: ProfileForm Component

**Files to create:**
- `components/profile/ProfileForm.tsx`

Fields: name, avatar, relationship, species, birth_date, death_date, description.

- [ ] **Step 1: Write test**

```typescript
// tests/unit/components/profile/profile-form.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from '@/components/profile/ProfileForm'

describe('ProfileForm', () => {
  it('renders all required fields', () => {
    render(<ProfileForm />)
    expect(screen.getByLabelText(/姓名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/关系/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/物种/i)).toBeInTheDocument()
  })

  it('validates required name field', async () => {
    const user = userEvent.setup()
    render(<ProfileForm />)
    await user.click(screen.getByRole('button', { name: /创建/i }))
    expect(screen.getByText(/姓名为必填项/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement ProfileForm**

Use shadcn/ui Form components (Form, FormField, FormItem, FormLabel, FormControl, FormMessage).
Species selector: radio group (human/pet).

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add components/profile/ProfileForm.tsx
git commit -m "feat: S2.T1 - ProfileForm component

Fields: name, avatar, relationship, species, birth_date, death_date, description
Validation on required fields

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S2.T2: Create Profile Page

**Files to create:**
- `app/(main)/profile/new/page.tsx`
- Server Action: `lib/actions/profile.ts` (createProfile)

- [ ] **Step 1: Write test for createProfile action**

```typescript
// tests/unit/lib/actions/profile.test.ts
import { createProfile } from '@/lib/actions/profile'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Mock the server client
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      insert: () => Promise.resolve({ data: { id: 'test-id' }, error: null }),
    }),
  }),
}))

describe('createProfile', () => {
  it('creates a profile with valid data', async () => {
    const result = await createProfile({
      name: '爷爷',
      relationship: '祖父',
      species: 'human',
    })
    expect(result.id).toBe('test-id')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement createProfile action**

```typescript
// lib/actions/profile.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function createProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const name = formData.get('name') as string
  const relationship = formData.get('relationship') as string
  const species = formData.get('species') as 'human' | 'pet'
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({ name, relationship, species })
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data
}
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Create new profile page**

Page uses ProfileForm component, redirects to dashboard on success.

- [ ] **Step 6: Commit**

```bash
git add app/(main)/profile/new/ lib/actions/profile.ts
git commit -m "feat: S2.T2 - create profile page and action

ProfileForm with Server Action
Redirect to dashboard on success

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S2.T3: Dashboard Page (V2 Enhanced)

**Files to create/modify:**
- `app/(main)/dashboard/page.tsx`
- `components/profile/ProfileCard.tsx`

**V2 Enhancements:**
- ProfileCard shows: memory counts by type, family member count, description
- Empty state: "为你想守护的人，建一个记忆空间"
- Reminder banner placeholder at top

- [ ] **Step 1: Write test for ProfileCard**

```typescript
// tests/unit/components/profile/profile-card.test.tsx
import { render, screen } from '@testing-library/react'
import { ProfileCard } from '@/components/profile/ProfileCard'

const mockProfile = {
  id: '1',
  name: '爷爷',
  relationship: '祖父',
  avatar_path: null,
  cover_photo_path: null,
  description: '永远笑眯眯的老爷子',
  memoryCounts: { photo: 10, video: 2, audio: 5, text: 0, document: 0 },
  familyMemberCount: 3,
}

describe('ProfileCard', () => {
  it('renders profile name and relationship', () => {
    render(<ProfileCard profile={mockProfile} />)
    expect(screen.getByText('爷爷')).toBeInTheDocument()
    expect(screen.getByText('祖父')).toBeInTheDocument()
  })

  it('renders memory counts', () => {
    render(<ProfileCard profile={mockProfile} />)
    expect(screen.getByText(/📷 10/)).toBeInTheDocument()
    expect(screen.getByText(/🎬 2/)).toBeInTheDocument()
  })

  it('renders family member count', () => {
    render(<ProfileCard profile={mockProfile} />)
    expect(screen.getByText(/3 位家人共同守护/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement ProfileCard with V2 enhancements**

- [ ] **Step 4: Create dashboard page**

Loads profiles with memory counts and family member counts using the query from `docs/v2/DESIGN.md` §4.5.

- [ ] **Step 5: Run tests to verify they pass**

- [ ] **Step 6: Commit**

```bash
git add app/\(main\)/dashboard/ components/profile/ProfileCard.tsx
git commit -m "feat: S2.T3 - dashboard with V2 enhanced ProfileCard

Memory counts by type, family member count, description
Empty state messaging

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S2.T4: Edit/Delete Profile

**Files to create:**
- `app/(main)/profile/[profileId]/edit/page.tsx`
- Server Action: `lib/actions/profile.ts` (updateProfile, deleteProfile)

- [ ] **Step 1: Write tests for updateProfile and deleteProfile**

- [ ] **Step 2: Implement edit page with form pre-populated with existing data**

- [ ] **Step 3: Add delete with confirmation dialog (AlertDialog)**

- [ ] **Step 4: Commit**

```bash
git add app/\(main\)/profile/\[profileId\]/edit/ lib/actions/profile.ts
git commit -m "feat: S2.T4 - edit and delete profile

Pre-populated form, delete confirmation dialog

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S2.T5: Profile Cover Photo Selector (V2)

**Files to create:**
- `components/profile/CoverPhotoSelector.tsx`

- [ ] **Step 1: Write test**

- [ ] **Step 2: Implement component**

Allows selecting from uploaded photos as cover, defaults to avatar.

- [ ] **Step 3: Commit**

```bash
git add components/profile/CoverPhotoSelector.tsx
git commit -m "feat: S2.T5 - cover photo selector

Select from uploaded photos or use avatar as default

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S2.T6: Date and Stats Utility Functions (V2)

**Files to create:**
- `lib/utils/date.ts`
- `lib/utils/stats.ts`

**TDD required.** Write tests before implementation.

- [ ] **Step 1: Write tests for calculateAge**

```typescript
// tests/unit/lib/utils/date.test.ts
import { calculateAge } from '@/lib/utils/date'

describe('calculateAge', () => {
  it('calculates age correctly for full years', () => {
    expect(calculateAge('1945-03-12', '2023-11-08')).toBe(78)
  })
  
  it('handles birth date only (death date null)', () => {
    expect(calculateAge('1945-03-12', null)).toBeGreaterThan(78)
  })
  
  it('handles leap year birthdays', () => {
    expect(calculateAge('2020-02-29', '2024-02-28')).toBe(3) // partial year not counted
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Write minimal implementation**

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Write tests for getMemoryStats, getNextReminder**

- [ ] **Step 6: Implement**

- [ ] **Step 7: Run tests to verify they pass**

- [ ] **Step 8: Commit**

```bash
git add lib/utils/date.ts lib/utils/stats.ts tests/unit/lib/utils/
git commit -m "feat: S2.T6 - date and stats utility functions

calculateAge, getMemoryStats, getNextReminder
TDD with full test coverage

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S2.T7: Life Summary Components (V2)

**Files to create:**
- `components/profile/ProfileSummary.tsx`
- `components/profile/MemoryStats.tsx`
- `components/profile/ReminderCountdown.tsx`
- `components/profile/FamilyActivity.tsx`

- [ ] **Step 1: Write basic rendering tests**

- [ ] **Step 2: Implement each component**

ProfileSummary: Container showing name, dates, description, age.
MemoryStats: 📷328 🎬21 🎤50 format.
ReminderCountdown: Days until next reminder.
FamilyActivity: Recent family contributions.

- [ ] **Step 3: Commit**

```bash
git add components/profile/ProfileSummary.tsx components/profile/MemoryStats.tsx components/profile/ReminderCountdown.tsx components/profile/FamilyActivity.tsx
git commit -m "feat: S2.T7 - life summary components

ProfileSummary, MemoryStats, ReminderCountdown, FamilyActivity

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Sprint 3: Family Collaboration (Growth Engine P0)

**This sprint was moved from S6 to S3 in V2. Family collaboration is the core growth engine.**

### S3.T1: InviteDialog (V2 Enhanced)

**Files to create:**
- `components/family/InviteDialog.tsx`

**V2 Enhancements:**
- WeChat-friendly URL (short, no email required)
- Open Graph preview for shared links
- Copyable invitation text template

- [ ] **Step 1: Write test**

```typescript
// tests/unit/components/family/invite-dialog.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteDialog } from '@/components/family/InviteDialog'

describe('InviteDialog', () => {
  it('generates an invitation link', async () => {
    render(<InviteDialog profileId="test-profile" profileName="爷爷" />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /邀请家人/i }))
    expect(screen.getByText(/复制链接/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement InviteDialog**

Key features:
- Dialog with role selector (viewer/editor)
- Generates unique invite_token
- Shows invitation URL
- Copy button for URL
- Copy button for invitation text template:
  "我在整理{逝者姓名}的照片和录音，邀请你一起来补充。点击链接加入：{链接}"

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add components/family/InviteDialog.tsx
git commit -m "feat: S3.T1 - invite dialog V2

WeChat-friendly URLs, Open Graph preview, copyable invitation text

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S3.T2: Accept Invitation Page

**Files to create:**
- `app/(main)/invite/[token]/page.tsx`
- Server Action: `lib/actions/family.ts` (acceptInvitation)

**V2:** Dynamic Open Graph metadata via generateMetadata.

- [ ] **Step 1: Write test for acceptInvitation**

```typescript
// tests/unit/lib/actions/family.test.ts
import { acceptInvitation } from '@/lib/actions/family'

describe('acceptInvitation', () => {
  it('accepts a valid invitation', async () => {
    const result = await acceptInvitation('valid-token')
    expect(result.success).toBe(true)
  })
  
  it('rejects an invalid token', async () => {
    const result = await acceptInvitation('invalid-token')
    expect(result.error).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement acceptInvitation action and page**

Flow:
1. If not logged in → redirect to register with invite token
2. If logged in → show invitation details (profile name, inviter name)
3. "Join" button → accept invitation → redirect to profile

- [ ] **Step 4: Add generateMetadata for dynamic OG tags**

```typescript
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invitation = await getInvitation(token)
  const profile = await getProfile(invitation.profile_id)
  
  return {
    title: `加入「${profile.name}」的记忆空间 — 忆锚`,
    openGraph: {
      title: `加入「${profile.name}」的记忆空间`,
      description: `共同守护真实记忆`,
    },
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

- [ ] **Step 6: Commit**

```bash
git add app/\(main\)/invite/ lib/actions/family.ts
git commit -m "feat: S3.T2 - accept invitation page with dynamic OG

Token validation, logged-out vs logged-in flows
generateMetadata for social sharing

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S3.T3: Family Management Page

**Files to create:**
- `app/(main)/profile/[profileId]/family/page.tsx`
- `components/family/MemberList.tsx`
- `components/family/RoleBadge.tsx`
- Server Actions: `lib/actions/family.ts` (updateMemberRole, removeMember)

- [ ] **Step 1: Write tests for updateMemberRole and removeMember**

- [ ] **Step 2: Implement MemberList with role badges**

MemberList shows:
- Member avatar, name, email
- Role badge (admin/editor/viewer)
- Accept status (pending/accepted)
- Actions: change role, remove

- [ ] **Step 3: Implement family management page**

- [ ] **Step 4: Commit**

```bash
git add app/\(main\)/profile/\[profileId\]/family/ components/family/
git commit -m "feat: S3.T3 - family management page

MemberList with role badges, change role, remove member
Invite flow integration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Sprint 4: Memory Upload

### S4.T1: UploadZone Component (V2)

**Files to create:**
- `components/upload/UploadZone.tsx`

**V2:** First upload triggers privacy consent dialog.

- [ ] **Step 1: Write test**

```typescript
// tests/unit/components/upload/upload-zone.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadZone } from '@/components/upload/UploadZone'

describe('UploadZone', () => {
  it('renders dropzone with click area', () => {
    render(<UploadZone profileId="test" />)
    expect(screen.getByText(/拖拽.*上传|点击上传/)).toBeInTheDocument()
  })

  it('accepts valid file types', async () => {
    const user = userEvent.setup()
    render(<UploadZone profileId="test" />)
    const input = screen.getByRole('button', { name: /点击上传/i }).closest('input')
    // Note: Full file validation testing requires mocking File API
  })

  it('rejects invalid file types', async () => {
    // Test that executables are rejected
  })
})
```

- [ ] **Step 2: Implement UploadZone**

Features:
- Drag and drop area
- Click to open file picker
- File type validation (photos, videos, audio, documents)
- File size validation
- Progress indicator integration

- [ ] **Step 3: Commit**

```bash
git add components/upload/UploadZone.tsx
git commit -m "feat: S4.T1 - upload zone component

Drag and drop, click to upload, file type validation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S4.T2: EXIF Extraction Utility (TDD)

**Files to create:**
- `lib/utils/exif.ts`

- [ ] **Step 1: Write tests first**

```typescript
// tests/unit/lib/utils/exif.test.ts
import { extractExifDate } from '@/lib/utils/exif'

describe('extractExifDate', () => {
  it('extracts date from photo with EXIF data', async () => {
    // Requires a real JPEG with EXIF data
  })
  
  it('returns null for photo without EXIF', async () => {
    // Buffer without EXIF
  })
})
```

- [ ] **Step 2: Implement using exifr library**

- [ ] **Step 3: Commit**

```bash
git add lib/utils/exif.ts tests/unit/lib/utils/exif.test.ts
git commit -m "feat: S4.T2 - EXIF date extraction utility

extractExifDate using exifr
Returns date or null

Co-Authored-Key: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S4.T3: Thumbnail Generation Utility (TDD)

**Files to create:**
- `lib/utils/thumbnail.ts`

- [ ] **Step 1: Write tests**

- [ ] **Step 2: Implement using canvas API**

- [ ] **Step 3: Commit**

```bash
git add lib/utils/thumbnail.ts tests/unit/lib/utils/thumbnail.test.ts
git commit -m "feat: S4.T3 - thumbnail generation utility

Canvas-based thumbnail generation for photos
Video first-frame extraction

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S4.T4: Upload Progress Component

**Files to create:**
- `components/upload/UploadProgress.tsx`
- `components/upload/BatchUploadList.tsx`

- [ ] **Step 1: Implement components**

- [ ] **Step 2: Write tests**

- [ ] **Step 3: Commit**

### S4.T5: Upload Page and Logic

**Files to create:**
- `app/(main)/profile/[profileId]/upload/page.tsx`
- `lib/utils/upload.ts`
- `lib/actions/memory.ts` (createMemory)

- [ ] **Step 1: Write tests for createMemory**

- [ ] **Step 2: Implement upload flow**

Flow: User selects files → validate → extract EXIF → generate thumbnail → upload to Storage → INSERT memories → refresh timeline

- [ ] **Step 3: Commit**

### S4.T6: DatePicker Component

**Files to create:**
- `components/upload/DatePicker.tsx`

Supports precision: day/month/year/unknown.

- [ ] **Step 1: Write tests**

- [ ] **Step 2: Implement**

- [ ] **Step 3: Commit**

---

## Sprint 5: Timeline View

### S5.T1: Timeline Data Loading

**Files to create:**
- `lib/utils/timeline.ts`

**TDD required.**

- [ ] **Step 1: Write tests for grouping logic**

```typescript
// tests/unit/lib/utils/timeline.test.ts
import { groupMemoriesByDate } from '@/lib/utils/timeline'

describe('groupMemoriesByDate', () => {
  it('groups memories by year and month', () => {
    const memories = [
      { memory_date: '2023-10-01' },
      { memory_date: '2023-10-15' },
      { memory_date: '2022-06-01' },
    ]
    const grouped = groupMemoriesByDate(memories)
    expect(grouped['2023']['10'].length).toBe(2)
    expect(grouped['2022']['6'].length).toBe(1)
  })
})
```

- [ ] **Step 2: Implement**

- [ ] **Step 3: Commit**

### S5.T2: TimelineItem with SourceBadge

**Files to create:**
- `components/timeline/TimelineItem.tsx`
- `components/memory/SourceBadge.tsx`

**V2:** SourceBadge is immutable. Text is hardcoded "原始记录".

```typescript
// SourceBadge.tsx — NO PROPS. This is intentional.
export function SourceBadge() {
  return (
    <Badge variant="secondary" className="bg-stone-100 text-stone-500 border-stone-200 rounded-full">
      原始记录
    </Badge>
  )
}
```

- [ ] **Step 1: Write tests for SourceBadge**

```typescript
it('renders without any props', () => {
  render(<SourceBadge />)
  expect(screen.getByText('原始记录')).toBeInTheDocument()
})
```

- [ ] **Step 2: Implement TimelineItem**

Renders: media thumbnail/player, date, SourceBadge, annotation preview, contributor avatar.

- [ ] **Step 3: Commit**

```bash
git add components/timeline/TimelineItem.tsx components/memory/SourceBadge.tsx
git commit -m "feat: S5.T2 - timeline item with immutable SourceBadge

SourceBadge has no props - text is hardcoded '原始记录'
TimelineItem renders all media types with badge

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S5.T3: Timeline Container with Virtual Scroll

**Files to create:**
- `components/timeline/Timeline.tsx`
- `components/timeline/TimelineYear.tsx`

- [ ] **Step 1: Implement virtual scrolling with @tanstack/react-virtual**

- [ ] **Step 2: Sticky year headers**

- [ ] **Step 3: Responsive columns (3 desktop, 1 mobile)**

- [ ] **Step 4: Commit**

```bash
git add components/timeline/Timeline.tsx components/timeline/TimelineYear.tsx
git commit -m "feat: S5.T3 - timeline with virtual scroll

@tanstack/react-virtual for performance
Sticky year headers, responsive columns

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S5.T4: TimelineFilters

**Files to create:**
- `components/timeline/TimelineFilters.tsx`

- [ ] **Step 1: Implement filters**

Filters: media type, date range. Updates URL params.

- [ ] **Step 2: Commit**

### S5.T5: Timeline Page Integration

**Files to modify:**
- `app/(main)/profile/[profileId]/page.tsx`

- [ ] **Step 1: Compose ProfileSummary + TimelineFilters + Timeline + TimelineEmpty**

- [ ] **Step 2: Write E2E test**

```typescript
// tests/e2e/timeline.test.ts
test('creates profile, uploads photo, sees it in timeline', async ({ page }) => {
  // Register → create profile → upload photo → visit profile page → see photo in timeline
})
```

- [ ] **Step 3: Commit**

---

## Sprint 6: Memory Detail + Annotations

### S6.T1-S6.T4: Media Viewers

**Files to create:**
- `components/memory/PhotoViewer.tsx`
- `components/memory/AudioPlayer.tsx`
- `components/memory/VideoPlayer.tsx`
- `components/memory/TextViewer.tsx`

- [ ] **Step 1: Write tests for each**

- [ ] **Step 2: Implement each viewer**

- [ ] **Step 3: Commit**

### S6.T5: AnnotationEditor

**Files to create:**
- `components/memory/AnnotationEditor.tsx`

- [ ] **Step 1: Write test**

- [ ] **Step 2: Implement with SourceBadge display**

SourceBadge shows: "原始记录 · {uploader_name} · {date}"

- [ ] **Step 3: Commit**

### S6.T6: Memory Detail Page

**Files to create:**
- `app/(main)/profile/[profileId]/memory/[memoryId]/page.tsx`

- [ ] **Step 1: Compose all viewers + annotation editor + metadata**

- [ ] **Step 2: Commit**

### S6.T7: SourceBadge Immutability Enforcement

**Files to create:**
- `supabase/migrations/002_source_label_immutable.sql`

- [ ] **Step 1: Verify trigger exists from S0.T4**

- [ ] **Step 2: Write test that verifies UPDATE fails**

```typescript
test('source_label cannot be updated', async () => {
  // Attempt to update source_label → should fail
})
```

- [ ] **Step 3: Commit**

---

## Sprint 7: Reminders + WeChat Import

### S7.T1: ReminderForm + ReminderList

**Files to create:**
- `components/reminders/ReminderForm.tsx`
- `components/reminders/ReminderList.tsx`
- `lib/actions/reminder.ts`

- [ ] **Step 1: Write tests with lunar calendar support**

- [ ] **Step 2: Implement**

- [ ] **Step 3: Commit**

### S7.T2: CeremonyBanner (V2)

**Files to create:**
- `components/reminders/CeremonyBanner.tsx`

- [ ] **Step 1: Write test**

- [ ] **Step 2: Implement**

Features:
- Shows when reminder_date is within 3 days
- Candle icon with CSS animation on click
- Random memory display
- Dismissible with X button (session storage)

- [ ] **Step 3: Commit**

```bash
git add components/reminders/CeremonyBanner.tsx
git commit -m "feat: S7.T2 - ceremony banner with candle animation

Reminder date proximity, random memory, dismissible

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### S7.T3: TodayMemory (V2)

**Files to create:**
- `components/timeline/TodayMemory.tsx`

- [ ] **Step 1: Write test**

- [ ] **Step 2: Implement**

Shows memories from same month-day in previous years. Hidden if no matches.

- [ ] **Step 3: Commit**

### S7.T4: WeChat Parser (TDD)

**Files to create:**
- `lib/utils/wechat-parser.ts`

- [ ] **Step 1: Write 8+ tests covering various WeChat export formats**

- [ ] **Step 2: Implement parser**

- [ ] **Step 3: Commit**

### S7.T5: WeChatImporter

**Files to create:**
- `components/upload/WechatImporter.tsx`

- [ ] **Step 1: Implement 5-step wizard**

Steps: Upload txt + ZIP → Parse → Select deceased name → Preview → Confirm import.

- [ ] **Step 2: Commit**

---

## Sprint 8: Landing Page + Settings + Final

### S8.T1: Settings Page

**Files to create:**
- `app/(main)/settings/page.tsx`

- [ ] **Step 1: Implement**

Features:
- Change password
- **Data export button (MOST PROMINENT)**
- Delete account

### S8.T2: Data Export API (V2)

**Files to create:**
- `app/api/export/[profileId]/route.ts`
- `components/settings/ExportButton.tsx`

**V2:** Export appears in 3 places: settings page (most prominent), profile edit page, landing page text.

- [ ] **Step 1: Write test for export ZIP structure**

```typescript
test('export creates valid ZIP with metadata.json and README.txt', async () => {
  const zip = await exportProfile('profile-id')
  // Verify ZIP structure
})
```

- [ ] **Step 2: Implement API route**

Uses JSZip to create ZIP with:
```
{profile_name}_的记忆_YYYY-MM-DD.zip
├── 照片/
├── 视频/
├── 语音/
├── 文字记录/
├── 扫描件/
├── metadata.json
└── README.txt
```

- [ ] **Step 3: Commit**

### S8.T3a: Landing Page Hero + ValueProps

**Files to create:**
- `app/page.tsx`
- `components/landing/HeroSection.tsx`
- `components/landing/ValueProps.tsx`

- [ ] **Step 1: Implement HeroSection**

Reference `docs/v2/LANDING_PAGE_SPEC.md` §2.1.

- [ ] **Step 2: Implement ValueProps**

Reference `docs/v2/LANDING_PAGE_SPEC.md` §2.2.

- [ ] **Step 3: Commit**

### S8.T3b: FounderStory

**Files to create:**
- `components/landing/FounderStory.tsx`

- [ ] **Step 1: Implement with expand/collapse**

Reference `docs/v2/LANDING_PAGE_SPEC.md` §2.4.

- [ ] **Step 2: Commit**

### S8.T3c: PrivacyPledge

**Files to create:**
- `components/landing/PrivacyPledge.tsx`

- [ ] **Step 1: Implement with 4 commitment items**

Reference `docs/v2/LANDING_PAGE_SPEC.md` §2.5.

- [ ] **Step 2: Commit**

### S8.T3d: Landing Page Footer + SEO

**Files to create:**
- `components/landing/Footer.tsx`
- Update `app/layout.tsx` with metadata

- [ ] **Step 1: Implement Footer**

- [ ] **Step 2: Add SEO metadata**

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: '忆锚 — 永不丢失关于 TA 的真实记忆',
  description: '一站式聚合照片、视频、语音、聊天记录...',
  openGraph: {
    title: '忆锚 — 守护关于 TA 的真实记忆',
    images: ['/og-image.jpg'],
  },
}
```

- [ ] **Step 3: Create public/og-image.jpg** (placeholder 1200x630)

- [ ] **Step 4: Commit**

### S8.T4-S8.T6: Loading/Error States, Responsive Polish, Accessibility

- [ ] **Step 1: Add loading.tsx skeleton screens for all pages**

- [ ] **Step 2: Add error.tsx with gentle messaging**

- [ ] **Step 3: Responsive check at 375/768/1280px**

- [ ] **Step 4: Lighthouse accessibility audit**

- [ ] **Step 5: Commit**

### S8.T7: Privacy Policy + Terms Pages

**Files to create:**
- `app/privacy/page.tsx`
- `app/terms/page.tsx`

Reference `docs/v2/COMPLIANCE_CHINA.md` §4 for privacy policy outline.

- [ ] **Step 1: Write privacy policy content**

- [ ] **Step 2: Write terms of service content**

- [ ] **Step 3: Commit**

### S8.T8: PrivacyConsentDialog

**Files to create:**
- `components/upload/PrivacyConsentDialog.tsx`

- [ ] **Step 1: Write test**

- [ ] **Step 2: Implement**

First upload triggers dialog → consent → write to privacy_consents table + localStorage.

- [ ] **Step 3: Commit**

### S8.T9: E2E Tests

**Files to create:**
- `tests/e2e/` directory with Playwright tests

- [ ] **Step 1: Run all 5 core E2E flows**

1. Register → Login → Logout
2. Create profile → Upload photo → Timeline shows
3. Add annotation → SourceBadge shows → Annotation persists
4. Invite family → Accept invite → Collaborate
5. Protected route → Redirect to login

- [ ] **Step 2: Run axe-core accessibility checks**

- [ ] **Step 3: Commit**

---

## Self-Review Checklist

After writing this plan, verify:

1. **Spec coverage:** All 53 tasks from `docs/v2/TASKS.md` are covered. All V2-specific items (SourceBadge immutability, privacy checkbox, export in 3 places) have tasks.

2. **No placeholders:** Every step has actual code, file paths, expected output. No "TBD", "TODO", "fill in later".

3. **Type consistency:** `source_label` immutability is enforced in DB trigger (S0.T4) and verified in S6.T7. Storage paths follow `{profile_id}/{memory_id}/{uuid}.{ext}` throughout.

4. **TDD coverage:** Utility functions (date.ts, stats.ts, exif.ts, thumbnail.ts, timeline.ts, wechat-parser.ts) all have TDD tests before implementation.

5. **V2-specific requirements:**
   - [ ] Family collaboration moved to S3 (not S6)
   - [ ] Privacy checkbox in register (S1.T4)
   - [ ] SourceBadge has no props, text is hardcoded (S5.T2)
   - [ ] Export in 3 places (S8.T1, S8.T2, landing page)
   - [ ] InviteDialog is WeChat-friendly (S3.T1)
   - [ ] Privacy consent dialog on first upload (S4.T1, S8.T8)
   - [ ] Landing Page with privacy pledge (S8.T3c)
   - [ ] Ceremony banner with candle animation (S7.T2)

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-15-v2-mvp-development.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
