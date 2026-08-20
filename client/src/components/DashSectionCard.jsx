import { Link } from "react-router-dom";

export default function DashSectionCard({
  title,
  to,
  children,
  emptyMessage,
  isEmpty,
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-fon-border dark:border-fon-dark-border">
      <div className="flex items-center justify-between gap-3 border-b border-fon-border px-4 py-3 dark:border-fon-dark-border">
        <h2 className="font-semibold text-fon-navy dark:text-white">{title}</h2>
        <Link
          to={to}
          className="text-sm font-medium text-fon-magenta hover:underline"
        >
          Prikaži sve
        </Link>
      </div>
      {isEmpty ? (
        <p className="p-4 text-sm text-fon-muted dark:text-fon-dark-muted">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </div>
  );
}
