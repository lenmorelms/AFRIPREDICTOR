import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDatabase from "./config/MongoDb.js";
import { errorHandler, notFound } from "./Middleware/Erros.js";
import userRouter from "./Routes/UserRoutes.js";
import tournamentsRoutes from "./Routes/TournamentsRoutes.js";
import adminRoutes from "./Routes/AdminRoutes.js";

dotenv.config();
connectDatabase();
const app = express();
app.use(cors());
app.use(express.json({ extended: false }));
// app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/images", express.static("images"));

// API
app.use("/api/users", userRouter);
app.use("/api/tournaments", tournamentsRoutes);
app.use("/api/admin/", adminRoutes);

// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, console.log(`server run in port ${PORT}`));