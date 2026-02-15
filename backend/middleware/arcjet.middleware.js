import aj from "../config/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    console.log("🔵 Arcjet middleware hit for:", req.method, req.path);
    try {
        const decision = await aj.protect(req);
        console.log("🟡 Arcjet decision:", decision.conclusion);
        if (decision.isDenied()) {
            console.log("🔴 Arcjet DENIED:", decision.reason);
            if (decision.reason.isRateLimit) {
                return res.status(429).json({ message: "Too many requests. Please try again later." });
            } else if (decision.reason.isBot) {
                return res.status(403).json({ message: "Bot detected" });
            } else {
                return res.status(403).json({ message: "Forbidden" });
            }
        }
        if (isSpoofedBot(decision.bot)) {
            console.log("🔴 Spoofed bot detected");
            return res.status(403).json({ message: "Bot detected" });
        }
        console.log("✅ Arcjet passed, calling next()");
        next();
    } catch (error) {
        console.log("❌ Arcjet error:", error);
        return res.status(500)
            .json({ message: "Internal server error" });
    }
};