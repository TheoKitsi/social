import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/** Shared layout wrapper for all PRAGMA emails */
export function EmailLayout({
  preview,
  children,
  unsubscribeUrl,
  footerText = "PRAGMA GmbH (i.Gr.) — Munich, Germany",
}: {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
  footerText?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo / Brand */}
          <Section style={logoSection}>
            <Text style={logoText}>PRAGMA</Text>
          </Section>

          {children}

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerP}>{footerText}</Text>
            {unsubscribeUrl && (
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Shared styles (inline for email compatibility) ─────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#0f0f1a",
  fontFamily:
    "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 24px",
};

const logoSection: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoText: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#FF4081",
  letterSpacing: "4px",
  margin: 0,
};

export const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 600,
  color: "#ffffff",
  lineHeight: "1.4",
  margin: "0 0 16px",
};

export const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#a0a0b8",
  margin: "0 0 16px",
};

export const ctaButton: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#FF4081",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 32px",
  borderRadius: "8px",
  marginTop: "8px",
};

const hr: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.08)",
  margin: "32px 0 16px",
};

const footer: React.CSSProperties = {
  textAlign: "center" as const,
};

const footerP: React.CSSProperties = {
  fontSize: "11px",
  color: "#555",
  margin: "0 0 4px",
};

const footerLink: React.CSSProperties = {
  fontSize: "11px",
  color: "#555",
  textDecoration: "underline",
};
