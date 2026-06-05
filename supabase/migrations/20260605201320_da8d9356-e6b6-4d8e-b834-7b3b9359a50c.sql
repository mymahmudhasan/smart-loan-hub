ALTER TABLE public.banner_offers
  ADD COLUMN IF NOT EXISTS cta_style text NOT NULL DEFAULT 'glass',
  ADD COLUMN IF NOT EXISTS text_style text NOT NULL DEFAULT 'classic';