import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { Link } from "react-router-dom";

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);

  const [userPosts, setUserPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `/api/post/getposts?userId=${currentUser._id}`,
        );
        const data = await response.json();
        if (response.ok) {
          setUserPosts(data.posts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchPosts();
    }
  }, [currentUser._id]);

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 w-full">
      {currentUser.isAdmin && userPosts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <TableHead>
              <TableRow>
                <TableHeadCell>Date updated</TableHeadCell>
                <TableHeadCell>Post image</TableHeadCell>
                <TableHeadCell>Post title</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Delete</TableHeadCell>
                <TableHeadCell>
                  <span>Edit</span>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {userPosts.map(
                (post) => (
                  console.log(post),
                  (
                    <TableRow
                      key={post._id}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <TableCell>
                        {new Date(post.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Link to={`/post/${post.slug}`}>
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-10 w-20 object-cover bg-gray-500"
                          />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          className="font-medium text-gray-900 dark:text-white"
                          to={`/post/${post.slug}`}
                        >
                          {post.title}
                        </Link>
                      </TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>
                        <span className="cursor-pointer font-medium text-red-500 hover:underline">
                          Delete
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          className="text-teal-500 hover:underline"
                          to={`/update-post/${post._id}`}
                        >
                          <span>Edit</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                ),
              )}
            </TableBody>
          </Table>
        </>
      ) : (
        <div>
          <h1>No posts found</h1>
        </div>
      )}
    </div>
  );
}
