import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import { FaLink } from "react-icons/fa";
import CommentSection from "../components/CommentSection";

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

function formatMetaDate(dateString) {
  const date = new Date(dateString);
  const datePart = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timePart = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
    .replace(" ", "");
  return `${datePart} ${timePart}`;
}

export default function PostPage() {
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
        setError(data.posts[0] ? null : "Post not found");
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Post not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {error || "This article does not exist or was removed."}
        </p>
        <Link to="/search" className="text-blue-600 hover:underline">
          Browse posts
        </Link>
      </div>
    );
  }

  const latestPosts = recentPosts
    .filter((recentPost) => recentPost._id !== post._id)
    .slice(0, 4);
  const shareUrl = `${window.location.origin}/post/${post.slug}`;
  const copyBtnClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";

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
    <main className="bg-white dark:bg-gray-900">
      <section className="relative isolate h-96 w-full overflow-hidden sm:h-112 lg:h-128">
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/55" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="w-full lg:w-8/12 lg:pr-12">
            <Link
              to={`/search?category=${post.category}`}
              className="mb-4 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium capitalize text-white backdrop-blur-sm hover:bg-white/30"
            >
              {post.category}
            </Link>
            <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            {post.excerpt?.trim() && (
              <p className="max-w-2xl text-base font-light text-gray-200 md:text-lg">
                {post.excerpt.trim()}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:-mt-14 sm:px-6 lg:-mt-16 lg:px-8">
        <div className="rounded-t-2xl bg-white px-4 pt-8 pb-8 dark:bg-gray-900 sm:px-6 lg:px-8 lg:pt-12 lg:pb-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <article className="min-w-0 lg:col-span-8">
              <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <img
                    src={author?.profilePicture || defaultAvatar}
                    alt={author?.username || "Author"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <p>
                    By{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {author?.username || "Fon Blog"}
                    </span>
                    <span className="mx-2">·</span>
                    <time dateTime={post.createdAt}>
                      {formatMetaDate(post.createdAt)}
                    </time>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className={copyBtnClass}
                  aria-label={copied ? "Copied" : "Copy link"}
                  title={copied ? "Copied" : "Copy link"}
                >
                  <FaLink className="h-3.5 w-3.5" />
                </button>
              </div>

              <div
                className="post-content max-w-full"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <CommentSection postId={post._id} />
            </article>

            <aside className="lg:col-span-4" aria-label="Latest news">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
                Latest news
              </h2>
              {latestPosts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No other articles yet.
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
                          <h3 className="mb-1 text-base font-bold leading-snug text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-500">
                            {latestPost.title}
                          </h3>
                          {latestPost.excerpt?.trim() && (
                            <p className="mb-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                              {latestPost.excerpt.trim()}
                            </p>
                          )}
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-500">
                            Read in {minutes} minute{minutes === 1 ? "" : "s"}
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
              className="mt-12 border-t border-gray-200 pt-10 dark:border-gray-700"
              aria-label="Read next"
            >
              <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                Read Next
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
                      <h3 className="mb-3 text-lg font-bold leading-snug text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-500">
                        {relatedPost.title}
                      </h3>
                      <span className="text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-500">
                        Read more
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
