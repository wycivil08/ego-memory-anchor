# FEATURES — ego-memory-anchor (忆锚)

> Page structure, component tree, and feature breakdown by sprint.

---

## 1. Page Structure

### 1.1 Public Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Landing page (V2) with Hero, ValueProps, FounderStory, PrivacyPledge |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy (V2) |
| `/terms` | `app/terms/page.tsx` | Terms of service (V2) |

### 1.2 Auth Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `app/(auth)/login/page.tsx` | Email/password login |
| `/register` | `app/(auth)/register/page.tsx` | Registration with privacy checkbox |
| `/auth/callback` | `app/(auth)/callback/route.ts` | OAuth callback handler |

### 1.3 Protected Pages (require auth)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `app/(main)/dashboard/page.tsx` | Profile cards grid |
| `/profile/new` | `app/(main)/profile/new/page.tsx` | Create memorial profile |
| `/profile/[profileId]` | `app/(main)/profile/[profileId]/page.tsx` | Life summary + Timeline |
| `/profile/[profileId]/edit` | `app/(main)/profile/[profileId]/edit/page.tsx` | Edit profile |
| `/profile/[profileId]/upload` | `app/(main)/profile/[profileId]/upload/page.tsx` | Upload memories |
| `/profile/[profileId]/family` | `app/(main)/profile/[profileId]/family/page.tsx` | Family collaboration |
| `/profile/[profileId]/reminders` | `app/(main)/profile/[profileId]/reminders/page.tsx` | Memorial reminders |
| `/profile/[profileId]/memory/[memoryId]` | `app/(main)/profile/[profileId]/memory/[memoryId]/page.tsx` | Memory detail |
| `/settings` | `app/(main)/settings/page.tsx` | User settings + data export |
| `/invite/[token]` | `app/(main)/invite/[token]/page.tsx` | Accept family invite |

---

## 2. Component Tree

### 2.1 Layout Components

```
components/layout/
├── Sidebar.tsx        # Desktop left sidebar navigation
├── Header.tsx         # Mobile top header
├── MobileNav.tsx      # Mobile bottom navigation
└── UserMenu.tsx       # User dropdown menu (avatar-based)
```

### 2.2 Profile Components

```
components/profile/
├── ProfileCard.tsx          # Dashboard card with stats, family count
├── ProfileForm.tsx          # Create/edit form with avatar upload
├── ProfileSummary.tsx       # V2: Life summary container
├── MemoryStats.tsx         # V2: 📷328 🎥21 stats display
├── ReminderCountdown.tsx   # V2: Days until memorial date
└── FamilyActivity.tsx      # V2: Recent family contributions
```

### 2.3 Timeline Components

```
components/timeline/
├── Timeline.tsx             # Container with virtual scroll (@tanstack/react-virtual)
├── TimelineYear.tsx         # Year section header (sticky)
├── TimelineItem.tsx         # Memory card with SourceBadge
├── TimelineFilters.tsx      # Type/tag/date filters (URL params)
└── TimelineEmpty.tsx        # Warm empty state
```

### 2.4 Memory Components

```
components/memory/
├── MemoryCard.tsx           # Card wrapper for timeline items
├── MemoryDetail.tsx        # Full memory view container
├── PhotoViewer.tsx          # Image display with zoom
├── VideoPlayer.tsx          # Video playback
├── AudioPlayer.tsx          # Audio playback
├── TextViewer.tsx           # Text message bubbles
├── DocumentViewer.tsx       # PDF/document viewer
├── AnnotationEditor.tsx     # Family annotation input
└── SourceBadge.tsx         # "原始记录" immutable badge
```

### 2.5 Upload Components

```
components/upload/
├── UploadZone.tsx           # Drag-and-drop zone
├── UploadProgress.tsx       # Upload progress indicator
├── BatchUploadList.tsx      # Multiple file upload list
├── DatePicker.tsx           # Date input with precision (day/month/year/unknown)
├── WechatImporter.tsx       # V2: WeChat history import wizard
└── PrivacyConsentDialog.tsx # V2: First-upload consent
```

### 2.6 Family Components

```
components/family/
├── InviteDialog.tsx         # Generate shareable invite link
├── MemberList.tsx           # Family members list
└── RoleBadge.tsx            # Role indicator (admin/editor/viewer)
```

### 2.7 Reminder Components

```
components/reminders/
├── ReminderForm.tsx         # Create/edit reminder
├── ReminderList.tsx          # Reminder list with countdown
└── CeremonyBanner.tsx         # V2: Memorial ceremony banner with candle animation
```

### 2.8 Landing Components (V2)

```
components/landing/
├── HeroSection.tsx           # Hero with CTA
├── ValueProps.tsx            # Three value proposition cards
├── FounderStory.tsx         # Expandable founder narrative
├── PrivacyPledge.tsx        # Four trust promises
├── CTABanner.tsx             # Call-to-action banner
└── Footer.tsx                # Links + ICP placeholder
```

### 2.9 Settings Components

```
components/settings/
├── SettingsClient.tsx        # Settings page container
└── ExportButton.tsx         # Data export trigger
```

### 2.10 Common Components

```
components/common/
├── EmptyState.tsx            # Warm empty state message
├── LoadingSpinner.tsx        # Loading indicator
├── ConfirmDialog.tsx        # Confirmation modal
└── FileTypeIcon.tsx         # Media type icons
```

---

## 3. Sprint Feature Breakdown

### Sprint 0: Project Skeleton
| Task | Description |
|------|-------------|
| S0.T1 | Next.js 15 initialization |
| S0.T2 | Core dependencies (Supabase, exifr, jszip, etc.) |
| S0.T3 | Test environment setup (Vitest) |
| S0.T4 | Database schema migration |

### Sprint 1: Auth + Basic Layout
| Task | Description |
|------|-------------|
| S1.T1 | shadcn/ui initialization |
| S1.T2 | Supabase client configuration |
| S1.T3 | TypeScript type definitions |
| S1.T4 | Registration page (+ privacy checkbox V2) |
| S1.T5 | Login page |
| S1.T6 | Main layout (responsive sidebar/header) |

### Sprint 2: Memorial Profile CRUD + Life Summary
| Task | Description |
|------|-------------|
| S2.T1 | ProfileForm component |
| S2.T2 | Create profile page |
| S2.T3 | Dashboard with profile cards (+ stats, family count) |
| S2.T4 | Edit/delete profile |
| S2.T5 | **V2** Cover photo selection |
| S2.T6 | **V2** Age calculation + stats tools |
| S2.T7 | **V2** Life summary components |

### Sprint 3: Family Collaboration (Growth Engine)
| Task | Description |
|------|-------------|
| S3.T1 | InviteDialog (WeChat-friendly URLs, OG preview) |
| S3.T2 | Accept invite page (+ dynamic OG metadata) |
| S3.T3 | MemberList + family management page |

### Sprint 4: Memory Upload
| Task | Description |
|------|-------------|
| S4.T1 | UploadZone component |
| S4.T2 | EXIF extraction utility (TDD) |
| S4.T3 | Thumbnail generation (TDD) |
| S4.T4 | Upload progress components |
| S4.T5 | Upload page + logic (3 concurrent) |
| S4.T6 | DatePicker with precision |

### Sprint 5: Timeline View
| Task | Description |
|------|-------------|
| S5.T1 | Timeline data loading (year→month→day grouping) |
| S5.T2 | TimelineItem with SourceBadge |
| S5.T3 | Timeline container + virtual scroll |
| S5.T4 | TimelineFilters (URL params) |
| S5.T5 | Full timeline page integration |

### Sprint 6: Memory Detail + Annotations
| Task | Description |
|------|-------------|
| S6.T1 | PhotoViewer (zoom) |
| S6.T2 | AudioPlayer (waveform) |
| S6.T3 | VideoPlayer |
| S6.T4 | TextViewer (chat bubbles) |
| S6.T5 | AnnotationEditor + SourceBadge |
| S6.T6 | Memory detail page |
| S6.T7 | **V2** SourceLabel immutable enforcement |

### Sprint 7: Memorial Reminders + WeChat Import
| Task | Description |
|------|-------------|
| S7.T1 | ReminderForm + ReminderList (lunar support) |
| S7.T2 | **V2** CeremonyBanner (candle animation) |
| S7.T3 | **V2** TodayMemory (memories on this day) |
| S7.T4 | WeChat parser (TDD) |
| S7.T5 | WeChatImporter wizard |

### Sprint 8: Landing Page + Settings + Wrap-up (All Complete)
| Task | Description | Status |
|------|-------------|--------|
| S8.T1 | Settings page | ✅ Complete |
| S8.T2 | **V2** Data export (prominent in settings) | ✅ Complete |
| S8.T3a | **V2** Hero + ValueProps | ✅ Complete |
| S8.T3b | **V2** FounderStory | ✅ Complete |
| S8.T3c | **V2** PrivacyPledge | ✅ Complete |
| S8.T3d | **V2** Footer + SEO | ✅ Complete |
| S8.T4 | Global loading/error states | ✅ Complete |
| S8.T5 | Responsive + accessibility polish | ✅ Complete |
| S8.T6 | Deploy to Vercel | ✅ Complete |
| S8.T7 | **V2** Privacy policy + Terms pages | ✅ Complete |
| S8.T8 | **V2** Privacy consent dialog | ✅ Complete |
| S8.T9 | E2E tests (22 passed, 0 skipped) | ✅ Complete |

---

## 4. Core User Flows (E2E Coverage)

### Flow 1: Register → Login → Logout
1. Register with email + privacy consent
2. Logout
3. Login with credentials
4. Verify redirect to dashboard

### Flow 2: Create Profile → Upload Photo → Timeline Display
1. Create memorial profile (name, relationship, dates)
2. Navigate to profile
3. Upload photo
4. Verify photo appears in timeline

### Flow 3: Add Annotation → Verify Persistence
1. View memory detail
2. Add annotation
3. Refresh page
4. Verify annotation persists

### Flow 4: Invite Family → Accept Invite → Collaborative Editing
1. Generate invite link as profile owner
2. Accept invite in new browser context
3. Verify access to profile
4. Verify appropriate permissions

### Flow 5: Unauthenticated Access → Redirect
1. Attempt to access `/dashboard` without auth → redirect to login
2. Attempt to access `/profile/xxx` without auth → redirect to login
3. Verify login/register pages accessible without redirect

---

## 5. V2 New Features

### 5.1 Cover Photo Selection
- Users can select a cover photo from uploaded memories
- Default shows avatar if no cover selected
- Displayed on Dashboard ProfileCard

### 5.2 CeremonyBanner
- Triggers when reminder_date is within ±3 days
- Shows candle animation ("点亮蜡烛")
- Displays random memory from the profile
- Dismissible with X button (session-scoped)

### 5.3 TodayMemory
- Queries memories where month-day matches today
- Gentle display if found, hidden if no match

### 5.4 Privacy Consent Dialog
- Triggers on first upload attempt
- Stores consent in `privacy_consents` table + localStorage
- Does not re-trigger if already consented

### 5.5 WeChat Import
- 5-step wizard for importing WeChat history
- Supports photo, video, audio extraction
- Preserves original timestamps

---

## 6. Relationship Labels

```typescript
const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  father: '父亲',
  mother: '母亲',
  grandfather: '爷爷',
  grandmother: '奶奶',
  maternal_grandfather: '外公',
  maternal_grandmother: '外婆',
  spouse: '配偶',
  child: '子女',
  sibling: '兄弟姐妹',
  friend: '朋友',
  pet_cat: '宠物-猫',
  pet_dog: '宠物-狗',
  pet_other: '宠物-其他',
  other: '其他'
}
```

---

## 7. Family Role Labels

```typescript
const FAMILY_ROLE_LABELS: Record<FamilyRole, string> = {
  admin: '管理员',
  editor: '编辑',
  viewer: '查看'
}
```

---

## 8. Recurrence Labels

```typescript
const RECURRENCE_LABELS: Record<Recurrence, string> = {
  once: '一次性',
  yearly: '每年',
  lunar_yearly: '农历每年'
}
```
