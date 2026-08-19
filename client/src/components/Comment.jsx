import { useState } from "react";
import { Button, Dropdown, DropdownItem, Textarea } from "flowbite-react";
import { FaThumbsUp } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { useSelector } from "react-redux";

const defaultAvatar =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

function formatCommentDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const { currentUser } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const username = comment.userId?.username || "deleted user";
  const profilePicture = comment.userId?.profilePicture || defaultAvatar;
  const likedByCurrentUser =
    currentUser && comment.likes?.includes(currentUser._id);
  const ownerId = comment.userId?._id;
  const canModify =
    currentUser && (currentUser._id === ownerId || currentUser.isAdmin);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: "PUT",
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

  return (
    <article className="py-6 text-base">
      <footer className="mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <p className="mr-3 inline-flex items-center text-sm font-semibold text-gray-900 dark:text-white">
            <img
              className="mr-2 h-6 w-6 rounded-full object-cover"
              src={profilePicture}
              alt={username}
            />
            {username}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <time dateTime={comment.createdAt}>
              {formatCommentDate(comment.createdAt)}
            </time>
          </p>
        </div>
        {canModify && !isEditing && (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <span className="inline-flex rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                <span className="sr-only">Comment settings</span>
                <HiDotsHorizontal className="h-5 w-5" />
              </span>
            }
          >
            <DropdownItem
              onClick={() => {
                setIsEditing(true);
                setEditedContent(comment.content);
              }}
            >
              Edit
            </DropdownItem>
            <DropdownItem onClick={() => onDelete(comment._id)}>
              Delete
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
              className="bg-blue-700 text-white"
              onClick={handleSave}
              disabled={editedContent.trim().length === 0}
            >
              Save
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
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-500 dark:text-gray-400">{comment.content}</p>
          <div className="mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => onLike(comment._id)}
              className={`flex items-center text-sm font-medium ${
                likedByCurrentUser
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:underline dark:text-gray-400"
              }`}
            >
              <FaThumbsUp className="mr-1.5 h-3.5 w-3.5" />
              {comment.numberOfLikes > 0
                ? `${comment.numberOfLikes} ${comment.numberOfLikes === 1 ? "Like" : "Likes"}`
                : "Like"}
            </button>
          </div>
        </>
      )}
    </article>
  );
}
