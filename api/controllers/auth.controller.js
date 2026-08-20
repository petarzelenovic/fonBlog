import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import { isValidUsername } from "../utils/username.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  const normalizedUsername = username.trim().toLowerCase();

  if (!isValidUsername(normalizedUsername)) {
    return next(
      errorHandler(
        400,
        "Korisničko ime može sadržati samo slova, brojeve, tačku i donju crtu",
      ),
    );
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const user = new User({
    username: normalizedUsername,
    email,
    password: hashedPassword,
  });
  try {
    await user.save();
    const { password: pass, ...rest } = user._doc;
    res.status(201).location(`/api/users/${user._id}`).json(rest);
  } catch (error) {
    if (error.code === 11000) {
      return next(errorHandler(409, "Username or email already exists"));
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(401, "Pogrešni kredencijali"));
    }
    const isPasswordCorrect = bcryptjs.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(errorHandler(401, "Pogrešni kredencijali"));
    }
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
    );

    const { password: pass, ...rest } = user._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  const { username, email, googlePhotoUrl } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
      );
      const { password: pass, ...rest } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const sanitizedUsername =
        username.replace(/[^a-zA-Z0-9._]/g, "").toLowerCase() || "user";

      const newUser = new User({
        username: sanitizedUsername + Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET,
      );
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(201)
        .location(`/api/users/${newUser._id}`)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
