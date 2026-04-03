"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button, ProgressBar } from "@/components/ui";
import { saveFunnelLevel } from "@/app/actions/funnel";
import type { FunnelLevel } from "@/types/funnel";
import type { FunnelSide } from "@/types/database";

// Locale to BCP47 language tag map for speech recognition
const localeToBCP47: Record<string, string> = {
  en: "en-US", de: "de-DE", el: "el-GR", tr: "tr-TR", ar: "ar-SA",
  fr: "fr-FR", es: "es-ES", it: "it-IT", pt: "pt-PT", nl: "nl-NL",
  pl: "pl-PL", ru: "ru-RU", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR",
};

interface VoiceOnboardingProps {
  level: FunnelLevel;
  side: FunnelSide;
  fields: string[];
  overallProgress: number;
  onComplete: (data: Record<string, unknown>) => void;
  onBack: () => void;
  onFallbackToChat: () => void;
}

export function VoiceOnboarding({
  level,
  side,
  fields,
  overallProgress,
  onComplete,
  onBack,
  onFallbackToChat,
}: VoiceOnboardingProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeToBCP47[locale] || "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [locale]);

  const sendToAI = useCallback(async (userText: string, history: { role: string; content: string }[]) => {
    setLoading(true);
    try {
      const messages = [...history, { role: "user", content: userText }];
      const res = await fetch("/api/ai/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, locale, level, side, fields }),
      });

      if (!res.ok) throw new Error("AI unavailable");

      const data = await res.json();
      const aiText = data.message.replace(/\[PROFILE_DATA\][\s\S]*?\[\/PROFILE_DATA\]/, "").trim();

      setAiResponse(aiText);
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: userText },
        { role: "assistant", content: data.message },
      ]);

      // Check for completed data
      const dataMatch = data.message.match(/\[PROFILE_DATA\]([\s\S]*?)\[\/PROFILE_DATA\]/);
      if (dataMatch) {
        try {
          const profileData = JSON.parse(dataMatch[1]);
          await saveFunnelLevel(level, side, profileData);
          speak(aiText);
          setTimeout(() => onComplete(profileData), 3000);
          setLoading(false);
          return;
        } catch {
          // Continue conversation
        }
      }

      speak(aiText);
    } catch {
      setAiResponse(t("onboarding.voice.connectionError"));
    }
    setLoading(false);
  }, [locale, level, side, fields, speak, onComplete, t]);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = localeToBCP47[locale] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(result);

      if (event.results[event.results.length - 1].isFinal) {
        setListening(false);
        sendToAI(result, conversationHistory);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setTranscript("");
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function startVoice() {
    setStarted(true);
    const initMsg = `Start the onboarding for level ${level}, side: ${side}. My language is ${locale}.`;
    await sendToAI(initMsg, []);
  }

  if (!supported) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 space-y-6">
        <div className="text-center space-y-3 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-error/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-on-surface">{t("onboarding.voice.notSupported")}</h2>
          <p className="text-sm text-on-surface-muted">
            {t("onboarding.voice.notSupportedDesc")}
          </p>
        </div>
        <Button onClick={onFallbackToChat} size="lg">
          {t("onboarding.modeSelect.chatAI")}
        </Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 space-y-6">
        <ProgressBar value={overallProgress} size="sm" showPercent={false} />
        <div className="text-center space-y-3 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-on-surface">
            {t("onboarding.modeSelect.voiceAI")}
          </h2>
          <p className="text-sm text-on-surface-muted">
            {t(`funnel.levels.${level}.title`)} —{" "}
            {side === "self" ? t("funnel.selfDescription") : t("funnel.targetPerson")}
          </p>
        </div>

        {/* Volume & mic guidance */}
        <div className="max-w-sm w-full space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-variant/50 border border-border">
            <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <p className="text-xs text-on-surface-muted">{t("onboarding.voice.volumeHint")}</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-variant/50 border border-border">
            <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            <p className="text-xs text-on-surface-muted">{t("onboarding.voice.micPermission")}</p>
          </div>
        </div>

        <Button onClick={startVoice} size="lg">
          {t("common.continue")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full space-y-8">
        <ProgressBar value={overallProgress} size="sm" showPercent={false} />

        {/* AI Response */}
        <div className="text-center space-y-4">
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
              speaking
                ? "bg-primary/20 border-2 border-primary scale-110"
                : listening
                ? "bg-error/20 border-2 border-error animate-pulse"
                : "bg-surface-variant border border-border"
            }`}
          >
            {listening ? (
              <svg className="w-12 h-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            ) : speaking ? (
              <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-on-surface-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>

          {aiResponse && (
            <p className="text-base text-on-surface leading-relaxed">{aiResponse}</p>
          )}

          {transcript && (
            <p className="text-sm text-on-surface-muted italic">{transcript}</p>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={listening ? stopListening : startListening}
            disabled={loading || speaking}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all min-h-[44px] ${
              listening
                ? "bg-error text-white scale-110"
                : "bg-primary text-on-primary hover:scale-105"
            } disabled:opacity-50`}
          >
            {listening ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          <p className="text-xs text-on-surface-muted">
            {listening ? t("onboarding.voice.listening") : t("onboarding.voice.tapToSpeak")}
          </p>

          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              {t("common.back")}
            </Button>
            <Button variant="ghost" size="sm" onClick={onFallbackToChat}>
              {t("onboarding.modeSelect.chatAI")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
