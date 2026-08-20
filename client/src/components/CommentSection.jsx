import { Button, Textarea } from "flowbite-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Comment from "./Comment";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "../contexts/ToastContext";

function getParentId(comment) {
  return comment?.parentId ? String(comment.parentId) : null;
}

function buildCommentThreads(comments) {
  const ids = new Set(comments.map((item) => String(item._id)));
  const repliesByParent = new Map();
  const topLevel = [];

  comments.forEach((comment) => {
    const parentId = getParentId(comment);
    if (!parentId || !ids.has(parentId)) {
      topLevel.push(comment);
      return;
    }
    const replies = repliesByParent.get(parentId) || [];
    replies.push(comment);
    repliesByParent.set(parentId, replies);
  });

  topLevel.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
  repliesByParent.forEach((replies) => {
    replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

  return topLevel.map((comment) => ({
    comment,
    replies: repliesByParent.get(String(comment._id)) || [],
  }));
}

function withCurrentUser(comment, currentUser) {
  return {
    ...comment,
    userId: {
      _id: currentUser._id,
      username: currentUser.username,
      profilePicture: currentUser.profilePicture,
    },
  };
}

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { showError } = useToast();
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const threads = buildCommentThreads(comments);
  const deleteHasReplies = comments.some(
    (item) => getParentId(item) === String(commentToDelete),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setComment("");
        setComments((prev) => [withCurrentUser(data, currentUser), ...prev]);
      } else {
        showError(data.message);
      }
    } catch (error) {
      showError(error.message);
    }
  };

  const handleReply = async (parentId, content) => {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        parentId,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Odgovor nije sačuvan");
    }
    setComments((prev) => [...prev, withCurrentUser(data, currentUser)]);
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
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) =>
          prev.filter(
            (c) =>
              c._id !== commentId && getParentId(c) !== String(commentId),
          ),
        );
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
      const res = await fetch(`/api/comments/${commentId}/likes`, {
        method: "POST",
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
        const response = await fetch(`/api/posts/${postId}/comments`);
        const data = await response.json();
        if (response.ok) {
          setComments(data);
        } else {
          showError(data.message);
        }
      } catch (error) {
        showError(error.message);
      }
    };
    fetchComments();
  }, [postId, showError]);

  return (
    <section className="mt-12 border-t border-fon-border pt-10 antialiased dark:border-fon-dark-border">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-fon-navy lg:text-2xl dark:text-white">
          Komentari ({comments.length})
        </h2>
      </div>

      {currentUser ? (
        <form className="mb-8" onSubmit={handleSubmit}>
          <div className="mb-4 rounded-lg border border-fon-border bg-white px-4 py-2 dark:border-fon-dark-border dark:bg-fon-dark">
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
            <p className="text-xs text-fon-muted dark:text-fon-dark-muted">
              {200 - comment.length} karaktera preostalo
            </p>
            <Button
              type="submit"
              className="bg-fon-navy text-white hover:bg-fon-navy-hover"
              disabled={comment.trim().length === 0}
            >
              Objavi komentar
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-fon-border bg-fon-bg p-4 text-sm text-fon-muted dark:border-fon-dark-border dark:bg-fon-dark dark:text-fon-dark-muted">
          Morate biti prijavljeni da biste ostavili komentar.{" "}
          <Link to="/sign-in" className="font-medium text-fon-magenta hover:underline">
            Prijavite se
          </Link>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-fon-muted dark:text-fon-dark-muted">
          Još nema komentara. Budite prvi koji će ostaviti komentar.
        </p>
      ) : (
        <div className="divide-y divide-fon-border dark:divide-fon-dark-border">
          {threads.map(({ comment: commentItem, replies }) => (
            <Comment
              key={commentItem._id}
              comment={commentItem}
              replies={replies}
              onLike={handleLike}
              onEdit={handleEdit}
              onReply={handleReply}
              onDelete={(commentId) => {
                setShowModal(true);
                setCommentToDelete(commentId);
              }}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => handleDelete(commentToDelete)}
        message={
          deleteHasReplies
            ? "Da li si siguran da želiš da obrišeš ovaj komentar? Obrisaće se i svi odgovori. Ova radnja se ne može opozvati."
            : "Da li si siguran da želiš da obrišeš ovaj komentar? Ova radnja se ne može opozvati."
        }
      />
    </section>
  );
}
