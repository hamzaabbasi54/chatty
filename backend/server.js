import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import path from 'path';
import {connectDB} from "./config/db.js";

dotenv.config();

connectDB();
const app = express();

app.use(express.json());
app.use(cookieParser());//help in parsing the cookie for jwt token in middleware
app.use(cors());

const __dirname = path.resolve();

app.use('/api/auth', authRoutes);




//making it ready for deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*path}", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
})  