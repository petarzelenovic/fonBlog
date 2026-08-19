import { Alert, Button, FileInput, Select, TextInput, Textarea } from "flowbite-react";
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useCategories } from "../contexts/CategoriesContext.jsx";

export default function UpdatePost() {
  const { categories, defaultCategorySlug } = useCategories();
  const { postId } = useParams();
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await response.json();
        if (!response.ok) {
          console.log(data.message);
          setPublishError(data.message);
          return;
        }
        if (response.ok) {
          setPublishError(null);
          setFormData(data.posts[0]);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchPost();
  }, [postId]);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("No file selected");
        return;
      }
      setImageUploadError(null);
      setImageUploadProgress(0);

      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError(error.message);
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        },
      );
    } catch (error) {
      setImageUploadError(error.message);
      setImageUploadProgress(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/post/updatepost/${formData._id}/${currentUser._id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setPublishError(data.message);
        return;
      }
      setPublishError(null);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError(error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-3 min-h-screen">
      <h1 className="my-7 text-center font-semibold text-3xl">Update post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            label="Title"
            id="title"
            placeholder="Title"
            required
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            value={formData.title || ""}
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            value={formData.category || defaultCategorySlug}
          >
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label
            htmlFor="shortDescription"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Short description
          </label>
          <Textarea
            id="shortDescription"
            placeholder="Short summary shown on the post page and in article previews..."
            rows={3}
            maxLength={200}
            onChange={(e) =>
              setFormData({ ...formData, shortDescription: e.target.value })
            }
            value={formData.shortDescription || ""}
          />
          <p className="mt-1 text-xs text-gray-500">
            {200 - (formData.shortDescription?.length || 0)} characters remaining
          </p>
        </div>
        <div className="flex  gap-4 items-center justify-between ">
          <FileInput
            label="Image"
            id="image"
            className="w-auto"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            onClick={handleUploadImage}
            disabled={imageUploadProgress || file === null}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload image"
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt="upload"
            className="w-full h-72 object-cover rounded-lg mb-4"
          />
        )}
        <ReactQuill
          theme="snow"
          placeholder="Write your post here..."
          className="h-72 mb-12"
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
          value={formData.content || ""}
        />
        <Button type="submit" className="w-full">
          Update post
        </Button>
        {publishError && (
          <Alert color="failure" className="mt-5">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
