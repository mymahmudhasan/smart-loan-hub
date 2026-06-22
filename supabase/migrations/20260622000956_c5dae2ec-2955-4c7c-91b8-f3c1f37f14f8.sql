CREATE TABLE public.contact_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotline TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  office TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.contact_info TO anon;
GRANT SELECT ON public.contact_info TO authenticated;
GRANT ALL ON public.contact_info TO service_role;

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contact info"
  ON public.contact_info FOR SELECT
  USING (true);

CREATE TRIGGER update_contact_info_updated_at
  BEFORE UPDATE ON public.contact_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.contact_info (hotline, email, office)
VALUES ('+880 1700-000000', 'support@smartloan.com.bd', 'Gulshan-1, Dhaka, Bangladesh');