import { Button, Select, Spinner, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "uncategorized",
  });

  const [posts, setPosts] = useState([]);
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
      category: categoryFromUrl || "uncategorized",
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
      const category = e.target.value || "uncategorized";
      setSidebarData({ ...sidebarData, category: category });
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
    urlParams.set("category", sidebarData.category);
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
    setPosts([...posts, ...data.posts]);
    if (data.posts.length === 9) {
      setShowMore(true);
    } else {
      setShowMore(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label>Search Term:</label>
            <TextInput
              type="text"
              placeholder="Search..."
              id="searchTerm"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label>Sort:</label>
            <Select id="sort" value={sidebarData.sort} onChange={handleChange}>
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label>Category:</label>
            <Select
              id="category"
              value={sidebarData.category}
              onChange={handleChange}
            >
              <option value="uncategorized">Uncategorized</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="engineering">Engineering</option>
              <option value="math">Math</option>
              <option value="history">History</option>
              <option value="art">Art</option>
            </Select>
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      <div className="w-full">
        <h1 className="text-3xl font-semibold p-3 mt-5">Search Results</h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && posts.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No posts found</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Spinner size="lg" />
            </div>
          )}
          {!loading &&
            posts.length > 0 &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-teal-500 text-lg hover:underline p-7 w-full"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
