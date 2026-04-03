import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <h1 className="text-6xl font-bold text-on-surface">404</h1>
      <p className="text-on-surface-muted">Page not found</p>
      <Link
        href="/"
        className="text-primary hover:underline text-sm font-medium"
      >
        Go home
      </Link>
    </div>
  );
}
