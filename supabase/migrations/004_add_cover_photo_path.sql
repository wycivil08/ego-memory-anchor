-- Add cover_photo_path column to profiles table
-- This column stores the Storage path for the profile's cover photo

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_path TEXT;