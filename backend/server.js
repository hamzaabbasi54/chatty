import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get('/api/auth/signup', (req, res) => {
    res.send("Signup");
})
app.get('/api/auth/login', (req, res) => {
    res.send("Login");
})
app.get('/api/auth/logout', (req, res) => {
    res.send("Logout");
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})