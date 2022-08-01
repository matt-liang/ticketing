import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@mlticketing/common';
import { User } from '../models/user';
import { Password } from '../utils/password';

const router = express.Router();

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Invalid email'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Supply a password')
    ],
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const validCredentials = await Password.compare(existingUser.password, password);
        if (!validCredentials) {
            throw new BadRequestError('Invalid credentials');
        }

        // Generate a jwt with payload of { id, email }
        const userJwt = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email
            },
            process.env.JWT_KEY!
        );

        // Store on req session
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };