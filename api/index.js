import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
    .connect(
        "mongodb+srv://petar:petar@fon-blog.xbn8otm.mongodb.net/fon-blog?retryWrites=true&w=majority&appName=fon-blog"
    )
    .then(() => {
        console.log("MongoDB is connected");
    })
    .catch((err) => {
        console.log(err);
    });
const app = express();
app.listen(3000, () => {
    console.log("Server is running!");
});
