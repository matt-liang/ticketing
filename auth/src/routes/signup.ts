import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { BadRequestError, validateRequest } from '@mlticketing/common';

const router = express.Router();

router.post(
    '/api/users/signup',
    // Express validation checks ensures req.body has email and password
    // Ensures email is valid and password between 6 and 26 characters
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim().isLength({ min: 6, max: 26 })
            .withMessage('Password must be between 6 and 26 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        // Check if email exists in collection and throw BadRequestError if true
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError('Email in use');
        }

        // Save user to collection
        const user = User.build({ email, password });
        await user.save();

        // Generate jwt
        const userJwt = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_KEY!
        );

        // Store on req session
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    }
);

export { router as signupRouter };