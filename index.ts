import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config;

import userRoutes from "./routes/userRoutes";

const app = express();

mongoose
  .connect(
    "mongodb+srv://jamshidkhuja:j20011703b@cluster0.tuylk.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB conecction successful"));

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("app is running on port 5000"));
