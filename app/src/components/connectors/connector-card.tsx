"use client";

import { useState } from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import type { ConnectorWithStatus, ConnectorMethod } from "@/types/connectors";

interface ConnectorCardProps {
  connector: ConnectorWithStatus;
  onConnect: (connectorId: string) => void;
  onDisconnect: (connectorId: string) => void;
  onUpload: (connectorId: string, file: File) => void;
  t: (key: string) => string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  connected: "bg-info/10 text-info border-info/20",
  analyzing: "bg-warning/10 text-warning border-warning/20",
  error: "bg-error/10 text-error border-error/20",
  pending: "bg-surface-muted text-on-surface-muted border-border",
  revoked: "bg-surface-muted text-on-surface-muted border-border",
};

const METHOD_LABELS: Record<ConnectorMethod, string> = {
  oauth: "OAuth",
  csv_upload: "CSV",
  zip_upload: "ZIP",
};

function ConnectorIcon({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-surface-muted border border-border flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-on-surface-muted uppercase">
        {name.slice(0, 2)}
      </span>
    </div>
  );
}

export function ConnectorCard({
  connector,
  onConnect,
  onDisconnect,
  onUpload,
  t,
}: ConnectorCardProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isConnected = connector.connection?.status === "active";
  const hasInsight = !!connector.insight;
  const status = connector.connection?.status;

  function handleFileSelect() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = connector.accepted_file_types?.join(",") || "*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const maxBytes = (connector.max_file_size_mb || 50) * 1024 * 1024;
      if (file.size > maxBytes) {
        alert(t("connectors.fileTooLarge"));
        return;
      }

      setUploading(true);
      onUpload(connector.id, file);
      setUploading(false);
    };
    input.click();
  }

  return (
    <Card variant="outlined" className="group transition-colors hover:border-primary/30">
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <ConnectorIcon name={connector.icon_name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-on-surface text-sm">
                {connector.display_name}
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-on-surface-muted border border-border">
                {METHOD_LABELS[connector.method]}
              </span>
              {status && (
                <Badge className={`text-[10px] ${STATUS_COLORS[status] || ""}`}>
                  {t(`connectors.status.${status}`)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-on-surface-muted mt-1 line-clamp-2">
              {connector.description}
            </p>
          </div>
        </div>

        {/* Signals preview */}
        {hasInsight && connector.insight && (
          <div className="p-3 rounded-lg bg-surface-muted/50 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-on-surface">
                {t("connectors.derivedSignals")}
              </span>
              <span className="text-[10px] text-on-surface-muted">
                {t("connectors.confidence")}: {Math.round(connector.insight.confidence * 100)}%
              </span>
            </div>
            {connector.insight.signals.interests && (
              <div className="flex flex-wrap gap-1">
                {connector.insight.signals.interests.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-on-surface-muted">
              {t("connectors.lastAnalyzed")}: {new Date(connector.insight.analyzed_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Privacy info toggle */}
        <button
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="text-[11px] text-primary hover:underline"
        >
          {showPrivacy ? t("connectors.hidePrivacy") : t("connectors.showPrivacy")}
        </button>

        {showPrivacy && (
          <div className="text-[11px] text-on-surface-muted space-y-1 p-3 rounded-lg bg-surface-muted/30 border border-border">
            <p>{t("connectors.privacyInfo.noRawData")}</p>
            <p>{t("connectors.privacyInfo.onlySignals")}</p>
            <p>{t("connectors.privacyInfo.deleteAnytime")}</p>
            <p className="text-on-surface-muted/70">
              {t("connectors.signalsExtracted")}: {connector.signals_description}
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="pt-1">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDisconnect(connector.id)}
              className="w-full text-error hover:bg-error/10 hover:border-error/30"
            >
              {t("connectors.disconnect")}
            </Button>
          ) : connector.method === "oauth" ? (
            <Button
              size="sm"
              onClick={() => onConnect(connector.id)}
              className="w-full"
            >
              {t("connectors.connect")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFileSelect}
              loading={uploading}
              className="w-full"
            >
              {t("connectors.uploadFile")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
