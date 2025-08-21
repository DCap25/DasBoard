-- Migration: Add preferred_language column to profiles table
-- Date: 2025-08-21
-- Description: Stores user's preferred language for UI localization

-- Add preferred_language column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- Add comment for documentation
COMMENT ON COLUMN profiles.preferred_language IS 'User preferred language code (en, es, fr, de, etc.)';

-- Update any existing profiles with the default language
UPDATE profiles 
SET preferred_language = 'en' 
WHERE preferred_language IS NULL;