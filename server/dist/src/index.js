"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("./models/User"));
const validateToken_1 = require("./middleware/validateToken");
// Load environment variables.
dotenv_1.default.config();
const router = (0, express_1.Router)();
const saltRounds = 10;
// Registers a new user.
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        // Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Create new user
        const newUser = new User_1.default({
            email,
            password: hashedPassword
        });
        await newUser.save();
        // User is NOT automatically logged in after registration
        // Send success message
        return res.status(201).json({ message: 'User registered successfully.' });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
// Authenticates a user and returns a JWT if successful.
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        // Compare password
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        //Token expires in the 1h
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.SECRET, {
            expiresIn: '1h'
        });
        // Return the token in the response
        return res.status(200).json({
            message: 'Login successful.',
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});
//Used for debugging purposes
router.get('/protected', validateToken_1.authenticateUser, (req, res) => {
    res.status(200).json({ message: 'You have access to the protected route!' });
    return;
});
exports.default = router;
