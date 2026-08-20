import { Link } from "react-router-dom";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import { formatDate } from "../utils/formatDate.js";

export default function PostCard({ post, layout = "list" }) {
  const { getCategoryColor, getCategoryName, getCategoryTextColor } =
    useCategories();
  const excerpt = post.shortDescription?.trim();
  const isGrid = layout === "grid";
  const author = post.userId;

  return (
    <article
      className={
        isGrid
          ? "flex flex-col gap-4"
          : "flex flex-col gap-5 sm:flex-row sm:gap-6"
      }
    >
      <Link
        to={`/post/${post.slug}`}
        className={
          isGrid
            ? "block overflow-hidden rounded-lg"
            : "block shrink-0 overflow-hidden rounded-lg sm:w-56 lg:w-72"
        }
      >
        <img
          src={post.image}
          alt={post.title}
          className="aspect-4/3 h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/search?category=${post.category}`}
          className="mb-3 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium hover:opacity-90"
          style={{
            backgroundColor: getCategoryColor(post.category),
            color: getCategoryTextColor(post.category),
          }}
        >
          {getCategoryName(post.category)}
        </Link>

        <h2
          className={
            isGrid
              ? "mb-3 text-lg leading-snug font-bold text-fon-navy dark:text-white"
              : "mb-3 text-xl leading-snug font-bold text-fon-navy dark:text-white lg:text-2xl"
          }
        >
          <Link
            to={`/post/${post.slug}`}
            className="hover:text-fon-magenta dark:hover:text-fon-magenta"
          >
            {post.title}
          </Link>
        </h2>

        <div className="mb-3 flex items-center gap-3">
          <img
            src={author?.profilePicture}
            alt={author?.username || "Autor"}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-fon-navy dark:text-white">
              {author?.username || "Fon Blog"}
            </p>
            <p className="text-fon-muted dark:text-fon-dark-muted">
              Objavljeno {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {excerpt && (
          <p
            className={`mb-4 text-sm leading-relaxed text-fon-muted dark:text-fon-dark-muted ${
              isGrid ? "line-clamp-2" : "line-clamp-3"
            }`}
          >
            {excerpt}
          </p>
        )}

        <Link
          to={`/post/${post.slug}`}
          className="inline-flex items-center text-sm font-medium text-fon-magenta hover:underline"
        >
          Pročitaj više
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
