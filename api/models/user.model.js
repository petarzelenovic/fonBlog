import mongoose from "mongoose";
import { USERNAME_PATTERN } from "../utils/username.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      match: [
        USERNAME_PATTERN,
        "Korisničko ime može sadržati samo slova, brojeve, tačku i donju crtu",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema);
export default User;
