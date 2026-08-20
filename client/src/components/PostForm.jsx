import {
  Button,
  Label,
  Spinner,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { HiOutlinePhotograph } from "react-icons/hi";
import { useCategories } from "../contexts/CategoriesContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { SHORT_DESCRIPTION_LIMIT } from "../constants";
import { uploadImage } from "../utils/uploadImage";

const QUILL_TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  ["link", "image"],
  ["clean"],
];

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
  submitting = false,
  onSubmit,
}) {
  const { categories, defaultCategorySlug } = useCategories();
  const { showError } = useToast();
  const filePickerRef = useRef(null);
  const editorFileInputRef = useRef(null);
  const quillRef = useRef(null);
  const editorSelectionRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [contentUploadProgress, setContentUploadProgress] = useState(null);
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
  const contentUploading = contentUploadProgress !== null;
  const remainingChars =
    SHORT_DESCRIPTION_LIMIT - (formData.shortDescription?.length || 0);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const insertImageAtCursor = (url) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) {
      return;
    }

    const range = editorSelectionRef.current ||
      editor.getSelection(true) || {
        index: Math.max(editor.getLength() - 1, 0),
      };
    editor.insertEmbed(range.index, "image", url, "user");
    editor.setSelection(range.index + 1, 0);
    editorSelectionRef.current = null;
    return editor.root.innerHTML;
  };

  const uploadAndInsertEditorImage = async (file) => {
    if (!file?.type.startsWith("image/") || contentUploadProgress !== null) {
      return;
    }

    setContentUploadProgress(0);
    try {
      const url = await uploadImage(file, setContentUploadProgress);
      const html = insertImageAtCursor(url);
      setFormData((prev) => ({
        ...prev,
        content: html || `${prev.content || ""}<p><img src="${url}"></p>`,
      }));
    } catch (error) {
      showError(error.message || "Otpremanje slike u sadržaj nije uspelo");
    } finally {
      setContentUploadProgress(null);
    }
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: QUILL_TOOLBAR,
        handlers: {
          image: () => {
            const editor = quillRef.current?.getEditor?.();
            editorSelectionRef.current = editor?.getSelection(true);
            editorFileInputRef.current?.click();
          },
        },
      },
    }),
    [],
  );

  const chipClass = (isActive) =>
    isActive
      ? "rounded-full border border-fon-navy px-3.5 py-1.5 text-sm font-medium text-fon-navy dark:border-white dark:text-white"
      : "rounded-full px-3.5 py-1.5 text-sm text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white";

  const uploadCoverImage = async (selectedFile) => {
    setImageUploadProgress(0);
    try {
      const downloadURL = await uploadImage(
        selectedFile,
        setImageUploadProgress,
      );
      setFormData((prev) => ({ ...prev, image: downloadURL }));
    } catch (error) {
      showError(error.message || "Otpremanje slike nije uspelo");
    } finally {
      setImageUploadProgress(null);
    }
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    uploadCoverImage(selectedFile);
    e.target.value = "";
  };

  const handleEditorImageChange = (e) => {
    const selectedFile = e.target.files?.[0];
    e.target.value = "";
    if (!selectedFile) return;
    uploadAndInsertEditorImage(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      showError("Unesi naslov objave");
      return;
    }
    if (!formData.image) {
      showError("Dodaj naslovnu sliku");
      return;
    }
    if (isEmptyHtml(formData.content)) {
      showError("Unesi sadržaj objave");
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      shortDescription: formData.shortDescription?.trim() || "",
      category: formData.category || defaultCategorySlug,
    });
  };

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
          </div>

          <div>
            <Label htmlFor="content">Sadržaj *</Label>
            <input
              ref={editorFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleEditorImageChange}
            />
            <div className="post-editor mt-2">
              <ReactQuill
                ref={quillRef}
                id="content"
                theme="snow"
                placeholder="Napiši objavu..."
                modules={quillModules}
                value={formData.content || ""}
                onChange={(value) => updateField("content", value)}
              />
            </div>
            {contentUploading && (
              <p className="mt-2 text-xs text-fon-muted dark:text-fon-dark-muted">
                Otpremanje slike u sadržaj... {contentUploadProgress}%
              </p>
            )}
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
              disabled={submitting || uploading || contentUploading}
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
        </form>
      </div>
    </main>
  );
}
