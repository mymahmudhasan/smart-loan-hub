CREATE TABLE public.footer_banner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.footer_banner TO anon, authenticated;
GRANT ALL ON public.footer_banner TO service_role;

ALTER TABLE public.footer_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view footer banner"
  ON public.footer_banner FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage footer banner"
  ON public.footer_banner FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_footer_banner_updated_at
  BEFORE UPDATE ON public.footer_banner
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.footer_banner (title, subtitle, badges, links, active)
VALUES (
  'Your trust, our commitment',
  'Regulated, secure, and always here to help.',
  '[{"icon":"Lock","label":"256-bit encrypted"},{"icon":"Landmark","label":"Govt. compliant"},{"icon":"Headphones","label":"24/7 support"}]'::jsonb,
  '[]'::jsonb,
  true
);