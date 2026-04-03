"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardContent, Select } from "@/components/ui";
import { locales, localeNames } from "@/i18n/routing";

const localeOptions = locales.map((l) => ({ value: l, label: localeNames[l] }));

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const currentLocale = useLocale();
  const [locale, setLocale] = useState(currentLocale);
  const [signingOut, setSigningOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Audit log before deletion (FN-17.1.1.1 — Exit Interview)
    await supabase.from("audit_events").insert({
      user_id: user.id,
      action: "account_deletion_requested",
      entity_type: "profiles",
      entity_id: user.id,
    });

    // Anonymize profile data (FN-7.1.1.3 — GDPR right to erasure)
    await supabase
      .from("profiles")
      .update({
        display_name: "[deleted]",
        avatar_url: null,
      })
      .eq("user_id", user.id);

    // Delete funnel profiles
    await supabase.from("funnel_profiles").delete().eq("user_id", user.id);

    // Delete external connector data (GDPR Art. 17 — cascade)
    await supabase.from("external_insights").delete().eq("user_id", user.id);
    await supabase.from("user_external_connections").delete().eq("user_id", user.id);
    await supabase.from("data_processing_consent").delete().eq("user_id", user.id);

    // Sign out
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleLocaleChange(newLocale: string) {
    setLocale(newLocale);
    if (newLocale) {
      router.push("/settings", { locale: newLocale } as never);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">
        {t("nav.settings")}
      </h1>

      {/* Language */}
      <Card variant="outlined">
        <CardContent className="space-y-3">
          <h2 className="font-semibold text-on-surface">
            {t("settings.language")}
          </h2>
          <Select
            options={localeOptions}
            value={locale}
            onChange={(e) => handleLocaleChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Adaptive Connectors */}
      <Card variant="outlined">
        <CardContent className="space-y-3">
          <h2 className="font-semibold text-on-surface">
            {t("connectors.title")}
          </h2>
          <p className="text-sm text-on-surface-muted">
            {t("connectors.settingsDescription")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/settings/connectors")}
          >
            {t("connectors.manage")}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy (FN-7.1.1) */}
      <Card variant="outlined">
        <CardContent className="space-y-3">
          <h2 className="font-semibold text-on-surface">
            {t("settings.privacy")}
          </h2>
          <div className="space-y-2 text-sm text-on-surface-muted">
            <p>{t("settings.dataProcessing")}</p>
            <p>{t("settings.encryption")}</p>
          </div>
          <Button variant="outline" size="sm">
            {t("settings.downloadData")}
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card variant="outlined">
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-on-surface">
            {t("settings.account")}
          </h2>

          <Button
            variant="outline"
            onClick={handleSignOut}
            loading={signingOut}
            className="w-full"
          >
            {t("settings.signOut")}
          </Button>

          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-error hover:bg-error/10"
            >
              {t("settings.deleteAccount")}
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-error/5 rounded-xl border border-error/20">
              <p className="text-sm text-error font-medium">
                {t("settings.deleteConfirmation")}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-error hover:bg-error/90"
                >
                  {t("settings.confirmDelete")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
