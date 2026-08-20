import { Link } from "react-router-dom";

const tabs = [
  { id: "profile", label: "Profil", adminOnly: false },
  { id: "overview", label: "Pregled", adminOnly: true },
  { id: "posts", label: "Objave", adminOnly: true },
  { id: "users", label: "Korisnici", adminOnly: true },
  { id: "comments", label: "Komentari", adminOnly: true },
  { id: "categories", label: "Kategorije", adminOnly: true },
];

export default function DashTabs({ activeTab, isAdmin }) {
  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  const tabClass = (isActive) =>
    isActive
      ? "rounded-full border border-fon-navy px-3.5 py-1.5 text-sm font-medium text-fon-navy dark:border-white dark:text-white"
      : "rounded-full px-3.5 py-1.5 text-sm text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white";

  return (
    <nav
      className="mx-auto mb-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-3 border-b border-fon-border pb-6 dark:border-fon-dark-border"
      aria-label="Kontrolna tabla"
    >
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            to={`/dashboard?tab=${tab.id}`}
            className={tabClass(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
