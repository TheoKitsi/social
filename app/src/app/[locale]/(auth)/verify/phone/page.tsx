"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN = 60; // seconds
const OTP_EXPIRY = 300; // 5 minutes

export default function VerifyPhonePage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timers
  useEffect(() => {
    if (resendCooldown <= 0 && otpExpiry <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((v) => Math.max(0, v - 1));
      setOtpExpiry((v) => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown > 0 || otpExpiry > 0]);

  const startTimers = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN);
    setOtpExpiry(OTP_EXPIRY);
  }, []);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!/^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number with country code");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.replace(/\s/g, ""),
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    startTimers();
    setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const token = code.join("");
    if (token.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.replace(/\s/g, ""),
      token,
      type: "sms",
    });

    if (verifyError) {
      setLoading(false);
      setAttempts((a) => a + 1);
      if (attempts >= 4) {
        setError("Too many failed attempts. Please request a new code.");
        setStep("phone");
        setCode(["", "", "", "", "", ""]);
        setAttempts(0);
        return;
      }
      setError(verifyError.message);
      return;
    }

    // Update phone_verified in profile
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ phone_verified: true })
        .eq("user_id", user.id);
    }

    setLoading(false);
    router.push("/onboarding");
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone.replace(/\s/g, ""),
    });

    setLoading(false);
    if (otpError) {
      setError(otpError.message);
    } else {
      startTimers();
      setAttempts(0);
      setCode(["", "", "", "", "", ""]);
    }
  }

  return (
    <div className="w-full max-w-md px-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          {t("verifySms")}
        </h1>
        <p className="text-sm text-on-surface-muted">
          {step === "phone"
            ? t("verifySmsDescription", { phone: "your phone" })
            : t("verifySmsDescription", { phone })}
        </p>
      </div>

      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <Input
            label={t("phone")}
            type="tel"
            required
            placeholder="+49 170 1234567"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {t("resendCode").replace("Resend", "Send")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-on-surface block mb-3">
              {t("verifyCode")}
            </label>
            <div
              className="flex gap-2 justify-center"
              onPaste={handleCodePaste}
            >
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-mono rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            {t("verifySms")}
          </Button>

          {otpExpiry > 0 && (
            <p className="text-center text-xs text-on-surface-muted">
              Code expires in {Math.floor(otpExpiry / 60)}:{String(otpExpiry % 60).padStart(2, "0")}
            </p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className={`w-full text-sm ${
              resendCooldown > 0
                ? "text-on-surface-muted cursor-not-allowed"
                : "text-primary hover:underline"
            }`}
          >
            {resendCooldown > 0
              ? `${t("resendCode")} (${resendCooldown}s)`
              : t("resendCode")}
          </button>
        </form>
      )}
    </div>
  );
}
