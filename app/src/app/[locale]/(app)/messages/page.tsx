"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { ReportDialog } from "@/components/report-dialog";
import { sendMessage as sendMessageAction } from "@/app/actions/messages";

interface Conversation {
  id: string;
  otherUserId: string;
  otherName: string | null;
  otherAvatar: string | null;
  lastMessage: string;
  lastAt: string;
}

interface Message {
  id: string;
  sender_id: string;
  consent_id: string;
  content: string;
  created_at: string;
}

export default function MessagesPage() {
  const t = useTranslations();
  const supabase = createClient();
  const [userId, setUserId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load conversations from consent_records with mutual consent (FN-5.1.2.1)
      const { data: consented } = await supabase
        .from("consent_records")
        .select("*")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (consented) {
        // Collect other user IDs for profile lookup
        const otherIds = consented.map((c: Record<string, unknown>) =>
          c.from_user_id === user.id ? c.to_user_id : c.from_user_id
        );

        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", otherIds);

        const profileMap = new Map(
          (profiles || []).map((p: Record<string, unknown>) => [p.user_id, p])
        );

        const convos: Conversation[] = consented.map((c: Record<string, unknown>) => {
          const otherUserId =
            c.from_user_id === user.id
              ? (c.to_user_id as string)
              : (c.from_user_id as string);
          const otherProfile = profileMap.get(otherUserId) as Record<string, unknown> | undefined;
          return {
            id: c.id as string,
            otherUserId,
            otherName: (otherProfile?.display_name as string) || null,
            otherAvatar: (otherProfile?.avatar_url as string) || null,
            lastMessage: "",
            lastAt: (c.responded_at || c.created_at) as string,
          };
        });
        setConversations(convos);

        // Load last message per conversation in a single query (avoid N+1)
        const consentIds = convos.map((c) => c.id);
        if (consentIds.length > 0) {
          const { data: lastMessages } = await supabase
            .from("messages")
            .select("consent_id, content, created_at")
            .in("consent_id", consentIds)
            .order("created_at", { ascending: false });

          const lastMsgMap = new Map<string, { content: string; created_at: string }>();
          for (const msg of lastMessages || []) {
            if (!lastMsgMap.has(msg.consent_id)) {
              lastMsgMap.set(msg.consent_id, msg);
            }
          }

          for (const convo of convos) {
            const lastMsg = lastMsgMap.get(convo.id);
            if (lastMsg) {
              convo.lastMessage = lastMsg.content;
              convo.lastAt = lastMsg.created_at;
            }
          }
          setConversations([...convos]);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  // Load messages and subscribe when active convo changes
  useEffect(() => {
    if (!activeConvo || !userId) return;

    const convo = conversations.find((c) => c.id === activeConvo);
    if (!convo) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("consent_id", activeConvo!)
        .order("created_at", { ascending: true });

      setMessages((data as Message[]) || []);
    }
    loadMessages();

    // Realtime subscription (FN-5.1.2.3)
    const channel = supabase
      .channel(`messages:${activeConvo}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `consent_id=eq.${activeConvo}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvo, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!newMessage.trim() || !activeConvo) return;

    const convo = conversations.find((c) => c.id === activeConvo);
    if (!convo) return;

    setSending(true);
    const content = newMessage.trim().slice(0, 2000);
    const result = await sendMessageAction(activeConvo, content);

    if (result.success) {
      setNewMessage("");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem-env(safe-area-inset-bottom)-env(safe-area-inset-top))] md:h-dvh">
      {/* Conversation list */}
      <div
        className={`w-full md:w-80 border-r border-border ${
          activeConvo ? "hidden md:block" : ""
        }`}
      >
        <div className="p-4 border-b border-border">
           <h1 className="text-lg font-bold text-on-surface tracking-[var(--tracking-tight)]">
            {t("nav.messages")}
          </h1>
        </div>

        {conversations.length === 0 ? (
          <div className="p-6 text-center text-on-surface-muted text-sm">
            {t("messages.noConversations")}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setActiveConvo(convo.id)}
                className={`w-full p-4 text-left hover:bg-surface-alt transition-colors ${
                  activeConvo === convo.id ? "bg-surface-alt" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-medium overflow-hidden">
                    {convo.otherAvatar ? (
                      <img src={convo.otherAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (convo.otherName || "M").slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {convo.otherName || "Match"}
                    </p>
                    <p className="text-xs text-on-surface-muted truncate">
                      {convo.lastMessage || t("messages.noMessagesYet")}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message thread */}
      <div
        className={`flex-1 flex flex-col ${
          !activeConvo ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConvo ? (
          <>
            {/* Thread header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <button
                className="md:hidden text-on-surface p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setActiveConvo(null)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-primary text-sm font-medium overflow-hidden">
                {conversations.find((c) => c.id === activeConvo)?.otherAvatar ? (
                  <img src={conversations.find((c) => c.id === activeConvo)!.otherAvatar!} alt="" className="w-full h-full object-cover" />
                ) : (
                  (conversations.find((c) => c.id === activeConvo)?.otherName || "M").slice(0, 1).toUpperCase()
                )}
              </div>
              <p className="font-medium text-on-surface text-sm flex-1">
                {conversations.find((c) => c.id === activeConvo)?.otherName || "Match"}
              </p>
              <button
                onClick={() => {
                  const convo = conversations.find((c) => c.id === activeConvo);
                  if (convo) setReportingUserId(convo.otherUserId);
                }}
                className="p-2 text-on-surface-muted hover:text-error transition-colors"
                title={t("report.title")}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      msg.sender_id === userId
                        ? "bg-primary text-on-primary rounded-br-md"
                        : "bg-surface-alt text-on-surface rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender_id === userId
                          ? "text-on-primary/60"
                          : "text-on-surface-muted"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border safe-bottom">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t("messages.placeholder")}
                  className="flex-1"
                />
                <Button type="submit" loading={sending} disabled={!newMessage.trim()}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-muted">
            {t("messages.selectConversation")}
          </div>
        )}
      </div>

      {reportingUserId && (
        <ReportDialog
          reportedUserId={reportingUserId}
          onClose={() => setReportingUserId(null)}
        />
      )}
    </div>
  );
}
