ALTER TABLE public.contact_info
  ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_message text NOT NULL DEFAULT '';