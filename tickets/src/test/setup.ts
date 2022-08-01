import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('../nats-wrapper');

let mongod: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'test';
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    mongod = await MongoMemoryServer.create();
    const mongoUri = await mongod.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongod.stop();
    await mongoose.connection.close();
});