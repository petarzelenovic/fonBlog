import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import AuthLayout from "../components/AuthLayout";
import { USERNAME_PATTERN } from "../constants";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage("Popuni sva polja");
    }
    if (!USERNAME_PATTERN.test(formData.username)) {
      return setErrorMessage(
        "Korisničko ime može sadržati samo slova, brojeve, tačku i donju crtu",
      );
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/sign-in");
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Priča počinje ovde">
      <OAuth label="Registruj se preko Google-a" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">ili</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="username">Korisničko ime</Label>
          <TextInput
            type="text"
            placeholder="petar.zelenovic"
            id="username"
            className="mt-2"
            onChange={handleChange}
          />
        </div>
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
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Kreiranjem naloga postaješ deo Fon Blog zajednice.
        </p>
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
            "Kreiraj nalog"
          )}
        </Button>
        {errorMessage && (
          <Alert color="failure" onDismiss={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}
      </form>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Već imaš nalog?{" "}
        <Link
          to="/sign-in"
          className="font-medium text-fon-magenta hover:underline"
        >
          Prijavi se
        </Link>
      </p>
    </AuthLayout>
  );
}
