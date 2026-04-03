import { Sidebar, BottomNav } from "@/components/layout/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-secondary">
      <Sidebar />
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] md:pb-0 md:pt-0 bg-grid">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
