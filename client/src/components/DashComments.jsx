import { useEffect, useState } from "react";
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
import { POSTS_LIMIT } from "../constants.js";
import { formatDate } from "../utils/formatDate.js";
import ConfirmModal from "./ConfirmModal";
import DashTable from "./DashTable";

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);

  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          startIndex: String((currentPage - 1) * POSTS_LIMIT),
          limit: String(POSTS_LIMIT),
        });
        if (searchTerm) params.set("searchTerm", searchTerm);

        const response = await fetch(
          `/api/comment/getcomments?${params.toString()}`,
        );
        const data = await response.json();
        if (response.ok) {
          setComments(data.comments);
          setTotalComments(data.totalComments);
          setTotalPages(Math.ceil(data.totalComments / POSTS_LIMIT) || 1);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.isAdmin) {
      fetchComments();
    }
  }, [currentUser._id, currentUser.isAdmin, currentPage, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      const res = await fetch(
        `/api/comment/deleteComment/${commentIdToDelete}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
        return;
      }
      const deletedCount = data.deletedCount || 1;
      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment._id !== commentIdToDelete &&
            String(comment.parentId || "") !== String(commentIdToDelete),
        ),
      );
      setTotalComments((prev) => Math.max(0, prev - deletedCount));
    } catch (error) {
      console.log(error.message);
    }
  };

  const from = totalComments === 0 ? 0 : (currentPage - 1) * POSTS_LIMIT + 1;
  const to = Math.min(currentPage * POSTS_LIMIT, totalComments);

  return (
    <>
      <DashTable
        title="Svi komentari"
        searchId="table-search-comments"
        searchPlaceholder="Pretraži komentare..."
        searchValue={searchInput}
        onSearchChange={(e) => setSearchInput(e.target.value)}
        onSearchSubmit={handleSearchSubmit}
        total={totalComments}
        from={from}
        to={to}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
        isEmpty={comments.length === 0}
        hasSearch={Boolean(searchTerm)}
        emptyTitle="Još nema komentara"
        emptyDescription="Komentari sa objava će se pojaviti ovde."
      >
        <Table hoverable className="w-full table-fixed">
          <TableHead>
            <TableRow>
              <TableHeadCell className="h-11 w-36 py-0">
                Ažurirano
              </TableHeadCell>
              <TableHeadCell className="h-11 py-0">Komentar</TableHeadCell>
              <TableHeadCell className="h-11 w-44 py-0">Autor</TableHeadCell>
              <TableHeadCell className="h-11 py-0">Objava</TableHeadCell>
              <TableHeadCell className="h-11 w-24 py-0">Sviđanja</TableHeadCell>
              <TableHeadCell className="h-11 w-28 py-0">
                <span className="sr-only">Akcije</span>
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment._id} className="bg-white dark:bg-gray-800">
                <TableCell className="h-18 py-0 whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {formatDate(comment.updatedAt)}
                </TableCell>
                <TableCell className="h-18 max-w-0 py-0">
                  <p className="line-clamp-2 text-gray-900 dark:text-white">
                    {comment.content}
                  </p>
                </TableCell>
                <TableCell className="h-18 py-0">
                  <div className="flex min-w-0 items-center gap-3">
                    {comment.userId?.profilePicture && (
                      <img
                        src={comment.userId.profilePicture}
                        alt={comment.userId.username}
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <span className="min-w-0 truncate text-sm font-medium text-gray-900 dark:text-white">
                      {comment.userId?.username || "obrisan nalog"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="h-18 max-w-0 py-0">
                  {comment.postId?.slug ? (
                    <Link
                      className="block truncate font-medium text-blue-600 hover:underline dark:text-blue-500"
                      to={`/post/${comment.postId.slug}`}
                    >
                      {comment.postId.title}
                    </Link>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      obrisana objava
                    </span>
                  )}
                </TableCell>
                <TableCell className="h-18 py-0 text-gray-500 dark:text-gray-400">
                  {comment.numberOfLikes}
                </TableCell>
                <TableCell className="h-18 py-0 text-right">
                  <button
                    type="button"
                    className="cursor-pointer font-medium text-red-600 hover:underline dark:text-red-500"
                    onClick={() => {
                      setShowModal(true);
                      setCommentIdToDelete(comment._id);
                    }}
                  >
                    Obriši
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashTable>
      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteComment}
        message="Da li si siguran da želiš da obrišeš ovaj komentar? Ako ima odgovore, i oni će biti obrisani. Ova radnja se ne može opozvati."
      />
    </>
  );
}
