"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, Button, Input } from "@/components/ui";

const mockUsers = [
  { id: "u1", name: "Elena Papadopoulos", email: "elena@example.com", status: "verified", plan: "Premium", joined: "2025-01-15", lastActive: "2025-07-10", matches: 12 },
  { id: "u2", name: "Marcus Weber", email: "marcus@example.com", status: "verified", plan: "Elite", joined: "2025-02-03", lastActive: "2025-07-11", matches: 8 },
  { id: "u3", name: "Sofia Müller", email: "sofia@example.com", status: "pending", plan: "Free", joined: "2025-06-28", lastActive: "2025-07-09", matches: 0 },
  { id: "u4", name: "Nikolaos Alexiou", email: "niko@example.com", status: "verified", plan: "Premium", joined: "2025-03-12", lastActive: "2025-07-11", matches: 5 },
  { id: "u5", name: "Anna Schmidt", email: "anna@example.com", status: "suspended", plan: "Free", joined: "2025-04-01", lastActive: "2025-05-20", matches: 2 },
  { id: "u6", name: "Dimitris Katsaros", email: "dimitris@example.com", status: "verified", plan: "Premium", joined: "2025-01-22", lastActive: "2025-07-10", matches: 15 },
];

const mockStats = {
  totalUsers: 2847,
  activeUsers: 1923,
  verifiedUsers: 2104,
  matchesMade: 847,
  revenue: 14280,
  subscriptions: { free: 1243, premium: 1204, elite: 400 },
};

export default function AdminPage() {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"overview" | "users" | "verification" | "analytics">("overview");

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: t("admin.totalUsers"), value: mockStats.totalUsers.toLocaleString(), color: "text-primary" },
    { label: t("admin.activeUsers"), value: mockStats.activeUsers.toLocaleString(), color: "text-green-400" },
    { label: t("admin.verifiedUsers"), value: mockStats.verifiedUsers.toLocaleString(), color: "text-blue-400" },
    { label: t("admin.matchesMade"), value: mockStats.matchesMade.toLocaleString(), color: "text-amber-400" },
    { label: t("admin.revenue"), value: `€${mockStats.revenue.toLocaleString()}`, color: "text-primary" },
  ];

  const tabs = [
    { key: "overview" as const, label: t("admin.dashboard") },
    { key: "users" as const, label: t("admin.userManagement") },
    { key: "verification" as const, label: t("admin.verificationQueue") },
    { key: "analytics" as const, label: t("admin.analytics") },
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

  function planBadge(plan: string) {
    const styles: Record<string, string> = {
      Elite: "bg-primary/15 text-primary border-primary/20",
      Premium: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      Free: "bg-surface border-border text-on-surface-muted",
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${styles[plan] || "border-border text-on-surface-muted"}`}>
        {plan}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((s) => (
              <Card key={s.label} variant="outlined" className="text-center">
                <CardContent className="py-4">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-on-surface-muted mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card variant="outlined">
              <CardContent>
                <h3 className="text-sm font-semibold text-on-surface mb-4">{t("admin.subscriptions")}</h3>
                <div className="space-y-3">
                  {Object.entries(mockStats.subscriptions).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${plan === "elite" ? "bg-primary" : plan === "premium" ? "bg-blue-400" : "bg-surface-alt border border-border"}`} />
                        <span className="text-sm text-on-surface capitalize">{plan}</span>
                      </div>
                      <span className="text-sm font-mono text-on-surface-muted">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="outlined" className="md:col-span-2">
              <CardContent>
                <h3 className="text-sm font-semibold text-on-surface mb-4">{t("admin.recentActivity")}</h3>
                <div className="space-y-3">
                  {[
                    { action: "New user registered", user: "K. Papadimitriou", time: "2 min ago" },
                    { action: "Verification approved", user: "M. Weber", time: "15 min ago" },
                    { action: "Match confirmed", user: "E. Papadopoulos & D. Katsaros", time: "1 hr ago" },
                    { action: "Premium upgrade", user: "S. Müller", time: "3 hrs ago" },
                    { action: "Profile flagged", user: "Anonymous report", time: "5 hrs ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        <span className="text-on-surface">{activity.action}</span>
                        <span className="text-on-surface-muted">{activity.user}</span>
                      </div>
                      <span className="text-xs text-on-surface-muted">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Matches</th>
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Last Active</th>
                    <th className="px-4 py-3 text-xs text-on-surface-muted font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface-alt/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-on-surface font-medium">{user.name}</p>
                          <p className="text-xs text-on-surface-muted">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{statusBadge(user.status)}</td>
                      <td className="px-4 py-3">{planBadge(user.plan)}</td>
                      <td className="px-4 py-3 text-on-surface-muted font-mono">{user.matches}</td>
                      <td className="px-4 py-3 text-on-surface-muted">{user.lastActive}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">{t("admin.edit")}</Button>
                          <Button variant="ghost" size="sm" className="text-red-400">{t("admin.delete")}</Button>
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
            {mockUsers.filter((u) => u.status === "pending").map((user) => (
              <Card key={user.id} variant="outlined">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-alt border border-border flex items-center justify-center text-lg font-semibold text-on-surface-muted">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{user.name}</p>
                        <p className="text-xs text-on-surface-muted">{user.email} &middot; Joined {user.joined}</p>
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
            {mockUsers.filter((u) => u.status === "pending").length === 0 && (
              <p className="text-center text-on-surface-muted py-12">No pending verifications</p>
            )}
          </div>
        </div>
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="outlined">
              <CardContent>
                <h3 className="text-sm font-semibold text-on-surface mb-6">User Growth (Last 6 Months)</h3>
                <div className="flex items-end gap-2 h-40">
                  {[380, 520, 710, 980, 1450, 2847].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/20 rounded-t-sm relative" style={{ height: `${(val / 2847) * 100}%` }}>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-on-surface-muted font-mono">{val}</div>
                      </div>
                      <span className="text-[9px] text-on-surface-muted">{["Feb", "Mar", "Apr", "May", "Jun", "Jul"][i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <h3 className="text-sm font-semibold text-on-surface mb-6">Revenue (Last 6 Months)</h3>
                <div className="flex items-end gap-2 h-40">
                  {[1200, 2800, 4500, 7200, 10800, 14280].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/20 rounded-t-sm relative" style={{ height: `${(val / 14280) * 100}%` }}>
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-on-surface-muted font-mono">€{(val / 1000).toFixed(1)}k</div>
                      </div>
                      <span className="text-[9px] text-on-surface-muted">{["Feb", "Mar", "Apr", "May", "Jun", "Jul"][i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="outlined" className="md:col-span-2">
              <CardContent>
                <h3 className="text-sm font-semibold text-on-surface mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Avg. Match Score", value: "78.3%", delta: "+2.1%" },
                    { label: "Conversion Rate", value: "34.7%", delta: "+5.4%" },
                    { label: "Success Commission", value: "€2,340", delta: "+12.8%" },
                    { label: "Avg. Session Duration", value: "14m 23s", delta: "+1m 12s" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <p className="text-xs text-on-surface-muted">{metric.label}</p>
                      <p className="text-xl font-bold text-on-surface mt-1">{metric.value}</p>
                      <p className="text-xs text-green-400 mt-0.5">{metric.delta}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
