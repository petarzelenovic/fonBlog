import React from "react";
import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  return (
    <Link
      to={`/post/${post.slug}`}
      className="w-full sm:w-[360px] border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <img
        src={post.image}
        alt={post.title}
        className="h-[200px] w-full object-cover"
      />
      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-2">{post.title}</p>
        <span className="italic text-sm text-gray-500">{post.category}</span>
      </div>
    </Link>
  );
}
