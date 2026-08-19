import { Button, FileInput, Select, TextInput } from "flowbite-react";
import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function CreatePost() {
  return (
    <div className="max-w-3xl mx-auto p-3 min-h-screen">
      <h1 className="my-7 text-center font-semibold text-3xl">Create a post</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            label="Title"
            id="title"
            placeholder="Title"
            required
            className="flex-1"
          />
          <Select>
            <option value="uncategorized">Uncategorized</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div className="flex  gap-4 items-center justify-between ">
          <FileInput label="Image" id="image" required />
          <Button type="button">Upload image</Button>
        </div>
        <ReactQuill
          theme="snow"
          placeholder="Write your post here..."
          className="h-72 mb-12"
          required
        />
        <Button type="submit" className="w-full">
          Publish
        </Button>
      </form>
    </div>
  );
}
