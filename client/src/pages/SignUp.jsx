import { Button, Label, TextInput } from "flowbite-react";
import React from "react";
import { Link } from "react-router-dom";

export default function SignUp() {
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
          <form>
            <div>
              <Label htmlFor="username">Your username</Label>
              <TextInput
                type="text"
                placeholder="Your username"
                id="username"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="username">Your email</Label>
              <TextInput
                type="email"
                placeholder="pz20233040@student.fon.bg.ac.rs"
                id="email"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="username">Your password</Label>
              <TextInput
                type="password"
                placeholder="Your password"
                id="password"
                className="mt-2"
              />
            </div>
            <Button type="submit" className="w-full mt-5">
              Sign up
            </Button>
          </form>
          <div className="">
            <span className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-blue-500">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
