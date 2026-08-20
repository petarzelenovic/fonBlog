import { useState } from "react";
import { Button, Dropdown, DropdownItem, Textarea } from "flowbite-react";
import { FaThumbsUp } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatDate.js";
import { useToast } from "../contexts/ToastContext.jsx";

export default function Comment({
  comment,
  replies = [],
  onLike,
  onEdit,
  onDelete,
  onReply,
}) {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const username = comment.userId?.username || "obrisan korisnik";
  const profilePicture = comment.userId?.profilePicture;
  const likedByCurrentUser =
    currentUser && comment.likes?.includes(currentUser._id);
  const ownerId = comment.userId?._id;
  const canModify =
    currentUser && (currentUser._id === ownerId || currentUser.isAdmin);
  const canReply = Boolean(onReply);
  const isReply = Boolean(comment.parentId);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/comments/${comment._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        setIsEditing(false);
        onEdit(comment._id, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleReplyClick = () => {
    if (!currentUser) {
      navigate("/sign-in");
      return;
    }
    setIsEditing(false);
    setIsReplying((open) => !open);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || replying) return;

    try {
      setReplying(true);
      await onReply(comment._id, replyContent.trim());
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      showError(error.message);
    } finally {
      setReplying(false);
    }
  };

  return (
    <article className={isReply ? "py-4 text-base" : "py-6 text-base"}>
      <footer className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <p className="mr-3 inline-flex items-center text-sm font-semibold text-fon-navy dark:text-white">
            <img
              className="mr-2 h-6 w-6 rounded-full object-cover"
              src={profilePicture}
              alt={username}
            />
            {username}
          </p>
          <p className="text-sm text-fon-muted dark:text-fon-dark-muted">
            <time dateTime={comment.createdAt}>
              {formatDate(comment.createdAt)}
            </time>
          </p>
        </div>
        {canModify && !isEditing && (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <span className="inline-flex rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                <span className="sr-only">Podešavanja komentara</span>
                <HiDotsHorizontal className="h-5 w-5" />
              </span>
            }
          >
            <DropdownItem
              onClick={() => {
                setIsEditing(true);
                setIsReplying(false);
                setEditedContent(comment.content);
              }}
            >
              Izmeni
            </DropdownItem>
            <DropdownItem onClick={() => onDelete(comment._id)}>
              Obriši
            </DropdownItem>
          </Dropdown>
        )}
      </footer>

      {isEditing ? (
        <>
          <Textarea
            className="mb-2"
            value={editedContent}
            maxLength="200"
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 text-xs">
            <Button
              type="button"
              size="xs"
              className="bg-fon-navy text-white hover:bg-fon-navy-hover"
              onClick={handleSave}
              disabled={editedContent.trim().length === 0}
            >
              Sačuvaj
            </Button>
            <Button
              type="button"
              size="xs"
              color="gray"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(comment.content);
              }}
            >
              Otkaži
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-fon-muted dark:text-fon-dark-muted">
            {comment.content}
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => onLike(comment._id)}
              className={`flex cursor-pointer items-center text-sm font-medium ${
                likedByCurrentUser
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:underline dark:text-gray-400"
              }`}
            >
              <FaThumbsUp className="mr-1.5 h-3.5 w-3.5" />
              {comment.numberOfLikes > 0
                ? `${comment.numberOfLikes} ${comment.numberOfLikes === 1 ? "sviđanje" : "sviđanja"}`
                : "Sviđa mi se"}
            </button>
            {canReply && (
              <button
                type="button"
                onClick={handleReplyClick}
                className="cursor-pointer text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
              >
                Odgovori
              </button>
            )}
          </div>
        </>
      )}

      {isReplying && (
        <form className="mt-4" onSubmit={handleReplySubmit}>
          <Textarea
            className="mb-2"
            placeholder={`Odgovor za ${username}...`}
            rows={3}
            maxLength="200"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-fon-muted dark:text-fon-dark-muted">
              {200 - replyContent.length} karaktera preostalo
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="xs"
                color="gray"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
              >
                Otkaži
              </Button>
              <Button
                type="submit"
                size="xs"
                className="bg-fon-navy text-white hover:bg-fon-navy-hover"
                disabled={replyContent.trim().length === 0 || replying}
              >
                Objavi odgovor
              </Button>
            </div>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className="mt-2 ml-4 border-l border-fon-border pl-4 sm:ml-8 dark:border-fon-dark-border">
          {replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </article>
  );
}
