import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export const cookie = (): string[] => {
    // Build a JWT payload. { id, email }
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "test@test.com",
    };

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn session object into JSON
    const sessionJSON = JSON.stringify(session);

    // Encode JSON as base64
    const base64 = Buffer.from(sessionJSON).toString("base64");

    // return a string that is cookie with encoded data
    return [`session=${base64}`];
};