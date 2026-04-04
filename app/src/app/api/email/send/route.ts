import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { applyRateLimit } from "@/lib/rate-limit";
import {
  WelcomeEmail,
  getWelcomeSubject,
  MatchMutualEmail,
  getMatchMutualSubject,
  NewMessageEmail,
  getNewMessageSubject,
  ProfileReminderEmail,
  getProfileReminderSubject,
  InactivityWarningEmail,
  getInactivitySubject,
} from "@/lib/emails";
import React from "react";

/**
 * Internal email-sending endpoint.
 * Protected by bearer token (CRON_SECRET) — not for public use.
 */
export async function POST(request: NextRequest) {
  const limited = applyRateLimit(request, "email-send", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  // Verify internal auth
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "";
  const to = typeof body.to === "string" ? body.to : "";
  const locale = typeof body.locale === "string" ? body.locale : "en";
  const data = (body.data && typeof body.data === "object" ? body.data : {}) as Record<string, unknown>;

  if (!type || !to) {
    return NextResponse.json({ error: "Missing type or to" }, { status: 400 });
  }

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  let subject: string;
  let react: React.ReactElement;

  switch (type) {
    case "welcome":
      subject = getWelcomeSubject(locale);
      react = React.createElement(WelcomeEmail, {
        displayName: (data.displayName as string) || "",
        onboardingUrl: (data.onboardingUrl as string) || "",
        locale,
      });
      break;

    case "match_mutual":
      subject = getMatchMutualSubject(locale);
      react = React.createElement(MatchMutualEmail, {
        displayName: (data.displayName as string) || "",
        matchName: (data.matchName as string) || "",
        matchScore: (data.matchScore as number) || 0,
        messagesUrl: (data.messagesUrl as string) || "",
        locale,
      });
      break;

    case "new_message":
      subject = getNewMessageSubject((data.senderName as string) || "", locale);
      react = React.createElement(NewMessageEmail, {
        displayName: (data.displayName as string) || "",
        senderName: (data.senderName as string) || "",
        messagePreview: (data.messagePreview as string) || "",
        messagesUrl: (data.messagesUrl as string) || "",
        locale,
      });
      break;

    case "profile_reminder":
      subject = getProfileReminderSubject((data.completionPercent as number) || 0, locale);
      react = React.createElement(ProfileReminderEmail, {
        displayName: (data.displayName as string) || "",
        completionPercent: (data.completionPercent as number) || 0,
        onboardingUrl: (data.onboardingUrl as string) || "",
        locale,
      });
      break;

    case "inactivity_warning":
      subject = getInactivitySubject((data.stage as 1 | 2 | 3) || 1, locale);
      react = React.createElement(InactivityWarningEmail, {
        displayName: (data.displayName as string) || "",
        daysSinceLastActive: (data.daysSinceLastActive as number) || 0,
        stage: (data.stage as 1 | 2 | 3) || 1,
        loginUrl: (data.loginUrl as string) || "",
        locale,
      });
      break;

    default:
      return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
  }

  const result = await sendEmail({
    to,
    subject,
    react,
    tags: [{ name: "type", value: type }],
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: result.id });
}
