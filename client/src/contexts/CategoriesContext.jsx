import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CATEGORY_COLOR } from "../constants.js";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const value = useMemo(() => {
    const getCategoryName = (slug) =>
      categories.find((category) => category.slug === slug)?.name ?? slug;

    const getCategoryColor = (slug) =>
      categories.find((category) => category.slug === slug)?.color ??
      DEFAULT_CATEGORY_COLOR;

    return {
      categories,
      loading,
      refreshCategories,
      defaultCategorySlug: categories[0]?.slug ?? "",
      getCategoryName,
      getCategoryColor,
    };
  }, [categories, loading, refreshCategories]);

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
