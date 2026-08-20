import { Link } from "react-router-dom";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import logo from "../assets/logo.svg";

const linkClass =
  "text-sm text-fon-muted hover:text-fon-magenta dark:text-fon-dark-muted dark:hover:text-fon-magenta";

export default function FooterComponent() {
  const { categories } = useCategories();

  return (
    <footer className="border-t border-fon-border bg-white dark:border-fon-dark-border dark:bg-fon-dark-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-block">
              <img src={logo} alt="Fon Blog" className="h-12 w-auto sm:h-14" />
            </Link>
          </div>

          <div className="lg:col-span-4">
            <h2 className="mb-4 text-sm font-bold tracking-wide text-fon-navy uppercase dark:text-white">
              Kategorije
            </h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {categories.map((category) => (
                <li key={category._id}>
                  <Link
                    to={`/search?category=${category.slug}`}
                    className={`${linkClass} inline-flex items-center gap-2`}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="mb-4 text-sm font-bold tracking-wide text-fon-navy uppercase dark:text-white">
              Navigacija
            </h2>
            <ul className="space-y-2">
              <li>
                <Link to="/" className={linkClass}>
                  Početna
                </Link>
              </li>
              <li>
                <Link to="/search" className={linkClass}>
                  Pretraga
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-fon-border pt-6 dark:border-fon-dark-border">
          <p className="text-sm text-fon-muted dark:text-fon-dark-muted">
            © {new Date().getFullYear()} Fon Blog
          </p>
        </div>
      </div>
    </footer>
  );
}
