import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectRoute = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        // .user is a custom property that we are adding to the request object
        // so that we can access it in the controller
        //so we dont have to query the db to get the user in every controller
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        return res.status(500)
            .json({ message: "Internal server error" })
    }
}