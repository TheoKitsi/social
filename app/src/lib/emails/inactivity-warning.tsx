import { Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, heading, paragraph, ctaButton } from "./layout";

interface InactivityWarningEmailProps {
  displayName: string;
  daysSinceLastActive: number;
  stage: 1 | 2 | 3; // 30 / 60 / 90 days (CMP-14.1.1)
  loginUrl: string;
  locale?: string;
}

const copy: Record<
  string,
  Record<1 | 2 | 3, { subject: string; preview: string; heading: string; body: string; cta: string }>
> = {
  en: {
    1: {
      subject: "We miss you at PRAGMA",
      preview: "It's been a while — new matches may be waiting.",
      heading: "It's been {days} days, {name}",
      body: "We noticed you haven't been active recently. New users have joined since your last visit, and there may be compatible matches waiting for you.",
      cta: "Check my matches",
    },
    2: {
      subject: "Your PRAGMA profile will become hidden soon",
      preview: "Your profile visibility will be reduced in 30 days.",
      heading: "Still there, {name}?",
      body: "After 60 days of inactivity, your profile visibility will be reduced. Log in to keep your profile active and visible to potential matches.",
      cta: "Reactivate profile",
    },
    3: {
      subject: "Your PRAGMA profile has been hidden",
      preview: "Your profile is no longer visible to other users.",
      heading: "Your profile is hidden, {name}",
      body: "Due to 90 days of inactivity, your profile has been hidden from other users. You can reactivate it anytime by logging in.",
      cta: "Reactivate now",
    },
  },
  de: {
    1: {
      subject: "Wir vermissen dich bei PRAGMA",
      preview: "Es ist eine Weile her — neue Matches warten vielleicht.",
      heading: "Es sind {days} Tage vergangen, {name}",
      body: "Wir haben bemerkt, dass du in letzter Zeit nicht aktiv warst. Seit deinem letzten Besuch sind neue Nutzer beigetreten, und es konnten kompatible Matches auf dich warten.",
      cta: "Meine Matches prufen",
    },
    2: {
      subject: "Dein PRAGMA-Profil wird bald ausgeblendet",
      preview: "Deine Profilsichtbarkeit wird in 30 Tagen reduziert.",
      heading: "Noch da, {name}?",
      body: "Nach 60 Tagen Inaktivitat wird die Sichtbarkeit deines Profils reduziert. Melde dich an, um dein Profil aktiv und fur potenzielle Matches sichtbar zu halten.",
      cta: "Profil reaktivieren",
    },
    3: {
      subject: "Dein PRAGMA-Profil wurde ausgeblendet",
      preview: "Dein Profil ist fur andere Nutzer nicht mehr sichtbar.",
      heading: "Dein Profil ist ausgeblendet, {name}",
      body: "Aufgrund von 90 Tagen Inaktivitat wurde dein Profil fur andere Nutzer ausgeblendet. Du kannst es jederzeit durch Anmeldung reaktivieren.",
      cta: "Jetzt reaktivieren",
    },
  },
};

export function InactivityWarningEmail({
  displayName,
  daysSinceLastActive,
  stage,
  loginUrl,
  locale = "en",
}: InactivityWarningEmailProps) {
  const t = (copy[locale] || copy.en)[stage];

  return (
    <EmailLayout preview={t.preview}>
      <Heading style={heading}>
        {t.heading.replace("{days}", String(daysSinceLastActive)).replace("{name}", displayName)}
      </Heading>
      <Text style={paragraph}>{t.body}</Text>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={loginUrl} style={ctaButton}>
          {t.cta}
        </Link>
      </Section>
    </EmailLayout>
  );
}

export function getInactivitySubject(stage: 1 | 2 | 3, locale = "en") {
  return (copy[locale] || copy.en)[stage].subject;
}
