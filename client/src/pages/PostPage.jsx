import React from "react";
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Spinner } from "flowbite-react";
import CommentSection from "../components/CommentSection";

export default function PostPage() {
  const { postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.message);
          setLoading(false);
          return;
        }
        setPost(data.posts[0]);
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl"></Spinner>
      </div>
    );
  return (
    <div className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center max-w-2xl mx-auto lg:text-4xl">
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className="text-blue-500 self-center mt-5"
      >
        <Button color="gray" size="xs" pill>
          {post && post.category}
        </Button>
      </Link>
      <img
        src={post && post.image}
        alt={post && post.title}
        className="max-h-150 object-cover rounded-lg mt-10 p-3"
      />
      <div className="flex justify-between p-3 border-slate-300 border-b text-xs mx-auto w-full max-w-2xl">
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span>{post && (post.content.length / 1000).toFixed(0)} mins read</span>
      </div>
      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>

      <CommentSection postId={post._id} />
    </div>
  );
}
