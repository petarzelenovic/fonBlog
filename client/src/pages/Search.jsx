import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import PostCard from "../components/PostCard.jsx";
import { useCategories } from "../contexts/CategoriesContext.jsx";

function buildSearchUrl({ searchTerm = "", sort = "desc", categories = [] }) {
  const params = new URLSearchParams();
  if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
  if (sort && sort !== "desc") params.set("sort", sort);
  if (categories.length) params.set("category", categories.join(","));
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

function splitCategories(value) {
  return value ? value.split(",") : [];
}

function formatPostCount(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (last === 1 && lastTwo !== 11) return `${count} objava`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} objave`;
  }
  return `${count} objava`;
}

export default function Search() {
  const { categories, getCategoryName } = useCategories();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const searchTerm = urlParams.get("searchTerm") || "";
  const sort = urlParams.get("sort") || "desc";
  const selectedCategories = splitCategories(urlParams.get("category"));

  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const showMore = posts.length < totalPosts;
  const hasFilters = Boolean(
    searchTerm || selectedCategories.length || sort === "asc",
  );
  const selectedCategoryNames = selectedCategories.map(getCategoryName);
  const categoryLabel = selectedCategoryNames.join(", ");

  let heading = "Sve objave";
  if (searchTerm && categoryLabel) {
    heading =
      selectedCategories.length > 1
        ? `„${searchTerm}" u kategorijama ${categoryLabel}`
        : `„${searchTerm}" u kategoriji ${categoryLabel}`;
  } else if (searchTerm) {
    heading = `Rezultati za „${searchTerm}"`;
  } else if (categoryLabel) {
    heading = categoryLabel;
  }

  const toggleCategoryUrl = (slug) =>
    buildSearchUrl({
      searchTerm,
      sort,
      categories: selectedCategories.includes(slug)
        ? selectedCategories.filter((item) => item !== slug)
        : [...selectedCategories, slug],
    });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const response = await fetch(`/api/posts?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.message);
          setPosts([]);
          setTotalPosts(0);
          return;
        }

        setPosts(data.posts);
        setTotalPosts(data.total);
        setError(null);
      } catch (err) {
        setError(err.message);
        setPosts([]);
        setTotalPosts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.search]);

  const handleShowMore = async () => {
    if (loadingMore || !showMore) return;

    try {
      setLoadingMore(true);
      const params = new URLSearchParams(location.search);
      params.set("startIndex", String(posts.length));
      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) return;

      setPosts((previousPosts) => [...previousPosts, ...data.posts]);
      setTotalPosts(data.total);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const chipClass = (isActive) =>
    isActive
      ? "rounded-full border border-fon-navy px-3.5 py-1.5 text-sm font-medium text-fon-navy dark:border-white dark:text-white"
      : "rounded-full px-3.5 py-1.5 text-sm text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white";

  const sortClass = (isActive) =>
    isActive
      ? "text-sm font-medium text-fon-navy dark:text-white"
      : "text-sm text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white";

  return (
    <main className="bg-white dark:bg-fon-dark">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8 lg:pt-10 lg:pb-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-fon-navy dark:text-white md:text-3xl">
              {heading}
            </h1>
            <p className="mt-1 text-sm text-fon-muted dark:text-fon-dark-muted">
              {loading
                ? "Učitavanje objava..."
                : error
                  ? "Pretraga trenutno nije uspela"
                  : `${formatPostCount(totalPosts)}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-fon-muted dark:text-fon-dark-muted">
                Sortiraj
              </span>
              <Link
                to={buildSearchUrl({
                  searchTerm,
                  categories: selectedCategories,
                  sort: "desc",
                })}
                className={sortClass(sort === "desc")}
              >
                Najnovije
              </Link>
              <Link
                to={buildSearchUrl({
                  searchTerm,
                  categories: selectedCategories,
                  sort: "asc",
                })}
                className={sortClass(sort === "asc")}
              >
                Najstarije
              </Link>
            </div>
            {hasFilters && (
              <Link
                to="/search"
                className="text-sm font-medium text-fon-magenta hover:underline"
              >
                Poništi filtere
              </Link>
            )}
          </div>
        </div>

        <nav
          className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-3 border-b border-fon-border pb-6 dark:border-fon-dark-border"
          aria-label="Kategorije"
        >
          <Link
            to={buildSearchUrl({ searchTerm, sort, categories: [] })}
            className={chipClass(selectedCategories.length === 0)}
          >
            Sve kategorije
          </Link>
          {categories.map((item) => (
            <Link
              key={item._id}
              to={toggleCategoryUrl(item.slug)}
              className={chipClass(selectedCategories.includes(item.slug))}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold text-fon-navy dark:text-white">
              Objave nisu učitane
            </h2>
            <p className="text-fon-muted dark:text-fon-dark-muted">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold text-fon-navy dark:text-white">
              Nema rezultata
            </h2>
            <p className="text-fon-muted dark:text-fon-dark-muted">
              Pokušaj sa drugom pretragom ili kategorijom.
            </p>
            {hasFilters && (
              <Link
                to="/search"
                className="mt-4 inline-flex text-sm font-medium text-fon-magenta hover:underline"
              >
                Prikaži sve objave
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-10">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {showMore && (
              <div className="mt-12 flex justify-center">
                <Button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="cursor-pointer bg-fon-navy text-white hover:bg-fon-navy-hover"
                >
                  {loadingMore ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Učitavanje...
                    </>
                  ) : (
                    "Prikaži još"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
