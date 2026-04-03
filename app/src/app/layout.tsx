import type { Metadata, Viewport } from "next";
import { Poppins, Fira_Code } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PRAGMA — Measured Compatibility.",
    template: "%s | PRAGMA",
  },
  description:
    "A serious matching platform built on self-knowledge, compatibility science, and mutual intent.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PRAGMA",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
      </head>
      <body
        className={`${poppins.variable} ${firaCode.variable} min-h-dvh bg-secondary text-on-surface font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
