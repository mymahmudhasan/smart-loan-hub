ALTER TABLE public.client_reviews
  ADD COLUMN IF NOT EXISTS review_title text,
  ADD COLUMN IF NOT EXISTS avatar_url text;