"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { ConnectorCard } from "@/components/connectors/connector-card";
import { DigitalPortrait } from "@/components/connectors/digital-portrait";
import type {
  ConnectorWithStatus,
  ExternalConnector,
  UserExternalConnection,
  ExternalInsight,
  DataProcessingConsent,
  ConnectorCategory,
} from "@/types/connectors";

const CATEGORIES: ConnectorCategory[] = [
  "entertainment",
  "shopping",
  "ai_assistant",
  "social",
  "browsing",
];

export default function ConnectorsPage() {
  const t = useTranslations();
  const [connectors, setConnectors] = useState<ConnectorWithStatus[]>([]);
  const [insights, setInsights] = useState<ExternalInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ConnectorCategory | "all">("all");

  const loadData = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Load all connectors
    const { data: allConnectors } = await supabase
      .from("external_connectors")
      .select("*")
      .eq("is_active", true)
      .order("category");

    // Load user's connections
    const { data: connections } = await supabase
      .from("user_external_connections")
      .select("*")
      .eq("user_id", user.id);

    // Load user's insights
    const { data: userInsights } = await supabase
      .from("external_insights")
      .select("*")
      .eq("user_id", user.id);

    // Load user's consents
    const { data: consents } = await supabase
      .from("data_processing_consent")
      .select("*")
      .eq("user_id", user.id);

    // Merge into ConnectorWithStatus
    const merged: ConnectorWithStatus[] = (allConnectors || []).map(
      (c: ExternalConnector) => ({
        ...c,
        connection:
          (connections || []).find(
            (conn: UserExternalConnection) => conn.connector_id === c.id
          ) || null,
        insight:
          (userInsights || []).find(
            (ins: ExternalInsight) =>
              (connections || []).find(
                (conn: UserExternalConnection) =>
                  conn.connector_id === c.id && conn.id === ins.connection_id
              ) != null
          ) || null,
        consent:
          (consents || []).find(
            (con: DataProcessingConsent) => con.connector_id === c.id
          ) || null,
      })
    );

    setConnectors(merged);
    setInsights(userInsights || []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching on mount
  useEffect(() => { loadData(); }, []);

  async function handleConnect(connectorId: string) {
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector) return;

    if (connector.method === "oauth") {
      // Redirect to OAuth initiation
      window.location.href = `/api/connectors/${connector.provider}/auth`;
    }
  }

  async function handleDisconnect(connectorId: string) {
    const supabase = createClient();
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector?.connection) return;

    // Revoke connection — cascade trigger deletes insights + revokes consent
    await supabase
      .from("user_external_connections")
      .update({ status: "revoked" as const })
      .eq("id", connector.connection.id);

    // Audit
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_events").insert({
        user_id: user.id,
        action: "connector_disconnected",
        entity_type: "user_external_connections",
        entity_id: connector.connection.id,
        metadata: { provider: connector.provider },
      });
    }

    await loadData();
  }

  async function handleUpload(connectorId: string, file: File) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector) return;

    // Create connection record
    const { data: connection } = await supabase
      .from("user_external_connections")
      .upsert(
        {
          user_id: user.id,
          connector_id: connectorId,
          status: "analyzing" as const,
        },
        { onConflict: "user_id,connector_id" }
      )
      .select()
      .single();

    if (!connection) return;

    // Record GDPR consent
    await supabase.from("data_processing_consent").upsert(
      {
        user_id: user.id,
        connector_id: connectorId,
        purpose: "matching_enhancement",
        status: "granted" as const,
        consent_text: `I consent to PRAGMA processing my ${connector.display_name} data export to derive personality and preference signals for matching improvement. Only derived signals are stored; raw data is discarded after analysis.`,
      },
      { onConflict: "user_id,connector_id,purpose" }
    );

    // Upload file for analysis
    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider", connector.provider);
    formData.append("connectionId", connection.id);

    const res = await fetch("/api/connectors/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      await supabase
        .from("user_external_connections")
        .update({ status: "error" as const, error_message: "Upload failed" })
        .eq("id", connection.id);
    }

    await loadData();
  }

  const filtered =
    activeCategory === "all"
      ? connectors
      : connectors.filter((c) => c.category === activeCategory);

  const activeCount = connectors.filter(
    (c) => c.connection?.status === "active"
  ).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-surface-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-surface-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => history.back()}
          className="mb-2 -ml-2"
        >
          &larr; {t("nav.settings")}
        </Button>
        <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">
          {t("connectors.title")}
        </h1>
        <p className="text-sm text-on-surface-muted mt-1">
          {t("connectors.subtitle")}
        </p>
        {activeCount > 0 && (
          <p className="text-xs text-primary mt-2">
            {activeCount} {t("connectors.activeConnections")}
          </p>
        )}
      </div>

      {/* Digital Portrait */}
      {insights.length > 0 && (
        <DigitalPortrait insights={insights} t={t} />
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
            activeCategory === "all"
              ? "bg-primary text-on-primary border-primary"
              : "border-border text-on-surface-muted hover:border-primary/50"
          }`}
        >
          {t("connectors.categories.all")}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-primary text-on-primary border-primary"
                : "border-border text-on-surface-muted hover:border-primary/50"
            }`}
          >
            {t(`connectors.categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Connector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((connector) => (
          <ConnectorCard
            key={connector.id}
            connector={connector}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onUpload={handleUpload}
            t={t}
          />
        ))}
      </div>

      {/* GDPR notice */}
      <div className="p-4 rounded-xl bg-surface-muted/30 border border-border">
        <p className="text-xs text-on-surface-muted leading-relaxed">
          {t("connectors.gdprNotice")}
        </p>
      </div>
    </div>
  );
}
