"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button, Card, CardContent, ProgressBar } from "@/components/ui";
import { saveFunnelLevel } from "@/app/actions/funnel";
import type { FunnelLevel } from "@/types/funnel";
import type { FunnelSide } from "@/types/database";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatOnboardingProps {
  level: FunnelLevel;
  side: FunnelSide;
  fields: string[];
  overallProgress: number;
  onComplete: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

export function ChatOnboarding({
  level,
  side,
  fields,
  overallProgress,
  onComplete,
  onBack,
}: ChatOnboardingProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function startChat() {
    setStarted(true);
    setLoading(true);

    const initMessage: Message = {
      role: "user",
      content: `Start the onboarding for level ${level}, side: ${side}. My language is ${locale}.`,
    };

    try {
      const res = await fetch("/api/ai/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [initMessage],
          locale,
          level,
          side,
          fields,
        }),
      });

      if (!res.ok) throw new Error("AI unavailable");

      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: t("onboarding.chat.connectionError"),
        },
      ]);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          locale,
          level,
          side,
          fields,
        }),
      });

      if (!res.ok) throw new Error("AI unavailable");

      const data = await res.json();
      const aiMsg: Message = { role: "assistant", content: data.message };
      setMessages((prev) => [...prev, aiMsg]);

      // Check if AI returned structured data
      const dataMatch = data.message.match(
        /\[PROFILE_DATA\]([\s\S]*?)\[\/PROFILE_DATA\]/
      );
      if (dataMatch) {
        try {
          const profileData = JSON.parse(dataMatch[1]);
          // Save to funnel
          await saveFunnelLevel(level, side, profileData);
          onComplete(profileData);
        } catch {
          // JSON parse failed — continue conversation
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("onboarding.chat.connectionError"),
        },
      ]);
    }
    setLoading(false);
  }

  if (!started) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 space-y-6">
        <ProgressBar value={overallProgress} size="sm" showPercent={false} />
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-xl font-bold text-on-surface">
            {t("onboarding.modeSelect.chatAI")}
          </h2>
          <p className="text-sm text-on-surface-muted">
            {t(`funnel.levels.${level}.title`)} —{" "}
            {side === "self" ? t("funnel.selfDescription") : t("funnel.targetPerson")}
          </p>
        </div>
        <Button onClick={startChat} size="lg">
          {t("common.continue")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 space-y-3">
        <ProgressBar value={overallProgress} size="sm" showPercent={false} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-primary font-medium">
            {t(`funnel.levels.${level}.title`)} —{" "}
            {side === "self" ? t("funnel.selfDescription") : t("funnel.targetPerson")}
          </p>
          <Button variant="ghost" size="sm" onClick={onBack}>
            {t("common.back")}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              variant="outlined"
              className={`max-w-[80%] ${
                msg.role === "user"
                  ? "bg-primary/10 border-primary/20"
                  : "bg-surface"
              }`}
            >
              <CardContent className="py-3 px-4">
                <p className="text-sm text-on-surface whitespace-pre-wrap">
                  {msg.content.replace(/\[PROFILE_DATA\][\s\S]*?\[\/PROFILE_DATA\]/, "").trim()}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-1 px-4 py-3">
              <span className="w-2 h-2 bg-on-surface-muted/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-on-surface-muted/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-on-surface-muted/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-border safe-bottom">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("messages.placeholder")}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
          />
          <Button type="submit" disabled={!input.trim() || loading} size="sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
