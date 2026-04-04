"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { MatchMutualEmail, getMatchMutualSubject } from "@/lib/emails";

interface ConsentResult {
  success: boolean;
  mutual?: boolean;
  consentId?: string;
  error?: string;
}

/**
 * Express interest in a match candidate (FN-5.1.1.1).
 * If the other user has already expressed interest, marks as mutual.
 */
export async function expressInterest(
  candidateId: string
): Promise<ConsentResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (user.id === candidateId) {
    return { success: false, error: "Cannot consent to yourself" };
  }

  // Check if we already expressed interest
  const { data: existing } = await supabase
    .from("consent_records")
    .select("id, status")
    .eq("from_user_id", user.id)
    .eq("to_user_id", candidateId)
    .single();

  if (existing) {
    return { success: false, error: "Interest already expressed" };
  }

  // Check if other user already expressed interest in us
  const { data: reverse } = await supabase
    .from("consent_records")
    .select("id, status")
    .eq("from_user_id", candidateId)
    .eq("to_user_id", user.id)
    .single();

  if (reverse && reverse.status === "pending") {
    // Mutual match! Update existing record to accepted
    await supabase
      .from("consent_records")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", reverse.id);

    // Also create our direction as accepted
    await supabase
      .from("consent_records")
      .insert({
        from_user_id: user.id,
        to_user_id: candidateId,
        status: "accepted",
      });

    // Audit
    await supabase.from("audit_events").insert({
      user_id: user.id,
      action: "mutual_consent",
      entity_type: "consent_records",
      entity_id: reverse.id,
      metadata: { candidateId },
    });

    // Send mutual match emails to both users (fire-and-forget)
    (async () => {
      try {
        // Fetch both profiles + auth emails
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", [user.id, candidateId]);

        const myProfile = profiles?.find((p) => p.user_id === user.id);
        const theirProfile = profiles?.find((p) => p.user_id === candidateId);

        // Fetch match score
        const { data: score } = await supabase
          .from("matching_scores")
          .select("total_score")
          .or(
            `and(user_a.eq.${user.id},user_b.eq.${candidateId}),and(user_a.eq.${candidateId},user_b.eq.${user.id})`
          )
          .single();

        const matchScore = Math.round((score?.total_score || 0) * 100);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pragma.app";

        // Email to current user
        if (user.email) {
          await sendEmail({
            to: user.email,
            subject: getMatchMutualSubject(),
            react: MatchMutualEmail({
              displayName: myProfile?.display_name || "",
              matchName: theirProfile?.display_name || "",
              matchScore,
              messagesUrl: `${baseUrl}/en/messages`,
            }),
            tags: [{ name: "type", value: "match_mutual" }],
          });
        }

        // Email to candidate (fetch their auth email via service role)
        const { createServiceClient } = await import("@/lib/supabase/service");
        const serviceClient = createServiceClient();
        const { data: candidateAuth } = await serviceClient.auth.admin.getUserById(candidateId);
        if (candidateAuth?.user?.email) {
          await sendEmail({
            to: candidateAuth.user.email,
            subject: getMatchMutualSubject(),
            react: MatchMutualEmail({
              displayName: theirProfile?.display_name || "",
              matchName: myProfile?.display_name || "",
              matchScore,
              messagesUrl: `${baseUrl}/en/messages`,
            }),
            tags: [{ name: "type", value: "match_mutual" }],
          });
        }
      } catch (err) {
        console.error("[email] Mutual match email failed:", err);
      }
    })();

    return {
      success: true,
      mutual: true,
      consentId: reverse.id,
    };
  }

  // One-sided interest — create pending record
  const { data: consent, error: insertError } = await supabase
    .from("consent_records")
    .insert({
      from_user_id: user.id,
      to_user_id: candidateId,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    // Handle race condition: UNIQUE constraint violation means interest was already expressed
    if (insertError.code === "23505") {
      return { success: false, error: "Interest already expressed" };
    }
    return { success: false, error: insertError.message };
  }

  // Audit
  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "interest_expressed",
    entity_type: "consent_records",
    entity_id: consent?.id,
    metadata: { candidateId },
  });

  return { success: true, mutual: false };
}

/**
 * Decline a match candidate (FN-5.1.1.2).
 */
export async function declineMatch(
  candidateId: string
): Promise<ConsentResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if there's a pending consent from the candidate to us
  const { data: incoming } = await supabase
    .from("consent_records")
    .select("id")
    .eq("from_user_id", candidateId)
    .eq("to_user_id", user.id)
    .eq("status", "pending")
    .single();

  if (incoming) {
    await supabase
      .from("consent_records")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", incoming.id);
  }

  // Create our decline record (ignore if already exists)
  await supabase.from("consent_records").upsert(
    {
      from_user_id: user.id,
      to_user_id: candidateId,
      status: "declined",
    },
    { onConflict: "from_user_id,to_user_id" }
  );

  // Audit (FN-15.1.1.1 — decline feedback)
  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "match_declined",
    entity_type: "consent_records",
    metadata: { candidateId },
  });

  return { success: true };
}

/**
 * Report a user (FN-5.1.2.5).
 */
export async function reportUser(
  targetUserId: string,
  category: string,
  details?: string
): Promise<ConsentResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "user_reported",
    entity_type: "profiles",
    entity_id: targetUserId,
    metadata: { category, details: details?.slice(0, 500) },
  });

  return { success: true };
}

/**
 * Block a user (FN-5.1.2.4).
 */
export async function blockUser(
  targetUserId: string
): Promise<ConsentResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Update any existing consent records to declined
  await supabase
    .from("consent_records")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .or(
      `and(from_user_id.eq.${user.id},to_user_id.eq.${targetUserId}),and(from_user_id.eq.${targetUserId},to_user_id.eq.${user.id})`
    );

  // Audit
  await supabase.from("audit_events").insert({
    user_id: user.id,
    action: "user_blocked",
    entity_type: "profiles",
    entity_id: targetUserId,
  });

  return { success: true };
}
