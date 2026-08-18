import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const { loading, error: errorMessage } = useSelector((state) => state.user);

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
      return dispatch(signInFailure("Please fill in all fields"));
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
      // TODO: add success in response object
      // if (!data.success) {
      //   return dispatch(signInFailure(data.message));
      // }
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
      } else {
        dispatch(signInFailure(data.message));
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
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
                "Sign In"
              )}
            </Button>
            {errorMessage && (
              <Alert className="mt-5" color="failure">
                {errorMessage}
              </Alert>
            )}
          </form>
          <div className="">
            <span className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-blue-500">
                Sign Up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
