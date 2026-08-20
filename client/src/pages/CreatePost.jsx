import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PostForm from "../components/PostForm.jsx";
import { useToast } from "../contexts/ToastContext.jsx";

export default function CreatePost() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [publishing, setPublishing] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setPublishing(true);
      const response = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        showError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      showError(error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <PostForm
      title="Nova objava"
      subtitle="Napiši vest ili priču za Fon Blog"
      submitLabel="Objavi"
      submitting={publishing}
      onSubmit={handleSubmit}
    />
  );
}
