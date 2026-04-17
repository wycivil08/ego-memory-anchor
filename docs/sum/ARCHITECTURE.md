# ARCHITECTURE — ego-memory-anchor (忆锚)

> Database schema, Supabase integration, RLS policies, Storage design, API structure.

---

## 1. Database Schema

### 1.1 Profiles (逝者档案)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_path TEXT,
  cover_photo_path TEXT,              -- V2: 封面照片
  birth_date DATE,
  death_date DATE,
  relationship TEXT NOT NULL,
  species TEXT DEFAULT 'human' CHECK (species IN ('human', 'pet')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `user_id` | uuid | FK → auth.users, NOT NULL | Creator |
| `name` | text | NOT NULL | Name/nickname |
| `avatar_path` | text | | Storage path |
| `cover_photo_path` | text | | **V2** Cover photo path |
| `birth_date` | date | | |
| `death_date` | date | | |
| `relationship` | text | NOT NULL | e.g., 'father', 'grandmother' |
| `species` | text | DEFAULT 'human' | 'human' or 'pet' |
| `description` | text | | One-line description |

### 1.2 Memories (记忆素材)

```sql
CREATE TYPE memory_type AS ENUM ('photo', 'video', 'audio', 'text', 'document');

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES auth.users(id),
  type memory_type NOT NULL,

  -- File info
  file_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  thumbnail_path TEXT,
  duration_seconds REAL,

  -- Content
  content TEXT,

  -- Metadata
  memory_date DATE,
  memory_date_precision TEXT DEFAULT 'day' CHECK (memory_date_precision IN ('day', 'month', 'year', 'unknown')),
  tags JSONB DEFAULT '[]'::JSONB,
  annotation TEXT,
  source_label TEXT DEFAULT '原始记录',  -- IMMUTABLE
  import_source TEXT DEFAULT 'upload' CHECK (import_source IN ('upload', 'wechat_import')),
  exif_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ                -- Soft delete
);
```

| Column | Type | Notes |
|--------|------|-------|
| `source_label` | text DEFAULT '原始记录' | **IMMutable** - DB trigger prevents UPDATE |
| `import_source` | text | 'upload' or 'wechat_import' |
| `exif_data` | jsonb | Original EXIF metadata preserved |
| `deleted_at` | timestamptz | Soft delete for data recovery |

### 1.3 Family Members (家庭协作)

```sql
CREATE TYPE family_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,  -- NULL if not yet registered
  invited_email TEXT,
  display_name TEXT,
  role family_role NOT NULL DEFAULT 'viewer',
  invite_token TEXT UNIQUE,             -- For invite links
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,              -- NULL until accepted
  deleted_at TIMESTAMPTZ
);
```

| Role | Permissions |
|------|-------------|
| `admin` | Full access + can manage family members |
| `editor` | Can add/edit memories |
| `viewer` | Read-only access |

### 1.4 Reminders (纪念日提醒)

```sql
CREATE TYPE recurrence_type AS ENUM ('once', 'yearly', 'lunar_yearly');

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  recurrence recurrence_type DEFAULT 'yearly',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

### 1.5 Privacy Consents (V2)

```sql
CREATE TABLE privacy_consents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  consent_type TEXT NOT NULL,  -- 'sensitive_data_upload'
  consented_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT              -- Compliance record
);
```

---

## 2. Row Level Security (RLS)

### 2.1 Core Principle
**All tables have RLS enabled. No public access.**

### 2.2 Profiles RLS

```sql
-- Owner has full CRUD
CREATE POLICY "Users can CRUD own profiles" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- Family members can VIEW (if accepted)
CREATE POLICY "Family members can view profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = profiles.id
      AND family_members.user_id = auth.uid()
      AND family_members.accepted_at IS NOT NULL
    )
  );
```

### 2.3 Memories RLS

```sql
-- Owner has full access
CREATE POLICY "Profile owner full access to memories" ON memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Family editors can INSERT
CREATE POLICY "Family editors can insert memories" ON memories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = memories.profile_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'editor')
      AND family_members.accepted_at IS NOT NULL
    )
  );

-- Family members can VIEW
CREATE POLICY "Family members can view memories" ON memories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = memories.profile_id
      AND family_members.user_id = auth.uid()
      AND family_members.accepted_at IS NOT NULL
    )
  );
```

### 2.4 Family Members RLS

```sql
-- Profile owner can manage family
CREATE POLICY "Profile owner manages family" ON family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = family_members.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Profile owner can invite
CREATE POLICY "Profile owner can invite members" ON family_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = family_members.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Allow inviting unregistered users
CREATE POLICY "Invite unregistered users" ON family_members
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Members see own record
CREATE POLICY "Members see own record" ON family_members
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
```

### 2.5 Reminders RLS

```sql
CREATE POLICY "Users manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);
```

---

## 3. Storage Design

### 3.1 Buckets

| Bucket | Public | File Size Limit | Purpose |
|--------|--------|-----------------|---------|
| `memories` | ✅ true | 500MB | All uploaded media |
| `avatars` | ✅ true | 5MB | Profile avatars and cover photos |

**Security Note:** UUID paths provide "security through obscurity". True security boundary is Supabase RLS policies. Even with public buckets, RLS still restricts access to authorized profile data.

### 3.2 Storage Path Convention

```
{profile_id}/{memory_id}/{uuid}.{ext}
```

Example: `550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000/abc123.jpg`

### 3.3 File Naming

- **Original filename** preserved in `memories.file_name` (user-visible)
- **Storage uses UUID filename** for uniqueness and security

### 3.4 Storage RLS Policies

```sql
-- Avatars: Owner can write
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Family members can read avatars
CREATE POLICY "Family members can view avatar" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.avatar_path = 'avatars/' || storage.foldername(name)::text
      AND EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.profile_id = profiles.id
        AND family_members.user_id = auth.uid()
        AND family_members.accepted_at IS NOT NULL
      )
    )
  );
```

---

## 4. SourceLabel Immutability

### 4.1 Database Trigger

```sql
CREATE OR REPLACE FUNCTION prevent_source_label_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source_label IS DISTINCT FROM OLD.source_label THEN
    RAISE EXCEPTION 'source_label is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_source_label_immutable
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION prevent_source_label_update();
```

### 4.2 URL Construction

```typescript
const getPublicUrl = (path: string): string => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`
}
```

---

## 5. Supabase Client Architecture

### 5.1 Middleware (Edge Runtime)

```typescript
// lib/supabase/middleware.ts
import { createMiddlewareClient } from '@supabase/ssr'

export async function createMiddlewareClient() {
  return createMiddlewareClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  })
}
```

### 5.2 Server Components

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        }
      }
    }
  )
}
```

### 5.3 Client Components

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 6. Data Export API

### 6.1 ZIP Structure

```
{profile_name}_的记忆_{YYYY-MM-DD}.zip
├── 照片/
│   └── {date}_{original_name}.{ext}
├── 视频/
├── 语音/
├── 文字记录/
├── 扫描件/
├── metadata.json      # Profile info + memory metadata + annotations
└── README.txt        # Export statement
```

### 6.2 metadata.json Structure

```json
{
  "profile": {
    "name": "...",
    "birth": "...",
    "death": "...",
    "relationship": "..."
  },
  "exported_at": "...",
  "total_memories": 42,
  "memories": [
    {
      "id": "...",
      "type": "photo",
      "date": "2023-10-01",
      "file": "照片/2023-10-01_国庆聚餐.jpg",
      "annotation": "...",
      "contributor": "...",
      "source_label": "原始记录"
    }
  ]
}
```

---

## 7. Indexes

```sql
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_memories_profile_date ON memories(profile_id, memory_date DESC);
CREATE INDEX idx_memories_type ON memories(profile_id, type);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX idx_memories_profile_id ON memories(profile_id);
CREATE INDEX idx_family_members_profile_id ON family_members(profile_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_token ON family_members(invite_token);
CREATE INDEX idx_reminders_profile_id ON reminders(profile_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
```

---

## 8. Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 9. Key TypeScript Types

### 9.1 Relationship Types

```typescript
export type Relationship =
  | 'father' | 'mother'
  | 'grandfather' | 'grandmother'
  | 'maternal_grandfather' | 'maternal_grandmother'
  | 'spouse' | 'child' | 'sibling' | 'friend'
  | 'pet_cat' | 'pet_dog' | 'pet_other'
  | 'other'

export const PET_RELATIONSHIPS: Relationship[] = ['pet_cat', 'pet_dog', 'pet_other']

export function isPetRelationship(rel: Relationship): boolean {
  return PET_RELATIONSHIPS.includes(rel)
}
```

### 9.2 Memory Types

```typescript
export type MemoryType = 'photo' | 'video' | 'audio' | 'text' | 'document'
export type DatePrecision = 'day' | 'month' | 'year' | 'unknown'
export type FamilyRole = 'admin' | 'editor' | 'viewer'
export type Recurrence = 'once' | 'yearly' | 'lunar_yearly'
```
