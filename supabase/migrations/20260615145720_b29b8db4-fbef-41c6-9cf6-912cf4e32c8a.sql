CREATE TABLE public.payment_gateway_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key text,
  base_url text,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.payment_gateway_config TO service_role;

ALTER TABLE public.payment_gateway_config ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_payment_gateway_config_updated_at
  BEFORE UPDATE ON public.payment_gateway_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_gateway_config (api_key, base_url, is_active)
VALUES (NULL, 'https://pay.auratradeai.tech', true);