import { Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, heading, paragraph, ctaButton } from "./layout";

interface MatchMutualEmailProps {
  displayName: string;
  matchName: string;
  matchScore: number;
  messagesUrl: string;
  locale?: string;
}

const copy: Record<string, { subject: string; preview: string; heading: string; body: string; cta: string }> = {
  en: {
    subject: "You have a mutual match!",
    preview: "Someone is interested in you too — contact is unlocked.",
    heading: "It's mutual, {name}!",
    body: "Great news — you and {match} have both expressed interest. Your compatibility score is {score}%. You can now start a conversation.",
    cta: "Start conversation",
  },
  de: {
    subject: "Gegenseitiges Match!",
    preview: "Jemand interessiert sich auch fur dich — Kontakt ist freigeschaltet.",
    heading: "Es ist gegenseitig, {name}!",
    body: "Gute Nachrichten — du und {match} habt beide Interesse gezeigt. Euer Kompatibilitatsscore betragt {score}%. Ihr konnt jetzt eine Unterhaltung starten.",
    cta: "Unterhaltung starten",
  },
};

export function MatchMutualEmail({
  displayName,
  matchName,
  matchScore,
  messagesUrl,
  locale = "en",
}: MatchMutualEmailProps) {
  const t = copy[locale] || copy.en;

  return (
    <EmailLayout preview={t.preview}>
      <Heading style={heading}>{t.heading.replace("{name}", displayName)}</Heading>
      <Text style={paragraph}>
        {t.body
          .replace("{match}", matchName)
          .replace("{score}", String(matchScore))}
      </Text>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={messagesUrl} style={ctaButton}>
          {t.cta}
        </Link>
      </Section>
    </EmailLayout>
  );
}

export function getMatchMutualSubject(locale = "en") {
  return (copy[locale] || copy.en).subject;
}
