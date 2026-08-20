import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category/getcategories");
        const data = await response.json();
        if (response.ok) {
          setCategories(data);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const value = useMemo(() => {
    const getCategoryName = (slug) =>
      categories.find((category) => category.slug === slug)?.name ?? slug;

    const getCategoryColor = (slug) =>
      categories.find((category) => category.slug === slug)?.color ?? "#004A7C";

    const getCategoryTextColor = (slug) => {
      const hex = getCategoryColor(slug).replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 160 ? "#004A7C" : "#FFFFFF";
    };

    return {
      categories,
      loading,
      defaultCategorySlug: categories[0]?.slug ?? "",
      getCategoryName,
      getCategoryColor,
      getCategoryTextColor,
    };
  }, [categories, loading]);

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }
  return context;
}
