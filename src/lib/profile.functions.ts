import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { logAudit } from "./admin.server";

export type MemberProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  nid_number: string | null;
  address: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  marital_status: string | null;
  father_name: string | null;
  mother_name: string | null;
  permanent_address: string | null;
  city: string | null;
  postal_code: string | null;
  occupation: string | null;
  employment_type: string | null;
  employer_name: string | null;
  monthly_income: number | null;
  bank_name: string | null;
  bank_account_number: string | null;
  mobile_banking_provider: string | null;
  mobile_banking_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  loan_purpose: string | null;
  member_status: string;
  member_balance: number | null;
};

export type MyKyc = {
  status: string;
  nid_number: string | null;
  nid_front_url: string | null;
  nid_back_url: string | null;
  selfie_url: string | null;
  reviewer_notes: string | null;
  created_at: string;
} | null;

// ---------- Read my profile + latest KYC submission ----------
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const uid = context.userId;
    const [profileR, kycR] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabaseAdmin
        .from("kyc_submissions")
        .select("status, nid_number, nid_front_url, nid_back_url, selfie_url, reviewer_notes, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (profileR.error) throw new Error(profileR.error.message);

    const profile = profileR.data as MemberProfile;

    // The profile photo (live pic from approved KYC) lives in a private bucket,
    // so hand the client a short-lived signed URL it can render directly.
    let photoUrl: string | null = null;
    if (profile?.photo_url) {
      if (/^https?:\/\//i.test(profile.photo_url)) {
        photoUrl = profile.photo_url;
      } else {
        const { data: signed } = await supabaseAdmin.storage
          .from("kyc-documents")
          .createSignedUrl(profile.photo_url, 60 * 60);
        photoUrl = signed?.signedUrl ?? null;
      }
    }

    return {
      profile,
      kyc: (kycR.data ?? null) as MyKyc,
      photoUrl,
    };
  });

const opt = (max: number) => z.string().trim().max(max).optional().nullable();

const profileInput = z.object({
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  date_of_birth: opt(20),
  gender: opt(20),
  marital_status: opt(20),
  father_name: opt(100),
  mother_name: opt(100),
  nid_number: opt(40),
  address: opt(300),
  permanent_address: opt(300),
  city: opt(80),
  postal_code: opt(20),
  occupation: opt(100),
  employment_type: opt(40),
  employer_name: opt(120),
  monthly_income: z.number().nonnegative().max(100_000_000).optional().nullable(),
  bank_name: opt(120),
  bank_account_number: opt(40),
  mobile_banking_provider: opt(40),
  mobile_banking_number: opt(20),
  emergency_contact_name: opt(100),
  emergency_contact_phone: opt(20),
  loan_purpose: opt(300),
  photo_url: opt(500),
});

// ---------- Update my profile ----------
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileInput.parse(d))
  .handler(async ({ data, context }) => {
    const clean = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const update = { ...clean, updated_at: new Date().toISOString() } as never;
    const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", context.userId);
    if (error) throw new Error(error.message);
    await logAudit({
      actorId: context.userId,
      action: "member_update_profile",
      entityType: "profiles",
      entityId: context.userId,
    });
    return { ok: true };
  });

// ---------- Submit / resubmit KYC documents ----------
const kycInput = z.object({
  nid_number: z.string().trim().min(5).max(40),
  nid_front_url: z.string().trim().min(1).max(500),
  nid_back_url: z.string().trim().min(1).max(500),
  selfie_url: z.string().trim().min(1).max(500),
});

export const submitKyc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => kycInput.parse(d))
  .handler(async ({ data, context }) => {
    const uid = context.userId;
    const { error } = await supabaseAdmin.from("kyc_submissions").insert({
      user_id: uid,
      nid_number: data.nid_number,
      nid_front_url: data.nid_front_url,
      nid_back_url: data.nid_back_url,
      selfie_url: data.selfie_url,
      status: "pending",
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("profiles")
      .update({ nid_number: data.nid_number, member_status: "pending", updated_at: new Date().toISOString() })
      .eq("id", uid);

    await logAudit({
      actorId: uid,
      action: "member_submit_kyc",
      entityType: "kyc_submissions",
      entityId: uid,
    });
    return { ok: true };
  });
