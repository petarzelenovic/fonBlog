import { HiArrowNarrowUp } from "react-icons/hi";

export default function DashStatCard({ title, total, lastMonth, icon: Icon, iconClass }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-fon-border bg-white p-5 dark:border-fon-dark-border dark:bg-fon-dark">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-fon-muted dark:text-fon-dark-muted">
            {title}
          </h3>
          <p className="mt-1 text-2xl font-extrabold text-fon-navy dark:text-white">
            {total}
          </p>
        </div>
        <Icon className={`rounded-full p-3 text-5xl text-white shadow-sm ${iconClass}`} />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`inline-flex items-center ${
            lastMonth > 0
              ? "text-green-600 dark:text-green-400"
              : "text-fon-muted dark:text-fon-dark-muted"
          }`}
        >
          {lastMonth > 0 && <HiArrowNarrowUp />}
          {lastMonth}
        </span>
        <span className="text-fon-muted dark:text-fon-dark-muted">
          u poslednjih mesec dana
        </span>
      </div>
    </div>
  );
}
