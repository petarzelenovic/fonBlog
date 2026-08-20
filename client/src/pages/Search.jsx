import { Button, Select, Spinner, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import { fetchAuthorsByIds } from "../utils/fetchAuthors.js";

export default function Search() {
  const { categories } = useCategories();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "",
  });

  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");
    setSidebarData({
      searchTerm: searchTermFromUrl || "",
      sort: sortFromUrl || "desc",
      category: categoryFromUrl || "",
    });

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();

      const response = await fetch(`/api/post/getposts?${searchQuery}`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      setPosts(data.posts);
      setAuthors(
        await fetchAuthorsByIds(
          data.posts.map((post) => post.userId),
          {},
        ),
      );
      setLoading(false);
      if (data.totalPosts <= 9) {
        setShowMore(false);
      } else {
        setShowMore(true);
      }
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    } else if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarData({ ...sidebarData, sort: order });
    } else if (e.target.id === "category") {
      const category = e.target.value;
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    const trimmedSearchTerm = sidebarData.searchTerm.trim();
    if (trimmedSearchTerm) {
      urlParams.set("searchTerm", trimmedSearchTerm);
    } else {
      urlParams.delete("searchTerm");
    }
    urlParams.set("sort", sidebarData.sort);
    if (sidebarData.category) {
      urlParams.set("category", sidebarData.category);
    } else {
      urlParams.delete("category");
    }
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const response = await fetch(`/api/post/getposts?${searchQuery}`);
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    setAuthors(
      await fetchAuthorsByIds(
        data.posts.map((post) => post.userId),
        authors,
      ),
    );
    setPosts([...posts, ...data.posts]);
    if (data.posts.length === 9) {
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="border-b border-fon-border bg-white p-7 md:min-h-screen md:border-r dark:border-fon-dark-border dark:bg-fon-dark-surface">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-fon-navy dark:text-white">Search Term:</label>
            <TextInput
              type="text"
              placeholder="Search..."
              id="searchTerm"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-fon-navy dark:text-white">Sort:</label>
            <Select id="sort" value={sidebarData.sort} onChange={handleChange}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-fon-navy dark:text-white">Category:</label>
            <Select
              id="category"
              value={sidebarData.category}
              onChange={handleChange}
            >
              <option value="">Sve kategorije</option>
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" className="bg-fon-navy text-white hover:bg-fon-navy-hover">Search</Button>
        </form>
      </div>
      <div className="w-full">
        <h1 className="mt-5 p-3 text-3xl font-semibold text-fon-navy dark:text-white">Search Results</h1>
        <div className="p-7">
          {!loading && posts.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-fon-muted">No posts found</p>
            </div>
          )}
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          )}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  author={authors[post.userId]}
                  layout="grid"
                />
              ))}
            </div>
          )}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="w-full p-7 text-lg text-fon-magenta hover:underline"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
