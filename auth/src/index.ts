import { app } from './app';

import mongoose from 'mongoose';

const start = async () => {
    // Created using kubernetes secret
    // $ kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    // Ensure mongo URI env variable is defined
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined')
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    }
    catch (err) {
        console.error(err);
    }
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
};

start();
