import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spinner, Tooltip } from "flowbite-react";
import { FaLink } from "react-icons/fa";
import CommentSection from "../components/CommentSection";
import { useCategories } from "../contexts/CategoriesContext.jsx";

const defaultAvatar =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getReadingMinutes(html) {
  return Math.max(1, Math.round(stripHtml(html).length / 1000));
}

function formatReadingTime(minutes) {
  const lastTwo = minutes % 100;
  const last = minutes % 10;
  if (last === 1 && lastTwo !== 11) {
    return `Pročitaj za ${minutes} minut`;
  }
  return `Pročitaj za ${minutes} minuta`;
}

function formatMetaDate(dateString) {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("sr-Latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString("sr-Latn", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
}

export default function PostPage() {
  const { getCategoryColor, getCategoryName, getCategoryTextColor } =
    useCategories();
  const { postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.message);
          setPost(null);
          return;
        }
        setPost(data.posts[0] || null);
        setError(data.posts[0] ? null : "Objava nije pronađena");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    if (!post?.userId) return;
    const fetchAuthor = async () => {
      try {
        const response = await fetch(`/api/user/${post.userId}`);
        if (response.ok) {
          setAuthor(await response.json());
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchAuthor();
  }, [post]);

  useEffect(() => {
    if (!post?.category) return;
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch(
          `/api/post/getposts?category=${post.category}&limit=7`,
        );
        const data = await response.json();
        if (response.ok) {
          setRelatedPosts(
            data.posts
              .filter((relatedPost) => relatedPost._id !== post._id)
              .slice(0, 6),
          );
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchRelatedPosts();
  }, [post]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch("/api/post/getposts?limit=5");
        const data = await response.json();
        if (response.ok) {
          setRecentPosts(data.posts);
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchRecentPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-bold text-fon-navy dark:text-white">
          Objava nije pronađena
        </h1>
        <p className="text-fon-muted dark:text-fon-dark-muted">
          {error || "Ovaj članak ne postoji ili je uklonjen."}
        </p>
        <Link to="/search" className="text-fon-magenta hover:underline">
          Pregledaj objave
        </Link>
      </div>
    );
  }

  const latestPosts = recentPosts
    .filter((recentPost) => recentPost._id !== post._id)
    .slice(0, 4);
  const shareUrl = `${window.location.origin}/post/${post.slug}`;
  const copyBtnClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-fon-muted hover:bg-fon-bg hover:text-fon-navy dark:text-fon-dark-muted dark:hover:bg-fon-dark dark:hover:text-white";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <main className="bg-fon-bg dark:bg-fon-dark">
      <section className="relative isolate h-96 w-full overflow-hidden sm:h-112 lg:h-128">
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/80" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="w-full lg:w-8/12 lg:pr-12">
            <Link
              to={`/search?category=${post.category}`}
              className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm hover:opacity-90"
              style={{
                backgroundColor: getCategoryColor(post.category),
                color: getCategoryTextColor(post.category),
              }}
            >
              {getCategoryName(post.category)}
            </Link>
            <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            {post.shortDescription?.trim() && (
              <p className="max-w-2xl text-base font-light text-gray-200 md:text-lg">
                {post.shortDescription.trim()}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:-mt-14 sm:px-6 lg:-mt-16 lg:px-8">
        <div className="rounded-t-2xl bg-white px-4 pt-8 pb-8 dark:bg-fon-dark-surface sm:px-6 lg:px-8 lg:pt-12 lg:pb-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <article className="min-w-0 lg:col-span-8">
              <div className="mb-8 flex flex-col gap-4 border-b border-fon-border pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-fon-dark-border">
                <div className="flex items-center gap-3 text-sm text-fon-muted dark:text-fon-dark-muted">
                  <img
                    src={author?.profilePicture || defaultAvatar}
                    alt={author?.username || "Autor"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <p>
                    Napisao je{" "}
                    <span className="font-semibold text-fon-navy dark:text-white">
                      {author?.username || "Fon Blog"}
                    </span>
                    <span className="mx-2">·</span>
                    <time dateTime={post.createdAt}>
                      {formatMetaDate(post.createdAt)}
                    </time>
                  </p>
                </div>
                <Tooltip content={copied ? "Kopirano" : "Kopiraj link"}>
                  <button
                    type="button"
                    onClick={copyLink}
                    className={copyBtnClass}
                    aria-label={copied ? "Kopirano" : "Kopiraj link"}
                  >
                    <FaLink className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>

              <div
                className="post-content max-w-full"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <CommentSection postId={post._id} />
            </article>

            <aside className="lg:col-span-4" aria-label="Najnovije vesti">
              <h2 className="mb-6 text-sm font-bold tracking-wide text-fon-navy uppercase dark:text-white">
                Najnovije vesti
              </h2>
              {latestPosts.length === 0 ? (
                <p className="text-sm text-fon-muted dark:text-fon-dark-muted">
                  Još nema drugih članaka.
                </p>
              ) : (
                <div className="space-y-8">
                  {latestPosts.map((latestPost) => {
                    const minutes = getReadingMinutes(latestPost.content);
                    return (
                      <Link
                        key={latestPost._id}
                        to={`/post/${latestPost.slug}`}
                        className="group flex gap-4"
                      >
                        <img
                          src={latestPost.image}
                          alt={latestPost.title}
                          className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <h3 className="mb-1 text-base leading-snug font-bold text-fon-navy group-hover:text-fon-magenta dark:text-white dark:group-hover:text-fon-magenta">
                            {latestPost.title}
                          </h3>
                          {latestPost.shortDescription?.trim() && (
                            <p className="mb-2 line-clamp-2 text-sm text-fon-muted dark:text-fon-dark-muted">
                              {latestPost.shortDescription.trim()}
                            </p>
                          )}
                          <span className="text-sm font-medium text-fon-magenta">
                            {formatReadingTime(minutes)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>

          {relatedPosts.length > 0 && (
            <section
              className="mt-12 border-t border-fon-border pt-10 dark:border-fon-dark-border"
              aria-label="Sledeće za čitanje"
            >
              <h2 className="mb-8 text-2xl font-bold text-fon-navy dark:text-white">
                Pročitaj sledeće
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost._id}>
                    <Link to={`/post/${relatedPost.slug}`} className="group">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="mb-4 w-full rounded-lg object-cover aspect-video"
                      />
                      <h3 className="mb-3 text-lg leading-snug font-bold text-fon-navy group-hover:text-fon-magenta dark:text-white dark:group-hover:text-fon-magenta">
                        {relatedPost.title}
                      </h3>
                      <span className="text-sm font-medium text-fon-magenta group-hover:underline">
                        Pročitaj više
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
