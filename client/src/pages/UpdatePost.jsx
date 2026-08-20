import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { useSelector } from "react-redux";
import PostForm from "../components/PostForm.jsx";

export default function UpdatePost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await response.json();
        if (!response.ok) {
          setLoadError(data.message || "Objava nije pronađena");
          setFormData(null);
          return;
        }
        setFormData(data.posts[0] || null);
        setLoadError(data.posts[0] ? null : "Objava nije pronađena");
      } catch (error) {
        setLoadError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleSubmit = async (updatedData) => {
    try {
      setPublishing(true);
      setPublishError(null);
      const response = await fetch(
        `/api/post/updatepost/${updatedData._id}/${currentUser._id}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedData),
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
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError(error.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (loadError || !formData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-bold text-fon-navy dark:text-white">
          Objava nije pronađena
        </h1>
        <p className="text-fon-muted dark:text-fon-dark-muted">
          {loadError || "Ovaj članak ne postoji ili je uklonjen."}
        </p>
        <Link
          to="/dashboard?tab=posts"
          className="text-fon-magenta hover:underline"
        >
          Nazad na objave
        </Link>
      </div>
    );
  }

  return (
    <PostForm
      title="Izmeni objavu"
      subtitle="Ažuriraj sadržaj i objavi izmene"
      submitLabel="Sačuvaj izmene"
      initialData={formData}
      submitError={publishError}
      submitting={publishing}
      onSubmit={handleSubmit}
    />
  );
}
