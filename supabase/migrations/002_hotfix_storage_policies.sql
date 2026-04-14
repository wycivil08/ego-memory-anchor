-- Hotfix migrations applied to production
-- These fixes are required to align local schema with production

-- ============================================================
-- Fix 1: Add deleted_at column to profiles (soft delete)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================================
-- Fix 2: Security DEFINER functions to break RLS recursion
-- ============================================================
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS is_family_member(UUID);
DROP FUNCTION IF EXISTS is_profile_owner(UUID);

-- Create security definer function to check if user is family member (bypasses RLS)
CREATE OR REPLACE FUNCTION is_family_member(p_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_members
    WHERE family_members.profile_id = p_profile_id
    AND family_members.user_id = auth.uid()
    AND family_members.accepted_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create security definer function to check if user owns profile (bypasses RLS)
CREATE OR REPLACE FUNCTION is_profile_owner(p_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = p_profile_id
    AND profiles.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Fix 3: Storage policies for memories bucket
-- ============================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload memories" ON storage.objects;
DROP POLICY IF EXISTS "Users can view memories" ON storage.objects;

-- Create correct upload policy
-- Key fix: use storage.objects.name, not profiles.name
CREATE POLICY "Users can upload memories" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (storage.foldername(name))[1]::uuid
      AND profiles.user_id = auth.uid()
    )
  );

-- Create correct view policy
CREATE POLICY "Users can view memories" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memories'
    AND (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (storage.foldername(name))[1]::uuid
        AND profiles.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM family_members fm
        JOIN profiles p ON p.id = fm.profile_id
        WHERE p.id = (storage.foldername(name))[1]::uuid
        AND fm.user_id = auth.uid()
        AND fm.accepted_at IS NOT NULL
      )
    )
  );

-- ============================================================
-- Fix 4: Recreate RLS policies for profiles and family_members
-- ============================================================
-- Drop circular policies
DROP POLICY IF EXISTS "Family members can view profiles" ON profiles CASCADE;
DROP POLICY IF EXISTS "Profile owner manages family" ON family_members CASCADE;

-- Recreate using SECURITY DEFINER functions
CREATE POLICY "Family members can view profiles" ON profiles
  FOR SELECT USING (is_family_member(id));

CREATE POLICY "Profile owner can manage family" ON family_members
  FOR ALL USING (is_profile_owner(profile_id));
