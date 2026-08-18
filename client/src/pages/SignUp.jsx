import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

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
      return setErrorMessage("Please fill in all fields");
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
      // if (!data.success) {
      //   setErrorMessage(data.message);
      // }
      if (res.ok) {
        navigate("/sign-in");
      }
    } catch (error) {
      setErrorMessage(data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <Link to="/" className="font-bold text-4xl">
            <span className="px-2 py-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              Fon
            </span>
            Blog
          </Link>
          <p className="text-sm text-gray-500 mt-5">Create an account</p>
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="username">Your username</Label>
              <TextInput
                type="text"
                placeholder="Your username"
                id="username"
                className="mt-2"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Your email</Label>
              <TextInput
                type="email"
                placeholder="pz20233040@student.fon.bg.ac.rs"
                id="email"
                className="mt-2"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="password">Your password</Label>
              <TextInput
                type="password"
                placeholder="***************"
                id="password"
                className="mt-2"
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full mt-5" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" color="gray" />{" "}
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign up"
              )}
            </Button>
            <OAuth className="w-full mt-5" />
            {errorMessage && (
              <Alert
                className="mt-5"
                color="failure"
                onDismiss={() => setErrorMessage(null)}
              >
                {errorMessage}
              </Alert>
            )}
          </form>
          <div className="">
            <span className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-blue-500">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
