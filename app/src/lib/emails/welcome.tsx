import { Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, heading, paragraph, ctaButton } from "./layout";

interface WelcomeEmailProps {
  displayName: string;
  onboardingUrl: string;
  locale?: string;
}

const copy: Record<string, { subject: string; preview: string; heading: string; body: string; cta: string }> = {
  en: {
    subject: "Welcome to PRAGMA",
    preview: "Your journey to meaningful connections starts now.",
    heading: "Welcome, {name}",
    body: "Thank you for joining PRAGMA. We take a science-based approach to meaningful connections — no swiping, no games. Complete your profile to discover your first matches.",
    cta: "Complete your profile",
  },
  de: {
    subject: "Willkommen bei PRAGMA",
    preview: "Dein Weg zu bedeutsamen Verbindungen beginnt jetzt.",
    heading: "Willkommen, {name}",
    body: "Danke, dass du dich bei PRAGMA angemeldet hast. Wir verfolgen einen wissenschaftsbasierten Ansatz fur bedeutsame Verbindungen — kein Swipen, keine Spielchen. Vervollstandige dein Profil, um deine ersten Matches zu entdecken.",
    cta: "Profil vervollstandigen",
  },
};

export function WelcomeEmail({ displayName, onboardingUrl, locale = "en" }: WelcomeEmailProps) {
  const t = copy[locale] || copy.en;

  return (
    <EmailLayout preview={t.preview}>
      <Heading style={heading}>{t.heading.replace("{name}", displayName)}</Heading>
      <Text style={paragraph}>{t.body}</Text>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={onboardingUrl} style={ctaButton}>
          {t.cta}
        </Link>
      </Section>
    </EmailLayout>
  );
}

export function getWelcomeSubject(locale = "en") {
  return (copy[locale] || copy.en).subject;
}
