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