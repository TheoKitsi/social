import { PublicFooter } from "@/components/layout/public-footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-secondary bg-grid flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12 pb-20">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
