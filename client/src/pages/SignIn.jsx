import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";
import AuthLayout from "../components/AuthLayout";
import { useToast } from "../contexts/ToastContext";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const { showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showError("Popuni sva polja");
      return;
    }

    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
      } else {
        showError(data.message);
        dispatch(signInFailure(data.message));
      }
    } catch (error) {
      showError(error.message);
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <AuthLayout title="Dobrodošao nazad">
      <OAuth label="Prijavi se preko Google-a" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">ili</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">Email adresa</Label>
          <TextInput
            type="email"
            placeholder="ime@student.fon.bg.ac.rs"
            id="email"
            className="mt-2"
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="password">Lozinka</Label>
          <TextInput
            type="password"
            placeholder="••••••••"
            id="password"
            className="mt-2"
            onChange={handleChange}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-fon-navy text-white hover:bg-fon-navy-hover"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" color="gray" />
              <span className="pl-3">Učitavanje...</span>
            </>
          ) : (
            "Prijavi se"
          )}
        </Button>
      </form>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Nemaš nalog?{" "}
        <Link
          to="/sign-up"
          className="font-medium text-fon-magenta hover:underline"
        >
          Registruj se
        </Link>
      </p>
    </AuthLayout>
  );
}
