import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail, getWelcomeSubject } from "@/lib/emails";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  // Extract locale from referer or default to en
  const referer = request.headers.get("referer") || "";
  const localeMatch = referer.match(/\/(en|de|el|tr|ar|fr|es|it|pt|nl|pl|ru|ja|zh|ko)\//);
  const locale = localeMatch ? localeMatch[1] : "en";
  const redirectPath = next ?? `/${locale}/onboarding`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Update email_verified in profiles
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if this is the first verification (new user)
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_verified, display_name")
          .eq("user_id", user.id)
          .single();

        const isNewUser = !profile?.email_verified;

        await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("user_id", user.id);

        // Send welcome email for new users
        if (isNewUser && user.email) {
          sendEmail({
            to: user.email,
            subject: getWelcomeSubject(locale),
            react: WelcomeEmail({
              displayName: profile?.display_name || user.email.split("@")[0],
              onboardingUrl: `${origin}/${locale}/onboarding`,
              locale,
            }),
            tags: [{ name: "type", value: "welcome" }],
          }).catch((err) => console.error("[email] Welcome email failed:", err));
        }
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
