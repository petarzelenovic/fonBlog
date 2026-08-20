import { useCategories } from "../contexts/CategoriesContext.jsx";

export default function CategoryBadge({ slug }) {
  const { getCategoryColor, getCategoryName } = useCategories();

  return (
    <span
      className="inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: getCategoryColor(slug) }}
    >
      {getCategoryName(slug)}
    </span>
  );
}
