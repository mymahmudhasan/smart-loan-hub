CREATE TABLE public.site_branding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  favicon_url TEXT,
  brand_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_branding TO anon, authenticated;
GRANT ALL ON public.site_branding TO service_role;

ALTER TABLE public.site_branding ENABLE ROW LEVEL SECURITY;

-- Branding is public information shown on every page.
CREATE POLICY "Anyone can read branding"
ON public.site_branding
FOR SELECT
TO anon, authenticated
USING (true);

-- Writes happen only through admin server functions (service_role), so no
-- direct write policies are granted to anon/authenticated.

CREATE TRIGGER update_site_branding_updated_at
BEFORE UPDATE ON public.site_branding
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_branding (brand_name) VALUES (NULL);