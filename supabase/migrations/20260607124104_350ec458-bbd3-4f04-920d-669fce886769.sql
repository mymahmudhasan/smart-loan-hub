CREATE TABLE public.deposit_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bkash_number text,
  nagad_number text,
  bkash_active boolean NOT NULL DEFAULT true,
  nagad_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.deposit_config TO authenticated;
GRANT SELECT ON public.deposit_config TO anon;
GRANT ALL ON public.deposit_config TO service_role;

ALTER TABLE public.deposit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read deposit config" ON public.deposit_config FOR SELECT USING (true);

CREATE POLICY "Only admins can update deposit config" ON public.deposit_config
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_deposit_config_updated_at BEFORE UPDATE ON public.deposit_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.deposit_config (bkash_number, nagad_number, bkash_active, nagad_active)
VALUES ('01XXXXXXXXX', '01XXXXXXXXX', true, true)
ON CONFLICT DO NOTHING;