import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { USERNAME_PATTERN } from "../constants";
import { uploadImage } from "../utils/uploadImage";
import { useToast } from "../contexts/ToastContext";
import ConfirmModal from "./ConfirmModal";

export default function DashProfile() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const filePickerRef = useRef(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadProfileImage();
    }
  }, [imageFile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) {
      showError("Nema izmena za čuvanje");
      return;
    }
    if (formData.username && !USERNAME_PATTERN.test(formData.username)) {
      showError(
        "Korisničko ime može sadržati samo slova, brojeve, tačku i donju crtu",
      );
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/users/${currentUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        dispatch(updateFailure(data.message));
        showError(data.message);
        return;
      }
      dispatch(updateSuccess(data));
      showSuccess("Profil je uspešno ažuriran");
    } catch (err) {
      dispatch(updateFailure(err.message));
      showError(err.message);
    }
  };

  const uploadProfileImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadProgress(null);
    try {
      const url = await uploadImage(imageFile, setImageFileUploadProgress);
      setImageFileUrl(url);
      setFormData((prev) => ({ ...prev, profilePicture: url }));
    } catch {
      showError("Otpremanje slike nije uspelo");
      setImageFile(null);
      setImageFileUrl(null);
    } finally {
      setImageFileUploading(false);
      setImageFileUploadProgress(null);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/users/${currentUser._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        dispatch(deleteUserFailure(data.message));
        showError(data.message || "Brisanje naloga nije uspelo");
        return;
      }
      dispatch(deleteUserSuccess());
      navigate("/sign-in");
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
      showError(err.message);
      setShowModal(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log(data.message);
        return;
      }
      dispatch(signOutSuccess());
      navigate("/sign-in");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          id="profilePicture"
          className="hidden"
          onChange={handleImageChange}
          ref={filePickerRef}
        />
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-full"
            onClick={() => filePickerRef.current.click()}
            aria-label="Promeni profilnu sliku"
          >
            {imageFileUploadProgress && (
              <CircularProgressbar
                value={imageFileUploadProgress || 0}
                text={`${imageFileUploadProgress}%`}
                strokeWidth={5}
                styles={{
                  root: {
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                  },
                  path: {
                    stroke: `rgba(0, 74, 124, ${imageFileUploadProgress / 100})`,
                  },
                }}
              />
            )}
            <img
              src={imageFileUrl || currentUser.profilePicture}
              alt="Profilna slika"
              className={`h-full w-full rounded-full border-4 border-fon-border object-cover dark:border-fon-dark-border ${
                imageFileUploading ? "opacity-60" : ""
              }`}
            />
          </button>
          <p className="text-xs text-fon-muted dark:text-fon-dark-muted">
            Klikni na sliku da je promeniš
          </p>
        </div>
        <div>
          <Label htmlFor="username">Korisničko ime</Label>
          <TextInput
            id="username"
            placeholder="korisnicko.ime"
            className="mt-2"
            defaultValue={currentUser.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="email">Email adresa</Label>
          <TextInput
            id="email"
            placeholder="ime@student.fon.bg.ac.rs"
            className="mt-2"
            defaultValue={currentUser.email}
            onChange={handleChange}
            type="email"
          />
        </div>
        <div>
          <Label htmlFor="password">Nova lozinka</Label>
          <TextInput
            id="password"
            placeholder="••••••••"
            className="mt-2"
            type="password"
            onChange={handleChange}
          />
        </div>
        <Button
          type="submit"
          className="w-full cursor-pointer bg-fon-navy text-white hover:bg-fon-navy-hover"
          disabled={imageFileUploading || loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Čuvanje...
            </>
          ) : (
            "Sačuvaj izmene"
          )}
        </Button>
      </form>
      <div className="mt-8 flex justify-between border-t border-fon-border pt-5 text-sm dark:border-fon-dark-border">
        <button
          type="button"
          className="cursor-pointer font-medium text-red-500 hover:underline"
          onClick={() => setShowModal(true)}
        >
          Obriši nalog
        </button>
        <button
          type="button"
          className="cursor-pointer font-medium text-fon-muted hover:text-fon-navy dark:text-fon-dark-muted dark:hover:text-white"
          onClick={handleSignOut}
        >
          Odjavi se
        </button>
      </div>

      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDeleteUser}
        message="Da li si siguran da želiš da obrišeš nalog? Ova radnja se ne može opozvati."
      />
    </div>
  );
}
