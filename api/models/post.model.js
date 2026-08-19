import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
      maxlength: 200,
    },
    image: {
      type: String,
      required: true,
      default:
        "https://www.blogtyrant.com/wp-content/uploads/2017/02/how-to-write-a-good-blog-post.png",
    },
    category: {
      type: String,
      required: true,
      default: "uncategorized",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Post", postSchema);
