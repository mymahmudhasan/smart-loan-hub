
ALTER TABLE public.kyc_submissions
  ADD CONSTRAINT kyc_submissions_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.loan_applications
  ADD CONSTRAINT loan_applications_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.fraud_flags
  ADD CONSTRAINT fraud_flags_profile_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
