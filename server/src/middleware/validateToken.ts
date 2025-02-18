import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";


//Environment variables here
dotenv.config();


//This will store information about user
interface CustomRequest extends Request {
  user?: { userId: string; isAdmin?: boolean };
}


//Middleware function to authetnticate user based on JWT
export const authenticateUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
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
    const decoded = jwt.verify(token, process.env.SECRET) as JwtPayload;



    //Attach user info to `req.user`
    req.user = {
      userId: decoded.userId, // Extract user iD from token
      isAdmin: decoded.isAdmin || false, // Default to false if not provided, //Admin is not used, deprecated....
    };

    
    

    // Proceed to next middleware
    next();
  } catch (error) {
    console.error(" Token verification failed:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};