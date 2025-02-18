"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
//Environment variables here
dotenv_1.default.config();
//Middleware function to authetnticate user based on JWT
const authenticateUser = (req, res, next) => {
    try {
        //Authorization header
        const authHeader = req.header("Authorization");
        //If no header or no bearer, return 401
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Token not found." });
            return;
        }
        //Get token from header
        const token = authHeader.split(" ")[1];
        //Ensure that the secret for JWT is provided
        if (!process.env.SECRET) {
            res.status(500).json({ message: "Server misconfiguration." });
            return;
        }
        //Verify the token using the secret
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        //Attach user info to `req.user`
        req.user = {
            userId: decoded.userId, // Extract user iD from token
            isAdmin: decoded.isAdmin || false, // Default to false if not provided, //Admin is not used, deprecated....
        };
        // Proceed to next middleware
        next();
    }
    catch (error) {
        console.error(" Token verification failed:", error);
        res.status(401).json({ message: "Invalid token." });
    }
};
exports.authenticateUser = authenticateUser;
