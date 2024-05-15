import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
dotenv.config();

//Konektovanje na bazu
mongoose
    .connect(process.env.MONGO)
    .then(() => {
        console.log("MongoDB is connected");
    })
    .catch((err) => {
        console.log(err);
    });

//pravljenje express apl
const app = express();
app.use(express.json()); //dozvoljavamo da mozemo slati json serveru

//Pokretanje servera
app.listen(3000, () => {
    console.log("Server is running!");
});

//Pravljenje middleware fja za rute
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
