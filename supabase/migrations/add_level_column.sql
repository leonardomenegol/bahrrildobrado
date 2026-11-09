-- Add debate level column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Open'
  CHECK (level IN ('Open', 'Novice'));
