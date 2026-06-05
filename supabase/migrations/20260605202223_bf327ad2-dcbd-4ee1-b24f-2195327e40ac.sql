ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approval_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS documents_requested text;