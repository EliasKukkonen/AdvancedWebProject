import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import User from './models/User';

import { authenticateUser } from './middleware/validateToken';


// Load environment variables.
dotenv.config();


const router = Router();

const saltRounds =10;


// Registers a new user.
router.post('/register', async (req: Request, res: Response): Promise<any>  => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    // User is NOT automatically logged in after registration
    // Send success message
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// Authenticates a user and returns a JWT if successful.
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }


    //Token expires in the 1h
    const token = jwt.sign({ userId: user._id }, process.env.SECRET as string, {
        expiresIn: '1h' 
      });

      // Return the token in the response
      return res.status(200).json({
        message: 'Login successful.',
        token
      });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});


//Used for debugging purposes
router.get('/protected', authenticateUser, (req: Request, res: Response) => {
    res.status(200).json({ message: 'You have access to the protected route!' });
    return;
  });

export default router;