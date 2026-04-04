"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { useFlags } from "@/components/flags-provider";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { socialLogin } = useFlags();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDemoMode =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEMO_MODE?.trim() === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Demo mode: accept test credentials without Supabase
    if (isDemoMode) {
      const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || "test@pragma.app";
      const demoPass = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "pragma2026";
      if (email === demoEmail && password === demoPass) {
        router.push("/onboarding");
        return;
      }
      setLoading(false);
      setError(t("invalidCredentials"));
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface/60 backdrop-blur-sm shadow-[var(--shadow-lg)] p-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 border border-primary/20 shadow-[var(--shadow-accent-sm)] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 512 512" className="text-primary">
              <g fill="none" stroke="currentColor" strokeWidth="28" strokeLinejoin="round">
                <polyline points="100,120 200,256 100,392" />
                <polyline points="412,120 312,256 412,392" />
                <rect x="236" y="236" width="40" height="40" transform="rotate(45 256 256)" fill="currentColor" stroke="none" />
              </g>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">{t("login")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("email")}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label={t("password")}
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {t("login")}
          </Button>
        </form>

        {!isDemoMode && socialLogin && <SocialLoginButtons />}

        <p className="text-center text-sm text-on-surface-muted">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-primary hover:underline">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
