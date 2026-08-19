import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Textarea,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import Comment from "./Comment";

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/comment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser._id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setComment("");
        setCommentError(null);
        setComments((prev) => [
          {
            ...data,
            userId: {
              _id: currentUser._id,
              username: currentUser.username,
              profilePicture: currentUser.profilePicture,
            },
          },
          ...prev,
        ]);
      } else {
        setCommentError(data.message);
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  const handleEdit = (commentId, editedContent) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId ? { ...c, content: editedContent } : c,
      ),
    );
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  likes: data.likes,
                  numberOfLikes: data.numberOfLikes,
                }
              : c,
          ),
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comment/getPostComments/${postId}`);
        const data = await response.json();
        if (response.ok) {
          setComments(data);
        } else {
          setCommentError(data.message);
        }
      } catch (error) {
        setCommentError(error.message);
      }
    };
    fetchComments();
  }, [postId]);

  return (
    <section className="mt-12 border-t border-gray-200 pt-10 antialiased dark:border-gray-700">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 lg:text-2xl dark:text-white">
          Komentari ({comments.length})
        </h2>
      </div>

      {currentUser ? (
        <form className="mb-8" onSubmit={handleSubmit}>
          <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
            <label htmlFor="comment" className="sr-only">
              Vaš komentar
            </label>
            <Textarea
              id="comment"
              placeholder="Napišite komentar..."
              rows={6}
              maxLength="200"
              onChange={(e) => setComment(e.target.value)}
              value={comment}
              className="border-0 bg-transparent px-0 text-sm shadow-none focus:ring-0 dark:bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {200 - comment.length} karaktera preostalo
            </p>
            <Button
              type="submit"
              className="bg-blue-700 text-white hover:bg-blue-800"
              disabled={comment.trim().length === 0}
            >
              Objavi komentar
            </Button>
          </div>
          {commentError && (
            <Alert color="failure" className="mt-5">
              {commentError}
            </Alert>
          )}
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Morate biti prijavljeni da biste ostavili komentar.{" "}
          <Link to="/sign-in" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Prijavite se
          </Link>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Još nema komentara. Budite prvi koji će ostaviti komentar.
        </p>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {comments.map((commentItem) => (
            <Comment
              key={commentItem._id}
              comment={commentItem}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={(commentId) => {
                setShowModal(true);
                setCommentToDelete(commentId);
              }}
            />
          ))}
        </div>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
        dismissible
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Da li ste sigurni da želite da obrišete ovaj komentar? Ova radnja
              se ne može opozvati.
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => handleDelete(commentToDelete)}
              >
                Da, obriši
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Ne, otkaži
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </section>
  );
}
