import React from "react";
import { FaThumbsUp } from "react-icons/fa";
import { useSelector } from "react-redux";

const defaultAvatar =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

export default function Comment({ comment, onLike }) {
  const { currentUser } = useSelector((state) => state.user);
  const username = comment.user?.username || "deleted user";
  const profilePicture = comment.user?.profilePicture || defaultAvatar;
  const likedByCurrentUser =
    currentUser && comment.likes?.includes(currentUser._id);

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
        <p className="text-gray-500 pb-2">{comment.content}</p>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <button type="button" onClick={() => onLike(comment._id)}>
            <FaThumbsUp
              className={`text-sm ${likedByCurrentUser && "text-blue-500"}`}
            />
          </button>
          <p>
            {comment.numberOfLikes}{" "}
            {comment.numberOfLikes === 1 ? "like" : "likes"}
          </p>
        </div>
      </div>
    </div>
  );
}
