import { Heading, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, heading, paragraph, ctaButton } from "./layout";

interface NewMessageEmailProps {
  displayName: string;
  senderName: string;
  messagePreview: string;
  messagesUrl: string;
  locale?: string;
}

const copy: Record<string, { subject: string; preview: string; heading: string; body: string; cta: string }> = {
  en: {
    subject: "New message from {sender}",
    preview: "You have an unread message on PRAGMA.",
    heading: "New message",
    body: "{sender} sent you a message:",
    cta: "Read message",
  },
  de: {
    subject: "Neue Nachricht von {sender}",
    preview: "Du hast eine ungelesene Nachricht auf PRAGMA.",
    heading: "Neue Nachricht",
    body: "{sender} hat dir eine Nachricht gesendet:",
    cta: "Nachricht lesen",
  },
};

export function NewMessageEmail({
  displayName,
  senderName,
  messagePreview,
  messagesUrl,
  locale = "en",
}: NewMessageEmailProps) {
  const t = copy[locale] || copy.en;

  return (
    <EmailLayout preview={t.preview}>
      <Heading style={heading}>{t.heading}</Heading>
      <Text style={paragraph}>{t.body.replace("{sender}", senderName)}</Text>
      <Text style={previewBox}>
        &ldquo;{messagePreview.slice(0, 120)}
        {messagePreview.length > 120 ? "..." : ""}&rdquo;
      </Text>
      <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
        <Link href={messagesUrl} style={ctaButton}>
          {t.cta}
        </Link>
      </Section>
    </EmailLayout>
  );
}

export function getNewMessageSubject(senderName: string, locale = "en") {
  return (copy[locale] || copy.en).subject.replace("{sender}", senderName);
}

const previewBox: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#d0d0e0",
  backgroundColor: "rgba(255,255,255,0.04)",
  borderLeft: "3px solid #FF4081",
  padding: "12px 16px",
  margin: "8px 0 16px",
  borderRadius: "0 6px 6px 0",
};
