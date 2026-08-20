import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
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
    };

    fetchCategories();
  }, []);

  const value = useMemo(() => {
    const getCategoryName = (slug) =>
      categories.find((category) => category.slug === slug)?.name ?? slug;

    const getCategoryColor = (slug) =>
      categories.find((category) => category.slug === slug)?.color ?? "#004A7C";

    return {
      categories,
      loading,
      defaultCategorySlug: categories[0]?.slug ?? "",
      getCategoryName,
      getCategoryColor,
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
