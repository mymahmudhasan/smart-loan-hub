-- ===== Referral code on profiles =====
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text;
UPDATE public.profiles
  SET referral_code = upper(substr(replace(id::text, '-', ''), 1, 8))
  WHERE referral_code IS NULL;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_referral_code_key UNIQUE (referral_code);

-- ===== Banner offers =====
CREATE TABLE public.banner_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  badge text,
  cta_label text NOT NULL DEFAULT 'Apply Now',
  cta_href text NOT NULL DEFAULT '/signup',
  theme text NOT NULL DEFAULT 'primary',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banner_offers TO anon;
GRANT SELECT ON public.banner_offers TO authenticated;
GRANT ALL ON public.banner_offers TO service_role;

ALTER TABLE public.banner_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offers"
  ON public.banner_offers FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins manage offers"
  ON public.banner_offers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_banner_offers_updated_at
  BEFORE UPDATE ON public.banner_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Referrals =====
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_amount numeric NOT NULL DEFAULT 500,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_id)
);

GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view their own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "Admins view all referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Updated new-user handler with referral support =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_code text;
  ref_code text;
  referrer uuid;
BEGIN
  new_code := upper(substr(replace(NEW.id::text, '-', ''), 1, 8));

  INSERT INTO public.profiles (id, full_name, phone, email, nid_number, address, referral_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.email,
    NEW.raw_user_meta_data ->> 'nid_number',
    NEW.raw_user_meta_data ->> 'address',
    new_code
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;

  ref_code := upper(nullif(trim(NEW.raw_user_meta_data ->> 'referred_by'), ''));
  IF ref_code IS NOT NULL THEN
    SELECT id INTO referrer FROM public.profiles
      WHERE referral_code = ref_code AND id <> NEW.id
      LIMIT 1;
    IF referrer IS NOT NULL THEN
      INSERT INTO public.referrals (referrer_id, referred_id, reward_amount, status)
      VALUES (referrer, NEW.id, 500, 'pending')
      ON CONFLICT (referred_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;