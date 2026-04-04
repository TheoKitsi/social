import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import {
  ProfileReminderEmail,
  getProfileReminderSubject,
  InactivityWarningEmail,
  getInactivitySubject,
} from "@/lib/emails";

/**
 * Cron job: Send profile reminders and inactivity warnings.
 * Deploy with Vercel Cron: schedule "0 10 * * *" (daily at 10:00 UTC).
 *
 * Protected by CRON_SECRET bearer token.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pragma.app";
  const results = { reminders: 0, inactivity: 0, errors: 0 };

  // ── 1. Profile reminders: users with incomplete onboarding (3+ days old) ──
  const threeDaysAgo = new Date(Date.now() - 3 * 86400_000).toISOString();
  const { data: incompleteUsers } = await supabase
    .from("profiles")
    .select("user_id, display_name, active_funnel_level, created_at")
    .lt("active_funnel_level", 3)
    .lt("created_at", threeDaysAgo)
    .eq("is_active", true)
    .limit(50);

  for (const profile of incompleteUsers || []) {
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(
        profile.user_id
      );
      if (!authUser?.user?.email) continue;

      // Calculate completion: level 1 self = 16%, level 1 target = 33%, etc.
      const pct = Math.round(
        (((profile.active_funnel_level || 1) - 1) / 3) * 100
      );

      await sendEmail({
        to: authUser.user.email,
        subject: getProfileReminderSubject(pct),
        react: ProfileReminderEmail({
          displayName: profile.display_name || "",
          completionPercent: pct,
          onboardingUrl: `${baseUrl}/en/onboarding`,
        }),
        tags: [{ name: "type", value: "profile_reminder" }],
      });
      results.reminders++;
    } catch {
      results.errors++;
    }
  }

  // ── 2. Inactivity warnings (CMP-14.1.1: 30/60/90 day stages) ──
  const stages: { days: number; stage: 1 | 2 | 3 }[] = [
    { days: 30, stage: 1 },
    { days: 60, stage: 2 },
    { days: 90, stage: 3 },
  ];

  for (const { days, stage } of stages) {
    // Find users inactive for exactly N days (±1 day window to avoid duplicates)
    const targetDate = new Date(Date.now() - days * 86400_000);
    const windowStart = new Date(
      targetDate.getTime() - 86400_000
    ).toISOString();
    const windowEnd = targetDate.toISOString();

    const { data: inactiveUsers } = await supabase
      .from("profiles")
      .select("user_id, display_name, last_active_at")
      .gt("last_active_at", windowStart)
      .lte("last_active_at", windowEnd)
      .eq("is_active", true)
      .limit(50);

    for (const profile of inactiveUsers || []) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(
          profile.user_id
        );
        if (!authUser?.user?.email) continue;

        await sendEmail({
          to: authUser.user.email,
          subject: getInactivitySubject(stage),
          react: InactivityWarningEmail({
            displayName: profile.display_name || "",
            daysSinceLastActive: days,
            stage,
            loginUrl: `${baseUrl}/en/login`,
          }),
          tags: [{ name: "type", value: "inactivity_warning" }],
        });
        results.inactivity++;

        // Stage 3: auto-hide profile
        if (stage === 3) {
          await supabase
            .from("profiles")
            .update({ is_active: false })
            .eq("user_id", profile.user_id);
        }
      } catch {
        results.errors++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
