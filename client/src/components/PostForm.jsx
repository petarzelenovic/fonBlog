import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HiOutlinePhotograph } from "react-icons/hi";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import { SHORT_DESCRIPTION_LIMIT } from "../constants";

function isEmptyHtml(html = "") {
  return (
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim().length === 0
  );
}

export default function PostForm({
  title,
  subtitle,
  submitLabel,
  initialData,
  submitError,
  submitting = false,
  onSubmit,
}) {
  const { categories, defaultCategorySlug } = useCategories();
  const filePickerRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    shortDescription: "",
    content: "",
    image: "",
    ...initialData,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectedCategory = formData.category || defaultCategorySlug;
  const coverImage = formData.image || previewUrl;
  const uploading = imageUploadProgress !== null;
  const remainingChars =
    SHORT_DESCRIPTION_LIMIT - (formData.shortDescription?.length || 0);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const chipClass = (isActive) =>
    isActive
      ? "rounded-full border border-fon-navy px-3.5 py-1.5 text-sm font-medium text-fon-navy dark:border-white dark:text-white"
      : "rounded-full px-3.5 py-1.5 text-sm text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white";

  const uploadImage = (selectedFile) => {
    setImageUploadError(null);
    setImageUploadProgress(0);

    const storage = getStorage(app);
    const fileName = new Date().getTime() + selectedFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageUploadError(error.message || "Otpremanje slike nije uspelo");
        setImageUploadProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUploadProgress(null);
          setImageUploadError(null);
          setFormData((prev) => ({ ...prev, image: downloadURL }));
        });
      },
    );
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    uploadImage(selectedFile);
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title?.trim()) {
      setFormError("Unesi naslov objave");
      return;
    }
    if (!formData.image) {
      setFormError("Dodaj naslovnu sliku");
      return;
    }
    if (isEmptyHtml(formData.content)) {
      setFormError("Unesi sadržaj objave");
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      shortDescription: formData.shortDescription?.trim() || "",
      category: formData.category || defaultCategorySlug,
    });
  };

  const errorMessage = formError || submitError;

  return (
    <main className="bg-white dark:bg-fon-dark">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-12 sm:px-6 lg:px-8 lg:pt-10 lg:pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-fon-navy dark:text-white md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-fon-muted dark:text-fon-dark-muted">
            {subtitle}
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="title">Naslov *</Label>
            <TextInput
              id="title"
              placeholder="Naslov objave"
              className="mt-2"
              value={formData.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Kategorija
            </p>
            <div
              className="flex flex-wrap items-center gap-x-2 gap-y-3"
              role="group"
              aria-label="Kategorija"
            >
              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => updateField("category", category.slug)}
                  className={`cursor-pointer ${chipClass(selectedCategory === category.slug)}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">
              Kratak opis{" "}
              <span className="font-normal text-fon-muted dark:text-fon-dark-muted">
                (opciono)
              </span>
            </Label>
            <Textarea
              id="shortDescription"
              placeholder="Kratak opis koji se prikazuje na stranici objave i u pregledu članaka..."
              rows={3}
              maxLength={SHORT_DESCRIPTION_LIMIT}
              className="mt-2"
              value={formData.shortDescription || ""}
              onChange={(e) => updateField("shortDescription", e.target.value)}
            />
            <p className="mt-1 text-xs text-fon-muted dark:text-fon-dark-muted">
              {remainingChars} karaktera preostalo
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
              Naslovna slika *
            </p>
            <input
              ref={filePickerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => filePickerRef.current?.click()}
              disabled={uploading}
              className="group relative block w-full cursor-pointer overflow-hidden rounded-xl border border-dashed border-fon-border bg-fon-bg text-left disabled:cursor-wait dark:border-fon-dark-border dark:bg-fon-dark"
            >
              {coverImage ? (
                <>
                  <img
                    src={coverImage}
                    alt="Naslovna slika"
                    className={`aspect-video w-full object-cover ${
                      uploading ? "opacity-60" : ""
                    }`}
                  />
                  {!uploading && (
                    <span className="absolute inset-0 flex items-center justify-center bg-fon-navy/50 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                      Promeni sliku
                    </span>
                  )}
                </>
              ) : (
                <span className="flex aspect-video w-full flex-col items-center justify-center gap-2 px-4">
                  <HiOutlinePhotograph className="h-10 w-10 text-fon-muted dark:text-fon-dark-muted" />
                  <span className="text-sm font-medium text-fon-navy dark:text-white">
                    Izaberi naslovnu sliku
                  </span>
                  <span className="text-xs text-fon-muted dark:text-fon-dark-muted">
                    JPG, PNG ili WEBP
                  </span>
                </span>
              )}
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="h-20 w-20">
                    <CircularProgressbar
                      value={imageUploadProgress || 0}
                      text={`${imageUploadProgress || 0}%`}
                      styles={{
                        path: { stroke: "#ffffff" },
                        text: {
                          fill: "#ffffff",
                          fontSize: "1.15rem",
                          fontWeight: 600,
                        },
                        trail: { stroke: "rgba(255,255,255,0.35)" },
                      }}
                    />
                  </span>
                </span>
              )}
            </button>
            {imageUploadError && (
              <Alert color="failure" className="mt-3">
                {imageUploadError}
              </Alert>
            )}
          </div>

          <div>
            <Label htmlFor="content">Sadržaj *</Label>
            <div className="post-editor mt-2">
              <ReactQuill
                id="content"
                theme="snow"
                placeholder="Napiši objavu..."
                value={formData.content || ""}
                onChange={(value) => updateField("content", value)}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-fon-border pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-fon-dark-border">
            <Link
              to="/dashboard?tab=posts"
              className="text-center text-sm font-medium text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white"
            >
              Otkaži
            </Link>
            <Button
              type="submit"
              className="cursor-pointer bg-fon-navy text-white hover:bg-fon-navy-hover sm:min-w-44"
              disabled={submitting || uploading}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Čuvanje...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>

          {errorMessage && <Alert color="failure">{errorMessage}</Alert>}
        </form>
      </div>
    </main>
  );
}
