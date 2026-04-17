# PROJECT_OVERVIEW — ego-memory-anchor (忆锚)

> 面向丧亲/丧宠人群的真实记忆聚合平台。核心理念：守护真实记录，对抗第二重丧失。绝不生成合成内容。

---

## 1. Mission & Vision

**这不是一个网盘应用。** 忆锚是一个数字纪念空间——为逝者建立，有生命摘要、有时间线、有家人协作、有纪念日系统。

### 1.1 Core Differentiators

| Dimension | iCloud / 百度网盘 | 忆锚 |
|-----------|------------------|------|
| Basic Unit | Folder | **Memorial Profile** (name, avatar, dates, relationship) |
| Organization | Manual user sorting | **Auto Timeline** (EXIF/manual date → life narrative) |
| Permission Model | "Share link" | **Family Roles** (owner/editor/viewer, invite-based) |
| Emotional Attribute | None | **Memorial System** (birthdays, anniversaries, lunar calendar) |
| Authenticity Guarantee | None | **"原始记录" Badge** (immutable per-item label) |
| Narrative Function | None | **Family Annotations** (multi-perspective storytelling) |
| Cultural Adaptation | None | **Lunar Calendar** + Qingming reminders |
| Ritual Feel | Open a tool | **Open someone's life story** |

### 1.2 Core Principle

> **"死亡不是终点，遗忘才是。"**

Julia Shaw's research warns: "AI is a perfect false memory machine."
Product strategy: Visual confirmation of authenticity at every touchpoint builds psychological safety.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, Server Components by default) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 + shadcn/ui (stone warm color theme) |
| Backend | Supabase (Auth + Postgres + Storage + RLS + Edge Functions) |
| Testing | Vitest + React Testing Library + Playwright |
| Deployment | Vercel (overseas-first, overseas Chinese market) |
| Package Manager | pnpm |
| Key Libraries | `exifr` (EXIF), `jszip` (WeChat import), `@tanstack/react-virtual` (virtual scroll), `lunar-javascript` (lunar calendar) |

### 2.1 Project Structure

```
ego-memory-anchor/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── callback/route.ts
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/
│   │   │   ├── new/page.tsx
│   │   │   └── [profileId]/
│   │   │       ├── page.tsx          # Life summary + Timeline
│   │   │       ├── edit/page.tsx
│   │   │       ├── upload/page.tsx
│   │   │       ├── memory/[memoryId]/page.tsx
│   │   │       ├── family/page.tsx
│   │   │       └── reminders/page.tsx
│   │   ├── settings/page.tsx
│   │   └── invite/[token]/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── page.tsx                      # Landing page (V2)
│   └── layout.tsx
├── components/
│   ├── ui/                           # shadcn/ui
│   ├── layout/                       # Sidebar, Header, MobileNav, UserMenu
│   ├── profile/                      # ProfileCard, ProfileForm, ProfileSummary
│   ├── timeline/                     # Timeline, TimelineItem, TimelineFilters
│   ├── memory/                       # PhotoViewer, VideoPlayer, SourceBadge
│   ├── upload/                       # UploadZone, BatchUploadList
│   ├── family/                       # InviteDialog, MemberList, RoleBadge
│   ├── reminders/                    # ReminderForm, CeremonyBanner
│   ├── landing/                      # HeroSection, ValueProps, PrivacyPledge
│   └── common/                       # EmptyState, LoadingSpinner
├── lib/
│   ├── supabase/                    # server.ts, middleware.ts
│   ├── actions/                      # profile.ts, memory.ts, family.ts, reminder.ts
│   ├── utils/                       # exif.ts, file.ts, storage.ts, thumbnail.ts
│   └── types/                       # index.ts (all TypeScript interfaces)
├── supabase/migrations/
├── tests/
│   ├── fixtures/
│   ├── unit/
│   └── e2e/
└── docs/sum/                        # This documentation set
```

---

## 3. Security Red Lines (NEVER Violate)

| Rule | Rationale |
|------|-----------|
| Never generate synthetic content about the deceased | Trust architecture - authenticity is the product |
| Never create tables without RLS | Data isolation is mandatory |
| Never allow `source_label` modification | DB trigger enforces immutability |
| Never store sensitive personal data in client localStorage | Privacy-by-design (consent marker only exception) |
| Never introduce analytics, ads, or third-party tracking SDKs | Trust product, not a data harvesting tool |
| Never skip tests before commit | Quality gate, pre-commit hook enforced |
| Never modify .claudeignore or lint config to bypass checks | Integrity of quality gates |
| Registration must include privacy policy consent checkbox | Legal compliance + trust |
| Data export must be most prominent in settings page | Trust anchor design |

---

## 4. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Why Web not App | DPM oscillation theory; zero-friction family collaboration; iteration speed |
| Why no AI chatbot | External bonding risk; research evidence only 10-person sample |
| Why overseas deployment first | Avoid data cross-border compliance blocking MVP |
| Why family collaboration is P0 | Core growth engine (fission coefficient) |
| Why export is P0 | Trust anchor, not a feature |
| Why SourceBadge is immutable | Authenticity promise must be institutionalized |

---

## 5. Authentication & Authorization

### 5.1 Auth Flow
- Email/password registration with privacy policy checkbox
- Supabase Auth handles session management
- Middleware (`middleware.ts`) enforces protected routes
- JWT tokens stored in HTTP-only cookies via `@supabase/ssr`

### 5.2 Protected Routes
```typescript
const protectedPaths = ['/dashboard', '/profile', '/settings']
const authPaths = ['/login', '/register']
```

### 5.3 Session Management
- `createMiddlewareClient` for Edge Runtime
- `createServerClient` for Server Components
- `createBrowserClient` for Client Components

---

## 6. Data Model (High-Level ERD)

```
auth.users (Supabase Auth)
│
├── 1:N ──> profiles (Memorial Profiles)
│              │
│              ├── 1:N ──> memories (Memory Materials)
│              ├── 1:N ──> family_members (Family Collaboration)
│              └── 1:N ──> reminders (Memorial Reminders)
│
└── 1:N ──> family_members (Invite Records)
```

### 6.1 Privacy Consent
- `privacy_consents` table tracks user consent for sensitive data uploads
- Required before first upload

---

## 7. Quality Gates

```bash
pnpm test --run          # 222 unit tests must pass
pnpm build               # Production build must succeed
npx playwright test      # E2E tests (run with --workers=1)
```

### 7.1 Pre-commit Hook
```bash
pnpm test --run
```
Blocked if tests fail. **NEVER use `--no-verify` to bypass.**

---

## 8. Git Conventions

### 8.1 Commit Message Format
```
<type>(<scope>): S{sprint}.T{task} - <description>

Types: feat, fix, refactor, test, docs, chore
```

### 8.2 Example
```
feat(profile): S2.T2 - create profile page with form validation
fix(storage): sanitize filename to prevent encoding issues
```

### 8.3 Branch Strategy
- Main branch: `master`
- Work on feature branches, PR into master
- Commit after each task completion

---

## 9. Model Allocation

| Task Type | Model |
|-----------|-------|
| Planning, architecture, code review | **opus** |
| Implementation subagents | **sonnet** |
| Explore subagents | **haiku** |
| Subagent fails twice → escalate to **opus** |

---

## 10. Debugging Rules

1. **NEVER guess-and-check.** Always reproduce the bug first.
2. **Read error messages and stack traces completely** before proposing fixes.
3. **When a fix attempt fails twice**, stop and re-analyze from scratch.
4. **After fixing**, run the full test suite, not just the affected test.
