/* Not implemented at all... Haven't used, not necessary. Deprecated

Will be implemented in the future.


import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';


//Regex: https://www.geeksforgeeks.org/javascript-program-to-validate-password-using-regular-expressions/
//Many functions copied from express-validator documentation.


let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;



export const registerValidation = [
    // Email
    body('email')
      .trim()
      .escape()
      .isEmail()
      .withMessage('Invalid email format'),
  
    // Username
    body('username')
      .trim()
      .escape()
      .isLength({ min: 3, max: 25 })
      .withMessage('Username must be between 3 and 25 characters'),
  
    // Password
    body('password')
      .matches(regex)
      .withMessage(
        'Password must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 digit, and 1 special character (#, !, &, ?)'
      ),
  
 
  ];


  export const loginValidation = [
    // Email
    body('email')
      .trim()
      .escape()
      .isEmail()
      .withMessage('Invalid email format'),
  
 
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];

//Validating request
  export const validateRequest: RequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

*/