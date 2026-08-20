import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import PostCard from "../components/PostCard.jsx";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import { POSTS_LIMIT } from "../constants.js";
import heroImage from "../assets/hero-image.jpg";

export default function Home() {
  const { categories } = useCategories();
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const showMore = posts.length < totalPosts;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts?limit=${POSTS_LIMIT}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.message || "Objave nisu učitane");
          setPosts([]);
          return;
        }

        setPosts(data.posts);
        setTotalPosts(data.total);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleShowMore = async () => {
    if (loadingMore || !showMore) return;

    try {
      setLoadingMore(true);
      const startIndex = posts.length;
      const response = await fetch(
        `/api/posts?limit=${POSTS_LIMIT}&startIndex=${startIndex}`,
      );
      const data = await response.json();
      if (!response.ok) {
        return;
      }

      setPosts((previousPosts) => [...previousPosts, ...data.posts]);
      setTotalPosts(data.total);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <main className="bg-white dark:bg-fon-dark">
      <section
        className="relative isolate h-80 w-full overflow-hidden bg-cover bg-center sm:h-112 lg:h-128"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gray-900/80" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Priče sa FON-a
            </h1>
            <p className="mt-2 max-w-2xl text-base font-light text-gray-200 md:text-lg">
              Sve što biste voleli da ste znali o studiranju na FON-u.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-8 max-w-7xl px-4 sm:-mt-10 sm:px-6 lg:-mt-12 lg:px-8">
        <div className="rounded-t-2xl bg-white px-4 pt-8 pb-12 dark:bg-fon-dark-surface sm:px-6 lg:px-8 lg:pt-10 lg:pb-16">
          <nav
            className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-fon-border pb-6 dark:border-fon-dark-border"
            aria-label="Kategorije"
          >
            <Link
              to="/search"
              className="rounded-full border border-fon-navy px-3.5 py-1.5 text-sm font-medium text-fon-navy dark:border-white dark:text-white"
            >
              Sve kategorije
            </Link>
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/search?category=${category.slug}`}
                className="text-sm text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {error ? (
            <div className="py-16 text-center">
              <h2 className="mb-2 text-2xl font-bold text-fon-navy dark:text-white">
                Objave nisu učitane
              </h2>
              <p className="text-fon-muted dark:text-fon-dark-muted">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center">
              <h2 className="mb-2 text-2xl font-bold text-fon-navy dark:text-white">
                Još nema objava
              </h2>
              <p className="text-fon-muted dark:text-fon-dark-muted">
                Nove priče će se pojaviti ovde čim budu objavljene.
              </p>
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
                    className="bg-fon-navy text-white hover:bg-fon-navy-hover cursor-pointer"
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
      </div>
    </main>
  );
}
