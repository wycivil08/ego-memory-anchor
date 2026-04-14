-- ego-memory-anchor Database Schema
-- Run with: supabase db push

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (逝者档案)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_path TEXT,
  birth_date DATE,
  death_date DATE,
  relationship TEXT NOT NULL,
  species TEXT DEFAULT 'human' CHECK (species IN ('human', 'pet')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Memories (记忆素材)
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
  source_label TEXT DEFAULT '原始记录',
  import_source TEXT DEFAULT 'upload' CHECK (import_source IN ('upload', 'wechat_import')),
  exif_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Family Members (家庭协作)
CREATE TYPE family_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  invited_email TEXT,
  display_name TEXT,
  role family_role NOT NULL DEFAULT 'viewer',
  invite_token TEXT UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Reminders (纪念日提醒)
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

-- ============================================================
-- INDEXES
-- ============================================================
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can CRUD own profiles" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Family members can view profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = profiles.id
      AND family_members.user_id = auth.uid()
      AND family_members.accepted_at IS NOT NULL
    )
  );

-- Memories RLS
CREATE POLICY "Profile owner full access to memories" ON memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Family members can view memories" ON memories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = memories.profile_id
      AND family_members.user_id = auth.uid()
      AND family_members.accepted_at IS NOT NULL
    )
  );

-- Family Members RLS
CREATE POLICY "Profile owner manages family" ON family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = family_members.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Profile owner can invite members" ON family_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = family_members.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Invite unregistered users" ON family_members
  FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "Members see own record" ON family_members
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- Reminders RLS
CREATE POLICY "Users manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/webp']),
  ('memories', 'memories', false, 524288000, ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/m4a', 'audio/ogg', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Memories storage policies handled via RLS on memories table

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
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

-- ============================================================
-- ANON USAGE (for API if needed)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
