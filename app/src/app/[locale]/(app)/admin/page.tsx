"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, Button, Input } from "@/components/ui";

interface UserRow {
  id: string;
  display_name: string | null;
  verification_status: string;
  is_active: boolean;
  created_at: string;
  quality_score: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  matchesMade: number;
}

export default function AdminPage() {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"overview" | "users" | "verification">("overview");
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, activeUsers: 0, verifiedUsers: 0, matchesMade: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Fetch stats
      const [profilesRes, activeRes, verifiedRes, matchesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "verified"),
        supabase.from("matching_scores").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        activeUsers: activeRes.count || 0,
        verifiedUsers: verifiedRes.count || 0,
        matchesMade: matchesRes.count || 0,
      });

      // Fetch users
      const { data: userRows } = await supabase
        .from("profiles")
        .select("id, display_name, verification_status, is_active, created_at, quality_score")
        .order("created_at", { ascending: false })
        .limit(50);

      setUsers((userRows as UserRow[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredUsers = users.filter(
    (u) => (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const statItems = [
    { label: t("admin.totalUsers"), value: stats.totalUsers.toLocaleString(), color: "text-primary" },
    { label: t("admin.activeUsers"), value: stats.activeUsers.toLocaleString(), color: "text-green-400" },
    { label: t("admin.verifiedUsers"), value: stats.verifiedUsers.toLocaleString(), color: "text-blue-400" },
    { label: t("admin.matchesMade"), value: stats.matchesMade.toLocaleString(), color: "text-amber-400" },
  ];

  const tabs = [
    { key: "overview" as const, label: t("admin.dashboard") },
    { key: "users" as const, label: t("admin.userManagement") },
    { key: "verification" as const, label: t("admin.verificationQueue") },
  ];

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      verified: "bg-green-500/15 text-green-400 border-green-500/20",
      pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      suspended: "bg-red-500/15 text-red-400 border-red-500/20",
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${styles[status] || "border-border text-on-surface-muted"}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="min-h-dvh px-6 py-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-[var(--tracking-tight)]">{t("admin.title")}</h1>
          <p className="text-sm text-on-surface-muted mt-1">{t("admin.dashboard")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-on-surface-muted">System healthy</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? "border-primary text-primary" : "border-transparent text-on-surface-muted hover:text-on-surface"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-8 animate-fade-in-up">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statItems.map((s) => (
                <Card key={s.label} variant="outlined" className="text-center">
                  <CardContent className="py-4">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-on-surface-muted mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Management */}
      {tab === "users" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex gap-3">
            <Input placeholder={t("admin.search") + "..."} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          </div>
          <Card variant="outlined">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Quality</th>
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface-alt/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-on-surface font-medium">{user.display_name || "—"}</p>
                      </td>
                      <td className="px-4 py-3">{statusBadge(user.verification_status)}</td>
                      <td className="px-4 py-3 text-on-surface-muted font-mono">{user.quality_score}</td>
                      <td className="px-4 py-3 text-on-surface-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">{t("admin.edit")}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Verification Queue */}
      {tab === "verification" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid gap-4">
            {users.filter((u) => u.verification_status === "pending").map((user) => (
              <Card key={user.id} variant="outlined">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-alt border border-border flex items-center justify-center text-lg font-semibold text-on-surface-muted">
                        {(user.display_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{user.display_name || "—"}</p>
                        <p className="text-xs text-on-surface-muted">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-green-400 border-green-500/20 hover:bg-green-500/10">Approve</Button>
                      <Button variant="outline" size="sm" className="text-red-400 border-red-500/20 hover:bg-red-500/10">Reject</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {users.filter((u) => u.verification_status === "pending").length === 0 && (
              <p className="text-center text-on-surface-muted py-12">No pending verifications</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
