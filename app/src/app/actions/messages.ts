"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { NewMessageEmail, getNewMessageSubject } from "@/lib/emails";
import { messageEmailNotifications } from "@/flags";

interface SendMessageResult {
  success: boolean;
  error?: string;
}

/**
 * Send a message in a consent thread and trigger email notification
 * if the recipient is not currently online.
 */
export async function sendMessage(
  consentId: string,
  content: string
): Promise<SendMessageResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Validate content
  const trimmed = content.trim().slice(0, 2000);
  if (!trimmed) return { success: false, error: "Empty message" };

  // Verify user is part of this consent
  const { data: consent } = await supabase
    .from("consent_records")
    .select("from_user_id, to_user_id, status")
    .eq("id", consentId)
    .single();

  if (!consent || consent.status !== "accepted") {
    return { success: false, error: "Invalid consent" };
  }

  const isParticipant =
    consent.from_user_id === user.id || consent.to_user_id === user.id;
  if (!isParticipant) {
    return { success: false, error: "Not a participant" };
  }

  // Insert message
  const { error: insertError } = await supabase.from("messages").insert({
    consent_id: consentId,
    sender_id: user.id,
    content: trimmed,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Send email notification to recipient (fire-and-forget, gated by feature flag)
  const emailEnabled = await messageEmailNotifications();
  const recipientId =
    consent.from_user_id === user.id
      ? consent.to_user_id
      : consent.from_user_id;

  (async () => {
    if (!emailEnabled) return;
    try {
      // Get sender profile
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      // Get recipient email via service client
      const { createServiceClient } = await import("@/lib/supabase/service");
      const serviceClient = createServiceClient();
      const { data: recipientAuth } =
        await serviceClient.auth.admin.getUserById(recipientId);

      if (recipientAuth?.user?.email) {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://pragma.app";
        await sendEmail({
          to: recipientAuth.user.email,
          subject: getNewMessageSubject(
            senderProfile?.display_name || "Someone"
          ),
          react: NewMessageEmail({
            displayName: "",
            senderName: senderProfile?.display_name || "Someone",
            messagePreview: trimmed,
            messagesUrl: `${baseUrl}/en/messages`,
          }),
          tags: [{ name: "type", value: "new_message" }],
        });
      }
    } catch (err) {
      console.error("[email] New message notification failed:", err);
    }
  })();

  return { success: true };
}
