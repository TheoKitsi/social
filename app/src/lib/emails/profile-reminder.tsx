import { Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, heading, paragraph, ctaButton } from "./layout";

interface ProfileReminderEmailProps {
  displayName: string;
  completionPercent: number;
  onboardingUrl: string;
  locale?: string;
}

const copy: Record<string, { subject: string; preview: string; heading: string; body: string; cta: string }> = {
  en: {
    subject: "Your PRAGMA profile is {pct}% complete",
    preview: "A few more steps and you'll start receiving matches.",
    heading: "Almost there, {name}",
    body: "Your profile is {pct}% complete. Completing your funnel helps our science-based algorithm find your most compatible matches. It only takes a few minutes.",
    cta: "Continue profile",
  },
  de: {
    subject: "Dein PRAGMA-Profil ist zu {pct}% fertig",
    preview: "Noch ein paar Schritte und du erhaltst deine ersten Matches.",
    heading: "Fast geschafft, {name}",
    body: "Dein Profil ist zu {pct}% fertig. Ein vollstandiges Profil hilft unserem wissenschaftsbasierten Algorithmus, deine besten Matches zu finden. Es dauert nur wenige Minuten.",
    cta: "Profil fortsetzen",
  },
};

export function ProfileReminderEmail({
  displayName,
  completionPercent,
  onboardingUrl,
  locale = "en",
}: ProfileReminderEmailProps) {
  const t = copy[locale] || copy.en;
  const pct = String(completionPercent);

  return (
    <EmailLayout preview={t.preview}>
      <Heading style={heading}>{t.heading.replace("{name}", displayName)}</Heading>
      <Text style={paragraph}>{t.body.replace("{pct}", pct)}</Text>

      {/* Progress bar */}
      <Section style={{ margin: "16px 0 24px" }}>
        <div style={progressTrack}>
          <div
            style={{
              ...progressFill,
              width: `${Math.min(completionPercent, 100)}%`,
            }}
          />
        </div>
        <Text style={progressLabel}>{pct}%</Text>
      </Section>

      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={onboardingUrl} style={ctaButton}>
          {t.cta}
        </Link>
      </Section>
    </EmailLayout>
  );
}

export function getProfileReminderSubject(completionPercent: number, locale = "en") {
  return (copy[locale] || copy.en).subject.replace("{pct}", String(completionPercent));
}

const progressTrack: React.CSSProperties = {
  height: "8px",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: "4px",
  overflow: "hidden",
};

const progressFill: React.CSSProperties = {
  height: "8px",
  backgroundColor: "#FF4081",
  borderRadius: "4px",
};

const progressLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#FF4081",
  fontWeight: 600,
  textAlign: "center" as const,
  margin: "6px 0 0",
};
