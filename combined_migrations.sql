
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  nid_number text,
  address text,
  member_balance numeric NOT NULL DEFAULT 0,
  member_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto-create profile + member role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, nid_number, address)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.email,
    NEW.raw_user_meta_data ->> 'nid_number',
    NEW.raw_user_meta_data ->> 'address'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- KYC SUBMISSIONS
CREATE TABLE public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nid_number text,
  nid_front_url text,
  nid_back_url text,
  selfie_url text,
  status text NOT NULL DEFAULT 'pending',
  reviewer_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own kyc"
ON public.kyc_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own kyc"
ON public.kyc_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all kyc"
ON public.kyc_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update kyc"
ON public.kyc_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER kyc_updated_at BEFORE UPDATE ON public.kyc_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LOAN APPLICATIONS
CREATE TABLE public.loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  months integer NOT NULL,
  purpose text,
  emi numeric,
  status text NOT NULL DEFAULT 'pending',
  reviewer_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loan_applications TO authenticated;
GRANT ALL ON public.loan_applications TO service_role;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans"
ON public.loan_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own loans"
ON public.loan_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all loans"
ON public.loan_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update loans"
ON public.loan_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER loans_updated_at BEFORE UPDATE ON public.loan_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FRAUD FLAGS
CREATE TABLE public.fraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  created_by uuid REFERENCES auth.users(id),
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fraud_flags TO authenticated;
GRANT ALL ON public.fraud_flags TO service_role;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view fraud flags"
ON public.fraud_flags FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage fraud flags"
ON public.fraud_flags FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER fraud_updated_at BEFORE UPDATE ON public.fraud_flags
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ONE-TIME ADMIN BOOTSTRAP: first authenticated user becomes admin when none exists
CREATE OR REPLACE FUNCTION public.claim_admin_if_none()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count > 0 THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'bootstrap_admin', 'user_roles', auth.uid()::text, '{"note":"first admin claimed"}'::jsonb);
  RETURN true;
END; $$;

GRANT EXECUTE ON FUNCTION public.claim_admin_if_none() TO authenticated;

-- Trigger functions: no caller needs direct EXECUTE (triggers run as table owner)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Role check: only signed-in users (used by RLS); never anonymous
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Admin bootstrap: only signed-in users
REVOKE ALL ON FUNCTION public.claim_admin_if_none() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin_if_none() TO authenticated;

ALTER TABLE public.kyc_submissions
  ADD CONSTRAINT kyc_submissions_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.loan_applications
  ADD CONSTRAINT loan_applications_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.fraud_flags
  ADD CONSTRAINT fraud_flags_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
-- Transaction type enum
CREATE TYPE public.transaction_type AS ENUM (
  'deposit', 'withdrawal', 'emi_payment', 'disbursement', 'adjustment'
);

-- Transactions ledger
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  method text,
  status text NOT NULL DEFAULT 'completed',
  reference text,
  note text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Members can read their own transactions; admins can read all.
CREATE POLICY "Read own or admin transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
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
ALTER TABLE public.banner_offers
  ADD COLUMN IF NOT EXISTS cta_style text NOT NULL DEFAULT 'glass',
  ADD COLUMN IF NOT EXISTS text_style text NOT NULL DEFAULT 'classic';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approval_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS documents_requested text;
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
CREATE TABLE public.client_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL,
  reviewer_role text,
  rating smallint NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.client_reviews TO authenticated;
GRANT ALL ON public.client_reviews TO service_role;

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own review"
  ON public.client_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can view their own reviews"
  ON public.client_reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews"
  ON public.client_reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_client_reviews_updated_at
  BEFORE UPDATE ON public.client_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.client_reviews
  ADD COLUMN IF NOT EXISTS review_title text,
  ADD COLUMN IF NOT EXISTS avatar_url text;
-- Extend profiles with identity + financial details that loan providers need
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS marital_status text,
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS permanent_address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS employer_name text,
  ADD COLUMN IF NOT EXISTS monthly_income numeric,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS mobile_banking_provider text,
  ADD COLUMN IF NOT EXISTS mobile_banking_number text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS loan_purpose text;

-- Storage RLS: each member manages only their own folder in kyc-documents
CREATE POLICY "Members manage own kyc files - select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members manage own kyc files - insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members manage own kyc files - update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Members manage own kyc files - delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can read every member's documents for verification
CREATE POLICY "Admins read all kyc files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'kyc-documents' AND public.has_role(auth.uid(), 'admin'));
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

  INSERT INTO public.profiles (id, full_name, phone, email, nid_number, address, occupation, referral_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.email,
    NEW.raw_user_meta_data ->> 'nid_number',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'occupation',
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
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email = 'mymahmudhasan2000@gmail.com';
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
UPDATE public.banner_offers SET
  title = 'à§®% à¦¸à§à¦¦à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦¬à§à¦¯à¦¾à¦²à§‡à¦¨à§à¦¸à§‡à¦° à§§à§¦ à¦—à§à¦£ à¦ªà¦°à§à¦¯à¦¨à§à¦¤ à¦²à§‹à¦¨',
  subtitle = 'à¦­à§‡à¦°à¦¿à¦«à¦¾à¦¯à¦¼à§‡à¦¡ à¦®à§‡à¦®à§à¦¬à¦¾à¦°à¦°à¦¾ à¦¸à§à¦¬à¦šà§à¦›, à¦°à¦¿à¦¡à¦¿à¦‰à¦¸à¦¿à¦‚-à¦¬à§à¦¯à¦¾à¦²à§‡à¦¨à§à¦¸ à¦‡à¦à¦®à¦†à¦‡ à¦à¦¬à¦‚ à¦•à§‹à¦¨à§‹ à¦²à§à¦•à¦¾à¦¨à§‹ à¦«à¦¿ à¦›à¦¾à¦¡à¦¼à¦¾à¦‡ à¦¬à§‡à¦¶à¦¿ à¦²à§‹à¦¨ à¦¨à¦¿à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¦¨à¥¤',
  badge = 'à¦«à§à¦²à§à¦¯à¦¾à¦—à¦¶à¦¿à¦ª à¦…à¦«à¦¾à¦°',
  cta_label = 'à¦à¦–à¦¨à¦‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à§à¦¨'
WHERE id = '3457b6f7-6115-4256-b52b-b6a4bdc137fc';

UPDATE public.banner_offers SET
  title = 'à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦¬à¦¨à§à¦§à§ à¦°à§‡à¦«à¦¾à¦° à¦•à¦°à§‡ à¦†à¦¯à¦¼ à¦•à¦°à§à¦¨ à§³à§«à§¦à§¦',
  subtitle = 'à¦†à¦ªà¦¨à¦¾à¦° à¦°à§‡à¦«à¦¾à¦°à§‡à¦² à¦•à§‹à¦¡ à¦¶à§‡à¦¯à¦¼à¦¾à¦° à¦•à¦°à§à¦¨ â€” à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦­à§‡à¦°à¦¿à¦«à¦¾à¦¯à¦¼à§‡à¦¡ à¦…à§à¦¯à¦¾à¦•à¦¾à¦‰à¦¨à§à¦Ÿà§‡à¦° à¦œà¦¨à§à¦¯ à¦ªà¦¾à¦¨ à§³à§«à§¦à§¦ à¦«à§à¦°à¦¿à¥¤ à¦†à¦¯à¦¼à§‡à¦° à¦•à§‹à¦¨à§‹ à¦¸à§€à¦®à¦¾ à¦¨à§‡à¦‡à¥¤',
  badge = 'à¦°à§‡à¦«à¦¾à¦°à§‡à¦² à¦¬à§‹à¦¨à¦¾à¦¸',
  cta_label = 'à¦°à§‡à¦«à¦¾à¦° à¦•à¦°à¦¾ à¦¶à§à¦°à§ à¦•à¦°à§à¦¨'
WHERE id = '10f3787a-29d7-4f60-9da0-117546e3e981';

UPDATE public.banner_offers SET
  title = 'à¦œà¦®à¦¾ à¦¬à¦¾à¦¡à¦¼à¦¾à¦¨, à¦†à¦ªà¦¨à¦¾à¦° à¦²à¦¿à¦®à¦¿à¦Ÿ à¦¬à¦¾à¦¡à¦¼à¦¾à¦¨',
  subtitle = 'à¦¬à¦¿à¦•à¦¾à¦¶ à¦¬à¦¾ à¦¨à¦—à¦¦à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦Ÿà¦ª-à¦†à¦ª à¦•à¦°à§à¦¨ à¦à¦¬à¦‚ à¦¸à¦™à§à¦—à§‡ à¦¸à¦™à§à¦—à§‡ à¦†à¦ªà¦¨à¦¾à¦° à¦¯à§‹à¦—à§à¦¯ à¦²à§‹à¦¨à§‡à¦° à¦ªà¦°à¦¿à¦®à¦¾à¦£ à¦¬à¦¾à¦¡à¦¼à¦¤à§‡ à¦¦à§‡à¦–à§à¦¨à¥¤',
  badge = 'à¦¡à¦¿à¦ªà§‹à¦œà¦¿à¦Ÿ à¦¬à§à¦¸à§à¦Ÿ',
  cta_label = 'à¦®à§‡à¦®à§à¦¬à¦¾à¦° à¦¹à§‹à¦¨'
WHERE id = '62f82faa-1e98-4ff8-8ea8-4f1f8a96cace';
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
UPDATE public.footer_banner
SET title = 'à¦†à¦ªà¦¨à¦¾à¦° à¦¬à¦¿à¦¶à§à¦¬à¦¾à¦¸, à¦†à¦®à¦¾à¦¦à§‡à¦° à¦ªà§à¦°à¦¤à¦¿à¦¶à§à¦°à§à¦¤à¦¿',
    subtitle = 'à¦¨à¦¿à¦¯à¦¼à¦¨à§à¦¤à§à¦°à¦¿à¦¤, à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦à¦¬à¦‚ à¦¸à¦¬à¦¸à¦®à¦¯à¦¼ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯à§‡à¦° à¦œà¦¨à§à¦¯ à¦à¦–à¦¾à¦¨à§‡à¥¤',
    badges = '[{"icon":"Lock","label":"à§¨à§«à§¬-à¦¬à¦¿à¦Ÿ à¦à¦¨à¦•à§à¦°à¦¿à¦ªà§à¦Ÿà§‡à¦¡"},{"icon":"Landmark","label":"à¦¸à¦°à¦•à¦¾à¦°à¦¿ à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤"},{"icon":"Headphones","label":"à§¨à§ª/à§­ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾"}]'::jsonb,
    updated_at = now();
ALTER TABLE public.contact_info
  ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_message text NOT NULL DEFAULT '';
ALTER TABLE public.contact_info ADD COLUMN IF NOT EXISTS whatsapp_questions jsonb DEFAULT '[{"label":{"en":"I want to apply for a loan","bn":"à¦†à¦®à¦¿ à¦²à§‹à¦¨à§‡à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¤à§‡ à¦šà¦¾à¦‡"},"message":"à¦†à¦®à¦¿ à¦²à§‹à¦¨à§‡à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¤à§‡ à¦†à¦—à§à¦°à¦¹à§€à¥¤ à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"},{"label":{"en":"Check my loan status","bn":"à¦†à¦®à¦¾à¦° à¦²à§‹à¦¨à§‡à¦° à¦¸à§à¦Ÿà§à¦¯à¦¾à¦Ÿà¦¾à¦¸ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡"},"message":"à¦†à¦®à¦¾à¦° à¦²à§‹à¦¨ à¦†à¦¬à§‡à¦¦à¦¨à§‡à¦° à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨ à¦…à¦¬à¦¸à§à¦¥à¦¾ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"},{"label":{"en":"Help with EMI / payment","bn":"à¦‡à¦à¦®à¦†à¦‡ / à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¨à¦¿à¦¯à¦¼à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦šà¦¾à¦‡"},"message":"à¦†à¦®à¦¿ à¦†à¦®à¦¾à¦° à¦‡à¦à¦®à¦†à¦‡/à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"},{"label":{"en":"About deposit & membership","bn":"à¦œà¦®à¦¾ à¦“ à¦®à§‡à¦®à§à¦¬à¦¾à¦°à¦¶à¦¿à¦ª à¦¨à¦¿à¦¯à¦¼à§‡ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡"},"message":"à¦†à¦®à¦¿ à¦œà¦®à¦¾ à¦“ à¦®à§‡à¦®à§à¦¬à¦¾à¦°à¦¶à¦¿à¦ª à¦¸à¦®à§à¦ªà¦°à§à¦•à§‡ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"},{"label":{"en":"How long does loan approval take?","bn":"à¦²à§‹à¦¨ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¹à¦¤à§‡ à¦•à¦¤ à¦¸à¦®à§Ÿ à¦²à¦¾à¦—à§‡?"},"message":"à¦²à§‹à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¾à¦° à¦ªà¦° à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¹à¦¤à§‡ à¦¸à¦¾à¦§à¦¾à¦°à¦£à¦¤ à¦•à¦¤ à¦¸à¦®à§Ÿ à¦¬à¦¾ à¦¦à¦¿à¦¨ à¦²à¦¾à¦—à§‡ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"},{"label":{"en":"What is the repayment tenure?","bn":"à¦²à§‹à¦¨ à¦ªà¦°à¦¿à¦¶à§‹à¦§à§‡à¦° à¦®à§‡à§Ÿà¦¾à¦¦ à¦•à¦¤ à¦¦à¦¿à¦¨?"},"message":"à¦²à§‹à¦¨ à¦ªà¦°à¦¿à¦¶à§‹à¦§à§‡à¦° à¦¸à¦°à§à¦¬à¦¨à¦¿à¦®à§à¦¨ à¦“ à¦¸à¦°à§à¦¬à§‹à¦šà§à¦š à¦®à§‡à§Ÿà¦¾à¦¦à¦•à¦¾à¦² à¦•à¦¤ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"},{"label":{"en":"What documents are required to apply?","bn":"à¦†à¦¬à§‡à¦¦à¦¨à§‡à¦° à¦œà¦¨à§à¦¯ à¦•à¦¿ à¦•à¦¿ à¦¡à¦•à§à¦®à§‡à¦¨à§à¦Ÿà¦¸ à¦²à¦¾à¦—à¦¬à§‡?"},"message":"à¦²à§‹à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à¦°à¦¾à¦° à¦œà¦¨à§à¦¯ à¦•à¦¿ à¦•à¦¿ à¦ªà§à¦°à§Ÿà§‹à¦œà¦¨à§€à§Ÿ à¦•à¦¾à¦—à¦œà¦ªà¦¤à§à¦° à¦¬à¦¾ à¦¡à¦•à§à¦®à§‡à¦¨à§à¦Ÿà¦¸ à¦²à¦¾à¦—à¦¬à§‡ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"},{"label":{"en":"Are there any hidden fees or charges?","bn":"à¦•à§‹à¦¨à§‹ à¦¹à¦¿à¦¡à§‡à¦¨ à¦¬à¦¾ à¦…à¦¤à¦¿à¦°à¦¿à¦•à§à¦¤ à¦šà¦¾à¦°à§à¦œ à¦†à¦›à§‡ à¦•à¦¿?"},"message":"à¦²à§‹à¦¨ à¦¨à§‡à¦“à§Ÿà¦¾à¦° à¦•à§à¦·à§‡à¦¤à§à¦°à§‡ à¦¸à¦¾à¦°à§à¦­à¦¿à¦¸ à¦šà¦¾à¦°à§à¦œ à¦›à¦¾à§œà¦¾ à¦…à¦¨à§à¦¯ à¦•à§‹à¦¨à§‹ à¦…à¦¤à¦¿à¦°à¦¿à¦•à§à¦¤ à¦¬à¦¾ à¦²à§à¦•à¦¾à¦¨à§‹ à¦«à¦¿ à¦†à¦›à§‡ à¦•à¦¿ à¦¨à¦¾ à¦œà¦¾à¦¨à¦¤à§‡ à¦šà¦¾à¦‡à¥¤"}]'::jsonb;
