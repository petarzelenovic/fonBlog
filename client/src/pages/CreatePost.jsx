import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PostForm from "../components/PostForm.jsx";

export default function CreatePost() {
  const navigate = useNavigate();
  const [publishError, setPublishError] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setPublishing(true);
      setPublishError(null);
      const response = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        setPublishError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError(error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <PostForm
      title="Nova objava"
      subtitle="Napiši vest ili priču za Fon Blog"
      submitLabel="Objavi"
      submitError={publishError}
      submitting={publishing}
      onSubmit={handleSubmit}
    />
  );
}
