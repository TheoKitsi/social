"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface UserInfo {
  display_name: string | null;
  avatar_url: string | null;
}

const navItems = [
  { href: "/profile", icon: "profile", labelKey: "nav.profile" },
  { href: "/matches", icon: "matches", labelKey: "nav.matches" },
  { href: "/messages", icon: "messages", labelKey: "nav.messages" },
  { href: "/subscription", icon: "subscription", labelKey: "nav.subscription" },
  { href: "/settings", icon: "settings", labelKey: "nav.settings" },
  { href: "/admin", icon: "admin", labelKey: "nav.admin" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) setUserInfo(data as UserInfo);
    }
    load();
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-secondary/95 backdrop-blur-sm md:hidden safe-bottom"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)] ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-muted hover:text-on-surface"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-primary shadow-[var(--shadow-accent-sm)]" />
              )}
              {item.icon === "profile" && userInfo?.avatar_url ? (
                <img
                  src={userInfo.avatar_url}
                  alt=""
                  className={`w-5 h-5 rounded-full object-cover ${isActive ? "ring-1 ring-primary" : ""}`}
                />
              ) : (
                <NavIcon name={item.icon} active={isActive} />
              )}
              <span className="text-[10px] font-medium">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) setUserInfo(data as UserInfo);
    }
    load();
  }, []);

  return (
    <aside
      className="hidden md:flex flex-col w-64 border-r border-border bg-secondary h-dvh sticky top-0"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <svg width="24" height="24" viewBox="0 0 512 512" className="text-primary shrink-0">
          <g fill="none" stroke="currentColor" strokeWidth="32" strokeLinejoin="round">
            <polyline points="100,120 200,256 100,392" />
            <polyline points="412,120 312,256 412,392" />
            <rect x="236" y="236" width="40" height="40" transform="rotate(45 256 256)" fill="currentColor" stroke="none" />
          </g>
        </svg>
        <span className="text-xl font-semibold text-on-surface tracking-[var(--tracking-tight)]">
          {t("common.appName")}
        </span>
      </div>

      {/* User info */}
      {userInfo && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold overflow-hidden bg-primary/15 text-primary border border-primary/20 text-sm shrink-0">
              {userInfo.avatar_url ? (
                <img src={userInfo.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (userInfo.display_name || "?").slice(0, 2).toUpperCase()
              )}
            </div>
            <p className="text-sm font-medium text-on-surface truncate">
              {userInfo.display_name || "User"}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)] ${
                isActive
                  ? "bg-primary/10 text-primary shadow-[var(--shadow-accent-sm)]"
                  : "text-on-surface-muted hover:text-on-surface hover:bg-surface-alt"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span className="text-sm font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const cls = `w-5 h-5 ${active ? "text-primary" : "text-current"}`;
  switch (name) {
    case "profile":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "matches":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "messages":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "subscription":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      );
    case "admin":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    default:
      return null;
  }
}
