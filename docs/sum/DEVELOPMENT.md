# DEVELOPMENT — ego-memory-anchor (忆锚)

> TDD workflow, testing strategy, git conventions, autonomous workflow, debugging rules.

---

## 1. Coding Standards

### 1.1 File Organization
- **Many small files > few large files**
- Target: 200-400 lines typical, **800 lines maximum**
- Extract utilities from large modules
- Organize by feature/domain, not by type

### 1.2 Naming Conventions
- All filenames: **English**
- All variable names: **English**
- All function names: **English**
- UI text visible to users: **Chinese**
- Comments: **English**

### 1.3 TypeScript Rules
- **No `any` types** - must use explicit type definitions
- Use `unknown` for external/untrusted input, narrow safely
- Use generics when type depends on caller
- Public APIs must have explicit parameter and return types

### 1.4 Immutability
- **Create new objects, NEVER mutate existing ones**
- Use spread operator for immutable updates

```typescript
// WRONG - mutation
function updateUser(user: User, name: string): User {
  user.name = name
  return user
}

// CORRECT - immutable
function updateUser(user: Readonly<User>, name: string): User {
  return { ...user, name }
}
```

### 1.5 Error Handling
- Always handle errors comprehensively
- User-friendly messages in UI-facing code
- Detailed logging on server side
- Never silently swallow errors

---

## 2. React/Next.js Rules

### 2.1 Component Architecture
- Default to **Server Components**
- Use `'use client'` only when interaction required
- Data fetching via Server Components + Supabase server client
- Form handling via Server Actions + `useActionState` (React 19)

### 2.2 State Management
- Use React `useState` / `useReducer` only
- **No external state libraries** (no Redux, Zustand, etc.)

### 2.3 Page Requirements
Every page must have:
- `loading.tsx` (skeleton loading state)
- `error.tsx` (gentle error message)

### 2.4 Path Aliases
```typescript
import { Button } from '@/components/ui/button'
import { createProfile } from '@/lib/actions/profile'
```

---

## 3. TDD Workflow (Mandatory)

### 3.1 Red-Green-Refactor Cycle

```
1. RED:    Write test first, define expected behavior
2. RUN:    Run test, confirm it fails
3. GREEN:  Write minimal code to make test pass
4. REFACTOR: Clean up code, tests still pass
```

### 3.2 Test-Driven Development Rules
- Tests are written **BEFORE** implementation
- Never modify test assertions to make tests pass - fix the implementation
- All tests must pass before commit
- Pre-commit hook enforces this

### 3.3 When to Use TDD
- **Unit tests**: Required for all utility functions
- **Server Action tests**: Required for all actions
- **Component tests**: Basic rendering tests
- **E2E tests**: Core user flows only

---

## 4. Testing Strategy

### 4.1 Test Pyramid

| Layer | Tool | Coverage Target | When to Write |
|-------|------|----------------|---------------|
| Unit | Vitest + jsdom | Utility functions 100% | Before implementation |
| Integration | Vitest + real Supabase | Server Actions 80% | Immediately after implementation |
| E2E | Playwright | 5 core flows | Sprint end |

### 4.2 Test File Location
- Test file lives **next to** source file
- Naming: `*.test.ts` or `*.test.tsx`

### 4.3 Unit Test Example

```typescript
// lib/utils/exif.test.ts
import { describe, it, expect } from 'vitest'
import { extractDateFromExif } from './exif'

describe('extractDateFromExif', () => {
  it('should extract date from EXIF data', () => {
    const exif = { DateTimeOriginal: '2023:10:01 14:30:00' }
    expect(extractDateFromExif(exif)).toBe('2023-10-01')
  })

  it('should return null when no date in EXIF', () => {
    const exif = {}
    expect(extractDateFromExif(exif)).toBeNull()
  })
})
```

### 4.4 Server Action Integration Test

```typescript
// lib/actions/profile.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createProfile } from './profile'

const testProfileId = crypto.randomUUID()

beforeAll(async () => {
  // Set up test data
})

afterAll(async () => {
  // Clean up test data
  await supabase.from('profiles').delete().eq('id', testProfileId)
})

it('should create a profile', async () => {
  const result = await createProfile(initialState, {
    name: 'Test Profile',
    relationship: 'father',
    // ...
  })
  expect(result.success).toBe(true)
})
```

### 4.5 E2E Test Structure

```typescript
// tests/e2e/core-flows.spec.ts
import { test, expect, Page } from '@playwright/test'
import { test as base } from './fixtures/seed'  // Extended test with seed fixture

test.describe('E2E Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should register, login, and logout', async ({ page }) => {
    // 1. Register
    await page.goto('/register')
    await page.getByLabel('邮箱').fill('test@example.com')
    // ...
  })

  // Tests requiring real profile/memory IDs use seed fixture:
  test('should upload a photo to profile', async ({ page, seed }) => {
    const data = await seed.setup()
    // Use real profile ID from seed data
  })
})
```

**E2E Fixtures** (`tests/e2e/fixtures/seed.ts`):
- Uses Supabase Service Role to create real test data (profile, memory, invite)
- Cleans up all data in `afterAll`
- Exports `loginAsOwner(page, seedData)` and `loginAsMember(page, seedData)` helpers

### 4.6 Supabase Testing Architecture

**Environment:**
```
Local dev/test: supabase start (:54321) - shared instance
CI/CD: supabase start + db push + vitest
Production: Supabase Cloud
```

**Test Isolation Strategy (UUID + cleanup):**
```typescript
const testProfileId = crypto.randomUUID()
const testUserId = crypto.randomUUID()

afterAll(async () => {
  // Clean in reverse dependency order
  await supabase.from('memories').delete().eq('profile_id', testProfileId)
  await supabase.from('family_members').delete().eq('profile_id', testProfileId)
  await supabase.from('reminders').delete().eq('profile_id', testProfileId)
  await supabase.from('profiles').delete().eq('id', testProfileId)
})
```

### 4.7 No Mocking Supabase Client
- ✅ **Utility function tests**: Pure functions, no Supabase needed
- ❌ **Server Action tests**: Must use real Supabase client, no `vi.mock()`
- ✅ **Component tests**: Use jsdom + mock data

### 4.8 Running Tests

```bash
# All unit tests
pnpm test --run

# Smart test selection (only changed files)
vitest --changed

# E2E tests (must run with --workers=1 to avoid auth state pollution)
npx playwright test --workers=1

# Full test suite
pnpm test --run && npx playwright test --workers=1
```

---

## 5. Git Conventions

### 5.1 Commit Message Format

```
<type>(<scope>): S{sprint}.T{task} - <description>

Types: feat, fix, refactor, test, docs, chore
```

### 5.2 Examples

```bash
feat(profile): S2.T2 - create profile page with form validation
fix(storage): sanitize filename to prevent encoding issues
test(timeline): add unit tests for date grouping
docs(readme): update API documentation
chore(deps): add jszip for WeChat import
```

### 5.3 Branch Strategy
- Main branch: `master`
- Feature branches: descriptive name
- PR into `master` after review

### 5.4 Pre-commit Hook
```bash
pnpm test --run && pnpm lint --max-warnings=0
```
- Tests must pass before commit
- Lint must pass with 0 warnings before commit
- **NEVER use `--no-verify`**

---

## 6. Autonomous Workflow (Claude Code)

### 6.1 Sprint Execution Flow

```
1. [READ] docs/v2/TASKS.md - Sprint N task list
2. [READ] docs/sum/ARCHITECTURE.md - Technical specs
3. [READ] docs/sum/DESIGN_SYSTEM.md - Design specs
4. [EXECUTE] Each task in order:
   a. Write test (RED)
   b. Run test - confirm failure
   c. Write implementation (GREEN)
   d. Run test - confirm pass
   e. Refactor
   f. git commit
5. [VERIFY] pnpm test --run && pnpm lint && pnpm build
6. [E2E] npx playwright test --workers=1
7. [REPORT] Completion status
```

### 6.2 Autonomous Actions (No Approval Needed)

| Action | Notes |
|--------|-------|
| Bug fix | Analyze → fix → test → deploy (max 3 attempts) |
| Refactor | Must not change functionality |
| Write tests | Run tests to verify |
| Commit code | Must follow commit format |
| Deploy to Vercel Preview | - |
| UI validation with Playwright MCP | `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click` |
| Backend verification | `node scripts/verify-all.mjs` (Service Role smoke tests) |

### 6.3 Approval Required Actions

| Action | Reason |
|--------|--------|
| Delete files | Except tmp/build/cache |
| Modify migration files | Data integrity |
| Add new dependencies | Compatibility |
| Modify RLS policies | Security |
| Modify auth logic | Security |

### 6.4 Debug-Fix Loop

```
Bug detected → Analyze → Attempt fix (max 3)
  ├── Success → Test → Deploy → Report (with screenshot)
  └── 2 failures → Stop → Report to user
```

---

## 7. Debugging Rules

### 7.1 Core Principles

1. **NEVER guess-and-check** - Always reproduce the bug first
2. **Read error messages completely** - Don't skim stack traces
3. **Fix fails twice** - Stop, re-analyze from scratch
4. **After fixing** - Run full test suite, not just affected test

### 7.2 Common Supabase Issues

| Issue | Solution |
|-------|----------|
| Upload succeeds but image won't load | Check bucket is `public: true` |
| RLS permission denied | Verify policy conditions, check `accepted_at IS NOT NULL` |
| Session lost | Check middleware token refresh |
| File not found | Verify Storage path matches DB record |

### 7.3 Storage URL Pattern

```typescript
const getPublicUrl = (path: string): string => {
  if (!path) return ''
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
}
```

---

## 8. Sprint QA Checklist

At the end of each sprint:

```bash
# 1. All unit tests pass
pnpm test --run

# 2. Production build succeeds
pnpm build

# 3. E2E tests pass
npx playwright test --workers=1

# 4. Accessibility check
# (Lighthouse accessibility > 90)

# 5. Verify no regression in existing features
```

---

## 9. Sprint Report Format

When a sprint is complete:

```markdown
## Sprint {N} Completion Report

### Completed Tasks
- S{N}.T1: Description
- S{N}.T2: Description
...

### Test Results
- Unit tests: X passed, Y failed
- Build: success/failed
- E2E: X passed, Y skipped

### Issues Found
- Issue 1: Description
- Issue 2: Description

### Recommendations
- Recommendation 1
- Recommendation 2
```

---

## 10. Key Reminders

1. **Don't skip tests** - TDD is the quality floor
2. **Don't execute multiple sprints at once** - Complete and verify one sprint before next
3. **遇到 Supabase RLS 问题** - Check STORAGE_DESIGN.md troubleshooting
4. **UI不对劲** - Playwright screenshot → include in report
5. **source_label 必须不可变** - Trigger must be in migration
6. **2次失败** - Stop and report to user

---

## 11. Environment Setup

### 11.1 Local Development

```bash
# Install dependencies
pnpm install

# Start Supabase local
supabase start

# Start dev server
pnpm dev

# Run tests
pnpm test --run
```

### 11.2 Supabase CLI

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Stop local Supabase
supabase stop

# Check status
supabase status
```

### 11.3 Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

> **Never commit .env.local or any secrets**
