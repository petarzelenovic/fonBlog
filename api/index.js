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

//Middleware kojim cemo obratiti gresku ako dodje od gore
app.use((err, req, res, next) => {
    //next za prelazak na sledeci middleware
    const statusCode = err.statusCode || 500; //ako ne postavimo statusCode dobijamo gresku
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({ success: false, statusCode, message });
});
