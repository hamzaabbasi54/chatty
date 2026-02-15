import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/jwt.tokken.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import cloudinary from "../config/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400)
                .json({ message: "All fields are required" })
        }
        if (password.length < 6) {
            return res.status(400)
                .json({ message: "Password must be at least 6 characters long" })
        }
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if (!emailRegex.test(email)) {
            return res.status(400)
                .json({ message: "Email is not valid" })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400)
                .json({ message: "User already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ fullName, email, password: hashedPassword })

        if (newUser) {
            generateToken(newUser._id, res)

            // Send welcome email asynchronously (don't block response)
            sendWelcomeEmail(newUser.email, newUser.fullName, process.env.CLIENT_URL)
                .catch(error => console.log("Failed to send welcome email:", error.message));

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
                message: "User created successfully",
            })
        }
        else {
            return res.status(400)
                .json({ message: "invalid user data" })
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500)
            .json({ message: "Internal server error" })
    }
}

export const login = async (req, res) => {
    console.log("🟢 LOGIN CONTROLLER HIT");
    const { email, password } = req.body;
    console.log("📧 Email:", email, "🔐 Password:", password ? "***" : "empty");
    try {
        if (!email || !password) {
            console.log("all fields are required")
            return res.status(400)
                .json({ message: "All fields are required" })
        }
        const user = await User.findOne({ email })
        console.log("🔍 User lookup result:", user ? "User found" : "User NOT found");
        if (!user) {
            console.log("user not found")
            return res.status(400)
                .json({ message: "User not found" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        console.log("🔐 Password valid:", isPasswordValid);
        if (!isPasswordValid) {
            return res.status(400)
                .json({ message: "Invalid password" })
        }
        console.log("✅ About to generate token");
        generateToken(user._id, res)
        console.log("✅ Token generated, sending response");
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture,
            message: "User logged in successfully",
        })
    } catch (error) {
        console.log("❌ Login error:", error)
        return res.status(500)
            .json({ message: "Internal server error" })
    }

}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
        })
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500)
            .json({ message: "Internal server error" })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePicture } = req.body;
        if (!profilePicture) {
            return res.status(400).json({ message: "Profile picture is required" })
        }
        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePicture)

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePicture: uploadResponse.secure_url },
            { new: true }
        )
        res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            message: "Profile picture updated successfully",
        })

    } catch (error) {
        console.log(error.message)
        return res.status(500)
            .json({ message: "Internal server error" })
    }
}
