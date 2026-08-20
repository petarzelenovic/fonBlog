import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { Link } from "react-router-dom";
import { HiChevronDown, HiFilter } from "react-icons/hi";
import { POSTS_LIMIT } from "../constants.js";
import { formatDate } from "../utils/formatDate.js";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import CategoryBadge from "./CategoryBadge";
import ConfirmModal from "./ConfirmModal";
import DashTable from "./DashTable";

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const { categories } = useCategories();

  const [userPosts, setUserPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  const hasFilters = Boolean(searchTerm || selectedCategories.length);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          userId: currentUser._id,
          startIndex: String((currentPage - 1) * POSTS_LIMIT),
          limit: String(POSTS_LIMIT),
        });
        if (searchTerm) params.set("searchTerm", searchTerm);
        if (selectedCategories.length) {
          params.set("category", selectedCategories.join(","));
        }

        const response = await fetch(`/api/post/getposts?${params.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setUserPosts(data.posts);
          setTotalPosts(data.totalPosts);
          setTotalPages(Math.ceil(data.totalPosts / POSTS_LIMIT) || 1);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.isAdmin) {
      fetchPosts();
    }
  }, [
    currentUser._id,
    currentUser.isAdmin,
    currentPage,
    searchTerm,
    selectedCategories,
  ]);

  useEffect(() => {
    if (!categoryOpen) return;

    const handlePointerDown = (event) => {
      if (!categoryRef.current?.contains(event.target)) {
        setCategoryOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setCategoryOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const toggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug],
    );
    setCurrentPage(1);
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/post/deletepost/${postIdToDelete}/${currentUser._id}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return;
      }
      setUserPosts((prev) =>
        prev.filter((post) => post._id !== postIdToDelete),
      );
      setTotalPosts((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.log(error.message);
    }
  };

  const from = totalPosts === 0 ? 0 : (currentPage - 1) * POSTS_LIMIT + 1;
  const to = Math.min(currentPage * POSTS_LIMIT, totalPosts);

  return (
    <>
      <DashTable
        title="Sve objave"
        searchId="table-search-posts"
        searchPlaceholder="Pretraži objave..."
        searchValue={searchInput}
        onSearchChange={(e) => setSearchInput(e.target.value)}
        onSearchSubmit={handleSearchSubmit}
        toolbarEnd={
          <div className="relative shrink-0" ref={categoryRef}>
            <button
              type="button"
              aria-expanded={categoryOpen}
              aria-haspopup="listbox"
              onClick={() => setCategoryOpen((open) => !open)}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              <HiFilter className="mr-2 h-4 w-4 text-gray-400" />
              Kategorije
              {selectedCategories.length > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-700 px-1.5 text-xs font-semibold text-white">
                  {selectedCategories.length}
                </span>
              )}
              <HiChevronDown className="-mr-1 ml-1.5 h-5 w-5" />
            </button>
            {categoryOpen && (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-600 dark:bg-gray-700">
                <div className="p-3">
                  <h6 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Kategorija
                  </h6>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const selected = selectedCategories.includes(
                        category.slug,
                      );
                      return (
                        <button
                          key={category._id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleCategory(category.slug)}
                          className={`cursor-pointer rounded-full ${
                            selected
                              ? "ring-2 ring-gray-900 ring-offset-2 dark:ring-white dark:ring-offset-gray-700"
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          <CategoryBadge slug={category.slug} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-gray-200 px-3 py-2 dark:border-gray-600">
                  <button
                    type="button"
                    className={`text-sm font-medium ${
                      selectedCategories.length > 0
                        ? "cursor-pointer text-blue-600 hover:underline dark:text-blue-500"
                        : "cursor-default text-gray-400 dark:text-gray-500"
                    }`}
                    disabled={selectedCategories.length === 0}
                    onClick={() => {
                      setSelectedCategories([]);
                      setCurrentPage(1);
                    }}
                  >
                    Poništi
                  </button>
                </div>
              </div>
            )}
          </div>
        }
        total={totalPosts}
        from={from}
        to={to}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
        isEmpty={userPosts.length === 0}
        hasSearch={hasFilters}
        emptyTitle="Još nema objava"
        emptyDescription="Nove priče će se pojaviti ovde čim budu objavljene."
        emptySearchDescription="Pokušaj sa drugom pretragom ili filterom."
      >
        <Table hoverable className="w-full table-fixed">
          <TableHead>
            <TableRow>
              <TableHeadCell className="h-11 w-36 py-0">Ažurirano</TableHeadCell>
              <TableHeadCell className="h-11 py-0">Objava</TableHeadCell>
              <TableHeadCell className="h-11 w-44 py-0">
                Kategorija
              </TableHeadCell>
              <TableHeadCell className="h-11 w-36 py-0">
                <span className="sr-only">Akcije</span>
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userPosts.map((post) => (
              <TableRow key={post._id} className="bg-white dark:bg-gray-800">
                <TableCell className="h-[72px] py-0 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {formatDate(post.updatedAt)}
                </TableCell>
                <TableCell className="h-[72px] max-w-0 py-0">
                  <Link
                    to={`/post/${post.slug}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-12 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 truncate font-medium text-gray-900 dark:text-white">
                      {post.title}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="h-[72px] py-0">
                  <CategoryBadge slug={post.category} />
                </TableCell>
                <TableCell className="h-[72px] py-0">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                      to={`/update-post/${post._id}`}
                    >
                      Izmeni
                    </Link>
                    <button
                      type="button"
                      className="cursor-pointer font-medium text-red-600 hover:underline dark:text-red-500"
                      onClick={() => {
                        setShowModal(true);
                        setPostIdToDelete(post._id);
                      }}
                    >
                      Obriši
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashTable>
      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeletePost}
        message="Da li si siguran da želiš da obrišeš ovu objavu? Ova radnja se ne može opozvati."
      />
    </>
  );
}
