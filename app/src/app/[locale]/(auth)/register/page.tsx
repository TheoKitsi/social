"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { useFlags } from "@/components/flags-provider";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { socialLogin } = useFlags();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const selectedBilling = searchParams.get("billing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const planParams = selectedPlan ? `?plan=${selectedPlan}&billing=${selectedBilling || "monthly"}` : "";
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/onboarding${planParams}`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface/60 backdrop-blur-sm shadow-[var(--shadow-lg)] p-8 space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/15 flex items-center justify-center">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">{t("verifyEmail")}</h1>
          <p className="text-on-surface-muted">
            {t("verifyEmailDescription", { email })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface/60 backdrop-blur-sm shadow-[var(--shadow-lg)] p-8 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">{t("register")}</h1>
          {selectedPlan && (
            <p className="text-sm text-primary font-medium">
              {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
            </p>
          )}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label={t("confirmPassword")}
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {t("register")}
          </Button>
        </form>

        {socialLogin && <SocialLoginButtons />}

        <p className="text-center text-sm text-on-surface-muted">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
