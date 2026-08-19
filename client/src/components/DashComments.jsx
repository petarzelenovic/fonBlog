import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);

  const [comments, setComments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const startIndex = (currentPage - 1) * 9;
        const response = await fetch(
          `/api/comment/getcomments?startIndex=${startIndex}&limit=9`,
        );
        const data = await response.json();
        if (response.ok) {
          setComments(data.comments);
          setTotalPages(Math.ceil(data.totalComments / 9) || 1);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchComments();
    }
  }, [currentUser._id, currentPage]);

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
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentIdToDelete),
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="table-auto md:mx-auto p-3 w-full">
      {currentUser.isAdmin && comments.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <TableHead>
              <TableRow>
                <TableHeadCell>Date updated</TableHeadCell>
                <TableHeadCell>Comment content</TableHeadCell>
                <TableHeadCell>Number of likes</TableHeadCell>
                <TableHeadCell>User image</TableHeadCell>
                <TableHeadCell>Username</TableHeadCell>
                <TableHeadCell>Post title</TableHeadCell>
                <TableHeadCell>Delete</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {comments.map((comment) => (
                <TableRow
                  key={comment._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell>
                    {new Date(comment.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {comment.content}
                  </TableCell>
                  <TableCell>{comment.numberOfLikes}</TableCell>
                  <TableCell>
                    {comment.userId?.profilePicture && (
                      <img
                        src={comment.userId.profilePicture}
                        alt={comment.userId.username}
                        className="h-10 w-10 rounded-full object-cover bg-gray-500"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {comment.userId?.username || "deleted user"}
                  </TableCell>
                  <TableCell>
                    {comment.postId?.slug ? (
                      <Link
                        className="font-medium text-gray-900 dark:text-white"
                        to={`/post/${comment.postId.slug}`}
                      >
                        {comment.postId.title}
                      </Link>
                    ) : (
                      "deleted post"
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className="cursor-pointer font-medium text-red-500 hover:underline"
                      onClick={() => {
                        setShowModal(true);
                        setCommentIdToDelete(comment._id);
                      }}
                    >
                      Delete
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            currentPage={Number(currentPage)}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            showIcons
            className="mt-4"
          />
        </>
      ) : (
        <div>
          <h1>No comments found</h1>
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
              Are you sure you want to delete this comment? This cannot be
              undone.
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteComment}>
                Yes, I&apos;m sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
