import React, { useState } from "react";
import { Button, Textarea } from "flowbite-react";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";

const defaultAvatar =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

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
    <div className="flex p-4 border-b dark:border-gray-600 text-sm">
      <div className="shrink-0 mr-3">
        <img
          className="w-10 h-10 rounded-full bg-gray-200 object-cover"
          src={profilePicture}
          alt={username}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-bold mr-1 text-xs truncate">@{username}</span>
          <span className="text-gray-500 text-xs">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
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
                className="bg-blue-500 text-white"
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
            <p className="text-gray-500 pb-2">{comment.content}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <button type="button" onClick={() => onLike(comment._id)}>
                <FaThumbsUp
                  className={`text-sm ${likedByCurrentUser && "text-blue-500"}`}
                />
              </button>
              <p>
                {comment.numberOfLikes}{" "}
                {comment.numberOfLikes === 1 ? "like" : "likes"}
              </p>
              {canModify && (
                <>
                  <button
                    type="button"
                    className="text-blue-500 hover:underline"
                    onClick={() => {
                      setIsEditing(true);
                      setEditedContent(comment.content);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-500 hover:underline"
                    onClick={() => onDelete(comment._id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
